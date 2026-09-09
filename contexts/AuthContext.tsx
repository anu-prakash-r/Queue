import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useGetProfileQuery } from '@/store/api/authApi';

type AuthContextProps = {
  token: string | null;
  setToken: (t: string | null) => Promise<void>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Helper to decode JWT payload (base64 URL safe)
const decodePayload = (jwt: string): Record<string, unknown> => {
  try {
    const [, payload = ''] = jwt.split('.');

    if (!payload) {
      return {};
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    const decoded =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');

    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const isSuperAdminRole = (role?: unknown): boolean => {
  return typeof role === 'string' && role.trim().toLowerCase() === 'superadmin';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setToken(null);
  };

  const [token, setToken] = useState<string | null>(null);

  // Load token from storage on mount
  useEffect(() => {
    const loadToken = async () => {
      try {
        const access = await SecureStore.getItemAsync('accessToken');
        if (access) setToken(access);
        // optionally store refresh in state if needed later
      } catch (e) {
        console.error('Failed to load auth token', e);
      }
    };
    loadToken();
  }, []);

  const { data: profileResponse } = useGetProfileQuery(undefined, {
    skip: !token,
  });

  // Determine if current token belongs to a super admin.
  // The profile endpoint is the authoritative source; the JWT payload is a fallback.
  const isSuperAdmin = token
    ? isSuperAdminRole(profileResponse?.data?.user?.role) ||
      isSuperAdminRole(decodePayload(token).role)
    : false;

  // Persist token changes
  const updateToken = async (t: string | null) => {
    try {
      if (t) {
        await SecureStore.setItemAsync('accessToken', t);
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    } catch (e) {
      console.error('Failed to persist auth token', e);
    }
    setToken(t);
  };

  return (
    <AuthContext.Provider
      value={{ token, setToken: updateToken, logout, isSuperAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};