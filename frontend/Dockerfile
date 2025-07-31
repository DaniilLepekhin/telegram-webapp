# Многоэтапная сборка для React приложения
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install && npm cache clean --force

# Копируем исходный код
COPY . .

# Собираем приложение для продакшена
RUN npm run build

# Production образ с Nginx
FROM nginx:alpine AS production

# Устанавливаем дополнительные пакеты
RUN apk add --no-cache curl

# Удаляем дефолтную конфигурацию Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем кастомную конфигурацию Nginx
COPY ../nginx.conf /etc/nginx/conf.d/default.conf

# Создаём директории для логов
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log && \
    touch /var/log/nginx/error.log

# Настраиваем права доступа
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/log/nginx

# Открываем порт
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"] 