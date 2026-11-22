import { Router, Request, Response } from 'express';
import { db } from '../../db/store';
import { requireSessionAuth } from '../../middleware/sessionAuth';
import { enforceObjectLevelAuthorization } from '../../middleware/authGuard';

const router = Router();

/**
 * ============================================================================
 * HARDENED ROUTE IMPLEMENTATION (Task 2: Zero-Trust BOLA/IDOR Defense)
 * ============================================================================
 * Defenses Applied:
 * 1. requireSessionAuth: Rejects unauthenticated requests with HTTP 401
 * 2. enforceObjectLevelAuthorization: Validates requester identity against requested resource
 * 3. Multi-Tenant Database Query: Filters by BOTH resource ID and session userId/role
 * 4. Error Sanitization: Rejection with HTTP 403/404 without leaking internal traces
 */

// 1. Hardened Route Parameter Lookup: GET /api/v1/candidates/:id
router.get(
  '/candidates/:id',
  requireSessionAuth,
  enforceObjectLevelAuthorization,
  (req: Request, res: Response) => {
    const { id } = req.params;
    const sessionUser = req.user!;

    // Defensive query: Database checks BOTH id and session context
    const candidate = db.findByIdWithOwnership(id, sessionUser.userId, sessionUser.role);

    if (!candidate) {
      // Graceful 404 or 403 preventing object existence enumeration
      res.status(404).json({
        success: false,
        error: 'RESOURCE_NOT_FOUND',
        message: 'The requested resource was not found or you are not authorized to view it.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Authorized access granted.',
      data: candidate
    });
  }
);

// 2. Hardened Dashboard Query Parameter Lookup: GET /api/v1/dashboard?appId=...
router.get(
  '/dashboard',
  requireSessionAuth,
  enforceObjectLevelAuthorization,
  (req: Request, res: Response) => {
    const appId = (req.query.appId as string) || (req.query.userId as string);
    const sessionUser = req.user!;

    if (!appId) {
      res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETER',
        message: 'Query parameter ?appId=... is required.'
      });
      return;
    }

    const candidate = db.findByIdWithOwnership(appId, sessionUser.userId, sessionUser.role);

    if (!candidate) {
      res.status(404).json({
        success: false,
        error: 'RESOURCE_NOT_FOUND',
        message: 'No authorized dashboard found for the given identifier.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Authorized dashboard loaded.',
      data: candidate
    });
  }
);

// 3. Current User's Own Profile (Zero Parameter Requirement - eliminates IDOR surface entirely)
router.get(
  '/me',
  requireSessionAuth,
  (req: Request, res: Response) => {
    const sessionUser = req.user!;

    if (!sessionUser.candidateId) {
      res.status(404).json({
        success: false,
        error: 'NOT_A_CANDIDATE',
        message: 'Your account is not linked to a candidate application.'
      });
      return;
    }

    const candidate = db.findByIdBlind(sessionUser.candidateId);
    res.status(200).json({
      success: true,
      data: candidate
    });
  }
);

export default router;
