const express = require('express');
const crypto = require('crypto');
const QRCode = require('qrcode');
const geoip = require('geoip-lite');
const pool = require('../database');

const router = express.Router();

// Генерация короткого уникального ID для ссылки
function generateShortId(length = 8) {
  return crypto.randomBytes(length).toString('base64url').substring(0, length);
}

// Определение типа устройства по User-Agent
function getDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(userAgent)) {
    return /iPad/i.test(userAgent) ? 'tablet' : 'mobile';
  }
  return 'desktop';
}

// Определение браузера по User-Agent
function getBrowser(userAgent) {
  if (!userAgent) return 'unknown';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'other';
}

// Определение ОС по User-Agent
function getOS(userAgent) {
  if (!userAgent) return 'unknown';
  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Mac OS X/i.test(userAgent)) return 'macOS';
  if (/Linux/i.test(userAgent)) return 'Linux';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iOS|iPhone|iPad/i.test(userAgent)) return 'iOS';
  return 'other';
}

// Получение реального IP адреса
function getRealIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
}

// Создание трекинговой ссылки
router.post('/create-link', async (req, res) => {
  try {
    const {
      channelId,
      linkType,
      targetUrl,
      title,
      description,
      utmParams,
      enableABTest,
      abTestName,
      abGroups,
      enableExpiry,
      expiryDate,
      expiryClicks,
      generateQR
    } = req.body;

    console.log('📝 Creating tracking link:', { channelId, linkType, title });

    // Валидация
    if (!channelId || !linkType || !title) {
      return res.status(400).json({
        success: false,
        error: 'Обязательные поля: channelId, linkType, title'
      });
    }

    if (linkType === 'post' && !targetUrl) {
      return res.status(400).json({
        success: false,
        error: 'Для типа "post" необходимо указать targetUrl'
      });
    }

    // Проверяем что канал существует и пользователь имеет к нему доступ
    const channelCheck = await pool.query(
      'SELECT chat_id, chat_title FROM telegram_chats WHERE chat_id = $1 AND bot_status = $2',
      [channelId, 'administrator']
    );

    if (channelCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Канал не найден или нет доступа'
      });
    }

    // Генерируем уникальный ID для ссылки
    let linkId;
    let attempts = 0;
    do {
      linkId = generateShortId();
      const existingLink = await pool.query(
        'SELECT link_id FROM tracking_links WHERE link_id = $1',
        [linkId]
      );
      if (existingLink.rows.length === 0) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return res.status(500).json({
        success: false,
        error: 'Не удалось сгенерировать уникальный ID'
      });
    }

    // Подготавливаем данные для сохранения
    const finalTargetUrl = linkType === 'post' ? targetUrl : `https://t.me/${channelCheck.rows[0].chat_title}`;
    
    // Создаем A/B эксперимент если нужно
    let abExperimentId = null;
    if (enableABTest && abTestName && abGroups) {
      const groupsJson = {};
      abGroups.forEach(group => {
        groupsJson[group.name] = group.percentage;
      });

      const abExperiment = await pool.query(
        `INSERT INTO ab_experiments (name, description, creator_user_id, groups, status, start_date)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         RETURNING id`,
        [abTestName, `A/B тест для ссылки: ${title}`, 1, JSON.stringify(groupsJson), 'running']
      );
      abExperimentId = abExperiment.rows[0].id;
    }

    // Сохраняем трекинговую ссылку
    const insertResult = await pool.query(
      `INSERT INTO tracking_links (
        link_id, creator_user_id, channel_id, link_type, target_url, 
        title, description, ab_test_group, ab_test_name, 
        is_active, expires_at, auto_disable_after_clicks, 
        default_utm_params, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        linkId,
        1, // TODO: получать из сессии
        channelId,
        linkType,
        finalTargetUrl,
        title,
        description,
        enableABTest ? 'A' : null, // По умолчанию группа A
        enableABTest ? abTestName : null,
        true,
        enableExpiry && expiryDate ? new Date(expiryDate) : null,
        enableExpiry && expiryClicks ? parseInt(expiryClicks) : null,
        JSON.stringify(utmParams || {})
      ]
    );

    // Генерируем QR код если нужно
    let qrCodeUrl = null;
    if (generateQR) {
      const trackingUrl = `https://app.daniillepekhin.com/track/${linkId}`;
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        qrCodeUrl = qrCodeDataUrl;
        
        // Обновляем ссылку с QR кодом
        await pool.query(
          'UPDATE tracking_links SET qr_code_url = $1 WHERE link_id = $2',
          [qrCodeUrl, linkId]
        );
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
      }
    }

    console.log(`✅ Created tracking link: ${linkId} for channel: ${channelCheck.rows[0].chat_title}`);

    // Формируем URL для ответа
    const baseUrl = `https://app.daniillepekhin.com/track/${linkId}`;
    const utmString = Object.keys(utmParams || {}).length > 0 
      ? '?' + Object.entries(utmParams).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')
      : '';

    res.json({
      success: true,
      linkId,
      trackingUrl: baseUrl + utmString,
      qrCodeUrl,
      targetUrl: finalTargetUrl,
      abExperimentId
    });

  } catch (error) {
    console.error('Error creating tracking link:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания ссылки'
    });
  }
});

// Обработка перехода по трекинговой ссылке (прокси)
router.get('/track/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    const utmParams = req.query;
    
    console.log(`🔗 Processing click for link: ${linkId}`, utmParams);

    // Получаем информацию о ссылке
    const linkResult = await pool.query(
      `SELECT tl.*, tc.chat_title, tc.username 
       FROM tracking_links tl
       JOIN telegram_chats tc ON tl.channel_id = tc.chat_id
       WHERE tl.link_id = $1 AND tl.is_active = true`,
      [linkId]
    );

    if (linkResult.rows.length === 0) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ссылка не найдена</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block; }
              .emoji { font-size: 48px; margin-bottom: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="emoji">🔗</div>
              <h1>Ссылка не найдена</h1>
              <p>Эта ссылка могла быть удалена или истекла</p>
            </div>
          </body>
        </html>
      `);
    }

    const link = linkResult.rows[0];

    // Проверяем срок действия
    if (link.expires_at && new Date() > new Date(link.expires_at)) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ссылка истекла</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block; }
              .emoji { font-size: 48px; margin-bottom: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="emoji">⏰</div>
              <h1>Ссылка истекла</h1>
              <p>Срок действия этой ссылки закончился</p>
            </div>
          </body>
        </html>
      `);
    }

    // Проверяем лимит кликов
    if (link.auto_disable_after_clicks && link.click_count >= link.auto_disable_after_clicks) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Лимит переходов исчерпан</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block; }
              .emoji { font-size: 48px; margin-bottom: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="emoji">🚫</div>
              <h1>Лимит переходов исчерпан</h1>
              <p>Эта ссылка достигла максимального количества переходов</p>
            </div>
          </body>
        </html>
      `);
    }

    // Собираем данные о пользователе
    const userAgent = req.headers['user-agent'] || '';
    const realIP = getRealIP(req);
    const geo = geoip.lookup(realIP);
    
    // Определяем A/B группу (если включено A/B тестирование)
    let abGroup = link.ab_test_group;
    if (link.ab_test_name) {
      // Здесь можно реализовать более сложную логику распределения
      // Пока используем простое хеширование
      const hash = crypto.createHash('md5').update(realIP + link.link_id).digest('hex');
      const hashNumber = parseInt(hash.substring(0, 8), 16) % 100;
      // Получаем группы эксперимента и распределяем
      const abExperiment = await pool.query(
        'SELECT groups FROM ab_experiments WHERE name = $1',
        [link.ab_test_name]
      );
      if (abExperiment.rows.length > 0) {
        const groups = JSON.parse(abExperiment.rows[0].groups);
        let currentPercent = 0;
        for (const [groupName, percentage] of Object.entries(groups)) {
          currentPercent += percentage;
          if (hashNumber < currentPercent) {
            abGroup = groupName;
            break;
          }
        }
      }
    }

    // Объединяем UTM параметры (дефолтные + из URL)
    const allUtmParams = { ...JSON.parse(link.default_utm_params || '{}'), ...utmParams };

    // Сохраняем клик
    const clickResult = await pool.query(
      `INSERT INTO link_clicks (
        link_id, telegram_user_id, utm_params, user_agent, ip_address, 
        country, city, referer_url, device_type, browser, os, ab_test_group
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        linkId,
        null, // TODO: получать telegram_user_id если доступен
        JSON.stringify(allUtmParams),
        userAgent,
        realIP,
        geo ? geo.country : null,
        geo ? geo.city : null,
        req.headers.referer || null,
        getDeviceType(userAgent),
        getBrowser(userAgent),
        getOS(userAgent),
        abGroup
      ]
    );

    console.log(`✅ Click recorded for link ${linkId}: IP=${realIP}, Country=${geo?.country}, Device=${getDeviceType(userAgent)}`);

    // Генерируем одноразовый токен старта WebApp и сохраняем UTM-параметры
    const startToken = generateShortId(12);
    // Гарантируем наличие таблицы для токенов
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tracking_start_tokens (
        token TEXT PRIMARY KEY,
        link_id TEXT NOT NULL,
        utm_params JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP
      );
    `);
    await pool.query(
      'INSERT INTO tracking_start_tokens (token, link_id, utm_params) VALUES ($1, $2, $3)',
      [startToken, linkId, JSON.stringify(allUtmParams)]
    );

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'daniil_lepekhin_bot';
    const deepLink = `https://t.me/${botUsername}/app?startapp=${startToken}`;
    // Редиректим напрямую в Telegram, где WebApp заберет токен и сразу отправит в целевой канал/пост
    return res.redirect(302, deepLink);

  } catch (error) {
    console.error('Error processing tracking link:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ошибка</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .emoji { font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="emoji">❌</div>
          <h1>Произошла ошибка</h1>
          <p>Попробуйте позже</p>
        </body>
      </html>
    `);
  }
});

// WebApp сообщает о старте с токеном и получает конечный redirectUrl
router.post('/webapp-start', async (req, res) => {
  try {
    const { token, user } = req.body || {};
    if (!token) {
      return res.status(400).json({ success: false, error: 'token is required' });
    }

    // Гарантируем таблицу
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tracking_start_tokens (
        token TEXT PRIMARY KEY,
        link_id TEXT NOT NULL,
        utm_params JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP
      );
    `);

    // И таблицу стартов (для аналитики)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS link_starts (
        id SERIAL PRIMARY KEY,
        link_id TEXT NOT NULL,
        telegram_user_id BIGINT,
        utm_params JSONB,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const tokenRow = await pool.query('SELECT * FROM tracking_start_tokens WHERE token = $1', [token]);
    if (tokenRow.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'token not found' });
    }
    const tokenData = tokenRow.rows[0];

    // Получаем ссылку
    const linkResult = await pool.query(
      `SELECT tl.*, tc.chat_title, tc.username 
       FROM tracking_links tl
       JOIN telegram_chats tc ON tl.channel_id = tc.chat_id
       WHERE tl.link_id = $1`,
      [tokenData.link_id]
    );
    if (linkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'link not found' });
    }
    const link = linkResult.rows[0];

    // Логируем старт
    const telegramUserId = user?.id || null;
    await pool.query(
      'INSERT INTO link_starts (link_id, telegram_user_id, utm_params) VALUES ($1, $2, $3)',
      [tokenData.link_id, telegramUserId, tokenData.utm_params || null]
    );
    await pool.query('UPDATE tracking_start_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = $1', [token]);

    // Конечный URL: пост или канал
    const redirectUrl = link.target_url;
    return res.json({ success: true, redirectUrl });
  } catch (e) {
    console.error('webapp-start error:', e);
    return res.status(500).json({ success: false, error: 'internal error' });
  }
});

// Получение списка ссылок пользователя
router.get('/links', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tl.*, tc.chat_title, tc.username,
              COUNT(lc.id) as total_clicks,
              COUNT(DISTINCT lc.country) as countries_count,
              COUNT(ls.id) as total_subscriptions
       FROM tracking_links tl
       LEFT JOIN telegram_chats tc ON tl.channel_id = tc.chat_id
       LEFT JOIN link_clicks lc ON tl.link_id = lc.link_id
       LEFT JOIN link_subscriptions ls ON tl.link_id = ls.link_id
       WHERE tl.creator_user_id = $1
       GROUP BY tl.id, tc.chat_title, tc.username
       ORDER BY tl.created_at DESC`,
      [1] // TODO: получать из сессии
    );

    res.json({
      success: true,
      links: result.rows
    });

  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения ссылок'
    });
  }
});

// Получение детальной аналитики по ссылке
router.get('/analytics/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;

    // Основная информация о ссылке
    const linkInfo = await pool.query(
      `SELECT tl.*, tc.chat_title, tc.username
       FROM tracking_links tl
       LEFT JOIN telegram_chats tc ON tl.channel_id = tc.chat_id
       WHERE tl.link_id = $1`,
      [linkId]
    );

    if (linkInfo.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ссылка не найдена'
      });
    }

    // Статистика кликов
    const clickStats = await pool.query(
      `SELECT 
         COUNT(*) as total_clicks,
         COUNT(DISTINCT country) as unique_countries,
         COUNT(DISTINCT DATE(clicked_at)) as active_days,
         device_type,
         COUNT(*) as device_count
       FROM link_clicks 
       WHERE link_id = $1
       GROUP BY device_type`,
      [linkId]
    );

    // Статистика по странам
    const countryStats = await pool.query(
      `SELECT country, city, COUNT(*) as clicks
       FROM link_clicks 
       WHERE link_id = $1 AND country IS NOT NULL
       GROUP BY country, city
       ORDER BY clicks DESC
       LIMIT 10`,
      [linkId]
    );

    // UTM аналитика
    const utmStats = await pool.query(
      `SELECT utm_params, COUNT(*) as clicks
       FROM link_clicks 
       WHERE link_id = $1 AND utm_params IS NOT NULL
       GROUP BY utm_params
       ORDER BY clicks DESC`,
      [linkId]
    );

    // Статистика по времени (последние 7 дней)
    const timeStats = await pool.query(
      `SELECT 
         DATE(clicked_at) as date,
         COUNT(*) as clicks,
         COUNT(DISTINCT ip_address) as unique_visitors
       FROM link_clicks 
       WHERE link_id = $1 AND clicked_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(clicked_at)
       ORDER BY date`,
      [linkId]
    );

    // A/B тестирование статистика
    const abStats = await pool.query(
      `SELECT ab_test_group, COUNT(*) as clicks
       FROM link_clicks 
       WHERE link_id = $1 AND ab_test_group IS NOT NULL
       GROUP BY ab_test_group
       ORDER BY clicks DESC`,
      [linkId]
    );

    res.json({
      success: true,
      link: linkInfo.rows[0],
      analytics: {
        clicks: clickStats.rows,
        countries: countryStats.rows,
        utm: utmStats.rows,
        timeline: timeStats.rows,
        abTesting: abStats.rows
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения аналитики'
    });
  }
});

// Удаление ссылки
router.delete('/links/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;

    await pool.query(
      'UPDATE tracking_links SET is_active = false WHERE link_id = $1 AND creator_user_id = $2',
      [linkId, 1] // TODO: получать из сессии
    );

    res.json({
      success: true,
      message: 'Ссылка деактивирована'
    });

  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления ссылки'
    });
  }
});

module.exports = router;