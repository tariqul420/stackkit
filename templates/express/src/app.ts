import express, { Application, Request, Response } from "express";
import { cors } from "./config/cors";
import { helmet } from "./config/helmet";
import { logger } from "./config/logger";
import { limiter } from "./config/rate-limit";
import { errorHandler } from "./middlewares/error.middleware";
import { notFound } from "./middlewares/not-found.middleware";
import { authRoutes } from "./modules/health/health.route";

// app initialization
const app: Application = express();
app.use(express.json());

app.use(helmet);
app.use(logger);
app.use(cors);
app.use(limiter);

// trust proxy when behind proxies (load balancers)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

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
