# 🚀 Telegram WebApp - Революционная Витрина Чат-ботов

## 📋 Статус Развертывания ✅

**Все сервисы успешно запущены и работают!**

### 🌐 Доступные URL:
- **Основное приложение**: https://app.daniillepekhin.ru
- **n8n (автоматизация)**: https://n8npersonal.daniillepekhin.ru
- **pgAdmin (база данных)**: https://app.daniillepekhin.ru/pgadmin
- **Metabase (аналитика)**: https://app.daniillepekhin.ru/metabase
- **Grafana (мониторинг)**: https://app.daniillepekhin.ru/grafana

### 🤖 Telegram Bot:
- **Bot Token**: `5466303727:AAGauSz23_We8iTGjRhbaL5LJobgs3e9V0E`
- **Статус**: ✅ Работает в фоновом режиме
- **Команды**: `/start`, `/stats`, `/track`, `/help`
- **Режим**: Полноэкранный WebApp с последней версией API

## 🧪 Инструкции для Тестирования

### 1. Тестирование WebApp
1. Откройте https://app.daniillepekhin.ru
2. Проверьте все разделы:
   - 📱 Showcase (витрина кейсов)
   - 💬 Demo Chat (демо чат)
   - 🔗 Referral System (реферальная система)
   - 👤 User Profile (профиль пользователя)
   - 📊 Analytics & Feedback (аналитика)
   - 📈 Channel Analytics (аналитика каналов)
   - 📝 Post Analytics (аналитика постов)
   - 🔍 Post Tracking (отслеживание постов)
   - ⚙️ Telegram Integration (интеграция с Telegram)

### 2. Тестирование Telegram Bot
1. Найдите бота в Telegram
2. Отправьте команду `/start`
3. Проверьте кнопки:
   - "🚀 Открыть революционный WebApp"
   - "📊 Статистика"
   - "🔗 Создать ссылку отслеживания"
   - "🎯 Демо кейсы"
   - "💬 Поддержка"
4. Нажмите "🚀 Открыть революционный WebApp" для полноэкранного режима

### 3. Тестирование n8n
1. Откройте https://n8npersonal.daniillepekhin.ru
2. Войдите в систему
3. Создайте простой workflow для тестирования

### 4. Тестирование Базы Данных
1. Откройте https://app.daniillepekhin.ru/pgadmin
2. Войдите с учетными данными:
   - Email: daniillepekhin@yandex.ru
   - Password: U3SfZ2cru
3. Подключитесь к серверу PostgreSQL

### 5. Тестирование Аналитики
1. Откройте https://app.daniillepekhin.ru/metabase
2. Настройте подключение к базе данных
3. Создайте дашборды для аналитики

## 🔧 Управление Сервисами

### Команды для управления на сервере:
```bash
# Подключение к серверу
ssh root@217.114.13.102

# Переход в директорию проекта
cd /opt/telegram-webapp

# Просмотр статуса всех сервисов
docker-compose ps

# Просмотр логов
docker-compose logs -f [service_name]

# Перезапуск сервиса
docker-compose restart [service_name]

# Остановка всех сервисов
docker-compose down

# Запуск всех сервисов
docker-compose up -d
```

### Управление Telegram Bot:

#### Автоматический запуск через скрипт:
```bash
# Запуск бота в фоновом режиме
./run-bot.sh

# Проверка статуса
ps aux | grep telegram-bot-handler
```

#### Ручное управление через screen:
```bash
# Проверка статуса бота
ps aux | grep telegram-bot-handler

# Подключение к сессии бота
screen -r telegram-bot

# Список screen сессий
screen -list

# Перезапуск бота
pkill -f telegram-bot-handler
screen -dmS telegram-bot bash -c 'export TELEGRAM_BOT_TOKEN=5466303727:AAGauSz23_We8iTGjRhbaL5LJobgs3e9V0E && node telegram-bot-handler.js'
```

#### Управление через systemd (автоматический запуск):
```bash
# Включить автозапуск
systemctl enable telegram-bot.service

# Запустить сервис
systemctl start telegram-bot.service

# Проверить статус
systemctl status telegram-bot.service

# Остановить сервис
systemctl stop telegram-bot.service

# Просмотр логов
journalctl -u telegram-bot.service -f
```

## 📊 Мониторинг

### Системные ресурсы:
- **CPU**: Мониторится через Grafana
- **Память**: Отслеживается в реальном времени
- **Диск**: Автоматические бэкапы PostgreSQL
- **Сеть**: Traefik с SSL сертификатами

### Логи:
- **Traefik**: `docker-compose logs traefik`
- **Backend**: `docker-compose logs backend`
- **Frontend**: `docker-compose logs frontend`
- **PostgreSQL**: `docker-compose logs postgres`
- **n8n**: `docker-compose logs n8n`
- **Telegram Bot**: `journalctl -u telegram-bot.service -f`

## 🎯 Особенности Революционного WebApp

### Полноэкранный режим:
- ✅ `tg.expand()` - расширение на полный экран
- ✅ `tg.setHeaderColor()` - настройка цвета заголовка
- ✅ `tg.setBackgroundColor()` - настройка цвета фона
- ✅ `tg.enableClosingConfirmation()` - подтверждение закрытия
- ✅ Динамическая высота viewport
- ✅ Обработчики всех событий Telegram Web Apps API

### Современные возможности:
- 📱 Haptic feedback
- 🎨 Автоматическое переключение темы
- 📋 Работа с буфером обмена
- 📱 QR код сканирование
- 💳 Интеграция с платежами
- ☁️ Cloud Storage
- 🔐 Биометрическая аутентификация

## 🆘 Поддержка
При возникновении проблем:
1. Проверьте логи сервисов
2. Убедитесь, что все контейнеры запущены
3. Проверьте доступность доменов
4. Обратитесь к документации Docker Compose

---

**🎉 Проект успешно развернут и готов к использованию!** 