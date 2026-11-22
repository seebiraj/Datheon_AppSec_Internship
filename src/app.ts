import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { applySecurityHeaders } from './middleware/securityHeadersMiddleware';
import { secureErrorHandler } from './middleware/errorHandler';

// Route imports
import vulnerableRoutes from './routes/vulnerable/candidates';
import hardenedRoutes from './routes/hardened/candidates';
import authRoutes from './routes/auth/authRoutes';
import publicRoutes from './routes/public/verification';

export const createApp = (): Application => {
  const app = express();

  // 1. Enforce strict HTTP security headers across all requests (Task 4)
  app.use(applySecurityHeaders);

  // 2. Standard Parsers
  app.use(express.json({ limit: '10kb' })); // Limit body payload to thwart memory exhaustion DoS
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // 3. Health & Status Check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'Datheon AppSec API Gateway',
      version: '1.0.0'
    });
  });

  // 4. API Endpoints
  // Vulnerable endpoints for Task 1 IDOR demonstration & fuzzing
  app.use('/api/vulnerable', vulnerableRoutes);

  // Hardened zero-trust endpoints for Task 2 BOLA remediation
  app.use('/api/v1', hardenedRoutes);

  // Secure authentication endpoints for Task 3 HTTP-only cookie defense
  app.use('/api/v1/auth', authRoutes);

  // Public shielded verification endpoints for Task 4 PII dynamic masking
  app.use('/api/v1/public', publicRoutes);

  // 5. Catch-all 404 for unknown routes
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'ROUTE_NOT_FOUND',
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`
    });
  });

  // 6. Secure Centralized Error Handler (suppresses stack traces)
  app.use(secureErrorHandler);

  return app;
};

export const app = createApp();
