import compression from "compression";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";

// app initialization
const app: Application = express();
app.use(express.json());

// trust proxy when behind reverse proxy (like Heroku, Vercel, Load Balancers)
if (env.app.trust_proxy) {
  app.set("trust proxy", 1);
}

// security headers
app.use(helmet());

// response compression
app.use(compression());

// rate limiting
const limiter = rateLimit({
  windowMs: env.app.rateLimit.windowMs,
  max: env.app.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// logging
if (env.node.isProduction) {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// cors configuration
app.use(
  cors({
    origin: [env.app.site_url],
    credentials: true,
  }),
);

// Home page route
app.get("/", (req: Request, res: Response) => {
  res.json({
    title: "StackKit - Production-ready project generator",
    description:
      "Modern CLI tool for creating production-ready web applications with modular architecture. Build with Next.js, Express, or React.",
  });
});

// unhandled routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: any = new Error(`Can't find ${req.originalUrl} on this server!`);
  error.status = 404;

  next(error);
});

// Global error handler
app.use(errorHandler);

export default app;
