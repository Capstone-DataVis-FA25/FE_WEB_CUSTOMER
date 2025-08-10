// ## ENUM VALUE

export const UserRole = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  GUEST: 'GUEST',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ## MODEL
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  currentHashedRefreshToken: string;
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
}

// ## INITSTATE - Dựa theo initialState trong authSlice
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
