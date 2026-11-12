import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginClient } from '@/components/login-client';
import { PageLoader } from '@/components/loaders';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your VeriPass workspace.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader label="Opening sign in" />}>
      <LoginClient />
    </Suspense>
  );
}
