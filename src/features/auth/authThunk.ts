import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthResponse, SignInRequest, SignUpRequest } from './authType';
import type { ErrorResponse } from '../errorType';
import { authAPI } from './authAPI';

export const signInThunk = createAsyncThunk<
  AuthResponse,
  SignInRequest,
  { rejectValue: ErrorResponse }
>('auth/signIn', async (signInData, { rejectWithValue }) => {
  try {
    const response = await authAPI.signInWithEmailPassword(signInData);

    // Lưu vào localStorage
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      status: error.response?.status, // true or false
      message: error.response?.data?.message || 'Đăng nhập thất bại',
    };
    return rejectWithValue(errorResponse);
  }
});

export const signUpThunk = createAsyncThunk<
  AuthResponse,
  SignUpRequest,
  { rejectValue: ErrorResponse }
>('auth/signUp', async (signUpData, { rejectWithValue }) => {
  try {
    const response = await authAPI.signUpWithEmailPassword(signUpData);

    // Lưu vào localStorage
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      status: error.response?.status,
      message: error.response?.data?.message || 'Đăng ký thất bại',
    };
    return rejectWithValue(errorResponse);
  }
});
