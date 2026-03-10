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

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
    console.log('Authenticated user:', userId);

    const { prompt, referenceImages } = await req.json();
    
    console.log('Generating image with prompt:', prompt.substring(0, 100) + '...');
    console.log('Reference images count:', referenceImages?.length || 0);

    const FAL_KEY = Deno.env.get('FAL_KEY');
    if (!FAL_KEY) {
      throw new Error('FAL_KEY is not configured');
    }

    if (!referenceImages || referenceImages.length === 0) {
      throw new Error('At least one reference image is required for seedream edit');
    }

    // Upload base64 images to Supabase storage to get public URLs for fal.ai
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const imageUrls: string[] = [];

    for (let i = 0; i < referenceImages.length; i++) {
      const imgData = referenceImages[i];
      
      // If already a URL (not base64), use directly
      if (imgData.startsWith('http://') || imgData.startsWith('https://')) {
        imageUrls.push(imgData);
        continue;
      }

      // Extract base64 data and mime type
      const matches = imgData.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        console.error('Invalid image data format for image', i);
        throw new Error('Invalid image data format');
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const ext = mimeType.includes('png') ? 'png' : 'jpg';
      const fileName = `temp-refs/${userId}/${Date.now()}-${i}.${ext}`;

      // Decode base64 to Uint8Array
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }

      const { error: uploadError } = await serviceClient.storage
        .from('generated-images')
        .upload(fileName, bytes, { contentType: mimeType, upsert: true });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Failed to upload reference image');
      }

      const { data: urlData } = serviceClient.storage
        .from('generated-images')
        .getPublicUrl(fileName);

      imageUrls.push(urlData.publicUrl);
      console.log(`Uploaded reference image ${i} to storage`);
    }

    console.log('Submitting to fal.ai seedream v4 edit with', imageUrls.length, 'images');

    // Call fal.ai seedream v4 edit (synchronous endpoint)
    const falResponse = await fetch('https://fal.run/fal-ai/bytedance/seedream/v4/edit', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_urls: imageUrls,
        image_size: { width: 1080, height: 1920 },
        seed: Math.floor(Math.random() * 2147483647),
      }),
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.error('fal.ai seedream error:', falResponse.status, errorText);

      if (falResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`fal.ai error: ${falResponse.status} - ${errorText}`);
    }

    const data = await falResponse.json();
    console.log('fal.ai response received:', JSON.stringify(data).substring(0, 300));

    // seedream returns { images: [{ url, content_type, width, height }] }
    const generatedImageUrl = data.images?.[0]?.url;

    if (!generatedImageUrl) {
      console.error('No image in fal.ai response:', JSON.stringify(data).substring(0, 500));
      throw new Error('No image generated by seedream model');
    }

    // Clean up temp reference images from storage (fire and forget)
    for (const url of imageUrls) {
      if (url.includes('temp-refs/')) {
        const path = url.split('/generated-images/')[1];
        if (path) {
          serviceClient.storage.from('generated-images').remove([path]).catch(() => {});
        }
      }
    }

    return new Response(
      JSON.stringify({ imageUrl: generatedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error generating image:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate image';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
