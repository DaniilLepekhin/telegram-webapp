import { InlineKeyboard, Keyboard } from 'grammy';
import { cfg } from '../config.ts';

export const kb = {
  // Main webapp button
  openWebApp: (text = '🚀 Открыть Showcase') =>
    new InlineKeyboard().webApp(text, cfg.WEBAPP_URL),

  // Welcome keyboard
  welcome: () =>
    new InlineKeyboard()
      .webApp('🚀 Открыть демо-платформу', cfg.WEBAPP_URL)
      .row()
      .text('📊 Кейсы и результаты', 'show_cases')
      .text('💡 Как это работает', 'how_it_works')
      .row()
      .url('📞 Написать @daniillepekhin', 'https://t.me/daniillepekhin'),

  // Cases menu
  cases: () =>
    new InlineKeyboard()
      .text('🛍️ E-Commerce Bot', 'case_ecom')
      .text('🏆 Club & Community', 'case_club')
      .row()
      .text('⚡ Service Auto', 'case_service')
      .text('🎓 EdTech Platform', 'case_education')
      .row()
      .text('🎯 Support Desk', 'case_support')
      .text('🚀 Growth Funnels', 'case_funnel')
      .row()
      .webApp('▶️ Запустить демо', cfg.WEBAPP_URL)
      .row()
      .text('« Назад', 'back_main'),

  // Single case
  caseDetail: (caseId: string) =>
    new InlineKeyboard()
      .webApp(`▶️ Запустить кейс`, `${cfg.WEBAPP_URL}?scenario=${caseId}`)
      .row()
      .text('📋 Все кейсы', 'show_cases')
      .text('💬 Обсудить', 'contact'),

  // Referral
  referral: (link: string) =>
    new InlineKeyboard()
      .url('📤 Поделиться ссылкой', `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Смотри, какой крутой инструмент для Telegram-ботов!')}`)
      .row()
      .text('📊 Моя статистика рефералов', 'referral_stats'),

  // Subscription
  subscription: (payUrl: string) =>
    new InlineKeyboard()
      .url('💳 Оплатить доступ', payUrl)
      .row()
      .text('❓ Что входит в Pro?', 'pro_features'),
};
