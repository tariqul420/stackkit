import rateLimit from "express-rate-limit";
import { env } from "./env";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isProduction ? 100 : 1000, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
});

export { limiter };
