import { Pool } from 'pg';
import axios from 'axios';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramChat {
  id: number;
  title: string;
  username?: string;
  type: 'group' | 'supergroup' | 'channel';
  member_count?: number;
}

interface ChatMember {
  user: {
    id: number;
    first_name: string;
    username?: string;
  };
  status: 'creator' | 'administrator' | 'member' | 'left' | 'kicked';
  is_member?: boolean;
}

export class TelegramService {
  private pool: Pool;
  private botToken: string;

  constructor(pool: Pool, botToken: string) {
    this.pool = pool;
    this.botToken = botToken;
  }

  // Получение информации о пользователе из initData
  async getUserFromInitData(initData: string): Promise<TelegramUser | null> {
    try {
      // В реальном приложении здесь должна быть проверка подписи
      const params = new URLSearchParams(initData);
      const userStr = params.get('user');
      if (!userStr) return null;
      
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing initData:', error);
      return null;
    }
  }

  // Сохранение или обновление пользователя
  async saveOrUpdateUser(user: TelegramUser, sessionId?: string, userAgent?: string, ipAddress?: string): Promise<void> {
    try {
      // Сохраняем/обновляем пользователя
      await this.pool.query(
        `INSERT INTO app_users (telegram_user_id, first_name, last_name, username, photo_url, language_code, is_premium, last_seen_at, session_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, 1)
         ON CONFLICT (telegram_user_id) 
         DO UPDATE SET 
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           username = EXCLUDED.username,
           photo_url = EXCLUDED.photo_url,
           language_code = EXCLUDED.language_code,
           is_premium = EXCLUDED.is_premium,
           last_seen_at = CURRENT_TIMESTAMP,
           session_count = app_users.session_count + 1`,
        [user.id, user.first_name, user.last_name, user.username, user.photo_url, user.language_code, user.is_premium]
      );

      // Если есть sessionId, создаем запись о сессии
      if (sessionId) {
        await this.pool.query(
          `INSERT INTO user_sessions (user_id, session_id, init_data, user_agent, ip_address, started_at)
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
          [user.id, sessionId, '', userAgent || '', ipAddress || null]
        );
      }

      console.log(`✅ User saved/updated: ${user.first_name} (ID: ${user.id})`);
    } catch (error) {
      console.error(`Error saving user ${user.id}:`, error);
    }
  }

  // Завершение сессии пользователя
  async endUserSession(sessionId: string, durationSeconds: number, pagesVisited: any[] = [], actionsPerformed: any[] = []): Promise<void> {
    try {
      await this.pool.query(
        `UPDATE user_sessions 
         SET ended_at = CURRENT_TIMESTAMP,
             duration_seconds = $1,
             pages_visited = $2,
             actions_performed = $3
         WHERE session_id = $4`,
        [durationSeconds, JSON.stringify(pagesVisited), JSON.stringify(actionsPerformed), sessionId]
      );

      console.log(`✅ Session ended: ${sessionId} (duration: ${durationSeconds}s)`);
    } catch (error) {
      console.error(`Error ending session ${sessionId}:`, error);
    }
  }

  // Сохранение аналитики действий пользователя
  async saveUserAnalytics(userId: number, actionType: string, actionData?: any, pageUrl?: string, sessionId?: string): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO user_analytics (user_id, action_type, action_data, page_url, session_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, actionType, JSON.stringify(actionData || {}), pageUrl || '', sessionId || '']
      );
    } catch (error) {
      console.error(`Error saving analytics for user ${userId}:`, error);
    }
  }

  // Получение статистики пользователей
  async getUserStats(): Promise<any> {
    try {
      const result = await this.pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN last_seen_at > CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 1 END) as active_today,
          COUNT(CASE WHEN last_seen_at > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) as active_week,
          AVG(session_count) as avg_sessions_per_user,
          SUM(total_time_spent) as total_time_spent
        FROM app_users
      `);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Проверка статуса пользователя в чате
  async checkUserStatus(chatId: number, userId: number): Promise<ChatMember | null> {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${this.botToken}/getChatMember`,
        {
          params: {
            chat_id: chatId,
            user_id: userId
          }
        }
      );

      if (response.data.ok) {
        return response.data.result;
      }
      return null;
    } catch (error) {
      console.error(`Error checking user status for chat ${chatId}, user ${userId}:`, error);
      return null;
    }
  }

  // Получение информации о чате
  async getChatInfo(chatId: number): Promise<TelegramChat | null> {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${this.botToken}/getChat`,
        {
          params: { chat_id: chatId }
        }
      );

      if (response.data.ok) {
        return response.data.result;
      }
      return null;
    } catch (error) {
      console.error(`Error getting chat info for ${chatId}:`, error);
      return null;
    }
  }

  // Сохранение информации о чате в базу
  async saveChatInfo(chatId: number, chatInfo: TelegramChat, botStatus: string = 'member'): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO telegram_chats (chat_id, chat_title, username, type, bot_status, member_count, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         ON CONFLICT (chat_id) 
         DO UPDATE SET 
           chat_title = EXCLUDED.chat_title,
           username = EXCLUDED.username,
           type = EXCLUDED.type,
           bot_status = EXCLUDED.bot_status,
           member_count = EXCLUDED.member_count,
           updated_at = CURRENT_TIMESTAMP`,
        [chatId, chatInfo.title, chatInfo.username, chatInfo.type, botStatus, chatInfo.member_count]
      );
    } catch (error) {
      console.error(`Error saving chat info for ${chatId}:`, error);
    }
  }

  // Сохранение статуса админа
  async saveAdminStatus(chatId: number, userId: number, isAdmin: boolean, role?: string): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO chat_admins (chat_id, user_id, is_admin, role, last_checked_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (chat_id, user_id) 
         DO UPDATE SET 
           is_admin = EXCLUDED.is_admin,
           role = EXCLUDED.role,
           last_checked_at = CURRENT_TIMESTAMP`,
        [chatId, userId, isAdmin, role]
      );
    } catch (error) {
      console.error(`Error saving admin status for chat ${chatId}, user ${userId}:`, error);
    }
  }

  // Получение каналов пользователя (с кешированием)
  async getUserChannels(userId: number): Promise<TelegramChat[]> {
    try {
      // Сначала пытаемся получить из кеша
      const cachedResult = await this.pool.query(
        `SELECT tc.* 
         FROM telegram_chats tc
         JOIN chat_admins ca ON tc.chat_id = ca.chat_id
         WHERE ca.user_id = $1 
           AND ca.is_admin = true 
           AND ca.last_checked_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
         ORDER BY tc.updated_at DESC`,
        [userId]
      );

      if (cachedResult.rows.length > 0) {
        console.log(`Found ${cachedResult.rows.length} cached channels for user ${userId}`);
        return cachedResult.rows.map(row => ({
          id: row.chat_id,
          title: row.chat_title,
          username: row.username,
          type: row.type,
          member_count: row.member_count
        }));
      }

      // Получаем все чаты где бот является администратором
      const botAdminChats = await this.pool.query(
        `SELECT chat_id, chat_title, username, type, member_count 
         FROM telegram_chats 
         WHERE bot_status = 'administrator' 
           AND updated_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
         ORDER BY updated_at DESC`
      );

      const userChannels: TelegramChat[] = [];

      for (const chat of botAdminChats.rows) {
        const memberStatus = await this.checkUserStatus(chat.chat_id, userId);
        
        if (memberStatus && (memberStatus.status === 'creator' || memberStatus.status === 'administrator')) {
          // Пользователь админ в этом чате
          await this.saveAdminStatus(chat.chat_id, userId, true, memberStatus.status);
          
          userChannels.push({
            id: chat.chat_id,
            title: chat.chat_title,
            username: chat.username,
            type: chat.type,
            member_count: chat.member_count
          });
        } else {
          // Пользователь не админ
          await this.saveAdminStatus(chat.chat_id, userId, false, memberStatus?.status);
        }

        // Небольшая задержка чтобы не превысить лимиты API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Found ${userChannels.length} channels for user ${userId} after fresh check`);
      return userChannels;

    } catch (error) {
      console.error(`Error getting user channels for ${userId}:`, error);
      return [];
    }
  }

  // Обработка события добавления бота в чат
  async handleBotAddedToChat(chatId: number): Promise<void> {
    try {
      const chatInfo = await this.getChatInfo(chatId);
      if (chatInfo) {
        await this.saveChatInfo(chatId, chatInfo, 'administrator');
        console.log(`Bot added to chat: ${chatInfo.title} (${chatId})`);
      }
    } catch (error) {
      console.error(`Error handling bot added to chat ${chatId}:`, error);
    }
  }

  // Обработка события удаления бота из чата
  async handleBotRemovedFromChat(chatId: number): Promise<void> {
    try {
      await this.pool.query(
        `UPDATE telegram_chats 
         SET bot_status = 'removed', updated_at = CURRENT_TIMESTAMP 
         WHERE chat_id = $1`,
        [chatId]
      );
      console.log(`Bot removed from chat: ${chatId}`);
    } catch (error) {
      console.error(`Error handling bot removed from chat ${chatId}:`, error);
    }
  }

  // Фоновая задача для обновления кеша админов
  async updateAdminCache(): Promise<void> {
    try {
      const staleAdmins = await this.pool.query(
        `SELECT ca.chat_id, ca.user_id 
         FROM chat_admins ca
         WHERE ca.last_checked_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
         LIMIT 20`
      );

      for (const admin of staleAdmins.rows) {
        const memberStatus = await this.checkUserStatus(admin.chat_id, admin.user_id);
        
        if (memberStatus) {
          await this.saveAdminStatus(
            admin.chat_id, 
            admin.user_id, 
            memberStatus.status === 'creator' || memberStatus.status === 'administrator',
            memberStatus.status
          );
        }

        // Задержка для соблюдения лимитов API
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`Updated admin cache for ${staleAdmins.rows.length} records`);
    } catch (error) {
      console.error('Error updating admin cache:', error);
    }
  }
} 