import { User } from '@/types';
import { env } from './env';

const isServer = typeof window === 'undefined';

// Cookie helper to read tokens if server sets them in cookies
const getCookie = (name: string): string | null => {
  if (isServer) return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Client-side cookie setter
const setCookie = (name: string, value: string, days = 7) => {
  if (isServer) return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

export const setAuthToken = (token: string): void => {
  if (isServer) return;
  localStorage.setItem('auth_token', token);
  setCookie('auth_token', token);
};

export const getAuthToken = (): string | null => {
  if (isServer) return null;
  return localStorage.getItem('auth_token') || getCookie('auth_token');
};

export const setRefreshToken = (token: string): void => {
  if (isServer) return;
  localStorage.setItem('refresh_token', token);
  setCookie('refresh_token', token);
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
  
  // Clear cookies
  document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export const removeAuthToken = (): void => {
  clearTokens();
};

export const setUser = (user: User): void => {
  if (isServer) return;
  const userStr = JSON.stringify(user);
  localStorage.setItem('user', userStr);
  setCookie('user', encodeURIComponent(userStr));
};

export const getUser = (): User | null => {
  if (isServer) return null;
  const userStr = localStorage.getItem('user') || getCookie('user');
  if (!userStr) return null;
  try {
    return JSON.parse(decodeURIComponent(userStr));
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
  const defaultLocale = env.DEFAULT_LOCALE;
  window.location.href = `/${defaultLocale}/login`;
};

// Server-side safe helpers
export const getServerUser = (cookieStore: any): User | null => {
  const userCookie = cookieStore.get('user')?.value;
  if (!userCookie) return null;
  try {
    return JSON.parse(decodeURIComponent(userCookie));
  } catch {
    return null;
  }
};
