import type { Bot, Context } from 'grammy';
import { kb } from '../utils/keyboard.ts';
import { msg } from '../utils/messages.ts';
import { userService } from '../services/userService.ts';

export function registerCallbacks(bot: Bot<Context>) {
  // ─── Cases menu ───────────────────────────────────────────────────────────
  bot.callbackQuery('show_cases', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      '🎯 <b>Demo-кейсы Showcase Platform</b>\n\nВыбери нишу — покажу реальные результаты:',
      { parse_mode: 'HTML', reply_markup: kb.cases() },
    );
  });

  bot.callbackQuery('back_main', async (ctx) => {
    await ctx.answerCallbackQuery();
    const name = ctx.from?.first_name ?? 'друг';
    await ctx.editMessageText(msg.welcome(name), {
      parse_mode: 'HTML',
      reply_markup: kb.welcome(),
    });
  });

  bot.callbackQuery('how_it_works', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(msg.howItWorks(), {
      parse_mode: 'HTML',
      reply_markup: new (await import('grammy')).InlineKeyboard()
        .webApp('🚀 Попробовать', (await import('../config.ts')).cfg.WEBAPP_URL)
        .row()
        .text('« Назад', 'back_main'),
    });
  });

  bot.callbackQuery('contact', async (ctx) => {
    await ctx.answerCallbackQuery('Открываю контакт...');
    await ctx.reply('💬 Напиши @daniillepekhin — обсудим твой проект!');
  });

  // ─── Individual cases ─────────────────────────────────────────────────────
  const caseHandlers: Record<string, () => string> = {
    case_ecom: msg.caseEcom,
    case_club: msg.caseClub,
    case_service: msg.caseService,
  };

  for (const [key, msgFn] of Object.entries(caseHandlers)) {
    const caseId = key.replace('case_', '');
    bot.callbackQuery(key, async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.editMessageText(msgFn(), {
        parse_mode: 'HTML',
        reply_markup: kb.caseDetail(caseId),
      });
    });
  }

  // Cases without dedicated message — fall through to webapp
  for (const caseId of ['case_education', 'case_support', 'case_funnel']) {
    const id = caseId.replace('case_', '');
    bot.callbackQuery(caseId, async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.editMessageText(
        `🎯 <b>Кейс "${id}" — открывается в WebApp</b>\n\nЗапусти интерактивный сценарий прямо сейчас:`,
        { parse_mode: 'HTML', reply_markup: kb.caseDetail(id) },
      );
    });
  }

  // ─── Referral stats ───────────────────────────────────────────────────────
  bot.callbackQuery('referral_stats', async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.from) return;
    const user = await userService.upsert(ctx.from);
    const stats = await userService.getReferralStats(user.id);
    await ctx.reply(
      `📊 <b>Твои рефералы</b>\n\n👤 Приглашено: <b>${stats.count}</b>\n⚡ Заработано XP: <b>${stats.totalXp}</b>`,
      { parse_mode: 'HTML' },
    );
  });

  // ─── Pro features ─────────────────────────────────────────────────────────
  bot.callbackQuery('pro_features', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(msg.proFeatures(), { parse_mode: 'HTML' });
  });
}
