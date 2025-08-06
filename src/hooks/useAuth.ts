import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loginStart,
  registerStart,
  logoutStart,
  refreshTokenStart,
  getUserProfileStart,
  updateProfileStart,
  clearError,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
} from '../store/slices/authSlice';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

// Auth hook
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const login = useCallback(
    (credentials: LoginCredentials) => {
      dispatch(loginStart(credentials));
    },
    [dispatch]
  );

  const register = useCallback(
    (userData: RegisterData) => {
      dispatch(registerStart(userData));
    },
    [dispatch]
  );
  const logout = useCallback(() => {
    dispatch(logoutStart());
  }, [dispatch]);

  const refreshToken = useCallback(
    (refreshToken: string) => {
      dispatch(refreshTokenStart(refreshToken));
    },
    [dispatch]
  );

  const getUserProfile = useCallback(() => {
    dispatch(getUserProfileStart());
  }, [dispatch]);

  const updateProfile = useCallback(
    (profileData: UpdateProfileData) => {
      dispatch(updateProfileStart(profileData));
    },
    [dispatch]
  );
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Helper functions
  const hasPermission = useCallback(
    (_permission: string): boolean => {
      if (!user) return false;
      // Implement permission checking logic based on user role
      // This should match your backend permission system
      return true; // Simplified for now
    },
    [user]
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      if (!user) return false;
      return user.role === role;
    },
    [user]
  );
  const isAdmin = useCallback((): boolean => {
    return hasRole('ADMIN');
  }, [hasRole]);

  const isCustomer = useCallback((): boolean => {
    return hasRole('CUSTOMER');
  }, [hasRole]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    auth,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    getUserProfile,
    updateProfile,
    clearAuthError,

    // Helper functions
    hasPermission,
    hasRole,
    isAdmin,
    isCustomer,
  };
};
