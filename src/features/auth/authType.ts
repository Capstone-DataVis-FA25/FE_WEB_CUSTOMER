// ## ENUM VALUE

export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER', // Updated to match API response
  GUEST: 'GUEST',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ## MODEL
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isVerified?: boolean; // Optional since not in response
  currentHashedRefreshToken: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ## REQUEST
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

// ## RESPONSE
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  verify_token?: string;
  message?: string;
}

// ## INITSTATE - Dựa theo initialState trong authSlice
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage?: string | null;
  deleteUserStatus?: 'idle' | 'pending' | 'success' | 'error';
  deleteUserError?: string | null;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  user: User;
}
