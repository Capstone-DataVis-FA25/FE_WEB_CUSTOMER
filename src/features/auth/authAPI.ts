import { axiosPublic } from '@/services/axios';
import type { SignInRequest, SignUpRequest, GoogleAuthRequest, AuthResponse } from './authType';

const SIGN_IN = '/auth/signin';
const SIGN_UP = '/auth/signup';
const GOOGLE_AUTH = '/auth/google/token';

export const authAPI = {
  signInWithEmailPassword: async (data: SignInRequest): Promise<AuthResponse> => {
    const response = await axiosPublic.post(`${SIGN_IN}`, data);
    const responseData = response.data.data; // Extract from nested data property

    // Return in the format expected by the slice
    return {
      user: responseData.user,
      access_token: responseData.tokens.access_token,
      refresh_token: responseData.tokens.refresh_token,
    };
  },
  signUpWithEmailPassword: async (data: SignUpRequest): Promise<AuthResponse> => {
    const response = await axiosPublic.post(`${SIGN_UP}`, data);
    const responseData = response.data.data; // Extract from nested data property

    // Return in the format expected by the slice
    return {
      user: responseData.user,
      access_token: responseData.tokens.access_token,
      refresh_token: responseData.tokens.refresh_token,
    };
  },

  // Google OAuth2 with ID Token
  signInWithGoogleToken: async (data: GoogleAuthRequest): Promise<AuthResponse> => {
    const response = await axiosPublic.post(`${GOOGLE_AUTH}`, data);
    const responseData = response.data.data; // Extract from nested data property

    return {
      user: responseData.user,
      access_token: responseData.tokens.access_token,
      refresh_token: responseData.tokens.refresh_token,
    };
  },
};
