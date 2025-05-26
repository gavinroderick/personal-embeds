export async function weatherSimpleHandler(request, url) {
  const params = url.searchParams;

  // Parameters
  const city = params.get("city") || "Edinburgh";
  const units = params.get("units") || "metric"; // metric or imperial
  const theme = params.get("theme") || "light";

  const isDark = theme === "dark";
  const bgColor = isDark ? "#1a1a1a" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const subTextColor = isDark ? "#cccccc" : "#666666";

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
          background-color: ${bgColor};
          color: ${textColor};
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .weather-container {
          text-align: center;
          padding: 20px;
          border-radius: 10px;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
        }
        .city {
          font-size: 1.5em;
          font-weight: 300;
          margin-bottom: 10px;
        }
        .temp {
          font-size: 3em;
          font-weight: 200;
          margin: 10px 0;
        }
        .description {
          font-size: 1.1em;
          color: ${subTextColor};
          text-transform: capitalize;
          margin: 10px 0;
        }
        .details {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
          font-size: 0.9em;
          color: ${subTextColor};
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .detail-label {
          font-size: 0.8em;
          margin-top: 5px;
        }
        .weather-icon {
          font-size: 4em;
          margin: 10px 0;
        }
        .loading {
          color: ${subTextColor};
        }
        .error {
          color: #ff6b6b;
          padding: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="weather-container" id="weather">
        <div class="loading">Loading weather data...</div>
      </div>
      
      <script>
        const city = '${city}';
        const units = '${units}';
        const unitSymbol = units === 'metric' ? '°C' : '°F';
        
        // Weather icon mapping
        const weatherIcons = {
          '01d': '☀️', '01n': '🌙',
          '02d': '⛅', '02n': '☁️',
          '03d': '☁️', '03n': '☁️',
          '04d': '☁️', '04n': '☁️',
          '09d': '🌧️', '09n': '🌧️',
          '10d': '🌦️', '10n': '🌧️',
          '11d': '⛈️', '11n': '⛈️',
          '13d': '❄️', '13n': '❄️',
          '50d': '🌫️', '50n': '🌫️'
        };
        
        async function fetchWeather() {
          try {
            // Using OpenWeatherMap free tier API
            // Note: In production, you should use your own API key and proxy through your worker
            const apiKey = 'demo'; // This is a demo key with limited requests
            const response = await fetch(\`https://api.openweathermap.org/data/2.5/weather?q=\${city}&units=\${units}&appid=\${apiKey}\`);
            
            if (!response.ok) {
              throw new Error('Weather data not available');
            }
            
            const data = await response.json();
            displayWeather(data);
          } catch (error) {
            // Fallback to mock data for demo purposes
            displayMockWeather();
          }
        }
        
        function displayWeather(data) {
          const iconCode = data.weather[0].icon;
          const icon = weatherIcons[iconCode] || '🌡️';
          
          document.getElementById('weather').innerHTML = \`
            <div class="city">\${data.name}</div>
            <div class="weather-icon">\${icon}</div>
            <div class="temp">\${Math.round(data.main.temp)}\${unitSymbol}</div>
            <div class="description">\${data.weather[0].description}</div>
            <div class="details">
              <div class="detail-item">
                <div>💨</div>
                <div class="detail-label">\${data.wind.speed} \${units === 'metric' ? 'm/s' : 'mph'}</div>
              </div>
              <div class="detail-item">
                <div>💧</div>
                <div class="detail-label">\${data.main.humidity}%</div>
              </div>
              <div class="detail-item">
                <div>🌡️</div>
                <div class="detail-label">\${Math.round(data.main.feels_like)}\${unitSymbol}</div>
              </div>
            </div>
          \`;
        }
        
        function displayMockWeather() {
          // Mock data for demo when API is not available
          const mockData = {
            name: city,
            weather: [{ description: 'partly cloudy', icon: '02d' }],
            main: { temp: 18, feels_like: 17, humidity: 65 },
            wind: { speed: 3.5 }
          };
          displayWeather(mockData);
        }
        
        // Fetch weather on load
        fetchWeather();
        
        // Refresh every 10 minutes
        setInterval(fetchWeather, 600000);
      </script>
    </body>
    </html>
  `;
}
