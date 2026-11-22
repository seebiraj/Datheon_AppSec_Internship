import { Router, Request, Response } from 'express';
import { db } from '../../db/store';
import { PIIMasker } from '../../utils/piiMasker';
import { SlidingWindowRateLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Throttle public enumeration attempts (e.g. max 15 lookups per minute)
const publicLookupLimiter = SlidingWindowRateLimiter.create(60000, 15);

/**
 * Task 4: Public Credential Verification Endpoint
 * GET /api/v1/public/verify/:credentialId
 * Allows public validation of candidate credentials (e.g. 'DT-2026-TV82L' or hash)
 * Zero-Leakage: All PII is dynamically masked.
 */
router.get('/verify/:credentialId', publicLookupLimiter, (req: Request, res: Response) => {
  const { credentialId } = req.params;

  // Search candidate by application ID
  let candidate = db.findByIdBlind(credentialId);

  // If not found by ID, attempt lookup by certificate hash
  if (!candidate) {
    const all = db.getAllCandidatesBlind();
    candidate = all.find((c) => c.certificateHash.toLowerCase() === credentialId.toLowerCase());
  }

  if (!candidate) {
    res.status(404).json({
      success: false,
      verified: false,
      error: 'CREDENTIAL_NOT_FOUND',
      message: 'The requested credential identifier or verification hash is not present in the Datheon Registry.'
    });
    return;
  }

  // Apply Task 4 PII Masking Engine
  const publicSafeData = PIIMasker.sanitizeForPublicVerification(candidate);

  res.status(200).json({
    success: true,
    registry: 'Datheon Directorate Certified Registry',
    verificationStatus: 'AUTHENTICATED_AND_VALID',
    data: publicSafeData
  });
});

/**
 * Public batch status checker (masked)
 */
router.get('/batch/:batchName', publicLookupLimiter, (req: Request, res: Response) => {
  const { batchName } = req.params;
  const candidates = db.getAllCandidatesBlind().filter(
    (c) => c.batch.toLowerCase() === batchName.toLowerCase()
  );

  const maskedList = candidates.map((c) => PIIMasker.sanitizeForPublicVerification(c));

  res.status(200).json({
    success: true,
    batch: batchName,
    count: maskedList.length,
    candidates: maskedList
  });
});

export default router;
