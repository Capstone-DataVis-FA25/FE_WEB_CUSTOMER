import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from './authType';
import {
  signInThunk,
  signUpThunk,
  signInWithGoogleThunk,
  updateProfileThunk,
  changePasswordThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  deleteUserThunk,
  viewProfileThunk,
  resendVerifyEmailThunk,
} from './authThunk';

import { t } from 'i18next';

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
  successMessage: null,
  deleteUserStatus: 'idle',
  deleteUserError: null,
  resendEmailStatus: 'idle',
  resendEmailError: null,
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
      state.isLoading = false; // Changed from state.loading to state.isLoading to match initialState
      state.error = null;

      // Xóa localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Clear AI chat history and selected dataset on logout
      localStorage.removeItem('datavis_ai_chat_history');
      localStorage.removeItem('datavis_ai_selected_dataset');
    },

    // Clear error
    clearError: state => {
      state.error = null;
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

    // Clear resend email status
    clearResendEmailStatus: state => {
      state.resendEmailStatus = 'idle';
      state.resendEmailError = null;
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
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
        state.error = null;

        // Lưu vào localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.access_token);
        localStorage.setItem('refreshToken', action.payload.refresh_token);
      })
      .addCase(signInThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || 'Sign in failed';
      });

    // Sign Up
    builder
      .addCase(signUpThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.error = null;
        state.isAuthenticated = true;
        console.log(`Message đăng ký thành công [SLICE]: ${action.payload.message}`);
        state.successMessage = action.payload.message;
      })
      .addCase(signUpThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || t('auth_signUpFailed');
      });

    // Google Sign In
    builder
      .addCase(signInWithGoogleThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogleThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
        state.error = null;

        // Lưu vào localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.access_token);
        localStorage.setItem('refreshToken', action.payload.refresh_token);
      })
      .addCase(signInWithGoogleThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || action.error?.message || t('auth_googleSignInFailed');
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    //View Profile
    builder
      .addCase(viewProfileThunk.pending, state => {
        state.error = null;
      })
      .addCase(viewProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(viewProfileThunk.rejected, (state, action) => {
        state.error =
          action.payload?.message || action.error?.message || t('auth_viewProfileFailed');
      });

    // Update Profile
    builder
      .addCase(updateProfileThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;

        // Lưu vào localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || action.error?.message || t('auth_updateProfileFailed');
      });

    // Delete User
    builder
      .addCase(deleteUserThunk.pending, state => {
        state.deleteUserStatus = 'pending';
        state.deleteUserError = null;
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.deleteUserStatus = 'success';
        state.deleteUserError = null;
        // Nếu user tự xóa chính mình thì logout
        if (state.user && state.user.id === action.payload.id) {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // Clear AI chat history when deleting account
          localStorage.removeItem('datavis_ai_chat_history');
          localStorage.removeItem('datavis_ai_selected_dataset');
        }
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.deleteUserStatus = 'error';
        state.deleteUserError = action.payload?.message || 'Delete user failed';
      });

    // Change Password
    builder
      .addCase(changePasswordThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePasswordThunk.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || action.error?.message || t('auth_changePasswordFailed');
      });

    // Forgot Password
    builder
      .addCase(forgotPasswordThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || action.error?.message || t('auth_forgotPasswordFailed');
      });

    // Reset Password
    builder
      .addCase(resetPasswordThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordThunk.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || action.error?.message || t('auth_resetPasswordFailed');
      });

    // Resend Verify Email
    builder
      .addCase(resendVerifyEmailThunk.pending, state => {
        state.resendEmailStatus = 'pending';
        state.resendEmailError = null;
      })
      .addCase(resendVerifyEmailThunk.fulfilled, (state, action) => {
        state.resendEmailStatus = 'success';
        state.resendEmailError = null;
        state.successMessage = action.payload.message;
      })
      .addCase(resendVerifyEmailThunk.rejected, (state, action) => {
        state.resendEmailStatus = 'error';
        state.resendEmailError = action.payload?.message || t('auth_resendEmailFailed');
      });
  },
});

export const { logout, clearError, setLoading, setTokens, clearResendEmailStatus } =
  authSlice.actions;

// TODO: Lỗi cái này chưa dám xóa updateUserProfile (note)

export default authSlice.reducer;
