import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from './authType';
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
  user: getStoredUser(),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Logout - xóa all data và localStorage
    logout: state => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Xóa localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },

    // Clear error
    clearError: state => {
      state.error = null;
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
      state.isLoading = action.payload;
    },

    // Set tokens manually (for refresh token flow)
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;

      localStorage.setItem('accessToken', action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
  },
  extraReducers: builder => {
    // Sign In
    builder
      .addCase(signInThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.accessToken = action.payload.data.tokens.access_token;
        state.refreshToken = action.payload.data.tokens.refresh_token;
        state.isAuthenticated = true;
        state.error = null;

        // Lưu vào localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.data.user));
        localStorage.setItem('accessToken', action.payload.data.tokens.access_token);
        localStorage.setItem('refreshToken', action.payload.data.tokens.refresh_token);
      })
      .addCase(signInThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || 'Sign in failed';
        // state.user = null;
        // state.accessToken = null;
        // state.refreshToken = null;
        // state.isAuthenticated = false;
      });

    // Sign Up
    builder
      .addCase(signUpThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.accessToken = action.payload.data.tokens.access_token;
        state.refreshToken = action.payload.data.tokens.refresh_token;
        state.isAuthenticated = true;
        state.error = null;

        // Lưu vào localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.data.user));
        localStorage.setItem('accessToken', action.payload.data.tokens.access_token);
        localStorage.setItem('refreshToken', action.payload.data.tokens.refresh_token);
      })
      .addCase(signUpThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || 'Sign up failed';
      });
  },
});

export const { logout, clearError, updateUserProfile, setLoading, setTokens } = authSlice.actions;

export default authSlice.reducer;
