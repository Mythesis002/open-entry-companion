import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INSTAGRAM_APP_ID = Deno.env.get("INSTAGRAM_APP_ID")!;
const INSTAGRAM_APP_SECRET = Deno.env.get("INSTAGRAM_APP_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

      const authUrl = new URL("https://api.instagram.com/oauth/authorize");
      authUrl.searchParams.set("client_id", INSTAGRAM_APP_ID);
      authUrl.searchParams.set("redirect_uri", `${SUPABASE_URL}/functions/v1/instagram-auth?action=callback`);
      authUrl.searchParams.set("scope", "user_profile,user_media");
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("state", encodedState);

      console.log("Generated Instagram auth URL for session:", sessionId);

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
        return new Response(`<html><body><script>window.opener.postMessage({type:'instagram-auth-error',error:'${error}'},'*');window.close();</script></body></html>`, {
          headers: { "Content-Type": "text/html" },
        });
      }

      if (!code || !stateParam) {
        return new Response(`<html><body><script>window.opener.postMessage({type:'instagram-auth-error',error:'Missing code or state'},'*');window.close();</script></body></html>`, {
          headers: { "Content-Type": "text/html" },
        });
      }

      const state = JSON.parse(atob(stateParam));
      const { sessionId, redirectUri } = state;

      console.log("Processing Instagram callback for session:", sessionId);

      // Exchange code for access token
      const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: INSTAGRAM_APP_ID,
          client_secret: INSTAGRAM_APP_SECRET,
          grant_type: "authorization_code",
          redirect_uri: `${SUPABASE_URL}/functions/v1/instagram-auth?action=callback`,
          code,
        }),
      });

      const tokens = await tokenResponse.json();

      if (tokens.error_type || tokens.error_message) {
        console.error("Token exchange error:", tokens);
        return new Response(`<html><body><script>window.opener.postMessage({type:'instagram-auth-error',error:'${tokens.error_message || 'Authentication failed'}'},'*');window.close();</script></body></html>`, {
          headers: { "Content-Type": "text/html" },
        });
      }

      // Get long-lived access token
      const longLivedResponse = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${tokens.access_token}`
      );

      const longLivedTokens = await longLivedResponse.json();
      const accessToken = longLivedTokens.access_token || tokens.access_token;
      const expiresIn = longLivedTokens.expires_in || 3600;

      // Get user info
      const userResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
      );

      const userData = await userResponse.json();
      const username = userData.username || "Unknown";
      const userId = userData.id || tokens.user_id;

      console.log("Connected Instagram user:", username);

      // Save to database
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { error: dbError } = await supabase
        .from("social_connections")
        .upsert({
          session_id: sessionId,
          platform: "youtube",
          access_token: accessToken,
          token_type: "Bearer",
          expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
          platform_user_id: userId,
          platform_username: username,
          extra_data: {},
        }, { onConflict: "session_id,platform" })
        .then(() => 
          supabase.from("social_connections").upsert({
            session_id: sessionId,
            platform: "instagram",
            access_token: accessToken,
            token_type: "Bearer",
            expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
            platform_user_id: userId,
            platform_username: username,
            extra_data: {},
          }, { onConflict: "session_id,platform" })
        );

      // Actually save Instagram connection
      const { error: dbError2 } = await supabase
        .from("social_connections")
        .upsert({
          session_id: sessionId,
          platform: "instagram",
          access_token: accessToken,
          token_type: "Bearer",
          expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
          platform_user_id: userId,
          platform_username: username,
          extra_data: {},
        }, { onConflict: "session_id,platform" });

      if (dbError2) {
        console.error("Database error:", dbError2);
        return new Response(`<html><body><script>window.opener.postMessage({type:'instagram-auth-error',error:'Database error'},'*');window.close();</script></body></html>`, {
          headers: { "Content-Type": "text/html" },
        });
      }

      return new Response(`<html><body><script>window.opener.postMessage({type:'instagram-auth-success',username:'${username.replace(/'/g, "\\'")}'},'*');window.close();</script></body></html>`, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("Instagram auth error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
