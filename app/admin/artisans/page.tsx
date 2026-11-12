'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ChevronRight,
  Eye,
  Filter,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { LevelBadge } from '@/components/level-badge';
import { PageHeader } from '@/components/page-header';
import { InlineLoader, Skeleton } from '@/components/loaders';
import { apiFetch } from '@/lib/api';
import {
  IDENTITY_META,
  LEVEL_META,
} from '@/lib/levels';
import type {
  AdminArtisanList,
  AdminArtisanSummary,
  VerificationLevel,
} from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

const LEVEL_OPTIONS: VerificationLevel[] = [
  'Draft',
  'Under Review',
  'ID Verified',
  'Work Confirmed',
  'Trusted',
  'Rejected',
  'Suspended',
];

function AdminArtisansClient() {
  const searchParams = useSearchParams();
  const initialLevel = searchParams.get('level') || '';
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [level, setLevel] = useState(initialLevel);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [data, setData] = useState<AdminArtisanList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (level) params.set('level', level);
      if (status) params.set('status', status);
      const result = await apiFetch<AdminArtisanList>(
        `/admin/artisans${params.toString() ? `?${params.toString()}` : ''}`,
      );
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load artisans.',
      );
    } finally {
      setLoading(false);
    }
  }, [query, level, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, query ? 280 : 0);
    return () => window.clearTimeout(timer);
  }, [load, query]);

  const filtersActive = Boolean(query || level || status);

  function clearFilters() {
    setQuery('');
    setLevel('');
    setStatus('');
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Artisan registry"
        title="Every artisan. Every signal."
        description="Search the registry, inspect a record, or move a profile through identity review. Levels recalculate automatically after admin actions."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-soft px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
            <Users size={12} />
            {data?.total ?? 0} records
          </span>
        }
      />

      <section className="rounded-[24px] border border-line bg-paper-soft p-3.5 shadow-card sm:p-4">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, trade, location or pass code…"
              className="input h-11 pl-10"
              aria-label="Search artisans"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-ink/[0.06] text-muted hover:text-ink"
                aria-label="Clear search"
              >
                <X size={10} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-2.5">
              <SlidersHorizontal size={12} className="text-muted/60" />
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                aria-label="Filter by level"
                className="h-10 cursor-pointer appearance-none bg-transparent pr-2 text-[11px] font-semibold text-ink/70 outline-none"
              >
                <option value="">All levels</option>
                {LEVEL_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-2.5">
              <Filter size={12} className="text-muted/60" />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label="Filter by account status"
                className="h-10 cursor-pointer appearance-none bg-transparent pr-2 text-[11px] font-semibold text-ink/70 outline-none"
              >
                <option value="">All accounts</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-ghost btn-sm !h-10"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
        </div>
        {filtersActive && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 px-0.5">
            <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted/50">
              Active filters
            </span>
            {query && <FilterChip label={`“${query}”`} onClear={() => setQuery('')} />}
            {level && <FilterChip label={level} onClear={() => setLevel('')} />}
            {status && (
              <FilterChip label={`Account: ${status}`} onClear={() => setStatus('')} />
            )}
          </div>
        )}
      </section>

      {loading && !data ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-[74px] rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[26px] border border-clay/25 bg-clay/[0.05] p-8 text-center">
          <ShieldAlert size={26} className="mx-auto text-clay" />
          <p className="mt-3 font-display text-[26px]">Could not load artisans</p>
          <p className="mt-1 text-[12px] text-muted">{error}</p>
          <button type="button" onClick={() => load()} className="btn-primary mt-5">
            Try again
          </button>
        </div>
      ) : !data || data.artisans.length === 0 ? (
        <EmptyState
          icon={<Users size={18} />}
          title="No artisans match"
          description="Try a different search term or clear the level and account filters."
          action={
            filtersActive ? (
              <button type="button" onClick={clearFilters} className="btn-outline btn-sm">
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <section className="overflow-hidden rounded-[24px] border border-line bg-paper-soft shadow-card">
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
              {data.total} result{data.total === 1 ? '' : 's'}
              {loading && ' · refreshing'}
            </p>
            <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted/50">
              Review queue first
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-paper/60">
                  <th className="py-3 pl-5 pr-3 table-head font-normal">Artisan</th>
                  <th className="px-3 py-3 table-head font-normal">Trade</th>
                  <th className="px-3 py-3 table-head font-normal">Level</th>
                  <th className="px-3 py-3 table-head font-normal">Signals</th>
                  <th className="px-3 py-3 table-head font-normal">Checks</th>
                  <th className="px-3 py-3 table-head font-normal">Joined</th>
                  <th className="py-3 pl-3 pr-5 table-head font-normal" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {data.artisans.map((artisan) => (
                  <tr
                    key={artisan.id}
                    className="group transition hover:bg-forest/[0.025]"
                  >
                    <td className="py-3.5 pl-5 pr-3">
                      <Link
                        href={`/admin/artisans/${artisan.id}`}
                        className="flex items-center gap-3"
                      >
                        <Avatar
                          name={artisan.fullName}
                          src={artisan.avatarUrl}
                          size={38}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[11.5px] font-bold group-hover:text-forest">
                            {artisan.fullName}
                          </p>
                          <p className="truncate font-mono text-[8.5px] text-muted">
                            {artisan.verificationCode} · {artisan.email}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="text-[10.5px] font-semibold text-ink/70">
                        {artisan.trade || '—'}
                      </p>
                      <p className="text-[9px] text-muted">{artisan.location}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col items-start gap-1.5">
                        <LevelBadge level={artisan.verificationLevel} size="sm" />
                        <span className="inline-flex items-center gap-1 text-[8px] text-muted">
                          <span
                            className={cn(
                              'h-1 w-1 rounded-full',
                              IDENTITY_META[artisan.identityStatus]?.dot,
                            )}
                          />
                          ID {IDENTITY_META[artisan.identityStatus]?.label.toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-[9px] text-muted">
                          <BadgeCheck size={11} className="text-forest/60" />
                          {artisan.confirmedReferences}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] text-muted">
                          <Camera size={11} className="text-forest/60" />
                          {artisan.evidenceCount}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] text-muted">
                          <Eye size={11} className="text-forest/60" />
                          {artisan.profileViews}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          'inline-flex rounded-full border px-2 py-0.5 text-[8px] font-bold capitalize',
                          artisan.accountStatus === 'active'
                            ? 'border-forest/20 bg-forest/[0.05] text-forest'
                            : artisan.accountStatus === 'suspended'
                              ? 'border-ink/20 bg-ink/[0.06] text-ink/60'
                              : 'border-clay/25 bg-clay/[0.07] text-clay',
                        )}
                      >
                        {artisan.accountStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="text-[9.5px] text-muted">
                        {formatDate(artisan.createdAt)}
                      </p>
                      {artisan.submittedForReviewAt && (
                        <p className="font-mono text-[8px] text-amber">
                          submitted
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 pl-3 pr-5 text-right">
                      <Link
                        href={`/admin/artisans/${artisan.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted/35 transition group-hover:bg-forest/[0.07] group-hover:text-forest"
                        aria-label={`Open ${artisan.fullName}`}
                      >
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-line/70 md:hidden">
            {data.artisans.map((artisan) => (
              <Link
                key={artisan.id}
                href={`/admin/artisans/${artisan.id}`}
                className="block p-4 transition hover:bg-forest/[0.025]"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    name={artisan.fullName}
                    src={artisan.avatarUrl}
                    size={40}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-bold">
                          {artisan.fullName}
                        </p>
                        <p className="truncate text-[9.5px] text-muted">
                          {artisan.trade} · {artisan.location}
                        </p>
                      </div>
                      <LevelBadge level={artisan.verificationLevel} size="sm" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[8px] uppercase tracking-[0.08em] text-muted">
                      <span>{artisan.verificationCode}</span>
                      <span>{artisan.confirmedReferences} refs</span>
                      <span>{artisan.evidenceCount} photos</span>
                      <span>{artisan.profileViews} checks</span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="mt-1 shrink-0 text-muted/30" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-forest/15 bg-forest/[0.05] px-2 py-1 text-[8.5px] font-semibold text-forest">
      {label}
      <button type="button" onClick={onClear} aria-label={`Clear ${label}`}>
        <X size={9} />
      </button>
    </span>
  );
}

export default function AdminArtisansPage() {
  return (
    <Suspense fallback={<InlineLoader label="Loading artisan registry" />}>
      <AdminArtisansClient />
    </Suspense>
  );
}
