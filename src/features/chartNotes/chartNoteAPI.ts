import { axiosPrivate } from '@/services/axios';
import type { ChartNote, CreateChartNoteRequest, UpdateChartNoteRequest } from './chartNoteTypes';

const API_BASE = '/chart-notes';

// Helper function to transform BE response to FE format
const transformChartNote = (note: {
  id: string;
  chartId: string;
  content: string;
  timestamp?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    color?: string;
  };
  createdAt: string;
  updatedAt: string;
}): ChartNote => {
  return {
    id: note.id,
    chartId: note.chartId,
    content: note.content,
    timestamp: note.timestamp || note.createdAt,
    author: {
      id: note.author.id,
      name: note.author.name,
      avatar: note.author.avatar,
      color: note.author.color,
    },
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
};

// Get all notes for a specific chart
export const getChartNotes = async (chartId: string): Promise<ChartNote[]> => {
  const response = await axiosPrivate.get(`${API_BASE}/chart/${chartId}`);
  // Handle wrapped API response format
  console.log('response getChartNotes: ', response);
  const data =
    response.data && typeof response.data === 'object' && 'data' in response.data
      ? response.data.data.data
      : response.data.data.data;

  // Transform array of notes
  return Array.isArray(data) ? data.map(transformChartNote) : [];
};

// Get note by ID
export const getChartNoteById = async (id: string): Promise<ChartNote> => {
  const response = await axiosPrivate.get(`${API_BASE}/${id}`);
  // Handle wrapped API response format
  const data =
    response.data && typeof response.data === 'object' && 'data' in response.data
      ? response.data.data
      : response.data;

  return transformChartNote(data);
};

// Create new note
export const createChartNote = async (data: CreateChartNoteRequest): Promise<ChartNote> => {
  const response = await axiosPrivate.post(API_BASE, data);
  // Handle wrapped API response format
  const responseData =
    response.data && typeof response.data === 'object' && 'data' in response.data
      ? response.data.data.data
      : response.data.data.data;

  return transformChartNote(responseData);
};

// Update note
export const updateChartNote = async (
  id: string,
  data: UpdateChartNoteRequest
): Promise<ChartNote> => {
  const response = await axiosPrivate.patch(`${API_BASE}/${id}`, data);
  // Handle wrapped API response format
  const responseData =
    response.data && typeof response.data === 'object' && 'data' in response.data
      ? response.data.data.data
      : response.data.data.data;

  return transformChartNote(responseData);
};

// Delete note
export const deleteChartNote = async (id: string): Promise<void> => {
  await axiosPrivate.delete(`${API_BASE}/${id}`);
};
