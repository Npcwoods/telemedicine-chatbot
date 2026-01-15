/**
 * TSB Chatbot - Cloudflare Worker
 *
 * This worker proxies requests to Anthropic's API, keeping your API key secure.
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://dash.cloudflare.com
 * 2. Click "Workers & Pages" in the left sidebar
 * 3. Click "Create Worker"
 * 4. Name it something like "tsb-chatbot-api"
 * 5. Replace the default code with this entire file
 * 6. Click "Deploy"
 * 7. Go to Settings > Variables > Add variable:
 *    - Name: ANTHROPIC_API_KEY
 *    - Value: your sk-ant-... key
 *    - Click "Encrypt" to hide it
 * 8. Save and deploy again
 * 9. Copy your worker URL (e.g., https://tsb-chatbot-api.YOUR-SUBDOMAIN.workers.dev)
 * 10. Update the chatbot's WORKER_URL with this URL
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      // Get the request body
      const body = await request.json();

      // Call Anthropic API
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: body.model || "claude-3-5-haiku-latest",
          max_tokens: body.max_tokens || 1024,
          system: body.system,
          messages: body.messages,
        }),
      });

      const data = await response.json();

      // Return response with CORS headers
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: { message: error.message } }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
