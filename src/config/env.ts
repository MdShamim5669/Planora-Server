import dotenv from "dotenv";
import status from "http-status";
import { AppError } from "../errorHelpers/AppError";
import { EnvConfig } from "./config.interface";

dotenv.config();

const loadEnvVariables = (): EnvConfig => {
  const requireEnvVariable = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "CLIENT_URL",
    "SERVER_URL",
    "SSLCZ_STORE_ID",
    "SSLCZ_STORE_PASSWORD",
    "SSLCZ_IS_LIVE",
    "ADMIN_NAME",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
  ];

  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `Environment variable ${variable} is required but not set in .env file.`
      );
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: Number(process.env.PORT) || 5000,
    DATABASE_URL: process.env.DATABASE_URL as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,
    CLIENT_URL: process.env.CLIENT_URL as string,
    SERVER_URL: process.env.SERVER_URL as string,
    SSLCOMMERZ: {
      SSLCZ_STORE_ID: process.env.SSLCZ_STORE_ID as string,
      SSLCZ_STORE_PASSWORD: process.env.SSLCZ_STORE_PASSWORD as string,
      SSLCZ_IS_LIVE: process.env.SSLCZ_IS_LIVE === "true",
    },
    ADMIN: {
      NAME: process.env.ADMIN_NAME as string,
      EMAIL: process.env.ADMIN_EMAIL as string,
      PASSWORD: process.env.ADMIN_PASSWORD as string,
    },
  };
};

export const envVars = loadEnvVariables();

export const env = {
  ...envVars,
  SSLCZ_STORE_ID: envVars.SSLCOMMERZ.SSLCZ_STORE_ID,
  SSLCZ_STORE_PASSWORD: envVars.SSLCOMMERZ.SSLCZ_STORE_PASSWORD,
  SSLCZ_IS_LIVE: envVars.SSLCOMMERZ.SSLCZ_IS_LIVE,
  ADMIN_NAME: envVars.ADMIN.NAME,
  ADMIN_EMAIL: envVars.ADMIN.EMAIL,
  ADMIN_PASSWORD: envVars.ADMIN.PASSWORD,
};

export default envVars;
