interface EnvVars {
  APP_URL: string;
  API_URL: string;
}

const loadEnvVars = (): EnvVars => {
  const requiredEnvVars = ["NEXT_PUBLIC_API_URL"];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(`Environment variable ${varName} is required but not defined.`);
    }
  });

  return {
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  };
};

export const envVars = loadEnvVars();
