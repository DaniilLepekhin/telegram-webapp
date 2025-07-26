-- Инициализация базы данных для Telegram WebApp
-- Оптимизированная схема для аналитики каналов и отслеживания постов

-- Создание базы данных
CREATE DATABASE IF NOT EXISTS telegram_webapp;
USE telegram_webapp;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10),
    is_premium BOOLEAN DEFAULT FALSE,
    is_bot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Индексы для быстрого поиска
    INDEX idx_telegram_id (telegram_id),
    INDEX idx_username (username),
    INDEX idx_created_at (created_at)
);

-- Таблица каналов
CREATE TABLE IF NOT EXISTS channels (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    channel_id BIGINT,
    channel_username VARCHAR(255),
    channel_title VARCHAR(500),
    channel_type ENUM('channel', 'group', 'supergroup') DEFAULT 'channel',
    is_verified BOOLEAN DEFAULT FALSE,
    subscribers_count INT DEFAULT 0,
    bot_token VARCHAR(500), -- Зашифрованный токен бота
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_channel_username (channel_username),
    INDEX idx_is_active (is_active)
);

-- Таблица статистики каналов (ежедневная)
CREATE TABLE IF NOT EXISTS channel_daily_stats (
    id BIGSERIAL PRIMARY KEY,
    channel_id BIGINT NOT NULL,
    date DATE NOT NULL,
    subscribers_start INT DEFAULT 0,
    subscribers_end INT DEFAULT 0,
    new_subscribers INT DEFAULT 0,
    unsubscribes INT DEFAULT 0,
    net_growth INT DEFAULT 0,
    posts_count INT DEFAULT 0,
    total_views INT DEFAULT 0,
    total_reactions INT DEFAULT 0,
    avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_channel_date (channel_id, date),
    INDEX idx_channel_date (channel_id, date),
    INDEX idx_date (date)
);

-- Таблица постов
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    channel_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL, -- ID поста в Telegram
    message_text TEXT,
    message_type ENUM('text', 'photo', 'video', 'document', 'poll', 'other') DEFAULT 'text',
    post_url VARCHAR(500),
    published_at TIMESTAMP,
    views_count INT DEFAULT 0,
    forwards_count INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    reactions_count INT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_channel_post (channel_id, post_id),
    INDEX idx_channel_published (channel_id, published_at),
    INDEX idx_engagement_rate (engagement_rate),
    INDEX idx_views_count (views_count)
);

-- Таблица отслеживания переходов
CREATE TABLE IF NOT EXISTS post_tracking (
    id BIGSERIAL PRIMARY KEY,
    tracking_id VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    post_id BIGINT,
    original_url VARCHAR(500) NOT NULL,
    tracking_url VARCHAR(500) NOT NULL,
    post_title VARCHAR(500),
    channel_name VARCHAR(255),
    total_clicks INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    conversions INT DEFAULT 0,
    unsubscribes INT DEFAULT 0,
    avg_time_on_post INT DEFAULT 0, -- в секундах
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
    INDEX idx_tracking_id (tracking_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- Таблица кликов по ссылкам отслеживания
CREATE TABLE IF NOT EXISTS tracking_clicks (
    id BIGSERIAL PRIMARY KEY,
    tracking_id BIGINT NOT NULL,
    user_telegram_id BIGINT,
    user_username VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referer VARCHAR(500),
    source VARCHAR(255), -- utm_source
    medium VARCHAR(255), -- utm_medium
    campaign VARCHAR(255), -- utm_campaign
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tracking_id) REFERENCES post_tracking(id) ON DELETE CASCADE,
    INDEX idx_tracking_id (tracking_id),
    INDEX idx_user_telegram_id (user_telegram_id),
    INDEX idx_clicked_at (clicked_at),
    INDEX idx_source (source)
);

-- Таблица действий пользователей
CREATE TABLE IF NOT EXISTS user_actions (
    id BIGSERIAL PRIMARY KEY,
    tracking_id BIGINT NOT NULL,
    user_telegram_id BIGINT,
    action_type ENUM('click', 'view', 'subscribe', 'unsubscribe', 'share', 'comment', 'conversion') NOT NULL,
    action_data JSON, -- Дополнительные данные действия
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tracking_id) REFERENCES post_tracking(id) ON DELETE CASCADE,
    INDEX idx_tracking_action (tracking_id, action_type),
    INDEX idx_user_telegram_id (user_telegram_id),
    INDEX idx_timestamp (timestamp)
);

-- Таблица источников трафика
CREATE TABLE IF NOT EXISTS traffic_sources (
    id BIGSERIAL PRIMARY KEY,
    tracking_id BIGINT NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    clicks_count INT DEFAULT 0,
    conversions_count INT DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tracking_id) REFERENCES post_tracking(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tracking_source (tracking_id, source_name),
    INDEX idx_tracking_id (tracking_id),
    INDEX idx_conversion_rate (conversion_rate)
);

-- Таблица реферальной системы
CREATE TABLE IF NOT EXISTS referrals (
    id BIGSERIAL PRIMARY KEY,
    referrer_id BIGINT NOT NULL,
    referred_id BIGINT,
    referral_code VARCHAR(255) UNIQUE NOT NULL,
    status ENUM('pending', 'active', 'completed') DEFAULT 'pending',
    reward_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_referrer_id (referrer_id),
    INDEX idx_referral_code (referral_code),
    INDEX idx_status (status)
);

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS feedback (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category ENUM('general', 'suggestion', 'referral', 'bug', 'feature') DEFAULT 'general',
    rating INT CHECK (rating >= 1 AND rating <= 5),
    message TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);

-- Таблица сессий WebApp
CREATE TABLE IF NOT EXISTS webapp_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_data JSON,
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INT DEFAULT 0,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_started_at (started_at),
    INDEX idx_last_activity (last_activity)
);

-- Представления для быстрой аналитики
CREATE OR REPLACE VIEW channel_analytics AS
SELECT 
    c.id,
    c.channel_username,
    c.channel_title,
    c.subscribers_count,
    COUNT(p.id) as total_posts,
    AVG(p.views_count) as avg_views,
    AVG(p.engagement_rate) as avg_engagement,
    MAX(p.published_at) as last_post_date
FROM channels c
LEFT JOIN posts p ON c.id = p.channel_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.channel_username, c.channel_title, c.subscribers_count;

CREATE OR REPLACE VIEW tracking_analytics AS
SELECT 
    pt.id,
    pt.tracking_id,
    pt.post_title,
    pt.total_clicks,
    pt.unique_visitors,
    pt.conversions,
    pt.unsubscribes,
    CASE 
        WHEN pt.total_clicks > 0 
        THEN ROUND((pt.conversions::DECIMAL / pt.total_clicks) * 100, 2)
        ELSE 0 
    END as conversion_rate,
    CASE 
        WHEN pt.total_clicks > 0 
        THEN ROUND((pt.unsubscribes::DECIMAL / pt.total_clicks) * 100, 2)
        ELSE 0 
    END as unsubscribe_rate
FROM post_tracking pt
WHERE pt.is_active = TRUE;

-- Триггеры для автоматического обновления
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Применяем триггеры
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_channels_modtime BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_posts_modtime BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_tracking_modtime BEFORE UPDATE ON post_tracking FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Функция для обновления статистики отслеживания
CREATE OR REPLACE FUNCTION update_tracking_stats(tracking_id_param BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE post_tracking 
    SET 
        total_clicks = (
            SELECT COUNT(*) 
            FROM tracking_clicks 
            WHERE tracking_id = tracking_id_param
        ),
        unique_visitors = (
            SELECT COUNT(DISTINCT user_telegram_id) 
            FROM tracking_clicks 
            WHERE tracking_id = tracking_id_param AND user_telegram_id IS NOT NULL
        ),
        conversions = (
            SELECT COUNT(*) 
            FROM user_actions 
            WHERE tracking_id = tracking_id_param AND action_type = 'conversion'
        ),
        unsubscribes = (
            SELECT COUNT(*) 
            FROM user_actions 
            WHERE tracking_id = tracking_id_param AND action_type = 'unsubscribe'
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = tracking_id_param;
END;
$$ language 'plpgsql';

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_posts_channel_published ON posts(channel_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_clicks_tracking_clicked ON tracking_clicks(tracking_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_actions_tracking_timestamp ON user_actions(tracking_id, timestamp DESC);

-- Тестовые данные (можно удалить в продакшене)
INSERT INTO users (telegram_id, username, first_name) VALUES 
(123456789, 'testuser', 'Test User') 
ON CONFLICT (telegram_id) DO NOTHING; 