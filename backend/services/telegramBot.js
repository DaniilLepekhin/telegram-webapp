const TelegramBot = require('node-telegram-bot-api');

class TelegramBotService {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  }

  // Проверить права пользователя и бота в канале
  async checkChannelPermissions(channelId, userId) {
    try {
      // Получаем информацию о канале
      const chatInfo = await this.bot.getChat(channelId);
      
      // Получаем информацию о правах пользователя
      const memberInfo = await this.bot.getChatMember(channelId, userId);
      
      // Получаем информацию о правах бота
      const botInfo = await this.bot.getChatMember(channelId, this.bot.options.username);
      
      return {
        userIsAdmin: ['creator', 'administrator'].includes(memberInfo.status),
        botIsAdmin: ['creator', 'administrator'].includes(botInfo.status),
        userRole: memberInfo.status,
        botRole: botInfo.status,
        channelInfo: {
          id: chatInfo.id,
          title: chatInfo.title,
          username: chatInfo.username,
          type: chatInfo.type,
          memberCount: chatInfo.member_count
        }
      };
    } catch (error) {
      console.error('Error checking channel permissions:', error);
      
      // Если не удалось получить информацию, возвращаем false
      return {
        userIsAdmin: false,
        botIsAdmin: false,
        userRole: 'unknown',
        botRole: 'unknown',
        channelInfo: null,
        error: error.message
      };
    }
  }

  // Получить список каналов пользователя
  async getUserChannels(userId) {
    try {
      // К сожалению, Telegram Bot API не предоставляет прямой способ
      // получить список каналов пользователя. Это нужно делать через
      // веб-приложение или сохранять каналы при добавлении бота.
      
      // Возвращаем пустой массив, так как эту информацию нужно
      // получать другим способом
      return [];
    } catch (error) {
      console.error('Error getting user channels:', error);
      return [];
    }
  }

  // Отправить пост в канал
  async sendPostToChannel(channelId, postData) {
    try {
      const { text, media, buttons } = postData;
      
      let messageOptions = {
        parse_mode: 'HTML',
        disable_web_page_preview: false
      };

      // Добавляем кнопки, если они есть
      if (buttons && buttons.length > 0) {
        const inlineKeyboard = buttons.map(button => [{
          text: button.text,
          url: button.type === 'url' ? button.url : undefined,
          callback_data: button.type === 'callback' ? button.url : undefined,
          web_app: button.type === 'web_app' ? { url: button.url } : undefined
        }]);
        
        messageOptions.reply_markup = {
          inline_keyboard: inlineKeyboard
        };
      }

      let messageId;

      // Отправляем медиа, если оно есть
      if (media && media.length > 0) {
        if (media.length === 1) {
          // Одно медиа
          const mediaItem = media[0];
          if (mediaItem.type === 'image') {
            const result = await this.bot.sendPhoto(channelId, mediaItem.file, {
              caption: text,
              ...messageOptions
            });
            messageId = result.message_id;
          } else if (mediaItem.type === 'video') {
            const result = await this.bot.sendVideo(channelId, mediaItem.file, {
              caption: text,
              ...messageOptions
            });
            messageId = result.message_id;
          }
        } else {
          // Несколько медиа (галерея)
          const mediaGroup = media.map((item, index) => ({
            type: item.type,
            media: item.file,
            caption: index === 0 ? text : undefined,
            parse_mode: index === 0 ? 'HTML' : undefined
          }));

          const results = await this.bot.sendMediaGroup(channelId, mediaGroup);
          messageId = results[0].message_id;

          // Если есть кнопки, отправляем их отдельным сообщением
          if (buttons && buttons.length > 0) {
            await this.bot.sendMessage(channelId, 'Дополнительные действия:', {
              reply_markup: messageOptions.reply_markup
            });
          }
        }
      } else {
        // Только текст
        const result = await this.bot.sendMessage(channelId, text, messageOptions);
        messageId = result.message_id;
      }

      return {
        success: true,
        messageId,
        channelId
      };
    } catch (error) {
      console.error('Error sending post to channel:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Получить статистику поста
  async getPostStats(channelId, messageId) {
    try {
      // К сожалению, Telegram Bot API не предоставляет прямую статистику
      // просмотров и кликов. Это нужно получать через веб-хуки или
      // сохранять при взаимодействии пользователей с кнопками.
      
      // Возвращаем базовую информацию о сообщении
      const message = await this.bot.getMessage(channelId, messageId);
      
      return {
        messageId,
        date: message.date,
        views: 0, // Нужно реализовать отдельно
        clicks: 0, // Нужно отслеживать через callback_data
        forwards: 0
      };
    } catch (error) {
      console.error('Error getting post stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Обработчик callback кнопок для отслеживания кликов
  handleCallbackQuery(callbackQuery) {
    const { data, message, from } = callbackQuery;
    
    // Здесь можно сохранить информацию о клике в базу данных
    console.log('Button clicked:', {
      userId: from.id,
      messageId: message.message_id,
      channelId: message.chat.id,
      buttonData: data,
      timestamp: new Date().toISOString()
    });

    // Отвечаем на callback
    this.bot.answerCallbackQuery(callbackQuery.id);
  }

  // Инициализация обработчиков
  init() {
    // Обработчик callback кнопок
    this.bot.on('callback_query', this.handleCallbackQuery.bind(this));
    
    console.log('Telegram Bot Service initialized');
  }
}

module.exports = new TelegramBotService(); 