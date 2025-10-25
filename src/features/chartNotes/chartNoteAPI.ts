import { axiosPrivate } from '@/services/axios';
import type { ChartNote, CreateChartNoteRequest, UpdateChartNoteRequest } from './chartNoteTypes';

const API_BASE = '/chart-notes';

// Helper function to transform BE response to FE format
const transformChartNote = (note: ChartNote): ChartNote => {
  return {
    id: note.id,
    chartId: note.chartId,
    content: note.content,
    isCompleted: note.isCompleted,
    author: {
      id: note.author.id,
      email: note.author.email,
      firstName: note.author.firstName,
      lastName: note.author.lastName,
    },
    createdAt: note.createdAt,
  };
};

// Get all notes for a specific chart
export const getChartNotes = async (chartId: string): Promise<ChartNote[]> => {
  const response = await axiosPrivate.get(`${API_BASE}/chart/${chartId}`);
  // Handle wrapped API response format
  const data = response.data?.data?.data;

  // Transform array of notes
  return Array.isArray(data) ? data.map(transformChartNote) : [];
};

// Get note by ID
export const getChartNoteById = async (id: string): Promise<ChartNote> => {
  const response = await axiosPrivate.get(`${API_BASE}/${id}`);
  // Handle wrapped API response format
  const data = response.data?.data?.data;

  return transformChartNote(data);
};

// Create new note
export const createChartNote = async (data: CreateChartNoteRequest): Promise<ChartNote> => {
  const response = await axiosPrivate.post(API_BASE, data);
  // Handle wrapped API response format
  const responseData = response.data?.data?.data;

  return transformChartNote(responseData);
};

// Update note
export const updateChartNote = async (
  id: string,
  data: UpdateChartNoteRequest
): Promise<ChartNote> => {
  const response = await axiosPrivate.patch(`${API_BASE}/${id}`, data);
  // Handle wrapped API response format
  const responseData = response.data?.data?.data;

  return transformChartNote(responseData);
};

// Delete note
export const deleteChartNote = async (id: string): Promise<void> => {
  await axiosPrivate.delete(`${API_BASE}/${id}`);
};

// Toggle note completed status
export const toggleChartNoteCompleted = async (id: string): Promise<ChartNote> => {
  const response = await axiosPrivate.patch(`${API_BASE}/${id}/toggle-completed`);
  // Handle wrapped API response format
  const responseData = response.data?.data?.data;

  return transformChartNote(responseData);
};
