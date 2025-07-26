import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool();

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
}); 