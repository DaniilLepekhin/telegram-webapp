-- Схема базы данных для Telegram WebApp

-- Пользователи, которые открывают приложение
CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    telegram_user_id BIGINT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    username TEXT,
    photo_url TEXT,
    language_code TEXT,
    is_premium BOOLEAN DEFAULT false,
    first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_count INTEGER DEFAULT 1,
    total_time_spent INTEGER DEFAULT 0, -- в секундах
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Сессии пользователей
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id TEXT NOT NULL,
    init_data TEXT,
    user_agent TEXT,
    ip_address INET,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    pages_visited JSONB,
    actions_performed JSONB,
    FOREIGN KEY (user_id) REFERENCES app_users(telegram_user_id) ON DELETE CASCADE
);

-- Чаты, куда добавлен бот
CREATE TABLE IF NOT EXISTS telegram_chats (
    chat_id BIGINT PRIMARY KEY,
    chat_title TEXT NOT NULL,
    username TEXT,
    type TEXT NOT NULL CHECK (type IN ('group', 'supergroup', 'channel')),
    bot_status TEXT NOT NULL DEFAULT 'member',
    member_count INTEGER,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Кеш админов в чатах
CREATE TABLE IF NOT EXISTS chat_admins (
    chat_id BIGINT,
    user_id BIGINT,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    role TEXT,
    last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chat_id, user_id),
    FOREIGN KEY (chat_id) REFERENCES telegram_chats(chat_id) ON DELETE CASCADE
);

-- История постов
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    chat_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    buttons JSONB,
    media JSONB,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES telegram_chats(chat_id) ON DELETE CASCADE
);

-- Аналитика действий пользователей
CREATE TABLE IF NOT EXISTS user_analytics (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action_type TEXT NOT NULL, -- 'page_view', 'button_click', 'post_created', 'channel_selected'
    action_data JSONB,
    page_url TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT,
    FOREIGN KEY (user_id) REFERENCES app_users(telegram_user_id) ON DELETE CASCADE
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_app_users_telegram_id ON app_users(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_app_users_last_seen ON app_users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_chat_admins_user_id ON chat_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_admins_is_admin ON chat_admins(is_admin);
CREATE INDEX IF NOT EXISTS idx_chat_admins_last_checked ON chat_admins(last_checked_at);
CREATE INDEX IF NOT EXISTS idx_telegram_chats_updated_at ON telegram_chats(updated_at);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_chat_id ON posts(chat_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_action_type ON user_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_timestamp ON user_analytics(timestamp);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telegram_chats_updated_at BEFORE UPDATE ON telegram_chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 