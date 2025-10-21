'use client';

import { useState } from 'react';
import type { AiChatRequest, AiChatResponse } from './aiAPI';
import { chatWithAi } from './aiAPI';

export function useAiChat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string, language = 'en') => {
    const newMessages: { role: 'user' | 'assistant'; content: string }[] = [
      ...messages,
      { role: 'user', content: message },
    ];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const recentMessages = newMessages.slice(-4);

      const payload: AiChatRequest = {
        message,
        messages: JSON.stringify(recentMessages),
        language,
      };
      const res: AiChatResponse = await chatWithAi(payload);
      if (res.code === 200 && res.data?.success) {
        setMessages([...newMessages, { role: 'assistant' as const, content: res.data.reply }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant' as const,
            content: 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.',
          },
        ]);
      }
    } catch (e) {
      setMessages([
        ...newMessages,
        { role: 'assistant' as const, content: 'Xin lỗi, có lỗi kết nối. Vui lòng thử lại.' },
      ]);
      setError('API error');
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, error, sendMessage, setMessages };
}
