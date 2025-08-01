import React, { useState, useEffect } from 'react';

interface TelegramChannel {
  id: number;
  title: string;
  username?: string;
  type: 'channel' | 'group' | 'supergroup';
}

interface UTMParam {
  key: string;
  value: string;
}

interface LinkGeneratorProps {
  channels: TelegramChannel[];
  onClose: () => void;
}

const LinkGenerator: React.FC<LinkGeneratorProps> = ({ channels, onClose }) => {
  const [selectedChannel, setSelectedChannel] = useState<TelegramChannel | null>(null);
  const [linkType, setLinkType] = useState<'post' | 'subscribe'>('subscribe');
  const [postUrl, setPostUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  
  // UTM параметры - пользователь может добавлять сколько угодно
  const [utmParams, setUtmParams] = useState<UTMParam[]>([
    { key: 'utm_source', value: '' },
    { key: 'utm_campaign', value: '' },
    { key: 'utm_medium', value: '' }
  ]);
  
  // A/B тестирование
  const [enableABTest, setEnableABTest] = useState(false);
  const [abTestName, setAbTestName] = useState('');
  const [abGroups, setAbGroups] = useState([
    { name: 'A', percentage: 50 },
    { name: 'B', percentage: 50 }
  ]);
  
  // Время жизни ссылки
  const [enableExpiry, setEnableExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryClicks, setExpiryClicks] = useState('');
  
  // QR код
  const [generateQR, setGenerateQR] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>('');

  const addUTMParam = () => {
    setUtmParams([...utmParams, { key: '', value: '' }]);
  };

  const removeUTMParam = (index: number) => {
    if (utmParams.length > 1) {
      setUtmParams(utmParams.filter((_, i) => i !== index));
    }
  };

  const updateUTMParam = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...utmParams];
    updated[index][field] = value;
    setUtmParams(updated);
  };

  const addABGroup = () => {
    const newGroups = [...abGroups, { name: String.fromCharCode(65 + abGroups.length), percentage: 0 }];
    // Пересчитываем проценты равномерно
    const equalPercentage = Math.floor(100 / newGroups.length);
    newGroups.forEach((group, index) => {
      group.percentage = index === 0 ? 100 - (equalPercentage * (newGroups.length - 1)) : equalPercentage;
    });
    setAbGroups(newGroups);
  };

  const removeABGroup = (index: number) => {
    if (abGroups.length > 2) {
      const newGroups = abGroups.filter((_, i) => i !== index);
      // Пересчитываем проценты
      const totalOthers = newGroups.reduce((sum, group) => sum + group.percentage, 0);
      if (totalOthers !== 100) {
        const diff = 100 - totalOthers;
        newGroups[0].percentage += diff;
      }
      setAbGroups(newGroups);
    }
  };

  const updateABGroup = (index: number, field: 'name' | 'percentage', value: string | number) => {
    const updated = [...abGroups];
    updated[index][field] = value;
    setAbGroups(updated);
  };

  const validateForm = () => {
    if (!selectedChannel) return false;
    if (!linkTitle.trim()) return false;
    if (linkType === 'post' && !postUrl.trim()) return false;
    if (enableABTest && (!abTestName.trim() || abGroups.some(g => !g.name.trim()))) return false;
    
    // Проверяем сумму процентов A/B групп
    if (enableABTest) {
      const totalPercentage = abGroups.reduce((sum, group) => sum + Number(group.percentage), 0);
      if (totalPercentage !== 100) return false;
    }
    
    return true;
  };

  const generateTrackingLink = async () => {
    if (!validateForm()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setLoading(true);
    try {
      // Формируем UTM параметры
      const utmData: Record<string, string> = {};
      utmParams.forEach(param => {
        if (param.key.trim() && param.value.trim()) {
          utmData[param.key] = param.value;
        }
      });

      const requestData = {
        channelId: selectedChannel!.id,
        linkType,
        targetUrl: linkType === 'post' ? postUrl : `https://t.me/${selectedChannel!.username}`,
        title: linkTitle,
        description: linkDescription,
        utmParams: utmData,
        enableABTest,
        abTestName: enableABTest ? abTestName : null,
        abGroups: enableABTest ? abGroups : null,
        enableExpiry,
        expiryDate: enableExpiry && expiryDate ? new Date(expiryDate).toISOString() : null,
        expiryClicks: enableExpiry && expiryClicks ? Number(expiryClicks) : null,
        generateQR
      };

      const response = await fetch('/api/tracking/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedLink(data.trackingUrl);
      } else {
        alert('Ошибка создания ссылки');
      }
    } catch (error) {
      console.error('Error generating tracking link:', error);
      alert('Ошибка создания ссылки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">🔗 Генератор трекинговых ссылок</h2>
              <p className="text-white/60">Создавайте ссылки с UTM метками, QR кодами и A/B тестированием</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {!generatedLink ? (
            <div className="space-y-6">
              {/* Выбор канала */}
              <div>
                <label className="block text-white font-medium mb-3">📢 Выберите канал</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedChannel?.id === channel.id
                          ? 'border-purple-400 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg">
                            {channel.type === 'channel' ? '📢' : '👥'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{channel.title}</h3>
                          {channel.username && (
                            <p className="text-white/60 text-sm">@{channel.username}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Тип ссылки */}
              <div>
                <label className="block text-white font-medium mb-3">🎯 Тип ссылки</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLinkType('subscribe')}
                    className={`p-4 rounded-lg border transition-all ${
                      linkType === 'subscribe'
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📱</div>
                      <h3 className="text-white font-medium">Подписка на канал</h3>
                      <p className="text-white/60 text-sm">Прямая подписка</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setLinkType('post')}
                    className={`p-4 rounded-lg border transition-all ${
                      linkType === 'post'
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📝</div>
                      <h3 className="text-white font-medium">Переход на пост</h3>
                      <p className="text-white/60 text-sm">Ссылка на конкретный пост</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* URL поста (если выбран тип "post") */}
              {linkType === 'post' && (
                <div>
                  <label className="block text-white font-medium mb-2">🔗 Ссылка на пост</label>
                  <input
                    type="url"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://t.me/channel/123"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">📝 Название ссылки *</label>
                  <input
                    type="text"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="Промо кампания январь"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">📄 Описание</label>
                  <input
                    type="text"
                    value={linkDescription}
                    onChange={(e) => setLinkDescription(e.target.value)}
                    placeholder="Описание кампании"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* UTM параметры */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white font-medium">🏷️ UTM метки</label>
                  <button
                    onClick={addUTMParam}
                    className="bg-green-500/20 text-green-300 px-3 py-1 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                  >
                    + Добавить метку
                  </button>
                </div>
                <div className="space-y-3">
                  {utmParams.map((param, index) => (
                    <div key={index} className="flex space-x-3">
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => updateUTMParam(index, 'key', e.target.value)}
                        placeholder="utm_source"
                        className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => updateUTMParam(index, 'value', e.target.value)}
                        placeholder="instagram"
                        className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                      />
                      {utmParams.length > 1 && (
                        <button
                          onClick={() => removeUTMParam(index)}
                          className="bg-red-500/20 text-red-300 px-3 py-3 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* A/B тестирование */}
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    id="enable-ab"
                    checked={enableABTest}
                    onChange={(e) => setEnableABTest(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="enable-ab" className="text-white font-medium">🧪 A/B тестирование</label>
                </div>
                
                {enableABTest && (
                  <div className="space-y-4 pl-7">
                    <input
                      type="text"
                      value={abTestName}
                      onChange={(e) => setAbTestName(e.target.value)}
                      placeholder="Название эксперимента"
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                    />
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-sm">Группы эксперимента</span>
                        <button
                          onClick={addABGroup}
                          className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs hover:bg-blue-500/30 transition-colors"
                        >
                          + Группа
                        </button>
                      </div>
                      <div className="space-y-2">
                        {abGroups.map((group, index) => (
                          <div key={index} className="flex space-x-3 items-center">
                            <input
                              type="text"
                              value={group.name}
                              onChange={(e) => updateABGroup(index, 'name', e.target.value)}
                              placeholder="A"
                              className="w-16 p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:border-purple-400 focus:outline-none text-center"
                            />
                            <input
                              type="number"
                              value={group.percentage}
                              onChange={(e) => updateABGroup(index, 'percentage', Number(e.target.value))}
                              min="0"
                              max="100"
                              className="w-20 p-2 bg-white/10 border border-white/20 rounded text-white focus:border-purple-400 focus:outline-none text-center"
                            />
                            <span className="text-white/60">%</span>
                            {abGroups.length > 2 && (
                              <button
                                onClick={() => removeABGroup(index)}
                                className="bg-red-500/20 text-red-300 px-2 py-2 rounded text-xs hover:bg-red-500/30 transition-colors"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        Сумма: {abGroups.reduce((sum, group) => sum + Number(group.percentage), 0)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Время жизни ссылки */}
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    id="enable-expiry"
                    checked={enableExpiry}
                    onChange={(e) => setEnableExpiry(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="enable-expiry" className="text-white font-medium">⏰ Ограничить время жизни</label>
                </div>
                
                {enableExpiry && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                    <div>
                      <label className="block text-white/80 text-sm mb-1">Дата истечения</label>
                      <input
                        type="datetime-local"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-1">Макс. количество переходов</label>
                      <input
                        type="number"
                        value={expiryClicks}
                        onChange={(e) => setExpiryClicks(e.target.value)}
                        placeholder="1000"
                        min="1"
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* QR код */}
              <div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="generate-qr"
                    checked={generateQR}
                    onChange={(e) => setGenerateQR(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="generate-qr" className="text-white font-medium">📱 Сгенерировать QR код</label>
                </div>
              </div>

              {/* Кнопка создания */}
              <div className="pt-6 border-t border-white/20">
                <button
                  onClick={generateTrackingLink}
                  disabled={loading || !validateForm()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? '🔄 Создание ссылки...' : '🚀 Создать трекинговую ссылку'}
                </button>
              </div>
            </div>
          ) : (
            /* Результат - созданная ссылка */
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-white mb-4">Ссылка создана!</h3>
              <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-6">
                <div className="text-white/60 text-sm mb-2">Ваша трекинговая ссылка:</div>
                <div className="text-white font-mono break-all">{generatedLink}</div>
              </div>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedLink)}
                  className="bg-blue-500/20 text-blue-300 px-6 py-3 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  📋 Копировать
                </button>
                <button
                  onClick={() => {
                    setGeneratedLink('');
                    setLinkTitle('');
                    setLinkDescription('');
                    setPostUrl('');
                  }}
                  className="bg-green-500/20 text-green-300 px-6 py-3 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  ➕ Создать еще
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-500/20 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-500/30 transition-colors"
                >
                  ✅ Готово
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkGenerator;