import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from './authType';
import type { ErrorResponse } from '../errorType';
import { signInThunk, signUpThunk } from './authThunk';

// Helper function để lấy user từ localStorage an toàn
const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  _id: getStoredUser()?._id || null,
  user: getStoredUser(),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  verifyStatus: undefined,
  verifyMessage: '',
};

// Helper functions cho extraReducers
const handlePending = (state: AuthState) => {
  state.loading = true;
  state.error = null;
};

const handleAuthSuccess = (state: AuthState, action: PayloadAction<any>) => {
  state.loading = false;
  state.user = action.payload.user;
  state._id = action.payload.user._id;
  state.token = action.payload.access_token;
  state.error = null;
};

const handleAuthReject = (state: AuthState, action: PayloadAction<ErrorResponse | undefined>) => {
  state.loading = false;
  state.error = action.payload || null;
  state.user = null;
  state._id = null;
  state.token = null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Logout - chỉ cần xóa localStorage
    logout: state => {
      state._id = null;
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      state.verifyStatus = undefined;
      state.verifyMessage = '';

      // Xóa localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    },

    // Clear error
    clearError: state => {
      state.error = null;
    },

    // Clear verify status
    clearVerifyStatus: state => {
      state.verifyStatus = undefined;
      state.verifyMessage = '';
    },

    // Update user profile
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    // Set loading manually
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set verify status
    setVerifyStatus: (
      state,
      action: PayloadAction<{
        status: 'pending' | 'success' | 'error';
        message?: string;
      }>
    ) => {
      state.verifyStatus = action.payload.status;
      state.verifyMessage = action.payload.message || '';
    },
  },
  extraReducers: builder => {
    // Sign In
    builder
      .addCase(signInThunk.pending, handlePending)
      .addCase(signInThunk.fulfilled, handleAuthSuccess)
      .addCase(signInThunk.rejected, handleAuthReject);

    // Sign Up
    builder
      .addCase(signUpThunk.pending, handlePending)
      .addCase(signUpThunk.fulfilled, handleAuthSuccess)
      .addCase(signUpThunk.rejected, handleAuthReject);
  },
});

export const {
  logout,
  clearError,
  clearVerifyStatus,
  updateUserProfile,
  setLoading,
  setVerifyStatus,
} = authSlice.actions;

export default authSlice.reducer;
