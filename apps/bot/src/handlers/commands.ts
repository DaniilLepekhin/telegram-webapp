import type { Bot, Context } from 'grammy';
import { kb } from '../utils/keyboard.ts';
import { msg } from '../utils/messages.ts';
import { userService } from '../services/userService.ts';
import { scheduler } from '../utils/redis.ts';

// Cache bot username so we don't hit the Telegram API on every /ref and /pro call
let _botUsername: string | null = null;
async function getBotUsername(ctx: Context): Promise<string> {
  if (_botUsername) return _botUsername;
  const info = await ctx.api.getMe();
  _botUsername = info.username;
  return _botUsername;
}

export function registerCommands(bot: Bot<Context>) {
  // ─── /start ──────────────────────────────────────────────────────────────────
  bot.command('start', async (ctx) => {
    if (!ctx.from) return;

    const startParam = ctx.match || undefined;
    const user = await userService.upsert(ctx.from, startParam);

    await ctx.reply(msg.welcome(ctx.from.first_name), {
      parse_mode: 'HTML',
      reply_markup: kb.welcome(),
    });

    // Schedule nurture sequence — skip if already queued for this user (handles /start spam).
    // markScheduled is called alongside schedule() so hasScheduled returns true on the next /start.
    const userId = user.id;
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const [has5m, has1h, has1d] = await Promise.all([
      scheduler.hasScheduled('nurture_5m', userId),
      scheduler.hasScheduled('nurture_1h', userId),
      scheduler.hasScheduled('nurture_1d', userId),
    ]);
    if (!has5m) {
      await scheduler.schedule('nurture_5m', { userId, chatId }, 5 * 60_000);
      await scheduler.markScheduled('nurture_5m', userId);
    }
    if (!has1h) {
      await scheduler.schedule('nurture_1h', { userId, chatId }, 60 * 60_000);
      await scheduler.markScheduled('nurture_1h', userId);
    }
    if (!has1d) {
      await scheduler.schedule('nurture_1d', { userId, chatId }, 24 * 60 * 60_000);
      await scheduler.markScheduled('nurture_1d', userId, 25 * 60 * 60); // TTL slightly longer than delay
    }
  });

  // ─── /demo ───────────────────────────────────────────────────────────────────
  bot.command('demo', async (ctx) => {
    await ctx.reply(
      '🎭 <b>Выбери кейс для демонстрации:</b>\n\nКаждый сценарий показывает реальный путь пользователя через твой продукт. Запускается прямо в WebApp.',
      { parse_mode: 'HTML', reply_markup: kb.cases() },
    );
  });

  // ─── /ref ────────────────────────────────────────────────────────────────────
  bot.command('ref', async (ctx) => {
    if (!ctx.from) return;

    const user = await userService.upsert(ctx.from);
    const botUsername = await getBotUsername(ctx);

    // referralCode may be null for users created before the referral system was added.
    if (!user.referralCode) {
      await ctx.reply('❌ Реферальный код не найден. Попробуй перезапустить бота командой /start.', { parse_mode: 'HTML' });
      return;
    }

    const link = userService.getReferralLink(user.referralCode, botUsername);
    const stats = await userService.getReferralStats(user.id);

    await ctx.reply(msg.referralInfo(user.referralCode, link, stats.count), {
      parse_mode: 'HTML',
      reply_markup: kb.referral(link),
    });
  });

  // ─── /stats ──────────────────────────────────────────────────────────────────
  bot.command('stats', async (ctx) => {
    if (!ctx.from) return;
    const user = await userService.upsert(ctx.from);

    await ctx.reply(
      `📊 <b>Твой профиль</b>\n\n` +
      `⚡ XP: <b>${user.xp}</b> (уровень ${user.level})\n` +
      `🔥 Стрик: <b>${user.streak} дн.</b>\n` +
      `💎 Энергия: <b>${user.energyBalance}</b>\n\n` +
      `<i>Все детали — в WebApp 👇</i>`,
      { parse_mode: 'HTML', reply_markup: kb.openWebApp('📊 Полная статистика') },
    );
  });

  // ─── /pro ────────────────────────────────────────────────────────────────────
  bot.command('pro', async (ctx) => {
    const botUsername = await getBotUsername(ctx);
    await ctx.reply(msg.proFeatures(), {
      parse_mode: 'HTML',
      reply_markup: kb.subscription(`https://t.me/${botUsername}`),
    });
  });

  // ─── /help ───────────────────────────────────────────────────────────────────
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `📖 <b>Доступные команды:</b>\n\n` +
      `/start — запустить бота\n` +
      `/demo — посмотреть demo-кейсы\n` +
      `/ref — реферальная программа\n` +
      `/stats — твой профиль и XP\n` +
      `/pro — подписка Pro\n` +
      `/help — эта справка`,
      { parse_mode: 'HTML', reply_markup: kb.openWebApp() },
    );
  });
}
