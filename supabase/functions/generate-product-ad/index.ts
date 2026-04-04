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

    console.log(`Generating ${format} product ad (${width}x${height}) using fal.ai nano-banana-2...`);

    const adPrompt = `Create a stunning, high-end product advertisement poster. The product from the reference image should be the HERO — placed prominently in the center with a dramatic, larger-than-life presence.

BACKGROUND & ENVIRONMENT:
- Design a rich, immersive GRAPHICAL WORLD around the product — NOT a plain studio background
- Use a bold, saturated solid color gradient background (vivid blue, golden yellow, deep red, or emerald green) that complements the product
- Surround the product with thematic illustrated elements that tell a story about the product's category:
  - For food/drinks: floating ingredients, splashes, fruits, vegetables, steam, droplets, leaves
  - For beauty/cosmetics: flower petals, sparkles, water ripples, silk ribbons
  - For tech: geometric shapes, light trails, circuit patterns, holographic elements
  - For fashion: fabric textures, abstract patterns, lifestyle elements
- Add whimsical, playful decorative elements: clouds, butterflies, sparkle bursts, sun rays, small flowers, or abstract shapes scattered around

COMPOSITION:
- Product occupies 40-60% of the frame, positioned using Rule of Thirds
- Create depth with foreground elements (close-up ingredients or decorations) and background elements
- Add a subtle glow, halo, or radiance effect behind the product to make it pop
- Include complementary items or accessories near the base of the product for context

STYLE:
- Professional advertising photography meets illustrated fantasy world
- Colors should be rich, saturated, and harmonious — think Frito-Lay, Coca-Cola, or luxury brand campaigns
- Lighting should be dramatic with rim lighting on the product edges
- The overall feel should be premium, joyful, and appetizing/desirable

DO NOT include any text, brand names, logos, pricing, or watermarks. Focus purely on the visual composition.`;

    const falResponse = await fetch('https://fal.run/fal-ai/nano-banana-2', {
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
      throw new Error(`fal.ai error: ${falResponse.status} - ${errorText}`);
    }

    const data = await falResponse.json();
    console.log('fal.ai response keys:', Object.keys(data));
    
    // nano-banana-2 returns { images: [{ url, ... }] }
    const generatedImageUrl = data.images?.[0]?.url;
    if (!generatedImageUrl) {
      console.error('No image in response:', JSON.stringify(data).substring(0, 500));
      throw new Error('No image generated');
    }

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
