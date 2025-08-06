export const UserRole = {
  Admin: 'admin',
  Customer: 'customer',
  Guest: 'guest',
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

export interface User {
  _id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  gender?: UserGender;
  dob?: string;
  phoneNumber?: string;
  address?: string;
  status: UserStatus;
  createdAt: Date;
  isActive: true;
}

export interface AuthResponse {
  data: any;
  user: User;
  access_token: string;
  refresh_token: string;
}
