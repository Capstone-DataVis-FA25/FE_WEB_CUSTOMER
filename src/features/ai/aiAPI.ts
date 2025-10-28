// API for DataVis AI endpoints
import { axiosPrivate } from '@/services/axios';
import type { CleanCsvRequest, CleanCsvApiResponse, CleanExcelApiResponse } from './aiTypes';

export interface AiChatRequest {
  message: string;
  messages: string; // JSON.stringify([...])
  language: string;
}

export interface AiChatResponse {
  code: number;
  message: string;
  data?: {
    reply: string;
    processingTime: string;
    messageCount: number;
    language: string;
    success: boolean;
  };
}

export async function chatWithAi(payload: AiChatRequest): Promise<AiChatResponse> {
  const res = await axiosPrivate.post<AiChatResponse>('/ai/chat-with-ai', payload, {
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  });
  return res.data;
}

// --- Clean CSV (JSON) ---
export async function cleanCsv(payload: CleanCsvRequest): Promise<CleanCsvApiResponse> {
  const res = await axiosPrivate.post<CleanCsvApiResponse>('/ai/clean', payload, {
    headers: { 'Content-Type': 'application/json', Accept: '*/*' },
  });
  return res.data;
}

// --- Clean Excel (file upload) ---
// Accepts a File/Blob and optional options; returns the same shape the backend uses.
export async function cleanExcelUpload(
  file: File | Blob,
  options?: {
    thousandsSeparator?: string;
    decimalSeparator?: string;
    dateFormat?: string;
    schemaExample?: string;
    notes?: string;
  }
): Promise<CleanExcelApiResponse> {
  const form = new FormData();
  // when passing a File, include filename; Blob alone will work but we add a default name
  if (file instanceof File) form.append('file', file, file.name);
  else form.append('file', file, 'upload');

  if (options) {
    if (options.thousandsSeparator !== undefined)
      form.append('thousandsSeparator', options.thousandsSeparator);
    if (options.decimalSeparator !== undefined)
      form.append('decimalSeparator', options.decimalSeparator);
    if (options.dateFormat !== undefined) form.append('dateFormat', options.dateFormat);
    if (options.schemaExample !== undefined) form.append('schemaExample', options.schemaExample);
    if (options.notes !== undefined) form.append('notes', options.notes);
  }

  const res = await axiosPrivate.post<CleanExcelApiResponse>('/ai/clean-excel', form, {
    headers: {
      // Explicitly set multipart/form-data so axios/browser will attach the correct boundary
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    },
  });
  return res.data;
}
