import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const env = {
  app: {
    port: Number(process.env.PORT) || 3000,
    url: process.env.APP_URL || 'http://localhost:3000',
    site_url: process.env.SITE_URL || 'http://localhost:5173',
  },
};

export { env };
