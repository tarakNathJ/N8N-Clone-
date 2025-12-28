# =========================
# Stage 1: Builder
# =========================
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL 3.x for Debian
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Configure npm for better reliability
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Root files
COPY package*.json turbo.json ./

# Monorepo sources
COPY apps ./apps
COPY packages ./packages
COPY typescript-config ./typescript-config

# Install deps with retry logic
RUN npm ci --prefer-offline --no-audit || \
    (sleep 10 && npm ci --prefer-offline --no-audit) || \
    (sleep 30 && npm ci --no-audit)

# Generate Prisma client with debian-openssl-3.0.x binary
WORKDIR /app/packages/database
RUN npx prisma generate

# Build only required app
WORKDIR /app
RUN npx turbo run build --filter=worker

# =========================
# Stage 2: Runtime
# =========================
FROM node:20-slim AS runner

WORKDIR /app

# Install OpenSSL 3.x for runtime
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Copy built output
COPY --from=builder /app/apps/worker/dist ./dist

# Copy app package.json
COPY --from=builder /app/apps/worker/package*.json ./

# Copy packages (includes generated Prisma)
COPY --from=builder /app/packages ./packages

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "dist/index.js"]