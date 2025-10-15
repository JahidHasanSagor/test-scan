/**
 * Rate Limiter for API endpoints
 * Prevents brute force attacks by limiting requests per IP
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lockoutUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutDurationMs?: number;
}

const configs: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutDurationMs: 30 * 60 * 1000, // 30 minutes lockout
  },
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    lockoutDurationMs: 60 * 60 * 1000, // 1 hour lockout
  },
  api: {
    maxAttempts: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
};

function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers (for proxy/load balancer setups)
  const headers = request.headers;
  const forwarded = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  
  // Include user agent for additional fingerprinting
  const userAgent = headers.get('user-agent') || 'unknown';
  
  return `${ip}-${userAgent.slice(0, 50)}`;
}

function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now && (!entry.lockoutUntil || entry.lockoutUntil < now)) {
      rateLimitStore.delete(key);
    }
  }
}

export function checkRateLimit(
  request: Request,
  type: keyof typeof configs = 'api'
): { allowed: boolean; remaining: number; resetTime: number; isLockedOut: boolean } {
  const config = configs[type];
  const identifier = getClientIdentifier(request);
  const key = `${type}-${identifier}`;
  const now = Date.now();

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  const entry = rateLimitStore.get(key);

  // Check if locked out
  if (entry?.lockoutUntil && entry.lockoutUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.lockoutUntil,
      isLockedOut: true,
    };
  }

  // Reset if window expired
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs,
      isLockedOut: false,
    };
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > config.maxAttempts) {
    // Apply lockout if configured
    if (config.lockoutDurationMs) {
      entry.lockoutUntil = now + config.lockoutDurationMs;
    }
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.lockoutUntil || entry.resetTime,
      isLockedOut: !!config.lockoutDurationMs,
    };
  }

  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetTime: entry.resetTime,
    isLockedOut: false,
  };
}

export function recordFailedAttempt(request: Request, type: keyof typeof configs): void {
  checkRateLimit(request, type);
}

export function resetRateLimit(request: Request, type: keyof typeof configs): void {
  const identifier = getClientIdentifier(request);
  const key = `${type}-${identifier}`;
  rateLimitStore.delete(key);
}