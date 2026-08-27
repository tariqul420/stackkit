import { Server } from "http";
import { app } from "./app";
import { envVars } from "./config/env";
import { logger } from "./config/logger";

let server: Server | null = null;

const bootstrap = async () => {
  try {
    server = app.listen(envVars.PORT, () => {
      logger.info(`Server is running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
  }
};

const shutdown = (signal: string, exitCode: number) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
    });
  }

  process.exit(exitCode);
};

process.on("SIGTERM", () => shutdown("SIGTERM", 0));

process.on("SIGINT", () => shutdown("SIGINT", 0));

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);

  if (server) {
    server.close(() => {
      logger.info("HTTP server closed due to uncaught exception");
    });
  }

  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);

  if (server) {
    server.close(() => {
      logger.info("HTTP server closed due to unhandled rejection");
    });
  }

  process.exit(1);
});

bootstrap();
