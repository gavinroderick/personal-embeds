import { Logtail } from "@logtail/edge";

let logger = null;

export function getLogger(ctx, env) {
  const BETTERSTACK_SOURCE_TOKEN = env?.BETTERSTACK_SOURCE_TOKEN;

  if (!BETTERSTACK_SOURCE_TOKEN) {
    // Return a no-op logger if no token is configured
    return {
      info: () => {},
      error: () => {},
      warn: () => {},
      debug: () => {},
    };
  }

  if (!logger) {
    logger = new Logtail(BETTERSTACK_SOURCE_TOKEN, {
      endpoint: "https://s1324901.eu-nbg-2.betterstackdata.com",
    });
  }

  // Return logger with execution context
  return logger.withExecutionContext(ctx);
}

// Helper function to log request metrics
export function logRequestMetric(
  logger,
  { path, widgetType, cacheStatus, responseTime, statusCode, error = null }
) {
  const isInvocation = cacheStatus === "MISS";

  const logData = {
    metric: "widget_request",
    path,
    widget_type: widgetType || "home",
    cache_status: cacheStatus,
    is_invocation: isInvocation,
    response_time_ms: responseTime,
    status_code: statusCode,
    timestamp: new Date().toISOString(),
  };

  try {
    if (error) {
      logger.error("Widget request error", {
        ...logData,
        error: error.message,
        error_stack: error.stack,
      });
    } else if (statusCode >= 400) {
      logger.warn("Widget request failed", logData);
    } else {
      logger.info("Widget request", logData);
    }
  } catch (logError) {
    // Silently fail if logging fails (e.g., unauthorized)
    // This prevents logging errors from breaking the application
    if (logError.message !== "Unauthorized") {
      console.error("Failed to send log to BetterStack:", logError.message);
    }
  }
}
