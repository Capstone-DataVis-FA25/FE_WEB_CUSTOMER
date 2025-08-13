import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import {
  selectAuthInfo,
  selectUser,
  selectUserRole,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectUserProfile,
  selectIsAdmin,
  selectIsUser,
  selectIsGuest,
  selectVerifyStatus,
  selectVerifyMessage,
  selectDeleteUserStatus,
  selectDeleteUserError,
  selectAuthSuccessMessage,
} from './authSelector';
import { logout, clearError, setLoading  } from './authSlice';
import { signInThunk, signUpThunk, signInWithGoogleThunk, updateProfileThunk,deleteUserThunk } from './authThunk';
import type { SignInRequest, SignUpRequest, GoogleAuthRequest, User } from './authType';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const authInfo = useSelector(selectAuthInfo);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const userProfile = useSelector(selectUserProfile);
  const verifyStatus = useSelector(selectVerifyStatus);
  const verifyMessage = useSelector(selectVerifyMessage);
  const successMessage = useSelector(selectAuthSuccessMessage);
  const deleteUserStatus = useSelector(selectDeleteUserStatus);
  const deleteUserError = useSelector(selectDeleteUserError);

  // Role checks
  const isAdmin = useSelector(selectIsAdmin);
  const isUser = useSelector(selectIsUser);
  const isGuest = useSelector(selectIsGuest);

  // Actions
  const signIn = (data: SignInRequest) => {
    return dispatch(signInThunk(data));
  };

  const signInWithGoogle = (data: GoogleAuthRequest) => {
    return dispatch(signInWithGoogleThunk(data));
  };

  const signUp = (data: SignUpRequest) => {
    return dispatch(signUpThunk(data));
  };

  const deleteUser = (userId: string) => {
    return dispatch(deleteUserThunk(userId));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const updateProfile = (data: Partial<User>) => {
    dispatch(updateProfileThunk(data));
  };

  const setAuthLoading = (loading: boolean) => {
    dispatch(setLoading(loading));
  };

  return {
    // State - Trạng thái hiện tại
    user, // User object hoặc null
    token: authInfo.token, // JWT token hoặc null
    isLoading, // Boolean - đang loading API call
    error, // Error string hoặc null
    isAuthenticated, // Boolean - user đã login chưa
    userRole, // String - role của user (admin/user/guest)
    userProfile, // Formatted user profile object
    verifyStatus, // undefined (legacy)
    verifyMessage, // '' (legacy)
    deleteUserStatus, // Trạng thái xóa user
    deleteUserError, // Lỗi xóa user
    successMessage, // Thông báo thành công
    // Role checks - Boolean flags
    isAdmin, // Boolean - user có phải admin không
    isUser, // Boolean - user có phải user không
    isGuest, // Boolean - user có phải guest không

    // Actions - Functions để thực hiện actions
    signIn, // Function(data: SignInRequest) => Promise
    signUp, // Function(data: SignUpRequest) => Promise
    deleteUser,// Function(userId: string) => Promise
    signInWithGoogle,// Function(data: GoogleAuthRequest) => Promise 
    logout: logoutUser, // Function() => void - logout và clear localStorage
    clearError: clearAuthError, // Function() => void - clear error state
    updateUserProfile: updateProfile, // Function(data: Partial<User>) => void
    setLoading: setAuthLoading, // Function(boolean) => void - set loading manually
  };
};
