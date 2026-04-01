interface EnvVars {
  APP_NAME: string;
  APP_URL: string;
  API_URL: string;
  BETTER_AUTH_URL: string;
}

const loadEnvVars = (): EnvVars => {
  const requiredVars: (keyof EnvVars)[] = ["APP_NAME", "APP_URL", "API_URL", "BETTER_AUTH_URL"];

  for (const varName of requiredVars) {
    if (!import.meta.env[`VITE_${varName}`]) {
      console.warn(`Environment variable VITE_${varName} is not set. Using default value.`);
    }
  }

  return {
    APP_NAME: import.meta.env.VITE_APP_NAME || "StackKit",
    APP_URL: import.meta.env.VITE_APP_URL || "http://localhost:3000",
    API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    BETTER_AUTH_URL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:5000",
  };
};

export const envVars = loadEnvVars();
