const ACCESS_TOKEN_KEY = 'todo.accessToken';
const REFRESH_TOKEN_KEY = 'todo.refreshToken';
const ACCESS_EXPIRES_KEY = 'todo.accessTokenExpiresAt';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(tokens: StoredTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(ACCESS_EXPIRES_KEY, tokens.accessTokenExpiresAt);
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_EXPIRES_KEY);
  },
};
