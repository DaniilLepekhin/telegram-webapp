-- Таблица для хранения трекинговых ссылок
CREATE TABLE IF NOT EXISTS tracking_links (
    id SERIAL PRIMARY KEY,
    link_id VARCHAR(20) UNIQUE NOT NULL, -- Короткий уникальный ID для ссылки
    creator_user_id BIGINT NOT NULL, -- ID создателя ссылки
    channel_id BIGINT NOT NULL, -- ID канала
    link_type VARCHAR(20) NOT NULL CHECK (link_type IN ('post', 'subscribe')), -- Тип ссылки
    target_url TEXT NOT NULL, -- Целевая ссылка (на пост или канал)
    title VARCHAR(255), -- Название ссылки для удобства
    description TEXT, -- Описание ссылки
    is_active BOOLEAN DEFAULT true, -- Активна ли ссылка
    expires_at TIMESTAMP, -- Время истечения (опционально)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для хранения переходов по ссылкам
CREATE TABLE IF NOT EXISTS link_clicks (
    id SERIAL PRIMARY KEY,
    link_id VARCHAR(20) NOT NULL REFERENCES tracking_links(link_id),
    telegram_user_id BIGINT, -- ID пользователя из Telegram (если доступен)
    utm_source VARCHAR(255), -- UTM метки
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    user_agent TEXT, -- User Agent браузера
    ip_address INET, -- IP адрес (для геоаналитики)
    referer_url TEXT, -- Откуда пришел
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для отслеживания подписок после переходов
CREATE TABLE IF NOT EXISTS link_subscriptions (
    id SERIAL PRIMARY KEY,
    link_id VARCHAR(20) NOT NULL REFERENCES tracking_links(link_id),
    telegram_user_id BIGINT NOT NULL, -- ID подписавшегося пользователя
    channel_id BIGINT NOT NULL, -- ID канала на который подписался
    click_id INTEGER REFERENCES link_clicks(id), -- Связь с переходом
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Индекс для быстрого поиска конверсий
    UNIQUE(telegram_user_id, channel_id, link_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_tracking_links_creator ON tracking_links(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_channel ON tracking_links(channel_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_active ON tracking_links(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_date ON link_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_link_clicks_utm_campaign ON link_clicks(utm_campaign);

CREATE INDEX IF NOT EXISTS idx_link_subscriptions_link_id ON link_subscriptions(link_id);
CREATE INDEX IF NOT EXISTS idx_link_subscriptions_user ON link_subscriptions(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_link_subscriptions_date ON link_subscriptions(subscribed_at);

-- Комментарии для документации
COMMENT ON TABLE tracking_links IS 'Трекинговые ссылки для аналитики переходов и подписок';
COMMENT ON TABLE link_clicks IS 'Переходы по трекинговым ссылкам с UTM метками';
COMMENT ON TABLE link_subscriptions IS 'Подписки пользователей после переходов по ссылкам';

COMMENT ON COLUMN tracking_links.link_id IS 'Короткий уникальный идентификатор для URL';
COMMENT ON COLUMN tracking_links.link_type IS 'Тип ссылки: post (на пост) или subscribe (подписка на канал)';
COMMENT ON COLUMN link_clicks.utm_source IS 'UTM Source - источник трафика';
COMMENT ON COLUMN link_subscriptions.click_id IS 'Связь с конкретным переходом для расчета конверсии';