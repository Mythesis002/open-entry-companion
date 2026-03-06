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
    const { videoUrls, templateId } = await req.json();
    
    console.log('Composing reel with Creatomate');
    console.log('Template ID:', templateId);
    console.log('Video URLs:', JSON.stringify(videoUrls));

    if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
      throw new Error('No video URLs provided');
    }

    // Validate that all URLs look like actual video URLs (not base64 images)
    for (let i = 0; i < videoUrls.length; i++) {
      const url = videoUrls[i];
      if (!url || typeof url !== 'string') {
        throw new Error(`Invalid video URL at index ${i}`);
      }
      if (url.startsWith('data:image')) {
        throw new Error(`URL at index ${i} is an image data URI, not a video URL. Video generation may have failed.`);
      }
      if (!url.startsWith('http')) {
        throw new Error(`URL at index ${i} is not a valid HTTP URL: ${url.substring(0, 50)}`);
      }
    }

    const CREATOMATE_API_KEY = Deno.env.get('CREATOMATE_API_KEY');
    if (!CREATOMATE_API_KEY) {
      throw new Error('CREATOMATE_API_KEY is not configured');
    }

    // Build modifications object - map each video to its slot
    const modifications: Record<string, string> = {};
    videoUrls.forEach((url: string, index: number) => {
      modifications[`video_${index + 1}.source`] = url;
    });

    console.log('Sending to Creatomate with modifications:', JSON.stringify(modifications));

    // Call Creatomate API to start render
    const response = await fetch('https://api.creatomate.com/v2/renders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CREATOMATE_API_KEY}`
      },
      body: JSON.stringify({
        template_id: templateId,
        modifications
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Creatomate error:', response.status, errorText);
      throw new Error(`Creatomate error: ${response.status} - ${errorText}`);
    }

    const renderData = await response.json();
    console.log('Creatomate response:', JSON.stringify(renderData));

    // Creatomate returns an array of renders
    const render = Array.isArray(renderData) ? renderData[0] : renderData;
    
    if (!render || !render.id) {
      throw new Error('Invalid Creatomate response - no render ID');
    }

    console.log('Render started with ID:', render.id);

    // If render already completed (unlikely but possible)
    if (render.status === 'succeeded' && render.url) {
      return new Response(
        JSON.stringify({ videoUrl: render.url, status: 'complete' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Poll for completion (max 3 minutes)
    let attempts = 0;
    const maxAttempts = 90;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.creatomate.com/v2/renders/${render.id}`, {
        headers: {
          'Authorization': `Bearer ${CREATOMATE_API_KEY}`
        }
      });

      if (!statusResponse.ok) {
        const errText = await statusResponse.text();
        console.error(`Poll error ${statusResponse.status}: ${errText}`);
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`Poll attempt ${attempts + 1}: status=${statusData.status}`);

      if (statusData.status === 'succeeded') {
        console.log('Render complete! URL:', statusData.url);
        return new Response(
          JSON.stringify({ 
            videoUrl: statusData.url,
            status: 'complete'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (statusData.status === 'failed') {
        console.error('Render failed:', statusData.error_message);
        throw new Error('Creatomate render failed: ' + (statusData.error_message || 'Unknown error'));
      }

      attempts++;
    }

    throw new Error('Render timeout after 3 minutes - please try again');

  } catch (error: unknown) {
    console.error('Error composing reel:', error);
    const message = error instanceof Error ? error.message : 'Failed to compose reel';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
