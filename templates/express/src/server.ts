import app from "./app";
import { env } from "./config/env";

const port = env.app.port;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
