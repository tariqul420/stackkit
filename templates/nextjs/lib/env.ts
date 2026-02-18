interface EnvVars {
  APP_URL: string;
}

const loadEnvVars = (): EnvVars => {
  const requiredEnvVars = [""];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(`Environment variable ${varName} is required but not defined.`);
    }
  });

  return {
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };
};

export const envVars = loadEnvVars();
