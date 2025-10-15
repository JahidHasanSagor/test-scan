/**
 * Input sanitization utilities
 * Prevents XSS and injection attacks
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  // Remove whitespace and convert to lowercase
  email = email.trim().toLowerCase();
  
  // Basic email validation pattern
  const emailPattern = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailPattern.test(email)) {
    throw new Error('Invalid email format');
  }
  
  return email;
}

/**
 * Sanitize username/name input
 */
export function sanitizeName(name: string): string {
  // Remove leading/trailing whitespace
  name = name.trim();
  
  // Remove any HTML tags
  name = name.replace(/<[^>]*>/g, '');
  
  // Remove special characters except basic punctuation
  name = name.replace(/[^\w\s\-.']/g, '');
  
  // Limit length
  if (name.length > 100) {
    name = name.slice(0, 100);
  }
  
  if (name.length === 0) {
    throw new Error('Name cannot be empty');
  }
  
  return name;
}

/**
 * Sanitize general text input
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
  // Remove leading/trailing whitespace
  text = text.trim();
  
  // Remove any HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Limit length
  if (text.length > maxLength) {
    text = text.slice(0, maxLength);
  }
  
  return text;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
  url = url.trim();
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    
    return parsedUrl.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Remove SQL injection patterns (as a precaution)
 * Note: Using parameterized queries (like Drizzle ORM) is the primary defense
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/i,
    /(-{2}|\/\*|\*\/)/,  // SQL comments
    /(;|\||&)/,  // Command separators
    /('|")/,  // Quotes (basic check)
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Comprehensive input validation for auth forms
 */
export interface SanitizedAuthInput {
  email: string;
  password: string;
  name?: string;
}

export function sanitizeAuthInput(input: {
  email: string;
  password: string;
  name?: string;
}): SanitizedAuthInput {
  const sanitized: SanitizedAuthInput = {
    email: sanitizeEmail(input.email),
    password: input.password, // Don't sanitize password (users might use special chars)
  };
  
  if (input.name) {
    sanitized.name = sanitizeName(input.name);
  }
  
  // Check for SQL injection attempts
  if (detectSqlInjection(input.email) || (input.name && detectSqlInjection(input.name))) {
    throw new Error('Invalid input detected');
  }
  
  return sanitized;
}