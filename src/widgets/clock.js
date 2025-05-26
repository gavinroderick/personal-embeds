export async function clockHandler(request, url) {
  const params = url.searchParams;
  
  // Customizable parameters
  const timezone = params.get('timezone') || 'Europe/London';
  const format = params.get('format') || '24'; // 12 or 24
  const showDate = params.get('showDate') === 'true';
  const theme = params.get('theme') || 'light'; // light or dark
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subTextColor = isDark ? '#cccccc' : '#666666';
  
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
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: ${bgColor};
          color: ${textColor};
        }
        .clock-container {
          text-align: center;
        }
        #time {
          font-size: 3em;
          font-weight: 200;
          letter-spacing: -2px;
          margin: 0;
        }
        #date {
          font-size: 1.2em;
          color: ${subTextColor};
          margin-top: 10px;
          font-weight: 300;
        }
        #timezone {
          font-size: 0.9em;
          color: ${subTextColor};
          margin-top: 5px;
          font-weight: 300;
        }
      </style>
    </head>
    <body>
      <div class="clock-container">
        <div id="time"></div>
        ${showDate ? '<div id="date"></div>' : ''}
        <div id="timezone">${timezone}</div>
      </div>
      <script>
        function updateClock() {
          const now = new Date();
          
          // Time options
          const timeOptions = {
            timeZone: '${timezone}',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: ${format === '12'}
          };
          
          // Update time
          document.getElementById('time').textContent = 
            now.toLocaleTimeString('en-US', timeOptions);
          
          // Update date if enabled
          ${showDate ? `
          const dateOptions = {
            timeZone: '${timezone}',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          };
          document.getElementById('date').textContent = 
            now.toLocaleDateString('en-US', dateOptions);
          ` : ''}
        }
        
        updateClock();
        setInterval(updateClock, 1000);
      </script>
    </body>
    </html>
  `;
} 