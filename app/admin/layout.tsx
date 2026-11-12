'use client';

import { AuthGate } from '@/components/auth-gate';
import { AdminShell } from '@/components/workspace-shell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate role="admin">
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  );
}
