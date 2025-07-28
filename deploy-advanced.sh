#!/bin/bash

# Улучшенный скрипт автоматического деплоя Telegram WebApp
# Автоматически разрешает конфликты в пользу нашей версии
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
    echo "📁 Переходим в директорию проекта..."
    cd /opt/telegram-webapp
    
    echo "🔄 Сохраняем локальные изменения..."
    git stash
    
    echo "📥 Получаем последние изменения..."
    git pull origin main || {
        echo "⚠️  Обнаружены конфликты, разрешаем автоматически..."
        
        # Получаем список файлов с конфликтами
        CONFLICT_FILES=$(git diff --name-only --diff-filter=U)
        
        if [ -n "$CONFLICT_FILES" ]; then
            echo "🔧 Разрешаем конфликты в файлах: $CONFLICT_FILES"
            
            # Для каждого файла с конфликтом используем нашу версию
            for file in $CONFLICT_FILES; do
                echo "   Используем нашу версию для: $file"
                git checkout --ours "$file"
                git add "$file"
            done
            
            echo "💾 Коммитим разрешенные конфликты..."
            git commit -m "Auto-resolve conflicts: use our version"
        fi
    }
    
    echo "🔄 Восстанавливаем локальные изменения..."
    git stash pop || true
    
    echo "🔨 Пересобираем frontend..."
    docker-compose build --no-cache frontend
    
    echo "🚀 Перезапускаем frontend..."
    docker-compose up -d frontend
    
    echo "✅ Проверяем статус..."
    docker-compose ps | grep frontend
    
    # Очистка старых Docker образов для экономии места
    echo "🧹 Очищаем старые Docker образы..."
    docker system prune -f --volumes

    echo "🎉 Деплой завершен!"
EOF

echo -e "${GREEN}✅ Деплой успешно завершен!${NC}"
echo -e "${BLUE}🌐 WebApp доступен по адресу: https://app.daniillepekhin.ru${NC}"
echo -e "${YELLOW}💡 Для просмотра логов: ssh root@217.114.13.102 'cd /opt/telegram-webapp && docker-compose logs -f frontend'${NC}" 