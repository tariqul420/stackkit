import rateLimit from "express-rate-limit";
import { envVars } from "./env";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: envVars.NODE_ENV === "production" ? 100 : 1000, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
});

export { limiter };
