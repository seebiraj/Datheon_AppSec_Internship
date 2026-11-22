import { Request, Response, NextFunction } from 'express';
import { CONFIG } from '../config/env';

interface SlidingWindowRecord {
  timestamps: number[];
}

/**
 * Task 3: Sliding Window Rate Limiter
 * Throttles brute-force enumeration, credential stuffing, and automated ID guessing attacks.
 * Conforms to RFC 6585 with standard X-RateLimit headers.
 */
export class SlidingWindowRateLimiter {
  private static store: Map<string, SlidingWindowRecord> = new Map();

  /**
   * Generates Express middleware with custom window and request limits
   */
  public static create(
    windowMs: number = CONFIG.RATE_LIMIT_WINDOW_MS,
    maxRequests: number = CONFIG.RATE_LIMIT_MAX_REQUESTS
  ) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const now = Date.now();
      // Identify client by IP (or session if available)
      const clientKey = (req.ip || req.socket.remoteAddress || 'unknown-client') as string;

      let record = SlidingWindowRateLimiter.store.get(clientKey);
      if (!record) {
        record = { timestamps: [] };
        SlidingWindowRateLimiter.store.set(clientKey, record);
      }

      // Filter out timestamps outside the sliding window
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

      const currentRequests = record.timestamps.length;
      const remaining = Math.max(0, maxRequests - currentRequests - 1);
      const resetTimeSeconds = Math.ceil(
        (record.timestamps.length > 0 ? record.timestamps[0] + windowMs - now : windowMs) / 1000
      );

      // Set standard RFC rate-limiting headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', resetTimeSeconds.toString());

      if (currentRequests >= maxRequests) {
        res.setHeader('Retry-After', resetTimeSeconds.toString());
        res.status(429).json({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests detected from your IP. Automated brute-force parameter guessing throttled.',
          retryAfterSeconds: resetTimeSeconds,
          policy: `${maxRequests} requests per ${windowMs / 1000} seconds`
        });
        return;
      }

      // Record current request timestamp
      record.timestamps.push(now);
      next();
    };
  }

  /**
   * Reset store (useful for automated tests)
   */
  public static reset(): void {
    SlidingWindowRateLimiter.store.clear();
  }
}
