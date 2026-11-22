/**
 * Datheon Application Security Internship
 * Task 3: Interactive Cryptographic Session & Rate Limiter CLI Demo
 */
import http from 'http';
import { app } from '../src/app';

const PORT = 4001;
const server = app.listen(PORT, async () => {
  console.log(`\n================================================================`);
  console.log(`🛡️  DATHEON APPSEC - TASK 3 CRYPTOGRAPHIC SESSION & RATE LIMITER`);
  console.log(`================================================================`);

  const makeRequest = (options: http.RequestOptions, postData?: string): Promise<{ status: number; headers: any; body: string }> => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, body }));
      });
      req.on('error', reject);
      if (postData) req.write(postData);
      req.end();
    });
  };

  try {
    // Step 1: Login
    console.log('\n[Step 1] Attempting secure login via POST /api/v1/auth/login...');
    const loginPayload = JSON.stringify({
      email: 'jeeviseebi007@gmail.com',
      password: 'CyberSecPass2026!@#'
    });

    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginPayload)
      }
    }, loginPayload);

    console.log(`[+] Status: HTTP ${loginRes.status}`);
    const cookies = loginRes.headers['set-cookie'] || [];
    console.log(`[+] Set-Cookie Headers Received:`);
    cookies.forEach((c: string) => console.log(`    - ${c}`));

    // Extract access cookie
    const accessCookie = cookies.find((c: string) => c.startsWith('datheon_access_token='));

    // Step 2: Access protected route with cookie
    console.log('\n[Step 2] Accessing protected route /api/v1/candidates/DT-2026-TV82L with cookie...');
    const profileRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/candidates/DT-2026-TV82L',
      method: 'GET',
      headers: {
        Cookie: accessCookie
      }
    });
    console.log(`[+] Status: HTTP ${profileRes.status}`);
    console.log(`[+] Response: ${profileRes.body.slice(0, 120)}...`);

    // Step 3: Trigger Sliding Window Rate Limiter
    console.log('\n[Step 3] Simulating automated credential stuffing / brute force attack (6 rapid requests)...');
    for (let i = 1; i <= 6; i++) {
      const res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginPayload)
        }
      }, loginPayload);

      console.log(`    Request #${i}: HTTP ${res.status} | Remaining: ${res.headers['x-ratelimit-remaining'] || 'N/A'}`);
      if (res.status === 429) {
        console.log(`\n🚨 Rate limiter triggered! HTTP 429 Too Many Requests`);
        console.log(`   X-RateLimit-Limit: ${res.headers['x-ratelimit-limit']}`);
        console.log(`   Retry-After: ${res.headers['retry-after']} seconds`);
        console.log(`   Payload: ${res.body}`);
      }
    }

  } catch (err) {
    console.error('Demo error:', err);
  } finally {
    server.close();
    console.log('\n[✓] Demo completed successfully.\n');
  }
});
