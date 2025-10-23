// API for DataVis AI chat
import { axiosPrivate } from '@/services/axios';

export interface AiChatRequest {
  message: string;
  messages: string; // JSON.stringify([...])
  language: string;
}

export interface AiChatResponse {
  code: number;
  message: string;
  data?: {
    reply: string;
    processingTime: string;
    messageCount: number;
    language: string;
    success: boolean;
  };
}

export async function chatWithAi(payload: AiChatRequest): Promise<AiChatResponse> {
  const res = await axiosPrivate.post<AiChatResponse>('/ai/chat-with-ai', payload, {
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  return res.data;
}
