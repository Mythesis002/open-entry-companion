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
    
    console.log('Generating 5s video from image using fal.ai LTX-2-19B');
    console.log('Image URL:', imageUrl?.substring(0, 100));
    console.log('Prompt:', prompt?.substring(0, 100));

    if (!imageUrl) {
      throw new Error('imageUrl is required');
    }

    const FAL_KEY = Deno.env.get('FAL_KEY');
    if (!FAL_KEY) {
      throw new Error('FAL_KEY is not configured');
    }

    const modelId = 'fal-ai/ltx-2-19b/image-to-video';

    // Submit to fal.ai queue with explicit 5-second duration (121 frames at 24fps ≈ 5s)
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
    console.log('fal.ai submit response keys:', Object.keys(submitData));

    // Check if result came back directly (synchronous response)
    if (submitData?.video?.url) {
      console.log('Got synchronous video result');
      return new Response(
        JSON.stringify({ videoUrl: submitData.video.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestId = submitData.request_id;
    if (!requestId) {
      console.error('Full submit response:', JSON.stringify(submitData));
      throw new Error('No request_id in fal.ai response');
    }

    console.log('Got request_id:', requestId, '— polling for completion...');

    // Poll for completion (max 4 minutes for 5s video)
    const maxAttempts = 120;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

      try {
        const statusResponse = await fetch(
          `https://queue.fal.run/${modelId}/requests/${requestId}/status`,
          {
            method: 'GET',
            headers: { 'Authorization': `Key ${FAL_KEY}` }
          }
        );

        if (!statusResponse.ok) {
          const errText = await statusResponse.text();
          console.error(`Poll error ${statusResponse.status}: ${errText}`);
          continue;
        }

        const statusData = await statusResponse.json();
        console.log(`Attempt ${attempts} status:`, statusData.status);

        if (statusData.status === 'COMPLETED') {
          // Fetch the result
          const resultResponse = await fetch(
            `https://queue.fal.run/${modelId}/requests/${requestId}`,
            {
              method: 'GET',
              headers: { 'Authorization': `Key ${FAL_KEY}` }
            }
          );

          if (!resultResponse.ok) {
            const errText = await resultResponse.text();
            throw new Error(`Failed to fetch result: ${errText}`);
          }

          const resultData = await resultResponse.json();
          console.log('fal.ai result keys:', Object.keys(resultData));

          const videoUrl = resultData?.video?.url;
          if (!videoUrl) {
            console.error('Result structure:', JSON.stringify(resultData).substring(0, 500));
            throw new Error('No video URL in fal.ai result');
          }

          console.log('Video generated successfully:', videoUrl.substring(0, 80));
          return new Response(
            JSON.stringify({ videoUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (statusData.status === 'FAILED') {
          throw new Error('fal.ai generation failed: ' + (statusData.error || JSON.stringify(statusData)));
        }
      } catch (pollError) {
        if (attempts >= maxAttempts - 5) {
          throw pollError;
        }
        console.error(`Polling error attempt ${attempts}:`, pollError);
      }
    }

    throw new Error('Video generation timeout after 4 minutes');

  } catch (error: unknown) {
    console.error('Error generating video:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate video';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
