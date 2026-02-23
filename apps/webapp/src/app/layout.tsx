import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { TelegramInit } from '@/components/layout/TelegramInit';
import { BottomNav } from '@/components/layout/BottomNav';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Showcase Platform — Telegram Bot Cases',
  description: 'Демонстрация возможностей Telegram ботов и WebApp. 6 готовых кейсов: E-commerce, Club, Service, Education, Support, Funnels.',
  keywords: ['telegram bot', 'webapp', 'mini app', 'showcase', 'кейсы'],
  robots: 'noindex,nofollow', // Private demo
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080812',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        {/* Telegram WebApp SDK — Bot API 9.1 */}
        <script src="https://telegram.org/js/telegram-web-app.js?59" async />
      </head>
      <body className="bg-surface-0 text-white antialiased overflow-x-hidden">
        <TelegramInit />
        <Providers>
          <main className="pb-24">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
