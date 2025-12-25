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
  userId?: string;
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

// --- Chart Generation types ---
export interface DatasetInfo {
  id: string;
  name: string;
  description?: string;
}

export interface ChartGenerationRequest {
  prompt: string;
  datasetId: string;
}

export interface ChartConfig {
  title: string;
  width: number;
  height: number;
  margin: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  theme?: 'light' | 'dark';
  xAxisKey: string;
  yAxisKeys: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showValues?: boolean;
  animationDuration?: number;
  lineType?: 'basic' | 'smooth' | 'stepped' | 'dashed';
  barType?: 'grouped' | 'stacked' | 'percentage';
  areaType?: 'basic' | 'stacked' | 'percentage' | 'stream';
  pieType?: 'basic' | 'exploded' | 'nested';
}

export interface ChartGenerationResponse {
  type: string;
  config: ChartConfig;
  explanation: string;
  suggestedName: string;
  chartUrl: string;
  success: boolean;
}

export interface AiChatResponse {
  reply: string;
  success: boolean;
  needsDatasetSelection?: boolean;
  datasets?: DatasetInfo[];
  chartGenerated?: boolean;
  chartData?: ChartGenerationResponse;
  createdDataset?: DatasetInfo;
  data?: any;
}
