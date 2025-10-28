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

// --- CSV / Excel cleaning types ---
export interface CleanCsvRequest {
  csv: string;
  thousandsSeparator?: string;
  decimalSeparator?: string;
  dateFormat?: string;
  schemaExample?: string;
  notes?: string;
}

export interface CleanCsvApiResponse {
  code: number;
  message: string;
  data?: {
    cleanedCsv: string;
  };
}

export interface CleanExcelOptions {
  thousandsSeparator?: string;
  decimalSeparator?: string;
  dateFormat?: string;
  schemaExample?: string;
  notes?: string;
}

export interface CleanExcelApiResponse {
  code: number;
  message: string;
  data?: any[][]; // 2D matrix of cleaned data
}
