export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CLIENT_URL: string;
  SERVER_URL: string;
  SSLCOMMERZ: {
    SSLCZ_STORE_ID: string;
    SSLCZ_STORE_PASSWORD: string;
    SSLCZ_IS_LIVE: boolean;
  };
  ADMIN: {
    NAME: string;
    EMAIL: string;
    PASSWORD: string;
  };
  CLOUDINARY: {
    CLOUD_NAME: string;
    API_KEY: string;
    API_SECRET: string;
  };
  ASSISTANT?: {
    ENABLED: boolean;
    ANTHROPIC_API_KEY?: string;
    ANTHROPIC_WORKSPACE_ID?: string;
    ANTHROPIC_MODEL?: string;
    RETRIEVER: 'keyword' | 'vector';
    TOP_K: number;
    VOYAGE_API_KEY?: string;
    EMBEDDING_MODEL?: string;
    EMBEDDING_DIM?: number;
  };
}
