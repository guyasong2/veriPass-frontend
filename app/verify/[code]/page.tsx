import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { VerifyResultClient } from '@/components/verify-result-client';

export function generateMetadata({
  params,
}: {
  params: { code: string };
}): Metadata {
  return {
    title: `Verify ${params.code}`,
    description: `Public VeriPass verification record for ${params.code}.`,
  };
}

export default function VerifyResultPage({
  params,
}: {
  params: { code: string };
}) {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main id="main-content" className="border-t border-line">
        <VerifyResultClient code={params.code} />
      </main>
      <SiteFooter />
    </div>
  );
}
