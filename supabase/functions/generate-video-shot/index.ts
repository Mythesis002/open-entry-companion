import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface VideoShotRequest {
  actNumber: number;
  keyframeImageUrl: string;
  cameraMovement: string;
  duration: number;
  narrativeGoal: string;
  actTitle: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: VideoShotRequest = await req.json();
    const { actNumber, keyframeImageUrl, cameraMovement, duration, narrativeGoal, actTitle } = body;

    console.log(`Generating video for Act ${actNumber}: ${actTitle}`);

    // Build the motion prompt based on cinematic specs
    const motionPrompt = `Cinematic commercial advertisement shot.

Scene: ${actTitle} - ${narrativeGoal}

Camera Movement: ${cameraMovement}

Apply smooth, professional camera motion. Maintain the exact visual identity from the keyframe.
The motion should feel like a high-budget Super Bowl commercial.
Professional color grading, cinematic depth of field, smooth motion blur.

Duration: ${duration} seconds of elegant, purposeful movement.`;

    // Use Lovable's video generation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/video/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: motionPrompt,
        image: keyframeImageUrl,
        duration: Math.min(duration, 10), // Max 10 seconds per clip
        resolution: "1080p",
        aspect_ratio: "16:9",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Video generation error:", response.status, errorText);
      
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
      
      throw new Error(`Video generation error: ${response.status}`);
    }

    const data = await response.json();
    const videoUrl = data.video_url || data.url;

    if (!videoUrl) {
      throw new Error("No video URL in response");
    }

    console.log(`Video for Act ${actNumber} generated successfully`);

    return new Response(
      JSON.stringify({ 
        videoShot: {
          actNumber,
          shotNumber: 1,
          videoUrl,
          duration: duration,
          cameraMovement
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Generate video shot error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
