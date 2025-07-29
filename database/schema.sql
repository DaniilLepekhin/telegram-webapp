-- Схема базы данных для Telegram WebApp Analytics

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10),
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица каналов
CREATE TABLE IF NOT EXISTS channels (
    id BIGINT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- 'channel', 'group', 'supergroup'
    member_count INTEGER DEFAULT 0,
    description TEXT,
    invite_link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица связи пользователей и каналов (права доступа)
CREATE TABLE IF NOT EXISTS user_channels (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    channel_id BIGINT REFERENCES channels(id) ON DELETE CASCADE,
    is_admin BOOLEAN DEFAULT FALSE,
    bot_is_admin BOOLEAN DEFAULT FALSE,
    can_invite_users BOOLEAN DEFAULT FALSE,
    can_post_messages BOOLEAN DEFAULT FALSE,
    can_edit_messages BOOLEAN DEFAULT FALSE,
    can_delete_messages BOOLEAN DEFAULT FALSE,
    can_restrict_members BOOLEAN DEFAULT FALSE,
    can_promote_members BOOLEAN DEFAULT FALSE,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, channel_id)
);

-- Таблица трекинговых ссылок
CREATE TABLE IF NOT EXISTS tracking_links (
    id SERIAL PRIMARY KEY,
    channel_id BIGINT REFERENCES channels(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    link_hash VARCHAR(255) UNIQUE NOT NULL,
    post_id INTEGER, -- ID поста в канале
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    tag VARCHAR(255), -- метка креатива
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица кликов по трекинговым ссылкам
CREATE TABLE IF NOT EXISTS link_clicks (
    id SERIAL PRIMARY KEY,
    tracking_link_id INTEGER REFERENCES tracking_links(id) ON DELETE CASCADE,
    user_id BIGINT, -- ID пользователя, который кликнул
    ip_address INET,
    user_agent TEXT,
    referer VARCHAR(500),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted_to_subscriber BOOLEAN DEFAULT FALSE,
    conversion_date TIMESTAMP WITH TIME ZONE
);

-- Таблица подписчиков каналов
CREATE TABLE IF NOT EXISTS channel_subscribers (
    id SERIAL PRIMARY KEY,
    channel_id BIGINT REFERENCES channels(id) ON DELETE CASCADE,
    user_id BIGINT, -- ID пользователя в Telegram
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    source_link_id INTEGER REFERENCES tracking_links(id),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    tag VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- Таблица постов в каналах
CREATE TABLE IF NOT EXISTS channel_posts (
    id SERIAL PRIMARY KEY,
    channel_id BIGINT REFERENCES channels(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL, -- ID поста в Telegram
    message_id INTEGER,
    text TEXT,
    views INTEGER DEFAULT 0,
    forwards INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, post_id)
);

-- Таблица статистики по постам
CREATE TABLE IF NOT EXISTS post_stats (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES channel_posts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    forwards INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, date)
);

-- Таблица ежедневной статистики каналов
CREATE TABLE IF NOT EXISTS channel_daily_stats (
    id SERIAL PRIMARY KEY,
    channel_id BIGINT REFERENCES channels(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    new_subscribers INTEGER DEFAULT 0,
    unsubscribers INTEGER DEFAULT 0,
    net_growth INTEGER DEFAULT 0,
    total_subscribers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, date)
);

-- Таблица источников трафика
CREATE TABLE IF NOT EXISTS traffic_sources (
    id SERIAL PRIMARY KEY,
    channel_id BIGINT REFERENCES channels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица статистики по источникам трафика
CREATE TABLE IF NOT EXISTS source_stats (
    id SERIAL PRIMARY KEY,
    traffic_source_id INTEGER REFERENCES traffic_sources(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(traffic_source_id, date)
);

-- Таблица настроек пользователей
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- Таблица логов действий
CREATE TABLE IF NOT EXISTS action_logs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_channels_user_id ON user_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_channels_channel_id ON user_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_channel_id ON tracking_links(channel_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_link_hash ON tracking_links(link_hash);
CREATE INDEX IF NOT EXISTS idx_link_clicks_tracking_link_id ON link_clicks(tracking_link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_channel_subscribers_channel_id ON channel_subscribers(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_subscribers_joined_at ON channel_subscribers(joined_at);
CREATE INDEX IF NOT EXISTS idx_channel_daily_stats_channel_id ON channel_daily_stats(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_daily_stats_date ON channel_daily_stats(date);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Применяем триггер к таблицам
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_channels_updated_at BEFORE UPDATE ON user_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracking_links_updated_at BEFORE UPDATE ON tracking_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();