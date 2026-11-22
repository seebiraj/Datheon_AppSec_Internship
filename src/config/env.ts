import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'datheon_appsec_internship_ultra_secure_jwt_secret_2026_xyz!@#',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'datheon_appsec_internship_refresh_secret_2026_secure!@#',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '900s', // 15 minutes
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10), // 10 requests / min
  COOKIE_SECURE: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
  COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE || 'lax') as 'lax' | 'strict' | 'none',
};
