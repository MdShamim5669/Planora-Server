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
}
