import type { Metadata } from 'next';
import { OnboardingClient } from '@/components/onboarding-client';

export const metadata: Metadata = {
  title: 'Get verified',
  description:
    'Create your VeriPass — verify your identity, show your work and collect trusted references.',
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
