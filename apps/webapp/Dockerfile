### ── Stage 1: Install deps ─────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/webapp/package.json ./apps/webapp/
RUN pnpm install --frozen-lockfile --filter @showcase/webapp...

### ── Stage 2: Build ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/webapp/node_modules ./apps/webapp/node_modules
COPY packages/shared ./packages/shared
COPY apps/webapp ./apps/webapp
WORKDIR /app/apps/webapp
ARG NEXT_PUBLIC_API_URL=https://myapp.daniillepekhin.com/api/v1
ARG NEXT_PUBLIC_BOT_USERNAME=myapp_showcase_bot
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BOT_USERNAME=$NEXT_PUBLIC_BOT_USERNAME
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

### ── Stage 3: Runtime ──────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/webapp/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/webapp/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/webapp/.next/static ./.next/static
USER nextjs
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1
CMD ["node", "server.js"]
