import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

interface VoiceoverRequest {
  scripts: string[];
  voiceId?: string;
  brandTone?: string;
}

// Premium ElevenLabs voice IDs for different tones
const VOICE_PRESETS: Record<string, string> = {
  professional: "onwK4e9ZLuTAKqWW03F9", // Daniel - authoritative
  warm: "EXAVITQu4vr4xnSDxMaL", // Sarah - warm and friendly
  energetic: "IKne3meq5aSn9XLyUdCD", // Charlie - upbeat
  sophisticated: "JBFqnCBsd6RMkjVDRZzb", // George - refined
  inspiring: "CwhRBWXzGAHq8TQ4Fs17", // Roger - commanding
  youthful: "SAz9YHcvj6GT2YYXdXww", // River - fresh
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: VoiceoverRequest = await req.json();
    const { scripts, voiceId, brandTone = "professional" } = body;

    if (!scripts || scripts.length === 0) {
      throw new Error("No scripts provided");
    }

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    console.log("Generating voiceover for", scripts.length, "segments");

    // Select voice based on brand tone
    const selectedVoice = voiceId || VOICE_PRESETS[brandTone] || VOICE_PRESETS.professional;

    // Combine all scripts into one cohesive narration
    const fullScript = scripts.join(" ... ");

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: fullScript,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.4,
            use_speaker_boost: true,
            speed: 0.95, // Slightly slower for commercial gravitas
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs error:", response.status, errorText);
      throw new Error(`ElevenLabs error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    console.log("Voiceover generated successfully");

    return new Response(
      JSON.stringify({ 
        audio: {
          voiceoverBase64: base64Audio,
          voiceoverUrl: `data:audio/mpeg;base64,${base64Audio}`,
          duration: Math.ceil(fullScript.split(" ").length / 2.5), // Rough estimate
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Generate voiceover error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
