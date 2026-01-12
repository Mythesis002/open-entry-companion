import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface TreatmentRequest {
  businessType: string;
  brandName: string;
  productName: string;
  description: string;
  brandArchetype: string;
  targetEmotion: string;
  mood: string;
  audience: string;
  productImages: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TreatmentRequest = await req.json();
    const { businessType, brandName, productName, description, brandArchetype, targetEmotion, mood, audience, productImages } = body;

    console.log("Generating director's treatment for:", productName);

    // Use Gemini 2.5 Pro for complex creative reasoning
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are an elite Hollywood commercial director and creative strategist. You create Oscar-worthy advertisement treatments that rival Super Bowl commercials. Your treatments are technically precise, emotionally resonant, and visually stunning.

You MUST respond with valid JSON only. No markdown, no code blocks, just pure JSON.`
          },
          {
            role: "user",
            content: `Create a cinematic advertisement treatment for:

BRAND: ${brandName || productName}
BUSINESS TYPE: ${businessType}
PRODUCT/SERVICE: ${productName}
DESCRIPTION: ${description}
BRAND ARCHETYPE: ${brandArchetype}
TARGET EMOTION: ${targetEmotion}
VISUAL MOOD: ${mood}
TARGET AUDIENCE: ${audience}

Generate a complete director's treatment as JSON with this EXACT structure:
{
  "visualAnchor": {
    "technicalDescription": "Obsessively detailed description of the product/subject that will ensure visual consistency across all shots. Include exact colors, materials, textures, proportions, distinctive features.",
    "keyVisualElements": ["element1", "element2", "element3"],
    "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
    "materialTextures": ["texture1", "texture2"]
  },
  "acts": [
    {
      "actNumber": 1,
      "title": "The Hook",
      "narrativeGoal": "What this act achieves emotionally",
      "cameraLens": "e.g., 35mm Anamorphic",
      "lighting": "e.g., Volumetric Rembrandt, Golden Hour",
      "colorScience": "e.g., Kodak Vision3 500T",
      "cameraMovement": "e.g., Slow Dolly In, Crane Shot",
      "duration": 5,
      "voiceoverScript": "Compelling 2-3 sentence narration for this act"
    },
    {
      "actNumber": 2,
      "title": "The Solution", 
      "narrativeGoal": "...",
      "cameraLens": "...",
      "lighting": "...",
      "colorScience": "...",
      "cameraMovement": "...",
      "duration": 7,
      "voiceoverScript": "..."
    },
    {
      "actNumber": 3,
      "title": "The Payoff",
      "narrativeGoal": "...",
      "cameraLens": "...",
      "lighting": "...",
      "colorScience": "...",
      "cameraMovement": "...",
      "duration": 5,
      "voiceoverScript": "..."
    }
  ],
  "overallTone": "Brief description of the ad's emotional arc",
  "musicDirection": "Description of the score style and tempo"
}`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
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
    const treatmentText = data.choices?.[0]?.message?.content;

    if (!treatmentText) {
      throw new Error("No treatment generated");
    }

    // Parse the JSON response
    let treatment;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedText = treatmentText.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.slice(7);
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.slice(0, -3);
      }
      treatment = JSON.parse(cleanedText.trim());
    } catch (parseError) {
      console.error("Failed to parse treatment JSON:", treatmentText);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log("Treatment generated successfully");

    return new Response(
      JSON.stringify({ treatment }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Generate treatment error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
