import express from 'express';
import { Pool } from 'pg';
import { TelegramService } from '../services/telegramService';

const router = express.Router();

// Инициализация сервиса
const telegramService = new TelegramService(
  new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'telegram_webapp',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  }),
  process.env.TELEGRAM_BOT_TOKEN || ''
);

// Получение каналов пользователя
router.post('/get-channels', async (req, res) => {
  try {
    const { initData, user, sessionId } = req.body;

    if (!initData || !user) {
      return res.status(400).json({
        success: false,
        error: 'Missing initData or user information'
      });
    }

    // Получаем пользователя из initData
    const telegramUser = await telegramService.getUserFromInitData(initData);
    
    if (!telegramUser) {
      return res.status(400).json({
        success: false,
        error: 'Invalid initData'
      });
    }

    // Сохраняем/обновляем пользователя
    await telegramService.saveOrUpdateUser(
      telegramUser, 
      sessionId, 
      req.headers['user-agent'], 
      req.ip
    );

    // Сохраняем аналитику
    await telegramService.saveUserAnalytics(
      telegramUser.id, 
      'page_view', 
      { page: 'channels' }, 
      '/channels', 
      sessionId
    );

    console.log(`Getting channels for user: ${telegramUser.id} (${telegramUser.first_name})`);

    // Получаем каналы пользователя с кешированием
    const channels = await telegramService.getUserChannels(telegramUser.id);

    // Форматируем ответ для фронтенда
    const formattedChannels = channels.map(channel => ({
      id: channel.id,
      title: channel.title,
      username: channel.username,
      type: channel.type,
      memberCount: channel.member_count,
      isAdmin: true,
      canInviteUsers: true,
      botIsAdmin: true // Предполагаем, что бот админ, если канал в списке
    }));

    console.log(`Returning ${formattedChannels.length} channels for user ${telegramUser.id}`);

    res.json({
      success: true,
      channels: formattedChannels,
      user: {
        id: telegramUser.id,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username
      }
    });

  } catch (error) {
    console.error('Error in /get-channels:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Webhook для обработки событий бота
router.post('/webhook', async (req, res) => {
  try {
    const { message, channel_post, my_chat_member } = req.body;
    
    console.log('Webhook received:', JSON.stringify(req.body, null, 2));

    // Обработка добавления бота в чат
    if (my_chat_member && my_chat_member.new_chat_member.status === 'administrator') {
      const chatId = my_chat_member.chat.id;
      console.log(`Bot added as admin to chat: ${chatId}`);
      await telegramService.handleBotAddedToChat(chatId);
    }

    // Обработка удаления бота из чата
    if (my_chat_member && my_chat_member.new_chat_member.status === 'left') {
      const chatId = my_chat_member.chat.id;
      console.log(`Bot removed from chat: ${chatId}`);
      await telegramService.handleBotRemovedFromChat(chatId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in webhook:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Публикация поста
router.post('/publish-post', async (req, res) => {
  try {
    const { initData, post } = req.body;

    if (!initData || !post) {
      return res.status(400).json({
        success: false,
        error: 'Missing initData or post data'
      });
    }

    const telegramUser = await telegramService.getUserFromInitData(initData);
    
    if (!telegramUser) {
      return res.status(400).json({
        success: false,
        error: 'Invalid initData'
      });
    }

    // Проверяем права пользователя в канале
    const memberStatus = await telegramService.checkUserStatus(
      parseInt(post.channelId), 
      telegramUser.id
    );

    if (!memberStatus || (memberStatus.status !== 'creator' && memberStatus.status !== 'administrator')) {
      return res.status(403).json({
        success: false,
        error: 'User is not admin in this channel'
      });
    }

    // Сохраняем пост в базу
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'telegram_webapp',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });

    const result = await pool.query(
      `INSERT INTO posts (user_id, chat_id, title, content, buttons, media, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       RETURNING id`,
      [
        telegramUser.id,
        parseInt(post.channelId),
        post.title,
        post.content,
        JSON.stringify(post.buttons || []),
        JSON.stringify(post.media || []),
        'published'
      ]
    );

    console.log(`Post published: ID ${result.rows[0].id} by user ${telegramUser.id}`);

    res.json({
      success: true,
      postId: result.rows[0].id,
      message: 'Post published successfully'
    });

  } catch (error) {
    console.error('Error in /publish-post:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Получение истории постов
router.get('/posts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { initData } = req.query;

    if (!initData) {
      return res.status(400).json({
        success: false,
        error: 'Missing initData'
      });
    }

    const telegramUser = await telegramService.getUserFromInitData(initData as string);
    
    if (!telegramUser || telegramUser.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'telegram_webapp',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });

    const result = await pool.query(
      `SELECT p.*, tc.chat_title as channel_name
       FROM posts p
       JOIN telegram_chats tc ON p.chat_id = tc.chat_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({
      success: true,
      posts: result.rows
    });

  } catch (error) {
    console.error('Error in /posts/:userId:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Webhook для обработки событий бота
router.post('/webhook', async (req, res) => {
  try {
    const { message, my_chat_member } = req.body;

    if (my_chat_member) {
      const chatId = my_chat_member.chat.id;
      
      if (my_chat_member.new_chat_member.status === 'administrator' || 
          my_chat_member.new_chat_member.status === 'member') {
        // Бот добавлен в чат
        await telegramService.handleBotAddedToChat(chatId);
      } else if (my_chat_member.new_chat_member.status === 'left' || 
                 my_chat_member.new_chat_member.status === 'kicked') {
        // Бот удален из чата
        await telegramService.handleBotRemovedFromChat(chatId);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in webhook:', error);
    res.status(500).json({ success: false });
  }
});

// Аналитика действий пользователя
router.post('/analytics', async (req, res) => {
  try {
    const { initData, actionType, actionData, pageUrl, sessionId } = req.body;

    if (!initData || !actionType) {
      return res.status(400).json({
        success: false,
        error: 'Missing initData or actionType'
      });
    }

    const telegramUser = await telegramService.getUserFromInitData(initData);
    
    if (!telegramUser) {
      return res.status(400).json({
        success: false,
        error: 'Invalid initData'
      });
    }

    await telegramService.saveUserAnalytics(
      telegramUser.id, 
      actionType, 
      actionData, 
      pageUrl, 
      sessionId
    );

    res.json({
      success: true,
      message: 'Analytics saved'
    });

  } catch (error) {
    console.error('Error in /analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Завершение сессии пользователя
router.post('/session/end', async (req, res) => {
  try {
    const { sessionId, durationSeconds, pagesVisited, actionsPerformed } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId'
      });
    }

    await telegramService.endUserSession(
      sessionId, 
      durationSeconds || 0, 
      pagesVisited || [], 
      actionsPerformed || []
    );

    res.json({
      success: true,
      message: 'Session ended'
    });

  } catch (error) {
    console.error('Error in /session/end:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Получение статистики пользователей (для админов)
router.get('/stats/users', async (req, res) => {
  try {
    const stats = await telegramService.getUserStats();
    
    if (!stats) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get user stats'
      });
    }

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(stats.total_users) || 0,
        activeToday: parseInt(stats.active_today) || 0,
        activeWeek: parseInt(stats.active_week) || 0,
        avgSessionsPerUser: parseFloat(stats.avg_sessions_per_user) || 0,
        totalTimeSpent: parseInt(stats.total_time_spent) || 0
      }
    });

  } catch (error) {
    console.error('Error in /stats/users:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 