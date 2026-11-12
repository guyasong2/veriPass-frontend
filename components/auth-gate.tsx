'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserRole } from '@/lib/types';
import { useAuth } from './auth-provider';
import { PageLoader } from './loaders';

export function AuthGate({
  role,
  children,
}: {
  role?: UserRole;
  children: React.ReactNode;
}) {
  const { session, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const wrongRole = Boolean(role && session && session.user.role !== role);

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    if (role && session.user.role !== role) {
      router.replace(session.user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [ready, session, role, router, pathname]);

  if (!ready || !session || wrongRole) {
    return <PageLoader label="Checking your credentials" />;
  }

  return <>{children}</>;
}
