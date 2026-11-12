'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Camera,
  Check,
  Clock3,
  ExternalLink,
  Fingerprint,
  MapPin,
  Quote,
  ScanLine,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError, apiFetch, assetUrl, verificationUrl } from '@/lib/api';
import { LADDER, LEVEL_META, RELATIONSHIP_LABEL } from '@/lib/levels';
import type { PublicVerifyResponse } from '@/lib/types';
import {
  formatDate,
  formatDateTime,
} from '@/lib/utils';
import { CopyButton } from './copy-button';
import { EmptyState } from './empty-state';
import { LevelBadge } from './level-badge';
import { InlineLoader } from './loaders';
import { Modal } from './modal';
import { PassCard } from './pass-card';
import { QRCode } from './qr';
import { Stars } from './stars';
import { TrustSeal } from './trust-seal';
import { VerifyForm } from './verify-form';

export function VerifyResultClient({ code }: { code: string }) {
  const [data, setData] = useState<PublicVerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<{
    url: string;
    caption: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setData(null);
    setError('');
    setNotFound(false);

    apiFetch<PublicVerifyResponse>(`/verify/${encodeURIComponent(code)}`)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else
          setError(
            err instanceof Error
              ? err.message
              : 'We could not load this verification record.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [code]);

  const artisan = data?.artisan;
  const restricted =
    artisan?.accountStatus === 'suspended' ||
    artisan?.verificationLevel === 'Suspended';
  const rejected =
    artisan?.accountStatus === 'rejected' ||
    artisan?.verificationLevel === 'Rejected';
  const verified = Boolean(data?.verified);

  const banner = restricted
    ? {
        tone: 'bg-ink text-paper',
        eyebrow: 'Record restricted',
        title: 'This record is suspended.',
        copy: 'The artisan account is not currently available for verification. Do not rely on this pass until VeriPass reinstates the account.',
        icon: ShieldAlert,
        iconTone: 'bg-clay/20 text-clay',
      }
    : rejected
      ? {
          tone: 'bg-clay text-paper',
          eyebrow: 'Verification declined',
          title: 'Verification was not granted.',
          copy: 'This artisan’s identity or profile review was declined. The record is not currently a valid verification signal.',
          icon: ShieldAlert,
          iconTone: 'bg-paper/15 text-paper',
        }
      : !verified
        ? {
            tone:
              artisan?.verificationLevel === 'Under Review'
                ? 'bg-amber text-ink'
                : 'bg-paper-deep text-ink',
            eyebrow:
              artisan?.verificationLevel === 'Under Review'
                ? 'Verification in progress'
                : 'Profile not verified',
            title:
              artisan?.verificationLevel === 'Under Review'
                ? 'This record is under review.'
                : 'This pass is not verified yet.',
            copy:
              artisan?.verificationLevel === 'Under Review'
                ? 'The artisan has submitted their information. Identity and profile checks have not finished.'
                : 'The artisan has not completed the verification steps required for a public pass.',
            icon: Clock3,
            iconTone: 'bg-ink/10 text-ink',
          }
        : {
            tone: 'bg-forest text-paper',
            eyebrow: 'Verified record',
            title:
              artisan?.verificationLevel === 'Trusted'
                ? 'This artisan is Trusted.'
                : artisan?.verificationLevel === 'Work Confirmed'
                  ? 'This work is confirmed.'
                  : 'This identity is verified.',
            copy:
              artisan?.verificationLevel === 'Trusted'
                ? 'Identity verified. Work confirmed by three or more references, including a fellow artisan.'
                : artisan?.verificationLevel === 'Work Confirmed'
                  ? 'Identity verified and at least one reference has confirmed this artisan’s work.'
                  : 'Identity has been checked through Didit document, liveness and face match verification.',
            icon: BadgeCheck,
            iconTone: 'bg-lime text-forest',
          };

  if (loading) {
    return (
      <div className="container-wide py-16">
        <InlineLoader label="Retrieving verification record" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container-reading py-16 md:py-24">
        <div className="rounded-[32px] border border-line bg-paper-soft p-7 text-center shadow-card sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clay/10 text-clay">
            <ScanLine size={24} />
          </div>
          <p className="eyebrow mt-6 text-muted">Record not found</p>
          <h1 className="display-tight mx-auto mt-4 max-w-[560px] text-[42px] font-light sm:text-[54px]">
            No VeriPass record for{' '}
            <span className="font-mono text-[0.55em] tracking-wide text-forest">
              {code}
            </span>
            .
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[13px] leading-relaxed text-muted">
            Check the code on the artisan&apos;s digital pass or QR and try
            again. Codes look like <span className="font-mono">VP-XXX-0000</span>.
          </p>
          <div className="mx-auto mt-7 max-w-[560px]">
            <VerifyForm />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted/60">
              Demo record
            </span>
            <Link
              href="/verify/VP-AMA7-2041"
              className="rounded-full border border-line px-3 py-1.5 font-mono text-[9px] text-ink/55 hover:border-forest/30 hover:text-forest"
            >
              VP-AMA7-2041
            </Link>
            <Link
              href="/verify/VP-GRA2-7745"
              className="rounded-full border border-line px-3 py-1.5 font-mono text-[9px] text-ink/55 hover:border-forest/30 hover:text-forest"
            >
              VP-GRA2-7745
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="container-reading py-16">
        <div className="rounded-[28px] border border-clay/25 bg-clay/[0.05] p-8 text-center">
          <ShieldAlert size={28} className="mx-auto text-clay" />
          <h1 className="mt-4 font-display text-[30px] font-normal">
            Could not load this record
          </h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <div className="mx-auto mt-6 max-w-[520px]">
            <VerifyForm />
          </div>
        </div>
      </div>
    );
  }

  const level = artisan.verificationLevel;
  const meta = LEVEL_META[level] || LEVEL_META.Draft;
  const confirmed = artisan.counts.confirmed;

  return (
    <div className="container-wide py-8 md:py-12">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/verify"
          className="inline-flex items-center gap-2 text-[12px] font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft size={14} />
          Check another pass
        </Link>
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted/60">
          <span className="h-1.5 w-1.5 rounded-full bg-forest animate-pulse-soft" />
          Live record · checked {formatDateTime(artisan.lastCheckedAt)}
        </div>
      </div>

      {/* Status banner */}
      <section
        className={`relative overflow-hidden rounded-[30px] ${banner.tone}`}
      >
        <div className="pointer-events-none absolute inset-0 pattern-grid-light opacity-40" />
        <div className="pointer-events-none absolute -right-28 -top-28 h-[360px] w-[360px] rounded-full border border-current opacity-10" />
        <div className="relative z-10 flex flex-col justify-between gap-8 p-6 sm:p-9 lg:flex-row lg:items-center lg:p-11">
          <div className="max-w-[680px]">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${banner.iconTone}`}
              >
                <banner.icon size={17} />
              </span>
              <p className="eyebrow opacity-60">{banner.eyebrow}</p>
            </div>
            <h1 className="display-tight mt-5 text-[38px] font-light sm:text-[48px] lg:text-[58px]">
              {banner.title}
            </h1>
            <p className="mt-3 max-w-[580px] text-[13px] leading-[1.8] opacity-60">
              {banner.copy}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <LevelBadge
                level={level}
                size="lg"
                className={
                  verified
                    ? '!border-lime !bg-lime !text-forest'
                    : '!border-current !bg-transparent !text-current'
                }
              />
              <span className="rounded-full border border-current px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] opacity-50">
                {artisan.trade || 'Artisan'} · {artisan.location}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <div className="text-right">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] opacity-40">
                Pass code
              </p>
              <p className="mt-1.5 font-mono text-[13px] tracking-[0.12em]">
                {artisan.verificationCode}
              </p>
              <p className="mt-4 font-mono text-[8px] uppercase tracking-[0.16em] opacity-40">
                Member since
              </p>
              <p className="mt-1.5 text-[12px] font-semibold opacity-70">
                {formatDate(artisan.memberSince)}
              </p>
            </div>
            <TrustSeal
              size={116}
              tone={verified ? 'dark' : 'light'}
              label={verified ? 'VERIFIED' : 'UNVERIFIED'}
              className="hidden sm:block"
            />
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <PassCard
            name={artisan.fullName}
            trade={artisan.trade}
            location={artisan.location}
            code={artisan.verificationCode}
            level={level}
            avatarUrl={artisan.avatarUrl}
            large
            qrSize={86}
            verifiedSince={
              artisan.identityVerifiedAt
                ? formatDate(artisan.identityVerifiedAt)
                : undefined
            }
          />

          <section className="rounded-[26px] border border-line bg-paper-soft p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow text-muted">Artisan profile</p>
              <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted/50">
                Public information
              </span>
            </div>
            <p className="mt-5 text-[14px] leading-[1.8] text-ink/65">
              {artisan.bio ||
                'This artisan has not added a written profile yet.'}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-line pt-5 sm:grid-cols-4">
              <Fact label="Trade" value={artisan.trade || '—'} />
              <Fact
                label="Experience"
                value={
                  artisan.yearsExperience
                    ? `${artisan.yearsExperience} years`
                    : '—'
                }
              />
              <Fact label="Availability" value={artisan.availability || '—'} />
              <Fact
                label="Location"
                value={artisan.location || '—'}
                icon={<MapPin size={11} />}
              />
            </div>
          </section>

          <section className="rounded-[26px] border border-line bg-paper-soft p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-muted">Identity</p>
                <h2 className="mt-2 font-display text-[27px] font-normal tracking-[-0.03em]">
                  Verified through Didit
                </h2>
              </div>
              <span
                className={
                  artisan.identityStatus === 'verified'
                    ? 'flex h-10 w-10 items-center justify-center rounded-full bg-forest text-lime'
                    : 'flex h-10 w-10 items-center justify-center rounded-full bg-ink/[0.06] text-muted'
                }
              >
                {artisan.identityStatus === 'verified' ? (
                  <Check size={18} strokeWidth={2.5} />
                ) : (
                  <Clock3 size={18} />
                )}
              </span>
            </div>
            <p className="mt-3 max-w-[540px] text-[12px] leading-[1.8] text-muted">
              {artisan.identityStatus === 'verified'
                ? 'Government-issued ID, liveness detection and facial matching completed. VeriPass stores only the verification outcome, not your raw documents.'
                : 'Identity verification is not complete for this record.'}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {[
                { label: 'Document check', active: artisan.identityStatus === 'verified' },
                { label: 'Liveness', active: artisan.identityStatus === 'verified' },
                { label: 'Face match', active: artisan.identityStatus === 'verified' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2.5"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      item.active
                        ? 'bg-forest text-lime'
                        : 'bg-ink/[0.06] text-muted/50'
                    }`}
                  >
                    {item.active ? <Check size={10} strokeWidth={3} /> : <X size={10} />}
                  </span>
                  <span className="text-[10.5px] font-semibold text-ink/65">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            {artisan.identityVerifiedAt && (
              <p className="mt-4 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-muted/55">
                <CalendarDays size={11} />
                Verified {formatDate(artisan.identityVerifiedAt)} · Powered by Didit
              </p>
            )}
          </section>
        </div>

        {/* Right trust summary */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="overflow-hidden rounded-[26px] border border-line bg-paper-soft">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <p className="eyebrow text-muted">Trust summary</p>
                <p className="mt-1.5 text-[12px] font-semibold text-ink/60">
                  Current verification level
                </p>
              </div>
              <LevelBadge level={level} />
            </div>
            <div className="space-y-1 px-6 py-5">
              {LADDER.map((step, index) => {
                const currentRank =
                  level === 'ID Verified'
                    ? 2
                    : level === 'Work Confirmed'
                      ? 3
                      : level === 'Trusted'
                        ? 4
                        : 0;
                const requiredRank = index + 2;
                const active = currentRank >= requiredRank;
                return (
                  <div
                    key={step.level}
                    className="flex items-start gap-3 py-3"
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                        active
                          ? 'border-forest bg-forest text-lime'
                          : 'border-line bg-paper text-muted/40'
                      }`}
                    >
                      {active ? <Check size={11} strokeWidth={3} /> : index + 1}
                    </span>
                    <div>
                      <p className="text-[12px] font-bold">
                        {step.level === 'ID Verified'
                          ? 'Identity verified'
                          : step.level}
                      </p>
                      <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 border-t border-line">
              <div className="border-r border-line px-5 py-4">
                <p className="font-display text-[28px] tracking-[-0.04em]">
                  {confirmed}
                </p>
                <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-muted">
                  Confirmed refs
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="font-display text-[28px] tracking-[-0.04em]">
                  {artisan.counts.fellowArtisans}
                </p>
                <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-muted">
                  Fellow artisans
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-line bg-paper-soft p-5">
            <div className="flex items-center gap-2">
              <Share2 size={15} className="text-forest" />
              <p className="text-[12px] font-extrabold">Share this record</p>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Send a verifiable link instead of a screenshot.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3.5 py-3">
                <p className="truncate font-mono text-[9px] text-ink/55">
                  {verificationUrl(artisan.verificationCode)}
                </p>
              </div>
              <CopyButton
                value={verificationUrl(artisan.verificationCode)}
                label="Copy link"
              />
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-forest/[0.05] p-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-md bg-white p-1">
                  <QRCode
                    value={verificationUrl(artisan.verificationCode)}
                    size={44}
                    bgColor="#FFFFFF"
                  />
                </div>
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-muted">
                    Code
                  </p>
                  <p className="mt-1 font-mono text-[10px] tracking-[0.1em] text-forest">
                    {artisan.verificationCode}
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-forest/15 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.12em] text-forest/60">
                {artisan.profileViews} checks
              </span>
            </div>
          </section>

          <div className="rounded-[22px] border border-line bg-paper p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-forest" />
              <p className="text-[11px] font-extrabold">Verification, not a guarantee</p>
            </div>
            <p className="mt-2 text-[10.5px] leading-[1.7] text-muted">
              Always agree scope, timing and price with the artisan. This record
              confirms identity signals and reference responses; it does not
              guarantee future work.
            </p>
          </div>

          {!verified && (
            <div className="rounded-[22px] bg-forest p-5 text-paper">
              <p className="text-[12px] font-bold">Need a second opinion?</p>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-paper/50">
                Ask the artisan to complete verification or contact VeriPass
                support about this record.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Evidence */}
      <section className="mt-10 rounded-[28px] border border-line bg-paper-soft p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-2 text-forest">
              <Camera size={13} />
              Work evidence
            </p>
            <h2 className="mt-3 font-display text-[32px] font-normal tracking-[-0.03em] sm:text-[38px]">
              The work behind the record.
            </h2>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
            {artisan.evidence.length} photographs
          </span>
        </div>
        {artisan.evidence.length === 0 ? (
          <EmptyState
            icon={<Camera size={18} />}
            title="No work photos yet"
            description="This artisan has not published work evidence to their public record."
            className="mt-7 bg-paper"
          />
        ) : (
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {artisan.evidence.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setLightbox({ url: item.url, caption: item.caption })
                }
                className="group relative overflow-hidden rounded-2xl bg-forest text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assetUrl(item.url) || ''}
                  alt={item.caption}
                  className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 via-transparent to-transparent opacity-80" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                  <p className="line-clamp-2 max-w-[82%] text-[11px] font-semibold leading-relaxed text-paper/90">
                    {item.caption}
                  </p>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-paper/25 text-paper/70 transition group-hover:bg-paper group-hover:text-forest">
                    <ExternalLink size={12} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* References */}
      <section className="mt-8 rounded-[28px] border border-line bg-paper-soft p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-2 text-forest">
              <Users size={13} />
              Confirmed references
            </p>
            <h2 className="mt-3 font-display text-[32px] font-normal tracking-[-0.03em] sm:text-[38px]">
              People who know the work.
            </h2>
            <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-muted">
              Each reference receives a private link and confirms directly. Names
              are abbreviated publicly; VeriPass retains the full response for
              audit.
            </p>
          </div>
          <div className="rounded-full border border-line bg-paper px-4 py-2 font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
            {confirmed} of {artisan.counts.total} confirmed
          </div>
        </div>

        {artisan.confirmedReferences.length === 0 ? (
          <EmptyState
            icon={<Users size={18} />}
            title="No confirmed references yet"
            description="Ask this artisan to invite a previous client or peer to confirm their work."
            className="mt-7 bg-paper"
          />
        ) : (
          <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {artisan.confirmedReferences.map((reference, index) => (
              <article
                key={`${reference.name}-${index}`}
                className="flex flex-col rounded-2xl border border-line bg-paper p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-lime">
                      {reference.name
                        .replace(/[^A-Za-z ]/g, '')
                        .slice(0, 1)}
                    </span>
                    <div>
                      <p className="text-[12px] font-extrabold">
                        {reference.name}
                      </p>
                      <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-muted">
                        {RELATIONSHIP_LABEL[reference.relationship] ||
                          'Reference'}
                      </p>
                    </div>
                  </div>
                  <Quote size={17} className="text-forest/20" />
                </div>
                {reference.comment ? (
                  <p className="mt-4 flex-1 text-[12px] leading-[1.75] text-ink/60">
                    “{reference.comment}”
                  </p>
                ) : (
                  <p className="mt-4 flex-1 text-[12px] italic text-muted">
                    Confirmed work without a written comment.
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-line/80 pt-3">
                  <Stars rating={reference.rating} size={11} />
                  <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted/60">
                    {reference.respondedAt
                      ? formatDate(reference.respondedAt)
                      : 'Confirmed'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 rounded-xl bg-forest/[0.045] px-4 py-3"> 
          <Fingerprint size={14} className="shrink-0 text-forest" />
          <p className="text-[10px] leading-relaxed text-muted">
            Reference confirmations are tied to unique invite links and recorded
            with a timestamp. A declined reference does not count toward any
            level.
          </p>
        </div>
      </section>

      <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-2xl bg-forest p-6 text-paper sm:flex-row">
        <div className="flex items-center gap-4">
          <TrustSeal size={66} tone="dark" label="TRUST" />
          <div>
            <p className="font-display text-[24px] font-light tracking-[-0.02em]">
              Build a record worth trusting.
            </p>
            <p className="mt-1 text-[11px] text-paper/45">
              Identity, evidence and references. All in one VeriPass.
            </p>
          </div>
        </div>
        <Link href="/onboarding" className="btn-lime shrink-0">
          Get verified <ArrowRight size={14} />
        </Link>
      </div>

      <Modal
        open={Boolean(lightbox)}
        onClose={() => setLightbox(null)}
        title="Work evidence"
        description={lightbox?.caption}
        size="lg"
      >
        {lightbox && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={assetUrl(lightbox.url) || ''}
            alt={lightbox.caption}
            className="max-h-[70vh] w-full rounded-2xl object-contain"
          />
        )}
      </Modal>
    </div>
  );
}

function Fact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted/60">
        {label}
      </p>
      <p className="mt-1.5 flex items-center gap-1 text-[11.5px] font-bold text-ink/75">
        {icon}
        {value}
      </p>
    </div>
  );
}
