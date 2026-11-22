import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db/store';

describe('Task 1: Black-Box Reconnaissance & URL Parameter Fuzzing (IDOR Discovery)', () => {
  beforeEach(() => {
    db.seed();
  });

  it('VULN-01: Should expose PII to completely unauthenticated requests via query parameter (?appId=...)', async () => {
    // Attack scenario: No cookie, no authorization header
    const response = await request(app)
      .get('/api/vulnerable/dashboard?appId=DT-2026-001')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();

    // Verifying sensitive PII leak
    expect(response.body.data.fullName).toBe('Alice Johnson');
    expect(response.body.data.email).toBe('alice.johnson@targetbank.com');
    expect(response.body.data.phone).toBe('+1 (555) 234-5678');
    expect(response.body.data.evaluationNotes).toContain('Confidential review');
  });

  it('VULN-02: Should demonstrate horizontal IDOR parameter fuzzing by changing ID to victim candidate', async () => {
    // Attacker probes candidate DT-2026-002 (Bob Miller)
    const response = await request(app)
      .get('/api/vulnerable/candidates/DT-2026-002')
      .expect(200);

    expect(response.body.data.fullName).toBe('Bob Miller');
    expect(response.body.data.email).toBe('bob.miller@enterprise.io');
    expect(response.body.data.evaluationNotes).toContain('Confidential salary negotiation');
  });

  it('VULN-03: Should return 404 cleanly when fuzzing non-existent candidate ID', async () => {
    const response = await request(app)
      .get('/api/vulnerable/candidates/DT-9999-NONEXISTENT')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('NOT_FOUND');
  });
});
