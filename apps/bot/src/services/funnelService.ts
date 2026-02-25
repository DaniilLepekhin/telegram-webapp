import type { Api } from 'grammy';
import { kb } from '../utils/keyboard.ts';

/** Returns a human-readable month name in the genitive case (e.g. "февраля") for the next calendar month. */
function nextMonthLabel(): string {
  const months = [
    'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря', 'января',
  ];
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  return months[next.getMonth()];
}

// Drip nurture sequences
const NURTURE_SEQUENCES = {
  nurture_5m: {
    text: (name: string) =>
      `⚡ <b>${name}, пока ты здесь —</b>\n\nЕсть одна штука, которую часто недооценивают при запуске Telegram-бота...\n\n<b>Трекинг.</b> Без него ты не знаешь, откуда приходят люди, что их конвертит и почему уходят.\n\nВ Showcase Platform трекинг встроен с нуля — UTM, A/B, GeoIP, attribution. Попробуй создать ссылку прямо сейчас 👇`,
    keyboard: async () => {
      const { InlineKeyboard } = await import('grammy');
      const { cfg } = await import('../config.ts');
      return new InlineKeyboard()
        .webApp('🔗 Создать трекинг-ссылку', cfg.WEBAPP_URL)
        .row()
        .text('Потом', 'dismiss_nurture');
    },
  },

  nurture_1h: {
    text: (name: string) =>
      `🏆 <b>${name}, ты видел эти цифры?</b>\n\n<b>Клуб на Telegram-боте:</b>\n• MRR вырос с ₽280K до ₽840K за 6 месяцев\n• Churn упал с 12% до 4.2%\n• DAU/MAU 71% (топ в нише)\n\nВсё это — на той же аудитории, просто с правильной механикой.\n\nХочешь увидеть как именно? Запусти club-сценарий 👇`,
    keyboard: async () => {
      const { InlineKeyboard } = await import('grammy');
      const { cfg } = await import('../config.ts');
      return new InlineKeyboard()
        .webApp('🏆 Club кейс → демо', `${cfg.WEBAPP_URL}?scenario=club`)
        .row()
        .text('Не интересно', 'dismiss_nurture');
    },
  },

  nurture_1d: {
    text: (name: string) =>
      `🚀 <b>${name}, последний вопрос.</b>\n\nЕсли бы твой бот приносил на 30% больше заявок при тех же затратах — ты бы захотел узнать как?\n\nЯ сделал это для сервисного бизнеса: 340 лидов в день без менеджеров, ROI 380%.\n\nСкоро закрываю свободные слоты на ${nextMonthLabel()}. Напиши — обсудим твой кейс:`,
    keyboard: async () => {
      const { InlineKeyboard } = await import('grammy');
      return new InlineKeyboard()
        .url('💬 Написать @daniillepekhin', 'https://t.me/daniillepekhin')
        .row()
        .text('Уже написал', 'dismiss_nurture');
    },
  },
};

export const funnelService = {
  async processScheduledTask(
    api: Api,
    task: { type: string; payload: { userId: string; chatId: number } },
    userName: string,
  ): Promise<void> {
    const sequence = NURTURE_SEQUENCES[task.type as keyof typeof NURTURE_SEQUENCES];
    if (!sequence) return;

    try {
      await api.sendMessage(task.payload.chatId, sequence.text(userName), {
        parse_mode: 'HTML',
        reply_markup: await sequence.keyboard(),
      });
    } catch (e) {
      // User may have blocked bot — ignore
      console.warn('[Funnel] send failed:', e);
    }
  },
};
