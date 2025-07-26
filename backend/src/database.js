const { Pool } = require('pg');
const Redis = require('redis');

// Настройка подключения к PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'telegram_webapp',
  user: process.env.POSTGRES_USER || 'webapp_user',
  password: process.env.POSTGRES_PASSWORD,
  max: 20, // Максимальное количество соединений в пуле
  idleTimeoutMillis: 30000, // Время ожидания перед закрытием неактивного соединения
  connectionTimeoutMillis: 2000, // Время ожидания подключения
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Настройка подключения к Redis
const redis = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

// Инициализация Redis
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// Класс для работы с базой данных
class Database {
  constructor() {
    this.pool = pool;
    this.redis = redis;
  }

  // Инициализация подключений
  async initialize() {
    try {
      // Проверка подключения к PostgreSQL
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Connected to PostgreSQL');

      // Подключение к Redis
      await this.redis.connect();
      
      return true;
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw error;
    }
  }

  // === ПОЛЬЗОВАТЕЛИ ===
  
  // Создание или обновление пользователя
  async upsertUser(telegramData) {
    const query = `
      INSERT INTO users (telegram_id, username, first_name, last_name, language_code, is_premium, is_bot, last_seen)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (telegram_id) 
      DO UPDATE SET 
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        language_code = EXCLUDED.language_code,
        is_premium = EXCLUDED.is_premium,
        last_seen = NOW()
      RETURNING *
    `;
    
    const values = [
      telegramData.id,
      telegramData.username || null,
      telegramData.first_name || null,
      telegramData.last_name || null,
      telegramData.language_code || null,
      telegramData.is_premium || false,
      telegramData.is_bot || false
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Получение пользователя по Telegram ID
  async getUserByTelegramId(telegramId) {
    const query = 'SELECT * FROM users WHERE telegram_id = $1';
    const result = await this.pool.query(query, [telegramId]);
    return result.rows[0];
  }

  // === КАНАЛЫ ===

  // Создание канала
  async createChannel(userId, channelData) {
    const query = `
      INSERT INTO channels (user_id, channel_id, channel_username, channel_title, channel_type, subscribers_count, bot_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      userId,
      channelData.channel_id || null,
      channelData.username,
      channelData.title,
      channelData.type || 'channel',
      channelData.subscribers_count || 0,
      channelData.bot_token || null
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Получение каналов пользователя
  async getUserChannels(userId) {
    const query = `
      SELECT c.*, 
             COUNT(p.id) as posts_count,
             AVG(p.engagement_rate) as avg_engagement
      FROM channels c
      LEFT JOIN posts p ON c.id = p.channel_id
      WHERE c.user_id = $1 AND c.is_active = true
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  // === ОТСЛЕЖИВАНИЕ ПОСТОВ ===

  // Создание отслеживания поста
  async createPostTracking(trackingData) {
    const query = `
      INSERT INTO post_tracking (tracking_id, user_id, original_url, tracking_url, post_title, channel_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      trackingData.tracking_id,
      trackingData.user_id,
      trackingData.original_url,
      trackingData.tracking_url,
      trackingData.post_title,
      trackingData.channel_name
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Получение отслеживания по ID
  async getTrackingById(trackingId) {
    const query = 'SELECT * FROM post_tracking WHERE tracking_id = $1 AND is_active = true';
    const result = await this.pool.query(query, [trackingId]);
    return result.rows[0];
  }

  // Получение всех отслеживаний пользователя
  async getUserTrackings(userId) {
    const query = `
      SELECT pt.*, 
             COUNT(tc.id) as total_clicks,
             COUNT(DISTINCT tc.user_telegram_id) as unique_visitors
      FROM post_tracking pt
      LEFT JOIN tracking_clicks tc ON pt.id = tc.tracking_id
      WHERE pt.user_id = $1 AND pt.is_active = true
      GROUP BY pt.id
      ORDER BY pt.created_at DESC
    `;
    
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  // Добавление клика по ссылке отслеживания
  async addTrackingClick(clickData) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Добавляем клик
      const insertClick = `
        INSERT INTO tracking_clicks (tracking_id, user_telegram_id, user_username, ip_address, user_agent, referer, source, medium, campaign)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const clickValues = [
        clickData.tracking_id,
        clickData.user_telegram_id,
        clickData.user_username,
        clickData.ip_address,
        clickData.user_agent,
        clickData.referer,
        clickData.source,
        clickData.medium,
        clickData.campaign
      ];
      
      const clickResult = await client.query(insertClick, clickValues);
      
      // Обновляем статистику отслеживания
      await client.query('SELECT update_tracking_stats($1)', [clickData.tracking_id]);
      
      await client.query('COMMIT');
      return clickResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Добавление действия пользователя
  async addUserAction(actionData) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Добавляем действие
      const insertAction = `
        INSERT INTO user_actions (tracking_id, user_telegram_id, action_type, action_data)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const actionValues = [
        actionData.tracking_id,
        actionData.user_telegram_id,
        actionData.action_type,
        JSON.stringify(actionData.action_data || {})
      ];
      
      const actionResult = await client.query(insertAction, actionValues);
      
      // Обновляем статистику отслеживания
      await client.query('SELECT update_tracking_stats($1)', [actionData.tracking_id]);
      
      await client.query('COMMIT');
      return actionResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // === РЕФЕРАЛЬНАЯ СИСТЕМА ===

  // Создание реферального кода
  async createReferral(referrerId, referralCode) {
    const query = `
      INSERT INTO referrals (referrer_id, referral_code)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [referrerId, referralCode]);
    return result.rows[0];
  }

  // Получение статистики рефералов
  async getReferralStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
        SUM(reward_amount) as total_earnings
      FROM referrals 
      WHERE referrer_id = $1
    `;
    
    const result = await this.pool.query(query, [userId]);
    return result.rows[0];
  }

  // === КЭШИРОВАНИЕ В REDIS ===

  // Сохранение в кэш
  async setCache(key, value, expireSeconds = 3600) {
    try {
      await this.redis.setEx(key, expireSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  // Получение из кэша
  async getCache(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  // Удаление из кэша
  async deleteCache(key) {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  // === АНАЛИТИКА ===

  // Получение статистики каналов
  async getChannelAnalytics(channelId) {
    const cacheKey = `channel_analytics_${channelId}`;
    const cached = await this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    const query = `
      SELECT 
        c.*,
        COUNT(p.id) as total_posts,
        AVG(p.views_count) as avg_views,
        AVG(p.engagement_rate) as avg_engagement,
        MAX(p.published_at) as last_post_date
      FROM channels c
      LEFT JOIN posts p ON c.id = p.channel_id
      WHERE c.id = $1
      GROUP BY c.id
    `;
    
    const result = await this.pool.query(query, [channelId]);
    const analytics = result.rows[0];
    
    // Кэшируем на 1 час
    await this.setCache(cacheKey, analytics, 3600);
    
    return analytics;
  }

  // Получение статистики отслеживания
  async getTrackingAnalytics(trackingId) {
    const cacheKey = `tracking_analytics_${trackingId}`;
    const cached = await this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    const query = `
      SELECT 
        pt.*,
        COUNT(tc.id) as total_clicks,
        COUNT(DISTINCT tc.user_telegram_id) as unique_visitors,
        COUNT(CASE WHEN ua.action_type = 'conversion' THEN 1 END) as conversions,
        COUNT(CASE WHEN ua.action_type = 'unsubscribe' THEN 1 END) as unsubscribes
      FROM post_tracking pt
      LEFT JOIN tracking_clicks tc ON pt.id = tc.tracking_id
      LEFT JOIN user_actions ua ON pt.id = ua.tracking_id
      WHERE pt.tracking_id = $1
      GROUP BY pt.id
    `;
    
    const result = await this.pool.query(query, [trackingId]);
    const analytics = result.rows[0];
    
    // Кэшируем на 30 минут
    await this.setCache(cacheKey, analytics, 1800);
    
    return analytics;
  }

  // Закрытие соединений
  async close() {
    await this.pool.end();
    await this.redis.quit();
  }
}

// Экспорт singleton instance
const database = new Database();

module.exports = database; 