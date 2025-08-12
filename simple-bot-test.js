const TelegramBot = require('node-telegram-bot-api');

const token = '5466303727:AAGauSz23_We8iTGjRhbaL5LJobgs3e9V0E';
const bot = new TelegramBot(token, {polling: true});

console.log('🔥 SIMPLE BOT STARTING...');

// Проверка подключения
bot.getMe().then(me => {
  console.log('✅ Bot connected:', me.username);
}).catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

// Удаляем webhook принудительно
bot.deleteWebHook({drop_pending_updates: true}).then(() => {
  console.log('🔧 Webhook deleted');
}).catch(err => {
  console.error('⚠️ Webhook delete failed:', err.message);
});

// Логируем ВСЁ
bot.on('message', (msg) => {
  console.log('📨 MESSAGE RECEIVED:', {
    chat_id: msg.chat.id,
    from: msg.from.username || msg.from.first_name,
    text: msg.text,
    date: new Date(msg.date * 1000).toISOString()
  });
  
  // Отвечаем на любое сообщение
  bot.sendMessage(msg.chat.id, `Echo: ${msg.text || 'non-text message'} | Time: ${new Date().toISOString()}`);
});

bot.on('polling_error', (error) => {
  console.error('❌ POLLING ERROR:', error.message);
});

bot.on('error', (error) => {
  console.error('❌ BOT ERROR:', error.message);
});

console.log('🚀 Bot is ready. Send any message!');

