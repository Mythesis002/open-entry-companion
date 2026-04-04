import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function errResponse(msg: string, status = 500) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function uploadBase64(serviceClient: any, base64: string, folder: string): Promise<string> {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid image data format');
  const mimeType = matches[1];
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = Uint8Array.from(atob(matches[2]), c => c.charCodeAt(0));
  const { error } = await serviceClient.storage.from('generated-images').upload(fileName, bytes, { contentType: mimeType, upsert: true });
  if (error) throw new Error('Failed to upload image');
  return serviceClient.storage.from('generated-images').getPublicUrl(fileName).data.publicUrl;
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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const serviceClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const productImageUrl = productImage.startsWith('data:')
      ? await uploadBase64(serviceClient, productImage, `product-ads/${userId}`)
      : productImage;

    console.log(`Generating ${format} product ad (${width}x${height}) using Nano Banana 2...`);

    const adPrompt = `You are a world-class advertising art director. Study the product in the provided image VERY CAREFULLY — its exact shape, colors, packaging, label, and every detail.

YOUR TASK: Create a professional ${width}x${height} pixel product advertisement image.

## ABSOLUTE RULES — NEVER BREAK THESE:
1. The product must look IDENTICAL to the original — same shape, same colors, same packaging, same label. Do NOT redesign, reshape, or alter the product in ANY way. Treat the product as a sacred photograph — copy it pixel-perfectly.
2. Do NOT invent any brand name, company name, or logo. Do NOT write any specific brand text on the product.
3. Do NOT add any price, dollar sign, or discount percentage.

## BACKGROUND & ENVIRONMENT (the creative part):
Create a visually STUNNING, rich graphical environment around the product:
- Use a bold, vibrant solid-to-gradient color background that complements the product's colors
- Surround the product with THEMATIC DECORATIVE ELEMENTS related to the product category:
  • Food/Snacks: floating chips, splashing ingredients, fresh vegetables, herbs, steam wisps, sauce drips
  • Beverages: water splashes, ice cubes, condensation droplets, fruit slices, bubbles
  • Beauty: flower petals, sparkle particles, silk ribbon swirls, water ripples
  • Tech: light rays, geometric shapes, holographic accents, circuit-like patterns
  • Fashion: fabric swirls, abstract brush strokes, lifestyle textures
- Add whimsical touches: sparkle bursts, bokeh dots, floating particles, subtle cloud wisps, or sun ray beams
- Create DEPTH with foreground and background elements — some elements in front of/below the product, some behind

## PRODUCT PLACEMENT:
- Product is the HERO — centered and occupying 35-50% of the frame
- Add dramatic rim lighting / edge glow around the product to make it POP against the background
- Slight upward camera angle to make the product look powerful and premium
- Add a subtle reflection or shadow beneath the product for grounding

## TYPOGRAPHY (MUST be included and PERFECTLY legible):
- HEADLINE (top area): A short, punchy 2-4 word benefit tagline in LARGE, BOLD sans-serif font. Examples: "PURE CRUNCH", "REFRESH YOUR DAY", "TASTE PERFECTION", "GLOW NATURALLY". Choose words that match the product category.
- SUBTEXT (below headline): One supporting line of 4-7 words in smaller font. Example: "Made with the finest ingredients"
- CTA BUTTON (bottom area): A clearly styled button/badge with text like "SHOP NOW", "ORDER TODAY", or "TRY IT NOW" — use a contrasting color pill/rectangle shape
- All text must be CRISP, SHARP, and EASY TO READ — no blurry or distorted letters
- Text must NEVER overlap or cover the product

## QUALITY:
- 4K ultra-sharp rendering
- Rich, saturated, harmonious color palette
- Professional advertising photography quality combined with illustrated graphic design elements
- The final image should look like it belongs in a premium brand's social media campaign

Generate this advertisement image now. Remember: PRESERVE the product exactly as shown, be creative ONLY with the background environment, decorations, and typography.`;

    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image-preview',
        messages: [{ role: 'user', content: [
          { type: 'text', text: adPrompt },
          { type: 'image_url', image_url: { url: productImageUrl } }
        ]}],
        modalities: ['image', 'text'],
      }),
    });

    if (!imageResponse.ok) {
      const status = imageResponse.status;
      if (status === 429) return errResponse('Rate limit exceeded, please try again later.', 429);
      if (status === 402) return errResponse('AI credits exhausted. Please try later.', 402);
      const errText = await imageResponse.text();
      console.error('AI gateway error:', status, errText);
      throw new Error(`Image generation failed: ${status}`);
    }

    const responseData = await imageResponse.json();
    const generatedBase64 = responseData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!generatedBase64) throw new Error('No image generated');

    // Upload generated image
    let generatedImageUrl = generatedBase64;
    if (generatedBase64.startsWith('data:')) {
      try {
        generatedImageUrl = await uploadBase64(serviceClient, generatedBase64, `product-ads/${userId}`);
      } catch { /* keep base64 fallback */ }
    }

    // Cleanup temp product upload
    if (productImageUrl.includes('product-ads/') && productImageUrl !== generatedImageUrl) {
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
