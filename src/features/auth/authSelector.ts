import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

// Base selector
const selectAuthState = (state: RootState) => state.auth;

// ========================
// BASIC SELECTORS - Lấy trực tiếp từ state
// ========================
export const selectUser = createSelector([selectAuthState], auth => auth.user);

export const selectAccessToken = createSelector([selectAuthState], auth => auth.accessToken);

export const selectRefreshToken = createSelector([selectAuthState], auth => auth.refreshToken);

export const selectAuthLoading = createSelector([selectAuthState], auth => auth.isLoading);

export const selectAuthError = createSelector([selectAuthState], auth => auth.error);

export const selectIsAuthenticated = createSelector([selectAuthState], auth => auth.isAuthenticated);

// ========================
// COMPUTED SELECTORS - Tính toán từ state
// ========================
export const selectUserRole = createSelector([selectUser], user => user?.role || 'GUEST');

export const selectUserFullName = createSelector([selectUser], user => user?.name || '');

export const selectUserEmail = createSelector([selectUser], user => user?.email || '');

export const selectUserAvatar = createSelector([selectUser], user => user?.avatar || '');

export const selectUserPhone = createSelector([selectUser], user => user?.phone || '');

export const selectUserAddress = createSelector([selectUser], user => user?.address || '');

export const selectUserDateOfBirth = createSelector([selectUser], user => user?.dateOfBirth);

export const selectUserStatus = createSelector([selectUser], user => user?.status);

export const selectIsUserVerified = createSelector([selectUser], user => user?.isVerified || false);

// ========================
// ROLE-BASED SELECTORS - Kiểm tra role
// ========================
export const selectIsAdmin = createSelector([selectUserRole], role => role === 'ADMIN');

export const selectIsCustomer = createSelector([selectUserRole], role => role === 'CUSTOMER');

export const selectIsGuest = createSelector([selectUserRole], role => !role || role === 'GUEST');

// ========================
// STATUS SELECTORS - Kiểm tra trạng thái
// ========================
export const selectIsUserActive = createSelector([selectUser], user => user?.isActive || false);

// ========================
// COMBINED SELECTORS - Kết hợp nhiều selector
// ========================
export const selectAuthInfo = createSelector(
  [selectUser, selectAccessToken, selectAuthLoading, selectAuthError, selectIsAuthenticated],
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
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    phone: user.phone,
    address: user.address,
    dateOfBirth: user.dateOfBirth,
    isVerified: user.isVerified,
    status: user.status,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
});

export const selectUserSummary = createSelector(
  [selectUserFullName, selectUserEmail, selectUserRole, selectIsAuthenticated],
  (name, email, role, isAuthenticated) => ({
    name,
    email,
    role,
    isAuthenticated,
  })
);

// ========================
// ERROR SELECTORS - Xử lý lỗi
// ========================
export const selectHasAuthError = createSelector([selectAuthError], error => !!error);

export const selectAuthErrorMessage = createSelector([selectAuthError], error => error || '');

// Legacy selectors for backward compatibility
export const selectVerifyStatus = createSelector([selectAuthState], () => undefined);
export const selectVerifyMessage = createSelector([selectAuthState], () => '');
