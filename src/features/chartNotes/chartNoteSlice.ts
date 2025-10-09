import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ChartNote, ChartNoteState } from './chartNoteTypes';
import {
  fetchChartNotes,
  fetchChartNoteById,
  createChartNoteThunk,
  updateChartNoteThunk,
  deleteChartNoteThunk,
} from './chartNoteThunk';

const initialState: ChartNoteState = {
  notes: {}, // Keyed by chartId
  currentChartNotes: [],
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

const chartNoteSlice = createSlice({
  name: 'chartNotes',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearCurrentChartNotes: state => {
      state.currentChartNotes = [];
    },
    // Add a note locally (optimistic update)
    addNoteLocally: (
      state,
      action: PayloadAction<{
        chartId: string;
        note: Omit<ChartNote, 'id' | 'createdAt' | 'updatedAt'>;
      }>
    ) => {
      const { chartId, note } = action.payload;
      const tempNote: ChartNote = {
        ...note,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!state.notes[chartId]) {
        state.notes[chartId] = [];
      }
      state.notes[chartId].push(tempNote);
      state.currentChartNotes.push(tempNote);
    },
    // Set current chart notes
    setCurrentChartNotes: (state, action: PayloadAction<string>) => {
      const chartId = action.payload;
      state.currentChartNotes = state.notes[chartId] || [];
    },
    // Delete a note locally
    deleteNoteLocally: (state, action: PayloadAction<{ chartId: string; noteId: string }>) => {
      const { chartId, noteId } = action.payload;

      if (state.notes[chartId]) {
        state.notes[chartId] = state.notes[chartId].filter(note => note.id !== noteId);
      }
      state.currentChartNotes = state.currentChartNotes.filter(note => note.id !== noteId);
    },
    // Update a note locally
    updateNoteLocally: (
      state,
      action: PayloadAction<{ chartId: string; noteId: string; content: string }>
    ) => {
      const { chartId, noteId, content } = action.payload;
      const updatedAt = new Date().toISOString();

      if (state.notes[chartId]) {
        const noteIndex = state.notes[chartId].findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
          state.notes[chartId][noteIndex].content = content;
          state.notes[chartId][noteIndex].updatedAt = updatedAt;
        }
      }

      const currentNoteIndex = state.currentChartNotes.findIndex(note => note.id === noteId);
      if (currentNoteIndex !== -1) {
        state.currentChartNotes[currentNoteIndex].content = content;
        state.currentChartNotes[currentNoteIndex].updatedAt = updatedAt;
      }
    },
  },
  extraReducers: builder => {
    builder
      // Fetch chart notes
      .addCase(fetchChartNotes.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchChartNotes.fulfilled,
        (state, action: PayloadAction<{ chartId: string; notes: ChartNote[] }>) => {
          state.loading = false;
          const { chartId, notes } = action.payload;
          state.notes[chartId] = notes;
          state.currentChartNotes = notes;
        }
      )
      .addCase(fetchChartNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch note by ID
      .addCase(fetchChartNoteById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChartNoteById.fulfilled, (state, action: PayloadAction<ChartNote>) => {
        state.loading = false;
        const note = action.payload;
        const chartId = note.chartId;

        if (!state.notes[chartId]) {
          state.notes[chartId] = [];
        }

        const index = state.notes[chartId].findIndex(n => n.id === note.id);
        if (index !== -1) {
          state.notes[chartId][index] = note;
        } else {
          state.notes[chartId].push(note);
        }
      })
      .addCase(fetchChartNoteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create note
      .addCase(createChartNoteThunk.pending, state => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createChartNoteThunk.fulfilled, (state, action: PayloadAction<ChartNote>) => {
        state.creating = false;
        const note = action.payload;
        const chartId = note.chartId;

        if (!state.notes[chartId]) {
          state.notes[chartId] = [];
        }

        // Remove temp note if exists
        state.notes[chartId] = state.notes[chartId].filter(n => !n.id.startsWith('temp-'));
        state.currentChartNotes = state.currentChartNotes.filter(n => !n.id.startsWith('temp-'));

        // Add new note
        state.notes[chartId].push(note);
        state.currentChartNotes.push(note);
      })
      .addCase(createChartNoteThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;

        // Remove temp notes on error
        Object.keys(state.notes).forEach(chartId => {
          state.notes[chartId] = state.notes[chartId].filter(n => !n.id.startsWith('temp-'));
        });
        state.currentChartNotes = state.currentChartNotes.filter(n => !n.id.startsWith('temp-'));
      })
      // Update note
      .addCase(updateChartNoteThunk.pending, state => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateChartNoteThunk.fulfilled, (state, action: PayloadAction<ChartNote>) => {
        state.updating = false;
        const note = action.payload;
        const chartId = note.chartId;

        if (state.notes[chartId]) {
          const index = state.notes[chartId].findIndex(n => n.id === note.id);
          if (index !== -1) {
            state.notes[chartId][index] = note;
          }
        }

        const currentIndex = state.currentChartNotes.findIndex(n => n.id === note.id);
        if (currentIndex !== -1) {
          state.currentChartNotes[currentIndex] = note;
        }
      })
      .addCase(updateChartNoteThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      // Delete note
      .addCase(deleteChartNoteThunk.pending, state => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(
        deleteChartNoteThunk.fulfilled,
        (state, action: PayloadAction<{ chartId: string; noteId: string }>) => {
          state.deleting = false;
          const { chartId, noteId } = action.payload;

          if (state.notes[chartId]) {
            state.notes[chartId] = state.notes[chartId].filter(n => n.id !== noteId);
          }

          state.currentChartNotes = state.currentChartNotes.filter(n => n.id !== noteId);
        }
      )
      .addCase(deleteChartNoteThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentChartNotes,
  addNoteLocally,
  setCurrentChartNotes,
  updateNoteLocally,
} = chartNoteSlice.actions;
export default chartNoteSlice.reducer;
