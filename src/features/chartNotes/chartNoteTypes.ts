export interface ChartNote {
  id: string;
  chartId: string;
  content: string;
  timestamp: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    color?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChartNoteState {
  notes: Record<string, ChartNote[]>; // Keyed by chartId
  currentChartNotes: ChartNote[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
}

export interface CreateChartNoteRequest {
  chartId: string;
  content: string;
}

export interface UpdateChartNoteRequest {
  content: string;
}
