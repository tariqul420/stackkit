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

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
    });
  }

  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
    });
  }

  process.exit(0);
});

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
