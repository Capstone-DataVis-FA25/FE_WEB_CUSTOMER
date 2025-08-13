import { axiosPrivate, axiosPublic } from '@/services/axios';
import type { SignInRequest, SignUpRequest, GoogleAuthRequest, AuthResponse, UpdateProfileRequest, UpdateProfileResponse } from './authType';

const SIGN_IN = '/auth/signin';
const SIGN_UP = '/auth/signup';
const GOOGLE_AUTH = '/auth/google/token';
const UPDATE_PROFILE = 'users/me/update-profile';

export const authAPI = {
  signInWithEmailPassword: async (data: SignInRequest): Promise<AuthResponse> => {
    const response = await axiosPublic.post(`${SIGN_IN}`, data);
    const responseData = response.data.data;

    return {
      user: responseData.user,
      access_token: responseData.tokens.access_token,
      refresh_token: responseData.tokens.refresh_token,
    };
  },
  signUpWithEmailPassword: async (data: SignUpRequest): Promise<AuthResponse> => {
    const response = await axiosPublic.post(`${SIGN_UP}`, data);
    const responseData = response.data.data;
    console.log(`Dữ liệu response data: ${JSON.stringify(responseData, null, 2)}`);
    return {
      user: responseData.user,
      access_token: responseData.tokens.access_token,
      refresh_token: responseData.tokens.refresh_token,
      message: responseData.message,
    };
  },

  // Google OAuth2 with ID Token
  signInWithGoogleToken: async (data: GoogleAuthRequest): Promise<AuthResponse> => {
    const response = await axiosPublic.post(`${GOOGLE_AUTH}`, data);
    const responseData = response.data.data;

    return {
      user: responseData.user,
      access_token: responseData.tokens.access_token,
      refresh_token: responseData.tokens.refresh_token,
    };
  },

  //Update Profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const response = await axiosPrivate.patch(`${UPDATE_PROFILE}`, data);
    const responseData = response.data.data;
    return {
      user: responseData.user,
    };
  },
};
