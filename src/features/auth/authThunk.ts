import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthResponse, SignInRequest, SignUpRequest, GoogleAuthRequest } from './authType';
import { authAPI } from './authAPI';

export const signInThunk = createAsyncThunk<
  AuthResponse,
  SignInRequest,
  { rejectValue: { message: string } }
>('auth/signIn', async (signInData, { rejectWithValue }) => {
  try {
    const response = await authAPI.signInWithEmailPassword(signInData);
    return response;
  } catch (error: unknown) {
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đăng nhập thất bại';
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
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đăng ký thất bại';
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
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Google đăng nhập thất bại';
    return rejectWithValue({ message: errorMessage });
  }
});
