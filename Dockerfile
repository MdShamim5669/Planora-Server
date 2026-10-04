# ==========================================
# 1. Builder Stage
# ==========================================
FROM node:20-alpine AS builder

# Required for Prisma engine compilation and binaries on Alpine Linux
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install dependencies with frozen lockfile for deterministic builds
COPY package*.json ./
RUN npm ci

# Copy Prisma schema files and generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and TypeScript config
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript to JavaScript (dist directory)
RUN npm run build

# ==========================================
# 2. Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner

# Install runtime dependencies:
# - openssl: for Prisma client runtime
# - dumb-init: handles PID 1 signal forwarding (SIGTERM / SIGINT)
# - curl: for container healthchecks
RUN apk add --no-cache openssl dumb-init curl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy pre-generated Prisma client and engines from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy Prisma schemas for runtime migrations if executed inside container
COPY --from=builder /app/prisma ./prisma

# Copy compiled JavaScript output
COPY --from=builder /app/dist ./dist

# Ensure the non-root node user owns application files
RUN chown -R node:node /app

# Run as non-privileged user for container security
USER node

# Expose backend port
EXPOSE 5000

# Health check to monitor container availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Forward shutdown signals properly using dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "dist/server.js"]
