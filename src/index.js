// Import widget handlers
import { clockHandler } from "./widgets/clock.js";
import { weatherDebugHandler } from "./widgets/weather-debug.js";
import { weatherEmbedHandler } from "./widgets/weather-embed.js";
import { weatherFixedHandler } from "./widgets/weather-fixed.js";
import { weatherSimpleHandler } from "./widgets/weather-simple.js";
import { weatherStyledHandler } from "./widgets/weather-styled.js";
import { weatherHandler } from "./widgets/weather.js";

// Widget registry - add new widgets here
const widgetHandlers = {
  weather: weatherHandler,
  "weather-debug": weatherDebugHandler,
  "weather-simple": weatherSimpleHandler,
  "weather-fixed": weatherFixedHandler,
  "weather-styled": weatherStyledHandler,
  "weather-embed": weatherEmbedHandler,
  clock: clockHandler,
  // Add more widget handlers here as needed
  // example: exampleHandler,
};

// CORS headers for embedding in Notion
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "X-Frame-Options": "ALLOWALL",
  "Content-Security-Policy": "frame-ancestors *",
};

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Route: /widget/{widgetName}
    const widgetMatch = path.match(/^\/widget\/([^\/]+)\/?$/);
    if (widgetMatch) {
      const widgetName = widgetMatch[1];
      const handler = widgetHandlers[widgetName];

      if (handler) {
        try {
          const widgetHtml = await handler(request, url);
          return new Response(widgetHtml, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/html;charset=UTF-8",
            },
          });
        } catch (error) {
          return new Response(`Error rendering widget: ${error.message}`, {
            status: 500,
            headers: corsHeaders,
          });
        }
      } else {
        return new Response("Widget not found", {
          status: 404,
          headers: corsHeaders,
        });
      }
    }

    // Home page - list available widgets
    if (path === "/" || path === "") {
      const availableWidgets = Object.keys(widgetHandlers);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Personal Embeds</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
              color: #333;
              margin-bottom: 1rem;
            }
            .widget-list {
              list-style: none;
              padding: 0;
            }
            .widget-item {
              padding: 1rem;
              margin: 0.5rem 0;
              background: #f8f9fa;
              border-radius: 4px;
              border: 1px solid #e9ecef;
            }
            .widget-url {
              font-family: monospace;
              font-size: 0.9rem;
              color: #0066cc;
              word-break: break-all;
              text-decoration: none;
            }
            .widget-url:hover {
              text-decoration: underline;
            }
            .instructions {
              margin-top: 2rem;
              padding: 1rem;
              background: #e8f4f8;
              border-radius: 4px;
              border-left: 4px solid #0066cc;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Personal Embeds Service</h1>
            <p>Available widgets:</p>
            <ul class="widget-list">
              ${availableWidgets
                .map(
                  (widget) => `
                <li class="widget-item">
                  <strong>${widget}</strong><br>
                  <a href="/widget/${widget}" class="widget-url" target="_blank">${url.origin}/widget/${widget}</a>
                </li>
              `
                )
                .join("")}
            </ul>
            <div class="instructions">
              <h3>How to use in Notion:</h3>
              <ol>
                <li>Copy the widget URL above</li>
                <li>In Notion, type <code>/embed</code></li>
                <li>Paste the widget URL</li>
                <li>The widget will load in your Notion page</li>
              </ol>
            </div>
          </div>
        </body>
        </html>
      `;
      return new Response(html, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html;charset=UTF-8",
        },
      });
    }

    // 404 for all other routes
    return new Response("Not found", {
      status: 404,
      headers: corsHeaders,
    });
  },
};
