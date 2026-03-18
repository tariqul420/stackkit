import dotenv from "dotenv";
import status from "http-status";
import path from "path";
import { AppError } from "../shared/errors/app-error";

dotenv.config({ path: path.join(process.cwd(), ".env") });

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  APP_NAME?: string;
  APP_URL: string;
  DATABASE_URL: string;
  CLOUDINARY: {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    CLOUDINARY_UPLOAD_PRESET?: string;
  };
}

const loadEnvVars = (): EnvConfig => {
  const requiredEnvVars = [
    "NODE_ENV",
    "PORT",
    "APP_NAME",
    "APP_URL",
    "DATABASE_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

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
    APP_NAME: process.env.APP_NAME ?? "Your App",
    APP_URL: process.env.APP_URL as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
      CLOUDINARY_UPLOAD_PRESET:
        process.env.CLOUDINARY_UPLOAD_PRESET || undefined,
    },
  };
};

export const envVars = loadEnvVars();
