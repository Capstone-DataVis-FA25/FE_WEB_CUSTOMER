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
  selectIsCustomer,
  selectIsGuest,
  selectVerifyStatus,
  selectVerifyMessage,
} from './authSelector';
import { logout, clearError, clearVerifyStatus, updateUserProfile, setLoading } from './authSlice';
import { signInThunk, signUpThunk } from './authThunk';
import type { SignInRequest, SignUpRequest, User } from './authType';

/**
 * USE AUTH HOOK
 *
 * Custom hook tổng hợp tất cả auth logic, dễ sử dụng hơn việc import nhiều selector/action riêng lẻ
 *
 * Cách sử dụng trong components:
 *
 * // 1. Import hook
 * import { useAuth } from '@/features/auth/useAuth';
 *
 * // 2. Sử dụng cơ bản
 * const LoginPage = () => {
 *   const { signIn, loading, error, clearError } = useAuth();
 *
 *   const handleSubmit = async (data: SignInRequest) => {
 *     try {
 *       await signIn(data);
 *       // Redirect after successful login
 *       navigate('/dashboard');
 *     } catch (err) {
 *       // Error handled automatically by thunk
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && (
 *         <div className="error">
 *           {error.message}
 *           <button onClick={clearError}>×</button>
 *         </div>
 *       )}
 *       <input type="email" name="email" />
 *       <input type="password" name="password" />
 *       <button type="submit" disabled={loading}>
 *         {loading ? 'Signing in...' : 'Sign In'}
 *       </button>
 *     </form>
 *   );
 * };
 *
 * // 3. Conditional rendering dựa trên auth state
 * const App = () => {
 *   const { isAuthenticated, user, loading } = useAuth();
 *
 *   if (loading) return <LoadingSpinner />;
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <AuthenticatedApp user={user} />
 *       ) : (
 *         <PublicApp />
 *       )}
 *     </div>
 *   );
 * };
 *
 * // 4. Role-based access control
 * const AdminDashboard = () => {
 *   const { isAdmin, isCustomer, userRole } = useAuth();
 *
 *   if (!isAdmin) {
 *     return <div>Access denied. Admin role required.</div>;
 *   }
 *
 *   return <AdminContent />;
 * };
 *
 * // 5. Profile management
 * const ProfilePage = () => {
 *   const { user, updateUserProfile, userProfile } = useAuth();
 *
 *   const handleUpdate = (formData: Partial<User>) => {
 *     updateUserProfile(formData);
 *   };
 *
 *   return (
 *     <div>
 *       <h1>{userProfile?.fullName}</h1>
 *       <ProfileForm
 *         initialData={userProfile}
 *         onSubmit={handleUpdate}
 *       />
 *     </div>
 *   );
 * };
 *
 * // 6. Logout functionality
 * const Header = () => {
 *   const { isAuthenticated, user, logout } = useAuth();
 *
 *   const handleLogout = () => {
 *     logout(); // Automatically clears localStorage
 *     navigate('/login');
 *   };
 *
 *   return (
 *     <header>
 *       {isAuthenticated ? (
 *         <div>
 *           <span>Welcome, {user?.fullName}</span>
 *           <button onClick={handleLogout}>Logout</button>
 *         </div>
 *       ) : (
 *         <Link to="/login">Login</Link>
 *       )}
 *     </header>
 *   );
 * };
 *
 * // 7. Sign up with verification
 * const SignUpPage = () => {
 *   const {
 *     signUp,
 *     loading,
 *     error,
 *     verifyStatus,
 *     verifyMessage,
 *     clearVerifyStatus
 *   } = useAuth();
 *
 *   const handleSignUp = async (data: SignUpRequest) => {
 *     await signUp(data);
 *   };
 *
 *   return (
 *     <div>
 *       {verifyStatus === 'success' && (
 *         <div className="success">
 *           {verifyMessage}
 *           <button onClick={clearVerifyStatus}>×</button>
 *         </div>
 *       )}
 *       <SignUpForm onSubmit={handleSignUp} loading={loading} />
 *     </div>
 *   );
 * };
 *
 * // 8. Route protection
 * const ProtectedRoute = ({ children, requiredRole }: {
 *   children: React.ReactNode;
 *   requiredRole?: string;
 * }) => {
 *   const { isAuthenticated, userRole, loading } = useAuth();
 *
 *   if (loading) return <LoadingSpinner />;
 *
 *   if (!isAuthenticated) {
 *     return <Navigate to="/login" replace />;
 *   }
 *
 *   if (requiredRole && userRole !== requiredRole) {
 *     return <Navigate to="/forbidden" replace />;
 *   }
 *
 *   return <>{children}</>;
 * };
 */

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const authInfo = useSelector(selectAuthInfo);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const userProfile = useSelector(selectUserProfile);
  const verifyStatus = useSelector(selectVerifyStatus);
  const verifyMessage = useSelector(selectVerifyMessage);

  // Role checks
  const isAdmin = useSelector(selectIsAdmin);
  const isCustomer = useSelector(selectIsCustomer);
  const isGuest = useSelector(selectIsGuest);

  // Actions
  const signIn = (data: SignInRequest) => {
    return dispatch(signInThunk(data));
  };

  const signUp = (data: SignUpRequest) => {
    return dispatch(signUpThunk(data));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const clearVerify = () => {
    dispatch(clearVerifyStatus());
  };

  const updateProfile = (data: Partial<User>) => {
    dispatch(updateUserProfile(data));
  };

  const setAuthLoading = (isLoading: boolean) => {
    dispatch(setLoading(isLoading));
  };

  return {
    // State - Trạng thái hiện tại
    user, // User object hoặc null
    token: authInfo.token, // JWT token hoặc null
    loading, // Boolean - đang loading API call
    error, // Error object hoặc null
    isAuthenticated, // Boolean - user đã login chưa
    userRole, // String - role của user (Admin/Customer/Guest)
    userProfile, // Formatted user profile object
    verifyStatus, // 'pending' | 'success' | 'error' | undefined
    verifyMessage, // String - message từ verify process

    // Role checks - Boolean flags
    isAdmin, // Boolean - user có phải admin không
    isCustomer, // Boolean - user có phải customer không
    isGuest, // Boolean - user có phải guest không

    // Actions - Functions để thực hiện actions
    signIn, // Function(data: SignInRequest) => Promise
    signUp, // Function(data: SignUpRequest) => Promise
    logout: logoutUser, // Function() => void - logout và clear localStorage
    clearError: clearAuthError, // Function() => void - clear error state
    clearVerifyStatus: clearVerify, // Function() => void - clear verify status
    updateUserProfile: updateProfile, // Function(data: Partial<User>) => void
    setLoading: setAuthLoading, // Function(boolean) => void - set loading manually
  };
};
