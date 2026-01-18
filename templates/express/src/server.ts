import app from "./app";
import { env } from "./config/env";

async function startServer() {
  const port = env.port;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
