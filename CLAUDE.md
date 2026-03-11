# Showcase Platform — контекст для Claude Code

Production-ready Telegram WebApp showcase-платформа для демонстрации кейсов ботов клиентам.

**Production URL:** https://myapp.daniillepekhin.com
**GitHub:** https://github.com/DaniilLepekhin/telegram-webapp
**VPS path:** `/var/www/myapp/`

---

## Монорепо: структура

```
apps/
  backend/   Elysia (Bun) API — порт 3100
  bot/       grammY Telegram-бот — порт 3200 (webhook)
  webapp/    Next.js 15 App Router — порт 3000
packages/
  shared/    Общие TypeScript типы (XpEvent, User, DemoScenario, …)
infra/
  nginx/     nginx.conf + conf.d/showcase.conf
monitoring/
  prometheus.yml
```

**Package names:** `@showcase/backend`, `@showcase/bot`, `@showcase/webapp`, `@showcase/shared`

---

## Стек

| Слой | Технология |
|------|-----------|
| Runtime | Bun ≥ 1.3 (backend + bot), Node 22 (webapp CI) |
| Backend API | Elysia.js + valibot (env validation) |
| Bot | grammY (webhook mode in prod, polling в dev) |
| WebApp | Next.js 15 App Router + React 19 + TanStack Query v5 |
| ORM | Drizzle ORM 0.45 + drizzle-kit |
| DB | PostgreSQL 16 |
| Cache / Rate limit | Redis 7 |
| Styling | Tailwind CSS v4 + shadcn/ui + Framer Motion |
| Monorepo | pnpm 10 + Turborepo |
| Linter/Formatter | Biome 1.9 |
| Monitoring | Prometheus + Grafana (docker profile `monitoring`) |
| CI/CD | GitHub Actions → GHCR → SSH deploy |

---

## Ключевые команды

```bash
# Dev
pnpm dev                                    # все приложения в watch-режиме
docker compose -f docker-compose.dev.yml up -d  # postgres + redis

# Typecheck (перед каждым коммитом)
pnpm --filter @showcase/backend typecheck
pnpm --filter @showcase/bot typecheck
pnpm --filter @showcase/webapp typecheck

# Lint / format
npx biome check --write <файл>              # fix конкретного файла
npx biome check --write apps/ packages/     # fix всего

# DB (всегда через backend filter)
pnpm --filter @showcase/backend db:generate # создать миграцию
pnpm --filter @showcase/backend db:push     # применить в dev
pnpm --filter @showcase/backend db:migrate  # применить в prod
pnpm --filter @showcase/backend db:studio   # открыть Drizzle Studio

# Build
pnpm --filter @showcase/webapp build        # next build (smoke test в CI)
```

---

## Biome: правила которые сломают CI

```json
"correctness": {
  "noUnusedImports": "error",
  "noUnusedVariables": "error"
}
```

**Всегда** запускай `npx biome check --write` после изменений в `apps/` и `packages/shared/`.
`noExplicitAny` — только warn, не error.

---

## Backend: `apps/backend/src/`

### Модули

| Модуль | Описание |
|--------|---------|
| `auth/` | JWT (access 15m + refresh 30d, httpOnly cookie), HMAC Telegram initData |
| `users/` | Профиль, leaderboard, referrals, activity |
| `gamification/` | XP, уровни, стрики, энергия, ачивменты |
| `quests/` | Квесты с прогрессом, reset (admin + `targetUserId`) |
| `showcase/` | Demo сценарии (ecom, club, service, education, support, funnel, game) |
| `tracking/` | Трекинг-ссылки с UTM, A/B группами, QR, GeoIP |
| `analytics/` | Events, dashboard, SSE live-feed |
| `subscriptions/` | Планы free/pro/enterprise, trial, payment webhooks |
| `referrals/` | Multi-level (до 5 уровней) реферальная система |
| `bot/` | Внутренние ендпоинты для бота |
| `metrics/` | `GET /metrics` — Prometheus endpoint (prom-client, только internal) |

### Middlewares
- `auth.ts` — `requireAuth`, `requireRole(role)` — Elysia plugins
- `rateLimit.ts` — Redis sliding window, `keyBy` настраивается per-route
- `audit.ts` — лог чувствительных операций

### Env validation
Config в `src/config/index.ts` — valibot schema, падает при старте если что-то не так.
Обязательные: `DATABASE_URL`, `JWT_SECRET` (≥32 chars), `TELEGRAM_BOT_TOKEN`.

---

## Bot: `apps/bot/src/`

- **Webhook endpoint:** `POST /webhook` на порту `BOT_WEBHOOK_PORT` (default 3200)
- **Health:** `GET /health` — используется в docker healthcheck
- **Schema:** импортируется из `@showcase/backend/db/schema.ts` напрямую (единый источник истины)
- **Referral chain:** `userService.processReferralChain` — 5 уровней, cycle detection, `getLevelFromXp` из `@showcase/shared` для обновления `users.level`
- **Handlers:** `handlers/commands.ts`, `handlers/callbacks.ts`
- **Services:** `userService.ts` (upsert + referrals), `funnelService.ts`

### Важно про peer deps
Bot использует `drizzle-orm` через схему backend. Они **должны** резолвиться в одну и ту же
версию, иначе TypeScript ругается на несовместимые `PgColumn` типы.
В `package.json` корня есть:
```json
"pnpm": {
  "overrides": { "bun-types": "1.3.10" },
  "peerDependencyRules": { "ignoreMissing": ["@opentelemetry/api"] }
}
```
`@opentelemetry/api` добавлен в root devDeps, чтобы оба пакета видели единый резолв drizzle-orm.
Если сломается typecheck бота с ошибкой `'config' is protected` в drizzle-orm — это peer dep конфликт.
Фикс: `pnpm dedupe` или `pnpm add -D -w @opentelemetry/api`.

---

## WebApp: `apps/webapp/src/`

**App Router** структура:
```
app/
  page.tsx              — главная (ScenarioGrid)
  gamification/         — геймификация (уровни, ачивменты, лидерборд)
  analytics/            — аналитика
  tracking/             — трекинг ссылки
  profile/              — профиль пользователя
components/
  demos/                — интерактивные demo (ecom, club, service, education, support, funnel, game)
  gamification/         — GamificationPage, achievement cards
  showcase/             — ScenarioGrid, ScenarioCard
  tracking/             — TrackingPage
  analytics/            — AnalyticsPage
  profile/              — ProfilePage
  layout/               — BottomNav, Header
  ui/                   — shadcn/ui компоненты
lib/
  api.ts                — ApiClient (JWT refresh, shared types)
store/
  auth.ts               — Zustand store (accessToken, isFreshAuth)
hooks/
  useTelegram.ts        — Telegram WebApp API
```

### Auth flow
1. `useTelegram` → `initData` из Telegram WebApp
2. `POST /api/v1/auth/telegram` → JWT access + refresh (httpOnly cookie)
3. Zustand `useAuthStore` хранит `accessToken`
4. `ApiClient.request` автоматически рефрешит при 401 (дедуплицированный `refreshPromise`)

### Shared types в api.ts
`apps/webapp/src/lib/api.ts` использует типы из `@showcase/shared`.
Некоторые методы возвращают `ApiResponse` (без generic) — там компоненты используют
собственные локальные interfaces с `as unknown as LocalType`. Это intentional:
бэкенд возвращает больше полей (напр. `levelName`, `longestStreak`), чем есть в shared.

---

## Shared: `packages/shared/src/index.ts`

Ключевые экспорты:
- `User`, `DemoScenario`, `TrackingLink`, `GamificationStats`, `Achievement`
- `XpEvent` — `{ id, amount, reason, actionType, createdAt, timestamp? }`
- `SubscriptionStatus` — `'active' | 'trial' | 'pending' | 'past_due' | 'cancelled' | 'expired'`
- `TrackingLink.abTestGroups` — `Array<{ name, weight, url? }>` (не `abTestGroup: string`)
- `getLevelFromXp(xp)`, `getXpToNextLevel(xp)` — из `LEVEL_THRESHOLDS`
- `ApiResponse<T>` — стандартная обёртка `{ success, data?, error?, meta? }`

---

## Docker / Prod

### Образы в GHCR (CI пушит):
```
ghcr.io/daniillepekhin/telegram-webapp-backend:latest
ghcr.io/daniillepekhin/telegram-webapp-bot:latest
ghcr.io/daniillepekhin/telegram-webapp-webapp:latest
```

### Docker Compose файлы:
| Файл | Назначение |
|------|-----------|
| `docker-compose.dev.yml` | Только postgres + redis для локальной разработки |
| `docker-compose.prod.yml` | Production стек (app + infra + monitoring profile) |
| `docker-compose.legacy.yml` | Старый Express+React стек (не использовать) |

### Сети в prod:
- `internal` — backend, bot, webapp, postgres, redis, nginx (все сервисы)
- `public` — только nginx (смотрит наружу)

### Monitoring (запуск опциональный):
```bash
docker compose -f docker-compose.prod.yml --profile monitoring up -d
```
Grafana доступна на `${WEBAPP_URL}/grafana` (переменная `GRAFANA_PASSWORD` обязательна).

---

## Nginx: `infra/nginx/`

### Rate limit зоны (`nginx.conf`):
| Зона | Лимит | Применяется |
|------|-------|------------|
| `api` | 60r/m burst=30 | `/api/` |
| `auth` | 10r/m burst=5 | `/api/v1/auth/` |
| `track` | 200r/m burst=50 | `/t/` (redirect) |
| `webhook` | 30r/s burst=60 | `/bot/webhook` |

### Location routing (`conf.d/showcase.conf`):
- `/bot/webhook` → `bot:3200/webhook` (rate: webhook)
- `/api/v1/auth/` → `backend:3100` (rate: auth)
- `/api/` → `backend:3100` (rate: api, SSE поддержка)
- `/t/` → `backend:3100` (rate: track)
- `/_next/static/` → `webapp:3000` (cache: 1y immutable)
- `/` → `webapp:3000`
- `/metrics` — **НЕ проксируется** (Prometheus scrapes `backend:3100/metrics` напрямую по internal сети)

**Заменить `YOUR_DOMAIN`** в `showcase.conf` перед первым деплоем.

---

## CI/CD: `.github/workflows/deploy.yml`

**Триггер:** push в `main`

**Jobs:**
1. `typecheck` — `tsc --noEmit` для backend/bot + `next build` для webapp (smoke)
2. `build` — Docker buildx → GHCR (matrix: backend, bot, webapp)
3. `deploy` — SSH на VPS: `docker compose pull && down && up --wait`
4. `smoke` — HTTP checks на prod (health, scenarios, achievements, plans, webapp)

**Секреты GitHub:** `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `GHCR_TOKEN`
**VPS env файл:** `/var/www/myapp/.env` (читается docker compose)

---

## DB Schema (ключевые таблицы)

| Таблица | Описание |
|---------|---------|
| `users` | Telegram ID, роль, XP, level, streak, energy, referral_code |
| `xp_history` | id, user_id, amount, reason, action_type, created_at |
| `referrals` | referrer_id, referred_id, level (1-5), xp_rewarded, energy_rewarded |
| `tracking_links` | slug, target_url, UTM, ab_test_groups (jsonb), qr_code_url |
| `tracking_events` | link_id, country, device, browser, ab_group, telegram_user_id |
| `user_quests` | user_id, quest_id, progress (jsonb), is_completed |
| `subscriptions` | user_id, plan, status (pending/active/trial/…), expires_at |
| `achievements` | id, name, rarity (common/rare/epic/legendary) |
| `user_achievements` | user_id, achievement_id, unlocked_at |
| `analytics_events` | user_id, type (event_type enum), payload (jsonb) |

---

## Частые ловушки

**1. Biome ошибки перед пушем**
```bash
npx biome check --write apps/ packages/
```

**2. Typecheck всех трёх пакетов**
```bash
pnpm --filter @showcase/backend typecheck && \
pnpm --filter @showcase/bot typecheck && \
pnpm --filter @showcase/webapp typecheck
```

**3. Drizzle peer dep конфликт**
Симптом: `'config' is protected but type 'Column<T,...>' is not a class derived from 'Column<T,...>'`
Причина: два инстанса drizzle-orm (разные peer dep хэши).
Фикс: `pnpm install && pnpm dedupe`

**4. Новый модуль в backend**
Создать `apps/backend/src/modules/<name>/routes.ts`, подключить в `src/index.ts`
внутри `.group('/api/v1', app => app.use(newModule))`.

**5. Изменение DB schema**
```bash
pnpm --filter @showcase/backend db:generate  # создаст файл в drizzle/
git add drizzle/                              # миграции коммитятся
```
В prod применяется в deploy-скрипте: `docker compose exec -T backend bun dist/migrate.js`

**6. Shared типы**
При добавлении нового типа в `packages/shared/src/index.ts` — проверить,
что webapp компоненты с `as unknown as LocalType` по-прежнему работают.
Некоторые компоненты намеренно используют расширенные локальные interfaces
(бэкенд возвращает больше полей, чем объявлено в shared).

**7. Bot webhook регистрация**
Регистрируется автоматически в deploy.yml через curl на:
`https://myapp.daniillepekhin.com/bot/webhook`
При смене домена — обновить в двух местах: `deploy.yml` + nginx `showcase.conf`.
