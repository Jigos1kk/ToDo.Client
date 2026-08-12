const getEnv = (key: string): string | undefined =>
  (import.meta.env as Record<string, string | undefined>)[key];

export const env = {
  authApiUrl: getEnv('VITE_AUTH_API_URL') ?? '/api/auth',
  coreApiUrl: getEnv('VITE_CORE_API_URL') ?? '/api',
} as const;