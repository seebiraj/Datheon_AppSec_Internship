import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db/store';

describe('Task 4: Public Endpoint Shielding, PII Masking & Automated DAST Pipeline', () => {
  beforeEach(() => {
    db.seed();
  });

  it('SHIELD-01: Should sanitize Personally Identifiable Information (PII) on public verification endpoint', async () => {
    const response = await request(app)
      .get('/api/v1/public/verify/DT-2026-TV82L')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.verificationStatus).toBe('AUTHENTICATED_AND_VALID');

    const data = response.body.data;
    expect(data.id).toBe('DT-2026-TV82L');

    // Email dynamic masking check (jeeviseebi007@gmail.com -> j***7@gmail.com)
    expect(data.email).toBe('j***7@gmail.com');

    // Phone dynamic masking check (+91 98765 43210 -> +91 ******3210)
    expect(data.phone).toBe('+91 ******3210');

    // Name masking check
    expect(data.fullName).toContain('*');

    // Zero-leakage verification: Sensitive internal fields MUST NOT exist in public payload
    expect(data.evaluationNotes).toBeUndefined();
    expect(data.gpa_score).toBeUndefined();
    expect(data.userId).toBeUndefined();
  });

  it('SHIELD-02: Should inject strict HTTP security headers compliant with OWASP recommendations', async () => {
    const response = await request(app).get('/health').expect(200);

    // Verify security headers
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['strict-transport-security']).toContain('max-age=63072000');
    expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");

    // Verify technological fingerprinting header is removed
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('SHIELD-03: Should verify public certificate lookup using cryptographic certificate hash', async () => {
    const response = await request(app)
      .get('/api/v1/public/verify/0x8f2c3d4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe('DT-2026-TV82L');
  });

  it('SHIELD-04: Should return 404 for non-existent public credentials without revealing database details', async () => {
    const response = await request(app)
      .get('/api/v1/public/verify/INVALID-CREDENTIAL-999')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.verified).toBe(false);
    expect(response.body.error).toBe('CREDENTIAL_NOT_FOUND');
  });
});
