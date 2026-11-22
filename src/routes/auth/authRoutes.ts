import { Router, Request, Response } from 'express';
import { db } from '../../db/store';
import { CryptoSessionManager } from '../../utils/cryptoSession';
import { SlidingWindowRateLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Apply sliding window rate limiter (e.g. 5 attempts / min) to prevent brute force
const loginRateLimiter = SlidingWindowRateLimiter.create(60000, 5);

/**
 * Task 3: POST /api/v1/auth/login
 * Verifies credentials, signs HMAC-SHA256 tokens, and sets HTTP-Only, Secure, SameSite cookies.
 */
router.post('/login', loginRateLimiter, (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: 'MISSING_CREDENTIALS',
      message: 'Email and password are required.'
    });
    return;
  }

  const user = db.findUserByEmail(email);

  // Constant-time check or uniform error response to prevent user enumeration
  if (!user || user.passwordHash !== password) {
    res.status(401).json({
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.'
    });
    return;
  }

  // Generate cryptographic token pair
  const tokens = CryptoSessionManager.generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
    candidateId: user.candidateId
  });

  // Attach HTTP-Only, Secure, SameSite cookie
  CryptoSessionManager.attachSessionCookies(res, tokens);

  res.status(200).json({
    success: true,
    message: 'Authentication successful. Secure session cookie established.',
    user: {
      userId: user.id,
      email: user.email,
      role: user.role,
      candidateId: user.candidateId
    },
    // Also provide access token in JSON body for headless API consumers
    token: tokens.accessToken
  });
});

/**
 * Task 3: POST /api/v1/auth/refresh
 * Cryptographic token rotation: Exchanges refresh token for new access token
 */
router.post('/refresh', (req: Request, res: Response) => {
  const refreshToken = req.cookies?.datheon_refresh_token || req.body?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: 'REFRESH_TOKEN_REQUIRED',
      message: 'No refresh token provided in HTTP-Only cookie or payload.'
    });
    return;
  }

  try {
    const verified = CryptoSessionManager.verifyRefreshToken(refreshToken);
    const user = db.findUserById(verified.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Subject associated with session no longer exists.'
      });
      return;
    }

    // Rotate tokens
    const newTokens = CryptoSessionManager.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
      candidateId: user.candidateId
    });

    CryptoSessionManager.attachSessionCookies(res, newTokens);

    res.status(200).json({
      success: true,
      message: 'Session token refreshed and rotated successfully.',
      token: newTokens.accessToken
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: 'INVALID_REFRESH_TOKEN',
      message: err.message
    });
  }
});

/**
 * POST /api/v1/auth/logout
 * Clears secure session cookies
 */
router.post('/logout', (req: Request, res: Response) => {
  CryptoSessionManager.clearSessionCookies(res);
  res.status(200).json({
    success: true,
    message: 'Session terminated. Cookies destroyed.'
  });
});

export default router;
