const axios = require('axios');

class TelegramBotAPI {
  constructor(botToken) {
    this.botToken = botToken;
    this.baseURL = `https://api.telegram.org/bot${botToken}`;
  }

  // Валидация initData от Telegram WebApp
  async validateInitData(initData) {
    try {
      const response = await axios.post(`${this.baseURL}/validateWebAppData`, {
        init_data: initData
      });
      return response.data.ok;
    } catch (error) {
      console.error('Ошибка валидации initData:', error);
      return false;
    }
  }

  // Получение информации о пользователе
  async getUserInfo(userId) {
    try {
      const response = await axios.get(`${this.baseURL}/getChat`, {
        params: { chat_id: userId }
      });
      return response.data.ok ? response.data.result : null;
    } catch (error) {
      console.error('Ошибка получения информации о пользователе:', error);
      return null;
    }
  }

  // Получение каналов пользователя (через getUpdates или webhook)
  async getUserChannels(userId) {
    try {
      // Получаем обновления для бота
      const response = await axios.get(`${this.baseURL}/getUpdates`);
      
      if (!response.data.ok) {
        return [];
      }

      const updates = response.data.result;
      const userChannels = [];

      // Анализируем обновления для поиска каналов пользователя
      for (const update of updates) {
        if (update.my_chat_member && update.my_chat_member.chat.type !== 'private') {
          const chat = update.my_chat_member.chat;
          const member = update.my_chat_member.new_chat_member;
          
          if (member.status === 'administrator' || member.status === 'creator') {
            userChannels.push({
              id: chat.id,
              title: chat.title,
              username: chat.username,
              type: chat.type,
              memberCount: chat.member_count || 0,
              isAdmin: true,
              canInviteUsers: member.can_invite_users || false,
              canPostMessages: member.can_post_messages || false,
              canEditMessages: member.can_edit_messages || false,
              canDeleteMessages: member.can_delete_messages || false,
              canRestrictMembers: member.can_restrict_members || false,
              canPromoteMembers: member.can_promote_members || false
            });
          }
        }
      }

      return userChannels;
    } catch (error) {
      console.error('Ошибка получения каналов пользователя:', error);
      return [];
    }
  }

  // Добавление бота в канал
  async addBotToChannel(channelId, permissions = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/setChatMemberPermissions`, {
        chat_id: channelId,
        user_id: this.getBotId(),
        permissions: {
          can_invite_users: permissions.canInviteUsers || false,
          can_post_messages: permissions.canPostMessages || false,
          can_edit_messages: permissions.canEditMessages || false,
          can_delete_messages: permissions.canDeleteMessages || false,
          can_restrict_members: permissions.canRestrictMembers || false,
          can_promote_members: permissions.canPromoteMembers || false
        }
      });
      return response.data.ok;
    } catch (error) {
      console.error('Ошибка добавления бота в канал:', error);
      return false;
    }
  }

  // Получение информации о боте
  async getBotInfo() {
    try {
      const response = await axios.get(`${this.baseURL}/getMe`);
      return response.data.ok ? response.data.result : null;
    } catch (error) {
      console.error('Ошибка получения информации о боте:', error);
      return null;
    }
  }

  // Получение ID бота
  async getBotId() {
    const botInfo = await this.getBotInfo();
    return botInfo ? botInfo.id : null;
  }

  // Отправка сообщения
  async sendMessage(chatId, text, options = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: options.parseMode || 'HTML',
        reply_markup: options.replyMarkup || null
      });
      return response.data.ok ? response.data.result : null;
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      return null;
    }
  }

  // Получение статистики канала
  async getChannelStats(channelId) {
    try {
      const response = await axios.get(`${this.baseURL}/getChat`, {
        params: { chat_id: channelId }
      });
      
      if (!response.data.ok) {
        return null;
      }

      const chat = response.data.result;
      return {
        id: chat.id,
        title: chat.title,
        username: chat.username,
        type: chat.type,
        memberCount: chat.member_count || 0,
        description: chat.description || '',
        inviteLink: chat.invite_link || ''
      };
    } catch (error) {
      console.error('Ошибка получения статистики канала:', error);
      return null;
    }
  }

  // Создание пригласительной ссылки
  async createInviteLink(channelId, options = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/createChatInviteLink`, {
        chat_id: channelId,
        name: options.name || 'Tracking Link',
        creates_join_request: options.createsJoinRequest || false,
        expire_date: options.expireDate || null,
        member_limit: options.memberLimit || null
      });
      return response.data.ok ? response.data.result : null;
    } catch (error) {
      console.error('Ошибка создания пригласительной ссылки:', error);
      return null;
    }
  }

  // Получение информации о постах в канале
  async getChannelPosts(channelId, limit = 100) {
    try {
      // Получаем обновления для поиска постов
      const response = await axios.get(`${this.baseURL}/getUpdates`, {
        params: { 
          allowed_updates: ['channel_post', 'edited_channel_post'],
          limit: limit
        }
      });
      
      if (!response.data.ok) {
        return [];
      }

      const updates = response.data.result;
      const posts = [];

      for (const update of updates) {
        if (update.channel_post && update.channel_post.chat.id === channelId) {
          posts.push({
            id: update.channel_post.message_id,
            text: update.channel_post.text || '',
            date: update.channel_post.date,
            views: update.channel_post.views || 0,
            forwards: update.channel_post.forwards || 0
          });
        }
      }

      return posts;
    } catch (error) {
      console.error('Ошибка получения постов канала:', error);
      return [];
    }
  }
}

module.exports = TelegramBotAPI;