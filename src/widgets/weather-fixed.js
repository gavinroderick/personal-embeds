export async function weatherFixedHandler(request, url) {
  const params = url.searchParams;

  // Default values
  const location = params.get("location") || "leith";
  const label = params.get("label") || "leith, edinburgh";
  const days = params.get("days") || "3";

  // Return the weather widget HTML with proper sizing
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
          overflow: hidden;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
        }
        /* Container with fixed dimensions for the widget */
        .widget-wrapper {
          width: 100%;
          max-width: 400px;
          min-height: 300px;
          padding: 20px;
          box-sizing: border-box;
        }
        /* Ensure the weatherwidget.io container has proper dimensions */
        .weatherwidget-io {
          display: block !important;
          position: relative !important;
          width: 100% !important;
        }
      </style>
    </head>
    <body>
      <div class="widget-wrapper">
        <a class="weatherwidget-io" 
           href="https://forecast7.com/en/55d98n3d17/${location}/" 
           data-label_1="${label}" 
           data-icons="Climacons Animated" 
           data-days="${days}" 
           data-theme="original"
           data-basecolor=""
           data-textcolor=""
           data-highcolor=""
           data-lowcolor=""
           data-suncolor=""
           data-mooncolor=""
           data-cloudcolor=""
           data-cloudfill=""
           data-raincolor=""
           data-snowcolor="">
          ${label}
        </a>
      </div>
      <script>
        // Add a small delay to ensure DOM is ready
        setTimeout(function() {
          !function(d,s,id){
            var js,fjs=d.getElementsByTagName(s)[0];
            if(!d.getElementById(id)){
              js=d.createElement(s);
              js.id=id;
              js.src='https://weatherwidget.io/js/widget.min.js';
              fjs.parentNode.insertBefore(js,fjs);
            }
          }(document,'script','weatherwidget-io-js');
        }, 100);
      </script>
    </body>
    </html>
  `;
}
