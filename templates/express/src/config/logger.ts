import morgan from "morgan";
import { envVars } from "./env";

const logger = envVars.NODE_ENV === "production" ? morgan("combined") : morgan("dev");

export { logger };
