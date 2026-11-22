import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db/store';
import { SlidingWindowRateLimiter } from '../src/middleware/rateLimiter';

describe('Task 3: Cryptographic Session Security & Rate Limiting Defense', () => {
  beforeEach(() => {
    db.seed();
    SlidingWindowRateLimiter.reset();
  });

  it('SESSION-01: Should establish session with HTTP-Only, SameSite cookies upon successful login', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'jeeviseebi007@gmail.com',
        password: 'CyberSecPass2026!@#'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe('jeeviseebi007@gmail.com');

    // Inspect Set-Cookie headers
    const rawCookies = response.headers['set-cookie'];
    const cookies: string[] = Array.isArray(rawCookies) ? rawCookies : [rawCookies].filter(Boolean) as string[];
    expect(cookies.length).toBeGreaterThan(0);

    const accessTokenCookie = cookies.find((c: string) => c.startsWith('datheon_access_token='));
    expect(accessTokenCookie).toBeDefined();
    expect(accessTokenCookie).toContain('HttpOnly');
    expect(accessTokenCookie).toContain('SameSite=Lax');
  });

  it('SESSION-02: Should reject login with invalid credentials with 401', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'jeeviseebi007@gmail.com',
        password: 'WrongPassword123'
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('INVALID_CREDENTIALS');
  });

  it('SESSION-03: Should reject forged/tampered JWT tokens with 401', async () => {
    const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEwMSIsInJvbGUiOiJhZG1pbiJ9.FORGED_INVALID_SIGNATURE';

    const response = await request(app)
      .get('/api/v1/candidates/DT-2026-TV82L')
      .set('Authorization', `Bearer ${forgedToken}`)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('INVALID_SESSION');
  });

  it('SESSION-04: Should enforce sliding window rate-limiting and return 429 when burst threshold is exceeded', async () => {
    // Threshold is 5 attempts per minute for /api/v1/auth/login
    // Execute 5 rapid requests
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'attacker@evil.com', password: 'guess' });
    }

    // 6th request MUST be throttled
    const blockedResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'attacker@evil.com', password: 'guess' })
      .expect(429);

    expect(blockedResponse.body.success).toBe(false);
    expect(blockedResponse.body.error).toBe('RATE_LIMIT_EXCEEDED');
    expect(blockedResponse.headers['x-ratelimit-limit']).toBe('5');
    expect(blockedResponse.headers['x-ratelimit-remaining']).toBe('0');
    expect(blockedResponse.headers['retry-after']).toBeDefined();
  });

  it('SESSION-05: Should support cryptographic token refresh and rotation', async () => {
    // 1. Initial login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'jeeviseebi007@gmail.com',
        password: 'CyberSecPass2026!@#'
      })
      .expect(200);

    const rawCookies = loginRes.headers['set-cookie'];
    const cookies: string[] = Array.isArray(rawCookies) ? rawCookies : [rawCookies].filter(Boolean) as string[];
    const refreshCookie = cookies.find((c: string) => c.startsWith('datheon_refresh_token='));
    expect(refreshCookie).toBeDefined();

    // 2. Call refresh
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [refreshCookie!])
      .expect(200);

    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.token).toBeDefined();
  });
});
