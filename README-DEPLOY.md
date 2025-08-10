# Инструкция по деплою Telegram WebApp

## Быстрый деплой (рекомендуется)

```bash
./deploy-advanced.sh "Описание изменений"
```

Этот скрипт автоматически:
- ✅ Разрешает конфликты в пользу нашей версии
- ✅ Пересобирает и перезапускает frontend
- ✅ Показывает статус контейнеров

## Обычный деплой

```bash
./deploy.sh "Описание изменений"
```

## Настройка Git (выполнить один раз)

```bash
./setup-git-config.sh
```

Эта настройка предотвращает конфликты в будущем.

## Проверка статуса

```bash
ssh root@217.114.13.102 'cd /opt/telegram-webapp && docker-compose ps'
```

## Просмотр логов

```bash
ssh root@217.114.13.102 'cd /opt/telegram-webapp && docker-compose logs -f frontend'
```

## Решение проблем

### Если возникают конфликты:
1. Используйте `deploy-advanced.sh` вместо `deploy.sh`
2. Или запустите `setup-git-config.sh` для настройки

### Если нужно принудительно обновить:
```bash
ssh root@217.114.13.102 'cd /opt/telegram-webapp && git reset --hard origin/main && docker-compose build --no-cache frontend && docker-compose up -d frontend'
```

## WebApp доступен по адресу:
🌐 https://app.daniillepekhin.com 