import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import type { AxiosResponse } from 'axios';
import { axiosPublic, axiosPrivate } from '../../services/axios';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
  getUserProfileStart,
  getUserProfileSuccess,
  getUserProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} from '../slices/authSlice';

// Types
interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

// API calls
export const authAPI = {
  login: (credentials: LoginPayload) => axiosPublic.post('/auth/login_customer', credentials),

  register: (userData: RegisterPayload) => axiosPublic.post('/auth/register', userData),

  logout: () => axiosPrivate.post('/auth/logout'),

  refreshToken: (refreshToken: string) => axiosPublic.post('/auth/refresh', { refreshToken }),

  getUserProfile: () => axiosPrivate.get('/auth/profile'),

  updateProfile: (profileData: UpdateProfilePayload) =>
    axiosPrivate.put('/auth/profile', profileData),
};

// Saga workers
function* loginSaga(action: PayloadAction<LoginPayload>): Generator<any, void, any> {
  try {
    const response: AxiosResponse = yield call(authAPI.login, action.payload);
    const { user, accessToken, refreshToken } = response.data.Data;

    // Lưu tokens vào localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    yield put(loginSuccess({ user, accessToken, refreshToken }));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
    yield put(loginFailure(errorMessage));
  }
}

function* registerSaga(action: PayloadAction<RegisterPayload>) {
  try {
    const response: AxiosResponse = yield call(authAPI.register, action.payload);
    const { user, accessToken, refreshToken } = response.data;

    // Lưu tokens vào localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    yield put(registerSuccess({ user, accessToken, refreshToken }));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
    yield put(registerFailure(errorMessage));
  }
}

function* logoutSaga() {
  try {
    // Xóa tokens khỏi localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    yield put(logoutSuccess());
  } catch (error: any) {
    // Dù có lỗi vẫn logout ở client
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    const errorMessage = error.response?.data?.message || 'Đăng xuất thất bại';
    yield put(logoutFailure(errorMessage));
  }
}

function* refreshTokenSaga(action: PayloadAction<string>) {
  try {
    const response: AxiosResponse = yield call(authAPI.refreshToken, action.payload);
    const { accessToken, refreshToken } = response.data;

    // Cập nhật tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    yield put(refreshTokenSuccess({ accessToken, refreshToken }));
  } catch (error: any) {
    // Refresh token hết hạn, logout user
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    const errorMessage = error.response?.data?.message || 'Refresh token thất bại';
    yield put(refreshTokenFailure(errorMessage));
  }
}

function* getUserProfileSaga() {
  try {
    const response: AxiosResponse = yield call(authAPI.getUserProfile);
    const user = response.data;

    yield put(getUserProfileSuccess(user));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Lấy thông tin người dùng thất bại';
    yield put(getUserProfileFailure(errorMessage));
  }
}

function* updateProfileSaga(action: PayloadAction<UpdateProfilePayload>) {
  try {
    const response: AxiosResponse = yield call(authAPI.updateProfile, action.payload);
    const user = response.data;

    yield put(updateProfileSuccess(user));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Cập nhật thông tin thất bại';
    yield put(updateProfileFailure(errorMessage));
  }
}

// Watcher saga
export default function* authSaga() {
  yield takeLatest(loginStart.type, loginSaga);
  yield takeLatest(registerStart.type, registerSaga);
  yield takeLatest(logoutStart.type, logoutSaga);
  yield takeLatest(refreshTokenStart.type, refreshTokenSaga);
  yield takeLatest(getUserProfileStart.type, getUserProfileSaga);
  yield takeLatest(updateProfileStart.type, updateProfileSaga);
}
