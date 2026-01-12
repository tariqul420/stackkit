import app from "./app";
import { env } from "./config/env";

const port = env.port;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
