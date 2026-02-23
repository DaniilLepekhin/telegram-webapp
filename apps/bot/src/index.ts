import { Bot, webhookCallback } from 'grammy';
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
setInterval(async () => {
  await scheduler.poll(async (task) => {
    const payload = task.payload as { userId: string; chatId: number; userName?: string };
    await funnelService.processScheduledTask(bot.api, task as any, payload.userName ?? 'друг');
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
    port: parseInt(cfg.BOT_WEBHOOK_PORT),
    fetch: async (req) => {
      const url = new URL(req.url);

      if (url.pathname === '/webhook' && req.method === 'POST') {
        // Verify webhook secret
        const secret = req.headers.get('x-telegram-bot-api-secret-token');
        if (secret !== cfg.TELEGRAM_WEBHOOK_SECRET) {
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
process.on('SIGTERM', async () => {
  console.log('Bot shutting down...');
  await bot.stop();
  process.exit(0);
});
