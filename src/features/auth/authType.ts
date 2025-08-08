// ## ENUM VALUE

export const UserRole = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  GUEST: 'GUEST',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserGender = {
  Male: 'Male',
  Female: 'Female',
  Other: 'Other',
} as const;

export type UserGender = (typeof UserGender)[keyof typeof UserGender];

export const UserStatus = {
  Active: 'ACTIVE',
  Locked: 'LOCKED',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// ## MODEL
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatar?: string;
  role: 'CUSTOMER' | 'ADMIN';
  isVerified: boolean;
  status: UserStatus;
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
  name: string;
  phone?: string;
}

// ## RESPONSE
export interface AuthResponse {
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
  };
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