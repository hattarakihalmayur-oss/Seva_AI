# ─────────────────────────────────────────────────────────────────────────────
# BharatSeva AI — Backend Dockerfile
# Multi-stage build: Build stage strips dev dependencies.
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

LABEL maintainer="BharatSeva AI Team"
LABEL description="BharatSeva AI Backend — Node.js Express API"

WORKDIR /app

# Copy package files first (leverages Docker layer cache)
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy source code
COPY src/ ./src/

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Security: run as a non-root user
RUN addgroup -S bharatseva && adduser -S bharatseva -G bharatseva

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder --chown=bharatseva:bharatseva /app/node_modules ./node_modules
COPY --from=builder --chown=bharatseva:bharatseva /app/src ./src
COPY --chown=bharatseva:bharatseva package.json ./

# Switch to non-root user
USER bharatseva

# Expose the API port (override via PORT env var)
EXPOSE 5000

# Health check — confirms the server responds before traffic routes to it
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start server
CMD ["node", "src/server.js"]
