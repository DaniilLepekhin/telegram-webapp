#!/bin/bash

# Улучшенный скрипт автоматического деплоя Telegram WebApp
# Использование: ./deploy-advanced.sh [commit_message]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Запуск улучшенного деплоя Telegram WebApp${NC}"

# Проверяем, что мы в правильной директории
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Ошибка: docker-compose.yml не найден. Запустите скрипт из корневой папки проекта.${NC}"
    exit 1
fi

# Проверяем статус Git
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Нет изменений для коммита${NC}"
    exit 0
fi

# Получаем сообщение коммита
COMMIT_MESSAGE=${1:-"Auto deploy: $(date '+%Y-%m-%d %H:%M:%S')"}

echo -e "${BLUE}📝 Сообщение коммита: ${COMMIT_MESSAGE}${NC}"

# Добавляем все изменения
echo -e "${BLUE}📦 Добавляем изменения в Git...${NC}"
git add .

# Делаем коммит
echo -e "${BLUE}💾 Создаем коммит...${NC}"
git commit -m "$COMMIT_MESSAGE"

# Пушим изменения
echo -e "${BLUE}📤 Отправляем изменения на сервер...${NC}"
git push origin main

# Подключаемся к серверу и обновляем код
echo -e "${BLUE}🖥️  Подключаемся к серверу...${NC}"
ssh root@217.114.13.102 << 'EOF'
    set -e
    
    echo "📁 Переходим в директорию проекта..."
    cd /opt/telegram-webapp
    
    echo "🔄 Сохраняем локальные изменения..."
    git stash || true
    
    echo "📥 Получаем последние изменения..."
    git fetch origin main
    
    echo "🔄 Сбрасываем к состоянию удаленного репозитория..."
    git reset --hard origin/main
    
    echo "🧹 Очищаем неотслеживаемые файлы..."
    git clean -fd || true
    
    echo "🔨 Пересобираем frontend..."
    docker-compose build --no-cache frontend
    
    echo "🚀 Перезапускаем frontend..."
    docker-compose up -d frontend
    
    echo "⏳ Ждем запуска контейнера..."
    sleep 10
    
    echo "✅ Проверяем статус..."
    docker-compose ps | grep frontend
    
    echo "🔍 Проверяем логи..."
    docker-compose logs --tail=5 frontend
    
    echo "🎉 Деплой завершен!"
EOF

echo -e "${GREEN}✅ Деплой успешно завершен!${NC}"
echo -e "${BLUE}🌐 WebApp доступен по адресу: https://app.daniillepekhin.ru${NC}"
echo -e "${YELLOW}💡 Для просмотра логов: ssh root@217.114.13.102 'cd /opt/telegram-webapp && docker-compose logs -f frontend'${NC}" 