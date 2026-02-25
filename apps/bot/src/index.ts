import { Bot, webhookCallback } from 'grammy';
import { timingSafeEqual } from 'node:crypto';
import { cfg, isDev } from './config.ts';
import { registerCommands } from './handlers/commands.ts';
import { registerCallbacks } from './handlers/callbacks.ts';
import { scheduler } from './utils/redis.ts';
import { funnelService } from './services/funnelService.ts';

// ─── Bot Init ─────────────────────────────────────────────────────────────────
const bot = new Bot(cfg.TELEGRAM_BOT_TOKEN);

// ─── Register handlers ────────────────────────────────────────────────────────
registerCommands(bot);
registerCallbacks(bot);

// Dismiss nurture callbacks
bot.callbackQuery('dismiss_nurture', async (ctx) => {
  await ctx.answerCallbackQuery('Понял, не беспокою 👌');
  await ctx.editMessageReplyMarkup({ reply_markup: undefined });
});

// Unknown callback fallback
bot.on('callback_query:data', async (ctx) => {
  await ctx.answerCallbackQuery('Команда устарела. Введи /start');
});

// Error handler
bot.catch((err) => {
  console.error('[Bot] Error:', err.error);
});

// ─── Scheduler polling (every 5s) ─────────────────────────────────────────────
// biome-ignore lint/style/useConst: reassigned in shutdown handler
let schedulerRunning = true;
const schedulerInterval = setInterval(async () => {
  if (!schedulerRunning) return;
  await scheduler.poll(async (task) => {
    const payload = task.payload as { userId: string; chatId: number; userName?: string };
    await funnelService.processScheduledTask(
      bot.api,
      { type: task.type, payload: { userId: payload.userId, chatId: payload.chatId } },
      payload.userName ?? 'друг',
    );
  });
}, 5_000);

// ─── Launch mode ─────────────────────────────────────────────────────────────
if (isDev) {
  console.log('🤖 Bot starting in polling mode (dev)...');
  bot.start({
    onStart: (info) => console.log(`✓ Bot @${info.username} started (polling)`),
    drop_pending_updates: true,
  });
} else {
  // Webhook mode for production
  console.log(`🤖 Bot starting in webhook mode on port ${cfg.BOT_WEBHOOK_PORT}...`);

  const handler = webhookCallback(bot, 'bun');

  Bun.serve({
    port: cfg.BOT_WEBHOOK_PORT, // already a number after config coercion
    fetch: async (req) => {
      const url = new URL(req.url);

      if (url.pathname === '/webhook' && req.method === 'POST') {
        // Verify webhook secret (constant-time comparison to prevent timing attacks)
        const secret = req.headers.get('x-telegram-bot-api-secret-token') ?? '';
        const expected = cfg.TELEGRAM_WEBHOOK_SECRET;
        let authorized = false;
        try {
          authorized = expected.length > 0 &&
            timingSafeEqual(Buffer.from(secret), Buffer.from(expected));
        } catch { authorized = false; }
        if (!authorized) {
          return new Response('Unauthorized', { status: 401 });
        }
        return handler(req);
      }

      if (url.pathname === '/health') {
        return Response.json({ status: 'ok', bot: 'running' });
      }

      return new Response('Not found', { status: 404 });
    },
  });

  console.log(`✓ Webhook server listening on :${cfg.BOT_WEBHOOK_PORT}`);
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  console.log(`Bot shutting down (${signal})...`);
  schedulerRunning = false;
  clearInterval(schedulerInterval);
  await bot.stop();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
