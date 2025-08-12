import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthResponse, SignInRequest, SignUpRequest, GoogleAuthRequest, UpdateProfileResponse, UpdateProfileRequest } from './authType';
import { authAPI } from './authAPI';
import { t } from 'i18next';

export const signInThunk = createAsyncThunk<
  AuthResponse,
  SignInRequest,
  { rejectValue: { message: string } }
>('auth/signIn', async (signInData, { rejectWithValue }) => {
  try {
    const response = await authAPI.signInWithEmailPassword(signInData);
    return response;
  } catch (error: unknown) {
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth_signInFailed');
    return rejectWithValue({ message: errorMessage });
  }
});

export const signUpThunk = createAsyncThunk<
  AuthResponse,
  SignUpRequest,
  { rejectValue: { message: string } }
>('auth/signUp', async (signUpData, { rejectWithValue }) => {
  try {
    const response = await authAPI.signUpWithEmailPassword(signUpData);
    return response;
  } catch (error: unknown) {
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth_signUpFailed');
    return rejectWithValue({ message: errorMessage });
  }
});

export const signInWithGoogleThunk = createAsyncThunk<
  AuthResponse,
  GoogleAuthRequest,
  { rejectValue: { message: string } }
>('auth/signInWithGoogle', async (googleData, { rejectWithValue }) => {
  try {
    const response = await authAPI.signInWithGoogleToken(googleData);
    return response;
  } catch (error: unknown) {
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth_googleSignInFailed');
    return rejectWithValue({ message: errorMessage });
  }
});

export const updateProfileThunk = createAsyncThunk<
  UpdateProfileResponse,
  UpdateProfileRequest,
  { rejectValue: { message: string } }
>('auth/profile', async (updateData, { rejectWithValue }) => {
  try {
    const response = await authAPI.updateProfile(updateData);
    return response;
  } catch (error: unknown) {
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth_updateProfileFailed');
    return rejectWithValue({ message: errorMessage });
  }
});

export const changePasswordThunk = createAsyncThunk<
  { message: string },
  { oldPassword: string; newPassword: string },
  { rejectValue: { message: string } }
>('auth/changePassword', async (changeData, { rejectWithValue }) => {
  try {
    await authAPI.changePassword(changeData);
    return { message: 'Mật khẩu đã được thay đổi thành công' };
  } catch (error: unknown) {
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth_changePasswordFailed');
    return rejectWithValue({ message: errorMessage });
  }
});

export const forgotPasswordThunk = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: { message: string } }
>('auth/forgotPassword', async (forgotData, { rejectWithValue }) => {
  try {
    await authAPI.forgotPassword(forgotData);
  } catch (error: unknown) {
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth_forgotPasswordFailed');
    return rejectWithValue({ message: errorMessage });
  }
});

export const resetPasswordThunk = createAsyncThunk<
  void,
  { password: string; token: string },
  { rejectValue: { message: string } }
>('auth/resetPassword', async (resetData, { rejectWithValue }) => {
  try {
    await authAPI.resetPassword(resetData);
  } catch (error: unknown) {
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth_resetPasswordFailed');
    return rejectWithValue({ message: errorMessage });
  }
});
