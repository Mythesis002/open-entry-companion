import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface KeyframeRequest {
  actNumber: number;
  visualAnchor: {
    technicalDescription: string;
    keyVisualElements: string[];
    colorPalette: string[];
    materialTextures: string[];
  };
  actSpec: {
    title: string;
    narrativeGoal: string;
    cameraLens: string;
    lighting: string;
    colorScience: string;
    cameraMovement: string;
  };
  referenceImage?: string;
  brandName: string;
  businessType: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: KeyframeRequest = await req.json();
    const { actNumber, visualAnchor, actSpec, referenceImage, brandName, businessType } = body;

    console.log(`Generating keyframe for Act ${actNumber}`);

    // Build the cinematic prompt
    const cinematicPrompt = `Ultra high resolution cinematic advertisement still frame.

SUBJECT (VISUAL ANCHOR - Must be EXACT): ${visualAnchor.technicalDescription}

Key Visual Elements: ${visualAnchor.keyVisualElements.join(", ")}
Materials & Textures: ${visualAnchor.materialTextures.join(", ")}
Color Palette: ${visualAnchor.colorPalette.join(", ")}

SCENE: ${actSpec.title} - ${actSpec.narrativeGoal}

CINEMATOGRAPHY:
- Camera: ${actSpec.cameraLens}
- Lighting: ${actSpec.lighting}
- Color Science: ${actSpec.colorScience}
- Composition suggesting: ${actSpec.cameraMovement}

BRAND: ${brandName}
BUSINESS TYPE: ${businessType}

Style: Photorealistic, commercial photography, 4K film still, professional studio quality, dramatic composition, perfect focus, award-winning advertisement aesthetic.

16:9 aspect ratio, hero shot composition.`;

    let imageUrl: string;

    // If we have a reference image, use image editing to maintain consistency
    if (referenceImage && referenceImage.startsWith("data:image")) {
      console.log("Using reference image for consistency");
      
      const editResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Transform this product/subject into a cinematic advertisement keyframe while maintaining the EXACT identity of the product/subject. Apply these specifications:

${cinematicPrompt}

CRITICAL: The product/subject must look IDENTICAL to the reference - same colors, same shape, same details. Only the environment, lighting, and cinematic treatment should change.`
                },
                {
                  type: "image_url",
                  image_url: { url: referenceImage }
                }
              ]
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!editResponse.ok) {
        console.error("Image edit failed, falling back to generation");
        // Fall through to pure generation
      } else {
        const editData = await editResponse.json();
        const generatedImage = editData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (generatedImage) {
          imageUrl = generatedImage;
          console.log(`Keyframe ${actNumber} generated with reference`);
          
          return new Response(
            JSON.stringify({ 
              keyframe: {
                actNumber,
                imageUrl,
                prompt: cinematicPrompt,
                cinematicSpecs: `${actSpec.cameraLens} | ${actSpec.lighting} | ${actSpec.colorScience}`
              }
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Pure text-to-image generation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: cinematicPrompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      throw new Error("No image generated");
    }

    imageUrl = generatedImage;
    console.log(`Keyframe ${actNumber} generated successfully`);

    return new Response(
      JSON.stringify({ 
        keyframe: {
          actNumber,
          imageUrl,
          prompt: cinematicPrompt,
          cinematicSpecs: `${actSpec.cameraLens} | ${actSpec.lighting} | ${actSpec.colorScience}`
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Generate keyframe error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
