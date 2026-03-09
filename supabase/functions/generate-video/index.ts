import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Valid template prices (server-side source of truth)
const VALID_TEMPLATE_PRICES: Record<string, number> = {
  'car-sinking': 1,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Use anon key client for auth verification
    const anonClient = createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user for video gen:', userId);

    const { imageUrl, prompt, transactionId } = await req.json();
    
    if (!imageUrl) {
      throw new Error('imageUrl is required');
    }

    if (!transactionId) {
      throw new Error('transactionId is required - payment must be completed first');
    }

    // SERVER-SIDE PAYMENT VERIFICATION: Check that this user has a completed transaction
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: transaction, error: txnError } = await serviceClient
      .from('ad_transactions')
      .select('id, status, user_id')
      .eq('id', transactionId)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .maybeSingle();

    if (txnError || !transaction) {
      console.error('Payment verification failed:', txnError?.message || 'No completed transaction found');
      return new Response(
        JSON.stringify({ error: 'Payment not verified. Please complete payment first.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment verified for transaction:', transactionId);

    const FAL_KEY = Deno.env.get('FAL_KEY');
    if (!FAL_KEY) {
      throw new Error('FAL_KEY is not configured');
    }

    const modelId = 'fal-ai/ltx-2.3/image-to-video/fast';

    console.log('Submitting image-to-video job to fal.ai (LTX 2.3 fast)');

    const submitResponse = await fetch(`https://queue.fal.run/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt || 'Smooth cinematic motion, slow camera movement',
        image_url: imageUrl,
        duration: 6,
        resolution: '1080p',
        aspect_ratio: '9:16',
        fps: 25,
        generate_audio: false
      })
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error('fal.ai submit error:', submitResponse.status, errorText);
      throw new Error(`fal.ai submit failed: ${submitResponse.status} - ${errorText}`);
    }

    const submitData = await submitResponse.json();
    console.log('fal.ai submit response:', JSON.stringify(submitData));

    // Check if result came back directly
    if (submitData?.video?.url) {
      return new Response(
        JSON.stringify({ videoUrl: submitData.video.url, status: 'complete' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestId = submitData.request_id;
    if (!requestId) {
      throw new Error('No request_id in fal.ai response');
    }

    console.log('Job submitted, request_id:', requestId);

    return new Response(
      JSON.stringify({
        requestId,
        statusUrl: submitData.status_url,
        responseUrl: submitData.response_url,
        status: 'processing'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error submitting video job:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit video job';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
