#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка прав root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "Этот скрипт не должен запускаться от root"
        exit 1
    fi
}

# Проверка Ubuntu версии
check_ubuntu() {
    if ! command -v lsb_release &> /dev/null; then
        error "lsb_release не найден. Убедитесь, что вы используете Ubuntu"
        exit 1
    fi
    
    VERSION=$(lsb_release -r | awk '{print $2}')
    if [[ "$VERSION" != "24.04" && "$VERSION" != "22.04" && "$VERSION" != "20.04" ]]; then
        warn "Рекомендуется Ubuntu 24.04 LTS. Текущая версия: $VERSION"
    else
        log "Ubuntu версия: $VERSION ✓"
    fi
}

# Установка Docker и Docker Compose
install_docker() {
    if command -v docker &> /dev/null; then
        log "Docker уже установлен"
        return
    fi
    
    log "Установка Docker..."
    
    # Обновление пакетов
    sudo apt-get update
    
    # Установка зависимостей
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Добавление официального GPG ключа Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Добавление репозитория Docker
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Установка Docker
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Добавление пользователя в группу docker
    sudo usermod -aG docker $USER
    
    log "Docker установлен ✓"
}

# Создание необходимых директорий
create_directories() {
    log "Создание директорий..."
    
    mkdir -p postgres_data
    mkdir -p redis_data
    mkdir -p traefik_data
    mkdir -p metabase_data
    mkdir -p pgadmin_data
    mkdir -p prometheus_data
    mkdir -p grafana_data
    mkdir -p backups
    mkdir -p backend/logs
    mkdir -p backend/uploads
    mkdir -p telegram-bot/logs
    mkdir -p monitoring
    mkdir -p scripts
    
    log "Директории созданы ✓"
}

# Настройка файла .env
setup_env() {
    if [[ ! -f .env ]]; then
        log "Настройка переменных окружения..."
        
        if [[ -f env.example ]]; then
            cp env.example .env
            warn "Файл .env создан из примера. ОБЯЗАТЕЛЬНО отредактируйте его!"
            warn "Установите ваш домен, пароли и токен бота"
        else
            error "Файл env.example не найден"
            exit 1
        fi
    else
        log "Файл .env уже существует ✓"
    fi
}

# Генерация паролей
generate_passwords() {
    log "Генерация безопасных паролей..."
    
    # Установка pwgen если его нет
    if ! command -v pwgen &> /dev/null; then
        sudo apt-get install -y pwgen
    fi
    
    # Генерация паролей
    POSTGRES_PASS=$(pwgen -s 32 1)
    REDIS_PASS=$(pwgen -s 32 1)
    JWT_SECRET=$(pwgen -s 64 1)
    PGADMIN_PASS=$(pwgen -s 16 1)
    GRAFANA_PASS=$(pwgen -s 16 1)
    
    log "Сгенерированные пароли сохранены в passwords.txt"
    cat > passwords.txt << EOF
# Пароли для .env файла
POSTGRES_PASSWORD=$POSTGRES_PASS
REDIS_PASSWORD=$REDIS_PASS
JWT_SECRET=$JWT_SECRET
PGADMIN_PASSWORD=$PGADMIN_PASS
GRAFANA_PASSWORD=$GRAFANA_PASS

# Для Basic Auth (используйте htpasswd для генерации)
# Команда: echo \$(htpasswd -nb admin your_password) | sed -e s/\\\$/\\\$\\\$/g
EOF
    
    warn "Пароли сохранены в passwords.txt. Скопируйте их в .env файл"
}

# Настройка firewall
setup_firewall() {
    log "Настройка firewall..."
    
    # Установка ufw если его нет
    if ! command -v ufw &> /dev/null; then
        sudo apt-get install -y ufw
    fi
    
    # Настройка правил
    sudo ufw --force enable
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    log "Firewall настроен ✓"
}

# Сборка и запуск проекта
build_and_start() {
    log "Сборка и запуск проекта..."
    
    # Проверка .env файла
    if [[ ! -f .env ]]; then
        error "Файл .env не найден. Создайте его из env.example"
        exit 1
    fi
    
    # Загрузка переменных окружения
    
    # Проверка обязательных переменных
    if [[ -z "$DOMAIN_NAME" || -z "$TELEGRAM_BOT_TOKEN" ]]; then
        error "Не все обязательные переменные заданы в .env файле"
        exit 1
    fi
    
    # Остановка существующих контейнеров
    docker compose down
    
    # Сборка образов
    docker compose build --no-cache
    
    # Запуск сервисов
    docker compose up -d
    
    log "Проект запущен ✓"
}

# Проверка статуса сервисов
check_services() {
    log "Проверка статуса сервисов..."
    
    sleep 10  # Ждём запуска сервисов
    
    # Проверка контейнеров
    docker compose ps
    
    log "Статус сервисов:"
    log "- WebApp: https://$SUBDOMAIN.$DOMAIN_NAME"
    log "- Analytics: https://analytics.$DOMAIN_NAME"
    log "- Grafana: https://grafana.$DOMAIN_NAME"
    log "- Metrics: https://metrics.$DOMAIN_NAME"
    log "- Traefik: https://traefik.$DOMAIN_NAME"
    log "- pgAdmin: https://$SUBDOMAIN.$DOMAIN_NAME/_admin/pgadmin"
}

# Основная функция
main() {
    log "=== Деплой Telegram WebApp ==="
    
    check_root
    check_ubuntu
    install_docker
    create_directories
    setup_env
    generate_passwords
    setup_firewall
    
    warn "ВАЖНО: Перед продолжением:"
    warn "1. Отредактируйте файл .env"
    warn "2. Установите ваш домен и поддомены"
    warn "3. Добавьте токен Telegram бота"
    warn "4. Настройте DNS записи для ваших доменов"
    warn ""
    read -p "Продолжить деплой? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_and_start
        check_services
        
        log "=== Деплой завершён ==="
        log "Проверьте логи: docker compose logs -f"
        log "Перезапуск: docker compose restart"
        log "Остановка: docker compose down"
    else
        log "Деплой отменён"
    fi
}

# Обработка аргументов командной строки
case "${1:-}" in
    "install")
        check_root
        check_ubuntu
        install_docker
        create_directories
        setup_env
        generate_passwords
        setup_firewall
        ;;
    "start")
        build_and_start
        check_services
        ;;
    "stop")
        docker compose down
        ;;
    "restart")
        docker compose restart
        ;;
    "logs")
        docker compose logs -f "${2:-}"
        ;;
    "status")
        docker compose ps
        ;;
    "backup")
        ./scripts/backup.sh
        ;;
    *)
        main
        ;;
esac 