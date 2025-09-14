import { axiosPrivate, axiosPublic } from '@/services/axios';
import type {
  SignInRequest,
  SignUpRequest,
  GoogleAuthRequest,
  AuthResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ResendEmailRequest,
  ResendEmailResponse,
  RefreshTokenResponse,
} from './authType';

const SIGN_IN = '/auth/signin';
const SIGN_UP = '/auth/signup';
const GOOGLE_AUTH = '/auth/google/token';
const CHANGE_PASSWORD = '/users/me/change-password';
const FORGOT_PASSWORD = '/auth/forgot-password';
const RESET_PASSWORD = '/auth/reset-password';
const REFRESH_TOKEN = '/auth/refresh';
const UPDATE_PROFILE = 'users/me/update-profile';
const VIEW_PROFILE = 'users/me';
const DELETE_USER = '/users';
const RESEND_VERIFY_EMAIL = '/auth/resend-verify-email';

export const authAPI = {
  signInWithEmailPassword: async (data: SignInRequest): Promise<AuthResponse> => {
    const response = await axiosPublic.post(`${SIGN_IN}`, data);
    const responseData = response.data.data; // data: {}

    return {
      user: responseData.user,
      access_token: responseData.tokens.access_token,
      refresh_token: responseData.tokens.refresh_token,
    };
  },
  signUpWithEmailPassword: async (data: SignUpRequest): Promise<AuthResponse> => {
    const response = await axiosPublic.post(`${SIGN_UP}`, data);
    const responseData = response.data.data;
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

  //View Profile
  viewProfile: async (): Promise<UpdateProfileResponse> => {
    const response = await axiosPrivate.get(`${VIEW_PROFILE}`);
    const responseData = response.data.data;
    return {
      user: responseData,
    };
  },

  deleteUser: async (userId: string, email: string): Promise<{ message: string }> => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) throw new Error('Access token is missing. Vui lòng đăng nhập lại.');
    const response = await axiosPrivate.request({
      url: `${DELETE_USER}/${userId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: { email },
    });
    return { message: response.data.message };
  },
  //Change password
  changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<void> => {
    await axiosPrivate.patch(`${CHANGE_PASSWORD}`, {
      old_password: data.oldPassword,
      new_password: data.newPassword,
      confirm_password: data.newPassword,
    });
  },
  // Forgot Password
  forgotPassword: async (data: { email: string }): Promise<void> => {
    await axiosPublic.post(`${FORGOT_PASSWORD}`, data);
  },

  // Reset Password
  resetPassword: async (data: { password: string; token: string }): Promise<void> => {
    await axiosPublic.post(`${RESET_PASSWORD}`, {
      newPassword: data.password,
      token: data.token,
    });
  },

  // Resend verify email
  resendVerifyEmail: async (data: ResendEmailRequest): Promise<ResendEmailResponse> => {
    const response = await axiosPublic.post(`${RESEND_VERIFY_EMAIL}`, data);
    return { message: response.data.message };
  },

  // Refresh token
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await axiosPrivate.post(REFRESH_TOKEN);
    return response.data;
  }

};
