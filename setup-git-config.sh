#!/bin/bash

# Скрипт настройки Git для автоматического разрешения конфликтов
echo "🔧 Настройка Git на сервере..."

ssh root@217.114.13.102 << 'EOF'
    cd /opt/telegram-webapp
    
    # Настраиваем Git для автоматического разрешения конфликтов
    git config pull.rebase false
    git config merge.ours.driver true
    
    # Создаем .gitattributes для автоматического разрешения конфликтов
    cat > .gitattributes << 'GITATTR'
*.tsx merge=ours
*.ts merge=ours
*.js merge=ours
*.jsx merge=ours
*.css merge=ours
*.html merge=ours
*.json merge=ours
*.md merge=ours
GITATTR
    
    echo "✅ Git настроен для автоматического разрешения конфликтов"
EOF

echo "✅ Настройка завершена!" 