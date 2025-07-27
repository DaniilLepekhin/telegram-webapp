// Революционный Telegram Bot с WebApp интеграцией
const TelegramBot = require('node-telegram-bot-api');

// Конфигурация бота
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '5466303727:AAGauSz23_We8iTGjRhbaL5LJobgs3e9V0E';
const WEBAPP_URL = 'https://app.daniillepekhin.ru';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Хранилище данных
const trackingData = new Map();
const userActions = new Map();

console.log('🚀 Революционный Telegram Bot запущен!');
console.log('🌐 WebApp URL:', WEBAPP_URL);

// Обработка простой команды /start
bot.onText(/^\/start$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;
  
  console.log(`👤 Новый пользователь: ${username} (${userId})`);
  
  try {
    await sendRevolutionaryWelcome(msg);
  } catch (error) {
    console.error('❌ Ошибка обработки /start:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
  }
});

// Обработка команды /start с параметрами отслеживания
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const params = match[1];
  
  try {
    if (params.startsWith('track_')) {
      await handleTrackingLink(msg, params);
    } else {
      await sendRevolutionaryWelcome(msg);
    }
  } catch (error) {
    console.error('❌ Ошибка обработки /start с параметрами:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
  }
});

// Революционное приветственное сообщение с WebApp
async function sendRevolutionaryWelcome(msg) {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  
  const welcomeText = `🎉 *Добро пожаловать в революционный WebApp!*

🚀 *Что вас ждет:*
• 📱 Полноэкранный WebApp с современным дизайном
• 🎯 Витрина кейсов чат-ботов
• 💬 Интерактивный демо-чат
• 📊 Аналитика каналов и постов
• 🔗 Система отслеживания переходов
• 👥 Реферальная программа
• 🎮 Геймификация и достижения

💡 *Нажмите кнопку ниже, чтобы открыть революционный WebApp!*`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🚀 Открыть революционный WebApp',
          web_app: { url: WEBAPP_URL }
        }
      ],
      [
        { text: '📊 Статистика', callback_data: 'show_stats' },
        { text: '🔗 Создать ссылку отслеживания', callback_data: 'create_tracking' }
      ],
      [
        { text: '🎯 Демо кейсы', callback_data: 'show_cases' },
        { text: '💬 Поддержка', callback_data: 'support' }
      ]
    ]
  };

  await bot.sendMessage(chatId, welcomeText, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });

  console.log(`✅ Отправлено революционное приветствие пользователю ${username}`);
}

// Обработка WebApp данных
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app_data.data);
  
  console.log('📱 Получены данные от WebApp:', data);
  
  try {
    switch (data.action) {
      case 'demo':
        await bot.sendMessage(chatId, `🎉 Получены данные: ${data.value}`);
        break;
      case 'tracking_created':
        await bot.sendMessage(chatId, `🔗 Создана ссылка отслеживания: ${data.trackingUrl}`);
        break;
      case 'analytics_viewed':
        await bot.sendMessage(chatId, `📊 Просмотрена аналитика: ${data.section}`);
        break;
      default:
        await bot.sendMessage(chatId, `📱 Получено действие: ${data.action}`);
    }
  } catch (error) {
    console.error('❌ Ошибка обработки WebApp данных:', error);
  }
});

// Обработка callback_query
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  try {
    switch (data) {
      case 'show_stats':
        await showStats(chatId);
        break;
      case 'create_tracking':
        await createTrackingLink(chatId);
        break;
      case 'show_cases':
        await showCases(chatId);
        break;
      case 'support':
        await showSupport(chatId);
        break;
      default:
        if (data.startsWith('track_')) {
          await handleTrackingAction(query);
        }
    }
    
    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('❌ Ошибка обработки callback:', error);
    await bot.answerCallbackQuery(query.id, { text: 'Произошла ошибка' });
  }
});

// Показать статистику
async function showStats(chatId) {
  const statsText = `📊 *Статистика WebApp:*

👥 Пользователей: 1,234
🚀 Открытий WebApp: 5,678
📱 Активных сессий: 890
🎯 Конверсий: 234 (4.1%)

📈 *Топ разделов:*
1. Витрина кейсов - 45%
2. Аналитика - 30%
3. Демо-чат - 15%
4. Реферальная система - 10%`;

  await bot.sendMessage(chatId, statsText, { parse_mode: 'Markdown' });
}

// Создать ссылку отслеживания
async function createTrackingLink(chatId) {
  const trackingId = Date.now().toString();
  const trackingUrl = `https://t.me/your_bot?start=track_${trackingId}`;
  
  const text = `🔗 *Создана ссылка отслеживания:*

📝 ID: \`${trackingId}\`
🔗 Ссылка: \`${trackingUrl}\`

📊 *Статистика:*
• Переходы: 0
• Конверсии: 0
• Уникальные посетители: 0

💡 *Используйте эту ссылку для отслеживания переходов по постам!*`;

  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
}

// Показать кейсы
async function showCases(chatId) {
  const casesText = `🎯 *Демо кейсы WebApp:*

1. **E-commerce Bot** 🛒
   • Автоматические заказы
   • Интеграция с платежами
   • Аналитика продаж

2. **Support Bot** 🎧
   • 24/7 поддержка
   • База знаний
   • Эскалация тикетов

3. **Health Bot** 🏥
   • Напоминания о приемах
   • Мониторинг здоровья
   • Консультации врачей

4. **Education Bot** 📚
   • Интерактивные уроки
   • Тестирование знаний
   • Прогресс обучения

🚀 *Откройте WebApp для полного демо!*`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🚀 Открыть WebApp',
          web_app: { url: WEBAPP_URL }
        }
      ]
    ]
  };

  await bot.sendMessage(chatId, casesText, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

// Показать поддержку
async function showSupport(chatId) {
  const supportText = `💬 *Поддержка:*

📧 Email: support@webapp.com
📱 Telegram: @support_bot
🌐 Сайт: https://webapp.com/support

🕐 *Время работы:*
Пн-Пт: 9:00-18:00 (МСК)
Сб-Вс: 10:00-16:00 (МСК)

💡 *Часто задаваемые вопросы:*
• Как создать ссылку отслеживания?
• Как настроить аналитику?
• Как интегрировать с Telegram?

🚀 *Откройте WebApp для получения помощи!*`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🚀 Открыть WebApp',
          web_app: { url: WEBAPP_URL }
        }
      ]
    ]
  };

  await bot.sendMessage(chatId, supportText, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

// Обработка ссылки отслеживания
async function handleTrackingLink(msg, params) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;
  
  try {
    const [trackingId, postId] = params.replace('track_', '').split('_');
    
    console.log(`🔗 Переход по ссылке: ${trackingId}, пост: ${postId}`);
    
    // Логируем переход
    const clickData = {
      trackingId,
      postId,
      userId,
      username,
      timestamp: new Date().toISOString()
    };
    
    if (!trackingData.has(trackingId)) {
      trackingData.set(trackingId, {
        clicks: [],
        stats: { totalClicks: 0, uniqueVisitors: 0, conversions: 0 }
      });
    }
    
    const tracking = trackingData.get(trackingId);
    tracking.clicks.push(clickData);
    tracking.stats.totalClicks++;
    
    const uniqueUsers = new Set(tracking.clicks.map(click => click.userId));
    tracking.stats.uniqueVisitors = uniqueUsers.size;
    
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
          { text: '🚀 Открыть WebApp', callback_data: 'open_webapp' }
        ]
      ]
    };
    
    await bot.sendMessage(chatId, 
      `🔗 *Добро пожаловать!*\n\n` +
      `Вы перешли по ссылке отслеживания.\n` +
      `📝 ID поста: \`${postId}\`\n` +
      `🔗 ID отслеживания: \`${trackingId}\`\n\n` +
      `📊 *Статистика:*\n` +
      `• Переходов: ${tracking.stats.totalClicks}\n` +
      `• Уникальных посетителей: ${tracking.stats.uniqueVisitors}\n\n` +
      `Выберите действие:`, 
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
    
  } catch (error) {
    console.error('❌ Ошибка обработки ссылки отслеживания:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при обработке ссылки.');
  }
}

// Обработка действий отслеживания
async function handleTrackingAction(query) {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  if (data === 'open_webapp') {
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🚀 Открыть WebApp',
            web_app: { url: WEBAPP_URL }
          }
        ]
      ]
    };
    
    await bot.sendMessage(chatId, '🚀 Открываю революционный WebApp...', {
      reply_markup: keyboard
    });
  } else {
    await bot.sendMessage(chatId, `✅ Действие выполнено: ${data}`);
  }
}

// Обработка ошибок
bot.on('error', (error) => {
  console.error('❌ Ошибка бота:', error);
});

bot.on('polling_error', (error) => {
  console.error('❌ Ошибка polling:', error);
});

// Установка команд бота
bot.setMyCommands([
  { command: '/start', description: '🚀 Запустить революционный WebApp' },
  { command: '/stats', description: '📊 Показать статистику' },
  { command: '/track', description: '🔗 Создать ссылку отслеживания' },
  { command: '/help', description: '💬 Получить помощь' }
]);

// Обработка команды /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpText = `💬 *Помощь по использованию бота:*

🚀 */start* - Запустить революционный WebApp
📊 */stats* - Показать статистику
🔗 */track* - Создать ссылку отслеживания
💬 */help* - Показать эту справку

🎯 *Возможности WebApp:*
• Полноэкранный режим
• Современный дизайн
• Интерактивные элементы
• Аналитика в реальном времени
• Система отслеживания

💡 *Для получения полного функционала откройте WebApp!*`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🚀 Открыть WebApp',
          web_app: { url: WEBAPP_URL }
        }
      ]
    ]
  };

  await bot.sendMessage(chatId, helpText, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

// Обработка команды /stats
bot.onText(/\/stats/, async (msg) => {
  await showStats(msg.chat.id);
});

// Обработка команды /track
bot.onText(/\/track/, async (msg) => {
  await createTrackingLink(msg.chat.id);
});

console.log('✅ Революционный Telegram Bot готов к работе!');
console.log('🤖 Используйте команду /start для начала работы'); 