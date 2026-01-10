import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const env = {
  app: {
    port: Number(process.env.PORT) || 3000,
    url: process.env.APP_URL || 'http://localhost:3000',
    site_url: process.env.SITE_URL || 'http://localhost:5173',
    trust_proxy: (process.env.TRUST_PROXY || 'false') === 'true',
    rateLimit: {
      max: Number(process.env.RATE_LIMIT_MAX) || 100,
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    },
  },
  node: {
    env: process.env.NODE_ENV || 'development',
    isProduction: (process.env.NODE_ENV || 'development') === 'production',
  },
};

export { env };
