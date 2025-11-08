export interface ChartHistory {
  id: string;
  chartId: string;
  datasetId: string;
  name: string;
  description?: string;
  type: string;
  config: any;
  createdAt: string;
  updatedBy: string;
  changeNote?: string;
}

export interface ChartHistoryState {
  histories: Record<string, ChartHistory[]>; // Keyed by chartId
  currentChartHistories: ChartHistory[];
  selectedHistory: ChartHistory | null;
  historyCount: number;
  loading: boolean;
  restoring: boolean;
  deleting: boolean;
  comparing: boolean;
  error: string | null;
  comparisonResult: ComparisonResult | null;
}

export interface ComparisonResult {
  current: {
    name: string;
    description?: string;
    type: string;
    datasetId: string;
    config: any;
    updatedAt: string;
  };
  historical: {
    name: string;
    description?: string;
    type: string;
    datasetId: string;
    config: any;
    createdAt: string;
  };
  differences: Record<
    string,
    {
      current: any;
      historical: any;
    }
  >;
}

export interface RestoreChartRequest {
  historyId: string;
  changeNote?: string;
}
