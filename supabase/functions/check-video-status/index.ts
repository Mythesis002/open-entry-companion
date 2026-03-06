import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, statusUrl, responseUrl } = await req.json();

    if (!requestId || !statusUrl || !responseUrl) {
      throw new Error('requestId, statusUrl, and responseUrl are required');
    }

    const FAL_KEY = Deno.env.get('FAL_KEY');
    if (!FAL_KEY) {
      throw new Error('FAL_KEY is not configured');
    }

    // Use the exact status URL provided by fal.ai
    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers: { 'Authorization': `Key ${FAL_KEY}` }
    });

    if (!statusResponse.ok) {
      const errText = await statusResponse.text();
      console.error(`Status check error ${statusResponse.status}: ${errText}`);

      if (statusResponse.status === 404) {
        return new Response(
          JSON.stringify({ status: 'failed', error: 'Request not found or expired' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Status check failed: ${statusResponse.status} - ${errText}`);
    }

    const statusData = await statusResponse.json();
    console.log('Status for', requestId, ':', statusData.status);

    if (statusData.status === 'COMPLETED') {
      // Fetch the actual result using the response URL
      const resultResponse = await fetch(responseUrl, {
        method: 'GET',
        headers: { 'Authorization': `Key ${FAL_KEY}` }
      });

      if (!resultResponse.ok) {
        const errText = await resultResponse.text();
        throw new Error(`Failed to fetch result: ${errText}`);
      }

      const resultData = await resultResponse.json();
      const videoUrl = resultData?.video?.url;

      if (!videoUrl) {
        console.error('Result structure:', JSON.stringify(resultData).substring(0, 500));
        throw new Error('No video URL in result');
      }

      console.log('Video ready:', videoUrl.substring(0, 80));
      return new Response(
        JSON.stringify({ status: 'complete', videoUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (statusData.status === 'FAILED') {
      return new Response(
        JSON.stringify({ status: 'failed', error: statusData.error || 'Generation failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Still processing
    return new Response(
      JSON.stringify({ status: 'processing', queuePosition: statusData.queue_position }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error checking video status:', error);
    const message = error instanceof Error ? error.message : 'Failed to check status';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
