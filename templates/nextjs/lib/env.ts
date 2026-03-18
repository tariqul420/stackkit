interface EnvVars {
  APP_NAME: string;
  APP_URL: string;
  API_URL: string;
}

const loadEnvVars = (): EnvVars => {
  const requiredEnvVars = ["NEXT_PUBLIC_APP_NAME", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_API_URL"];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(`Environment variable ${varName} is required but not defined.`);
    }
  });

  return {
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "App Name",
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  };
};

export const envVars = loadEnvVars();
