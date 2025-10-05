# ---------- Build stage ----------
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install all deps (including dev) for building TypeScript
# Use npm install instead of ci to avoid monorepo lockfile mismatch
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
# Install only production deps for lean runtime image
RUN npm install --omit=dev --no-audit --no-fund

# Copy built files and any runtime assets (e.g., migrations if needed)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/db ./db

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["npm", "start"]
