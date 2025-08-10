# Telegram WebApp

Веб-приложение для управления Telegram каналами с системой аналитики пользователей.

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/DaniilLepekhin/telegram-webapp.git
cd telegram-webapp
```

### 2. Настройка переменных окружения
Создайте файл `.env` в корне проекта:
```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=telegram_webapp
DB_USER=postgres
DB_PASSWORD=password

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=https://app.daniillepekhin.com
```

### 3. Запуск приложения
```bash
docker-compose up -d
```

Приложение будет доступно по адресу: http://localhost

## 📊 Функциональность

### Система пользователей
- ✅ Автоматическое сохранение пользователей при открытии приложения
- ✅ Отслеживание сессий с временем и действиями
- ✅ Аналитика действий пользователей
- ✅ Статистика пользователей (общее количество, активные сегодня/неделю)

### Управление каналами
- ✅ Получение списка каналов где пользователь является администратором
- ✅ Кеширование прав пользователей для оптимизации API запросов
- ✅ Публикация постов в каналы
- ✅ История опубликованных постов

### Аналитика
- 📈 Общее количество пользователей
- 📈 Активные пользователи (сегодня/неделя)
- 📈 Среднее количество сессий на пользователя
- 📈 Общее время в приложении
- 📈 Конверсия и вовлеченность

## 🗄️ База данных

### Таблицы
- **`app_users`** - основная таблица пользователей
- **`user_sessions`** - отслеживание сессий пользователей
- **`user_analytics`** - аналитика действий пользователей
- **`telegram_chats`** - информация о каналах
- **`chat_admins`** - кеш прав пользователей в каналах
- **`posts`** - история опубликованных постов

### API Endpoints

#### Пользователи и аналитика
- `POST /api/telegram/get-channels` - получение каналов + сохранение пользователя
- `POST /api/telegram/analytics` - отправка аналитики действий
- `POST /api/telegram/session/end` - завершение сессии
- `GET /api/telegram/stats/users` - статистика пользователей

#### Посты
- `POST /api/telegram/publish-post` - публикация постов
- `GET /api/telegram/posts/:userId` - история постов

#### Webhook
- `POST /api/telegram/webhook` - обработка событий бота

## 🔧 Разработка

### Структура проекта
```
├── frontend/                 # React приложение
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   └── App.tsx         # Главный компонент
├── backend/                  # Node.js сервер
│   ├── src/
│   │   ├── routes/         # API маршруты
│   │   ├── services/       # Бизнес-логика
│   │   └── database/       # Схема базы данных
└── docker-compose.yml       # Docker конфигурация
```

### Локальная разработка
```bash
# Запуск только базы данных
docker-compose up postgres -d

# Запуск backend в режиме разработки
cd backend
npm install
npm run dev

# Запуск frontend в режиме разработки
cd frontend
npm install
npm run dev
```

## 🚀 Развертывание

### Продакшн
```bash
# Настройка переменных окружения
export TELEGRAM_BOT_TOKEN=your_actual_bot_token

# Запуск
docker-compose -f docker-compose.yml up -d

# Проверка статуса
docker-compose ps
```

### Мониторинг
```bash
# Логи backend
docker logs telegram-webapp-backend-1 -f

# Логи frontend
docker logs telegram-webapp-frontend-1 -f

# Логи базы данных
docker logs telegram-webapp-postgres-1 -f
```

## 📝 Git Workflow

Все изменения делаются через Git для поддержания единой версии:

```bash
# Создание новой ветки
git checkout -b feature/new-feature

# Внесение изменений
# ...

# Коммит изменений
git add .
git commit -m "feat: описание изменений"

# Пуш в репозиторий
git push origin feature/new-feature

# Слияние в main
git checkout main
git merge feature/new-feature
git push origin main
```

## 🔒 Безопасность

- Все API endpoints требуют валидный `initData` от Telegram WebApp
- Проверка прав пользователя перед публикацией постов
- Кеширование для снижения нагрузки на Telegram API
- Логирование всех действий для аудита

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи контейнеров
2. Убедитесь что все переменные окружения настроены
3. Проверьте подключение к базе данных
4. Убедитесь что Telegram Bot Token корректный

## Security

### Основные меры безопасности:
- **Прокси API через nginx** - скрывает внутреннюю архитектуру
- **CORS защита** - предотвращает несанкционированные запросы
- **Security headers** - защита от XSS, clickjacking и других атак
- **Скрытие версий** - server_tokens off в nginx
- **Переменные окружения** - все секреты в .env файлах

### Настройка продакшена:

1. **Создайте .env файл на сервере:**
```bash
# НЕ коммитить в git!
echo "TELEGRAM_BOT_TOKEN=your_real_bot_token" > .env
echo "DB_PASSWORD=your_secure_password" >> .env
```

2. **Настройте домен вместо IP:**
```bash
# В .env файле
CORS_ORIGIN=https://yourdomain.com
```

3. **Используйте HTTPS:**
```bash
# Установите SSL сертификат
certbot --nginx -d yourdomain.com
```

### ⚠️ ВАЖНО:
- Никогда не коммитьте .env файлы в git
- Используйте сильные пароли для базы данных
- Регулярно обновляйте зависимости
- Настройте файрвол на сервере 