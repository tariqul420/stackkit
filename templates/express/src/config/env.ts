import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  APP_NAME: string;
  APP_URL: string;
  FRONTEND_URL: string;
  RATE_LIMIT_WINDOW_MS: string;
  RATE_LIMIT_MAX_REQUESTS: string;
}

const loadEnvVars = (): EnvConfig => {
  return {
    APP_NAME: process.env.APP_NAME || "App Name",
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "5000",
    APP_URL: process.env.APP_URL || "http://localhost:5000",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || "900000",
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || "1000",
  };
};

export const envVars = loadEnvVars();
