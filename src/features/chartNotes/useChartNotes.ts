import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import type { AppDispatch, RootState } from '@/store/store';
import {
  fetchChartNotes,
  fetchChartNoteById,
  createChartNoteThunk,
  updateChartNoteThunk,
  deleteChartNoteThunk,
  toggleChartNoteCompletedThunk,
} from './chartNoteThunk';
import {
  clearError,
  clearCurrentChartNotes,
  addNoteLocally,
  setCurrentChartNotes,
  toggleNoteCompletedLocally,
} from './chartNoteSlice';
import type { CreateChartNoteRequest, UpdateChartNoteRequest } from './chartNoteTypes';

export const useChartNotes = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notes, currentChartNotes, loading, creating, updating, deleting, toggling, error } =
    useSelector((state: RootState) => state.chartNote);

  // Fetch all notes for a chart
  const getChartNotes = useCallback(
    (chartId: string) => {
      return dispatch(fetchChartNotes(chartId));
    },
    [dispatch]
  );

  // Fetch note by ID
  const getChartNoteById = useCallback(
    (id: string) => {
      return dispatch(fetchChartNoteById(id));
    },
    [dispatch]
  );

  // Create a new note
  const createNote = useCallback(
    (data: CreateChartNoteRequest) => {
      return dispatch(createChartNoteThunk(data));
    },
    [dispatch]
  );

  // Update a note
  const updateNote = useCallback(
    (id: string, data: UpdateChartNoteRequest) => {
      return dispatch(updateChartNoteThunk({ id, data }));
    },
    [dispatch]
  );

  // Delete a note
  const deleteNote = useCallback(
    (chartId: string, noteId: string) => {
      return dispatch(deleteChartNoteThunk({ chartId, noteId }));
    },
    [dispatch]
  );

  // Add note locally (optimistic update)
  const addNoteOptimistic = useCallback(
    (
      chartId: string,
      content: string,
      author: { id: string; name: string; avatar?: string; color?: string }
    ) => {
      dispatch(
        addNoteLocally({
          chartId,
          note: {
            chartId,
            content,
            timestamp: new Date().toISOString(),
            isCompleted: false,
            author,
          },
        })
      );
    },
    [dispatch]
  );

  // Toggle note completed status
  const toggleNoteCompleted = useCallback(
    (noteId: string) => {
      return dispatch(toggleChartNoteCompletedThunk({ noteId }));
    },
    [dispatch]
  );

  // Toggle note completed status locally (optimistic)
  const toggleNoteCompletedOptimistic = useCallback(
    (chartId: string, noteId: string) => {
      dispatch(toggleNoteCompletedLocally({ chartId, noteId }));
    },
    [dispatch]
  );

  // Set current chart notes
  const setCurrentNotes = useCallback(
    (chartId: string) => {
      dispatch(setCurrentChartNotes(chartId));
    },
    [dispatch]
  );

  // Clear current chart notes
  const clearCurrentNotes = useCallback(() => {
    dispatch(clearCurrentChartNotes());
  }, [dispatch]);

  // Clear error
  const clearNoteError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    notes,
    currentChartNotes,
    loading,
    creating,
    updating,
    deleting,
    toggling,
    error,
    getChartNotes,
    getChartNoteById,
    createNote,
    updateNote,
    deleteNote,
    toggleNoteCompleted,
    toggleNoteCompletedOptimistic,
    addNoteOptimistic,
    setCurrentNotes,
    clearCurrentNotes,
    clearNoteError,
  };
};
