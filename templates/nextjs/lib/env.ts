interface EnvVars {
  APP_NAME: string;
  APP_URL: string;
  API_URL: string;
}

const loadEnvVars = (): EnvVars => {
  const requiredVars: (keyof EnvVars)[] = ["APP_NAME", "APP_URL", "API_URL"];

  for (const varName of requiredVars) {
    if (!process.env[`NEXT_PUBLIC_${varName}`]) {
      console.warn(`Environment variable NEXT_PUBLIC_${varName} is not set. Using default value.`);
    }
  }

  return {
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "App Name",
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  };
};

export const envVars = loadEnvVars();
