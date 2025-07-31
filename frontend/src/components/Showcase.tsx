import React, { useState, useEffect } from 'react';
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* REVOLUTIONARY 3D ANIMATED BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating 3D Orbs */}
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 8s ease infinite, float 6s ease-in-out infinite',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            top: '10%',
            left: '10%',
            filter: 'blur(40px)',
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full opacity-15"
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 12s ease infinite reverse, float 8s ease-in-out infinite reverse',
            transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)`,
            top: '60%',
            right: '15%',
            filter: 'blur(30px)',
          }}
        />
        <div 
          className="absolute w-72 h-72 rounded-full opacity-25"
          style={{
            background: 'linear-gradient(225deg, #c471ed, #12c2e9, #f64f59, #c471ed)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 10s ease infinite, float 7s ease-in-out infinite',
            transform: `translate(${mousePosition.x * 0.025}px, ${mousePosition.y * 0.025}px)`,
            bottom: '20%',
            left: '20%',
            filter: 'blur(35px)',
          }}
        />
        
        {/* Particle Grid */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <BackButton onClick={() => (window as any).handleGoBack?.()} />
      <FullscreenButton />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* REVOLUTIONARY HEADER */}
        <div className="text-center mb-16 sm:mb-20">
          {/* 3D Floating Icon */}
          <div 
            className="inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full mb-8 relative"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
              backgroundSize: '400% 400%',
              animation: 'gradientShift 6s ease infinite',
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4), inset 0 0 60px rgba(255, 255, 255, 0.1)',
              transform: `rotateY(${mousePosition.x * 0.01}deg) rotateX(${mousePosition.y * 0.01}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <span className="text-5xl sm:text-6xl lg:text-7xl transform transition-transform duration-300 hover:scale-110">
              💎
            </span>
            {/* Floating particles around icon */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-60"
                style={{
                  animation: `orbit 4s linear infinite`,
                  animationDelay: `${i * 0.5}s`,
                  transformOrigin: '100px',
                }}
              />
            ))}
          </div>
          
          {/* Animated Title */}
          <h1 
            className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 relative"
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24, #ff6b6b)',
              backgroundSize: '400% 400%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientShift 4s ease infinite, textGlow 2s ease-in-out infinite alternate',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.5)',
            }}
          >
            ВИТРИНА КЕЙСОВ
          </h1>
          
          {/* Subtitle with typewriter effect */}
          <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 max-w-4xl mx-auto leading-relaxed font-medium">
            <span className="inline-block border-r-2 border-white animate-pulse">
              Реальные проекты. Невероятные результаты. Безграничные возможности.
            </span>
          </p>
          
          {/* Animated metrics bar */}
          <div className="flex justify-center items-center gap-8 mt-8 flex-wrap">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">500+</div>
              <div className="text-white/70 text-sm">Проектов</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">50M+</div>
              <div className="text-white/70 text-sm">Пользователей</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">98%</div>
              <div className="text-white/70 text-sm">Успех</div>
            </div>
          </div>
        </div>

        {/* REVOLUTIONARY CATEGORY FILTER */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 sm:mb-16">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setSelectedCategory(category.id);
                  setIsAnimating(false);
                }, 300);
              }}
              className={`relative overflow-hidden px-6 py-4 sm:px-8 sm:py-4 rounded-2xl font-bold transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 card-3d group ${
                selectedCategory === category.id
                  ? 'text-white shadow-2xl'
                  : 'glass-morphism text-white/80 hover:text-white border border-white/20'
              }`}
              style={selectedCategory === category.id ? {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 3s ease infinite',
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
              } : {}}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:animate-shimmer" />
              
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-xl">{category.icon}</span>
                <span className="text-sm sm:text-base">{category.name}</span>
              </span>
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