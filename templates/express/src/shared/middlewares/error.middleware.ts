import { ErrorRequestHandler } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import { logger } from "../../config/logger";
import { AppError } from "../errors/app-error";

type ErrorResponse = {
  success: false;
  message: string;
  stack?: string;
};

const errorHandler: ErrorRequestHandler = (err, _req, res) => {
  const isDevelopment = envVars.NODE_ENV === "development";

  logger.error("Global Error Handler:", err);

  let statusCode: number;
  let message: string;
  let stack: string | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message || "Internal Server Error";
    stack = err.stack;
  } else {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = "Internal Server Error";
    stack = undefined;
  }

  const errorResponse: ErrorResponse = {
    success: false,
    message,
    stack: isDevelopment ? stack : undefined,
  };

  res.status(statusCode).json(errorResponse);
};

export const globalErrorHandler = errorHandler;
