# Telegram WebApp

Современный Telegram WebApp с аналитикой каналов и демо-чатом.

## 🚀 Быстрый старт

### Автоматический деплой

```bash
# Простой деплой
./deploy.sh

# Деплой с кастомным сообщением
./deploy.sh "Исправлена кнопка назад"
```

### Ручной деплой

```bash
# 1. Добавить изменения
git add .

# 2. Сделать коммит
git commit -m "Описание изменений"

# 3. Отправить на сервер
git push origin main

# 4. На сервере
ssh root@217.114.13.102
cd /opt/telegram-webapp
git pull origin main
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

## 📁 Структура проекта

```
My WebApp/
├── frontend/                 # React + TypeScript
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── App.tsx         # Главный компонент
│   │   └── main.tsx        # Точка входа
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # Node.js API
├── docker-compose.yml       # Docker конфигурация
├── deploy.sh               # Скрипт автоматического деплоя
└── README.md
```

## 🛠️ Технологии

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Cache**: Redis
- **Deployment**: Docker, Docker Compose
- **Reverse Proxy**: Traefik
- **SSL**: Let's Encrypt

## 🌐 Доступные сервисы

- **WebApp**: https://app.daniillepekhin.ru
- **N8N**: https://n8n_personal.daniillepekhin.ru

## 📱 Telegram Bot

- **Токен**: `5466303727:AAGauSz23_We8iTGjRhbaL5LJobgs3e9V0E`
- **WebApp URL**: https://app.daniillepekhin.ru

## 🔧 Команды для разработки

```bash
# Установка зависимостей
cd frontend && npm install

# Запуск в режиме разработки
cd frontend && npm run dev

# Сборка для продакшена
cd frontend && npm run build

# Запуск Docker контейнеров
docker-compose up -d

# Просмотр логов
docker-compose logs -f frontend
```

## 🚀 Деплой

Проект настроен для автоматического деплоя через Git. При пуше в ветку `main` код автоматически обновляется на сервере.

### Требования для деплоя

1. SSH доступ к серверу
2. Git репозиторий на GitHub
3. Настроенный сервер с Docker и Docker Compose

## 📝 Изменения

### v1.0.0
- ✅ Базовая структура WebApp
- ✅ Интеграция с Telegram Bot API
- ✅ Аналитика каналов
- ✅ Демо-чат
- ✅ Кнопки "Назад" во всех разделах
- ✅ Автоматический деплой через Git

### v1.0.1
- ✅ Максимально заметная красная кнопка "Назад" в витрине кейсов
- ✅ Автоматический деплой через Git с одним командой
- ✅ Улучшенная документация

## 🧪 Тестирование

### Кнопка "Назад"
1. Откройте WebApp через бота
2. Перейдите в "📱 Витрина кейсов"
3. Увидите огромную красную кнопку: "🔙 НАЖМИ НАЗАД К ГЛАВНОЙ СТРАНИЦЕ 🔙"
4. Нажмите на неё - вернетесь на главную страницу 