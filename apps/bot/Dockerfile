### ── Stage 1: Install deps ─────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/
COPY apps/bot/package.json ./apps/bot/
RUN pnpm install --frozen-lockfile --filter @showcase/bot... --filter @showcase/backend...

### ── Stage 2: Build ────────────────────────────────────────────────────────
FROM oven/bun:1.3-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/bot/node_modules ./apps/bot/node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY packages/shared ./packages/shared
# bot импортирует schema из backend — берём только нужный файл
COPY apps/backend/src/db/schema.ts ./apps/backend/src/db/schema.ts
COPY apps/backend/tsconfig.json ./apps/backend/tsconfig.json
COPY apps/bot ./apps/bot
WORKDIR /app/apps/bot
RUN bun build src/index.ts --outdir dist --target bun --sourcemap=none

### ── Stage 3: Runtime ──────────────────────────────────────────────────────
FROM oven/bun:1.3-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 bunjs
COPY --from=builder --chown=bunjs:nodejs /app/apps/bot/dist ./dist
COPY --from=builder --chown=bunjs:nodejs /app/node_modules ./node_modules
USER bunjs
ENV NODE_ENV=production
CMD ["bun", "dist/index.js"]
