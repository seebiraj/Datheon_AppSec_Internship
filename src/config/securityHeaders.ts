/**
 * Strict Security Headers Configuration (Task 4: Zero-Trust Public Shielding)
 * Compliant with OWASP Secure Headers Project & REST Security Cheat Sheet
 */
export const SECURITY_HEADERS: Record<string, string> = {
  // Prevent MIME-sniffing attacks
  'X-Content-Type-Options': 'nosniff',

  // Prevent Clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Enable XSS filtering in legacy browsers
  'X-XSS-Protection': '1; mode=block',

  // Enforce HTTPS and preload flag for 2 years (63072000s)
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  // Control referrer information leakage
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Restrict features & browser APIs
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',

  // Restrict Adobe Flash and PDF domain execution
  'X-Permitted-Cross-Domain-Policies': 'none',

  // Robust Content Security Policy (Zero inline scripts, strict self origin)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
};
