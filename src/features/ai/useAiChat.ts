import { useState } from 'react';
import type { AiChatRequest, AiChatResponse } from './aiAPI';
import { chatWithAi } from './aiAPI';
import type { DatasetInfo, ChartGenerationResponse } from './aiTypes';
import useLanguage from '@/hooks/useLanguage';
import { t } from 'i18next';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  datasets?: DatasetInfo[];
  needsDatasetSelection?: boolean;
  needsChartTypeSelection?: boolean;
  originalMessage?: string;
  chartData?: ChartGenerationResponse;
  createdDataset?: DatasetInfo;
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const { currentLanguage } = useLanguage();
  const sendMessage = async (
    message: string,
    language?: string,
    datasetId?: string,
    chartType?: string
  ) => {
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: message }];
    setLastUserPrompt(message);
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const recentMessages = newMessages.slice(-4);

      const payload: AiChatRequest = {
        message,
        messages: JSON.stringify(recentMessages),
        language: language || currentLanguage,
        datasetId: datasetId || selectedDatasetId || undefined,
        chartType,
      };

      // Only send language if explicitly provided; default to model auto-detect based on user text
      if (language) {
        payload.language = language;
      }

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
        console.log('AI Response Data:', actualData);

        const assistantMessage: ChatMessage = {
          role: 'assistant' as const,
          content: actualData.reply,
          needsDatasetSelection: actualData.needsDatasetSelection,
          needsChartTypeSelection: actualData.needsChartTypeSelection,
          originalMessage: actualData.originalMessage,
          datasets: actualData.datasets,
          chartData: actualData.chartData,
          createdDataset: actualData.createdDataset || actualData.data, // Map createdDataset or generic data
        };

        setMessages([...newMessages, assistantMessage]);

        if (datasetId) {
          setSelectedDatasetId(datasetId);
        }
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant' as const,
            content: actualData?.reply || t('chatbox.errorExecuteResponse'),
          },
        ]);
      }
    } catch (e) {
      setMessages([
        ...newMessages,
        { role: 'assistant' as const, content: t('chatbox.errorTryAgain') },
      ]);
      setError('API error');
    } finally {
      setIsLoading(false);
    }
  };

  const selectDataset = (datasetId: string, followUpMessage?: string) => {
    setSelectedDatasetId(datasetId);

    const hintMessage: ChatMessage = {
      role: 'assistant',
      content: followUpMessage || t('chat_prompt_choose_chart_type'),
      needsChartTypeSelection: true,
      originalMessage: lastUserPrompt,
    };

    setMessages(prev => [...prev, hintMessage]);
  };

  const selectChartType = (chartType: string, prompt: string) => {
    const effectivePrompt = prompt || lastUserPrompt;

    const chartTypeLabels: Record<string, string> = {
      auto: t('home_chartTypes_auto'),
      line: 'Line Chart',
      bar: 'Bar Chart',
      pie: 'Pie Chart',
      area: 'Area Chart',
      donut: 'Donut Chart',
      heatmap: 'Heatmap',
      scatter: 'Scatter',
      histogram: 'Histogram',
      cycleplot: 'Cycle Plot',
    };

    const selectedTypeLabel = chartTypeLabels[chartType] || chartType;
    const chartTypeLine = t('chat_selected_chart_type', {
      type: selectedTypeLabel,
      defaultValue: `Chart Type: ${selectedTypeLabel}`,
    });

    const composedPrompt = `${effectivePrompt}\n${chartTypeLine}`.trim();

    // Let backend auto-detect language from user text; avoid forcing via param
    sendMessage(composedPrompt, undefined, selectedDatasetId || undefined, chartType);
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
