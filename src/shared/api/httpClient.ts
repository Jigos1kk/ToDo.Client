import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import type { AxiosError } from 'axios';

import { env } from '@/shared/config/env';
import { tokenStorage } from '@/shared/lib/storage';

/** Ответ бэкенда при ошибках бизнес-логики и валидации ASP.NET. */
interface ApiErrorBody {
  error?: string;
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Вытаскивает человекочитаемое сообщение из ответа API. */
export function getApiErrorMessage(error: unknown, fallback = 'Что-то пошло не так.'): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error) return body.error;
    if (body?.message) return body.message;
    if (body?.errors) {
      const first = Object.values(body.errors).flat()[0];
      if (first) return first;
    }
    if (body?.title) return body.title;
    if (error.code === 'ERR_NETWORK') return 'Сервер недоступен. Проверьте, что API запущен.';
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export const httpClient = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
});

// ---------- Подстановка access-токена ----------

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token && !config.url?.startsWith(`${env.authApiUrl}/`)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Автоматическое обновление токенов (single-flight) ----------

type UnauthorizedListener = () => void;
let onUnauthorizedListener: UnauthorizedListener | null = null;

/** Вызывается, когда refresh-токен недействителен — нужно разлогинить пользователя. */
export function setOnUnauthorized(listener: UnauthorizedListener): void {
  onUnauthorizedListener = listener;
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new ApiError('Сессия истекла.', 401);

  // Отдельный экземпляр без интерсепторов, чтобы не зациклиться
  const { data } = await axios.post<{
    accessToken: string;
    accessTokenExpiresAt: string;
    refreshToken: string;
    refreshTokenExpiresAt: string;
  }>(`${env.authApiUrl}/refresh`, { refreshToken });

  tokenStorage.setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
  });
  return data.accessToken;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthEndpoint = originalRequest?.url?.startsWith(`${env.authApiUrl}/`) ?? false;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      isAuthEndpoint ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` };
      return await httpClient(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();
      onUnauthorizedListener?.();
      return Promise.reject(refreshError instanceof Error ? refreshError : new ApiError('Не удалось обновить сессию.', 401));
    }
  },
);
