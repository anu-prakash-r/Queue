import { useGetProfileQuery } from '@/store/api/authApi';
import * as SecureStore from 'expo-secure-store';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { store } from '@/store';
import { baseApi } from '@/store/api/baseApi';

type AuthContextProps = {
  token: string | null;
  setToken: (t: string | null) => Promise<void>;
  logout: () => Promise<void>;
  role: string | null;
  isRoleLoaded: boolean;
  isSuperAdmin: boolean;
  isOwner: boolean;
  isStaff: boolean;
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

const normalizeRole = (role?: unknown): string | null => {
  if (typeof role !== 'string') {
    return null;
  }

  const normalized = role.trim().toLowerCase();

  return normalized || null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    store.dispatch(baseApi.util.resetApiState());
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

  const {
    data: profileResponse,
    isSuccess: profileLoaded,
    isError: profileFailed,
  } = useGetProfileQuery(undefined, {
    skip: !token,
  });

  // Determine if current token belongs to a super admin.
  // The profile endpoint is the authoritative source; the JWT payload is a fallback.
  const profileRole = normalizeRole(profileResponse?.data?.user?.role);
  const jwtRole = token ? normalizeRole(decodePayload(token).role) : null;

  // Role is considered resolved once the /auth/me call succeeds or fails,
  // or when a role can already be read from the JWT payload.
  const isRoleLoaded = token
    ? profileLoaded || profileFailed || !!jwtRole
    : true;

  const isSuperAdmin = token
    ? profileRole === 'superadmin' || jwtRole === 'superadmin'
    : false;

  const role = token ? (profileRole ?? jwtRole) : null;

  const isOwner = token ? role === 'owner' : false;

  const isStaff = token ? !isSuperAdmin && !isOwner : false;

  // Persist token changes
  const updateToken = async (t: string | null) => {
    try {
      if (t) {
        await SecureStore.setItemAsync('accessToken', t);
        store.dispatch(baseApi.util.resetApiState());
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
      value={{
        token,
        setToken: updateToken,
        logout,
        role,
        isRoleLoaded,
        isSuperAdmin,
        isOwner,
        isStaff,
      }}
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
