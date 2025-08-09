import { axiosPublic } from '@/services/axios';
import type { SignInRequest, SignUpRequest, AuthResponse } from './authType';

const SIGN_IN = '/auth/signin';
const SIGN_UP = '/auth/signup';
// const GOOGLE_AUTH = '/auth/google/callback';
// const GOOGLE_SIGN_UP = '/auth/google';

export const authAPI = {
  signInWithEmailPassword: async (data: SignInRequest): Promise<AuthResponse> => {
    const response = await axiosPublic.post(`${SIGN_IN}`, data);
    return response.data;
  },
  signUpWithEmailPassword: async (data: SignUpRequest): Promise<AuthResponse> => {
    const response = await axiosPublic.post(`${SIGN_UP}`, data);
    return response.data;
  },
};
