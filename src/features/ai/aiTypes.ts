export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiState {
  messages: AiMessage[];
  loading: boolean;
  error: string | null;
}

export interface SendAiMessageRequest {
  message: string;
  messages: string; // JSON.stringify([...])
  language: string;
}
