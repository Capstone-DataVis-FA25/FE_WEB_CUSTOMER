import { useState } from 'react';
import type { AiChatRequest, AiChatResponse } from './aiAPI';
import { chatWithAi } from './aiAPI';
import type { DatasetInfo, ChartGenerationResponse } from './aiTypes';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  datasets?: DatasetInfo[];
  needsDatasetSelection?: boolean;
  needsChartTypeSelection?: boolean;
  originalMessage?: string;
  chartData?: ChartGenerationResponse;
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

  const sendMessage = async (
    message: string,
    language = 'en',
    datasetId?: string,
    chartType?: string
  ) => {
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const recentMessages = newMessages.slice(-4);

      const payload: AiChatRequest = {
        message,
        messages: JSON.stringify(recentMessages),
        language,
        datasetId: datasetId || selectedDatasetId || undefined,
        chartType,
      };

      const res: AiChatResponse = await chatWithAi(payload);

      // Debug: Log full response structure
      console.log('========== AI CHAT RESPONSE ==========');
      console.log('Full Response:', res);

      // Handle response structure - res is already res.data from axios
      const actualData = res.data;

      if (actualData) {
        // ... logs ...
      }
      console.log('======================================');

      if (res.code === 200 && actualData?.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant' as const,
          content: actualData.reply,
          needsDatasetSelection: actualData.needsDatasetSelection,
          needsChartTypeSelection: actualData.needsChartTypeSelection,
          originalMessage: actualData.originalMessage,
          datasets: actualData.datasets,
          chartData: actualData.chartData,
        };

        setMessages([...newMessages, assistantMessage]);

        // If dataset was provided in this request, save it
        if (datasetId) {
          setSelectedDatasetId(datasetId);
        }
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

  const selectDataset = (datasetId: string, followUpMessage?: string) => {
    setSelectedDatasetId(datasetId);
    if (followUpMessage) {
      sendMessage(followUpMessage, 'vi', datasetId);
    }
  };

  const selectChartType = (chartType: string, prompt: string) => {
    // Re-send original prompt with selected chart type
    // If chartType is 'auto', backend handles it.
    // If 'line', 'bar' etc, backend handles it.
    sendMessage(prompt, 'vi', selectedDatasetId || undefined, chartType);
  };

  const clearDatasetSelection = () => {
    setSelectedDatasetId(null);
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedDatasetId(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    setMessages,
    selectDataset,
    selectChartType, // Export this
    clearDatasetSelection,
    clearChat,
    selectedDatasetId,
  };
}
