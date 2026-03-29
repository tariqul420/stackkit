interface EnvVars {
  APP_NAME: string;
  APP_URL: string;
  API_URL: string;
  BETTER_AUTH_URL: string;
  JWT_ACCESS_SECRET: string;
}

const loadEnvVars = (): EnvVars => {
  const requiredVars: (keyof EnvVars)[] = [
    "APP_NAME",
    "APP_URL",
    "API_URL",
    "BETTER_AUTH_URL",
    "JWT_ACCESS_SECRET",
  ];

  for (const varName of requiredVars) {
    if (!process.env[`NEXT_PUBLIC_${varName}`]) {
      console.warn(
        `Environment variable NEXT_PUBLIC_${varName} is not set. Using default value.`,
      );
    }
  }

  return {
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "App Name",
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
  };
};

export const envVars = loadEnvVars();
