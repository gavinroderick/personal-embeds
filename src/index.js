// Import widget handlers
import { getCacheConfig } from "./cache-config.js";
import { getLogger, logRequestMetric } from "./logger.js";
import { clockHandler } from "./widgets/clock.js";
import { weatherHandler } from "./widgets/weather.js";

// Widget registry - add new widgets here
const widgetHandlers = {
  weather: weatherHandler,
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
    const startTime = Date.now();
    const url = new URL(request.url);
    const path = url.pathname;

    // Initialize logger with execution context
    const logger = getLogger(ctx, env);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Try to get cached response for GET requests
    let cacheStatus = "MISS";
    if (request.method === "GET") {
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), request);
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        cacheStatus = "HIT";
        // Return cached response with cache hit header
        const headers = new Headers(cachedResponse.headers);
        headers.set("X-Cache-Status", cacheStatus);

        // Log the cache hit
        const responseTime = Date.now() - startTime;
        const widgetMatch = path.match(/^\/widget\/([^\/]+)\/?$/);
        logRequestMetric(logger, {
          path,
          widgetType: widgetMatch
            ? widgetMatch[1]
            : path === "/"
              ? "home"
              : "unknown",
          cacheStatus: cacheStatus,
          responseTime,
          statusCode: cachedResponse.status,
        });

        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: headers,
        });
      }
    }

    // Route: /widget/{widgetName}
    const widgetMatch = path.match(/^\/widget\/([^\/]+)\/?$/);
    if (widgetMatch) {
      const widgetName = widgetMatch[1];
      const handler = widgetHandlers[widgetName];

      if (handler) {
        try {
          const widgetHtml = await handler(request, url);
          const cacheSettings = getCacheConfig(widgetName);

          const response = new Response(widgetHtml, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/html;charset=UTF-8",
              "Cache-Control": `public, max-age=${cacheSettings.browserCache}, s-maxage=${cacheSettings.ttl}`,
              "X-Cache-Status": cacheStatus,
            },
          });

          // Cache the response in Cloudflare's edge cache
          if (request.method === "GET" && cacheSettings.ttl > 0) {
            const cache = caches.default;
            const cacheKey = new Request(url.toString(), request);
            ctx.waitUntil(cache.put(cacheKey, response.clone()));
          }

          // Log the successful widget request
          const responseTime = Date.now() - startTime;
          logRequestMetric(logger, {
            path,
            widgetType: widgetName,
            cacheStatus: cacheStatus,
            responseTime,
            statusCode: 200,
          });

          return response;
        } catch (error) {
          // Log the error
          const responseTime = Date.now() - startTime;
          logRequestMetric(logger, {
            path,
            widgetType: widgetName,
            cacheStatus: cacheStatus,
            responseTime,
            statusCode: 500,
            error,
          });

          return new Response(`Error rendering widget: ${error.message}`, {
            status: 500,
            headers: corsHeaders,
          });
        }
      } else {
        // Log 404
        const responseTime = Date.now() - startTime;
        logRequestMetric(logger, {
          path,
          widgetType: widgetName,
          cacheStatus: cacheStatus,
          responseTime,
          statusCode: 404,
        });

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
      const cacheSettings = getCacheConfig("home");
      const response = new Response(html, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": `public, max-age=${cacheSettings.browserCache}, s-maxage=${cacheSettings.ttl}`,
          "X-Cache-Status": cacheStatus,
        },
      });

      // Cache the home page
      if (request.method === "GET" && cacheSettings.ttl > 0) {
        const cache = caches.default;
        const cacheKey = new Request(url.toString(), request);
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }

      // Log home page request
      const responseTime = Date.now() - startTime;
      logRequestMetric(logger, {
        path,
        widgetType: "home",
        cacheStatus: cacheStatus,
        responseTime,
        statusCode: 200,
      });

      return response;
    }

    // 404 for all other routes
    const responseTime = Date.now() - startTime;
    logRequestMetric(logger, {
      path,
      widgetType: "unknown",
      cacheStatus: cacheStatus,
      responseTime,
      statusCode: 404,
    });

    return new Response("Not found", {
      status: 404,
      headers: corsHeaders,
    });
  },
};
