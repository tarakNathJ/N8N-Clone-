# =========================
# Stage 1: Builder
# =========================
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL 3.x for Debian
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Root files
COPY package*.json turbo.json ./

# Monorepo sources
COPY apps ./apps
COPY packages ./packages
COPY typescript-config ./typescript-config

# Install deps
RUN npm ci

# Generate Prisma client with debian-openssl-3.0.x binary
WORKDIR /app/packages/database
RUN npx prisma generate

# Build only required app
WORKDIR /app
RUN npx turbo run build --filter=primary_backend

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
COPY --from=builder /app/apps/primary_backend/dist ./dist

# Copy app package.json
COPY --from=builder /app/apps/primary_backend/package*.json ./

# Copy packages (includes generated Prisma)
COPY --from=builder /app/packages ./packages

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4040

CMD ["node", "dist/index.js"]

#  docker build --no-cache -t n8_n/primary_backend:v3 -f apps/primary_backend/Dockerfile .