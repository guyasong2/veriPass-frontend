import type { VerificationLevel } from './types';

export const LEVEL_META: Record<
  VerificationLevel,
  {
    label: VerificationLevel;
    short: string;
    description: string;
    badge: string;
    dot: string;
    rank: number;
  }
> = {
  Draft: {
    label: 'Draft',
    short: 'Draft',
    description: 'Profile incomplete or identity not yet checked.',
    badge: 'border-ink/15 bg-ink/[0.045] text-ink/60',
    dot: 'bg-ink/25',
    rank: 0,
  },
  'Under Review': {
    label: 'Under Review',
    short: 'Review',
    description: 'Identity or profile information is being reviewed.',
    badge: 'border-amber/40 bg-amber/10 text-[#8a5a10]',
    dot: 'bg-amber',
    rank: 1,
  },
  'ID Verified': {
    label: 'ID Verified',
    short: 'ID',
    description: 'Identity verified through Didit document and face checks.',
    badge: 'border-sky/35 bg-sky/10 text-[#345a75]',
    dot: 'bg-sky',
    rank: 2,
  },
  'Work Confirmed': {
    label: 'Work Confirmed',
    short: 'Work',
    description: 'Identity verified and at least one reference confirms their work.',
    badge: 'border-forest/25 bg-forest/[0.08] text-forest',
    dot: 'bg-forest',
    rank: 3,
  },
  Trusted: {
    label: 'Trusted',
    short: 'Trusted',
    description:
      '3+ positive references, including at least one fellow artisan.',
    badge: 'border-forest bg-forest text-lime',
    dot: 'bg-lime',
    rank: 4,
  },
  Rejected: {
    label: 'Rejected',
    short: 'Rejected',
    description: 'Identity or profile verification was declined.',
    badge: 'border-clay/35 bg-clay/10 text-clay',
    dot: 'bg-clay',
    rank: -1,
  },
  Suspended: {
    label: 'Suspended',
    short: 'Suspended',
    description: 'Account suspended by VeriPass operations.',
    badge: 'border-ink/20 bg-ink text-paper/80',
    dot: 'bg-paper/40',
    rank: -1,
  },
};

export const LEVEL_ORDER: VerificationLevel[] = [
  'Draft',
  'Under Review',
  'ID Verified',
  'Work Confirmed',
  'Trusted',
];

export const LADDER = [
  {
    level: 'ID Verified' as VerificationLevel,
    signal: 'Who they are',
    detail: 'Government ID, liveness and face match through Didit.',
  },
  {
    level: 'Work Confirmed' as VerificationLevel,
    signal: 'What they have done',
    detail: 'At least one previous client or employer confirms their work.',
  },
  {
    level: 'Trusted' as VerificationLevel,
    signal: 'What peers say',
    detail: '3+ positive references, including one from a fellow artisan.',
  },
];

export const TRADES = [
  'Electrician',
  'Carpenter',
  'Mechanic',
  'Plumber',
  'Tailor',
  'Mason',
  'Welder',
  'Solar technician',
  'Painter',
  'Tiler',
];

export const AVAILABILITY = [
  'Available now',
  'Available this week',
  'Booked this week',
  'Weekends only',
];

export const RELATIONSHIP_LABEL: Record<string, string> = {
  client: 'Client',
  fellow_artisan: 'Fellow artisan',
  employer: 'Employer',
  supervisor: 'Supervisor',
};

export const RELATIONSHIPS = [
  'client',
  'fellow_artisan',
  'employer',
  'supervisor',
] as const;

export const IDENTITY_META: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  not_started: {
    label: 'Not started',
    badge: 'border-line bg-paper text-muted',
    dot: 'bg-ink/20',
  },
  pending: {
    label: 'Pending review',
    badge: 'border-amber/40 bg-amber/10 text-[#8a5a10]',
    dot: 'bg-amber',
  },
  verified: {
    label: 'Verified',
    badge: 'border-forest/25 bg-forest/[0.08] text-forest',
    dot: 'bg-forest',
  },
  failed: {
    label: 'Check failed',
    badge: 'border-clay/35 bg-clay/10 text-clay',
    dot: 'bg-clay',
  },
};

export const REFERENCE_STATUS_META: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  invited: {
    label: 'Awaiting response',
    badge: 'border-amber/40 bg-amber/10 text-[#8a5a10]',
    dot: 'bg-amber',
  },
  confirmed: {
    label: 'Confirmed',
    badge: 'border-forest/25 bg-forest/[0.08] text-forest',
    dot: 'bg-forest',
  },
  declined: {
    label: 'Declined',
    badge: 'border-clay/35 bg-clay/10 text-clay',
    dot: 'bg-clay',
  },
};

export const ACCOUNT_STATUS_META: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  active: {
    label: 'Active',
    badge: 'border-forest/25 bg-forest/[0.08] text-forest',
    dot: 'bg-forest',
  },
  suspended: {
    label: 'Suspended',
    badge: 'border-ink/25 bg-ink text-paper/80',
    dot: 'bg-paper/50',
  },
  rejected: {
    label: 'Rejected',
    badge: 'border-clay/35 bg-clay/10 text-clay',
    dot: 'bg-clay',
  },
};

export const ACTION_LABEL: Record<string, string> = {
  'identity.started': 'Identity check started',
  'identity.verified': 'Identity verified',
  'identity.failed': 'Identity check failed',
  'reference.invited': 'Reference invited',
  'reference.confirmed': 'Reference confirmed',
  'reference.declined': 'Reference declined',
  'evidence.uploaded': 'Evidence uploaded',
  'review.submitted': 'Review submitted',
  'account.created': 'Account created',
  'level.trusted': 'Reached Trusted',
  'admin.approve_identity': 'Identity approved',
  'admin.reject': 'Profile rejected',
  'admin.suspend': 'Account suspended',
  'admin.reinstate': 'Account reinstated',
};

