export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'Customer' | string;
  token?: string;
}

export interface AuthResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}
