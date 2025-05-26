// Cache configuration per widget type
export const cacheConfig = {
  // Weather widget - cache for 1 hour (weather doesn't change that fast)
  weather: {
    ttl: 3600, // 1 hour - aggressive caching for Notion
    browserCache: 3600, // 1 hour browser cache
  },

  // Clock widget - cache for 30 seconds (balance between updates and invocations)
  clock: {
    ttl: 30, // 30 seconds - more reasonable for Notion embeds
    browserCache: 10, // 10 seconds browser cache
  },

  // Home page - cache for 24 hours
  home: {
    ttl: 86400, // 24 hours
    browserCache: 3600, // 1 hour browser cache
  },

  // Default cache settings
  default: {
    ttl: 300, // 5 minutes
    browserCache: 60, // 1 minute browser cache
  },
};

// Helper to get cache config for a route
export function getCacheConfig(widgetName) {
  return cacheConfig[widgetName] || cacheConfig.default;
}
