import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function errResponse(msg: string, status = 500) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return errResponse('Unauthorized', 401);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const anonClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) return errResponse('Unauthorized', 401);
    const userId = claimsData.claims.sub;

    const { productImage, width = 1080, height = 1080, format = 'square' } = await req.json();
    if (!productImage) return errResponse('Product image is required', 400);

    const FAL_KEY = Deno.env.get('FAL_KEY');
    if (!FAL_KEY) throw new Error('FAL_KEY is not configured');

    const serviceClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Upload base64 product image to storage to get a public URL for fal.ai
    let productImageUrl = productImage;
    if (productImage.startsWith('data:')) {
      const matches = productImage.match(/^data:(.+);base64,(.+)$/);
      if (!matches) throw new Error('Invalid image data format');
      const mimeType = matches[1];
      const ext = mimeType.includes('png') ? 'png' : 'jpg';
      const fileName = `product-ads/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const bytes = Uint8Array.from(atob(matches[2]), c => c.charCodeAt(0));
      const { error } = await serviceClient.storage.from('generated-images').upload(fileName, bytes, { contentType: mimeType, upsert: true });
      if (error) throw new Error('Failed to upload product image');
      productImageUrl = serviceClient.storage.from('generated-images').getPublicUrl(fileName).data.publicUrl;
    }

    console.log(`Generating ${format} product ad (${width}x${height}) using fal.ai seedream...`);

    const adPrompt = `Professional product advertisement image. Place this product as the hero element on a stunning graphical background with bold geometric shapes, vibrant gradients, and abstract patterns. The background should be colorful and eye-catching with complementary colors. Add large bold marketing text like "PREMIUM QUALITY" or "NEW ARRIVAL" and a call-to-action button saying "SHOP NOW". Clean modern graphic design style, no brand names, no logos, no pricing. The product should be prominent and sharp against the dynamic background. Professional social media ad layout.`;

    const falResponse = await fetch('https://fal.run/fal-ai/bytedance/seedream/v4/edit', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: adPrompt,
        image_urls: [productImageUrl],
        image_size: { width, height },
        seed: Math.floor(Math.random() * 2147483647),
      }),
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.error('fal.ai error:', falResponse.status, errorText);
      if (falResponse.status === 429) return errResponse('Rate limit exceeded, please try again later.', 429);
      throw new Error(`fal.ai error: ${falResponse.status}`);
    }

    const data = await falResponse.json();
    const generatedImageUrl = data.images?.[0]?.url;
    if (!generatedImageUrl) throw new Error('No image generated');

    // Cleanup temp product upload
    if (productImageUrl.includes('product-ads/')) {
      const path = productImageUrl.split('/generated-images/')[1];
      if (path) serviceClient.storage.from('generated-images').remove([path]).catch(() => {});
    }

    const adPlan = {
      productName: 'Product Ad',
      productCategory: '',
      headline: '',
      subheadline: '',
      ctaText: '',
      suggestedBackground: '',
      suggestedLighting: '',
      suggestedMood: '',
      designStyle: 'Graphical',
      colors: [],
      adPrompt: '',
    };

    return new Response(
      JSON.stringify({ adPlan, generatedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Product ad generation error:', error);
    return errResponse(error instanceof Error ? error.message : 'Failed to generate product ad');
  }
});
