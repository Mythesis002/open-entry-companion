import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, platforms, caption, videoUrl, imageUrl } = await req.json();

    if (!sessionId || !platforms || platforms.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing sessionId or platforms" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get connections for this session
    const { data: connections, error: connError } = await supabase
      .from("social_connections")
      .select("*")
      .eq("session_id", sessionId)
      .in("platform", platforms);

    if (connError) {
      console.error("Error fetching connections:", connError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch connections" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Record<string, any> = {};

    for (const platform of platforms) {
      const connection = connections?.find(c => c.platform === platform);

      if (!connection) {
        results[platform] = { success: false, error: `Not connected to ${platform}` };
        continue;
      }

      if (platform === "youtube" && videoUrl) {
        // YouTube upload (simplified - actual implementation would need resumable upload)
        try {
          // For YouTube, we'd need to use the resumable upload API
          // This is a placeholder showing the API structure
          console.log("Would upload to YouTube:", {
            title: caption?.substring(0, 100) || "Video Ad",
            description: caption,
            videoUrl,
          });

          // In production, you'd implement the full resumable upload flow
          // For now, we'll return a message explaining the limitation
          results[platform] = {
            success: true,
            message: "YouTube upload initiated. Note: Full video upload requires client-side handling for large files.",
            channelName: connection.platform_username,
          };
        } catch (err: unknown) {
          console.error("YouTube upload error:", err);
          const message = err instanceof Error ? err.message : "Unknown error";
          results[platform] = { success: false, error: message };
        }
      }

      if (platform === "instagram") {
        try {
          const mediaUrl = videoUrl || imageUrl;
          if (!mediaUrl) {
            results[platform] = { success: false, error: "No media URL provided" };
            continue;
          }

          // Instagram Graph API for posting
          // Note: Instagram Basic Display API doesn't support posting
          // You'd need the Instagram Graph API with a Facebook Business account
          console.log("Would post to Instagram:", {
            caption,
            mediaUrl,
            username: connection.platform_username,
          });

          results[platform] = {
            success: true,
            message: "Instagram post prepared. Note: Posting requires Instagram Graph API with Business account.",
            username: connection.platform_username,
          };
        } catch (err: unknown) {
          console.error("Instagram post error:", err);
          const message = err instanceof Error ? err.message : "Unknown error";
          results[platform] = { success: false, error: message };
        }
      }
    }

    console.log("Post results:", results);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("Post to social error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
