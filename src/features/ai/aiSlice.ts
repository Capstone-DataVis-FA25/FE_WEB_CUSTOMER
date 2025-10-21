import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AiMessage, AiState } from './aiTypes';
import { sendAiMessageThunk } from './aiThunk';

const initialState: AiState = {
  messages: [],
  loading: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAiError: state => {
      state.error = null;
    },
    clearAiMessages: state => {
      state.messages = [];
    },
    addAiMessageLocally: (state, action: PayloadAction<AiMessage>) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(sendAiMessageThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendAiMessageThunk.fulfilled, (state, action: PayloadAction<AiMessage>) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendAiMessageThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAiError, clearAiMessages, addAiMessageLocally } = aiSlice.actions;
export default aiSlice.reducer;
