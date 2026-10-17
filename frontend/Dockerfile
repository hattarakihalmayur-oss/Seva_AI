# ─────────────────────────────────────────────────────────────────────────────
# BharatSeva AI — Frontend Dockerfile
# Multi-stage build: Node builds the static bundle; Nginx serves it.
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for Vite)
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
# VITE_API_BASE_URL must be set as a build arg or environment variable
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME=BharatSeva AI
ARG VITE_APP_VERSION=1.0.0

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION

RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:alpine AS runtime

LABEL maintainer="BharatSeva AI Team"
LABEL description="BharatSeva AI Frontend — React SPA served by Nginx"

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/bharatseva.conf

# Copy built React app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
