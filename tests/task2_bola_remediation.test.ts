import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db/store';
import { CryptoSessionManager } from '../src/utils/cryptoSession';

describe('Task 2: Remediating Broken Object Level Authorization (BOLA/IDOR)', () => {
  let userAToken: string;
  let userBToken: string;
  let adminToken: string;

  beforeAll(() => {
    db.seed();

    // User A session: Seebiraj V (DT-2026-TV82L)
    userAToken = CryptoSessionManager.generateAccessToken({
      userId: 'user-101',
      email: 'jeeviseebi007@gmail.com',
      role: 'candidate',
      candidateId: 'DT-2026-TV82L'
    });

    // User B session: Alice Johnson (DT-2026-001)
    userBToken = CryptoSessionManager.generateAccessToken({
      userId: 'user-102',
      email: 'alice.johnson@targetbank.com',
      role: 'candidate',
      candidateId: 'DT-2026-001'
    });

    // Directorate Admin session
    adminToken = CryptoSessionManager.generateAccessToken({
      userId: 'user-admin',
      email: 'directorate@datheon.tech',
      role: 'directorate'
    });
  });

  it('SEC-01: Should reject unauthenticated requests to hardened endpoint with 401 Unauthorized', async () => {
    const response = await request(app)
      .get('/api/v1/candidates/DT-2026-TV82L')
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('AUTHENTICATION_REQUIRED');
  });

  it('SEC-02: Should allow User A to access User A\'s own record (200 OK)', async () => {
    const response = await request(app)
      .get('/api/v1/candidates/DT-2026-TV82L')
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe('DT-2026-TV82L');
    expect(response.body.data.fullName).toBe('Seebiraj V');
  });

  it('SEC-03: Should BLOCK User A attempting to access User B\'s record with HTTP 403 Forbidden (BOLA Defense)', async () => {
    const response = await request(app)
      .get('/api/v1/candidates/DT-2026-001')
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('BOLA_AUTHORIZATION_VIOLATION');
    // Verify no private data is leaked
    expect(response.body.data).toBeUndefined();
  });

  it('SEC-04: Should BLOCK User B attempting to access User A\'s record via query parameter (?appId=...)', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard?appId=DT-2026-TV82L')
      .set('Authorization', `Bearer ${userBToken}`)
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('BOLA_AUTHORIZATION_VIOLATION');
  });

  it('SEC-05: Should allow Directorate Admin to access candidate records for audited evaluations', async () => {
    const response = await request(app)
      .get('/api/v1/candidates/DT-2026-TV82L')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.fullName).toBe('Seebiraj V');
  });

  it('SEC-06: Should return zero stack traces and sanitized error format on non-existent or forbidden entities', async () => {
    const response = await request(app)
      .get('/api/v1/candidates/DT-NONEXISTENT')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('RESOURCE_NOT_FOUND');
    expect(response.body.stack).toBeUndefined();
  });
});
