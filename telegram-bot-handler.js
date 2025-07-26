// Обработчик для Telegram бота - отслеживание переходов по постам

const TelegramBot = require('node-telegram-bot-api');

// Конфигурация бота
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Хранилище данных (в реальном проекте - база данных)
const trackingData = new Map();
const userActions = new Map();

// Обработка команды /start с параметрами отслеживания
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const params = match[1];
  
  try {
    // Парсим параметры отслеживания
    if (params.startsWith('track_')) {
      await handleTrackingLink(msg, params);
    } else {
      // Обычная команда /start
      await sendWelcomeMessage(msg);
    }
  } catch (error) {
    console.error('Ошибка обработки /start:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
  }
});

// Обработка ссылки отслеживания
async function handleTrackingLink(msg, params) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;
  
  try {
    // Извлекаем данные отслеживания
    const [trackingId, postId] = params.replace('track_', '').split('_');
    
    // Логируем переход
    const clickData = {
      trackingId,
      postId,
      userId,
      username,
      timestamp: new Date().toISOString(),
      userAgent: 'Telegram Bot',
      source: 'telegram_bot'
    };
    
    console.log('Переход по ссылке отслеживания:', clickData);
    
    // Сохраняем данные перехода
    if (!trackingData.has(trackingId)) {
      trackingData.set(trackingId, {
        clicks: [],
        stats: {
          totalClicks: 0,
          uniqueVisitors: 0,
          conversions: 0,
          unsubscribes: 0
        }
      });
    }
    
    const tracking = trackingData.get(trackingId);
    tracking.clicks.push(clickData);
    tracking.stats.totalClicks++;
    
    // Проверяем уникальность пользователя
    const uniqueUsers = new Set(tracking.clicks.map(click => click.userId));
    tracking.stats.uniqueVisitors = uniqueUsers.size;
    
    // Отправляем приветственное сообщение с кнопками
    const keyboard = {
      inline_keyboard: [
        [
          { text: '👁 Посмотреть пост', callback_data: `view_post_${postId}` },
          { text: '📊 Статистика', callback_data: `stats_${trackingId}` }
        ],
        [
          { text: '✅ Подписаться', callback_data: `subscribe_${trackingId}` },
          { text: '❌ Отписаться', callback_data: `unsubscribe_${trackingId}` }
        ],
        [
          { text: '📤 Поделиться', callback_data: `share_${trackingId}` },
          { text: '💬 Комментарий', callback_data: `comment_${trackingId}` }
        ]
      ]
    };
    
    await bot.sendMessage(chatId, 
      `🔗 Добро пожаловать!\n\n` +
      `Вы перешли по ссылке отслеживания.\n` +
      `ID поста: ${postId}\n` +
      `ID отслеживания: ${trackingId}\n\n` +
      `Выберите действие:`, 
      { reply_markup: keyboard }
    );
    
  } catch (error) {
    console.error('Ошибка обработки ссылки отслеживания:', error);
    await bot.sendMessage(chatId, 'Ошибка обработки ссылки. Попробуйте позже.');
  }
}

// Обработка callback запросов (нажатия на кнопки)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;
  
  try {
    const [action, id] = data.split('_');
    
    switch (action) {
      case 'view':
        await handleViewPost(chatId, id);
        break;
      case 'stats':
        await handleShowStats(chatId, id);
        break;
      case 'subscribe':
        await handleSubscribe(chatId, id, userId);
        break;
      case 'unsubscribe':
        await handleUnsubscribe(chatId, id, userId);
        break;
      case 'share':
        await handleShare(chatId, id);
        break;
      case 'comment':
        await handleComment(chatId, id);
        break;
      default:
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Неизвестное действие' });
    }
    
    // Отвечаем на callback
    await bot.answerCallbackQuery(callbackQuery.id);
    
  } catch (error) {
    console.error('Ошибка обработки callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Произошла ошибка' });
  }
});

// Обработка просмотра поста
async function handleViewPost(chatId, postId) {
  // Здесь можно добавить логику для получения информации о посте
  const postUrl = `https://t.me/kristina_egiazarova14/${postId}`;
  
  await bot.sendMessage(chatId,
    `📝 Информация о посте:\n\n` +
    `ID поста: ${postId}\n` +
    `Ссылка: ${postUrl}\n\n` +
    `Переходите по ссылке для просмотра поста.`
  );
  
  // Логируем просмотр
  console.log(`Пользователь ${chatId} просмотрел пост ${postId}`);
}

// Обработка показа статистики
async function handleShowStats(chatId, trackingId) {
  const tracking = trackingData.get(trackingId);
  
  if (!tracking) {
    await bot.sendMessage(chatId, 'Статистика не найдена.');
    return;
  }
  
  const stats = tracking.stats;
  const recentClicks = tracking.clicks.slice(-5); // Последние 5 переходов
  
  let statsMessage = `📊 Статистика отслеживания:\n\n`;
  statsMessage += `👥 Всего переходов: ${stats.totalClicks}\n`;
  statsMessage += `👤 Уникальных посетителей: ${stats.uniqueVisitors}\n`;
  statsMessage += `✅ Конверсий: ${stats.conversions}\n`;
  statsMessage += `❌ Отписок: ${stats.unsubscribes}\n\n`;
  
  if (recentClicks.length > 0) {
    statsMessage += `🕐 Последние переходы:\n`;
    recentClicks.forEach((click, index) => {
      const time = new Date(click.timestamp).toLocaleString();
      statsMessage += `${index + 1}. ${click.username || 'Пользователь'} - ${time}\n`;
    });
  }
  
  await bot.sendMessage(chatId, statsMessage);
}

// Обработка подписки
async function handleSubscribe(chatId, trackingId, userId) {
  // Логируем подписку
  const actionData = {
    trackingId,
    userId,
    action: 'subscribe',
    timestamp: new Date().toISOString()
  };
  
  console.log('Подписка пользователя:', actionData);
  
  // Обновляем статистику
  const tracking = trackingData.get(trackingId);
  if (tracking) {
    tracking.stats.conversions++;
  }
  
  await bot.sendMessage(chatId, 
    `✅ Спасибо за подписку!\n\n` +
    `Ваша подписка зафиксирована в статистике.`
  );
}

// Обработка отписки
async function handleUnsubscribe(chatId, trackingId, userId) {
  // Логируем отписку
  const actionData = {
    trackingId,
    userId,
    action: 'unsubscribe',
    timestamp: new Date().toISOString()
  };
  
  console.log('Отписка пользователя:', actionData);
  
  // Обновляем статистику
  const tracking = trackingData.get(trackingId);
  if (tracking) {
    tracking.stats.unsubscribes++;
  }
  
  await bot.sendMessage(chatId, 
    `❌ Отписка зафиксирована\n\n` +
    `Ваша отписка записана в статистику.`
  );
}

// Обработка репоста
async function handleShare(chatId, trackingId) {
  const shareUrl = `https://t.me/share/url?url=https://t.me/your_bot?start=track_${trackingId}`;
  
  await bot.sendMessage(chatId,
    `📤 Поделитесь ссылкой:\n\n` +
    `Ссылка для репоста: ${shareUrl}\n\n` +
    `Или скопируйте ссылку отслеживания и поделитесь ею.`
  );
  
  // Логируем репост
  console.log(`Пользователь ${chatId} поделился ссылкой ${trackingId}`);
}

// Обработка комментария
async function handleComment(chatId, trackingId) {
  // Устанавливаем состояние ожидания комментария
  userActions.set(chatId, { action: 'comment', trackingId });
  
  await bot.sendMessage(chatId,
    `💬 Оставьте комментарий:\n\n` +
    `Напишите ваш отзыв или комментарий к посту.`
  );
}

// Обработка текстовых сообщений (для комментариев)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  // Проверяем, ожидаем ли мы комментарий
  const userAction = userActions.get(chatId);
  
  if (userAction && userAction.action === 'comment') {
    // Логируем комментарий
    const commentData = {
      trackingId: userAction.trackingId,
      userId,
      username: msg.from.username,
      comment: text,
      timestamp: new Date().toISOString()
    };
    
    console.log('Комментарий пользователя:', commentData);
    
    await bot.sendMessage(chatId,
      `💬 Спасибо за комментарий!\n\n` +
      `Ваш отзыв: "${text}"\n\n` +
      `Комментарий сохранён в статистике.`
    );
    
    // Очищаем состояние
    userActions.delete(chatId);
  }
});

// Приветственное сообщение
async function sendWelcomeMessage(msg) {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(chatId,
    `👋 Добро пожаловать в бот отслеживания!\n\n` +
    `Этот бот помогает отслеживать переходы по ссылкам на посты и анализировать поведение пользователей.\n\n` +
    `🔗 Для отслеживания используйте специальные ссылки, которые создаются в WebApp.\n\n` +
    `📊 Вы можете просматривать статистику переходов, конверсий и других действий пользователей.`
  );
}

// Обработка ошибок
bot.on('error', (error) => {
  console.error('Ошибка бота:', error);
});

bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error);
});

// Запуск бота
console.log('Бот отслеживания запущен...');

// Экспорт для использования в других модулях
module.exports = {
  bot,
  trackingData,
  userActions
}; 