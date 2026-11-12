'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock3,
  Fingerprint,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { InlineLoader } from '@/components/loaders';
import { apiFetch } from '@/lib/api';
import { ACTION_LABEL } from '@/lib/levels';
import type { AuditEvent } from '@/lib/types';
import {
  cn,
  formatDate,
  formatDateTime,
  relativeTime,
} from '@/lib/utils';

type Category =
  | 'all'
  | 'identity'
  | 'references'
  | 'review'
  | 'admin'
  | 'evidence'
  | 'account';

function categoryFor(action: string): Exclude<Category, 'all'> {
  if (action.startsWith('identity')) return 'identity';
  if (action.startsWith('reference')) return 'references';
  if (action.startsWith('admin')) return 'admin';
  if (action.startsWith('review')) return 'review';
  if (action.startsWith('evidence')) return 'evidence';
  if (action.startsWith('account')) return 'account';
  return 'account';
}

const CATEGORY_META: Record<
  Exclude<Category, 'all'>,
  { label: string; icon: typeof Activity }
> = {
  identity: { label: 'Identity', icon: Fingerprint },
  references: { label: 'References', icon: Users },
  review: { label: 'Review', icon: BadgeCheck },
  admin: { label: 'Admin', icon: ShieldCheck },
  evidence: { label: 'Evidence', icon: Camera },
  account: { label: 'Account', icon: UserPlus },
};

function eventIcon(action: string) {
  if (action.startsWith('identity')) return Fingerprint;
  if (action.startsWith('reference.confirmed')) return CheckCircle2;
  if (action.startsWith('reference')) return Users;
  if (action.startsWith('admin')) return ShieldCheck;
  if (action.startsWith('evidence')) return Camera;
  if (action.startsWith('level')) return Sparkles;
  if (action.startsWith('review')) return BadgeCheck;
  return Activity;
}

export default function AdminActivityPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await apiFetch<{ events: AuditEvent[] }>(
        '/admin/activity?limit=120',
      );
      setEvents(data.events);
      if (quiet) toast.success('Activity log refreshed');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load the activity log.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: events.length };
    for (const event of events) {
      const key = categoryFor(event.action);
      next[key] = (next[key] || 0) + 1;
    }
    return next;
  }, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((event) => {
      if (category !== 'all' && categoryFor(event.action) !== category) {
        return false;
      }
      if (!q) return true;
      return [event.actor, event.detail, event.targetName, event.action]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [events, category, query]);

  const grouped = useMemo(() => {
    const groups = new Map<string, AuditEvent[]>();
    for (const event of filtered) {
      const date = new Date(event.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const list = groups.get(key) || [];
      list.push(event);
      groups.set(key, list);
    }
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    return Array.from(groups.entries()).map(([key, items]) => {
      const date = new Date(items[0].createdAt);
      const sameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
      return {
        key,
        label: sameDay(date, today)
          ? 'Today'
          : sameDay(date, yesterday)
            ? 'Yesterday'
            : formatDate(date),
        items,
      };
    });
  }, [filtered]);

  const filters: { key: Category; label: string }[] = [
    { key: 'all', label: 'All activity' },
    { key: 'identity', label: 'Identity' },
    { key: 'references', label: 'References' },
    { key: 'review', label: 'Review' },
    { key: 'admin', label: 'Admin actions' },
    { key: 'evidence', label: 'Evidence' },
    { key: 'account', label: 'Accounts' },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Audit trail"
        title="Nothing happens off the record."
        description="Every identity check, reference response and admin action is written to an append-only activity log so decisions can be reviewed later."
        actions={
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="btn-outline btn-sm"
          >
            <Clock3
              size={13}
              className={refreshing ? 'animate-spin' : undefined}
            />
            Refresh log
          </button>
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
              placeholder="Search activity by person, action or detail…"
              className="input h-11 pl-10"
              aria-label="Search activity"
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
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setCategory(filter.key)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[9px] font-bold transition',
                  category === filter.key
                    ? 'border-forest bg-forest text-lime'
                    : 'border-line bg-paper text-muted hover:border-forest/30 hover:text-forest',
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    'font-mono text-[7.5px]',
                    category === filter.key ? 'text-lime/60' : 'text-muted/50',
                  )}
                >
                  {counts[filter.key] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <InlineLoader label="Loading activity log" />
      ) : error ? (
        <div className="rounded-[26px] border border-clay/25 bg-clay/[0.05] p-8 text-center">
          <ShieldCheck size={26} className="mx-auto text-clay" />
          <p className="mt-3 font-display text-[26px]">Could not load activity</p>
          <p className="mt-1 text-[12px] text-muted">{error}</p>
          <button type="button" onClick={() => load()} className="btn-primary mt-5">
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[26px] border border-dashed border-line bg-paper-soft px-6 py-14 text-center">
          <Activity size={24} className="mx-auto text-muted/40" />
          <p className="mt-3 font-display text-[24px]">No matching activity</p>
          <p className="mt-1 text-[11px] text-muted">
            Try another category or clear the search.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('all');
              setQuery('');
            }}
            className="btn-outline btn-sm mt-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-7">
          {grouped.map((group) => (
            <section key={group.key}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="font-display text-[22px] font-normal tracking-[-0.02em]">
                  {group.label}
                </h2>
                <span className="h-px flex-1 bg-line" />
                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted/60">
                  {group.items.length} event
                  {group.items.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="overflow-hidden rounded-[24px] border border-line bg-paper-soft shadow-card">
                {group.items.map((event, index) => {
                  const Icon = eventIcon(event.action);
                  const categoryKey = categoryFor(event.action);
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        'group flex items-start gap-3 px-4 py-4 transition hover:bg-forest/[0.02] sm:gap-4 sm:px-5',
                        index > 0 && 'border-t border-line/70',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                          categoryKey === 'admin'
                            ? 'bg-forest text-lime'
                            : categoryKey === 'identity'
                              ? 'bg-sky/10 text-sky'
                              : categoryKey === 'references'
                                ? 'bg-forest/[0.07] text-forest'
                                : 'bg-ink/[0.05] text-ink/55',
                        )}
                      >
                        <Icon size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[10px] font-bold text-ink/70">
                            {event.actor}
                          </p>
                          <span className="font-mono text-[7.5px] uppercase tracking-[0.1em] text-muted/60">
                            {ACTION_LABEL[event.action] || event.action}
                          </span>
                          {event.targetName && (
                            <span className="rounded-full bg-ink/[0.05] px-1.5 py-0.5 font-mono text-[7.5px] text-muted">
                              {event.targetName}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-ink/65">
                          {event.detail}
                        </p>
                        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.08em] text-muted/50">
                          {formatDateTime(event.createdAt)} ·{' '}
                          {relativeTime(event.createdAt)} ·{' '}
                          {CATEGORY_META[categoryKey].label}
                        </p>
                      </div>
                      {event.targetArtisanId && (
                        <Link
                          href={`/admin/artisans/${event.targetArtisanId}`}
                          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted/30 transition group-hover:bg-forest/[0.07] group-hover:text-forest"
                          aria-label={`Open ${event.targetName || 'artisan'}`}
                        >
                          <ArrowUpRight size={14} />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          <div className="flex items-center justify-center gap-2 pb-2 font-mono text-[8px] uppercase tracking-[0.14em] text-muted/40">
            <ShieldCheck size={11} />
            End of available audit events
          </div>
        </div>
      )}
    </div>
  );
}
