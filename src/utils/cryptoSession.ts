import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { CONFIG } from '../config/env';
import { UserSession, AuthTokens } from '../types';

/**
 * Task 3: Cryptographic Session Security Engine
 * Replaces insecure client-side localStorage with cryptographically signed,
 * tamper-proof, HTTP-Only, Secure, SameSite cookies with automated token rotation.
 */
export class CryptoSessionManager {
  /**
   * Signs a stateless HMAC-SHA256 JWT access token
   */
  public static generateAccessToken(session: UserSession): string {
    const payload = {
      userId: session.userId,
      email: session.email,
      role: session.role,
      candidateId: session.candidateId
    };

    const options: SignOptions = {
      expiresIn: CONFIG.JWT_EXPIRES_IN as any,
      algorithm: 'HS256',
      issuer: 'datheon.security.directorate',
      audience: 'datheon.appsec.candidates'
    };

    return jwt.sign(payload, CONFIG.JWT_SECRET, options);
  }

  /**
   * Signs a long-lived refresh token for automated cryptographic rotation
   */
  public static generateRefreshToken(session: UserSession): string {
    const payload = {
      userId: session.userId,
      tokenFamily: `family_${Date.now()}`
    };

    const options: SignOptions = {
      expiresIn: CONFIG.JWT_REFRESH_EXPIRES_IN as any,
      algorithm: 'HS256',
      issuer: 'datheon.security.directorate'
    };

    return jwt.sign(payload, CONFIG.JWT_REFRESH_SECRET, options);
  }

  /**
   * Generates token pair for full session establishment
   */
  public static generateTokenPair(session: UserSession): AuthTokens {
    return {
      accessToken: this.generateAccessToken(session),
      refreshToken: this.generateRefreshToken(session)
    };
  }

  /**
   * Cryptographically verifies the access token and checks expiry
   */
  public static verifyAccessToken(token: string): UserSession {
    try {
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'datheon.security.directorate',
        audience: 'datheon.appsec.candidates'
      }) as UserSession;

      return decoded;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new Error('AUTH_TOKEN_EXPIRED: The session token has expired. Please refresh.');
      }
      throw new Error('AUTH_TOKEN_INVALID: Cryptographic signature verification failed.');
    }
  }

  /**
   * Cryptographically verifies refresh token during rotation
   */
  public static verifyRefreshToken(token: string): { userId: string; tokenFamily: string } {
    try {
      const decoded = jwt.verify(token, CONFIG.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
        issuer: 'datheon.security.directorate'
      }) as { userId: string; tokenFamily: string };

      return decoded;
    } catch (err: any) {
      throw new Error('REFRESH_TOKEN_INVALID: Invalid or tampered refresh token.');
    }
  }

  /**
   * Attaches secure HTTP-Only cookies to the Express response
   * Flags:
   * - httpOnly: true (Shields against XSS document.cookie exfiltration)
   * - secure: boolean (Enforces transmission over TLS/HTTPS)
   * - sameSite: 'lax' | 'strict' (Shields against Cross-Site Request Forgery - CSRF)
   * - path: '/'
   */
  public static attachSessionCookies(res: Response, tokens: AuthTokens): void {
    // Access token cookie (15 min lifespan)
    res.cookie('datheon_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: CONFIG.COOKIE_SECURE,
      sameSite: CONFIG.COOKIE_SAME_SITE,
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    // Refresh token cookie (7 days lifespan)
    res.cookie('datheon_refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: CONFIG.COOKIE_SECURE,
      sameSite: CONFIG.COOKIE_SAME_SITE,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth/refresh' // Scoped strictly to refresh endpoint
    });
  }

  /**
   * Clear session cookies upon secure logout
   */
  public static clearSessionCookies(res: Response): void {
    res.clearCookie('datheon_access_token', { path: '/' });
    res.clearCookie('datheon_refresh_token', { path: '/api/v1/auth/refresh' });
  }
}
