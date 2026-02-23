import type { Bot, Context } from 'grammy';
import { kb } from '../utils/keyboard.ts';
import { msg } from '../utils/messages.ts';
import { userService } from '../services/userService.ts';
import { scheduler } from '../utils/redis.ts';

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

    // Schedule nurture sequence (5 min, 1 hour, 1 day)
    await scheduler.schedule('nurture_5m', { userId: user.id, chatId: ctx.chat!.id }, 5 * 60_000);
    await scheduler.schedule('nurture_1h', { userId: user.id, chatId: ctx.chat!.id }, 60 * 60_000);
    await scheduler.schedule('nurture_1d', { userId: user.id, chatId: ctx.chat!.id }, 24 * 60 * 60_000);
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
    const botInfo = await ctx.api.getMe();
    const link = userService.getReferralLink(user.referralCode!, botInfo.username);
    const stats = await userService.getReferralStats(user.id);

    await ctx.reply(msg.referralInfo(user.referralCode!, link, stats.count), {
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
    await ctx.reply(msg.proFeatures(), {
      parse_mode: 'HTML',
      reply_markup: kb.subscription('https://t.me/' + (await ctx.api.getMe()).username),
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
