import React from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';

const Showcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation buttons */}
      <BackButton onClick={() => (window as any).handleGoBack?.()} />
      <FullscreenButton />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12 fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-3xl mb-6 shadow-2xl animate-pulse">
            <span className="text-4xl">💎</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-4 sm:mb-8 drop-shadow-2xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Витрина кейсов ✨
          </h1>
          <p className="text-2xl sm:text-3xl text-white/80 drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
            Лучшие проекты и инновационные решения для вдохновения
          </p>
        </div>

        {/* Case studies grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Case Study 1 */}
          <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-white mb-2">E-commerce Platform</h3>
              <p className="text-white/70 mb-4">Современная платформа электронной коммерции с AI-рекомендациями</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Node.js</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">AI/ML</span>
              </div>
            </div>
          </div>

          {/* Case Study 2 */}
          <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-white mb-2">Mobile App</h3>
              <p className="text-white/70 mb-4">Кроссплатформенное приложение для фитнес-трекинга</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">React Native</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Firebase</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">HealthKit</span>
              </div>
            </div>
          </div>

          {/* Case Study 3 */}
          <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-2">Gaming Platform</h3>
              <p className="text-white/70 mb-4">Многопользовательская игровая платформа с реальным временем</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Unity</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">WebSocket</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">AWS</span>
              </div>
            </div>
          </div>

          {/* Case Study 4 */}
          <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-xl font-bold text-white mb-2">Healthcare System</h3>
              <p className="text-white/70 mb-4">Система управления медицинскими данными с AI-диагностикой</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Vue.js</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Python</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">TensorFlow</span>
              </div>
            </div>
          </div>

          {/* Case Study 5 */}
          <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="text-4xl mb-4">🏦</div>
              <h3 className="text-xl font-bold text-white mb-2">FinTech Solution</h3>
              <p className="text-white/70 mb-4">Безопасная платформа для криптовалютных транзакций</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Angular</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Blockchain</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Security</span>
              </div>
            </div>
          </div>

          {/* Case Study 6 */}
          <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-white mb-2">EdTech Platform</h3>
              <p className="text-white/70 mb-4">Интерактивная образовательная платформа с VR-технологиями</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Next.js</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Three.js</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">WebXR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics section */}
        <div className="mt-16">
          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Наши достижения</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">500+</div>
                <div className="text-white/70">Завершенных проектов</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">98%</div>
                <div className="text-white/70">Довольных клиентов</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">50M+</div>
                <div className="text-white/70">Пользователей</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-400 mb-2">24/7</div>
                <div className="text-white/70">Поддержка</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Showcase; 