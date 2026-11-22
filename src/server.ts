import { app } from './app';
import { CONFIG } from './config/env';

const server = app.listen(CONFIG.PORT, () => {
  console.log('================================================================');
  console.log('🛡️  DATHEON APPLICATION SECURITY & API PENTESTING GATEWAY');
  console.log(`🚀 Server running on: http://localhost:${CONFIG.PORT}`);
  console.log(`🔒 Mode: ${CONFIG.NODE_ENV}`);
  console.log('----------------------------------------------------------------');
  console.log('📍 [Task 1 Target] Vulnerable Route: /api/vulnerable/dashboard?appId=DT-2026-001');
  console.log('📍 [Task 2 Guard]  Hardened Route:   /api/v1/candidates/:id');
  console.log('📍 [Task 3 Auth]   Secure Auth:      /api/v1/auth/login');
  console.log('📍 [Task 4 Shield] Public Masked:    /api/v1/public/verify/DT-2026-TV82L');
  console.log('================================================================');
});

export default server;
