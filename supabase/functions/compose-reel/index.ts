import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user for compose:', userId);

    const { videoUrls, templateId, renderId } = await req.json();

    const CREATOMATE_API_KEY = Deno.env.get('CREATOMATE_API_KEY');
    if (!CREATOMATE_API_KEY) {
      throw new Error('CREATOMATE_API_KEY is not configured');
    }

    // MODE 1: Check render status (polling from frontend)
    if (renderId) {
      const statusResponse = await fetch(`https://api.creatomate.com/v2/renders/${renderId}`, {
        headers: { 'Authorization': `Bearer ${CREATOMATE_API_KEY}` }
      });

      if (!statusResponse.ok) {
        const errText = await statusResponse.text();
        throw new Error(`Status check failed: ${statusResponse.status} - ${errText}`);
      }

      const statusData = await statusResponse.json();
      console.log(`Render ${renderId} status: ${statusData.status}`);

      if (statusData.status === 'succeeded') {
        return new Response(
          JSON.stringify({ status: 'complete', videoUrl: statusData.url }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (statusData.status === 'failed') {
        return new Response(
          JSON.stringify({ status: 'failed', error: statusData.error_message || 'Render failed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ status: 'rendering' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // MODE 2: Submit new render
    if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
      throw new Error('No video URLs provided');
    }

    for (let i = 0; i < videoUrls.length; i++) {
      const url = videoUrls[i];
      if (!url || typeof url !== 'string') throw new Error(`Invalid video URL at index ${i}`);
      if (url.startsWith('data:image')) throw new Error(`URL at index ${i} is an image data URI, not a video URL.`);
      if (!url.startsWith('http')) throw new Error(`URL at index ${i} is not a valid HTTP URL`);
    }

    const modifications: Record<string, string> = {};
    videoUrls.forEach((url: string, index: number) => {
      modifications[`video_${index + 1}.source`] = url;
    });

    console.log('Submitting to Creatomate:', JSON.stringify(modifications));

    const response = await fetch('https://api.creatomate.com/v2/renders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CREATOMATE_API_KEY}`
      },
      body: JSON.stringify({ template_id: templateId, modifications })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Creatomate error: ${response.status} - ${errorText}`);
    }

    const renderData = await response.json();
    const render = Array.isArray(renderData) ? renderData[0] : renderData;

    if (!render || !render.id) {
      throw new Error('Invalid Creatomate response - no render ID');
    }

    if (render.status === 'succeeded' && render.url) {
      return new Response(
        JSON.stringify({ status: 'complete', videoUrl: render.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: 'rendering', renderId: render.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error composing reel:', error);
    const message = error instanceof Error ? error.message : 'Failed to compose reel';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
