import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

/**
 * Task 2: Defensive Authorization & Role Guard
 * Enforces role-based permissions and zero-trust perimeter checks.
 */
export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication session context is missing.'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `Access denied. Role '${req.user.role}' lacks requisite privileges.`
      });
      return;
    }

    next();
  };
};

/**
 * Task 2 Defensive Authorization Guard:
 * Cross-references the requested resource identifier against the authenticated session identity.
 * Rejects unauthorized multi-tenant horizontal privilege escalation attempts.
 */
export const enforceObjectLevelAuthorization = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication session required.'
    });
    return;
  }

  // The requested resource ID (e.g., /candidates/:id or ?appId=...)
  const requestedId = req.params.id || (req.query.appId as string) || (req.query.userId as string);

  // Administrative bypass (Audited Directorate Role)
  if (req.user.role === 'admin' || req.user.role === 'directorate') {
    next();
    return;
  }

  // For candidate users: Enforce that requestedId matches session's candidateId or userId
  if (req.user.candidateId && requestedId && req.user.candidateId !== requestedId && req.user.userId !== requestedId) {
    // Return 403 Forbidden or 404 Not Found to prevent ID enumeration
    res.status(403).json({
      success: false,
      error: 'BOLA_AUTHORIZATION_VIOLATION',
      message: 'Forbidden: You do not possess authorization to access or mutate this candidate record.'
    });
    return;
  }

  next();
};
