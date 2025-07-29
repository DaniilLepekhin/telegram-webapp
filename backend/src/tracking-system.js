const crypto = require('crypto');

class TrackingSystem {
  constructor(pool) {
    this.pool = pool;
  }

  // Создание уникального хеша для ссылки
  generateLinkHash() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Регистрация клика по ссылке
  async trackClick(linkHash, userData = {}) {
    try {
      // Получаем информацию о ссылке
      const linkQuery = `
        SELECT id, channel_id, post_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content, tag
        FROM tracking_links 
        WHERE link_hash = $1 AND is_active = true
      `;
      const linkResult = await this.pool.query(linkQuery, [linkHash]);
      
      if (linkResult.rows.length === 0) {
        return { success: false, error: 'Ссылка не найдена или неактивна' };
      }

      const link = linkResult.rows[0];

      // Регистрируем клик
      const clickQuery = `
        INSERT INTO link_clicks 
        (tracking_link_id, user_id, ip_address, user_agent, referer, clicked_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `;
      
      const clickResult = await this.pool.query(clickQuery, [
        link.id,
        userData.userId || null,
        userData.ipAddress || null,
        userData.userAgent || null,
        userData.referer || null
      ]);

      return {
        success: true,
        clickId: clickResult.rows[0].id,
        link: {
          channelId: link.channel_id,
          postId: link.post_id,
          utmSource: link.utm_source,
          utmMedium: link.utm_medium,
          utmCampaign: link.utm_campaign,
          utmTerm: link.utm_term,
          utmContent: link.utm_content,
          tag: link.tag
        }
      };
    } catch (error) {
      console.error('Ошибка трекинга клика:', error);
      return { success: false, error: 'Внутренняя ошибка сервера' };
    }
  }

  // Отметка конверсии (подписка на канал)
  async markConversion(clickId, userId, channelId) {
    try {
      // Обновляем клик как конверсию
      const updateQuery = `
        UPDATE link_clicks 
        SET converted_to_subscriber = true, conversion_date = NOW()
        WHERE id = $1
      `;
      await this.pool.query(updateQuery, [clickId]);

      // Получаем информацию о клике для записи подписчика
      const clickQuery = `
        SELECT lc.tracking_link_id, tl.utm_source, tl.utm_medium, tl.utm_campaign, tl.utm_term, tl.utm_content, tl.tag
        FROM link_clicks lc
        JOIN tracking_links tl ON lc.tracking_link_id = tl.id
        WHERE lc.id = $1
      `;
      const clickResult = await this.pool.query(clickQuery, [clickId]);

      if (clickResult.rows.length > 0) {
        const click = clickResult.rows[0];
        
        // Записываем подписчика
        const subscriberQuery = `
          INSERT INTO channel_subscribers 
          (channel_id, user_id, source_link_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content, tag, joined_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          ON CONFLICT (channel_id, user_id) DO NOTHING
        `;
        
        await this.pool.query(subscriberQuery, [
          channelId,
          userId,
          click.tracking_link_id,
          click.utm_source,
          click.utm_medium,
          click.utm_campaign,
          click.utm_term,
          click.utm_content,
          click.tag
        ]);
      }

      return { success: true };
    } catch (error) {
      console.error('Ошибка отметки конверсии:', error);
      return { success: false, error: 'Внутренняя ошибка сервера' };
    }
  }

  // Получение статистики по ссылке
  async getLinkStats(linkId) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_clicks,
          COUNT(CASE WHEN converted_to_subscriber = true THEN 1 END) as conversions,
          COUNT(DISTINCT user_id) as unique_users
        FROM link_clicks 
        WHERE tracking_link_id = $1
      `;
      
      const statsResult = await this.pool.query(statsQuery, [linkId]);
      const stats = statsResult.rows[0];
      
      const conversionRate = stats.total_clicks > 0 
        ? ((stats.conversions / stats.total_clicks) * 100).toFixed(2)
        : 0;

      return {
        success: true,
        stats: {
          totalClicks: parseInt(stats.total_clicks),
          conversions: parseInt(stats.conversions),
          uniqueUsers: parseInt(stats.unique_users),
          conversionRate: parseFloat(conversionRate)
        }
      };
    } catch (error) {
      console.error('Ошибка получения статистики ссылки:', error);
      return { success: false, error: 'Внутренняя ошибка сервера' };
    }
  }

  // Получение статистики по каналу
  async getChannelStats(channelId) {
    try {
      // Общая статистика канала
      const channelStatsQuery = `
        SELECT 
          COUNT(DISTINCT tl.id) as total_links,
          COUNT(DISTINCT lc.id) as total_clicks,
          COUNT(DISTINCT cs.user_id) as total_subscribers,
          COUNT(DISTINCT CASE WHEN cs.source_link_id IS NOT NULL THEN cs.user_id END) as tracked_subscribers
        FROM channels c
        LEFT JOIN tracking_links tl ON c.id = tl.channel_id
        LEFT JOIN link_clicks lc ON tl.id = lc.tracking_link_id
        LEFT JOIN channel_subscribers cs ON c.id = cs.channel_id
        WHERE c.id = $1
      `;
      
      const channelStatsResult = await this.pool.query(channelStatsQuery, [channelId]);
      const channelStats = channelStatsResult.rows[0];

      // Статистика по источникам трафика
      const sourcesStatsQuery = `
        SELECT 
          COALESCE(utm_source, 'Прямые переходы') as source,
          COUNT(*) as clicks,
          COUNT(CASE WHEN lc.converted_to_subscriber = true THEN 1 END) as conversions
        FROM link_clicks lc
        JOIN tracking_links tl ON lc.tracking_link_id = tl.id
        WHERE tl.channel_id = $1
        GROUP BY utm_source
        ORDER BY clicks DESC
      `;
      
      const sourcesStatsResult = await this.pool.query(sourcesStatsQuery, [channelId]);
      const sourcesStats = sourcesStatsResult.rows.map(row => ({
        source: row.source,
        clicks: parseInt(row.clicks),
        conversions: parseInt(row.conversions),
        conversionRate: row.clicks > 0 ? ((row.conversions / row.clicks) * 100).toFixed(2) : 0
      }));

      return {
        success: true,
        stats: {
          totalLinks: parseInt(channelStats.total_links),
          totalClicks: parseInt(channelStats.total_clicks),
          totalSubscribers: parseInt(channelStats.total_subscribers),
          trackedSubscribers: parseInt(channelStats.tracked_subscribers),
          sources: sourcesStats
        }
      };
    } catch (error) {
      console.error('Ошибка получения статистики канала:', error);
      return { success: false, error: 'Внутренняя ошибка сервера' };
    }
  }

  // Получение ежедневной статистики
  async getDailyStats(channelId, days = 30) {
    try {
      const dailyStatsQuery = `
        SELECT 
          DATE(lc.clicked_at) as date,
          COUNT(*) as clicks,
          COUNT(CASE WHEN lc.converted_to_subscriber = true THEN 1 END) as conversions
        FROM link_clicks lc
        JOIN tracking_links tl ON lc.tracking_link_id = tl.id
        WHERE tl.channel_id = $1 
          AND lc.clicked_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(lc.clicked_at)
        ORDER BY date DESC
      `;
      
      const dailyStatsResult = await this.pool.query(dailyStatsQuery, [channelId]);
      const dailyStats = dailyStatsResult.rows.map(row => ({
        date: row.date,
        clicks: parseInt(row.clicks),
        conversions: parseInt(row.conversions),
        conversionRate: row.clicks > 0 ? ((row.conversions / row.clicks) * 100).toFixed(2) : 0
      }));

      return {
        success: true,
        dailyStats: dailyStats
      };
    } catch (error) {
      console.error('Ошибка получения ежедневной статистики:', error);
      return { success: false, error: 'Внутренняя ошибка сервера' };
    }
  }

  // Отметка отписки пользователя
  async markUnsubscription(channelId, userId) {
    try {
      const updateQuery = `
        UPDATE channel_subscribers 
        SET left_at = NOW(), is_active = false
        WHERE channel_id = $1 AND user_id = $2
      `;
      
      await this.pool.query(updateQuery, [channelId, userId]);
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка отметки отписки:', error);
      return { success: false, error: 'Внутренняя ошибка сервера' };
    }
  }
}

module.exports = TrackingSystem;