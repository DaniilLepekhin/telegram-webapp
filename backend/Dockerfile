# Многоэтапная сборка для оптимизации размера образа
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package файлы для кэширования зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --only=production && npm cache clean --force

# Копируем исходный код
COPY . .

# Создаём пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Создаём необходимые директории
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nodeuser:nodejs /app

# Production образ
FROM node:20-alpine AS production

# Устанавливаем системные зависимости
RUN apk add --no-cache \
    curl \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Создаём пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Копируем из builder этапа
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodejs /app/package*.json ./
COPY --from=builder --chown=nodeuser:nodejs /app/src ./src
COPY --from=builder --chown=nodeuser:nodejs /app/logs ./logs
COPY --from=builder --chown=nodeuser:nodejs /app/uploads ./uploads

# Устанавливаем права доступа
RUN chown -R nodeuser:nodejs /app

# Переключаемся на непривилегированного пользователя
USER nodeuser

# Открываем порт
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/api/health || exit 1

# Запускаем приложение
CMD ["node", "src/index.js"] 