import { Request, Response, NextFunction } from 'express';

/**
 * Task 2 & 4: Secure Defensive Error Handler
 * Suppresses internal stack traces, DB queries, and server internals from API responses.
 */
export const secureErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log internally for security operations center (SOC) monitoring
  const timestamp = new Date().toISOString();
  console.error(`[SECURITY ERROR LOG - ${timestamp}] Path: ${req.method} ${req.originalUrl}`);
  console.error(`Client IP: ${req.ip}`);
  console.error(`Error Details:`, err.message || err);

  const statusCode = err.statusCode || err.status || 500;

  // Sanitized client response: Zero internal leaks
  res.status(statusCode).json({
    success: false,
    error: err.code || 'INTERNAL_SERVER_ERROR',
    message: statusCode >= 500 ? 'An unexpected server error occurred. Please contact the security administrator.' : err.message,
    timestamp
  });
};
