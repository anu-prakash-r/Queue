import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

type AuthContextProps = {
  token: string | null;
  setToken: (t: string | null) => Promise<void>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

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
        const refresh = await SecureStore.getItemAsync('refreshToken');
        if (access) setToken(access);
        // optionally store refresh in state if needed later
      } catch (e) {
        console.error('Failed to load auth token', e);
      }
    };
    loadToken();
  }, []);

  // Helper to decode JWT payload (base64 URL safe)
  const decodePayload = (jwt: string) => {
    try {
      const [, payload] = jwt.split('.');
      const decoded = Buffer.from(payload, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch {
      return {};
    }
  };

  // Persist token changes and compute admin flag
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

  // Determine if current token belongs to a super admin (assumes JWT includes role field)
  const isSuperAdmin = token ? (decodePayload(token).role === 'superadmin') : false;


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
