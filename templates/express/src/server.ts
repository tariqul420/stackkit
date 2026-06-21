import { Server } from "http";
import { app } from "./app";
import { envVars } from "./config/env";

let server: Server | null = null;

const bootstrap = async () => {
  try {
    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

const shutdown = (signal: string, exitCode: number) => {
  console.log(`${signal} signal received: closing HTTP server`);
  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
    });
  }

  process.exit(exitCode);
};

process.on("SIGTERM", () => shutdown("SIGTERM", 0));

process.on("SIGINT", () => shutdown("SIGINT", 0));

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);

  if (server) {
    server.close(() => {
      console.log("HTTP server closed due to uncaught exception");
    });
  }

  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);

  if (server) {
    server.close(() => {
      console.log("HTTP server closed due to unhandled rejection");
    });
  }

  process.exit(1);
});

bootstrap();
