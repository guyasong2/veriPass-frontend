'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Camera,
  Check,
  ChevronRight,
  CircleDashed,
  Clock3,
  Copy,
  Eye,
  Fingerprint,
  Lock,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useArtisanData } from '@/components/artisan-data-provider';
import { useAuth } from '@/components/auth-provider';
import { Avatar } from '@/components/avatar';
import { CopyButton } from '@/components/copy-button';
import { LevelBadge } from '@/components/level-badge';
import { PassCard } from '@/components/pass-card';
import { Spinner } from '@/components/loaders';
import {
  ACCOUNT_STATUS_META,
  IDENTITY_META,
  LEVEL_META,
  REFERENCE_STATUS_META,
  RELATIONSHIP_LABEL,
} from '@/lib/levels';
import type { VerificationLevel } from '@/lib/types';
import {
  cn,
  formatDate,
  pluralise,
  relativeTime,
  timeGreeting,
} from '@/lib/utils';
import { assetUrl, verificationUrl } from '@/lib/api';

const LEVEL_RANK: Record<string, number> = {
  Draft: 0,
  'Under Review': 1,
  'ID Verified': 2,
  'Work Confirmed': 3,
  Trusted: 4,
  Rejected: 0,
  Suspended: 0,
};

export default function DashboardPage() {
  const { profile } = useArtisanData();
  const { session } = useAuth();

  if (!profile) return null;

  const level = profile.verificationLevel as VerificationLevel;
  const rank = LEVEL_RANK[level] ?? 0;
  const accountMeta = ACCOUNT_STATUS_META[profile.accountStatus];
  const identityMeta = IDENTITY_META[profile.identityStatus];
  const restricted =
    profile.accountStatus === 'suspended' || profile.accountStatus === 'rejected';
  const firstName = (profile.fullName || session?.user.fullName || 'there').split(
    ' ',
  )[0];

  const checklist = [
    {
      key: 'profile',
      done: profile.checklist.profile,
      title: 'Complete your professional profile',
      copy: 'Trade, location, experience and a short description of your work.',
      href: '/dashboard/profile',
      action: 'Edit profile',
      icon: Sparkles,
    },
    {
      key: 'identity',
      done: profile.checklist.identity,
      title: 'Verify your identity with Didit',
      copy:
        profile.identityStatus === 'pending'
          ? 'Your check is in progress. Complete the simulated demo check.'
          : 'A document, liveness and face match check confirms who you are.',
      href: '/onboarding',
      action: profile.identityStatus === 'not_started'
        ? 'Start check'
        : 'Continue check',
      icon: Fingerprint,
    },
    {
      key: 'evidence',
      done: profile.checklist.evidence,
      title: 'Add at least 3 work photos',
      copy: `${pluralise(profile.evidence.length, 'photo')} added so far. Evidence shows customers what you can do.`,
      href: '/dashboard/evidence',
      action: 'Manage evidence',
      icon: Camera,
    },
    {
      key: 'references',
      done: profile.checklist.references,
      title: 'Invite a reference',
      copy: `${profile.counts.invited} awaiting response · ${profile.counts.confirmed} confirmed.`,
      href: '/dashboard/references',
      action: 'Invite someone',
      icon: Users,
    },
    {
      key: 'submit',
      done: Boolean(profile.submittedForReviewAt),
      title: 'Submit for review',
      copy: profile.submittedForReviewAt
        ? `Submitted ${formatDate(profile.submittedForReviewAt)}. Keep your record fresh.`
        : 'Send your profile to the VeriPass review queue.',
      href: '/onboarding',
      action: 'Go to review',
      icon: BadgeCheck,
    },
  ];

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-2 text-forest">
            <span className="h-1.5 w-1.5 rounded-full bg-forest" />
            {timeGreeting()}, {firstName}
          </p>
          <h1 className="display-tight mt-3 text-[40px] font-light sm:text-[50px]">
            Your trust record.
          </h1>
          <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted">
            This is what customers, employers and platforms see when they check
            your VeriPass. Keep it current.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton
            value={verificationUrl(profile.verificationCode)}
            label="Copy pass link"
          />
          <Link
            href={`/verify/${profile.verificationCode}`}
            className="btn-primary"
          >
            View public pass
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </header>

      {restricted && (
        <div
          className={cn(
            'flex flex-col gap-3 rounded-2xl p-5 text-paper sm:flex-row sm:items-center sm:justify-between',
            profile.accountStatus === 'suspended' ? 'bg-ink' : 'bg-clay',
          )}
        >
          <div className="flex items-start gap-3">
            <ShieldAlert size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-[12.5px] font-bold">
                {accountMeta?.label || 'Account restricted'}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-paper/55">
                {profile.accountStatus === 'suspended'
                  ? 'Your account is suspended pending review. Your public pass shows a restricted status.'
                  : 'Your profile was rejected during review. Contact VeriPass support to appeal or re-submit.'}
              </p>
            </div>
          </div>
          <Link href="/dashboard/profile" className="btn-light btn-sm shrink-0">
            Review account
          </Link>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          {/* Level card */}
          <section className="relative overflow-hidden rounded-[28px] bg-forest-deep p-6 text-paper shadow-lift sm:p-7">
            <div className="pointer-events-none absolute inset-0 pattern-grid-light opacity-50" />
            <div className="pointer-events-none absolute -right-24 -top-28 h-[300px] w-[300px] rounded-full border border-lime/12" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-paper/35">
                    Current verification level
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-[40px] font-light leading-none tracking-[-0.045em] text-paper">
                      {level}
                    </h2>
                    <span className="rounded-full border border-lime/25 bg-lime/10 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-lime">
                      {profile.verificationCode}
                    </span>
                  </div>
                  <p className="mt-3 max-w-md text-[11.5px] leading-relaxed text-paper/45">
                    {LEVEL_META[level]?.description ||
                      'Your level updates as checks and references are completed.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-paper/12 bg-paper/[0.05] px-4 py-3 text-right">
                  <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-paper/30">
                    Profile checks
                  </p>
                  <p className="mt-1 font-display text-[28px] leading-none tracking-[-0.04em] text-lime">
                    {profile.profileViews}
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-paper/30">
                    Verification ladder
                  </p>
                  <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-lime/70">
                    Next: {profile.nextLevel.target}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-1.5 flex-1 rounded-full',
                        index < rank ? 'bg-lime' : 'bg-paper/12',
                      )}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-paper/30">
                    Draft
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-paper/30">
                    Trusted
                  </span>
                </div>
                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-paper/10 bg-paper/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2.5">
                    <ChevronRight
                      size={15}
                      className="mt-0.5 shrink-0 text-lime"
                    />
                    <p className="max-w-md text-[11px] leading-relaxed text-paper/55">
                      {profile.nextLevel.hint}
                    </p>
                  </div>
                  <Link
                    href={
                      profile.nextLevel.target === 'Work Confirmed' ||
                      profile.nextLevel.target === 'Trusted'
                        ? '/dashboard/references'
                        : '/onboarding'
                    }
                    className="btn-lime btn-sm shrink-0"
                  >
                    {profile.nextLevel.target === 'Trusted' ||
                    profile.nextLevel.target === 'Work Confirmed'
                      ? 'Manage references'
                      : 'Continue setup'}
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Checklist */}
          <section className="rounded-[26px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-muted">Build your record</p>
                <h2 className="mt-1.5 font-display text-[26px] font-normal tracking-[-0.03em]">
                  What&apos;s left to do
                </h2>
              </div>
              <div className="text-right">
                <p className="font-display text-[26px] leading-none tracking-[-0.04em] text-forest">
                  {profile.progress}%
                </p>
                <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.12em] text-muted">
                  complete
                </p>
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
              <div
                className="h-full rounded-full bg-forest transition-all duration-700"
                style={{ width: `${profile.progress}%` }}
              />
            </div>

            <div className="mt-4 divide-y divide-line/80">
              {checklist.map((item) => (
                <div
                  key={item.key}
                  className="flex items-start gap-3 py-3.5 first:pt-1 last:pb-0"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                      item.done
                        ? 'bg-forest text-lime'
                        : 'border border-line bg-paper text-muted/45',
                    )}
                  >
                    {item.done ? (
                      <Check size={12} strokeWidth={3} />
                    ) : (
                      <item.icon size={12} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-[11.5px] font-bold',
                        item.done ? 'text-ink/50 line-through' : 'text-ink/80',
                      )}
                    >
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                      {item.copy}
                    </p>
                  </div>
                  <Link
                    href={item.href}
                    className={cn(
                      'mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold transition',
                      item.done
                        ? 'text-muted/60 hover:bg-ink/[0.04] hover:text-ink'
                        : 'bg-forest/[0.07] text-forest hover:bg-forest hover:text-lime',
                    )}
                  >
                    {item.done ? 'Review' : item.action}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* References */}
          <section className="rounded-[26px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-muted">Recent references</p>
                <h2 className="mt-1.5 font-display text-[26px] font-normal tracking-[-0.03em]">
                  People in your corner
                </h2>
              </div>
              <Link
                href="/dashboard/references"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-forest hover:underline"
              >
                Manage all <ChevronRight size={12} />
              </Link>
            </div>

            {profile.references.length === 0 ? (
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-paper px-5 py-8 text-center">
                <Users size={19} className="text-muted/40" />
                <p className="mt-2 font-display text-[20px] tracking-[-0.02em]">
                  No references yet
                </p>
                <p className="mt-1 max-w-xs text-[10.5px] leading-relaxed text-muted">
                  Invite a client or fellow artisan to confirm your work.
                </p>
                <Link href="/dashboard/references" className="btn-primary btn-sm mt-3">
                  <Plus size={12} />
                  Invite a reference
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {profile.references.slice(0, 3).map((reference) => {
                  const meta = REFERENCE_STATUS_META[reference.status];
                  return (
                    <div
                      key={reference.id}
                      className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3.5 py-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest/[0.07] text-[10px] font-bold text-forest">
                        {reference.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold">
                          {reference.name}
                        </p>
                        <p className="text-[9px] text-muted">
                          {RELATIONSHIP_LABEL[reference.relationship]} ·{' '}
                          {relativeTime(reference.respondedAt || reference.createdAt)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold',
                          meta?.badge,
                        )}
                      >
                        <span className={cn('h-1 w-1 rounded-full', meta?.dot)} />
                        {meta?.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <PassCard
            name={profile.fullName}
            trade={profile.trade}
            location={profile.location}
            code={profile.verificationCode}
            level={profile.verificationLevel}
            avatarUrl={profile.avatarUrl}
            qrSize={64}
          />

          <section className="rounded-[24px] border border-line bg-paper-soft p-5">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-muted">Identity</p>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold',
                  identityMeta?.badge,
                )}
              >
                <span
                  className={cn('h-1 w-1 rounded-full', identityMeta?.dot)}
                />
                {identityMeta?.label}
              </span>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  profile.identityStatus === 'verified'
                    ? 'bg-forest text-lime'
                    : 'border border-line bg-paper text-muted',
                )}
              >
                {profile.identityStatus === 'verified' ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <Fingerprint size={16} />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-bold">
                  {profile.identityStatus === 'verified'
                    ? 'Verified with Didit'
                    : profile.identityStatus === 'pending'
                      ? 'Check in progress'
                      : profile.identityStatus === 'failed'
                        ? 'Check declined'
                        : 'Not verified yet'}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted">
                  {profile.identityStatus === 'verified'
                    ? `Document, liveness and face match confirmed ${
                        profile.identityVerifiedAt
                          ? formatDate(profile.identityVerifiedAt)
                          : ''
                      }.`
                    : 'Verify your identity to unlock public verification.'}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              className="mt-4 flex items-center justify-between rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[10px] font-bold text-ink/65 transition hover:border-forest/30 hover:text-forest"
            >
              {profile.identityStatus === 'verified'
                ? 'Review identity details'
                : 'Complete identity check'}
              <ArrowRight size={12} />
            </Link>
          </section>

          <section className="rounded-[24px] border border-line bg-paper-soft p-5">
            <p className="eyebrow text-muted">At a glance</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {[
                {
                  label: 'Pass checks',
                  value: profile.profileViews,
                  icon: Eye,
                },
                {
                  label: 'Confirmed refs',
                  value: profile.counts.confirmed,
                  icon: BadgeCheck,
                },
                {
                  label: 'Work photos',
                  value: profile.evidence.length,
                  icon: Camera,
                },
                {
                  label: 'Awaiting refs',
                  value: profile.counts.invited,
                  icon: Clock3,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-line bg-paper px-3 py-3"
                >
                  <stat.icon size={13} className="text-forest/60" />
                  <p className="mt-2 font-display text-[24px] leading-none tracking-[-0.04em]">
                    {stat.value}
                  </p>
                  <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.12em] text-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-forest/[0.045] px-3 py-2.5">
              <Lock size={12} className="shrink-0 text-forest" />
              <p className="text-[9px] leading-relaxed text-muted">
                Reference contacts stay private. Only abbreviated names and
                confirmed statements are public.
              </p>
            </div>
          </section>

          {profile.evidence.length > 0 && (
            <section className="rounded-[24px] border border-line bg-paper-soft p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-muted">Latest evidence</p>
                <Link
                  href="/dashboard/evidence"
                  className="text-[9px] font-bold text-forest hover:underline"
                >
                  All photos
                </Link>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {profile.evidence.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href="/dashboard/evidence"
                    className="group relative overflow-hidden rounded-xl bg-forest"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={assetUrl(item.url) || ''}
                      alt={item.caption}
                      className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-[24px] bg-lime p-5 text-forest">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-forest/60">
                  Keep it fresh
                </p>
                <p className="mt-1.5 font-display text-[22px] font-normal leading-tight tracking-[-0.03em]">
                  A verified record is a living record.
                </p>
              </div>
              <Copy size={18} className="shrink-0 text-forest/40" />
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-forest/60">
              Add recent jobs and invite new references as you complete work.
              Recent confirmations keep your pass credible.
            </p>
            <Link
              href="/dashboard/evidence"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-[10px] font-bold text-lime transition hover:bg-forest-mid"
            >
              <Plus size={11} /> Add work
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
