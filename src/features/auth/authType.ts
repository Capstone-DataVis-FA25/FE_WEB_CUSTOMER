// ## ENUM VALUE

export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER', // Updated to match API response
  CUSTOMER: 'CUSTOMER', // Keep for backward compatibility
  GUEST: 'GUEST',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ## MODEL
export interface User {
  _id?: string; // Optional for backward compatibility
  id: string; // New primary ID field
  firstName: string;
  lastName: string;
  email: string;
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

// ## RESPONSE
export interface AuthResponse {
  code: number;
  message: string;
  data: {
    user: User;
    tokens: {
      access_token: string;
      refresh_token: string;
    };
  };
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
