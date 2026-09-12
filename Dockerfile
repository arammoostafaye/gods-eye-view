# God's Eye View - Personal Edition Dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:24-alpine AS runner

WORKDIR /app

# Install serve for static hosting
RUN npm install -g serve

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./dist/
COPY --from=builder /app/package.json ./

# Copy server if exists
COPY --from=builder /app/server ./server

EXPOSE 4173 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4173/ || exit 1

CMD ["serve", "-s", "dist", "-l", "4173"]
