### AUTH SELECTORS

#### Cách sử dụng trong components:

```bash
- // 1. Import selector cần dùng
- import { useSelector } from 'react-redux';
- import { selectUser, selectIsAuthenticated, selectUserRole } from '@/features/auth/authSelector';
```

```bash
- // 2. Sử dụng trong component
- const MyComponent = () => {
- const user = useSelector(selectUser);
- const isAuth = useSelector(selectIsAuthenticated);
- const role = useSelector(selectUserRole);
-
- if (!isAuth) return <LoginForm />;
-
- return (
-     <div>
-       <h1>Welcome {user?.fullName}</h1>
-       <p>Role: {role}</p>
-     </div>
- );
- };
```

```bash
- // 3. Sử dụng role-based selectors
- const AdminPanel = () => {
- const isAdmin = useSelector(selectIsAdmin);
- const isCustomer = useSelector(selectIsCustomer);
-
- if (!isAdmin) return <div>Access denied</div>;
- return <AdminDashboard />;
- };
```

```bash
- // 4. Sử dụng combined selectors
- const ProfileCard = () => {
- const userProfile = useSelector(selectUserProfile);
- const authInfo = useSelector(selectAuthInfo);
-
- return (
-     <div>
-       {userProfile && (
-         <div>
-           <img src={userProfile.avatarUrl} />
-           <h3>{userProfile.fullName}</h3>
-           <p>{userProfile.email}</p>
-         </div>
-       )}
-     </div>
- );
- };
```

```bash
- // 5. Error handling
- const ErrorDisplay = () => {
- const hasError = useSelector(selectHasAuthError);
- const errorMessage = useSelector(selectAuthErrorMessage);
-
- if (!hasError) return null;
-
- return <div className="error">{errorMessage}</div>;
- };
```

### USE AUTH HOOK

- Custom hook tổng hợp tất cả auth logic, dễ sử dụng hơn việc import nhiều selector/action riêng lẻ
- Cách sử dụng trong components:

```bash
- // 1. Import hook
- import { useAuth } from '@/features/auth/useAuth';
```

```bash
- // 2. Sử dụng cơ bản
- const LoginPage = () => {
- const { signIn, loading, error, clearError } = useAuth();
-
- const handleSubmit = async (data: SignInRequest) => {
-     try {
-       await signIn(data);
-       // Redirect after successful login
-       navigate('/dashboard');
-     } catch (err) {
-       // Error handled automatically by thunk
-     }
- };
-
- return (
-     <form onSubmit={handleSubmit}>
-       {error && (
-         <div className="error">
-           {error.message}
-           <button onClick={clearError}>×</button>
-         </div>
-       )}
-       <input type="email" name="email" />
-       <input type="password" name="password" />
-       <button type="submit" disabled={loading}>
-         {loading ? 'Signing in...' : 'Sign In'}
-       </button>
-     </form>
- );
- };
```

```bash
- // 3. Conditional rendering dựa trên auth state
- const App = () => {
- const { isAuthenticated, user, loading } = useAuth();
-
- if (loading) return <LoadingSpinner />;
-
- return (
-     <div>
-       {isAuthenticated ? (
-         <AuthenticatedApp user={user} />
-       ) : (
-         <PublicApp />
-       )}
-     </div>
- );
- };
```

```bash
- // 4. Role-based access control
- const AdminDashboard = () => {
- const { isAdmin, isCustomer, userRole } = useAuth();
-
- if (!isAdmin) {
-     return <div>Access denied. Admin role required.</div>;
- }
-
- return <AdminContent />;
- };
```

```bash
- // 5. Profile management
- const ProfilePage = () => {
- const { user, updateUserProfile, userProfile } = useAuth();
-
- const handleUpdate = (formData: Partial<User>) => {
-     updateUserProfile(formData);
- };
-
- return (
-     <div>
-       <h1>{userProfile?.fullName}</h1>
-       <ProfileForm
-         initialData={userProfile}
-         onSubmit={handleUpdate}
-       />
-     </div>
- );
- };
```

```bash
- // 6. Logout functionality
- const Header = () => {
- const { isAuthenticated, user, logout } = useAuth();
-
- const handleLogout = () => {
-     logout(); // Automatically clears localStorage
-     navigate('/login');
- };
-
- return (
-     <header>
-       {isAuthenticated ? (
-         <div>
-           <span>Welcome, {user?.fullName}</span>
-           <button onClick={handleLogout}>Logout</button>
-         </div>
-       ) : (
-         <Link to="/login">Login</Link>
-       )}
-     </header>
- );
- };
```

```bash
- // 7. Sign up with verification
- const SignUpPage = () => {
- const {
-     signUp,
-     loading,
-     error,
-     verifyStatus,
-     verifyMessage,
-     clearVerifyStatus
- } = useAuth();
-
- const handleSignUp = async (data: SignUpRequest) => {
-     await signUp(data);
- };
-
- return (
-     <div>
-       {verifyStatus === 'success' && (
-         <div className="success">
-           {verifyMessage}
-           <button onClick={clearVerifyStatus}>×</button>
-         </div>
-       )}
-       <SignUpForm onSubmit={handleSignUp} loading={loading} />
-     </div>
- );
- };
```

```bash
- // 8. Route protection
- const ProtectedRoute = ({ children, requiredRole }: {
- children: React.ReactNode;
- requiredRole?: string;
- }) => {
- const { isAuthenticated, userRole, loading } = useAuth();
-
- if (loading) return <LoadingSpinner />;
-
- if (!isAuthenticated) {
-     return <Navigate to="/login" replace />;
- }
-
- if (requiredRole && userRole !== requiredRole) {
-     return <Navigate to="/forbidden" replace />;
- }
-
- return <>{children}</>;
- };
```
