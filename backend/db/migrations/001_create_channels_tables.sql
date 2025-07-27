-- Создание таблицы каналов
CREATE TABLE IF NOT EXISTS channels (
    id BIGINT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    type VARCHAR(50) NOT NULL CHECK (type IN ('channel', 'group', 'supergroup')),
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы связи пользователей с каналами
CREATE TABLE IF NOT EXISTS user_channels (
    user_id BIGINT NOT NULL,
    channel_id BIGINT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    bot_is_admin BOOLEAN DEFAULT FALSE,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, channel_id),
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
);

-- Создание таблицы постов
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    channel_id BIGINT NOT NULL,
    message_id INTEGER,
    text TEXT,
    media_count INTEGER DEFAULT 0,
    button_count INTEGER DEFAULT 0,
    buttons JSONB,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    forwards INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
);

-- Создание таблицы кликов по кнопкам
CREATE TABLE IF NOT EXISTS button_clicks (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    button_id VARCHAR(255) NOT NULL,
    user_id BIGINT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_channels_user_id ON user_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_channels_channel_id ON user_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_user_channels_admin ON user_channels(is_admin, bot_is_admin);
CREATE INDEX IF NOT EXISTS idx_posts_channel_id ON posts(channel_id);
CREATE INDEX IF NOT EXISTS idx_posts_sent_at ON posts(sent_at);
CREATE INDEX IF NOT EXISTS idx_button_clicks_post_id ON button_clicks(post_id);
CREATE INDEX IF NOT EXISTS idx_button_clicks_clicked_at ON button_clicks(clicked_at);

-- Создание функции для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггеров для автоматического обновления updated_at
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_channels_updated_at BEFORE UPDATE ON user_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Создание представления для статистики каналов
CREATE OR REPLACE VIEW channel_stats AS
SELECT 
    c.id,
    c.title,
    c.username,
    c.type,
    c.member_count,
    COUNT(p.id) as total_posts,
    SUM(p.views) as total_views,
    SUM(p.clicks) as total_clicks,
    CASE 
        WHEN SUM(p.views) > 0 THEN ROUND((SUM(p.clicks)::float / SUM(p.views) * 100), 2)
        ELSE 0 
    END as avg_ctr,
    MAX(p.sent_at) as last_post_date
FROM channels c
LEFT JOIN posts p ON c.id = p.channel_id
GROUP BY c.id, c.title, c.username, c.type, c.member_count;

-- Создание представления для статистики постов
CREATE OR REPLACE VIEW post_stats AS
SELECT 
    p.id,
    p.channel_id,
    c.title as channel_title,
    p.message_id,
    p.text,
    p.media_count,
    p.button_count,
    p.views,
    p.clicks,
    p.forwards,
    CASE 
        WHEN p.views > 0 THEN ROUND((p.clicks::float / p.views * 100), 2)
        ELSE 0 
    END as ctr,
    p.sent_at,
    p.updated_at
FROM posts p
JOIN channels c ON p.channel_id = c.id
ORDER BY p.sent_at DESC; 