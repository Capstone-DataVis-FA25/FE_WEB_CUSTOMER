import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { NumberFormat } from '@/contexts/DatasetContext';
import type { DataHeader } from '@/utils/dataProcessors';

export interface ExcelUIState {
  selectedRow: number | null;
  selectedColumn: number | null;
  tempEdits: Record<string, string>;
  touchedCells: string[]; // Changed from Set<string> to string[] for serialization
  infoMessage: string | null;
  sortConfig: {
    column: number;
    direction: 'asc' | 'desc';
  } | null;
  columns: DataHeader[]; // Moved columns ownership to Redux (step 1)
  filters: string[];
  // Validation errors moved from DatasetContext to prevent prop drilling
  duplicateColumns: {
    duplicateNames: string[];
    duplicateColumnIndices: number[];
  } | null;
  emptyColumns: number[];
  parseErrors: Record<number, number[]>; // row -> column indices with parse errors
  // Data processing functions moved from DatasetContext to prevent re-renders
  dateFormat: string;
  numberFormat: NumberFormat;
}

const initialState: ExcelUIState = {
  selectedRow: null,
  selectedColumn: null,
  tempEdits: {},
  touchedCells: [], // Changed from new Set() to [] for serialization
  infoMessage: null,
  sortConfig: null,
  columns: [],
  filters: [],
  duplicateColumns: null,
  emptyColumns: [],
  parseErrors: {},
  dateFormat: 'DD/MM/YYYY',
  numberFormat: {
    thousandsSeparator: ',',
    decimalSeparator: '.',
  }, // Default date format
};

const excelUISlice = createSlice({
  name: 'excelUI',
  initialState,
  reducers: {
    setSelectedRow: (state, action: PayloadAction<number | null>) => {
      state.selectedRow = action.payload;
    },
    setSelectedColumn: (state, action: PayloadAction<number | null>) => {
      state.selectedColumn = action.payload;
    },
    setTempEdits: (state, action: PayloadAction<Record<string, string>>) => {
      state.tempEdits = action.payload;
    },
    updateTempEdit: (state, action: PayloadAction<{ key: string; value: string }>) => {
      state.tempEdits[action.payload.key] = action.payload.value;
    },
    clearTempEdit: (state, action: PayloadAction<string>) => {
      delete state.tempEdits[action.payload];
    },
    setTouchedCells: (state, action: PayloadAction<string[]>) => {
      state.touchedCells = action.payload;
    },
    addTouchedCell: (state, action: PayloadAction<string>) => {
      if (!state.touchedCells.includes(action.payload)) {
        state.touchedCells.push(action.payload);
      }
    },
    setInfoMessage: (state, action: PayloadAction<string | null>) => {
      state.infoMessage = action.payload;
    },
    setSortConfig: (
      state,
      action: PayloadAction<{ column: number; direction: 'asc' | 'desc' } | null>
    ) => {
      state.sortConfig = action.payload;
    },
    // ===== Columns management =====
    setColumns: (state, action: PayloadAction<DataHeader[]>) => {
      state.columns = action.payload;
    },
    setColumnName: (state, action: PayloadAction<{ index: number; name: string }>) => {
      const { index, name } = action.payload;
      if (state.columns[index]) state.columns[index] = { ...state.columns[index], name };
    },
    setColumnType: (
      state,
      action: PayloadAction<{ index: number; type: 'text' | 'number' | 'date' }>
    ) => {
      const { index, type } = action.payload;
      if (state.columns[index]) state.columns[index] = { ...state.columns[index], type };
    },
    setColumnWidth: (state, action: PayloadAction<{ index: number; width: number }>) => {
      const { index, width } = action.payload;
      if (state.columns[index]) state.columns[index] = { ...state.columns[index], width };
    },
    // ===== Filters management =====
    setFilters: (state, action: PayloadAction<string[]>) => {
      state.filters = action.payload;
    },
    setFilter: (state, action: PayloadAction<{ index: number; value: string }>) => {
      const { index, value } = action.payload;
      if (!state.filters || state.filters.length < state.columns.length) {
        state.filters = Array(state.columns.length).fill('');
      }
      state.filters[index] = value;
    },
    clearUIState: () => {
      return initialState;
    },
    setDuplicateColumns: (
      state,
      action: PayloadAction<{
        duplicateNames: string[];
        duplicateColumnIndices: number[];
      } | null>
    ) => {
      state.duplicateColumns = action.payload;
    },
    setEmptyColumns: (state, action: PayloadAction<number[]>) => {
      state.emptyColumns = action.payload;
    },
    setParseErrors: (state, action: PayloadAction<Record<number, number[]>>) => {
      state.parseErrors = action.payload;
    },
    updateParseError: (
      state,
      action: PayloadAction<{ row: number; column: number; hasError: boolean }>
    ) => {
      const { row, column, hasError } = action.payload;
      if (hasError) {
        if (!state.parseErrors[row]) {
          state.parseErrors[row] = [];
        }
        if (!state.parseErrors[row].includes(column)) {
          state.parseErrors[row].push(column);
        }
      } else {
        if (state.parseErrors[row]) {
          state.parseErrors[row] = state.parseErrors[row].filter(c => c !== column);
          if (state.parseErrors[row].length === 0) {
            delete state.parseErrors[row];
          }
        }
      }
    },
    setDateFormat: (state, action: PayloadAction<string>) => {
      state.dateFormat = action.payload;
    },
    setNumberFormat: (state, action: PayloadAction<NumberFormat>) => {
      state.numberFormat = action.payload;
    },
  },
});

export const {
  setSelectedRow,
  setSelectedColumn,
  setTempEdits,
  updateTempEdit,
  clearTempEdit,
  setTouchedCells,
  addTouchedCell,
  setInfoMessage,
  setSortConfig,
  setColumns,
  setColumnName,
  setColumnType,
  setColumnWidth,
  setFilters,
  setFilter,
  clearUIState,
  setDuplicateColumns,
  setEmptyColumns,
  setParseErrors,
  updateParseError,
  setDateFormat,
  setNumberFormat,
} = excelUISlice.actions;

export default excelUISlice.reducer;
