import React, { useState, useEffect } from 'react';

interface TrafficSource {
  name: string;
  count: number;
  percentage: number;
  color: string;
  conversionRate: number;
  growth: number;
}

interface SourceAnalyticsProps {
  channelId: string;
}

const SourceAnalytics: React.FC<SourceAnalyticsProps> = ({ channelId }) => {
  const [sources, setSources] = useState<TrafficSource[]>([
    { name: 'Органический трафик', count: 8920, percentage: 58, color: '#10B981', conversionRate: 12.5, growth: 15 },
    { name: 'Реклама ВКонтакте', count: 3240, percentage: 21, color: '#3B82F6', conversionRate: 8.2, growth: 8 },
    { name: 'Instagram Ads', count: 2160, percentage: 14, color: '#F59E0B', conversionRate: 6.8, growth: 12 },
    { name: 'Google Ads', count: 1100, percentage: 7, color: '#EF4444', conversionRate: 4.5, growth: -3 }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [sortBy, setSortBy] = useState<'count' | 'percentage' | 'conversionRate' | 'growth'>('count');

  const sortedSources = [...sources].sort((a, b) => {
    switch (sortBy) {
      case 'count':
        return b.count - a.count;
      case 'percentage':
        return b.percentage - a.percentage;
      case 'conversionRate':
        return b.conversionRate - a.conversionRate;
      case 'growth':
        return b.growth - a.growth;
      default:
        return 0;
    }
  });

  const totalSubscribers = sources.reduce((sum, source) => sum + source.count, 0);
  const averageConversionRate = sources.reduce((sum, source) => sum + source.conversionRate, 0) / sources.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Аналитика источников трафика</h3>
        <div className="flex items-center space-x-4">
          {/* Период */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
            <option value="90d">90 дней</option>
          </select>
          
          {/* Сортировка */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="count">По количеству</option>
            <option value="percentage">По проценту</option>
            <option value="conversionRate">По конверсии</option>
            <option value="growth">По росту</option>
          </select>
        </div>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{totalSubscribers.toLocaleString()}</h3>
          <p className="text-white/60">Всего подписчиков</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-green-400 mb-1">{sources.length}</h3>
          <p className="text-white/60">Активных источников</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-purple-400 mb-1">{averageConversionRate.toFixed(1)}%</h3>
          <p className="text-white/60">Средняя конверсия</p>
        </div>
      </div>

      {/* График источников */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h4 className="text-lg font-semibold text-white mb-6">Распределение по источникам</h4>
        
        <div className="space-y-4">
          {sortedSources.map((source, index) => (
            <div key={source.name} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: source.color }}
                  ></div>
                  <span className="text-white font-medium">{source.name}</span>
                  <span className="text-white/60 text-sm">#{index + 1}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{source.count.toLocaleString()}</div>
                  <div className="text-white/60 text-sm">{source.percentage}%</div>
                </div>
              </div>
              
              {/* Прогресс бар */}
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${source.percentage}%`,
                    backgroundColor: source.color
                  }}
                ></div>
              </div>
              
              {/* Дополнительная статистика */}
              <div className="flex items-center justify-between mt-2 text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-white/60">
                    Конверсия: <span className="text-green-400 font-medium">{source.conversionRate}%</span>
                  </span>
                  <span className="text-white/60">
                    Рост: <span className={`font-medium ${source.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {source.growth >= 0 ? '+' : ''}{source.growth}%
                    </span>
                  </span>
                </div>
                <div className="text-white/60">
                  {((source.count / totalSubscribers) * 100).toFixed(1)}% от общего
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Детальная аналитика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Лучшие источники */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">🏆 Лучшие источники</h4>
          <div className="space-y-3">
            {sortedSources.slice(0, 3).map((source, index) => (
              <div key={source.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{source.name}</div>
                    <div className="text-white/60 text-sm">{source.count.toLocaleString()} подписчиков</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">{source.conversionRate}%</div>
                  <div className="text-white/60 text-sm">конверсия</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Рост источников */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">📈 Динамика роста</h4>
          <div className="space-y-3">
            {sortedSources.map((source) => (
              <div key={source.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: source.color }}
                  ></div>
                  <span className="text-white font-medium">{source.name}</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${source.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {source.growth >= 0 ? '+' : ''}{source.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Рекомендации */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30">
        <h4 className="text-lg font-semibold text-white mb-4">💡 Рекомендации</h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="text-green-400 text-lg">✅</span>
            <div>
              <div className="text-white font-medium">Увеличьте бюджет на лучшие источники</div>
              <div className="text-white/60 text-sm">
                {sortedSources[0]?.name} показывает лучшую конверсию ({sortedSources[0]?.conversionRate}%)
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <div>
              <div className="text-white font-medium">Оптимизируйте проблемные источники</div>
              <div className="text-white/60 text-sm">
                {sortedSources[sortedSources.length - 1]?.name} требует улучшения (конверсия {sortedSources[sortedSources.length - 1]?.conversionRate}%)
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 text-lg">📊</span>
            <div>
              <div className="text-white font-medium">Создайте новые трекинговые ссылки</div>
              <div className="text-white/60 text-sm">
                Для более детального анализа эффективности рекламных кампаний
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceAnalytics;