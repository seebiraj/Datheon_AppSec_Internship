import { Request, Response, NextFunction } from 'express';
import { CryptoSessionManager } from '../utils/cryptoSession';
import { UserSession } from '../types';

// Extend Express Request interface to include session user
declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

/**
 * Task 3: Session Authentication Middleware
 * Validates cryptographically signed session tokens from HTTP-Only cookies
 * (or fallback Bearer header for API integrations).
 */
export const requireSessionAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;

    // 1. Check secure HTTP-Only cookie first (primary defense against XSS token exfiltration)
    if (req.cookies && req.cookies.datheon_access_token) {
      token = req.cookies.datheon_access_token;
    }
    // 2. Check Authorization Bearer header as secondary fallback
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'No valid session token found. Please authenticate via HTTP-Only cookie or Bearer token.'
      });
      return;
    }

    // Cryptographically verify token
    const decodedSession = CryptoSessionManager.verifyAccessToken(token);
    req.user = decodedSession;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: 'INVALID_SESSION',
      message: err.message || 'Session verification failed.'
    });
  }
};
