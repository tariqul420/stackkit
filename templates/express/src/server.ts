import { app } from "./app";
import { env } from "./config/env";

const bootstrap = async () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`Server is running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

bootstrap();
