import morgan from "morgan";
import { envVars } from "./env";

const httpLogger = envVars.NODE_ENV === "production" ? morgan("combined") : morgan("dev");

const logger = {
  error: (...args: unknown[]) => {
    console.error(`[ERROR] ${new Date().toISOString()}`, ...args);
  },
  info: console.info,
  warn: console.warn,
};

export { httpLogger, logger };
