export interface ChartNote {
  id: string;
  chartId: string;
  content: string;
  isCompleted: boolean;
  author: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
}

export interface ChartNoteState {
  notes: Record<string, ChartNote[]>; // Keyed by chartId
  currentChartNotes: ChartNote[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  toggling: boolean;
  error: string | null;
}

export interface CreateChartNoteRequest {
  chartId: string;
  content: string;
  isCompleted?: boolean;
}

export interface UpdateChartNoteRequest {
  content?: string;
  isCompleted?: boolean;
}
