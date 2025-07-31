import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function initDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'telegram_webapp',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    console.log('🔧 Initializing database...');

    // Читаем схему из файла
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Выполняем SQL скрипт
    await pool.query(schema);

    console.log('✅ Database schema created successfully');

    // Добавляем демо-данные для тестирования
    await addDemoData(pool);

    console.log('✅ Demo data added successfully');
    console.log('🎉 Database initialization completed!');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function addDemoData(pool: Pool) {
  // Добавляем демо-чаты
  const demoChats = [
    {
      chat_id: -1001234567890,
      chat_title: 'Мой Телеграм Канал',
      username: 'my_channel',
      type: 'channel',
      bot_status: 'administrator',
      member_count: 15420
    },
    {
      chat_id: -1001234567891,
      chat_title: 'Группа Поддержки',
      username: 'support_group',
      type: 'supergroup',
      bot_status: 'administrator',
      member_count: 2340
    },
    {
      chat_id: -1001234567892,
      chat_title: 'Новости проекта',
      username: 'news_channel',
      type: 'channel',
      bot_status: 'administrator',
      member_count: 8920
    }
  ];

  for (const chat of demoChats) {
    await pool.query(
      `INSERT INTO telegram_chats (chat_id, chat_title, username, type, bot_status, member_count)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (chat_id) DO NOTHING`,
      [chat.chat_id, chat.chat_title, chat.username, chat.type, chat.bot_status, chat.member_count]
    );
  }

  // Добавляем демо-админов (предполагаем, что пользователь с ID 123456789 админ во всех чатах)
  const demoUserId = 123456789;
  
  for (const chat of demoChats) {
    await pool.query(
      `INSERT INTO chat_admins (chat_id, user_id, is_admin, role, last_checked_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (chat_id, user_id) DO NOTHING`,
      [chat.chat_id, demoUserId, true, 'administrator']
    );
  }

  console.log(`📊 Added ${demoChats.length} demo chats and admin records`);
}

// Запускаем инициализацию если скрипт вызван напрямую
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Database initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
}

export { initDatabase }; 