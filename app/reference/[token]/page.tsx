import type { Metadata } from 'next';
import { ReferenceClient } from '@/components/reference-client';

export const metadata: Metadata = {
  title: 'Confirm artisanal work',
  description:
    'A private VeriPass request to confirm an artisan’s work history.',
};

export default function ReferencePage({
  params,
}: {
  params: { token: string };
}) {
  return <ReferenceClient token={params.token} />;
}
