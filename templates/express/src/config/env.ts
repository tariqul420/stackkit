import dotenv from "dotenv";
import status from "http-status";
import path from "path";
import { AppError } from "../shared/errors/app-error";

dotenv.config({ path: path.join(process.cwd(), ".env") });

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  FRONTEND_URL?: string;
  isProduction: boolean;
}

const loadEnvVars = (): EnvConfig => {
  const requiredEnvVars = ["NODE_ENV", "PORT", "FRONTEND_URL"];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `Environment variable ${varName} is required but not set in .env file.`,
      );
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    isProduction: process.env.NODE_ENV === "production",
  };
};

export const env = loadEnvVars();
