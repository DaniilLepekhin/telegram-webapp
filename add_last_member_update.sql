-- Добавляем поле для отслеживания времени последнего обновления количества участников
ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS last_member_update TIMESTAMP;

-- Создаем индекс для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_telegram_chats_last_member_update ON telegram_chats(last_member_update);

-- Комментарий для документации
COMMENT ON COLUMN telegram_chats.last_member_update IS 'Время последнего обновления количества участников канала';