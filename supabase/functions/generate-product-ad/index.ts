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

    // Step 1: Upload product image to get a public URL for analysis
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

    console.log('Step 1: Deep product analysis with marketing psychology AI...');

    // Step 2: Deep product analysis with expert marketing psychology
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
            content: `You are a world-class advertising creative director, consumer psychologist, and graphic designer with 25+ years of experience creating award-winning product advertisements for brands like Apple, Nike, Coca-Cola, and luxury fashion houses.

Your expertise combines:
- **Consumer Psychology**: Understanding emotional triggers, color psychology, visual hierarchy, attention patterns, and purchase motivation
- **Graphic Design Mastery**: Typography, composition, negative space, visual balance, contrast ratios, and brand identity
- **Copywriting Excellence**: Headlines that stop scrollers, emotional hooks, urgency creation, benefit-focused messaging
- **Marketing Strategy**: Target audience identification, positioning, competitive differentiation, and conversion optimization

Analyze the product image with extreme depth and create a comprehensive advertising creative plan.

Return a JSON object with these fields:
- productName: exact product name/type detected
- productCategory: category (electronics, fashion, food, beauty, home, fitness, luxury, etc.)
- targetAudience: who would buy this (age, gender, lifestyle, income level)
- emotionalTrigger: the primary emotion to leverage (aspiration, FOMO, joy, trust, exclusivity, comfort)
- colors: array of 3-5 dominant colors detected in the product (hex codes)
- brandColors: array of 2-3 suggested complementary colors for the ad background/accents that create maximum contrast and visual appeal with the product
- suggestedBackground: detailed background description (gradient direction, texture, environment, depth)
- suggestedLighting: specific lighting setup (rim light, soft diffused, dramatic spotlight, golden hour, studio)
- suggestedMood: mood with reasoning (luxurious, energetic, minimal-modern, warm-cozy, bold-confident, elegant-sophisticated)
- headline: powerful ad headline (max 5 words) that creates instant desire using psychological triggers
- subheadline: benefit-focused supporting text (max 8 words) that reinforces the headline
- ctaText: high-converting call to action (max 3 words) using action verbs and urgency
- priceTag: suggest a realistic price display format if applicable (e.g., "₹999", "$49.99", or "" if not applicable)
- designStyle: the overall graphic design approach (minimalist-luxury, bold-vibrant, clean-corporate, lifestyle-aspirational, premium-dark, fresh-modern)
- textPlacement: where text should go relative to the product (top-center, bottom-left, right-side, overlay-center)
- adPrompt: A masterfully detailed image generation prompt (250-350 words) that will produce a PROFESSIONAL ADVERTISING IMAGE. This prompt MUST include ALL of the following elements:

  1. PRODUCT PLACEMENT: Exact position, angle, scale, and presentation of the product (centered, slightly angled, floating, on a surface)
  2. BACKGROUND DESIGN: Detailed background with gradients, abstract shapes, light effects, bokeh, or environmental elements that complement the product
  3. LIGHTING & SHADOWS: Professional studio lighting setup with specific light sources, reflections, and shadow directions
  4. COLOR SCHEME: Exact color palette with hex codes for background, accents, and text
  5. TYPOGRAPHY & TEXT: CRITICAL - Include the exact headline text, subheadline, and CTA button text. Specify font style (bold sans-serif, elegant serif, modern display), size hierarchy, color, and exact placement
  6. CTA BUTTON: Design a visually striking call-to-action button with rounded corners, gradient or solid color, shadow, and text
  7. GRAPHIC ELEMENTS: Decorative elements like light streaks, geometric shapes, subtle patterns, badge/ribbon for offers, brand-style borders
  8. COMPOSITION: Rule of thirds, visual flow, focal points, breathing room, and overall balance
  9. STYLE REFERENCE: "Professional product advertisement, commercial photography quality, magazine-ready, high-end brand aesthetic"
  10. QUALITY MARKERS: "8K resolution, ultra-sharp, professional color grading, commercial product photography"

The prompt should create an image that looks like it was designed by a top advertising agency - with proper text rendering, balanced composition, eye-catching colors, and a clear visual hierarchy that guides the viewer's eye from headline → product → CTA.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Analyze this product image with deep marketing psychology and create a ${format} format (${width}x${height}) advertising creative plan that would convert at the highest possible rate. Consider the target demographics, emotional triggers, and visual psychology that would make someone stop scrolling and want to buy this product immediately.` },
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
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error('AI analysis failed');
    }

    const analysisData = await analysisResponse.json();
    const analysisText = analysisData.choices?.[0]?.message?.content || '';
    console.log('AI analysis raw:', analysisText.substring(0, 500));

    let adPlan: any;
    try {
      const cleaned = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      adPlan = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI analysis:', e);
      throw new Error('Failed to parse product analysis');
    }

    console.log('Step 2: Generating professional ad image with Gemini Image Generation...');

    // Step 3: Generate the ad image using Gemini image generation
    const imageGenPrompt = `Create a professional product advertisement image in ${format} format (${width}x${height} pixels).

${adPlan.adPrompt}

CRITICAL REQUIREMENTS:
- This must look like a REAL professional advertisement created by a top agency
- Include the headline text "${adPlan.headline}" prominently displayed in bold, modern typography
- Include the subheadline "${adPlan.subheadline}" in smaller elegant text below the headline  
- Include a CTA button with text "${adPlan.ctaText}" - make it a visually striking button with rounded corners
${adPlan.priceTag ? `- Display the price "${adPlan.priceTag}" in an eye-catching format` : ''}
- The product must be the hero/focal point of the composition
- Use ${adPlan.designStyle} design aesthetic
- Background should feature ${adPlan.suggestedBackground}
- Lighting: ${adPlan.suggestedLighting}
- Overall mood: ${adPlan.suggestedMood}
- Text placement: ${adPlan.textPlacement}
- Make it scroll-stopping, conversion-optimized, and magazine-quality
- Professional color grading, sharp details, commercial quality`;

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
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const generatedBase64 = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!generatedBase64) throw new Error('No image generated');

    console.log('Step 3: Uploading generated ad to storage...');

    // Step 4: Upload the generated image to storage
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

    console.log('Ad generated successfully!');

    // Cleanup temp product image upload
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
