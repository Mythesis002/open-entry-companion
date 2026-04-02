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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const anonClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = claimsData.claims.sub;

    const { productImage, width = 1080, height = 1080, format = 'square' } = await req.json();
    if (!productImage) {
      return new Response(JSON.stringify({ error: 'Product image is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    // Upload product image to get a public URL
    const serviceClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    let productImageUrl = productImage;

    if (productImage.startsWith('data:')) {
      const matches = productImage.match(/^data:(.+);base64,(.+)$/);
      if (!matches) throw new Error('Invalid image data format');
      const mimeType = matches[1];
      const base64Data = matches[2];
      const ext = mimeType.includes('png') ? 'png' : 'jpg';
      const fileName = `product-ads/${userId}/${Date.now()}.${ext}`;

      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }

      const { error: uploadError } = await serviceClient.storage
        .from('generated-images')
        .upload(fileName, bytes, { contentType: mimeType, upsert: true });
      if (uploadError) throw new Error('Failed to upload product image');

      const { data: urlData } = serviceClient.storage
        .from('generated-images')
        .getPublicUrl(fileName);
      productImageUrl = urlData.publicUrl;
    }

    console.log(`Analyzing product for ${format} (${width}x${height})...`);

    // Step 1: Deep product analysis
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are an elite advertising creative director with 25+ years creating ads for top global brands.

Analyze the product image and create a perfect ad creative plan.

CRITICAL RULES:
- DO NOT invent or guess any price. Set priceTag to empty string "" always. The user will add pricing themselves.
- targetAudience MUST be a simple string like "Young professionals aged 25-35" — NOT an object.
- emotionalTrigger MUST be a simple string like "Aspiration and confidence" — NOT an object.
- All fields must be simple strings, arrays of strings, or empty strings. NO nested objects anywhere.
- The ad dimensions are exactly ${width}x${height} pixels (${format} format). Design the composition specifically for this aspect ratio.

Return a JSON object with these exact fields (all strings unless noted):
- productName: string — detected product name/type
- productCategory: string — category
- targetAudience: string — who would buy this (simple description)
- emotionalTrigger: string — primary emotion to leverage (simple description)
- colors: string[] — 3-5 dominant hex colors from the product
- brandColors: string[] — 2-3 complementary hex colors for ad background
- suggestedBackground: string — background description
- suggestedLighting: string — lighting setup
- suggestedMood: string — mood description
- headline: string — powerful headline (max 5 words)
- subheadline: string — supporting text (max 8 words)
- ctaText: string — call to action (max 3 words)
- priceTag: "" (always empty string)
- designStyle: string — design approach
- textPlacement: string — where text goes relative to product
- adPrompt: string — detailed image generation prompt (200-300 words) for a ${width}x${height} ${format} ad. Must describe: product placement for this specific aspect ratio, background design, lighting, color palette, typography with exact text content, CTA button design, composition optimized for ${format} format. Style: professional product advertisement, commercial photography quality, 8K resolution.

IMPORTANT: Return ONLY valid JSON. No markdown. No code blocks. No nested objects.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Analyze this product and create a ${format} format (${width}x${height}px) ad creative plan.` },
              { type: 'image_url', image_url: { url: productImageUrl } }
            ]
          }
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const errText = await analysisResponse.text();
      console.error('AI analysis error:', analysisResponse.status, errText);
      if (analysisResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (analysisResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please try later.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error('AI analysis failed');
    }

    const analysisData = await analysisResponse.json();
    const analysisText = analysisData.choices?.[0]?.message?.content || '';

    let adPlan: any;
    try {
      const cleaned = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      adPlan = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI analysis:', e, analysisText.substring(0, 500));
      throw new Error('Failed to parse product analysis');
    }

    // Sanitize: force priceTag empty, flatten any objects
    adPlan.priceTag = '';
    if (typeof adPlan.targetAudience === 'object') {
      adPlan.targetAudience = Object.values(adPlan.targetAudience).filter(Boolean).join(', ');
    }
    if (typeof adPlan.emotionalTrigger === 'object') {
      adPlan.emotionalTrigger = Object.values(adPlan.emotionalTrigger).filter(Boolean).join(', ');
    }

    console.log(`Generating ${format} ad image (${width}x${height})...`);

    // Step 2: Generate ad image
    const imageGenPrompt = `Create a professional product advertisement image. The output MUST be exactly ${width}x${height} pixels in ${format} format.

${adPlan.adPrompt}

REQUIREMENTS:
- Dimensions: exactly ${width}x${height} pixels, ${format} orientation
- Display headline "${adPlan.headline}" in bold modern typography
- Display subheadline "${adPlan.subheadline}" below headline
- Include a CTA button with "${adPlan.ctaText}" text
- DO NOT include any price tag or pricing text
- Product is the focal point
- ${adPlan.designStyle} aesthetic
- Background: ${adPlan.suggestedBackground}
- Lighting: ${adPlan.suggestedLighting}
- Professional commercial quality, magazine-ready`;

    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: imageGenPrompt },
              { type: 'image_url', image_url: { url: productImageUrl } }
            ]
          }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!imageResponse.ok) {
      const errText = await imageResponse.text();
      console.error('Image generation error:', imageResponse.status, errText);
      if (imageResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Image generation rate limited. Try again shortly.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (imageResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const generatedBase64 = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!generatedBase64) throw new Error('No image generated');

    // Upload generated image
    let generatedImageUrl = generatedBase64;
    if (generatedBase64.startsWith('data:')) {
      const imgMatches = generatedBase64.match(/^data:(.+);base64,(.+)$/);
      if (imgMatches) {
        const imgMimeType = imgMatches[1];
        const imgBase64 = imgMatches[2];
        const imgExt = imgMimeType.includes('png') ? 'png' : 'jpg';
        const adFileName = `product-ads/${userId}/ad-${Date.now()}.${imgExt}`;

        const imgBinaryString = atob(imgBase64);
        const imgBytes = new Uint8Array(imgBinaryString.length);
        for (let j = 0; j < imgBinaryString.length; j++) {
          imgBytes[j] = imgBinaryString.charCodeAt(j);
        }

        const { error: adUploadError } = await serviceClient.storage
          .from('generated-images')
          .upload(adFileName, imgBytes, { contentType: imgMimeType, upsert: true });

        if (!adUploadError) {
          const { data: adUrlData } = serviceClient.storage
            .from('generated-images')
            .getPublicUrl(adFileName);
          generatedImageUrl = adUrlData.publicUrl;
        }
      }
    }

    // Cleanup temp upload
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
    const message = error instanceof Error ? error.message : 'Failed to generate product ad';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
