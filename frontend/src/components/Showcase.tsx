import React, { useState } from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  technologies: string[];
  metrics: {
    users: string;
    growth: string;
    satisfaction: string;
    revenue: string;
  };
  image: string;
  color: string;
  featured: boolean;
}

const Showcase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  const categories = [
    { id: 'all', name: 'Все проекты', icon: '🌟' },
    { id: 'ecommerce', name: 'E-commerce', icon: '🛒' },
    { id: 'fintech', name: 'FinTech', icon: '💰' },
    { id: 'healthcare', name: 'Здравоохранение', icon: '🏥' },
    { id: 'education', name: 'Образование', icon: '🎓' },
    { id: 'entertainment', name: 'Развлечения', icon: '🎮' },
  ];

  const caseStudies: CaseStudy[] = [
    {
      id: '1',
      title: 'Telegram Analytics Pro',
      description: 'Комплексная система аналитики для Telegram каналов с AI-прогнозированием роста и автоматизацией контента',
      icon: '📊',
      category: 'ecommerce',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'AI/ML', 'Telegram API'],
      metrics: {
        users: '50K+',
        growth: '+340%',
        satisfaction: '98%',
        revenue: '$2.1M'
      },
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      color: 'from-blue-500 to-purple-600',
      featured: true
    },
    {
      id: '2',
      title: 'Crypto Trading Bot',
      description: 'Интеллектуальный торговый бот с машинным обучением для автоматической торговли криптовалютами',
      icon: '🤖',
      category: 'fintech',
      technologies: ['Python', 'TensorFlow', 'WebSocket', 'Redis', 'Docker'],
      metrics: {
        users: '15K+',
        growth: '+280%',
        satisfaction: '95%',
        revenue: '$850K'
      },
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
      color: 'from-green-500 to-emerald-600',
      featured: true
    },
    {
      id: '3',
      title: 'HealthAI Diagnostics',
      description: 'AI-система диагностики заболеваний по медицинским изображениям с точностью 94%',
      icon: '🏥',
      category: 'healthcare',
      technologies: ['React Native', 'TensorFlow', 'Python', 'AWS', 'HIPAA'],
      metrics: {
        users: '200K+',
        growth: '+420%',
        satisfaction: '99%',
        revenue: '$3.5M'
      },
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
      color: 'from-red-500 to-pink-600',
      featured: true
    },
    {
      id: '4',
      title: 'VR Learning Platform',
      description: 'Интерактивная образовательная платформа с VR-технологиями для иммерсивного обучения',
      icon: '🎓',
      category: 'education',
      technologies: ['Unity', 'WebXR', 'Three.js', 'Node.js', 'WebRTC'],
      metrics: {
        users: '75K+',
        growth: '+180%',
        satisfaction: '97%',
        revenue: '$1.8M'
      },
      image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&h=600&fit=crop',
      color: 'from-purple-500 to-indigo-600',
      featured: false
    },
    {
      id: '5',
      title: 'Social Gaming Network',
      description: 'Многопользовательская игровая платформа с социальными функциями и турнирами',
      icon: '🎮',
      category: 'entertainment',
      technologies: ['Unity', 'WebSocket', 'MongoDB', 'Redis', 'AWS'],
      metrics: {
        users: '300K+',
        growth: '+560%',
        satisfaction: '96%',
        revenue: '$4.2M'
      },
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop',
      color: 'from-orange-500 to-red-600',
      featured: false
    },
    {
      id: '6',
      title: 'Smart E-commerce',
      description: 'AI-платформа электронной коммерции с персонализированными рекомендациями и чат-ботом',
      icon: '🛒',
      category: 'ecommerce',
      technologies: ['Next.js', 'Python', 'AI/ML', 'Stripe', 'Redis'],
      metrics: {
        users: '120K+',
        growth: '+290%',
        satisfaction: '94%',
        revenue: '$2.8M'
      },
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      color: 'from-teal-500 to-cyan-600',
      featured: false
    }
  ];

  const filteredCases = selectedCategory === 'all' 
    ? caseStudies 
    : caseStudies.filter(caseStudy => caseStudy.category === selectedCategory);

  const featuredCases = caseStudies.filter(caseStudy => caseStudy.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-pink-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-3000"></div>
      </div>

      {/* Navigation buttons */}
      <BackButton onClick={() => (window as any).handleGoBack?.()} />
      <FullscreenButton />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12 sm:mb-16 fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-3xl mb-6 shadow-2xl animate-pulse-glow">
            <span className="text-3xl sm:text-4xl lg:text-5xl">💎</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-8 drop-shadow-2xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Витрина кейсов ✨
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-white/80 drop-shadow-lg max-w-4xl mx-auto leading-relaxed">
            Реальные проекты с измеримыми результатами и инновационными решениями
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 sm:mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/10 backdrop-blur-xl text-white/80 hover:bg-white/20 border border-white/20'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Featured Cases Section */}
        {selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">🌟 Избранные проекты</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {featuredCases.map((caseStudy) => (
                <div
                  key={caseStudy.id}
                  onClick={() => setSelectedCase(caseStudy)}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                       style={{ background: `linear-gradient(135deg, ${caseStudy.color.split(' ')[1]}, ${caseStudy.color.split(' ')[3]})` }}></div>
                  <div className="relative z-10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                           style={{ background: `linear-gradient(135deg, ${caseStudy.color.split(' ')[1]}, ${caseStudy.color.split(' ')[3]})` }}>
                        <span className="text-xl sm:text-2xl">{caseStudy.icon}</span>
                      </div>
                      <div className="text-xs px-2 py-1 bg-white/20 rounded-lg text-white/80">Featured</div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors duration-300">
                      {caseStudy.title}
                    </h3>
                    <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4">
                      {caseStudy.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {caseStudy.technologies.slice(0, 3).map((tech, index) => (
                        <span key={index} className="px-2 py-1 bg-white/10 text-white/80 rounded-lg text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-purple-400">{caseStudy.metrics.users}</div>
                        <div className="text-white/60">Пользователей</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-400">{caseStudy.metrics.growth}</div>
                        <div className="text-white/60">Рост</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredCases.map((caseStudy) => (
            <div
              key={caseStudy.id}
              onClick={() => setSelectedCase(caseStudy)}
              className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{ background: `linear-gradient(135deg, ${caseStudy.color.split(' ')[1]}, ${caseStudy.color.split(' ')[3]})` }}></div>
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                       style={{ background: `linear-gradient(135deg, ${caseStudy.color.split(' ')[1]}, ${caseStudy.color.split(' ')[3]})` }}>
                    <span className="text-xl sm:text-2xl">{caseStudy.icon}</span>
                  </div>
                  {caseStudy.featured && (
                    <div className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg">Featured</div>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors duration-300">
                  {caseStudy.title}
                </h3>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4">
                  {caseStudy.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {caseStudy.technologies.slice(0, 3).map((tech, index) => (
                    <span key={index} className="px-2 py-1 bg-white/10 text-white/80 rounded-lg text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-purple-400">{caseStudy.metrics.users}</div>
                    <div className="text-white/60">Пользователей</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-400">{caseStudy.metrics.growth}</div>
                    <div className="text-white/60">Рост</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Statistics Section */}
        <div className="mt-16 sm:mt-20">
          <div className="glass-card p-8 sm:p-12 rounded-3xl">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-8 sm:mb-12 text-center">📈 Наши достижения</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center group">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors duration-300 mb-2">500+</div>
                <div className="text-white/70 text-sm sm:text-base">Завершенных проектов</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300 mb-2">98%</div>
                <div className="text-white/70 text-sm sm:text-base">Довольных клиентов</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300 mb-2">50M+</div>
                <div className="text-white/70 text-sm sm:text-base">Пользователей</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-pink-400 group-hover:text-pink-300 transition-colors duration-300 mb-2">24/7</div>
                <div className="text-white/70 text-sm sm:text-base">Поддержка</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Case Study Details */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br rounded-3xl flex items-center justify-center shadow-lg"
                       style={{ background: `linear-gradient(135deg, ${selectedCase.color.split(' ')[1]}, ${selectedCase.color.split(' ')[3]})` }}>
                    <span className="text-3xl">{selectedCase.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{selectedCase.title}</h2>
                    <p className="text-white/70">{selectedCase.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Описание проекта</h3>
                  <p className="text-white/80 leading-relaxed mb-6">{selectedCase.description}</p>
                  
                  <h3 className="text-xl font-bold text-white mb-4">Технологии</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedCase.technologies.map((tech, index) => (
                      <span key={index} className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Метрики</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">{selectedCase.metrics.users}</div>
                      <div className="text-white/70 text-sm">Пользователей</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">{selectedCase.metrics.growth}</div>
                      <div className="text-white/70 text-sm">Рост</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">{selectedCase.metrics.satisfaction}</div>
                      <div className="text-white/70 text-sm">Удовлетворенность</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-bold text-pink-400 mb-1">{selectedCase.metrics.revenue}</div>
                      <div className="text-white/70 text-sm">Доход</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showcase; 