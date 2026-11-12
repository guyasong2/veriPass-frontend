'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  Fingerprint,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
  UsersRound,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { Avatar } from '@/components/avatar';
import { LevelBadge } from '@/components/level-badge';
import { PageHeader } from '@/components/page-header';
import { InlineLoader, Skeleton } from '@/components/loaders';
import { apiFetch } from '@/lib/api';
import { ACTION_LABEL, LEVEL_META, LEVEL_ORDER } from '@/lib/levels';
import type { AdminStats } from '@/lib/types';
import {
  cn,
  formatDate,
  pluralise,
  relativeTime,
} from '@/lib/utils';

export default function AdminOverviewPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await apiFetch<AdminStats>('/admin/stats');
      setStats(data);
      if (quiet) toast.success('Dashboard refreshed');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load admin statistics.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Operations"
          title="Verification overview"
          description="Loading live platform statistics…"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-[132px] rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-[320px] rounded-[26px]" />
          <Skeleton className="h-[320px] rounded-[26px]" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Operations"
          title="Verification overview"
          description="Live verification operations for the demo environment."
        />
        <div className="rounded-[26px] border border-clay/25 bg-clay/[0.05] p-8 text-center">
          <ShieldAlert size={26} className="mx-auto text-clay" />
          <p className="mt-3 font-display text-[26px]">Could not load dashboard</p>
          <p className="mt-1 text-[12px] text-muted">{error}</p>
          <button type="button" onClick={() => load()} className="btn-primary mt-5">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const totalLevels =
    LEVEL_ORDER.reduce((sum, level) => sum + (stats.byLevel[level] || 0), 0) ||
    stats.totals.artisans;
  const responseRate = stats.references.responseRate;
  const maxTrade = Math.max(
    1,
    ...stats.tradeBreakdown.map((item) => item.total),
  );
  const firstName = (session?.user.fullName || 'Admin').split(' ')[0];

  const kpis = [
    {
      label: 'Total artisans',
      value: stats.totals.artisans,
      icon: UsersRound,
      detail: `${stats.totals.newThisWeek} joined this week`,
      tone: 'text-ink',
    },
    {
      label: 'Publicly verified',
      value: stats.totals.verified,
      icon: ShieldCheck,
      detail: `${stats.totals.active} active accounts`,
      tone: 'text-forest',
    },
    {
      label: 'Trusted artisans',
      value: stats.totals.trusted,
      icon: BadgeCheck,
      detail: 'Highest verification level',
      tone: 'text-forest',
    },
    {
      label: 'Pending review',
      value: stats.totals.pendingReview,
      icon: Clock3,
      detail: `${pluralise(stats.totals.draft, 'draft')} in progress`,
      tone: 'text-[#8a5a10]',
    },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Operations console"
        title={`Verification overview`}
        description={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${firstName}. Here is what is happening across the VeriPass network.`}
        actions={
          <>
            <span className="hidden items-center gap-1.5 rounded-full border border-forest/15 bg-forest/[0.045] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.13em] text-forest sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-forest animate-pulse-soft" />
              Live demo data
            </span>
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="btn-outline btn-sm"
            >
              <RefreshCw
                size={13}
                className={refreshing ? 'animate-spin' : undefined}
              />
              Refresh
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="group rounded-2xl border border-line bg-paper-soft p-4 shadow-card transition hover:border-forest/25 sm:p-5"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/[0.06] text-forest">
                <kpi.icon size={16} />
              </span>
              <TrendingUp size={13} className="text-forest/25" />
            </div>
            <p className={cn('mt-4 font-display text-[38px] leading-none tracking-[-0.04em]', kpi.tone)}>
              {kpi.value}
            </p>
            <p className="mt-2 text-[11px] font-bold text-ink/70">{kpi.label}</p>
            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.09em] text-muted">
              {kpi.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Level distribution */}
        <section className="rounded-[26px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow text-muted">Verification levels</p>
              <h2 className="mt-1.5 font-display text-[26px] font-normal tracking-[-0.03em]">
                Distribution across the network
              </h2>
            </div>
            <BarChart3 size={18} className="text-forest/30" />
          </div>
          <div className="mt-5 space-y-4">
            {LEVEL_ORDER.map((level) => {
              const count = stats.byLevel[level] || 0;
              const percent = totalLevels
                ? Math.round((count / totalLevels) * 100)
                : 0;
              const meta = LEVEL_META[level];
              return (
                <div key={level}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <LevelBadge level={level} size="sm" />
                      <span className="hidden font-mono text-[8px] uppercase tracking-[0.09em] text-muted/60 sm:block">
                        {meta.description}
                      </span>
                    </div>
                    <p className="shrink-0 font-mono text-[10px] text-ink/60">
                      {count}{' '}
                      <span className="text-muted/50">({percent}%)</span>
                    </p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/[0.06]">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        level === 'Trusted' ? 'bg-forest' : meta.dot,
                      )}
                      style={{ width: `${Math.max(percent, count ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(stats.byLevel.Rejected > 0 || stats.byLevel.Suspended > 0) && (
              <div className="flex flex-wrap items-center gap-4 border-t border-line pt-3">
                <span className="inline-flex items-center gap-1.5 text-[9px] text-muted">
                  <ShieldAlert size={11} className="text-clay/70" />
                  {stats.byLevel.Rejected} rejected
                </span>
                <span className="inline-flex items-center gap-1.5 text-[9px] text-muted">
                  <ShieldAlert size={11} className="text-ink/50" />
                  {stats.byLevel.Suspended} suspended
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Reference health */}
        <section className="rounded-[26px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow text-muted">Reference health</p>
              <h2 className="mt-1.5 font-display text-[26px] font-normal tracking-[-0.03em]">
                Response rate
              </h2>
            </div>
            <Activity size={18} className="text-forest/30" />
          </div>
          <div className="mt-5 flex items-center gap-6">
            <div
              className="relative flex h-[112px] w-[112px] shrink-0 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#123E33 0% ${responseRate}%, #E9E3D3 ${responseRate}% 100%)`,
              }}
            >
              <div className="flex h-[86px] w-[86px] flex-col items-center justify-center rounded-full bg-paper-soft">
                <p className="font-display text-[28px] leading-none tracking-[-0.04em]">
                  {responseRate}%
                </p>
                <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.12em] text-muted">
                  responded
                </p>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-2.5">
              {[
                {
                  label: 'Confirmed',
                  value: stats.references.confirmed,
                  dot: 'bg-forest',
                },
                {
                  label: 'Awaiting',
                  value: stats.references.invited,
                  dot: 'bg-amber',
                },
                {
                  label: 'Declined',
                  value: stats.references.declined,
                  dot: 'bg-clay',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={cn('h-1.5 w-1.5 rounded-full', item.dot)} />
                  <span className="flex-1 text-[10px] text-muted">
                    {item.label}
                  </span>
                  <span className="font-mono text-[10px] font-medium text-ink/70">
                    {item.value}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-line pt-2.5">
                <span className="text-[9px] font-semibold text-muted">
                  Total invitations
                </span>
                <span className="font-mono text-[9px] text-forest">
                  {stats.references.total}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-forest/[0.045] px-3.5 py-3">
            <p className="text-[9.5px] leading-relaxed text-muted">
              {responseRate >= 60
                ? 'Reference engagement is healthy. Keep invites personal and timely.'
                : 'Consider nudging pending references — a higher response rate strengthens every pass.'}
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Review queue */}
        <section className="rounded-[26px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-muted">Needs attention</p>
              <h2 className="mt-1.5 font-display text-[26px] font-normal tracking-[-0.03em]">
                Review queue
              </h2>
            </div>
            <Link
              href="/admin/artisans?level=Under%20Review"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-forest hover:underline"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {stats.reviewQueue.length === 0 ? (
            <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-paper px-5 py-10 text-center">
              <CheckCircle2 size={20} className="text-forest/40" />
              <p className="mt-2 font-display text-[21px]">Queue is clear</p>
              <p className="mt-1 text-[10.5px] text-muted">
                No profiles are waiting for an identity or review decision.
              </p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-line/80">
              {stats.reviewQueue.map((artisan) => (
                <Link
                  key={artisan.id}
                  href={`/admin/artisans/${artisan.id}`}
                  className="group flex items-center gap-3 py-3 first:pt-1 last:pb-0"
                >
                  <Avatar
                    name={artisan.fullName}
                    src={artisan.avatarUrl}
                    size={36}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-bold group-hover:text-forest">
                      {artisan.fullName}
                    </p>
                    <p className="truncate text-[9.5px] text-muted">
                      {artisan.trade} · {artisan.location} ·{' '}
                      {artisan.submittedForReviewAt
                        ? formatDate(artisan.submittedForReviewAt)
                        : 'not submitted'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden font-mono text-[8px] uppercase tracking-[0.08em] text-amber sm:block">
                      {artisan.identityStatus === 'pending'
                        ? 'ID pending'
                        : 'In review'}
                    </span>
                    <LevelBadge level={artisan.verificationLevel} size="sm" />
                    <ArrowUpRight
                      size={13}
                      className="text-muted/30 transition group-hover:text-forest"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Trade breakdown */}
        <section className="rounded-[26px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow text-muted">Network composition</p>
              <h2 className="mt-1.5 font-display text-[26px] font-normal tracking-[-0.03em]">
                Trades represented
              </h2>
            </div>
            <Fingerprint size={17} className="text-forest/30" />
          </div>
          <div className="mt-5 space-y-3">
            {stats.tradeBreakdown.slice(0, 7).map((trade) => (
              <div key={trade.trade}>
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-semibold text-ink/70">
                    {trade.trade}
                  </p>
                  <p className="font-mono text-[9px] text-muted">
                    {trade.total}{' '}
                    {trade.trusted > 0 && (
                      <span className="text-forest">· {trade.trusted} trusted</span>
                    )}
                  </p>
                </div>
                <div className="mt-1.5 flex h-1.5 gap-1">
                  <div
                    className="h-full rounded-full bg-forest"
                    style={{ width: `${(trade.total / maxTrade) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent activity */}
      <section className="rounded-[26px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-muted">Audit trail</p>
            <h2 className="mt-1.5 font-display text-[26px] font-normal tracking-[-0.03em]">
              Recent network activity
            </h2>
          </div>
          <Link
            href="/admin/activity"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-forest hover:underline"
          >
            Full activity log <ArrowRight size={11} />
          </Link>
        </div>
        <div className="mt-5 grid gap-x-8 gap-y-1 md:grid-cols-2">
          {stats.recentActivity.slice(0, 8).map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 border-b border-line/70 py-3 last:border-b-0"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest/[0.06] text-forest">
                {event.action.startsWith('identity') ? (
                  <Fingerprint size={12} />
                ) : event.action.startsWith('reference') ? (
                  <Users size={12} />
                ) : event.action.startsWith('admin') ? (
                  <ShieldCheck size={12} />
                ) : (
                  <Activity size={12} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-semibold leading-relaxed text-ink/70">
                  {event.detail}
                </p>
                <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.09em] text-muted/60">
                  {ACTION_LABEL[event.action] || event.action} ·{' '}
                  {relativeTime(event.createdAt)}
                </p>
              </div>
              {event.targetArtisanId && (
                <Link
                  href={`/admin/artisans/${event.targetArtisanId}`}
                  className="mt-0.5 shrink-0 text-muted/30 transition hover:text-forest"
                  aria-label={`Open ${event.targetName || 'artisan'}`}
                >
                  <ArrowUpRight size={13} />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-3">
        {[
          {
            href: '/admin/artisans',
            icon: UsersRound,
            title: 'Browse artisans',
            copy: `${stats.totals.artisans} records across every level`,
          },
          {
            href: '/admin/artisans?level=Under%20Review',
            icon: Clock3,
            title: 'Clear the queue',
            copy: `${pluralise(stats.totals.pendingReview, 'profile')} awaiting review`,
          },
          {
            href: '/admin/activity',
            icon: Activity,
            title: 'Audit the record',
            copy: 'Every identity, reference and admin action',
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-3 rounded-2xl border border-line bg-paper-soft p-4 transition hover:border-forest/30"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/[0.06] text-forest">
              <item.icon size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold group-hover:text-forest">
                {item.title}
              </p>
              <p className="mt-0.5 truncate text-[9.5px] text-muted">
                {item.copy}
              </p>
            </div>
            <ArrowRight
              size={13}
              className="text-muted/25 transition group-hover:translate-x-0.5 group-hover:text-forest"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
