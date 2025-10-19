import { createAsyncThunk } from '@reduxjs/toolkit';
import { chatWithAi } from './aiAPI';
import type { AiMessage, SendAiMessageRequest } from './aiTypes';

export const sendAiMessageThunk = createAsyncThunk<
  AiMessage,
  SendAiMessageRequest,
  { rejectValue: string }
>('ai/sendAiMessage', async (payload, { rejectWithValue }) => {
  try {
    const res = await chatWithAi(payload);
    if (res.code === 200 && res.data?.success) {
      return { role: 'assistant', content: res.data.reply };
    } else {
      return rejectWithValue('AI không trả về kết quả hợp lệ.');
    }
  } catch (error) {
    return rejectWithValue('Lỗi kết nối AI.');
  }
});
