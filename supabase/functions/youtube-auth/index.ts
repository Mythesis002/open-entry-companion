import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const YT_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
].join(" ");

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    if (action === "authorize") {
      // Step 1: Generate authorization URL
      const sessionId = url.searchParams.get("session_id");
      const redirectUri = url.searchParams.get("redirect_uri");

      if (!sessionId || !redirectUri) {
        return new Response(
          JSON.stringify({ error: "Missing session_id or redirect_uri" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const state = JSON.stringify({ sessionId, redirectUri });
      const encodedState = btoa(state);

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", `${SUPABASE_URL}/functions/v1/youtube-auth?action=callback`);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", YT_SCOPES);
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("include_granted_scopes", "true");
      authUrl.searchParams.set("state", encodedState);
      authUrl.searchParams.set("prompt", "consent");

      console.log("Generated YouTube auth URL for session:", sessionId);

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "callback") {
      // Step 2: Handle OAuth callback
      const code = url.searchParams.get("code");
      const stateParam = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      if (error) {
        console.error("OAuth error:", error);
        return new Response(`<html><body><script>window.opener.postMessage({type:'youtube-auth-error',error:'${error}'},'*');window.close();</script></body></html>`, {
          headers: { "Content-Type": "text/html" },
        });
      }

      if (!code || !stateParam) {
        return new Response(`<html><body><script>window.opener.postMessage({type:'youtube-auth-error',error:'Missing code or state'},'*');window.close();</script></body></html>`, {
          headers: { "Content-Type": "text/html" },
        });
      }

      const state = JSON.parse(atob(stateParam));
      const { sessionId, redirectUri } = state;

      console.log("Processing YouTube callback for session:", sessionId);

      // Exchange code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${SUPABASE_URL}/functions/v1/youtube-auth?action=callback`,
        }),
      });

      const tokens = await tokenResponse.json();

      if (tokens.error) {
        console.error("Token exchange error:", tokens);
        return new Response(`<html><body><script>window.opener.postMessage({type:'youtube-auth-error',error:'${tokens.error_description || tokens.error}'},'*');window.close();</script></body></html>`, {
          headers: { "Content-Type": "text/html" },
        });
      }

      // Get channel info
      const channelResponse = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }
      );

      const channelData = await channelResponse.json();
      const channel = channelData.items?.[0];
      const channelName = channel?.snippet?.title || "Unknown Channel";
      const channelId = channel?.id || "";

      console.log("Connected YouTube channel:", channelName);

      // Save to database
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { error: dbError } = await supabase
        .from("social_connections")
        .upsert({
          session_id: sessionId,
          platform: "youtube",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_type: tokens.token_type,
          expires_at: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            : null,
          platform_user_id: channelId,
          platform_username: channelName,
          extra_data: {
            scope: tokens.scope,
            channel_thumbnail: channel?.snippet?.thumbnails?.default?.url,
          },
        }, { onConflict: "session_id,platform" });

      if (dbError) {
        console.error("Database error:", dbError);
        return new Response(`<html><body><script>window.opener.postMessage({type:'youtube-auth-error',error:'Database error'},'*');window.close();</script></body></html>`, {
          headers: { "Content-Type": "text/html" },
        });
      }

      return new Response(`<html><body><script>window.opener.postMessage({type:'youtube-auth-success',channelName:'${channelName.replace(/'/g, "\\'")}'},'*');window.close();</script></body></html>`, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("YouTube auth error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
