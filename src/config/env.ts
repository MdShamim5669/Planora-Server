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
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
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
    CLOUDINARY: {
      CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
      API_KEY: process.env.CLOUDINARY_API_KEY as string,
      API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    },
    ASSISTANT: {
      ENABLED: process.env.ASSISTANT_ENABLED !== "false",
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
      ANTHROPIC_WORKSPACE_ID: process.env.ANTHROPIC_WORKSPACE_ID || "",
      ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      RETRIEVER: (process.env.RETRIEVER === "vector" ? "vector" : "keyword") as "keyword" | "vector",
      TOP_K: Number(process.env.ASSISTANT_TOP_K) || 6,
      VOYAGE_API_KEY: process.env.VOYAGE_API_KEY || "",
      EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || "voyage-3.5",
      EMBEDDING_DIM: Number(process.env.EMBEDDING_DIM) || 1024,
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
  CLOUDINARY_CLOUD_NAME: envVars.CLOUDINARY.CLOUD_NAME,
  CLOUDINARY_API_KEY: envVars.CLOUDINARY.API_KEY,
  CLOUDINARY_API_SECRET: envVars.CLOUDINARY.API_SECRET,
  ASSISTANT_ENABLED: envVars.ASSISTANT?.ENABLED ?? true,
  ANTHROPIC_API_KEY: envVars.ASSISTANT?.ANTHROPIC_API_KEY ?? "",
  ANTHROPIC_WORKSPACE_ID: envVars.ASSISTANT?.ANTHROPIC_WORKSPACE_ID ?? "",
  ANTHROPIC_MODEL: envVars.ASSISTANT?.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
  RETRIEVER: envVars.ASSISTANT?.RETRIEVER ?? "keyword",
  ASSISTANT_TOP_K: envVars.ASSISTANT?.TOP_K ?? 6,
  VOYAGE_API_KEY: envVars.ASSISTANT?.VOYAGE_API_KEY ?? "",
  EMBEDDING_MODEL: envVars.ASSISTANT?.EMBEDDING_MODEL ?? "voyage-3.5",
  EMBEDDING_DIM: envVars.ASSISTANT?.EMBEDDING_DIM ?? 1024,
};

export default envVars;
