#!/bin/bash

# Скрипт для запуска революционного Telegram бота в фоновом режиме

# Переходим в директорию проекта
cd /opt/telegram-webapp

# Останавливаем предыдущие процессы бота
echo "🛑 Останавливаем предыдущие процессы бота..."
pkill -f telegram-bot-handler
sleep 2

# Проверяем, что зависимости установлены
if [ ! -f "package.json" ]; then
    echo "❌ package.json не найден. Устанавливаем зависимости..."
    npm install
fi

# Запускаем бота в screen сессии
echo "🚀 Запускаем революционный Telegram бота в фоновом режиме..."
screen -dmS telegram-bot bash -c "
    export TELEGRAM_BOT_TOKEN=5466303727:AAGauSz23_We8iTGjRhbaL5LJobgs3e9V0E
    echo '🤖 Бот запускается...'
    node telegram-bot-handler.js
"

# Ждем немного и проверяем статус
sleep 3

# Проверяем, что бот запустился
if pgrep -f "telegram-bot-handler" > /dev/null; then
    echo "✅ Революционный Telegram бот успешно запущен в фоновом режиме!"
    echo "📱 PID: $(pgrep -f 'telegram-bot-handler')"
    echo "🖥️  Screen сессия: telegram-bot"
    echo ""
    echo "🔧 Команды для управления:"
    echo "   screen -r telegram-bot    # Подключиться к сессии"
    echo "   screen -list              # Список сессий"
    echo "   pkill -f telegram-bot-handler  # Остановить бота"
else
    echo "❌ Ошибка запуска бота!"
    exit 1
fi 