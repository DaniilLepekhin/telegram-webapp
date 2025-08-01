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
      console.log(`🔍 Getting chat info for: ${chatId}`);
      
      const response = await axios.get(
        `https://api.telegram.org/bot${this.botToken}/getChat`,
        {
          params: { chat_id: chatId }
        }
      );

      if (response.data.ok) {
        const chatInfo = response.data.result;
        console.log(`📋 Chat info received: ${chatInfo.title} (${chatInfo.type})`);
        
              // Дополнительно получаем количество участников
      try {
        console.log(`👥 Getting member count for: ${chatId}`);
        const memberCountResponse = await axios.get(
          `https://api.telegram.org/bot${this.botToken}/getChatMemberCount`,
          {
            params: { chat_id: chatId }
          }
        );
        
        if (memberCountResponse.data.ok) {
          chatInfo.member_count = memberCountResponse.data.result;
          console.log(`✅ Member count for ${chatInfo.title}: ${chatInfo.member_count}`);
        } else {
          console.log(`❌ Failed to get member count for ${chatId}: ${memberCountResponse.data.description}`);
          console.log(`💡 Reason: Bot might not have admin rights or channel is private`);
          
          // Альтернативный метод - проверяем статус бота
          try {
            const botMemberResponse = await axios.get(
              `https://api.telegram.org/bot${this.botToken}/getChatMember`,
              {
                params: { 
                  chat_id: chatId,
                  user_id: this.botToken.split(':')[0] // Bot ID из токена
                }
              }
            );
            
            if (botMemberResponse.data.ok) {
              const botStatus = botMemberResponse.data.result.status;
              console.log(`🤖 Bot status in chat ${chatId}: ${botStatus}`);
              
              if (botStatus !== 'administrator') {
                console.log(`⚠️ Bot is not admin in chat ${chatId}, cannot get member count`);
                chatInfo.member_count = -1; // Индикатор что нет прав
              }
            }
          } catch (statusError) {
            console.log(`❌ Could not check bot status:`, statusError.message);
          }
        }
      } catch (memberCountError) {
        console.log(`⚠️ Could not get member count for chat ${chatId}:`, memberCountError.message);
        if (memberCountError.response?.data?.description) {
          console.log(`📋 API Error: ${memberCountError.response.data.description}`);
        }
        chatInfo.member_count = -1; // Индикатор ошибки
      }
        
        return chatInfo;
      } else {
        console.log(`❌ Failed to get chat info for ${chatId}: ${response.data.description}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error getting chat info for ${chatId}:`, error);
      return null;
    }
  }

  // Сохранение информации о чате в базу
  async saveChatInfo(chatId: number, chatInfo: TelegramChat, botStatus: string = 'member', updateMemberCount: boolean = true): Promise<void> {
    try {
      if (updateMemberCount && chatInfo.member_count !== undefined && chatInfo.member_count !== null) {
        // Обновляем все данные включая количество участников и время последнего обновления
        await this.pool.query(
          `INSERT INTO telegram_chats (chat_id, chat_title, username, type, bot_status, member_count, last_member_update, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (chat_id) 
           DO UPDATE SET 
             chat_title = EXCLUDED.chat_title,
             username = EXCLUDED.username,
             type = EXCLUDED.type,
             bot_status = EXCLUDED.bot_status,
             member_count = EXCLUDED.member_count,
             last_member_update = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP`,
          [chatId, chatInfo.title, chatInfo.username, chatInfo.type, botStatus, chatInfo.member_count]
        );
        console.log(`💾 Updated chat ${chatId} with member count: ${chatInfo.member_count}`);
      } else {
        // Обновляем все данные кроме количества участников и времени его обновления
        await this.pool.query(
          `INSERT INTO telegram_chats (chat_id, chat_title, username, type, bot_status, updated_at)
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
           ON CONFLICT (chat_id) 
           DO UPDATE SET 
             chat_title = EXCLUDED.chat_title,
             username = EXCLUDED.username,
             type = EXCLUDED.type,
             bot_status = EXCLUDED.bot_status,
             updated_at = CURRENT_TIMESTAMP`,
          [chatId, chatInfo.title, chatInfo.username, chatInfo.type, botStatus]
        );
        console.log(`💾 Updated chat ${chatId} without member count update`);
      }
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

  // Получение каналов пользователя (ВСЕГДА ищет новые каналы, ограничения только на обновление количества участников)
  async getUserChannels(userId: number, forceRefresh: boolean = false): Promise<TelegramChat[]> {
    try {
      console.log(`🔍 Getting channels for user ${userId}, forceRefresh: ${forceRefresh}`);

      // ЭТАП 1: ВСЕГДА получаем список всех каналов (без ограничений)
      // Сначала получаем кешированные каналы (если есть)
      const cachedResult = await this.pool.query(
        `SELECT tc.*, 
                EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - COALESCE(tc.last_member_update, '1970-01-01'::timestamp))) / 3600 as hours_since_member_update
         FROM telegram_chats tc
         JOIN chat_admins ca ON tc.chat_id = ca.chat_id
         WHERE ca.user_id = $1 
           AND ca.is_admin = true 
           AND ca.last_checked_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
           AND tc.bot_status != 'removed'
         ORDER BY tc.updated_at DESC`,
        [userId]
      );

      // ЭТАП 2: Проверяем, нужно ли обновлять количество участников
      let shouldUpdateMemberCounts = false;
      let channelsNeedingMemberUpdate: any[] = [];
      
      if (forceRefresh) {
        // При принудительном обновлении проверяем ограничения по времени
        channelsNeedingMemberUpdate = cachedResult.rows.filter(row => 
          !row.last_member_update || row.hours_since_member_update >= 8
        );
        
        if (channelsNeedingMemberUpdate.length > 0) {
          shouldUpdateMemberCounts = true;
          console.log(`⚡ Force refresh: ${channelsNeedingMemberUpdate.length} channels need member count update`);
        } else if (cachedResult.rows.length > 0) {
          const nextUpdateHours = Math.ceil(8 - Math.min(...cachedResult.rows.map(r => r.hours_since_member_update)));
          console.log(`⏰ Rate limit: Member counts updated recently. Next update in ${nextUpdateHours} hours`);
          
          // Возвращаем существующие данные без обновления количества участников
          return cachedResult.rows.map(row => ({
            id: row.chat_id,
            title: row.chat_title,
            username: row.username,
            type: row.type,
            member_count: row.member_count,
            nextUpdateHours: nextUpdateHours
          }));
        }
      }

      // ЭТАП 3: Всегда проверяем новые каналы (независимо от ограничений)
      console.log(`🔄 Checking for new channels and updates...`);

      // Получаем все чаты где бот является администратором (исключая удаленные)
      const botAdminChats = await this.pool.query(
        `SELECT chat_id, chat_title, username, type, member_count 
         FROM telegram_chats 
         WHERE bot_status = 'administrator' 
           AND updated_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
         ORDER BY updated_at DESC`
      );

      console.log(`📋 Found ${botAdminChats.rows.length} bot admin chats for refresh`);
      
      // При принудительном обновлении, обязательно обновляем информацию о каждом канале
      if (forceRefresh) {
        console.log(`⚡ Force refresh: updating all ${botAdminChats.rows.length} channels`);
        for (const chat of botAdminChats.rows) {
          console.log(`🔄 Force updating chat: ${chat.chat_id} (${chat.chat_title})`);
          const updatedChatInfo = await this.getChatInfo(chat.chat_id);
          if (updatedChatInfo) {
            await this.saveChatInfo(chat.chat_id, updatedChatInfo, 'administrator');
            console.log(`💾 Force updated chat: ${updatedChatInfo.title} (${updatedChatInfo.member_count} members)`);
          }
        }
        
        // Получаем обновленные данные из базы
        const updatedChats = await this.pool.query(
          `SELECT chat_id, chat_title, username, type, member_count 
           FROM telegram_chats 
           WHERE bot_status = 'administrator' 
           ORDER BY updated_at DESC`
        );
        botAdminChats.rows = updatedChats.rows;
      }

      console.log(`🔍 Found ${botAdminChats.rows.length} bot admin chats to check`);

      const userChannels: TelegramChat[] = [];

      for (const chat of botAdminChats.rows) {
        const memberStatus = await this.checkUserStatus(chat.chat_id, userId);
        
        if (memberStatus && (memberStatus.status === 'creator' || memberStatus.status === 'administrator')) {
          // Пользователь админ в этом чате
          await this.saveAdminStatus(chat.chat_id, userId, true, memberStatus.status);
          
          // Обновляем информацию о чате
          console.log(`🔄 Updating info for chat: ${chat.chat_id}`);
          const updatedChatInfo = await this.getChatInfo(chat.chat_id);
          if (updatedChatInfo) {
            await this.saveChatInfo(chat.chat_id, updatedChatInfo, 'administrator');
            console.log(`💾 Saved updated chat info: ${updatedChatInfo.title} (${updatedChatInfo.member_count} members)`);
            
            userChannels.push({
              id: chat.chat_id,
              title: updatedChatInfo.title,
              username: updatedChatInfo.username,
              type: updatedChatInfo.type,
              member_count: updatedChatInfo.member_count
            });
          } else {
            // Используем кешированную информацию если не удалось обновить
            console.log(`📋 Using cached info for chat: ${chat.chat_title} (${chat.member_count} members)`);
            userChannels.push({
              id: chat.chat_id,
              title: chat.chat_title,
              username: chat.username,
              type: chat.type,
              member_count: chat.member_count
            });
          }
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
      // Полностью удаляем канал из базы данных
      await this.pool.query(
        `DELETE FROM telegram_chats WHERE chat_id = $1`,
        [chatId]
      );
      
      // Также удаляем все записи админов для этого чата
      await this.pool.query(
        `DELETE FROM chat_admins WHERE chat_id = $1`,
        [chatId]
      );
      
      console.log(`🗑️ Bot and channel completely removed from database: ${chatId}`);
    } catch (error) {
      console.error(`Error handling bot removed from chat ${chatId}:`, error);
    }
  }

  // Очистка кеша админов для конкретного чата
  async clearAdminCache(chatId: number): Promise<void> {
    try {
      await this.pool.query(
        `DELETE FROM chat_admins WHERE chat_id = $1`,
        [chatId]
      );
      console.log(`🧹 Cleared admin cache for chat: ${chatId}`);
    } catch (error) {
      console.error(`Error clearing admin cache for chat ${chatId}:`, error);
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