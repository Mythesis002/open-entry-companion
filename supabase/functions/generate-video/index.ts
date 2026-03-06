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
    const { imageUrl, prompt } = await req.json();
    
    console.log('Submitting image-to-video job to fal.ai');
    console.log('Image URL:', imageUrl?.substring(0, 100));

    if (!imageUrl) {
      throw new Error('imageUrl is required');
    }

    const FAL_KEY = Deno.env.get('FAL_KEY');
    if (!FAL_KEY) {
      throw new Error('FAL_KEY is not configured');
    }

    const modelId = 'fal-ai/ltx-2-19b/image-to-video';

    const submitResponse = await fetch(`https://queue.fal.run/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt || 'Smooth cinematic motion, slow camera movement',
        image_url: imageUrl,
        num_frames: 121,
        frame_rate: 24,
        width: 512,
        height: 768
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
    console.log('status_url:', submitData.status_url);
    console.log('response_url:', submitData.response_url);

    // Return request_id AND the actual URLs from fal.ai
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
