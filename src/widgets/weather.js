export async function weatherHandler(request, url) {
  // You can customize the widget based on query parameters if needed
  // For example: ?location=london&days=5
  const params = url.searchParams;
  
  // Default values
  const location = params.get('location') || 'leith';
  const label = params.get('label') || 'leith, edinburgh';
  const days = params.get('days') || '3';
  
  // Return the weather widget HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        /* Ensure the widget fills the iframe */
        .widget-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
    </head>
    <body>
      <div class="widget-container">
        <a class="weatherwidget-io" 
           href="https://forecast7.com/en/55d98n3d17/${location}/" 
           data-label_1="${label}" 
           data-icons="Climacons Animated" 
           data-days="${days}" 
           data-theme="original">
          ${label}
        </a>
      </div>
      <script>
        !function(d,s,id){
          var js,fjs=d.getElementsByTagName(s)[0];
          if(!d.getElementById(id)){
            js=d.createElement(s);
            js.id=id;
            js.src='https://weatherwidget.io/js/widget.min.js';
            fjs.parentNode.insertBefore(js,fjs);
          }
        }(document,'script','weatherwidget-io-js');
      </script>
    </body>
    </html>
  `;
} 