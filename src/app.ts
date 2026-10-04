import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { generalRateLimiter } from "./middlewares/rateLimiter";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import { IndexRoutes } from "./routes";

const app: Application = express();

// Security and utility middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
// Gateway callbacks from SSLCommerz send form-urlencoded POST requests (PRD 3.3, 15.3)
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
}

app.use(generalRateLimiter);

// Favicon handler to avoid browser 404 console noise
app.get("/favicon.ico", (_req: Request, res: Response) => {
  res.status(204).end();
});

// Root welcome endpoint
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Planora Backend Server is operational",
    api: "/api/v1",
    health: "/health",
  });
});

// Health check endpoint (PRD 15.3)
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount centralized /api/v1 routes
app.use("/api/v1", IndexRoutes);

// 404 & Centralized error handler
app.use(notFound);
app.use(errorHandler);

export default app;
