export async function weatherStyledHandler(request, url) {
  const params = url.searchParams;

  // Default values
  const location = params.get("location") || "leith";
  const label = params.get("label") || "leith, edinburgh";
  const days = params.get("days") || "3";
  const theme = params.get("theme") || "pure"; // pure, original, etc.

  // Return the weather widget HTML with styling fixes
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        body {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
        }
        /* Container for the widget */
        #openweathermap-widget-15 {
          width: 100%;
          max-width: 500px;
        }
      </style>
    </head>
    <body>
      <!-- Using the script tag method which seems to work better -->
      <script id='weatherwidget-io-js' src='https://weatherwidget.io/js/widget.min.js'></script>
      
      <!-- Alternative approach using their embed code directly -->
      <a class="weatherwidget-io" 
         href="https://forecast7.com/en/55d98n3d17/${location}/" 
         data-label_1="${label}" 
         data-font="Roboto" 
         data-icons="Climacons Animated" 
         data-days="${days}" 
         data-theme="${theme}"
         data-basecolor="rgba(255, 255, 255, 0.9)"
         data-accent="rgba(255, 255, 255, 0.9)"
         data-textcolor="#333333"
         data-highcolor="#ff6b6b"
         data-lowcolor="#4a90e2"
         data-suncolor="#ffd93d"
         data-mooncolor="#6c7a89"
         data-cloudcolor="#d3d3d3"
         data-cloudfill="#d3d3d3"
         data-raincolor="#4a90e2"
         data-snowcolor="#ffffff">
        ${label}
      </a>
      
      <script>
        // Force re-initialization after a delay
        window.addEventListener('load', function() {
          setTimeout(function() {
            // Try to trigger the widget initialization
            if (window.__weatherwidget_init) {
              window.__weatherwidget_init();
            }
            
            // Alternative: manually trigger the widget
            var widgets = document.querySelectorAll('.weatherwidget-io');
            if (widgets.length > 0 && window.weatherwidget) {
              widgets.forEach(function(widget) {
                window.weatherwidget.init(widget);
              });
            }
          }, 500);
        });
      </script>
    </body>
    </html>
  `;
}
