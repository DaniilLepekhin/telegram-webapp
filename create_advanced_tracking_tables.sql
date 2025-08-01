-- Таблица для хранения трекинговых ссылок (расширенная версия)
CREATE TABLE IF NOT EXISTS tracking_links (
    id SERIAL PRIMARY KEY,
    link_id VARCHAR(20) UNIQUE NOT NULL, -- Короткий уникальный ID для ссылки
    creator_user_id BIGINT NOT NULL, -- ID создателя ссылки
    channel_id BIGINT NOT NULL, -- ID канала
    link_type VARCHAR(20) NOT NULL CHECK (link_type IN ('post', 'subscribe')), -- Тип ссылки
    target_url TEXT NOT NULL, -- Целевая ссылка (на пост или канал)
    title VARCHAR(255), -- Название ссылки для удобства
    description TEXT, -- Описание ссылки
    
    -- A/B тестирование
    ab_test_group VARCHAR(50), -- Группа A/B теста (A, B, C и т.д.)
    ab_test_name VARCHAR(100), -- Название эксперимента
    
    -- QR код
    qr_code_url TEXT, -- Ссылка на сгенерированный QR код
    
    -- Время жизни
    is_active BOOLEAN DEFAULT true, -- Активна ли ссылка
    expires_at TIMESTAMP, -- Время истечения (опционально)
    auto_disable_after_clicks INTEGER, -- Автоотключение после N переходов
    
    -- Метаданные
    default_utm_params JSONB, -- Дефолтные UTM параметры для ссылки
    click_count INTEGER DEFAULT 0, -- Счетчик переходов
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для хранения переходов по ссылкам (расширенная)
CREATE TABLE IF NOT EXISTS link_clicks (
    id SERIAL PRIMARY KEY,
    link_id VARCHAR(20) NOT NULL REFERENCES tracking_links(link_id),
    telegram_user_id BIGINT, -- ID пользователя из Telegram (если доступен)
    
    -- Все UTM метки в JSON для гибкости
    utm_params JSONB, -- Все UTM параметры в одном поле
    
    -- Технические данные
    user_agent TEXT, -- User Agent браузера
    ip_address INET, -- IP адрес (для геоаналитики)
    country VARCHAR(2), -- Код страны по IP
    city VARCHAR(100), -- Город по IP
    referer_url TEXT, -- Откуда пришел
    device_type VARCHAR(20), -- mobile, desktop, tablet
    browser VARCHAR(50), -- Браузер
    os VARCHAR(50), -- Операционная система
    
    -- A/B тестирование
    ab_test_group VARCHAR(50), -- Группа эксперимента
    
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для отслеживания подписок после переходов
CREATE TABLE IF NOT EXISTS link_subscriptions (
    id SERIAL PRIMARY KEY,
    link_id VARCHAR(20) NOT NULL REFERENCES tracking_links(link_id),
    telegram_user_id BIGINT NOT NULL, -- ID подписавшегося пользователя
    channel_id BIGINT NOT NULL, -- ID канала на который подписался
    click_id INTEGER REFERENCES link_clicks(id), -- Связь с переходом
    
    -- Время между переходом и подпиской (для анализа скорости конверсии)
    conversion_time_seconds INTEGER,
    
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Индекс для быстрого поиска конверсий
    UNIQUE(telegram_user_id, channel_id, link_id)
);

-- Таблица для A/B экспериментов
CREATE TABLE IF NOT EXISTS ab_experiments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- Название эксперимента
    description TEXT, -- Описание
    creator_user_id BIGINT NOT NULL, -- Кто создал
    
    -- Настройки распределения трафика
    groups JSONB NOT NULL, -- {"A": 50, "B": 30, "C": 20} - процентное распределение
    
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
    
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для шаблонов UTM меток
CREATE TABLE IF NOT EXISTS utm_templates (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- Владелец шаблона
    name VARCHAR(100) NOT NULL, -- Название шаблона
    utm_params JSONB NOT NULL, -- Сохраненные UTM параметры
    is_default BOOLEAN DEFAULT false, -- Шаблон по умолчанию
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, name)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_tracking_links_creator ON tracking_links(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_channel ON tracking_links(channel_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_active ON tracking_links(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tracking_links_ab_test ON tracking_links(ab_test_name);

CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_date ON link_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_link_clicks_utm_params ON link_clicks USING GIN(utm_params);
CREATE INDEX IF NOT EXISTS idx_link_clicks_country ON link_clicks(country);
CREATE INDEX IF NOT EXISTS idx_link_clicks_ab_group ON link_clicks(ab_test_group);

CREATE INDEX IF NOT EXISTS idx_link_subscriptions_link_id ON link_subscriptions(link_id);
CREATE INDEX IF NOT EXISTS idx_link_subscriptions_user ON link_subscriptions(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_link_subscriptions_date ON link_subscriptions(subscribed_at);
CREATE INDEX IF NOT EXISTS idx_link_subscriptions_conversion_time ON link_subscriptions(conversion_time_seconds);

CREATE INDEX IF NOT EXISTS idx_ab_experiments_status ON ab_experiments(status);
CREATE INDEX IF NOT EXISTS idx_ab_experiments_creator ON ab_experiments(creator_user_id);

CREATE INDEX IF NOT EXISTS idx_utm_templates_user ON utm_templates(user_id);

-- Функция для автоматического обновления счетчика кликов
CREATE OR REPLACE FUNCTION update_click_count() RETURNS TRIGGER AS $$
BEGIN
    UPDATE tracking_links 
    SET click_count = click_count + 1, updated_at = CURRENT_TIMESTAMP 
    WHERE link_id = NEW.link_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления счетчика
CREATE TRIGGER trigger_update_click_count
    AFTER INSERT ON link_clicks
    FOR EACH ROW
    EXECUTE FUNCTION update_click_count();

-- Функция для расчета времени конверсии
CREATE OR REPLACE FUNCTION calculate_conversion_time() RETURNS TRIGGER AS $$
BEGIN
    -- Находим последний клик этого пользователя по этой ссылке
    SELECT EXTRACT(EPOCH FROM (NEW.subscribed_at - lc.clicked_at))::INTEGER
    INTO NEW.conversion_time_seconds
    FROM link_clicks lc
    WHERE lc.link_id = NEW.link_id 
      AND lc.telegram_user_id = NEW.telegram_user_id
    ORDER BY lc.clicked_at DESC
    LIMIT 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического расчета времени конверсии
CREATE TRIGGER trigger_calculate_conversion_time
    BEFORE INSERT ON link_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_conversion_time();

-- Комментарии для документации
COMMENT ON TABLE tracking_links IS 'Трекинговые ссылки с поддержкой A/B тестирования и QR кодов';
COMMENT ON TABLE link_clicks IS 'Переходы по ссылкам с расширенной аналитикой и геоданными';
COMMENT ON TABLE link_subscriptions IS 'Подписки с расчетом времени конверсии';
COMMENT ON TABLE ab_experiments IS 'A/B эксперименты с настройками распределения трафика';
COMMENT ON TABLE utm_templates IS 'Шаблоны UTM меток для быстрого создания ссылок';

COMMENT ON COLUMN link_clicks.utm_params IS 'Все UTM параметры в JSON формате для гибкости';
COMMENT ON COLUMN link_clicks.country IS 'Код страны определенный по IP адресу';
COMMENT ON COLUMN ab_experiments.groups IS 'JSON с процентным распределением групп эксперимента';
COMMENT ON COLUMN link_subscriptions.conversion_time_seconds IS 'Время от клика до подписки в секундах';