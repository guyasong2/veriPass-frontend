'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ApiError, SESSION_KEY, apiFetch } from '@/lib/api';
import type { AuthSession, LoginResponse, SessionUser } from '@/lib/types';

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthContextValue {
  session: AuthSession | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<LoginResponse>;
  signOut: () => void;
  updateUser: (patch: Partial<SessionUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persist(session: AuthSession | null) {
  if (typeof window === 'undefined') return;
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) {
        setReady(true);
        return;
      }
      let stored: AuthSession | null = null;
      try {
        stored = JSON.parse(raw);
      } catch {
        window.localStorage.removeItem(SESSION_KEY);
      }
      if (!stored?.token) {
        setReady(true);
        return;
      }
      if (!cancelled) setSession(stored);
      try {
        const result = await apiFetch<{ user: SessionUser }>('/auth/me', {
          token: stored.token,
        });
        if (cancelled) return;
        const next: AuthSession = {
          token: stored.token,
          user: { ...stored.user, ...result.user },
        };
        setSession(next);
        persist(next);
      } catch (error) {
        if (!cancelled && error instanceof ApiError && error.status === 401) {
          persist(null);
          setSession(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    });
    const next = { token: result.token, user: result.user };
    persist(next);
    setSession(next);
    return result;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await apiFetch<LoginResponse>('/auth/register', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    });
    const next = { token: result.token, user: result.user };
    persist(next);
    setSession(next);
    return result;
  }, []);

  const signOut = useCallback(() => {
    persist(null);
    setSession(null);
  }, []);

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, user: { ...current.user, ...patch } };
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ session, ready, signIn, register, signOut, updateUser }),
    [session, ready, signIn, register, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
