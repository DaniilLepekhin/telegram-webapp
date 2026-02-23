# Showcase Platform

Production-ready Telegram WebApp — showcase платформа для демонстрации кейсов Telegram-ботов клиентам.

**Стек:** Bun + Elysia.js · Next.js 15 + React 19 · Drizzle ORM · PostgreSQL · Redis · grammY · pnpm Turborepo

## Структура монорепо

```
apps/
  backend/     Elysia API (Bun, порт 3100)
  webapp/      Next.js 15 Telegram WebApp (порт 3000)
  bot/         grammY Telegram-бот
packages/
  shared/      Общие TypeScript типы
infra/
  nginx/       Nginx конфиг для prod
```

## Быстрый старт (dev)

### 1. Требования

- [Bun](https://bun.sh) ≥ 1.3 (`curl -fsSL https://bun.sh/install | bash`)
- [pnpm](https://pnpm.io) ≥ 10 (`npm i -g pnpm`)
- Docker + Docker Compose (для PostgreSQL и Redis)

### 2. Клонировать и установить зависимости

```bash
git clone <repo>
cd "Личный бот"
pnpm install
```

### 3. Настроить переменные окружения

```bash
cp .env.local .env.local
# Открыть .env.local и заполнить:
#   DATABASE_URL, JWT_SECRET, TELEGRAM_BOT_TOKEN
```

Минимальный `.env.local`:
```env
DATABASE_URL=postgresql://showcase:showcase@localhost:5432/showcase
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-at-least-32-chars
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
WEBAPP_URL=http://localhost:3000
```

### 4. Запустить инфраструктуру

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 5. Применить миграции

```bash
pnpm --filter @showcase/backend db:push
```

### 6. Запустить все приложения

```bash
pnpm dev
```

Открыть:
- WebApp: http://localhost:3000
- API: http://localhost:3100
- Swagger: http://localhost:3100/swagger

---

## Команды

| Команда | Описание |
|---|---|
| `pnpm dev` | Запустить все приложения в watch-режиме |
| `pnpm build` | Собрать все приложения |
| `pnpm --filter @showcase/webapp build` | Собрать только webapp |
| `pnpm --filter @showcase/backend typecheck` | Проверить типы backend |
| `pnpm --filter @showcase/bot typecheck` | Проверить типы bot |
| `pnpm --filter @showcase/backend db:generate` | Сгенерировать миграции |
| `pnpm --filter @showcase/backend db:migrate` | Применить миграции |
| `pnpm --filter @showcase/backend db:studio` | Открыть Drizzle Studio |

---

## Деплой (production)

### Требования на сервере

- Docker + Docker Compose
- Открытые порты 80, 443

### 1. Подготовить `.env.prod`

```env
POSTGRES_PASSWORD=...
REDIS_PASSWORD=...
JWT_SECRET=...
TELEGRAM_BOT_TOKEN=...
WEBAPP_URL=https://yourdomain.com
WEBHOOK_URL=https://yourdomain.com/bot/webhook
GITHUB_OWNER=your-github-username
BOT_USERNAME=your_bot_username
CORS_ORIGINS=https://yourdomain.com
```

### 2. Настроить домен в nginx

Отредактировать `infra/nginx/conf.d/showcase.conf` — заменить `YOUR_DOMAIN` на реальный домен.

### 3. SSL-сертификат (Let's Encrypt)

```bash
docker compose -f docker-compose.prod.yml run certbot certonly \
  --webroot -w /var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com \
  --email your@email.com --agree-tos
```

### 4. Запустить prod-стек

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 5. CI/CD (GitHub Actions)

Добавить секреты в Settings → Secrets:
- `VPS_HOST` — IP сервера
- `VPS_USER` — пользователь SSH
- `VPS_SSH_KEY` — приватный SSH ключ

При каждом пуше в `main`:
1. Запускается type-check + build
2. Собираются Docker-образы → GHCR
3. SSH-деплой на сервер

---

## Архитектура API

### Backend endpoints (`/api/v1/`)

| Группа | Эндпоинты |
|---|---|
| Auth | `POST /auth/telegram`, `/auth/refresh`, `/auth/logout` |
| Users | `GET /users/me`, `/users/leaderboard`, `/users/referrals`, `/users/activity` |
| Tracking | `POST /tracking/links`, `GET /tracking/links`, `GET /tracking/links/:id/analytics`, `DELETE /tracking/links/:id` |
| Gamification | `GET /gamification/stats`, `/gamification/achievements`, `POST /gamification/award-xp`, `/gamification/streak` |
| Showcase | `GET /showcase/scenarios`, `POST /showcase/scenarios/:id/run`, `/showcase/scenarios/:id/complete`, `GET /showcase/metrics` |
| Analytics | `POST /analytics/events`, `GET /analytics/dashboard`, `GET /analytics/live` (SSE) |
| Subscriptions | `GET /subscriptions/plans`, `/subscriptions/status`, `POST /subscriptions/start`, `/subscriptions/cancel` |

### Tracking redirect

`GET /t/:slug` — публичный редирект с GeoIP + User-Agent parsing + A/B роутинг

---

## Безопасность

- JWT (access 15m + refresh 30d) + httpOnly cookies
- Rate limiting (Redis) на все эндпоинты
- HMAC валидация Telegram initData
- Audit log чувствительных операций
- CORS whitelist
- Security headers (CSP, HSTS, X-Frame-Options)
