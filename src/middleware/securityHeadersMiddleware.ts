import { Request, Response, NextFunction } from 'express';
import { SECURITY_HEADERS } from '../config/securityHeaders';

/**
 * Task 4: Security Headers Injection Middleware
 * Enforces zero-trust HTTP response headers across all routes.
 */
export const applySecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(header, value);
  }
  // Disable X-Powered-By to prevent technology fingerprinting
  res.removeHeader('X-Powered-By');
  next();
};
