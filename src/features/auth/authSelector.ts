import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import { UserRole } from './authType';

// Base selector
const selectAuthState = (state: RootState) => state.auth;

// ========================
// BASIC SELECTORS - Lấy trực tiếp từ state
// ========================
export const selectUser = createSelector([selectAuthState], auth => auth.user);

export const selectUserId = createSelector([selectAuthState], auth => auth._id);

export const selectToken = createSelector([selectAuthState], auth => auth.token);

export const selectAuthLoading = createSelector([selectAuthState], auth => auth.loading);

export const selectAuthError = createSelector([selectAuthState], auth => auth.error);

export const selectVerifyStatus = createSelector([selectAuthState], auth => auth.verifyStatus);

export const selectVerifyMessage = createSelector([selectAuthState], auth => auth.verifyMessage);

// ========================
// COMPUTED SELECTORS - Tính toán từ state
// ========================
export const selectIsAuthenticated = createSelector(
  [selectUser, selectToken],
  (user, token) => !!(user && token)
);

export const selectUserRole = createSelector([selectUser], user => user?.role || UserRole.Guest);

export const selectUserFullName = createSelector([selectUser], user => user?.fullName || '');

export const selectUserEmail = createSelector([selectUser], user => user?.email || '');

export const selectUserAvatar = createSelector([selectUser], user => user?.avatarUrl || '');

export const selectUserStatus = createSelector([selectUser], user => user?.status);

export const selectUserPhone = createSelector([selectUser], user => user?.phoneNumber || '');

export const selectUserAddress = createSelector([selectUser], user => user?.address || '');

export const selectUserGender = createSelector([selectUser], user => user?.gender);

export const selectUserDob = createSelector([selectUser], user => user?.dob);

// ========================
// ROLE-BASED SELECTORS - Kiểm tra role
// ========================
export const selectIsAdmin = createSelector([selectUserRole], role => role === UserRole.Admin);

export const selectIsCustomer = createSelector(
  [selectUserRole],
  role => role === UserRole.Customer
);

export const selectIsGuest = createSelector([selectUserRole], role => role === UserRole.Guest);

// ========================
// STATUS SELECTORS - Kiểm tra trạng thái
// ========================
export const selectIsVerifying = createSelector(
  [selectVerifyStatus],
  status => status === 'pending'
);

export const selectIsVerifySuccess = createSelector(
  [selectVerifyStatus],
  status => status === 'success'
);

export const selectIsVerifyError = createSelector(
  [selectVerifyStatus],
  status => status === 'error'
);

export const selectIsUserActive = createSelector([selectUser], user => user?.isActive || false);

// ========================
// COMBINED SELECTORS - Kết hợp nhiều selector
// ========================
export const selectAuthInfo = createSelector(
  [selectUser, selectToken, selectAuthLoading, selectAuthError, selectIsAuthenticated],
  (user, token, loading, error, isAuthenticated) => ({
    user,
    token,
    loading,
    error,
    isAuthenticated,
  })
);

export const selectUserProfile = createSelector([selectUser], user => {
  if (!user) return null;

  return {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    gender: user.gender,
    dob: user.dob,
    phoneNumber: user.phoneNumber,
    address: user.address,
    status: user.status,
    createdAt: user.createdAt,
    isActive: user.isActive,
  };
});

export const selectUserSummary = createSelector(
  [selectUserFullName, selectUserEmail, selectUserRole, selectIsAuthenticated],
  (fullName, email, role, isAuthenticated) => ({
    fullName,
    email,
    role,
    isAuthenticated,
  })
);

// ========================
// ERROR SELECTORS - Xử lý lỗi
// ========================
export const selectHasAuthError = createSelector([selectAuthError], error => !!error);

export const selectAuthErrorMessage = createSelector(
  [selectAuthError],
  error => error?.message || ''
);

export const selectAuthErrorStatus = createSelector([selectAuthError], error => error?.status);
