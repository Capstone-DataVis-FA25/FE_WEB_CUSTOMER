'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
import chatbotLottie from '@/assets/lottie/chatbot_model.json';
import { useAiChat } from '@/features/ai/useAiChat';
import Lottie from 'lottie-react';
import { useLocation } from 'react-router-dom';

const ChatBot: React.FC = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/chart-editor')) return null;
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useAiChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input, 'en');
    setInput('');
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-30 h-30 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center overflow-hidden group"
          aria-label="Open chat"
        >
          <Lottie animationData={chatbotLottie} loop autoplay style={{ width: 200, height: 200 }} />
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full sm:w-96 h-[500px] sm:h-[600px] max-w-[calc(100vw-48px)] bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-slate-700 z-50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">DataVis AI</h3>
              <p className="text-blue-100 text-xs font-medium">Phân tích dữ liệu thông minh</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors duration-200 flex-shrink-0"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-3">
                  <div className="text-4xl">📊</div>
                  <p className="text-slate-300 text-sm font-semibold">Xin chào!</p>
                  <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                    Tôi là trợ lý AI chuyên về phân tích dữ liệu. Hãy hỏi tôi bất cứ điều gì về
                    DataVis hoặc phân tích dữ liệu.
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
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg text-sm leading-relaxed break-words ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none shadow-md'
                          : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-lg rounded-bl-none border border-slate-700 flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-blue-400 flex-shrink-0" />
                      <span className="text-xs text-slate-400">Đang xử lý...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="bg-slate-900 border-t border-slate-700 p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Nhập câu hỏi..."
              disabled={isLoading}
              className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
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
      )}
    </>
  );
};

export default ChatBot;
