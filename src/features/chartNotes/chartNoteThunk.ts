import { createAsyncThunk } from '@reduxjs/toolkit';
import * as chartNoteAPI from './chartNoteAPI';
import type { CreateChartNoteRequest, UpdateChartNoteRequest } from './chartNoteTypes';

// Fetch all notes for a chart
export const fetchChartNotes = createAsyncThunk(
  'chartNotes/fetchChartNotes',
  async (chartId: string, { rejectWithValue }) => {
    try {
      const notes = await chartNoteAPI.getChartNotes(chartId);
      console.log('Fetched notes for chartId: ', notes);
      return { chartId, notes };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch chart notes');
    }
  }
);

// Fetch note by ID
export const fetchChartNoteById = createAsyncThunk(
  'chartNotes/fetchChartNoteById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await chartNoteAPI.getChartNoteById(id);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch note');
    }
  }
);

// Create chart note
export const createChartNoteThunk = createAsyncThunk(
  'chartNotes/createChartNote',
  async (data: CreateChartNoteRequest, { rejectWithValue }) => {
    try {
      const note = await chartNoteAPI.createChartNote(data);
      return note;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create note');
    }
  }
);

// Update chart note
export const updateChartNoteThunk = createAsyncThunk(
  'chartNotes/updateChartNote',
  async ({ id, data }: { id: string; data: UpdateChartNoteRequest }, { rejectWithValue }) => {
    try {
      return await chartNoteAPI.updateChartNote(id, data);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update note');
    }
  }
);

// Delete chart note
export const deleteChartNoteThunk = createAsyncThunk(
  'chartNotes/deleteChartNote',
  async ({ chartId, noteId }: { chartId: string; noteId: string }, { rejectWithValue }) => {
    try {
      await chartNoteAPI.deleteChartNote(noteId);
      return { chartId, noteId };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete note');
    }
  }
);

// Toggle chart note completed status
export const toggleChartNoteCompletedThunk = createAsyncThunk(
  'chartNotes/toggleChartNoteCompleted',
  async ({ noteId }: { noteId: string }, { rejectWithValue }) => {
    try {
      return await chartNoteAPI.toggleChartNoteCompleted(noteId);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle note status');
    }
  }
);
