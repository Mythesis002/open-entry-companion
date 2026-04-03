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

    console.log(`Generating ${format} graphical ad (${width}x${height}) — single-phase...`);

    // ── Single Phase: Direct Graphical Ad Generation ──
    const imageGenPrompt = `You are an elite graphic designer creating a PROFESSIONAL PRODUCT ADVERTISEMENT.

Look at this product image carefully. Study its colors, shape, packaging, and category.
Then create a stunning GRAPHICAL advertisement image.

## CRITICAL RULES — READ FIRST
- DO NOT use any brand name, logo text, or company name. Leave brand areas BLANK or use generic text like "PREMIUM QUALITY" or "NEW ARRIVAL".
- DO NOT invent any price, dollar sign, or numerical pricing.
- DO NOT create photorealistic scenes. Create GRAPHIC DESIGN art with illustrated/vector-style backgrounds.
- The output MUST be exactly ${width}x${height} pixels in ${format} format.

## BACKGROUND STYLE (Graphical, NOT photorealistic)
Create a visually striking GRAPHIC background using:
- Bold geometric shapes, gradients, and abstract patterns
- Color blocks, diagonal stripes, radial bursts, or wave patterns
- Complementary colors extracted from the product itself
- Think: modern poster design, not photography
- The background should feel dynamic, energetic, and eye-catching
- Use 2-3 dominant colors that complement the product

## PRODUCT PLACEMENT
- Place the product as the HERO using the Rule of Thirds
- Product should occupy 40-60% of the frame and be in sharp focus
- Add a subtle glow, shadow, or halo effect around the product
- The product itself should look clean and crisp against the graphic background

## TYPOGRAPHY (must be clearly legible)
- HEADLINE: A short, punchy tagline (3-5 words) that describes the product benefit. Examples: "PURE REFRESHMENT", "ELEVATE YOUR STYLE", "TASTE THE DIFFERENCE". Use LARGE, BOLD text.
- SUBTEXT: One supporting line (5-8 words). Smaller font below the headline.
- CTA: A call-to-action like "SHOP NOW", "ORDER TODAY", "TRY IT NOW" — styled as a button or badge.
- Use clean, modern sans-serif fonts. All text must be PERFECTLY READABLE.
- Text placement: upper third or side, NEVER covering the product.
- NO brand names. NO made-up company names. Only generic benefit-focused copy.

## VISUAL POLISH
- Clean graphic design aesthetic — think Adobe Illustrator / Canva Pro level
- Bold color contrasts that make the product pop
- Subtle decorative elements: dots, lines, circles, sparkles
- Professional typography hierarchy: headline > subtext > CTA
- The final result should look like a professional social media ad created by a graphic designer

Create this ad now. Make it bold, clean, and visually stunning.`;

    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [{ role: 'user', content: [
          { type: 'text', text: imageGenPrompt },
          { type: 'image_url', image_url: { url: productImageUrl } }
        ]}],
        modalities: ['image', 'text'],
      }),
    });

    if (!imageResponse.ok) {
      const status = imageResponse.status;
      if (status === 429) return errResponse('Rate limit exceeded, please try again later.', 429);
      if (status === 402) return errResponse('AI credits exhausted. Please try later.', 402);
      throw new Error(`Image generation failed: ${status}`);
    }

    const responseData = await imageResponse.json();
    const generatedBase64 = responseData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const aiText = responseData.choices?.[0]?.message?.content || '';
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

    // Return a minimal adPlan for the result view
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
