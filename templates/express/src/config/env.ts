import dotenv from "dotenv";
import status from "http-status";
import path from "path";
import { AppError } from "../shared/errors/app-error";

dotenv.config({ path: path.join(process.cwd(), ".env") });

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  APP_NAME: string;
  APP_URL: string;
  FRONTEND_URL: string;
}

const loadEnvVars = (): EnvConfig => {
  const requiredEnvVars = ["NODE_ENV", "PORT", "APP_NAME", "APP_URL", "FRONTEND_URL"];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `Environment variable ${varName} is required but not set in .env file.`,
      );
    }
  });

  return {
    APP_NAME: process.env.APP_NAME || "App Name",
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "3000",
    APP_URL: process.env.APP_URL || "http://localhost:5000",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  };
};

export const envVars = loadEnvVars();
