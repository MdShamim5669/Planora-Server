import app from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Planora Backend Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  console.log(`📡 Health endpoint: http://localhost:${env.PORT}/health`);
  console.log(`📡 API Base URL: http://localhost:${env.PORT}/api/v1`);
});

const handleShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log("🔒 HTTP server closed.");
    await prisma.$disconnect();
    console.log("💾 Prisma client disconnected.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
