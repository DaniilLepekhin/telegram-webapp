const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Подключение к базе данных
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'telegram_analytics',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Получить все каналы пользователя с правами
router.get('/user-channels/:userId', async (req, res) => {
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
router.post('/check-permissions/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userId } = req.body;
    
    // Здесь должна быть интеграция с Telegram Bot API
    // для проверки актуальных прав пользователя и бота в канале
    const telegramBot = require('../services/telegramBot');
    
    const permissions = await telegramBot.checkChannelPermissions(channelId, userId);
    
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
router.post('/add-channel', async (req, res) => {
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
router.get('/channel-posts/:channelId', async (req, res) => {
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
router.post('/save-post', async (req, res) => {
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
router.put('/update-post-stats/:postId', async (req, res) => {
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

module.exports = router; 