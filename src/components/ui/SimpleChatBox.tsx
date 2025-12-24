import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Loader2,
  TrendingUp,
  Database,
  Maximize2,
  Minimize2,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, isLoading, sendMessage, selectDataset, selectChartType } = useAiChat();

  useEffect(() => {
    const handleCloseChatbot = () => {
      if (isOpen) {
        setIsOpen(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener('close-chatbot', handleCloseChatbot);
    return () => {
      window.removeEventListener('close-chatbot', handleCloseChatbot);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('chatbot-open', 'true');
      window.dispatchEvent(new CustomEvent('close-progress-bar'));
    } else {
      localStorage.removeItem('chatbot-open');
    }

    window.dispatchEvent(
      new CustomEvent('chatbot-state-change', {
        detail: { isOpen, isExpanded },
      })
    );
  }, [isOpen, isExpanded]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isBottom);
  };

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
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.button
            key="open-button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-30 h-30 rounded-full shadow-lg flex items-center justify-center overflow-hidden group"
            aria-label={t('chat_bot_open')}
          >
            <Lottie
              animationData={chatbotLottie}
              loop
              autoplay
              style={{ width: 200, height: 200 }}
            />
            <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={() => setIsExpanded(false)}
              />
            )}

            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-slate-700 overflow-hidden z-50 ${
                isExpanded
                  ? 'inset-4 md:inset-8 lg:inset-16'
                  : 'bottom-6 right-6 w-full sm:w-96 h-[500px] sm:h-[600px] max-w-[calc(100vw-48px)]'
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

              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="relative flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                      <Lottie
                        animationData={chatbotLottie}
                        loop
                        autoplay
                        style={{ width: 80, height: 80 }}
                      />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">
                      {t('chat_welcome_title', 'Data Analysis AI')}
                    </h3>
                    <p className="text-slate-400 text-xs mb-8 max-w-[240px] leading-relaxed">
                      {t(
                        'chat_welcome_subtitle',
                        'I can help you create datasets, visualize data, and answer questions.'
                      )}
                    </p>

                    <div className="grid grid-cols-1 w-full gap-2.5">
                      {[
                        {
                          icon: <Database size={14} className="text-green-400" />,
                          label: t('chat_suggest_create_data', 'Create sample dataset'),
                          msg: 'Create a sample dataset of monthly sales for 2024 with 3 regions.',
                        },
                        {
                          icon: <TrendingUp size={14} className="text-blue-400" />,
                          label: t('chat_suggest_create_chart', 'Create a chart'),
                          msg: 'Help me create a bar chart to visualize sales data.',
                        },
                        {
                          icon: <Send size={14} className="text-purple-400" />,
                          label: t('chat_suggest_how_to', 'How to use features?'),
                          msg: 'How do I import my own Excel file?',
                        },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(item.msg, 'vi')}
                          className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-all duration-200 group text-left"
                        >
                          <div className="p-2 bg-slate-900 rounded-lg group-hover:scale-110 transition-transform duration-200 item-icon">
                            {item.icon}
                          </div>
                          <span className="text-slate-200 text-sm font-medium group-hover:text-blue-400 transition-colors">
                            {item.label}
                          </span>
                        </button>
                      ))}
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
                            {msg.content && (
                              <div className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 rounded-bl-none">
                                <MarkdownMessage content={msg.content} />
                              </div>
                            )}

                            {/* Dataset Selection UI */}
                            {msg.needsDatasetSelection &&
                              msg.datasets &&
                              msg.datasets.length > 0 && (
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
                                  <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
                                    <Database size={16} />
                                    <span>{t('chat_dataset_select_title')}</span>
                                  </div>
                                  <div className="space-y-2">
                                    {msg.datasets.map(dataset => (
                                      <button
                                        key={dataset.id}
                                        onClick={() =>
                                          handleDatasetSelect(dataset.id, dataset.name)
                                        }
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
                                  <span>{t('home_chartTypes_desc')}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() =>
                                      selectChartType('auto', msg.originalMessage || '')
                                    }
                                    className="col-span-2 text-left px-3 py-2 bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-lg transition-all duration-200 flex items-center gap-2"
                                  >
                                    <span className="text-white text-sm font-medium">
                                      {t('home_chartTypes_auto')}
                                    </span>
                                  </button>

                                  <button
                                    onClick={() =>
                                      selectChartType('line', msg.originalMessage || '')
                                    }
                                    className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
                                  >
                                    <span className="text-white text-xs">Line Chart</span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      selectChartType('bar', msg.originalMessage || '')
                                    }
                                    className="text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
                                  >
                                    <span className="text-white text-xs">Bar Chart</span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      selectChartType('pie', msg.originalMessage || '')
                                    }
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
                            {/* Created Dataset Preview Card */}
                            {msg.createdDataset && (
                              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-green-500/30 rounded-lg p-4 space-y-3 shadow-lg">
                                <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                                  <Database size={16} />
                                  <span>{t('chat_dataset_created_title', 'Dataset Created')}</span>
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold text-sm">
                                    {msg.createdDataset.name}
                                  </h4>
                                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                                    {msg.createdDataset.description}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    const targetUrl =
                                      (msg.createdDataset as any).url || '/workspace/datasets';
                                    navigate(targetUrl);
                                    setIsOpen(false);
                                  }}
                                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                                >
                                  <Database size={16} />
                                  {t('chat_continue_to_datasets', 'Continue to Datasets')}
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
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}

                {/* Scroll to Bottom Button */}
                {showScrollButton && (
                  <button
                    onClick={scrollToBottom}
                    className="sticky bottom-0 left-1/2 transform -translate-x-1/2 bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full shadow-lg border border-slate-600 transition-all duration-200 z-10"
                    aria-label="Scroll to bottom"
                  >
                    <ChevronDown size={20} />
                  </button>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
