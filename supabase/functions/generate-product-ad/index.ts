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
    // Auth
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

    const { productImage } = await req.json();
    if (!productImage) {
      return new Response(JSON.stringify({ error: 'Product image is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const FAL_KEY = Deno.env.get('FAL_KEY');
    if (!FAL_KEY) throw new Error('FAL_KEY not configured');

    // Step 1: Upload product image to storage for a public URL
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

    console.log('Step 1: Analyzing product with AI...');

    // Step 2: Analyze product with Lovable AI
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert advertising creative director and product photographer. Analyze the product image and create a detailed advertising plan. Return a JSON object with these fields:
- productName: detected product name/type
- productCategory: category (electronics, fashion, food, beauty, home, etc.)
- colors: array of dominant colors in the product
- suggestedBackground: ideal background environment for the ad
- suggestedLighting: lighting style recommendation
- suggestedMood: overall mood (luxurious, energetic, minimal, warm, professional)
- headline: catchy ad headline text (max 6 words)
- subheadline: supporting text (max 10 words)
- ctaText: call to action text (max 4 words)
- adPrompt: A highly detailed image generation prompt (150-200 words) that describes exactly how to create a stunning product advertisement image. Include: product placement, background scene, lighting, color palette, text overlay placement hints, camera angle, style references. The prompt should produce a professional-grade ad image. Make it photorealistic and commercial quality.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this product and create a detailed advertising creative plan.' },
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
      // Try to parse, stripping markdown code fences if present
      const cleaned = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      adPlan = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI analysis:', e);
      throw new Error('Failed to parse product analysis');
    }

    console.log('Step 2: Generating ad image with seedream...');

    // Step 3: Generate ad image using seedream v4 edit
    const falResponse = await fetch('https://fal.run/fal-ai/bytedance/seedream/v4/edit', {
      method: 'POST',
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: adPlan.adPrompt,
        image_urls: [productImageUrl],
        image_size: { width: 1080, height: 1080 },
        seed: Math.floor(Math.random() * 2147483647),
      }),
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.error('fal.ai error:', falResponse.status, errorText);
      if (falResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Image generation rate limited. Try again shortly.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error(`Image generation failed: ${falResponse.status}`);
    }

    const falData = await falResponse.json();
    const generatedImageUrl = falData.images?.[0]?.url;
    if (!generatedImageUrl) throw new Error('No image generated');

    console.log('Ad image generated successfully');

    // Cleanup temp upload
    if (productImageUrl.includes('product-ads/')) {
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
