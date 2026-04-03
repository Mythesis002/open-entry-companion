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

    console.log(`Phase 1: Deep product analysis for ${format} (${width}x${height})...`);

    // ── Phase 1: Deep Product Analysis & Ad Strategy ──
    const analysisPrompt = `You are an elite creative director at a top-tier advertising agency (Ogilvy, Wieden+Kennedy level). You have 30+ years creating award-winning product advertisements for global brands.

Analyze this product image with extreme attention to detail and create a COMPLETE advertising creative blueprint.

## YOUR ANALYSIS PROCESS

### Phase 1: Product Intelligence
- Identify the exact product, brand (if visible), category, and sub-category
- Extract every visible detail: colors, textures, materials, shape, packaging design
- Determine the product's market positioning (mass market, premium, luxury, artisanal)

### Phase 2: Strategic Foundation  
- Define the Core Selling Proposition (CSP) — the ONE key benefit
- Identify the target audience with specificity
- Determine the primary emotional trigger (aspiration, nostalgia, desire, trust, excitement)
- Choose the advertising approach: lifestyle, product-hero, ingredient-showcase, or emotional

### Phase 3: Scene Design (Environment & Lighting)
Based on product category, design the PERFECT environment:

**For Food & Beverage:** Bright natural settings — outdoor patios, fresh water surfaces, lush gardens. Use deconstructive props (show ingredients: fruit slices, herbs, ice). Natural sunlight with crisp highlights.

**For Beauty & Cosmetics:** Premium studio with dark luxurious backgrounds (brushed metal, deep gradients). Dramatic focused lighting with edge highlights, golden halos, starburst glints, bokeh particles. Shimmering abstract light trails.

**For Technology:** Clean, minimalist environments with gradient backgrounds. Precise directional lighting showing product details and reflections.

**For Fashion & Lifestyle:** Aspirational settings matching the brand identity. Environmental storytelling with contextual props.

### Phase 4: Composition Rules
- Use Rule of Thirds for product placement — NEVER dead center
- Create leading lines that guide the eye to the product
- Add depth with foreground elements (slightly blurred) and background elements
- For pairs/sets: use elegant symmetry
- Product MUST be the dominant focal point, occupying 40-60% of the frame
- Include deconstructive props that showcase ingredients or key features

### Phase 5: Typography & Branding
- Brand name: LARGEST text element, prominent but not overpowering
- Headline/Hook: Short, punchy (3-6 words max), emotionally compelling
- Subheadline: Supporting message (5-10 words)
- CTA: Clear action phrase
- Font style must match product category:
  - Natural/Rustic: Classic serif or elegant script
  - Premium/Luxury: Clean, all-caps serif with generous letter-spacing
  - Modern/Tech: Bold geometric sans-serif
  - Fun/Casual: Rounded, friendly typefaces

### Phase 6: Visual Polish
- Depth of field: Sharp product, softly blurred fore/background
- Subtle glow/halo around product for premium feel
- Color harmony: All colors must complement each other
- Professional color grading matching the mood

CRITICAL RULES:
- DO NOT invent any price. Set priceTag to "" always.
- The ad dimensions are EXACTLY ${width}x${height} pixels (${format} format).
- All fields MUST be simple strings or arrays of strings. NO nested objects.
- targetAudience and emotionalTrigger must be simple strings.

Return a JSON object with these EXACT fields:
{
  "productName": "string — detected product name/type",
  "productCategory": "string — e.g. Food & Beverage, Beauty, Technology, Fashion",
  "targetAudience": "string — specific audience description",
  "emotionalTrigger": "string — primary emotion to leverage",
  "colors": ["3-5 dominant hex colors from the product"],
  "brandColors": ["2-3 complementary hex colors for the ad palette"],
  "suggestedBackground": "string — detailed background/environment description (50+ words)",
  "suggestedLighting": "string — detailed lighting setup description (40+ words)",
  "suggestedMood": "string — mood and atmosphere",
  "headline": "string — powerful hook (3-6 words)",
  "subheadline": "string — supporting text (5-10 words)",
  "ctaText": "string — call to action (2-4 words)",
  "priceTag": "",
  "designStyle": "string — overall design approach",
  "textPlacement": "string — where text goes relative to product",
  "fontStyle": "string — typography description (serif/sans-serif/script, weight, spacing)",
  "compositionNotes": "string — Rule of Thirds placement, prop arrangement, depth layers",
  "visualEffects": "string — glow, bokeh, depth of field, color grading notes",
  "propDescription": "string — contextual and deconstructive props to include",
  "adPrompt": "string — EXTREMELY detailed image generation prompt (300-500 words) for a ${width}x${height} ${format} ad. Must describe EVERY visual element: exact product placement using Rule of Thirds, complete background environment with specific details, lighting setup with highlight/shadow placement, all typography with exact text content and font styling, foreground/background prop placement, depth of field effects, color grading, visual effects (glow/bokeh/particles), CTA button or text design. This must read like a master-class art direction brief. Style: award-winning product advertisement, commercial photography, 8K, magazine-cover quality."
}

Return ONLY valid JSON. No markdown. No code blocks.`;

    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: analysisPrompt },
          { role: 'user', content: [
            { type: 'text', text: `Analyze this product and create a ${format} format (${width}x${height}px) advertising creative blueprint. Study every detail of this product — its colors, textures, packaging, brand elements — and design a professional ad that would win awards.` },
            { type: 'image_url', image_url: { url: productImageUrl } }
          ]}
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const status = analysisResponse.status;
      if (status === 429) return errResponse('Rate limit exceeded, please try again later.', 429);
      if (status === 402) return errResponse('AI credits exhausted. Please try later.', 402);
      throw new Error('AI analysis failed');
    }

    const analysisText = (await analysisResponse.json()).choices?.[0]?.message?.content || '';
    let adPlan: any;
    try {
      adPlan = JSON.parse(analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      console.error('Parse error:', analysisText.substring(0, 500));
      throw new Error('Failed to parse product analysis');
    }

    // Sanitize all fields
    adPlan.priceTag = '';
    for (const key of ['targetAudience', 'emotionalTrigger', 'suggestedMood', 'designStyle', 'textPlacement', 'fontStyle', 'compositionNotes', 'visualEffects', 'propDescription']) {
      if (typeof adPlan[key] === 'object' && adPlan[key] !== null) {
        adPlan[key] = Object.values(adPlan[key]).filter(Boolean).join(', ');
      }
    }

    console.log(`Phase 2: Generating ${format} ad image (${width}x${height})...`);

    // ── Phase 2: Generate Ad Image ──
    const imageGenPrompt = `Create an AWARD-WINNING professional product advertisement image. Output MUST be exactly ${width}x${height} pixels in ${format} orientation.

## PRODUCT & SCENE
${adPlan.adPrompt}

## MANDATORY COMPOSITION RULES
1. PRODUCT PLACEMENT: The product is the HERO — place it using the Rule of Thirds, occupying 40-60% of the frame. It must be in RAZOR-SHARP focus.
2. BACKGROUND: ${adPlan.suggestedBackground}
3. LIGHTING: ${adPlan.suggestedLighting}
4. PROPS: ${adPlan.propDescription || 'Contextual props that enhance the product story'}
5. DEPTH OF FIELD: Sharp product, softly blurred foreground props and background for cinematic depth.

## MANDATORY TYPOGRAPHY (must be pixel-perfect and legible)
- HEADLINE: "${adPlan.headline}" — Large, bold, ${adPlan.fontStyle || 'modern premium'} typography. Must be CLEARLY READABLE.
- SUBHEADLINE: "${adPlan.subheadline}" — Smaller supporting text below or near the headline.
- CTA: "${adPlan.ctaText}" — Styled as a button, badge, or bold text element. Must stand out.
- Text placement: ${adPlan.textPlacement || 'Upper or side area, never obscuring the product'}
- DO NOT include ANY price, dollar signs, or numerical pricing.

## VISUAL POLISH (non-negotiable)
- Subtle glow or halo effect around the product for a premium aura
- Color harmony: use palette ${(adPlan.brandColors || adPlan.colors || []).join(', ')}
- Professional color grading matching ${adPlan.suggestedMood || 'premium'} mood
- ${adPlan.visualEffects || 'Subtle bokeh, light particles, and atmospheric depth'}
- Magazine-cover quality, 8K resolution, award-winning commercial photography
- The final image must look like it was created by a team of professional graphic designers and photographers`;

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
      if (status === 429) return errResponse('Image generation rate limited. Try again shortly.', 429);
      if (status === 402) return errResponse('AI credits exhausted.', 402);
      throw new Error(`Image generation failed: ${status}`);
    }

    const generatedBase64 = (await imageResponse.json()).choices?.[0]?.message?.images?.[0]?.image_url?.url;
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

    return new Response(
      JSON.stringify({ adPlan, generatedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Product ad generation error:', error);
    return errResponse(error instanceof Error ? error.message : 'Failed to generate product ad');
  }
});
