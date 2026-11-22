import { Router, Request, Response } from 'express';
import { db } from '../../db/store';

const router = Router();

/**
 * ============================================================================
 * VULNERABLE ROUTE IMPLEMENTATION (Task 1: Black-Box Recon & IDOR Target)
 * ============================================================================
 * VULNERABILITY: OWASP API1:2023 - Broken Object Level Authorization (BOLA) / IDOR
 * CWE-639: Authorization Bypass Through User-Controlled Key
 *
 * Flaw: The endpoint directly takes user-supplied identifiers (appId, id, or userId)
 * from the URL query or route parameters and retrieves records blindly from the
 * database without verifying whether the client is authenticated or authorized.
 */

// 1. Blind lookup via route parameter: GET /api/vulnerable/candidates/:id
router.get('/candidates/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // CRITICAL DEFECT: No auth token verification, no session check, no ownership check
  const candidate = db.findByIdBlind(id);

  if (!candidate) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: `Candidate record with ID '${id}' does not exist.`
    });
    return;
  }

  // CRITICAL DEFECT: Leaking full unmasked PII, GPA, and sensitive evaluation notes
  res.status(200).json({
    success: true,
    warning: 'VULNERABLE_ENDPOINT_SIMULATION',
    data: candidate
  });
});

// 2. Blind lookup via query parameter: GET /api/vulnerable/dashboard?appId=DT-2026-001
router.get('/dashboard', (req: Request, res: Response) => {
  const appId = (req.query.appId as string) || (req.query.userId as string);

  if (!appId) {
    res.status(400).json({
      success: false,
      error: 'MISSING_PARAMETER',
      message: 'Query parameter ?appId=... or ?userId=... is required.'
    });
    return;
  }

  // Blind lookup directly queries database using raw user input
  const candidate = db.findByIdBlind(appId);

  if (!candidate) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: `No dashboard found for identifier '${appId}'.`
    });
    return;
  }

  // Returns unauthenticated victim dashboard
  res.status(200).json({
    success: true,
    warning: 'VULNERABLE_ENDPOINT_SIMULATION',
    data: candidate
  });
});

// 3. Blind mass dump: GET /api/vulnerable/all (Mass PII Enumeration)
router.get('/all', (req: Request, res: Response) => {
  const allRecords = db.getAllCandidatesBlind();
  res.status(200).json({
    success: true,
    count: allRecords.length,
    data: allRecords
  });
});

export default router;
