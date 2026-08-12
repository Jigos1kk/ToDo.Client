/**
 * Модель данных ToDo.Auth API (ASP.NET сериализует JSON в camelCase).
 */

export type RoleName = 'User' | 'Admin' | 'Customer' | 'Freelancer';

/** Роли, доступные при самостоятельной регистрации. */
export type RegistrationRole = Extract<RoleName, 'Customer' | 'Freelancer'>;

export interface User {
  id: string;
  email: string;
  userName: string;
  emailConfirmed: boolean;
  roles: RoleName[];
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  userName: string;
  password: string;
  role: RegistrationRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}
