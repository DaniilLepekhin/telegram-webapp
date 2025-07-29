const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const TelegramBotAPI = require('./telegram-api');
const TrackingSystem = require('./tracking-system');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Инициализация Telegram Bot API
const telegramAPI = new TelegramBotAPI(process.env.TELEGRAM_BOT_TOKEN);

// Инициализация системы трекинга
const trackingSystem = new TrackingSystem(pool);

// API для получения каналов пользователя
app.post('/api/telegram/get-channels', async (req, res) => {
  try {
    const { initData, user } = req.body;

    if (!initData || !user) {
      return res.status(400).json({
        success: false,
        error: 'Отсутствуют данные от Telegram WebApp'
      });
    }

    // Временно отключаем валидацию initData для тестирования
    // const isValid = await telegramAPI.validateInitData(initData);
    // if (!isValid) {
    //   return res.status(401).json({
    //     success: false,
    //     error: 'Недействительные данные от Telegram WebApp'
    //   });
    // }

    const userId = user.id;

    // Получаем каналы пользователя из базы данных
    const query = `
      SELECT
        c.id,
        c.title,
        c.username,
        c.type,
        c.member_count as "memberCount",
        c.created_at,
        c.updated_at,
        uc.is_admin as "isAdmin",
        uc.bot_is_admin as "botIsAdmin",
        uc.can_invite_users as "canInviteUsers",
        uc.last_checked_at
      FROM channels c
      INNER JOIN user_channels uc ON c.id = uc.channel_id
      WHERE uc.user_id = $1 AND uc.is_admin = true
      ORDER BY c.title ASC
    `;

    const result = await pool.query(query, [userId]);

    // Преобразуем данные в формат, ожидаемый фронтендом
    const channels = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      username: row.username,
      type: row.type,
      memberCount: row.memberCount,
      isAdmin: row.isAdmin,
      canInviteUsers: row.canInviteUsers || false,
      botIsAdmin: row.botIsAdmin
    }));

    res.json({
      success: true,
      channels: channels
    });
  } catch (error) {
    console.error('Ошибка получения каналов:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend работает!' });
});

// Пример запроса к БД
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для приёма данных от WebApp
app.post('/api/webapp-data', async (req, res) => {
  const { initData, payload } = req.body;
  // Здесь можно добавить валидацию initData через Telegram Bot API
  if (!initData || !payload) {
    return res.status(400).json({ error: 'initData и payload обязательны' });
  }
  // Пример: сохраняем данные в БД или обрабатываем их
  // await pool.query('INSERT INTO webapp_data (init_data, payload) VALUES ($1, $2)', [initData, JSON.stringify(payload)]);
  res.json({ ok: true, message: 'Данные получены', received: { initData, payload } });
});

// Эндпоинт для получения данных пользователя
app.get('/api/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Здесь будет запрос к БД для получения данных пользователя
    // const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    res.json({
      id: userId,
      name: 'Демо Пользователь',
      username: '@demo_user',
      level: 7,
      experience: 1250,
      stats: {
        totalSessions: 45,
        totalMessages: 342,
        favoriteBots: 3,
        referralEarnings: 2400,
        daysActive: 28
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для реферальной системы
app.post('/api/referral/create', async (req, res) => {
  const { userId, referralCode } = req.body;
  try {
    // Здесь будет логика создания реферальной ссылки
    const referralLink = `https://t.me/your_bot?start=${referralCode}`;
    res.json({ 
      ok: true, 
      referralCode, 
      referralLink,
      message: 'Реферальная ссылка создана' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для получения статистики рефералов
app.get('/api/referral/stats/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Здесь будет запрос к БД для получения статистики рефералов
    res.json({
      totalReferrals: 12,
      activeReferrals: 8,
      totalEarnings: 2400,
      referralCode: 'DEMO123'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для аналитики
app.get('/api/analytics', async (req, res) => {
  try {
    // Здесь будет запрос к БД для получения аналитики
    res.json({
      totalUsers: 15420,
      activeUsers: 3240,
      weeklyGrowth: 15.2,
      averageSessionTime: 8.5,
      dailyUsers: [120, 145, 132, 167, 189, 201, 234],
      popularBots: [
        { name: 'E-commerce Bot', usage: 45 },
        { name: 'Support Assistant', usage: 38 },
        { name: 'Fitness Coach', usage: 32 },
        { name: 'Language Tutor', usage: 28 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для отзывов
app.post('/api/feedback', async (req, res) => {
  const { userId, rating, comment, category } = req.body;
  try {
    // Здесь будет сохранение отзыва в БД
    // await pool.query('INSERT INTO feedback (user_id, rating, comment, category) VALUES ($1, $2, $3, $4)', [userId, rating, comment, category]);
    res.json({ 
      ok: true, 
      message: 'Отзыв сохранен',
      feedback: { userId, rating, comment, category }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для получения отзывов
app.get('/api/feedback', async (req, res) => {
  try {
    // Здесь будет запрос к БД для получения отзывов
    res.json([
      {
        id: '1',
        user: 'Алексей К.',
        rating: 5,
        comment: 'Отличный сервис! Боты работают быстро и качественно.',
        date: '2024-02-15',
        category: 'general'
      },
      {
        id: '2',
        user: 'Мария С.',
        rating: 4,
        comment: 'Хорошая платформа, но хотелось бы больше бесплатных функций.',
        date: '2024-02-14',
        category: 'suggestion'
      }
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для получения данных каналов пользователя
app.get('/api/channels/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Здесь будет запрос к БД для получения каналов пользователя
    res.json([
      {
        id: '1',
        name: 'Мой канал',
        username: '@my_channel',
        subscribers: 15420,
        growth: 234,
        sources: [
          { name: 'Органический трафик', count: 8920, percentage: 58, color: '#10B981' },
          { name: 'Реклама ВКонтакте', count: 3240, percentage: 21, color: '#3B82F6' },
          { name: 'Instagram Ads', count: 2160, percentage: 14, color: '#F59E0B' },
          { name: 'Google Ads', count: 1100, percentage: 7, color: '#EF4444' }
        ],
        dailyStats: [
          { date: '2024-02-15', subscribers: 156, unsubscribers: 12, netGrowth: 144 },
          { date: '2024-02-14', subscribers: 189, unsubscribers: 8, netGrowth: 181 },
          { date: '2024-02-13', subscribers: 145, unsubscribers: 15, netGrowth: 130 },
          { date: '2024-02-12', subscribers: 201, unsubscribers: 6, netGrowth: 195 },
          { date: '2024-02-11', subscribers: 178, unsubscribers: 11, netGrowth: 167 },
          { date: '2024-02-10', subscribers: 234, unsubscribers: 9, netGrowth: 225 },
          { date: '2024-02-09', subscribers: 167, unsubscribers: 13, netGrowth: 154 }
        ]
      }
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для добавления бота в канал
app.post('/api/telegram/add-bot', async (req, res) => {
  try {
    const { channelId, permissions } = req.body;

    if (!channelId) {
      return res.status(400).json({
        success: false,
        error: 'Необходим channelId'
      });
    }

    const result = await telegramAPI.addBotToChannel(channelId, permissions);
    
    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Ошибка добавления бота в канал'
      });
    }

    res.json({
      success: true,
      message: 'Бот успешно добавлен в канал'
    });
  } catch (error) {
    console.error('Ошибка добавления бота:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Эндпоинт для добавления нового канала
app.post('/api/channels', async (req, res) => {
  const { userId, channelName, channelUsername } = req.body;
  try {
    // Здесь будет сохранение канала в БД
    const newChannel = {
      id: Date.now().toString(),
      name: channelName,
      username: channelUsername,
      subscribers: 0,
      growth: 0,
      sources: [],
      dailyStats: []
    };
    res.json({ ok: true, channel: newChannel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для генерации ссылки подписки с проверкой
app.post('/api/subscription-link', async (req, res) => {
  const { channelId, channelName, userId } = req.body;
  try {
    // Здесь будет генерация уникальной ссылки с проверкой подписки
    const subscriptionLink = `https://t.me/your_bot?start=sub_${channelId}_${userId}`;
    res.json({ 
      ok: true, 
      subscriptionLink,
      message: 'Ссылка с проверкой подписки создана'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для подключения рекламной платформы
app.post('/api/ads-platform/connect', async (req, res) => {
  const { userId, channelId, platform, apiKey } = req.body;
  try {
    // Здесь будет подключение к рекламной платформе (ВК, Instagram, Google Ads и т.д.)
    res.json({ 
      ok: true, 
      message: `Платформа ${platform} подключена успешно`,
      platform,
      connected: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для получения статистики по рекламным платформам
app.get('/api/ads-platform/stats/:channelId', async (req, res) => {
  const { channelId } = req.params;
  try {
    // Здесь будет получение статистики по рекламным платформам
    res.json({
      vkontakte: { subscribers: 3240, conversion: 21, cost: 15000 },
      instagram: { subscribers: 2160, conversion: 14, cost: 12000 },
      googleAds: { subscribers: 1100, conversion: 7, cost: 8000 },
      facebook: { subscribers: 890, conversion: 6, cost: 6000 }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для ежедневного отчёта
app.get('/api/daily-report/:channelId', async (req, res) => {
  const { channelId } = req.params;
  try {
    // Здесь будет генерация ежедневного отчёта
    res.json({
      date: new Date().toISOString().split('T')[0],
      subscribers: 156,
      unsubscribers: 12,
      netGrowth: 144,
      sources: {
        organic: 90,
        vkontakte: 35,
        instagram: 20,
        googleAds: 11
      },
      conversion: 15.2
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для получения постов канала
app.get('/api/posts/:channelId', async (req, res) => {
  const { channelId } = req.params;
  try {
    // Здесь будет запрос к БД для получения постов канала
    res.json([
      {
        id: '1',
        channelId: channelId,
        title: 'Как увеличить продажи в 3 раза',
        content: 'Практические советы по увеличению продаж...',
        postUrl: 'https://t.me/my_channel/123',
        publishDate: '2024-02-15',
        views: 15420,
        likes: 892,
        comments: 156,
        shares: 234,
        saves: 89,
        clicks: 1234,
        conversions: 67,
        engagementRate: 8.5,
        ctr: 8.0,
        conversionRate: 5.4,
        trafficSources: [
          { name: 'Органический трафик', count: 8920, percentage: 58, color: '#10B981' },
          { name: 'Реклама ВКонтакте', count: 3240, percentage: 21, color: '#3B82F6' },
          { name: 'Instagram Ads', count: 2160, percentage: 14, color: '#F59E0B' },
          { name: 'Прямые переходы', count: 1100, percentage: 7, color: '#EF4444' }
        ],
        dailyStats: [
          { date: '2024-02-15', views: 2340, likes: 156, comments: 23, shares: 45, clicks: 234 },
          { date: '2024-02-14', views: 1890, likes: 134, comments: 19, shares: 38, clicks: 189 },
          { date: '2024-02-13', views: 1456, likes: 98, comments: 15, shares: 29, clicks: 145 },
          { date: '2024-02-12', views: 2012, likes: 167, comments: 28, shares: 52, clicks: 201 },
          { date: '2024-02-11', views: 1789, likes: 145, comments: 22, shares: 41, clicks: 178 },
          { date: '2024-02-10', views: 2345, likes: 198, comments: 31, shares: 58, clicks: 234 },
          { date: '2024-02-09', views: 1678, likes: 123, comments: 18, shares: 34, clicks: 167 }
        ]
      },
      {
        id: '2',
        channelId: channelId,
        title: 'Новый продукт уже в продаже!',
        content: 'Представляем наш новый продукт...',
        postUrl: 'https://t.me/my_channel/124',
        publishDate: '2024-02-14',
        views: 8920,
        likes: 567,
        comments: 89,
        shares: 123,
        saves: 45,
        clicks: 892,
        conversions: 45,
        engagementRate: 9.2,
        ctr: 10.0,
        conversionRate: 5.0,
        trafficSources: [
          { name: 'Органический трафик', count: 5340, percentage: 60, color: '#10B981' },
          { name: 'Реклама ВКонтакте', count: 1780, percentage: 20, color: '#3B82F6' },
          { name: 'Instagram Ads', count: 1240, percentage: 14, color: '#F59E0B' },
          { name: 'Прямые переходы', count: 560, percentage: 6, color: '#EF4444' }
        ],
        dailyStats: [
          { date: '2024-02-14', views: 1890, likes: 134, comments: 19, shares: 38, clicks: 189 },
          { date: '2024-02-13', views: 1456, likes: 98, comments: 15, shares: 29, clicks: 145 },
          { date: '2024-02-12', views: 2012, likes: 167, comments: 28, shares: 52, clicks: 201 },
          { date: '2024-02-11', views: 1789, likes: 145, comments: 22, shares: 41, clicks: 178 },
          { date: '2024-02-10', views: 2345, likes: 198, comments: 31, shares: 58, clicks: 234 },
          { date: '2024-02-09', views: 1678, likes: 123, comments: 18, shares: 34, clicks: 167 },
          { date: '2024-02-08', views: 1456, likes: 98, comments: 15, shares: 29, clicks: 145 }
        ]
      }
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для добавления нового поста
app.post('/api/posts', async (req, res) => {
  const { channelId, title, content, postUrl } = req.body;
  try {
    // Здесь будет сохранение поста в БД
    const newPost = {
      id: Date.now().toString(),
      channelId,
      title,
      content,
      postUrl,
      publishDate: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      conversions: 0,
      engagementRate: 0,
      ctr: 0,
      conversionRate: 0,
      trafficSources: [],
      dailyStats: []
    };
    res.json({ ok: true, post: newPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для генерации ссылки отслеживания поста
app.post('/api/post-tracking/create', async (req, res) => {
  const { originalUrl, postTitle, channelName, userId } = req.body;
  try {
    // Извлекаем ID поста из URL
    const urlParts = originalUrl.split('/');
    const postId = urlParts[urlParts.length - 1];
    const channelUsername = urlParts[urlParts.length - 2];

    // Создаём уникальную ссылку отслеживания
    const trackingId = Date.now().toString();
    const trackingUrl = `https://t.me/your_bot?start=track_${trackingId}_${postId}`;
    
    // Здесь будет сохранение в БД
    const trackingData = {
      id: trackingId,
      originalUrl,
      trackingUrl,
      postTitle,
      channelName,
      postId,
      channelUsername,
      userId,
      createdAt: new Date().toISOString(),
      stats: {
        totalClicks: 0,
        uniqueVisitors: 0,
        conversions: 0,
        unsubscribes: 0,
        avgTimeOnPost: 0,
        bounceRate: 0,
        sources: [],
        dailyStats: []
      }
    };

    res.json({ 
      ok: true, 
      trackingData,
      message: 'Ссылка отслеживания создана'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для обработки перехода по ссылке отслеживания
app.get('/api/post-tracking/:trackingId', async (req, res) => {
  const { trackingId } = req.params;
  const { source, utm_source, utm_medium, utm_campaign } = req.query;
  
  try {
    // Здесь будет получение данных отслеживания из БД
    // const trackingData = await getTrackingData(trackingId);
    
    // Логируем переход
    const clickData = {
      trackingId,
      timestamp: new Date().toISOString(),
      source: source || utm_source || 'direct',
      medium: utm_medium || 'webapp',
      campaign: utm_campaign || 'post_tracking',
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      referer: req.headers.referer
    };

    console.log('Переход по ссылке отслеживания:', clickData);

    // Обновляем статистику
    // await updateTrackingStats(trackingId, clickData);

    // Перенаправляем на оригинальный пост
    const originalUrl = 'https://t.me/kristina_egiazarova14/9026'; // В реальности из БД
    res.redirect(originalUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для получения статистики отслеживания
app.get('/api/post-tracking/:trackingId/stats', async (req, res) => {
  const { trackingId } = req.params;
  try {
    // Здесь будет запрос к БД для получения статистики
    res.json({
      trackingId,
      totalClicks: 1234,
      uniqueVisitors: 892,
      conversions: 67,
      unsubscribes: 12,
      avgTimeOnPost: 45,
      bounceRate: 23,
      sources: [
        { name: 'Органический трафик', clicks: 720, conversions: 45, percentage: 58, color: '#10B981' },
        { name: 'Реклама ВКонтакте', clicks: 320, conversions: 15, percentage: 26, color: '#3B82F6' },
        { name: 'Instagram Ads', clicks: 120, conversions: 5, percentage: 10, color: '#F59E0B' },
        { name: 'Прямые переходы', clicks: 74, conversions: 2, percentage: 6, color: '#EF4444' }
      ],
      dailyStats: [
        { date: '2024-02-15', clicks: 234, uniqueVisitors: 189, conversions: 12, unsubscribes: 2 },
        { date: '2024-02-14', clicks: 189, uniqueVisitors: 156, conversions: 8, unsubscribes: 1 },
        { date: '2024-02-13', clicks: 145, uniqueVisitors: 123, conversions: 6, unsubscribes: 3 },
        { date: '2024-02-12', clicks: 201, uniqueVisitors: 167, conversions: 11, unsubscribes: 2 },
        { date: '2024-02-11', clicks: 178, uniqueVisitors: 145, conversions: 9, unsubscribes: 1 },
        { date: '2024-02-10', clicks: 234, uniqueVisitors: 198, conversions: 15, unsubscribes: 2 },
        { date: '2024-02-09', clicks: 167, uniqueVisitors: 134, conversions: 7, unsubscribes: 1 }
      ],
      userBehavior: [
        {
          userId: 'user_123',
          timestamp: '2024-02-15T10:30:00Z',
          action: 'click',
          source: 'vk_ads',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
        },
        {
          userId: 'user_456',
          timestamp: '2024-02-15T11:15:00Z',
          action: 'unsubscribe',
          source: 'organic',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для отслеживания действий пользователя (отписка, подписка и т.д.)
app.post('/api/post-tracking/:trackingId/action', async (req, res) => {
  const { trackingId } = req.params;
  const { action, userId, source, userAgent } = req.body;
  
  try {
    // Логируем действие пользователя
    const actionData = {
      trackingId,
      userId,
      action, // 'unsubscribe', 'subscribe', 'share', 'conversion'
      timestamp: new Date().toISOString(),
      source,
      userAgent,
      ip: req.ip
    };

    console.log('Действие пользователя:', actionData);

    // Обновляем статистику
    // await updateUserAction(trackingId, actionData);

    res.json({ 
      ok: true, 
      message: 'Действие зафиксировано',
      action: actionData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для получения всех отслеживаемых постов пользователя
app.get('/api/post-tracking/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Здесь будет запрос к БД для получения всех отслеживаемых постов
    res.json([
      {
        id: '1',
        originalUrl: 'https://t.me/kristina_egiazarova14/9026',
        trackingUrl: 'https://t.me/your_bot?start=track_1_9026',
        postTitle: 'Как увеличить продажи в 3 раза',
        channelName: '@kristina_egiazarova14',
        createdAt: '2024-02-15',
        stats: {
          totalClicks: 1234,
          uniqueVisitors: 892,
          conversions: 67,
          unsubscribes: 12
        }
      }
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для генерации UTM-ссылки
app.post('/api/post-tracking/utm-link', async (req, res) => {
  const { originalUrl, trackingId, campaign } = req.body;
  try {
    const utmParams = new URLSearchParams({
      utm_source: 'telegram',
      utm_medium: 'webapp',
      utm_campaign: campaign || `track_${trackingId}`,
      utm_content: 'post_tracking'
    });
    
    const utmLink = `${originalUrl}?${utmParams.toString()}`;
    
    res.json({ 
      ok: true, 
      utmLink,
      message: 'UTM-ссылка создана'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Маршруты для работы с каналами
// Получить все каналы пользователя с правами
app.get('/api/channels/user-channels/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT 
        c.id,
        c.title,
        c.username,
        c.type,
        c.member_count,
        c.created_at,
        c.updated_at,
        uc.is_admin,
        uc.bot_is_admin,
        uc.last_checked_at
      FROM channels c
      INNER JOIN user_channels uc ON c.id = uc.channel_id
      WHERE uc.user_id = $1
      ORDER BY c.title ASC
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.json({
      success: true,
      channels: result.rows
    });
  } catch (error) {
    console.error('Error fetching user channels:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении каналов'
    });
  }
});

// Проверить актуальность прав в конкретном канале
app.post('/api/channels/check-permissions/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userId } = req.body;
    
    // Здесь должна быть интеграция с Telegram Bot API
    // для проверки актуальных прав пользователя и бота в канале
    // Пока возвращаем моковые данные
    const permissions = {
      userIsAdmin: true,
      botIsAdmin: true,
      userRole: 'administrator',
      botRole: 'administrator'
    };
    
    // Обновляем права в базе данных
    const updateQuery = `
      UPDATE user_channels 
      SET 
        is_admin = $1,
        bot_is_admin = $2,
        last_checked_at = NOW()
      WHERE channel_id = $3 AND user_id = $4
    `;
    
    await pool.query(updateQuery, [
      permissions.userIsAdmin,
      permissions.botIsAdmin,
      channelId,
      userId
    ]);
    
    res.json({
      success: true,
      permissions: {
        userIsAdmin: permissions.userIsAdmin,
        botIsAdmin: permissions.botIsAdmin,
        lastChecked: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error checking channel permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при проверке прав'
    });
  }
});

// Добавить новый канал
app.post('/api/channels/add-channel', async (req, res) => {
  try {
    const { userId, channelId, title, username, type, memberCount } = req.body;
    
    // Проверяем, существует ли канал
    const existingChannel = await pool.query(
      'SELECT id FROM channels WHERE id = $1',
      [channelId]
    );
    
    if (existingChannel.rows.length === 0) {
      // Добавляем новый канал
      await pool.query(`
        INSERT INTO channels (id, title, username, type, member_count)
        VALUES ($1, $2, $3, $4, $5)
      `, [channelId, title, username, type, memberCount]);
    }
    
    // Добавляем связь пользователя с каналом
    await pool.query(`
      INSERT INTO user_channels (user_id, channel_id, is_admin, bot_is_admin, last_checked_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, channel_id) 
      DO UPDATE SET 
        is_admin = EXCLUDED.is_admin,
        bot_is_admin = EXCLUDED.bot_is_admin,
        last_checked_at = NOW()
    `, [userId, channelId, true, true]); // Предполагаем, что если добавляем, то права есть
    
    res.json({
      success: true,
      message: 'Канал успешно добавлен'
    });
  } catch (error) {
    console.error('Error adding channel:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при добавлении канала'
    });
  }
});

// Получить статистику постов канала
app.get('/api/channels/channel-posts/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const query = `
      SELECT 
        p.id,
        p.text,
        p.media_count,
        p.button_count,
        p.sent_at,
        p.views,
        p.clicks,
        CASE 
          WHEN p.views > 0 THEN ROUND((p.clicks::float / p.views * 100), 2)
          ELSE 0 
        END as ctr
      FROM posts p
      WHERE p.channel_id = $1
      ORDER BY p.sent_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [channelId, limit, offset]);
    
    res.json({
      success: true,
      posts: result.rows
    });
  } catch (error) {
    console.error('Error fetching channel posts:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении постов'
    });
  }
});

// Сохранить новый пост
app.post('/api/channels/save-post', async (req, res) => {
  try {
    const { channelId, text, mediaCount, buttonCount, buttons } = req.body;
    
    const query = `
      INSERT INTO posts (channel_id, text, media_count, button_count, buttons, sent_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `;
    
    const result = await pool.query(query, [
      channelId,
      text,
      mediaCount,
      buttonCount,
      JSON.stringify(buttons)
    ]);
    
    res.json({
      success: true,
      postId: result.rows[0].id,
      message: 'Пост сохранен'
    });
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при сохранении поста'
    });
  }
});

// Обновить статистику поста
app.put('/api/channels/update-post-stats/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { views, clicks } = req.body;
    
    const query = `
      UPDATE posts 
      SET views = $1, clicks = $2, updated_at = NOW()
      WHERE id = $3
    `;
    
    await pool.query(query, [views, clicks, postId]);
    
    res.json({
      success: true,
      message: 'Статистика обновлена'
    });
  } catch (error) {
    console.error('Error updating post stats:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при обновлении статистики'
    });
  }
});

// API для создания трекинговой ссылки
app.post('/api/telegram/create-tracking-link', async (req, res) => {
  try {
    const { channelId, userId, name, postId, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, tag } = req.body;

    if (!channelId || !userId || !name) {
      return res.status(400).json({
        success: false,
        error: 'Необходимы channelId, userId и name'
      });
    }

    // Генерируем уникальный хеш для ссылки
    const linkHash = trackingSystem.generateLinkHash();

    const query = `
      INSERT INTO tracking_links 
      (channel_id, user_id, name, link_hash, post_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content, tag)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      channelId, userId, name, linkHash, postId || null,
      utmSource || null, utmMedium || null, utmCampaign || null,
      utmTerm || null, utmContent || null, tag || null
    ];

    const result = await pool.query(query, values);
    const newLink = result.rows[0];

    res.json({
      success: true,
      link: {
        id: newLink.id,
        name: newLink.name,
        linkHash: newLink.link_hash,
        postId: newLink.post_id,
        utmSource: newLink.utm_source,
        utmMedium: newLink.utm_medium,
        utmCampaign: newLink.utm_campaign,
        utmTerm: newLink.utm_term,
        utmContent: newLink.utm_content,
        tag: newLink.tag,
        isActive: newLink.is_active,
        createdAt: newLink.created_at
      }
    });
  } catch (error) {
    console.error('Ошибка создания трекинговой ссылки:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// API для получения трекинговых ссылок канала
app.get('/api/telegram/tracking-links/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;

    const query = `
      SELECT 
        id, name, link_hash, post_id, utm_source, utm_medium, 
        utm_campaign, utm_term, utm_content, tag, is_active, created_at
      FROM tracking_links 
      WHERE channel_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [channelId]);
    const links = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      linkHash: row.link_hash,
      postId: row.post_id,
      utmSource: row.utm_source,
      utmMedium: row.utm_medium,
      utmCampaign: row.utm_campaign,
      utmTerm: row.utm_term,
      utmContent: row.utm_content,
      tag: row.tag,
      isActive: row.is_active,
      createdAt: row.created_at
    }));

    res.json({
      success: true,
      links: links
    });
  } catch (error) {
    console.error('Ошибка получения трекинговых ссылок:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// API для удаления трекинговой ссылки
app.delete('/api/telegram/tracking-links/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;

    const query = 'DELETE FROM tracking_links WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [linkId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ссылка не найдена'
      });
    }

    res.json({
      success: true,
      message: 'Ссылка успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка удаления трекинговой ссылки:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// API для получения статистики канала
app.get('/api/telegram/channel-stats/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;

    // Получаем статистику через систему трекинга
    const stats = await trackingSystem.getChannelStats(channelId);
    
    if (!stats.success) {
      return res.status(500).json(stats);
    }

    res.json({
      success: true,
      stats: stats.stats
    });
  } catch (error) {
    console.error('Ошибка получения статистики канала:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// API для получения ежедневной статистики
app.get('/api/telegram/daily-stats/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { days = 30 } = req.query;

    const stats = await trackingSystem.getDailyStats(channelId, parseInt(days));
    
    if (!stats.success) {
      return res.status(500).json(stats);
    }

    res.json({
      success: true,
      dailyStats: stats.dailyStats
    });
  } catch (error) {
    console.error('Ошибка получения ежедневной статистики:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// API для трекинга клика по ссылке
app.post('/api/track/:linkHash', async (req, res) => {
  try {
    const { linkHash } = req.params;
    const userData = {
      userId: req.body.userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer')
    };

    const result = await trackingSystem.trackClick(linkHash, userData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Перенаправляем на канал или пост
    const link = result.link;
    let redirectUrl = `https://t.me/${link.channelId}`;
    
    if (link.postId) {
      redirectUrl += `/${link.postId}`;
    }

    res.json({
      success: true,
      clickId: result.clickId,
      redirectUrl: redirectUrl
    });
  } catch (error) {
    console.error('Ошибка трекинга клика:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// API для отметки конверсии
app.post('/api/conversion', async (req, res) => {
  try {
    const { clickId, userId, channelId } = req.body;

    if (!clickId || !userId || !channelId) {
      return res.status(400).json({
        success: false,
        error: 'Необходимы clickId, userId и channelId'
      });
    }

    const result = await trackingSystem.markConversion(clickId, userId, channelId);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: 'Конверсия отмечена'
    });
  } catch (error) {
    console.error('Ошибка отметки конверсии:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// API для получения информации о боте
app.get('/api/telegram/bot-info', async (req, res) => {
  try {
    const botInfo = await telegramAPI.getBotInfo();
    
    if (!botInfo) {
      return res.status(500).json({
        success: false,
        error: 'Ошибка получения информации о боте'
      });
    }

    res.json({
      success: true,
      bot: botInfo
    });
  } catch (error) {
    console.error('Ошибка получения информации о боте:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
}); 