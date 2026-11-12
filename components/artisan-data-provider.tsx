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
import { ApiError, apiFetch } from '@/lib/api';
import type { ArtisanProfile } from '@/lib/types';
import { useAuth } from './auth-provider';

interface ArtisanDataContextValue {
  profile: ArtisanProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<ArtisanProfile | null>;
  setProfile: (profile: ArtisanProfile | null) => void;
}

const ArtisanDataContext = createContext<ArtisanDataContextValue | null>(null);

export function ArtisanDataProvider({ children }: { children: ReactNode }) {
  const { session, updateUser, signOut } = useAuth();
  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ArtisanProfile>('/artisans/me');
      setProfile(data);
      updateUser({
        fullName: data.fullName,
        phone: data.phone,
        verificationLevel: data.verificationLevel,
        accountStatus: data.accountStatus,
      });
      return data;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
      } else {
        setError(
          err instanceof Error ? err.message : 'Could not load your profile.',
        );
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateUser, signOut]);

  useEffect(() => {
    if (!session?.token) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

  const value = useMemo(
    () => ({ profile, loading, error, refresh: load, setProfile }),
    [profile, loading, error, load],
  );

  return (
    <ArtisanDataContext.Provider value={value}>
      {children}
    </ArtisanDataContext.Provider>
  );
}

export function useArtisanData() {
  const context = useContext(ArtisanDataContext);
  if (!context) {
    throw new Error('useArtisanData must be used inside ArtisanDataProvider');
  }
  return context;
}
