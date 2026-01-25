import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { authRoutes } from "./features/health/health.route";
import { errorHandler } from "./middlewares/error-handler";
import { notFound } from "./middlewares/not-found";

// app initialization
const app: Application = express();
app.use(express.json());

// security headers
app.use(helmet());

// logging
if (env.isProduction) {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// cors configuration
app.use(cors());

// Home page route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    title: "Welcome to your Express app",
    description:
      "Built with StackKit - A production-ready Express template with TypeScript, security, and best practices.",
    version: "1.0.0",
    docs: "https://github.com/tariqul420/stackkit",
  });
});

// routes
app.use("/api/health", authRoutes);

// unhandled routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
