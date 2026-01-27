import createCors from "cors";
import { env } from "./env";

const origin = env.isProduction
  ? process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
    : false
  : true;

const cors = createCors({ origin });

export { cors };
