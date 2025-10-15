// Sentry error monitoring configuration
// Install: npm install @sentry/nextjs

interface SentryConfig {
  dsn?: string;
  environment: string;
  tracesSampleRate: number;
  debug: boolean;
}

export const sentryConfig: SentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
};

// Capture exception helper
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production' && sentryConfig.dsn) {
    // In production with Sentry configured, this would use Sentry
    // For now, log to console with context
    console.error('[Sentry]', error, context);
  } else {
    console.error('[Error]', error, context);
  }
}

// Capture message helper
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'production' && sentryConfig.dsn) {
    console[level]('[Sentry]', message);
  }
}