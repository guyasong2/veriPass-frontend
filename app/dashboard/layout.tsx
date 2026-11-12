'use client';

import { AuthGate } from '@/components/auth-gate';
import { ArtisanDataProvider } from '@/components/artisan-data-provider';
import { ArtisanShell } from '@/components/workspace-shell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate role="artisan">
      <ArtisanDataProvider>
        <ArtisanShell>{children}</ArtisanShell>
      </ArtisanDataProvider>
    </AuthGate>
  );
}
