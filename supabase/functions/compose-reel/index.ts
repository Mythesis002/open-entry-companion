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
    const { videoUrls, templateId } = await req.json();
    
    console.log('Composing reel with Creatomate');
    console.log('Template ID:', templateId);
    console.log('Video URLs count:', videoUrls?.length);

    const CREATOMATE_API_KEY = Deno.env.get('CREATOMATE_API_KEY');
    if (!CREATOMATE_API_KEY) {
      throw new Error('CREATOMATE_API_KEY is not configured');
    }

    // Build modifications object
    const modifications: Record<string, string> = {};
    videoUrls.forEach((url: string, index: number) => {
      modifications[`video_${index + 1}.source`] = url;
    });

    console.log('Sending to Creatomate:', JSON.stringify({ templateId, modifications }));

    // Call Creatomate API
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
      throw new Error('Invalid Creatomate response');
    }

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.creatomate.com/v2/renders/${render.id}`, {
        headers: {
          'Authorization': `Bearer ${CREATOMATE_API_KEY}`
        }
      });

      if (!statusResponse.ok) {
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      console.log('Render status:', statusData.status);

      if (statusData.status === 'succeeded') {
        return new Response(
          JSON.stringify({ 
            videoUrl: statusData.url,
            status: 'complete'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (statusData.status === 'failed') {
        throw new Error('Creatomate render failed: ' + (statusData.error_message || 'Unknown error'));
      }

      attempts++;
    }

    throw new Error('Render timeout - please try again');

  } catch (error: unknown) {
    console.error('Error composing reel:', error);
    const message = error instanceof Error ? error.message : 'Failed to compose reel';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
