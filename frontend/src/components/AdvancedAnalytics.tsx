import React, { useState, useEffect } from 'react';

interface DailyStats {
  date: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
}

interface SourceStats {
  source: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
}

interface AdvancedAnalyticsProps {
  channelId: number;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ channelId }) => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [sourceStats, setSourceStats] = useState<SourceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [channelId, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Получаем ежедневную статистику
      const dailyResponse = await fetch(`/api/telegram/daily-stats/${channelId}?days=${period}`);
      const dailyData = await dailyResponse.json();

      if (dailyData.success) {
        setDailyStats(dailyData.dailyStats);
      }

      // Получаем статистику по источникам
      const channelResponse = await fetch(`/api/telegram/channel-stats/${channelId}`);
      const channelData = await channelResponse.json();

      if (channelData.success) {
        setSourceStats(channelData.stats.sources);
      }
    } catch (err) {
      console.error('Ошибка загрузки аналитики:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getMaxValue = (data: any[], key: string) => {
    return Math.max(...data.map(item => item[key]), 0);
  };

  const renderBarChart = (data: any[], key: string, color: string) => {
    const maxValue = getMaxValue(data, key);
    
    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600">
              {key === 'date' ? formatDate(item[key]) : item[key]}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${color}`}
                style={{
                  width: `${maxValue > 0 ? (item[key] / maxValue) * 100 : 0}%`
                }}
              />
            </div>
            <div className="w-16 text-sm font-medium text-gray-900">
              {item[key]}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLineChart = (data: DailyStats[]) => {
    if (data.length === 0) return null;

    const maxClicks = getMaxValue(data, 'clicks');
    const maxConversions = getMaxValue(data, 'conversions');

    return (
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
          {data.map((item, index) => {
            const clickHeight = maxClicks > 0 ? (item.clicks / maxClicks) * 100 : 0;
            const conversionHeight = maxConversions > 0 ? (item.conversions / maxConversions) * 100 : 0;
            
            return (
              <div key={index} className="flex flex-col items-center space-y-1">
                <div className="flex flex-col items-center space-y-1">
                  <div
                    className="w-3 bg-blue-500 rounded-t"
                    style={{ height: `${clickHeight}%` }}
                  />
                  <div
                    className="w-3 bg-green-500 rounded-t"
                    style={{ height: `${conversionHeight}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 transform rotate-45 origin-left">
                  {formatDate(item.date)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute top-2 left-2 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Клики</span>
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Конверсии</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPieChart = (data: SourceStats[]) => {
    const total = data.reduce((sum, item) => sum + item.clicks, 0);
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.clicks / total) * 100 : 0;
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
          
          return (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{item.source}</div>
                <div className="text-xs text-gray-500">
                  {item.clicks} кликов ({percentage.toFixed(1)}%)
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">
                  {item.conversions}
                </div>
                <div className="text-xs text-gray-500">
                  {item.conversionRate}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-2">Ошибка загрузки аналитики</div>
        <div className="text-sm text-gray-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Заголовок и фильтры */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Расширенная аналитика</h3>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Период:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value={7}>7 дней</option>
            <option value={30}>30 дней</option>
            <option value={90}>90 дней</option>
          </select>
        </div>
      </div>

      {/* График кликов и конверсий */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Динамика кликов и конверсий</h4>
        {renderLineChart(dailyStats)}
      </div>

      {/* Статистика по источникам */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Источники трафика</h4>
        {sourceStats.length > 0 ? (
          renderPieChart(sourceStats)
        ) : (
          <div className="text-center py-8 text-gray-500">
            Нет данных по источникам трафика
          </div>
        )}
      </div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Клики по дням */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Клики по дням</h4>
          {dailyStats.length > 0 ? (
            renderBarChart(dailyStats, 'clicks', 'bg-blue-500')
          ) : (
            <div className="text-center py-8 text-gray-500">
              Нет данных о кликах
            </div>
          )}
        </div>

        {/* Конверсии по дням */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Конверсии по дням</h4>
          {dailyStats.length > 0 ? (
            renderBarChart(dailyStats, 'conversions', 'bg-green-500')
          ) : (
            <div className="text-center py-8 text-gray-500">
              Нет данных о конверсиях
            </div>
          )}
        </div>
      </div>

      {/* Сводная статистика */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Сводная статистика</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {dailyStats.reduce((sum, item) => sum + item.clicks, 0)}
            </div>
            <div className="text-sm text-gray-600">Всего кликов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {dailyStats.reduce((sum, item) => sum + item.conversions, 0)}
            </div>
            <div className="text-sm text-gray-600">Всего конверсий</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(() => {
                const totalClicks = dailyStats.reduce((sum, item) => sum + item.clicks, 0);
                const totalConversions = dailyStats.reduce((sum, item) => sum + item.conversions, 0);
                return totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0';
              })()}%
            </div>
            <div className="text-sm text-gray-600">Общая конверсия</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {sourceStats.length}
            </div>
            <div className="text-sm text-gray-600">Источников трафика</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;