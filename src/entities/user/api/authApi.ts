import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/api/httpClient';

import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  User,
} from '../model/types';

/** Тонкий клиент ToDo.Auth API. */
export const authApi = {
  /** Регистрация. Токены не выдаются — сначала нужно подтвердить email. */
  async register(request: RegisterRequest): Promise<User> {
    const { data } = await httpClient.post<User>(`${env.authApiUrl}/register`, request);
    return data;
  },

  /** Подтверждение email по токену из письма. */
  async confirmEmail(token: string): Promise<User> {
    const { data } = await httpClient.post<User>(`${env.authApiUrl}/confirm-email`, { token });
    return data;
  },

  /** Вход. Возвращает пару токенов и профиль. */
  async login(request: LoginRequest): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>(`${env.authApiUrl}/login`, request);
    return data;
  },

  /** Профиль текущего пользователя. */
  async me(): Promise<User> {
    const { data } = await httpClient.get<User>(`${env.authApiUrl}/me`);
    return data;
  },

  /** Смена пароля (требует текущий пароль). */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await httpClient.post(`${env.authApiUrl}/change-password`, request);
  },

  /** Запрос письма для восстановления пароля. Всегда успешен. */
  async forgotPassword(email: string): Promise<MessageResponse> {
    const { data } = await httpClient.post<MessageResponse>(`${env.authApiUrl}/forgot-password`, {
      email,
    });
    return data;
  },

  /** Сброс пароля по одноразовому токену из письма. */
  async resetPassword(token: string, newPassword: string): Promise<MessageResponse> {
    const { data } = await httpClient.post<MessageResponse>(`${env.authApiUrl}/reset-password`, {
      token,
      newPassword,
    });
    return data;
  },
};
