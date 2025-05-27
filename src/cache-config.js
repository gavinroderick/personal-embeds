// Cache configuration per widget type
export const cacheConfig = {
  // Weather widget - static HTML/JS that fetches data client-side
  weather: {
    ttl: 604800, // 7 days - it's just static code
    browserCache: 86400, // 24 hours browser cache
  },

  // Clock widget - static HTML/JS that runs entirely client-side
  clock: {
    ttl: 604800, // 7 days - it's just static code
    browserCache: 86400, // 24 hours browser cache
  },

  // Home page - cache for 24 hours
  home: {
    ttl: 86400, // 24 hours
    browserCache: 3600, // 1 hour browser cache
  },

  // Default cache settings
  default: {
    ttl: 86400, // 24 hours
    browserCache: 3600, // 1 hour browser cache
  },
};

// Helper to get cache config for a route
export function getCacheConfig(widgetName) {
  return cacheConfig[widgetName] || cacheConfig.default;
}
