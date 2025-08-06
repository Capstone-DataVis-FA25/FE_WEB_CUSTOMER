import { axiosPublic } from '@/services/axios';
import type { SignInRequest, SignUpRequest } from './authType';

const SIGN_IN = '/auth/sign-in';
const SIGN_UP = '/auth/sign-up';
// const GOOGLE_AUTH = '/auth/google/callback';
// const GOOGLE_SIGN_UP = '/auth/google';

export const authAPI = {
  signInWithEmailPassword: async (data: SignInRequest): Promise<any> => {
    const response = await axiosPublic.post(`${SIGN_IN}`, data);
    return response.data;
  },
  signUpWithEmailPassword: async (data: SignUpRequest): Promise<any> => {
    const response = await axiosPublic.post(`${SIGN_UP}`, data);
    return response.data;
  },
};
