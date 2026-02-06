import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, prompt } = await req.json();
    
    console.log('Generating video from image using Veo 3');
    console.log('Image URL:', imageUrl);
    console.log('Prompt:', prompt?.substring(0, 100) + '...');

    const VEO_API_KEY = Deno.env.get('VEO_API_KEY');
    if (!VEO_API_KEY) {
      throw new Error('VEO_API_KEY is not configured');
    }

    // Step 1: Create video generation task with Veo 3
    const createResponse = await fetch('https://api.aimlapi.com/v2/generate/video/google/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VEO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'veo-3',
        prompt: prompt,
        image_url: imageUrl,
        aspect_ratio: '9:16',
        duration: 5
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Veo 3 create error:', createResponse.status, errorText);
      
      // Try alternative endpoint format
      const altResponse = await fetch('https://api.aimlapi.com/v2/video/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VEO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/veo-3.0-i2v',
          prompt: prompt,
          image_url: imageUrl,
          aspect_ratio: '9:16',
          duration: 5
        })
      });

      if (!altResponse.ok) {
        const altError = await altResponse.text();
        console.error('Alternative endpoint error:', altResponse.status, altError);
        throw new Error(`Video generation failed: ${altError}`);
      }

      const altData = await altResponse.json();
      console.log('Alternative endpoint response:', JSON.stringify(altData));
      
      // Handle async generation with polling
      const generationId = altData.id || altData.generation_id;
      if (generationId) {
        return await pollForCompletion(generationId, VEO_API_KEY);
      }
      
      // Direct video URL returned
      if (altData.video_url || altData.output?.video_url) {
        return new Response(
          JSON.stringify({ videoUrl: altData.video_url || altData.output?.video_url }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('Unexpected response format from video API');
    }

    const createData = await createResponse.json();
    console.log('Veo 3 create response:', JSON.stringify(createData));

    // Get generation ID for polling
    const generationId = createData.id || createData.generation_id || createData.task_id;
    
    if (!generationId) {
      // Direct video URL returned (some APIs return immediately)
      if (createData.video_url || createData.output?.video_url || createData.url) {
        return new Response(
          JSON.stringify({ videoUrl: createData.video_url || createData.output?.video_url || createData.url }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('No generation ID or video URL in response');
    }

    // Step 2: Poll for completion
    return await pollForCompletion(generationId, VEO_API_KEY);

  } catch (error: unknown) {
    console.error('Error generating video:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate video';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function pollForCompletion(generationId: string, apiKey: string): Promise<Response> {
  const maxAttempts = 120; // 4 minutes max (2 second intervals)
  let attempts = 0;

  console.log(`Polling for video generation: ${generationId}`);

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;

    try {
      // Try multiple status endpoint formats
      const statusUrls = [
        `https://api.aimlapi.com/v2/generate/video/google/generation/${generationId}`,
        `https://api.aimlapi.com/v2/video/generations/${generationId}`,
        `https://api.aimlapi.com/v2/generations/${generationId}`
      ];

      for (const statusUrl of statusUrls) {
        const statusResponse = await fetch(statusUrl, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!statusResponse.ok) continue;

        const statusData = await statusResponse.json();
        console.log(`Attempt ${attempts} status:`, statusData.status || statusData.state);

        const status = statusData.status || statusData.state;

        // Check for completion
        if (status === 'completed' || status === 'succeeded' || status === 'success') {
          const videoUrl = statusData.video_url || statusData.output?.video_url || 
                          statusData.result?.video_url || statusData.url ||
                          statusData.output?.url || statusData.result?.url;
          
          if (videoUrl) {
            console.log('Video generation complete:', videoUrl);
            return new Response(
              JSON.stringify({ videoUrl }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        // Check for failure
        if (status === 'failed' || status === 'error') {
          throw new Error(statusData.error || statusData.message || 'Video generation failed');
        }

        // Still processing, continue polling
        if (status === 'processing' || status === 'pending' || status === 'queued' || status === 'in_progress') {
          break; // Found the right endpoint, continue waiting
        }
      }
    } catch (pollError) {
      console.error(`Polling error attempt ${attempts}:`, pollError);
      if (attempts >= maxAttempts - 5) {
        throw pollError;
      }
    }
  }

  throw new Error('Video generation timeout - please try again');
}
