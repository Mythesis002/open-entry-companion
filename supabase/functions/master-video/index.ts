import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREATOMATE_API_KEY = Deno.env.get("CREATOMATE_API_KEY");

interface MasterRequest {
  videoUrls: string[];
  voiceoverUrl: string;
  brandLogo?: string;
  brandName: string;
  duration: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: MasterRequest = await req.json();
    const { videoUrls, voiceoverUrl, brandLogo, brandName, duration } = body;

    if (!videoUrls || videoUrls.length === 0) {
      throw new Error("No video URLs provided");
    }

    if (!CREATOMATE_API_KEY) {
      throw new Error("Creatomate API key not configured");
    }

    console.log("Mastering video with", videoUrls.length, "clips");

    // Calculate timing for each video segment
    const segmentDuration = duration / videoUrls.length;

    // Build Creatomate elements array
    const videoElements = videoUrls.map((url, index) => ({
      type: "video",
      source: url,
      time: index * segmentDuration,
      duration: segmentDuration,
      fit: "cover",
      animations: [
        {
          type: "fade",
          fade: "in",
          duration: 0.3,
        },
        {
          type: "fade",
          fade: "out",
          duration: 0.3,
          time: segmentDuration - 0.3,
        },
      ],
    }));

    // Add voiceover track
    const audioElement = {
      type: "audio",
      source: voiceoverUrl,
      time: 0,
      duration: duration,
      volume: "100%",
    };

    // Add logo watermark if provided
    const logoElement = brandLogo ? {
      type: "image",
      source: brandLogo,
      time: 0,
      duration: duration,
      width: "15%",
      x: "90%",
      y: "10%",
      opacity: "80%",
    } : null;

    // Add end card with brand name
    const endCardElements = [
      {
        type: "composition",
        time: duration - 3,
        duration: 3,
        elements: [
          {
            type: "shape",
            path: "rectangle",
            fill_color: "rgba(0,0,0,0.7)",
            width: "100%",
            height: "100%",
            animations: [
              { type: "fade", fade: "in", duration: 0.5 }
            ]
          },
          {
            type: "text",
            text: brandName,
            font_family: "Inter",
            font_weight: "700",
            font_size: "8 vmin",
            fill_color: "#ffffff",
            x: "50%",
            y: "50%",
            x_alignment: "50%",
            y_alignment: "50%",
            animations: [
              { type: "fade", fade: "in", duration: 0.5 },
              { type: "scale", start_scale: "80%", duration: 0.5 }
            ]
          }
        ]
      }
    ];

    // Combine all elements
    const allElements = [
      ...videoElements,
      audioElement,
      ...(logoElement ? [logoElement] : []),
      ...endCardElements,
    ];

    // Create the render request
    const renderResponse = await fetch("https://api.creatomate.com/v1/renders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CREATOMATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        output_format: "mp4",
        width: 1920,
        height: 1080,
        frame_rate: 30,
        duration: duration,
        elements: allElements,
      }),
    });

    if (!renderResponse.ok) {
      const errorText = await renderResponse.text();
      console.error("Creatomate error:", renderResponse.status, errorText);
      throw new Error(`Creatomate error: ${renderResponse.status}`);
    }

    const renderData = await renderResponse.json();
    const renderId = renderData[0]?.id;

    if (!renderId) {
      throw new Error("No render ID returned");
    }

    console.log("Render started, ID:", renderId);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    let finalUrl: string | null = null;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
        headers: {
          Authorization: `Bearer ${CREATOMATE_API_KEY}`,
        },
      });

      if (!statusResponse.ok) {
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      
      if (statusData.status === "succeeded") {
        finalUrl = statusData.url;
        break;
      } else if (statusData.status === "failed") {
        throw new Error("Render failed: " + (statusData.error_message || "Unknown error"));
      }

      attempts++;
    }

    if (!finalUrl) {
      throw new Error("Render timed out");
    }

    console.log("Master video complete:", finalUrl);

    return new Response(
      JSON.stringify({ 
        masterVideo: {
          videoUrl: finalUrl,
          duration: duration,
          resolution: "1920x1080"
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Master video error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
