import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, TrendingUp, Database, Maximize2, Minimize2 } from 'lucide-react';
import chatbotLottie from '@/assets/lottie/chatbot_model.json';
import { useAiChat } from '@/features/ai/useAiChat';
import Lottie from 'lottie-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MarkdownMessage } from '@/components/ai/MarkdownMessage';
import { useTranslation } from 'react-i18next';

const ChatBot: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, isLoading, sendMessage, selectDataset, selectChartType } = useAiChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Move conditional return after ALL hooks (including useEffect) are initialized
  if (pathname.startsWith('/chart-editor')) return null;

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input, 'vi');
    setInput('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleDatasetSelect = (datasetId: string, datasetName: string) => {
    console.log('[Chat] User selected dataset:', { datasetId, datasetName });
    selectDataset(
      datasetId,
      `Tôi đã chọn dataset "${datasetName}". Tạo biểu đồ phù hợp với dữ liệu này.`
    );
  };

  const handleNavigateToChart = (chartUrl: string) => {
    navigate(chartUrl);
    setIsOpen(false);
    console.log(chartUrl);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-30 h-30 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center overflow-hidden group"
          aria-label={t('chat_bot_open')}
        >
          <Lottie animationData={chatbotLottie} loop autoplay style={{ width: 200, height: 200 }} />
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />
        </button>
      )}

      {isOpen && (
        <>
          {/* Backdrop for expanded mode */}
          {isExpanded && (
            <div
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
            />
          )}

          <div
            className={`fixed bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-slate-700 overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'inset-4 md:inset-8 lg:inset-16 z-50'
                : 'bottom-6 right-6 w-full sm:w-96 h-[500px] sm:h-[600px] max-w-[calc(100vw-48px)] z-50'
            }`}
          >
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between shadow-lg">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{t('chat_bot_title')}</h3>
                <p className="text-blue-100 text-xs font-medium">{t('chat_bot_subtitle')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors duration-200 flex-shrink-0"
                  aria-label={isExpanded ? t('chat_bot_minimize') : t('chat_bot_maximize')}
                  title={isExpanded ? t('chat_bot_minimize') : t('chat_bot_maximize')}
                >
                  {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors duration-200 flex-shrink-0"
                  aria-label={t('chat_bot_close')}
                  title={t('chat_bot_close')}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="space-y-3">
                    <div className="text-4xl">📊</div>
                    <p className="text-slate-300 text-sm font-semibold">
                      {t('chat_welcome_greeting')}
                    </p>
                    <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                      {t('chat_welcome_message')}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'user' ? (
                        <div className="max-w-xs px-4 py-3 rounded-lg text-sm leading-relaxed break-words bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none shadow-md">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="max-w-[85%] space-y-3">
                          <div className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 rounded-bl-none">
                            <MarkdownMessage content={msg.content} />
                          </div>

                          {/* Dataset Selection UI */}
                          {msg.needsDatasetSelection && msg.datasets && msg.datasets.length > 0 && (
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
                              <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
                                <Database size={16} />
                                <span>{t('chat_dataset_select_title')}</span>
                              </div>
                              <div className="space-y-2">
                                {msg.datasets.map(dataset => (
                                  <button
                                    key={dataset.id}
                                    onClick={() => handleDatasetSelect(dataset.id, dataset.name)}
                                    className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors duration-200"
                                  >
                                    <div className="text-white text-sm font-medium">
                                      {dataset.name}
                                    </div>
                                    {dataset.description && (
                                      <div className="text-slate-400 text-xs mt-1">
                                        {dataset.description}
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Chart Type Selection UI */}
                          {msg.needsChartTypeSelection && (
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
                              <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
                                <TrendingUp size={16} />
                                <span>Chọn loại biểu đồ</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => selectChartType('auto', msg.originalMessage || '')}
                                  className="col-span-2 text-left px-3 py-2 bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-lg transition-all duration-200 flex items-center gap-2"
                                >
                                  <span className="text-white text-sm font-medium">
                                    AI Tự động chọn (Best match)
                                  </span>
                                </button>

                                <button
                                  onClick={() => selectChartType('line', msg.originalMessage || '')}
                                  className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <span className="text-white text-xs">Line Chart</span>
                                </button>
                                <button
                                  onClick={() => selectChartType('bar', msg.originalMessage || '')}
                                  className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <span className="text-white text-xs">Bar Chart</span>
                                </button>
                                <button
                                  onClick={() => selectChartType('pie', msg.originalMessage || '')}
                                  className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <span className="text-white text-xs">Pie Chart</span>
                                </button>
                                <button
                                  onClick={() =>
                                    selectChartType('donut', msg.originalMessage || '')
                                  }
                                  className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <span className="text-white text-xs">Donut Chart</span>
                                </button>
                                <button
                                  onClick={() =>
                                    selectChartType('heatmap', msg.originalMessage || '')
                                  }
                                  className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <span className="text-white text-xs">Heatmap</span>
                                </button>
                                <button
                                  onClick={() =>
                                    selectChartType('scatter', msg.originalMessage || '')
                                  }
                                  className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <span className="text-white text-xs">Scatter</span>
                                </button>
                                <button
                                  onClick={() =>
                                    selectChartType('histogram', msg.originalMessage || '')
                                  }
                                  className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <span className="text-white text-xs">Histogram</span>
                                </button>
                                <button
                                  onClick={() =>
                                    selectChartType('cycleplot', msg.originalMessage || '')
                                  }
                                  className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <span className="text-white text-xs">Cycle Plot</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Chart Preview Card */}
                          {msg.chartData && (
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/30 rounded-lg p-4 space-y-3 shadow-lg">
                              <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
                                <TrendingUp size={16} />
                                <span>{t('chat_chart_created_title')}</span>
                              </div>
                              <div>
                                <h4 className="text-white font-semibold text-sm">
                                  {msg.chartData.suggestedName}
                                </h4>
                                <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                                  {msg.chartData.explanation}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs text-blue-400 font-medium">
                                    {t('chat_chart_type')}: {msg.chartData.type}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleNavigateToChart(msg.chartData!.chartUrl)}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                              >
                                <TrendingUp size={16} />
                                {t('chat_continue_to_editor')}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-lg rounded-bl-none border border-slate-700 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-blue-400 flex-shrink-0" />
                        <span className="text-xs text-slate-400">{t('chat_processing')}</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="bg-slate-900 border-t border-slate-700 p-4 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={t('chat_input_placeholder')}
                disabled={isLoading}
                className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white p-2 rounded-lg transition-all duration-200 disabled:opacity-50 flex-shrink-0"
                aria-label="Send message"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChatBot;
