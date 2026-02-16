import createCors from "cors";
import { env } from "./env";

const origin = [env.FRONTEND_URL as string, "http://localhost:3000"];

const cors = createCors({
  origin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

export { cors };
