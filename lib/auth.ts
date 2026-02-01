import { User } from '@/types';

const isServer = typeof window === 'undefined';

// Cookie helper to read tokens if server sets them in cookies
const getCookie = (name: string): string | null => {
  if (isServer) return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const setAuthToken = (token: string): void => {
  if (isServer) return;
  localStorage.setItem('auth_token', token);
  // Note: If server sets cookie, we don't necessarily need to set it here 
  // unless we want to manually manage it. Usually server-side cookies are better.
};

export const getAuthToken = (): string | null => {
  if (isServer) return null;
  // Try local storage first, then fall back to cookie
  return localStorage.getItem('auth_token') || getCookie('access_token');
};

export const setRefreshToken = (token: string): void => {
  if (isServer) return;
  localStorage.setItem('refresh_token', token);
};

export const getRefreshToken = (): string | null => {
  if (isServer) return null;
  return localStorage.getItem('refresh_token') || getCookie('refresh_token');
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  setAuthToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
};

export const clearTokens = (): void => {
  if (isServer) return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  // Clear cookies if they are not HttpOnly
  document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export const removeAuthToken = (): void => {
  clearTokens();
};

export const setUser = (user: User): void => {
  if (isServer) return;
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): User | null => {
  if (isServer) return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'admin' || user?.role === 'manager';
};

export const logout = (): void => {
  if (isServer) return;
  clearTokens();
  const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
  window.location.href = `/${defaultLocale}/login`;
};
