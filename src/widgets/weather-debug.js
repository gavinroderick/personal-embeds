export async function weatherDebugHandler(request, url) {
  const params = url.searchParams;

  // Default values
  const location = params.get("location") || "leith";
  const label = params.get("label") || "leith, edinburgh";
  const days = params.get("days") || "3";

  // Return the weather widget HTML with debug info
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f5f5f5;
        }
        .debug-info {
          background: #e8f4f8;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .widget-container {
          background: white;
          padding: 20px;
          border-radius: 5px;
          min-height: 200px;
          position: relative;
        }
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #666;
        }
        #error-message {
          color: red;
          margin-top: 10px;
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="debug-info">
        <strong>Debug Info:</strong><br>
        Location: ${location}<br>
        Label: ${label}<br>
        Days: ${days}<br>
        <span id="status">Status: Loading widget...</span>
      </div>
      
      <div class="widget-container">
        <div class="loading" id="loading">Loading weather widget...</div>
        <a class="weatherwidget-io" 
           href="https://forecast7.com/en/55d98n3d17/${location}/" 
           data-label_1="${label}" 
           data-icons="Climacons Animated" 
           data-days="${days}" 
           data-theme="original">
          ${label}
        </a>
        <div id="error-message"></div>
      </div>
      
      <script>
        // Debug logging
        console.log('Weather widget debug page loaded');
        
        // Update status
        function updateStatus(message) {
          document.getElementById('status').textContent = 'Status: ' + message;
          console.log('Status:', message);
        }
        
        // Show error
        function showError(message) {
          document.getElementById('error-message').style.display = 'block';
          document.getElementById('error-message').textContent = 'Error: ' + message;
          document.getElementById('loading').style.display = 'none';
        }
        
        // Track widget loading
        let widgetLoadTimeout = setTimeout(() => {
          updateStatus('Widget load timeout - checking if script loaded...');
          if (typeof weatherwidget === 'undefined') {
            showError('Weather widget script failed to load. This might be due to ad blockers or network issues.');
          }
        }, 5000);
        
        // Load the weather widget script
        updateStatus('Loading weather widget script...');
        
        !function(d,s,id){
          var js,fjs=d.getElementsByTagName(s)[0];
          if(!d.getElementById(id)){
            js=d.createElement(s);
            js.id=id;
            js.src='https://weatherwidget.io/js/widget.min.js';
            js.onload = function() {
              updateStatus('Weather widget script loaded successfully!');
              document.getElementById('loading').style.display = 'none';
              clearTimeout(widgetLoadTimeout);
            };
            js.onerror = function() {
              updateStatus('Failed to load weather widget script');
              showError('Could not load weatherwidget.io script. Check your internet connection.');
              clearTimeout(widgetLoadTimeout);
            };
            fjs.parentNode.insertBefore(js,fjs);
          }
        }(document,'script','weatherwidget-io-js');
      </script>
    </body>
    </html>
  `;
}
