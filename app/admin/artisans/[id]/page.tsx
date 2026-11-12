'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Fingerprint,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Star,
  UserCheck,
  UserRound,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/avatar';
import { LevelBadge } from '@/components/level-badge';
import { InlineLoader, Spinner } from '@/components/loaders';
import { Modal } from '@/components/modal';
import { Stars } from '@/components/stars';
import { apiFetch, assetUrl, verificationUrl } from '@/lib/api';
import {
  ACTION_LABEL,
  ACCOUNT_STATUS_META,
  IDENTITY_META,
  REFERENCE_STATUS_META,
  RELATIONSHIP_LABEL,
} from '@/lib/levels';
import type { AdminDetail, EvidenceItem } from '@/lib/types';
import {
  cn,
  formatDate,
  formatDateTime,
  relativeTime,
} from '@/lib/utils';

type AdminAction = 'approve_identity' | 'reject' | 'suspend' | 'reinstate';

const ACTION_COPY: Record<
  AdminAction,
  {
    label: string;
    title: string;
    description: string;
    tone: 'primary' | 'danger' | 'outline';
    icon: typeof Check;
  }
> = {
  approve_identity: {
    label: 'Approve identity',
    title: 'Approve this identity?',
    description:
      'The identity check will be marked verified and the account will become active. Verification level recalculates immediately.',
    tone: 'primary',
    icon: UserCheck,
  },
  reject: {
    label: 'Reject profile',
    title: 'Reject this profile?',
    description:
      'The account status becomes rejected and the public pass shows a declined verification. The account can be reinstated later.',
    tone: 'danger',
    icon: ShieldX,
  },
  suspend: {
    label: 'Suspend account',
    title: 'Suspend this account?',
    description:
      'The public pass will immediately show a suspended status. Use this while a dispute or safety issue is investigated.',
    tone: 'danger',
    icon: ShieldAlert,
  },
  reinstate: {
    label: 'Reinstate account',
    title: 'Reinstate this account?',
    description:
      'The account becomes active again and the verification level is recalculated from identity and references.',
    tone: 'outline',
    icon: RefreshCw,
  },
};

export default function AdminArtisanDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [detail, setDetail] = useState<AdminDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState<AdminAction | null>(null);
  const [note, setNote] = useState('');
  const [acting, setActing] = useState(false);
  const [lightbox, setLightbox] = useState<EvidenceItem | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<AdminDetail>(`/admin/artisans/${id}`);
      setDetail(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load this artisan.',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const actions = useMemo(() => {
    if (!detail) return [] as AdminAction[];
    const list: AdminAction[] = [];
    if (detail.identityStatus !== 'verified') list.push('approve_identity');
    if (detail.accountStatus === 'active') list.push('suspend');
    if (detail.accountStatus !== 'rejected') list.push('reject');
    if (
      detail.accountStatus === 'suspended' ||
      detail.accountStatus === 'rejected'
    ) {
      list.push('reinstate');
    }
    return list;
  }, [detail]);

  async function performAction() {
    if (!action || !detail) return;
    setActing(true);
    try {
      const response = await apiFetch<{
        ok: boolean;
        message: string;
        artisan: AdminDetail;
      }>(`/admin/artisans/${detail.id}/action`, {
        method: 'PATCH',
        body: { action, note: note.trim() || undefined },
      });
      setDetail(response.artisan);
      toast.success(response.message);
      setAction(null);
      setNote('');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not complete this action.',
      );
    } finally {
      setActing(false);
    }
  }

  if (loading && !detail) {
    return <InlineLoader label="Loading artisan record" />;
  }

  if (error || !detail) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/artisans"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-ink"
        >
          <ArrowLeft size={13} /> Back to artisans
        </Link>
        <div className="rounded-[26px] border border-clay/25 bg-clay/[0.05] p-10 text-center">
          <ShieldAlert size={28} className="mx-auto text-clay" />
          <p className="mt-3 font-display text-[28px]">Record unavailable</p>
          <p className="mt-1 text-[12px] text-muted">{error}</p>
          <button type="button" onClick={() => load()} className="btn-primary mt-5">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const identityMeta = IDENTITY_META[detail.identityStatus];
  const accountMeta = ACCOUNT_STATUS_META[detail.accountStatus];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/artisans"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft size={13} />
          Back to artisan registry
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/verify/${detail.verificationCode}`}
            target="_blank"
            className="btn-outline btn-sm"
          >
            <ExternalLink size={12} />
            Public pass
          </Link>
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="icon-btn"
            aria-label="Refresh record"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : undefined} />
          </button>
        </div>
      </div>

      {/* Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-line bg-paper-soft shadow-card">
        <div className="pointer-events-none absolute inset-0 pattern-dots opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center">
          <Avatar
            name={detail.fullName}
            src={detail.avatarUrl}
            size={86}
            className="border-4 border-paper shadow-card"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <LevelBadge level={detail.verificationLevel} size="lg" />
              <span
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[9px] font-bold capitalize',
                  accountMeta?.badge,
                )}
              >
                {accountMeta?.label}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                {detail.verificationCode}
              </span>
            </div>
            <h1 className="mt-2 font-display text-[40px] font-light leading-none tracking-[-0.045em] sm:text-[46px]">
              {detail.fullName}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
              <span className="font-semibold text-ink/65">{detail.trade}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} />
                {detail.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail size={11} />
                {detail.email}
              </span>
              {detail.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone size={11} />
                  {detail.phone}
                </span>
              )}
            </p>
            <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.1em] text-muted/60">
              Joined {formatDate(detail.createdAt)} · Last updated{' '}
              {formatDateTime(detail.updatedAt)}
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-3 gap-2 lg:grid-cols-1 xl:grid-cols-3">
            {[
              { label: 'Checks', value: detail.profileViews, icon: ExternalLink },
              { label: 'Refs', value: detail.counts.confirmed, icon: BadgeCheck },
              { label: 'Photos', value: detail.evidence.length, icon: Camera },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-line bg-paper px-3 py-2.5 text-center"
              >
                <stat.icon size={12} className="mx-auto text-forest/50" />
                <p className="mt-1.5 font-display text-[22px] leading-none tracking-[-0.03em]">
                  {stat.value}
                </p>
                <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.1em] text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 border-t border-line bg-paper/50 px-5 py-3.5 sm:px-7">
          {actions.length === 0 ? (
            <p className="text-[10px] text-muted">
              No admin actions available for this record.
            </p>
          ) : (
            actions.map((key) => {
              const copy = ACTION_COPY[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setAction(key);
                    setNote('');
                  }}
                  className={cn(
                    'btn btn-sm',
                    copy.tone === 'primary'
                      ? 'bg-forest text-paper hover:bg-forest-mid'
                      : copy.tone === 'danger'
                        ? 'border border-clay/30 bg-clay/[0.06] text-clay hover:bg-clay/10'
                        : 'border border-line bg-paper text-ink/70 hover:border-forest/30 hover:text-forest',
                  )}
                >
                  <copy.icon size={12} />
                  {copy.label}
                </button>
              );
            })
          )}
          <p className="ml-auto hidden items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-muted/50 sm:flex">
            <ShieldCheck size={10} />
            Every action is logged
          </p>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
        <div className="space-y-5">
          {/* Profile */}
          <section className="rounded-[24px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-muted">Professional profile</p>
              <UserRound size={15} className="text-forest/30" />
            </div>
            <p className="mt-4 text-[12px] leading-[1.8] text-ink/65">
              {detail.bio || 'No profile description has been added.'}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4">
              <Fact label="Trade" value={detail.trade || '—'} />
              <Fact
                label="Experience"
                value={
                  detail.yearsExperience
                    ? `${detail.yearsExperience} years`
                    : '—'
                }
              />
              <Fact label="Availability" value={detail.availability || '—'} />
              <Fact
                label="Identity check"
                value={identityMeta?.label || detail.identityStatus}
              />
            </div>
          </section>

          {/* Identity */}
          <section className="rounded-[24px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-muted">Identity verification</p>
                <h2 className="mt-1.5 font-display text-[24px] font-normal tracking-[-0.03em]">
                  Didit check results
                </h2>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-bold',
                  identityMeta?.badge,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', identityMeta?.dot)} />
                {identityMeta?.label}
              </span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                { label: 'Government ID', done: detail.identityStatus === 'verified' },
                { label: 'Liveness', done: detail.identityStatus === 'verified' },
                { label: 'Face match', done: detail.identityStatus === 'verified' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2.5"
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full',
                      item.done
                        ? 'bg-forest text-lime'
                        : 'bg-ink/[0.05] text-muted/40',
                    )}
                  >
                    {item.done ? (
                      <Check size={10} strokeWidth={3} />
                    ) : (
                      <X size={10} />
                    )}
                  </span>
                  <span className="text-[10px] font-semibold text-ink/65">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[8.5px] uppercase tracking-[0.09em] text-muted/70">
              <span>Session: {detail.diditSessionId || 'none'}</span>
              {detail.identityVerifiedAt && (
                <span>Verified: {formatDate(detail.identityVerifiedAt)}</span>
              )}
              {detail.submittedForReviewAt && (
                <span>Submitted: {formatDate(detail.submittedForReviewAt)}</span>
              )}
            </div>
          </section>

          {/* Evidence */}
          <section className="rounded-[24px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow text-muted">Work evidence</p>
                <h2 className="mt-1.5 font-display text-[24px] font-normal tracking-[-0.03em]">
                  {detail.evidence.length} photo
                  {detail.evidence.length === 1 ? '' : 's'}
                </h2>
              </div>
              <Camera size={16} className="text-forest/30" />
            </div>
            {detail.evidence.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line bg-paper px-4 py-6 text-center text-[10.5px] text-muted">
                No work evidence uploaded.
              </p>
            ) : (
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {detail.evidence.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLightbox(item)}
                    className="group overflow-hidden rounded-xl border border-line bg-paper text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={assetUrl(item.url) || ''}
                      alt={item.caption}
                      className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <p className="line-clamp-2 p-2.5 text-[9.5px] font-semibold leading-relaxed text-ink/65">
                      {item.caption}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* References */}
          <section className="rounded-[24px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-muted">References</p>
                <h2 className="mt-1.5 font-display text-[24px] font-normal tracking-[-0.03em]">
                  {detail.counts.confirmed} confirmed of {detail.counts.total}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.09em] text-muted">
                <span>{detail.counts.fellowArtisans} fellow artisans</span>
                <span className="text-line">·</span>
                <span>{detail.counts.invited} awaiting</span>
              </div>
            </div>
            {detail.references.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line bg-paper px-4 py-6 text-center text-[10.5px] text-muted">
                No references invited.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {detail.references.map((reference) => {
                  const meta = REFERENCE_STATUS_META[reference.status];
                  return (
                    <div
                      key={reference.id}
                      className="rounded-xl border border-line bg-paper p-3.5"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[11px] font-bold">
                              {reference.name}
                            </p>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.07em]',
                                meta?.badge,
                              )}
                            >
                              <span
                                className={cn('h-1 w-1 rounded-full', meta?.dot)}
                              />
                              {meta?.label}
                            </span>
                            <span className="font-mono text-[8px] text-muted/60">
                              {RELATIONSHIP_LABEL[reference.relationship]}
                            </span>
                          </div>
                          <p className="mt-1 text-[9px] text-muted">
                            {reference.contact} · invited{' '}
                            {formatDate(reference.createdAt)}
                            {reference.respondedAt &&
                              ` · responded ${formatDate(reference.respondedAt)}`}
                          </p>
                          {reference.comment && (
                            <p className="mt-2 rounded-lg bg-paper-soft px-2.5 py-2 text-[9.5px] italic leading-relaxed text-ink/55">
                              “{reference.comment}”
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          <Stars rating={reference.rating} size={10} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Per-artisan activity */}
          <section className="rounded-[24px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow text-muted">Audit trail</p>
                <h2 className="mt-1.5 font-display text-[24px] font-normal tracking-[-0.03em]">
                  Record activity
                </h2>
              </div>
              <Activity size={16} className="text-forest/30" />
            </div>
            <div className="mt-4 space-y-0">
              {detail.activity.length === 0 ? (
                <p className="text-[10.5px] text-muted">No activity yet.</p>
              ) : (
                detail.activity.map((event, index) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/[0.07] text-forest">
                        <Activity size={10} />
                      </span>
                      {index < detail.activity.length - 1 && (
                        <span className="my-1 w-px flex-1 bg-line" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pb-4">
                      <p className="text-[10.5px] leading-relaxed text-ink/65">
                        {event.detail}
                      </p>
                      <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.09em] text-muted/60">
                        {ACTION_LABEL[event.action] || event.action} ·{' '}
                        {relativeTime(event.createdAt)} · {event.actor}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Level rule summary */}
          <section className="relative overflow-hidden rounded-[24px] bg-forest p-5 text-paper">
            <div className="pointer-events-none absolute inset-0 pattern-grid-light opacity-40" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-lime/70">
                  Verified level
                </p>
                <BadgeCheck size={15} className="text-lime/70" />
              </div>
              <p className="mt-3 font-display text-[32px] font-light leading-none tracking-[-0.04em]">
                {detail.verificationLevel}
              </p>
              <div className="mt-4 space-y-2 border-t border-paper/10 pt-4">
                {[
                  {
                    label: 'Identity verified',
                    done: detail.identityStatus === 'verified',
                  },
                  {
                    label: '1+ confirmed reference',
                    done: detail.counts.confirmed >= 1,
                  },
                  {
                    label: '3+ confirmed references',
                    done: detail.counts.confirmed >= 3,
                  },
                  {
                    label: '1+ fellow artisan',
                    done: detail.counts.fellowArtisans >= 1,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-[9.5px] text-paper/55">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full',
                        item.done
                          ? 'bg-lime text-forest'
                          : 'border border-paper/20 text-paper/25',
                      )}
                    >
                      {item.done ? (
                        <Check size={8} strokeWidth={3} />
                      ) : (
                        <X size={8} />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Checklist */}
          <section className="rounded-[24px] border border-line bg-paper-soft p-5">
            <p className="eyebrow text-muted">Onboarding checklist</p>
            <div className="mt-4 space-y-2.5">
              {Object.entries(detail.checklist).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-full',
                      value
                        ? 'bg-forest text-lime'
                        : 'border border-line text-muted/30',
                    )}
                  >
                    {value ? <Check size={8} strokeWidth={3} /> : <X size={8} />}
                  </span>
                  <span className="flex-1 text-[10px] capitalize text-ink/65">
                    {key === 'account'
                      ? 'Account created'
                      : key === 'identity'
                        ? 'Identity verified'
                        : key === 'profile'
                          ? 'Profile complete'
                          : key === 'evidence'
                            ? '3+ work photos'
                            : '1+ reference'}
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted/50">
                    {value ? 'done' : 'pending'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <span className="text-[9px] text-muted">Progress</span>
              <span className="font-mono text-[10px] text-forest">
                {detail.progress}%
              </span>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-[24px] border border-line bg-paper-soft p-5">
            <p className="eyebrow text-muted">Private contact</p>
            <div className="mt-3 space-y-2">
              <p className="flex items-center gap-2 text-[10px] text-ink/65">
                <Mail size={11} className="text-muted/60" />
                {detail.email}
              </p>
              {detail.phone && (
                <p className="flex items-center gap-2 text-[10px] text-ink/65">
                  <Phone size={11} className="text-muted/60" />
                  {detail.phone}
                </p>
              )}
              <p className="flex items-center gap-2 text-[10px] text-ink/65">
                <CalendarDays size={11} className="text-muted/60" />
                Joined {formatDate(detail.createdAt)}
              </p>
            </div>
            <div className="mt-4 rounded-lg bg-amber/[0.07] px-3 py-2.5">
              <p className="text-[9px] leading-relaxed text-[#8a5a10]/80">
                Admin-only view. Contact details are never shown on the public
                verification record.
              </p>
            </div>
          </section>

          <section className="rounded-[24px] border border-line bg-paper p-5">
            <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-muted">
              Public verification URL
            </p>
            <p className="mt-2 break-all font-mono text-[9px] leading-relaxed text-forest">
              {verificationUrl(detail.verificationCode)}
            </p>
            <Link
              href={`/verify/${detail.verificationCode}`}
              target="_blank"
              className="mt-3 inline-flex items-center gap-1.5 text-[9.5px] font-bold text-forest hover:underline"
            >
              Open as customer <ArrowUpRight size={11} />
            </Link>
          </section>
        </aside>
      </div>

      {/* Action modal */}
      <Modal
        open={Boolean(action)}
        onClose={() => (acting ? null : setAction(null))}
        title={action ? ACTION_COPY[action].title : ''}
        description={action ? ACTION_COPY[action].description : ''}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAction(null)}
              disabled={acting}
              className="btn-outline btn-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={performAction}
              disabled={acting}
              className={cn(
                'btn btn-sm',
                action === 'reject' || action === 'suspend'
                  ? 'bg-clay text-paper hover:bg-[#a9472a]'
                  : 'bg-forest text-paper hover:bg-forest-mid',
              )}
            >
              {acting ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : action ? (
                (() => {
                  const Icon = ACTION_COPY[action].icon;
                  return <Icon size={13} />;
                })()
              ) : null}
              Confirm
            </button>
          </div>
        }
      >
        <div className="flex items-center gap-3 rounded-xl border border-line bg-paper p-3">
          <Avatar name={detail.fullName} src={detail.avatarUrl} size={36} />
          <div className="min-w-0">
            <p className="text-[11px] font-bold">{detail.fullName}</p>
            <p className="text-[9px] text-muted">
              {detail.trade} · {detail.verificationCode}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="note" className="label">
            Note <span className="text-muted/60">(optional)</span>
          </label>
          <textarea
            id="note"
            className="input"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add context for the audit log…"
            maxLength={300}
          />
        </div>
        {(action === 'suspend' || action === 'reject') && (
          <p className="mt-3 flex items-start gap-2 text-[9.5px] leading-relaxed text-clay/80">
            <ShieldAlert size={12} className="mt-0.5 shrink-0" />
            This immediately changes the public pass and removes the artisan from
            verified status.
          </p>
        )}
      </Modal>

      {/* Evidence lightbox */}
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted/60">
        {label}
      </p>
      <p className="mt-1 text-[10.5px] font-bold text-ink/70">{value}</p>
    </div>
  );
}
