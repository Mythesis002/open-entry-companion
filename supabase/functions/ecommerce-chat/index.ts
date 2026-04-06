import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert E-commerce Research Assistant. You help sellers and entrepreneurs with:

1. **Store & Product Analysis**: Analyze any online store, product listing, or brand. Provide insights on pricing strategies, product positioning, UX/UI quality, and competitive advantages.

2. **Market Research**: Deep-dive into market trends, consumer behavior, competitor landscapes, and emerging opportunities across e-commerce platforms.

3. **Product Comparison**: Compare products across sellers, platforms, and price ranges. Highlight pros/cons, value propositions, and market fit.

4. **Strategy & Growth**: Advise on pricing, marketing, SEO, listing optimization, ad creative strategy, and scaling tactics.

5. **Trend Analysis**: Identify trending products, seasonal opportunities, and viral product categories.

6. **Image Analysis**: When users upload product images, analyze them for quality, branding, listing optimization, and competitive positioning.

Keep responses actionable, data-driven, and concise. Use bullet points, tables, and structured formatting. When analyzing a store or product, be specific with observations and recommendations.

When you receive scraped website content, analyze it thoroughly — examine pricing, product range, UX patterns, SEO elements, and competitive positioning.

If the user shares a URL, analyze what you can infer about the store/product from the URL structure and name, and provide strategic insights.`;

// Simple URL detector
function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
  return text.match(urlRegex) || [];
}

// Scrape a URL and return its text content
async function scrapeUrl(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OpentryBot/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!resp.ok) return `[Failed to fetch ${url}: HTTP ${resp.status}]`;

    const html = await resp.text();

    // Basic HTML to text: strip tags, decode entities, collapse whitespace
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Extract meta description
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const metaDesc = metaMatch ? metaMatch[1].trim() : "";

    // Truncate to ~8000 chars to fit in context
    if (text.length > 8000) text = text.slice(0, 8000) + "...";

    return `[Scraped content from ${url}]\nTitle: ${title}\nMeta Description: ${metaDesc}\n\nPage Content:\n${text}`;
  } catch (e) {
    return `[Failed to scrape ${url}: ${e instanceof Error ? e.message : "Unknown error"}]`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, images } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Check the latest user message for URLs and scrape them
    const lastUserMsg = messages[messages.length - 1];
    let scrapedContent = "";
    if (lastUserMsg?.role === "user") {
      const urls = extractUrls(lastUserMsg.content);
      if (urls.length > 0) {
        const scrapeResults = await Promise.all(urls.slice(0, 3).map(scrapeUrl));
        scrapedContent = scrapeResults.join("\n\n---\n\n");
      }
    }

    // Build Gemini contents
    const geminiContents = [];

    for (const msg of messages) {
      const parts: any[] = [];

      if (msg.role === "user" && msg === lastUserMsg && scrapedContent) {
        parts.push({ text: msg.content + "\n\n--- SCRAPED WEBSITE DATA ---\n\n" + scrapedContent });
      } else {
        parts.push({ text: msg.content });
      }

      geminiContents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts,
      });
    }

    // If images are provided, add them to the last user message
    if (images && Array.isArray(images) && images.length > 0) {
      const lastContent = geminiContents[geminiContents.length - 1];
      if (lastContent?.role === "user") {
        for (const img of images) {
          if (img.base64 && img.mimeType) {
            lastContent.parts.push({
              inlineData: {
                mimeType: img.mimeType,
                data: img.base64,
              },
            });
          }
        }
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform Gemini SSE stream → OpenAI-compatible SSE with word-by-word chunking
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                // Split into words and emit word-by-word for smoother streaming
                const words = text.split(/(\s+)/);
                for (const word of words) {
                  if (word) {
                    const chunk = JSON.stringify({
                      choices: [{ delta: { content: word } }],
                    });
                    await writer.write(encoder.encode(`data: ${chunk}\n\n`));
                  }
                }
              }
            } catch {
              // skip unparseable
            }
          }
        }

        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        console.error("Stream transform error:", e);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ecommerce-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
