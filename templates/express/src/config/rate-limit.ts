import rateLimit from "express-rate-limit";
import { envVars } from "./env";

const windowMs = parseInt(envVars.RATE_LIMIT_WINDOW_MS || "900000", 10);
const maxRequests = parseInt(
  envVars.RATE_LIMIT_MAX_REQUESTS || (envVars.NODE_ENV === "production" ? "100" : "1000"),
  10,
);

const globalLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: envVars.NODE_ENV === "production" ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

export { globalLimiter, authLimiter };
