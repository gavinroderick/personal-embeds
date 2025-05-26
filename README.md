# Personal Embeds Service

A simple, privacy-focused embeddable widget service for Notion dashboards, hosted on Cloudflare Workers.

## Features

- 🔒 Privacy-first: Host your own widgets without third-party tracking
- 🚀 Fast: Powered by Cloudflare Workers edge computing
- 🎨 Extensible: Easy to add new widget types
- 📱 Notion-compatible: Works seamlessly with Notion's embed blocks
- 💾 Smart Caching: Reduces API calls with configurable cache times per widget

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure your Cloudflare account (if not already done):

```bash
npx wrangler login
```

3. Run locally for development:

```bash
npm run dev
```

4. Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Usage in Notion

1. After deploying, visit your worker URL (e.g., `https://personal-embeds.your-subdomain.workers.dev`)
2. Copy the widget URL for the widget you want (e.g., `/widget/weather`)
3. In Notion, type `/embed`
4. Paste the full widget URL
5. The widget will load in your Notion page

## Available Widgets

### Weather Widget

- **URL**: `/widget/weather`
- **Optional Parameters**:
  - `location`: The location identifier (default: "leith")
  - `label`: Display label for the location (default: "leith, edinburgh")
  - `days`: Number of days to show (default: "3")
- **Example**: `/widget/weather?location=london&label=London, UK&days=5`
- **Note**: This widget uses weatherwidget.io for weather data

### Clock Widget

- **URL**: `/widget/clock`
- **Optional Parameters**:
  - `timezone`: IANA timezone (default: "Europe/London")
  - `format`: Time format - "12" or "24" (default: "24")
  - `showDate`: Show date - "true" or "false" (default: "false")
  - `theme`: Widget theme - "light" or "dark" (default: "light")
  - `location`: Location label to display (default: "Leith, Edinburgh")
  - `showLocation`: Show location label - "true" or "false" (default: "true")
- **Example**: `/widget/clock?timezone=America/New_York&format=12&showDate=true&theme=dark&location=New York`

## Adding New Widgets

1. Create a new file in `src/widgets/` (e.g., `src/widgets/clock.js`):

```javascript
export async function clockHandler(request, url) {
  const params = url.searchParams;
  const timezone = params.get("timezone") || "UTC";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        #clock {
          font-size: 2em;
          font-weight: 300;
        }
      </style>
    </head>
    <body>
      <div id="clock"></div>
      <script>
        function updateClock() {
          const now = new Date();
          const options = {
            timeZone: '${timezone}',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          };
          document.getElementById('clock').textContent = 
            now.toLocaleTimeString('en-US', options);
        }
        updateClock();
        setInterval(updateClock, 1000);
      </script>
    </body>
    </html>
  `;
}
```

2. Import and register the handler in `src/index.js`:

```javascript
import { weatherHandler } from "./widgets/weather.js";
import { clockHandler } from "./widgets/clock.js"; // Add this

const widgetHandlers = {
  weather: weatherHandler,
  clock: clockHandler, // Add this
};
```

3. Deploy the changes:

```bash
npm run deploy
```

## Widget Guidelines

When creating widgets:

- Keep them lightweight and fast-loading
- Ensure they work well in iframes
- Include proper responsive design
- Handle errors gracefully
- Consider adding query parameter support for customization

## Caching

The service implements intelligent caching to minimize Cloudflare Workers invocations:

- **Edge Cache**: Responses are cached at Cloudflare's edge locations
- **Browser Cache**: Configurable browser caching per widget type
- **Cache Headers**: Automatic cache status headers (HIT/MISS)

### Default Cache Times:

- Weather widget: 10 minutes (edge), 5 minutes (browser)
- Clock widget: 1 second (minimal caching due to real-time nature)
- Home page: 1 hour (edge), 30 minutes (browser)

You can customize cache times in `src/cache-config.js`.

## Security Considerations

- The service uses permissive CORS headers to work with Notion
- Be cautious about what data you expose through widgets
- Consider adding authentication if hosting sensitive information
- Review third-party scripts before including them in widgets

## Troubleshooting

### Widget not loading in Notion

- Ensure your worker is deployed and accessible
- Check that the URL is correct and includes the full path
- Try refreshing the Notion page
- Check browser console for any errors

### Local development issues

- Make sure you're logged into Cloudflare: `npx wrangler login`
- Check that port 8787 is not in use
- Try clearing your browser cache

## License

MIT
