import morgan from "morgan";
import { env } from "./env";

const logger = env.isProduction ? morgan("combined") : morgan("dev");

export { logger };
