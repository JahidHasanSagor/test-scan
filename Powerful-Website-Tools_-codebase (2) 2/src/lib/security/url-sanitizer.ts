/**
 * URL Sanitizer - Prevents XSS and Open Redirect vulnerabilities
 * Sanitizes and validates URLs before using them in href, src, or redirects
 */

/**
 * Sanitizes a URL to prevent XSS attacks
 * Blocks javascript:, data:, vbscript:, and other dangerous protocols
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  
  const trimmedUrl = url.trim();
  
  // Allow empty/anchor links
  if (trimmedUrl === '' || trimmedUrl === '#') return '#';
  
  // Allow relative URLs (starting with /)
  if (trimmedUrl.startsWith('/')) return trimmedUrl;
  
  // Allow hash links
  if (trimmedUrl.startsWith('#')) return trimmedUrl;
  
  // Check for dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ];
  
  const lowerUrl = trimmedUrl.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      console.warn(`Blocked dangerous URL protocol: ${protocol}`);
      return '#';
    }
  }
  
  // Validate absolute URLs
  try {
    const urlObj = new URL(trimmedUrl);
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      console.warn(`Blocked non-HTTP(S) protocol: ${urlObj.protocol}`);
      return '#';
    }
    return trimmedUrl;
  } catch {
    // Invalid URL format, treat as relative
    return trimmedUrl;
  }
}

/**
 * Validates a redirect URL to prevent open redirect vulnerabilities
 * Only allows internal redirects or explicitly whitelisted domains
 */
export function sanitizeRedirectUrl(
  url: string | null | undefined,
  allowedDomains: string[] = []
): string {
  if (!url) return '/';
  
  const trimmedUrl = url.trim();
  
  // Allow relative URLs (internal redirects)
  if (trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('//')) {
    return trimmedUrl;
  }
  
  // Check if it's an absolute URL
  try {
    const urlObj = new URL(trimmedUrl);
    
    // Only allow http and https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      console.warn(`Blocked redirect to non-HTTP(S) URL: ${trimmedUrl}`);
      return '/';
    }
    
    // Check if domain is in allowedDomains
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        console.warn(`Blocked redirect to non-whitelisted domain: ${urlObj.hostname}`);
        return '/';
      }
    } else {
      // If no allowed domains specified, only allow same-origin
      if (typeof window !== 'undefined' && urlObj.origin !== window.location.origin) {
        console.warn(`Blocked redirect to external domain: ${urlObj.hostname}`);
        return '/';
      }
    }
    
    return trimmedUrl;
  } catch {
    // Invalid URL, default to homepage
    console.warn(`Invalid redirect URL format: ${trimmedUrl}`);
    return '/';
  }
}

/**
 * Sanitizes image sources to prevent XSS
 */
export function sanitizeImageSrc(src: string | null | undefined): string {
  if (!src) return '';
  
  const trimmedSrc = src.trim();
  
  // Allow data URLs for base64 images (but validate them)
  if (trimmedSrc.startsWith('data:image/')) {
    // Validate it's actually an image data URL
    const validImageDataUrl = /^data:image\/(png|jpg|jpeg|gif|webp|svg\+xml);base64,/i;
    if (validImageDataUrl.test(trimmedSrc)) {
      return trimmedSrc;
    }
    console.warn('Blocked invalid image data URL');
    return '';
  }
  
  // Use the general URL sanitizer for other cases
  return sanitizeUrl(trimmedSrc);
}

/**
 * Sanitizes a social share URL
 */
export function sanitizeShareUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  const sanitized = sanitizeUrl(url);
  
  // Encode the URL for safe use in query parameters
  return encodeURIComponent(sanitized);
}