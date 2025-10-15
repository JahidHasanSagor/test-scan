/**
 * Caching utility for API routes
 * Provides helpers for setting cache headers and cache durations
 */

export const CACHE_DURATIONS = {
  // Static content that rarely changes
  STATIC: 60 * 60 * 24 * 7, // 7 days
  
  // Featured tools - recomputed frequently
  FEATURED: 60 * 5, // 5 minutes
  
  // Categories - rarely change
  CATEGORIES: 60 * 60, // 1 hour
  
  // Search results - user-specific but can cache
  SEARCH: 60 * 2, // 2 minutes
  
  // Latest/Trending tools - updates frequently
  DYNAMIC: 60 * 3, // 3 minutes
  
  // Tool details - moderate changes
  TOOL_DETAIL: 60 * 10, // 10 minutes
  
  // User-specific data - no cache
  NO_CACHE: 0,
} as const;

export interface CacheOptions {
  maxAge: number;
  staleWhileRevalidate?: number;
  public?: boolean;
  mustRevalidate?: boolean;
}

/**
 * Generate Cache-Control header value
 */
export function getCacheHeader(options: CacheOptions): string {
  const directives: string[] = [];
  
  if (options.maxAge === 0) {
    return 'no-store, no-cache, must-revalidate';
  }
  
  if (options.public !== false) {
    directives.push('public');
  } else {
    directives.push('private');
  }
  
  directives.push(`max-age=${options.maxAge}`);
  
  if (options.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }
  
  if (options.mustRevalidate) {
    directives.push('must-revalidate');
  }
  
  return directives.join(', ');
}

/**
 * Add cache headers to a Response
 */
export function addCacheHeaders(
  response: Response,
  options: CacheOptions
): Response {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', getCacheHeader(options));
  
  // Add ETag for better cache validation
  if (options.maxAge > 0) {
    const etag = `W/"${Date.now()}"`;
    headers.set('ETag', etag);
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Preset cache configurations for common use cases
 */
export const CACHE_PRESETS = {
  featured: {
    maxAge: CACHE_DURATIONS.FEATURED,
    staleWhileRevalidate: 60,
    public: true,
  },
  categories: {
    maxAge: CACHE_DURATIONS.CATEGORIES,
    staleWhileRevalidate: 300,
    public: true,
  },
  search: {
    maxAge: CACHE_DURATIONS.SEARCH,
    staleWhileRevalidate: 30,
    public: true,
  },
  dynamic: {
    maxAge: CACHE_DURATIONS.DYNAMIC,
    staleWhileRevalidate: 60,
    public: true,
  },
  toolDetail: {
    maxAge: CACHE_DURATIONS.TOOL_DETAIL,
    staleWhileRevalidate: 120,
    public: true,
  },
  noCache: {
    maxAge: CACHE_DURATIONS.NO_CACHE,
    public: false,
    mustRevalidate: true,
  },
} as const;