### ── Stage 1: Install deps ─────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile --filter @showcase/backend...

### ── Stage 2: Build ────────────────────────────────────────────────────────
FROM oven/bun:1.3-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN bun build src/index.ts --outdir dist --target bun --sourcemap=none

### ── Stage 3: Runtime ──────────────────────────────────────────────────────
FROM oven/bun:1.3-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 bunjs
COPY --from=builder --chown=bunjs:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=bunjs:nodejs /app/node_modules ./node_modules
USER bunjs
ENV NODE_ENV=production
EXPOSE 3100
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3100/health || exit 1
CMD ["bun", "dist/index.js"]
