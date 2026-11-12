'use client';

import {
  AlertCircle,
  BadgeCheck,
  Check,
  Clock3,
  Copy,
  Info,
  Loader2,
  Mail,
  Plus,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useArtisanData } from '@/components/artisan-data-provider';
import { CopyButton } from '@/components/copy-button';
import { EmptyState } from '@/components/empty-state';
import { Modal } from '@/components/modal';
import { PageHeader } from '@/components/page-header';
import { Spinner } from '@/components/loaders';
import { Stars } from '@/components/stars';
import { apiFetch, referenceUrl } from '@/lib/api';
import {
  REFERENCE_STATUS_META,
  RELATIONSHIP_LABEL,
  RELATIONSHIPS,
} from '@/lib/levels';
import type {
  ArtisanProfile,
  ReferenceItem,
  ReferenceStatus,
  Relationship,
} from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

const FILTERS: { key: 'all' | ReferenceStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'invited', label: 'Awaiting' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'declined', label: 'Declined' },
];

export default function ReferencesPage() {
  const { profile, setProfile } = useArtisanData();
  const [filter, setFilter] = useState<'all' | ReferenceStatus>('all');
  const [form, setForm] = useState({
    name: '',
    contact: '',
    relationship: 'client' as Relationship,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<ReferenceItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const references = profile?.references || [];
  const filtered = useMemo(
    () =>
      filter === 'all'
        ? references
        : references.filter((reference) => reference.status === filter),
    [references, filter],
  );

  if (!profile) return null;

  const counts = profile.counts;
  const trustProgress = Math.min(3, counts.confirmed);
  const hasPeer = counts.fellowArtisans >= 1;

  async function addReference(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Add the name of your reference.');
      return;
    }
    if (form.contact.trim().length < 5) {
      setError('Add an email address or phone number.');
      return;
    }
    setSaving(true);
    try {
      const next = await apiFetch<ArtisanProfile>('/artisans/me/references', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          contact: form.contact.trim(),
          relationship: form.relationship,
        },
      });
      setProfile(next);
      setForm({ name: '', contact: '', relationship: 'client' });
      setFilter('all');
      toast.success('Reference invite created — copy the private link to send.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not add this reference.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const next = await apiFetch<ArtisanProfile>(
        `/artisans/me/references/${pendingDelete.id}`,
        { method: 'DELETE' },
      );
      setProfile(next);
      setPendingDelete(null);
      toast.success('Reference removed');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not remove this reference.',
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="References"
        title="People who know the work."
        description="A reference is a named person who confirms they have seen or received your work. Invite clients, employers, supervisors and fellow artisans with a private link."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-soft px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
            <Users size={12} />
            {counts.confirmed} confirmed · {counts.invited} awaiting
          </span>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* Trust progress */}
          <section className="relative overflow-hidden rounded-[26px] bg-forest p-5 text-paper sm:p-6">
            <div className="pointer-events-none absolute inset-0 pattern-grid-light opacity-40" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-lime/70">
                    Path to Trusted
                  </p>
                  <h2 className="mt-2 font-display text-[27px] font-light tracking-[-0.03em] text-paper">
                    {counts.confirmed >= 3 && hasPeer
                      ? 'The Trusted rule is met.'
                      : 'Three confirmations. One peer.'}
                  </h2>
                  <p className="mt-1.5 max-w-md text-[10.5px] leading-relaxed text-paper/45">
                    Trusted requires 3 positive references, including at least one
                    fellow artisan. Quality matters more than volume.
                  </p>
                </div>
                <span className="rounded-full border border-lime/25 bg-lime/10 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-lime">
                  {counts.confirmed}/3 confirmed
                </span>
              </div>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-paper/12 bg-paper/[0.05] px-3.5 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-paper/75">
                      Confirmed references
                    </p>
                    <span className="font-mono text-[9px] text-lime">
                      {trustProgress}/3
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        className={cn(
                          'h-1 flex-1 rounded-full',
                          index < trustProgress ? 'bg-lime' : 'bg-paper/12',
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-paper/12 bg-paper/[0.05] px-3.5 py-3">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      hasPeer
                        ? 'bg-lime text-forest'
                        : 'border border-paper/20 text-paper/30',
                    )}
                  >
                    {hasPeer ? (
                      <Check size={11} strokeWidth={3} />
                    ) : (
                      <UserPlus size={11} />
                    )}
                  </span>
                  <div>
                    <p className="text-[10px] font-bold text-paper/75">
                      Fellow artisan
                    </p>
                    <p className="mt-0.5 text-[9px] text-paper/40">
                      {hasPeer
                        ? `${counts.fellowArtisans} confirmed peer${
                            counts.fellowArtisans === 1 ? '' : 's'
                          }`
                        : 'Invite a fellow artisan'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* List */}
          <section className="rounded-[26px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-muted">Reference list</p>
                <h2 className="mt-1.5 font-display text-[26px] font-normal tracking-[-0.03em]">
                  {references.length} invited
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                {FILTERS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilter(item.key)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[9px] font-bold transition',
                      filter === item.key
                        ? 'border-forest bg-forest text-lime'
                        : 'border-line bg-paper text-muted hover:border-forest/30 hover:text-forest',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={<Users size={18} />}
                title={
                  references.length === 0
                    ? 'No references yet'
                    : 'Nothing in this filter'
                }
                description={
                  references.length === 0
                    ? 'Invite someone who has directly seen or received your work. They do not need an account.'
                    : 'Try another status filter to see your references.'
                }
                className="mt-5 bg-paper"
              />
            ) : (
              <div className="mt-5 space-y-2.5">
                {filtered.map((reference) => {
                  const meta = REFERENCE_STATUS_META[reference.status];
                  return (
                    <article
                      key={reference.id}
                      className="rounded-2xl border border-line bg-paper p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-[12px] font-bold text-lime">
                          {reference.name.slice(0, 1)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[12.5px] font-extrabold">
                              {reference.name}
                            </p>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em]',
                                meta?.badge,
                              )}
                            >
                              <span
                                className={cn('h-1 w-1 rounded-full', meta?.dot)}
                              />
                              {meta?.label}
                            </span>
                          </div>
                          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] text-muted">
                            <span>
                              {RELATIONSHIP_LABEL[reference.relationship]}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Mail size={9} />
                              {reference.contact}
                            </span>
                            <span>Invited {formatDate(reference.createdAt)}</span>
                          </p>

                          {reference.status === 'confirmed' && (
                            <div className="mt-3 rounded-xl bg-forest/[0.045] p-3">
                              <div className="flex items-center justify-between gap-2">
                                <Stars rating={reference.rating} size={11} />
                                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted/60">
                                  {formatDate(reference.respondedAt)}
                                </span>
                              </div>
                              {reference.comment && (
                                <p className="mt-2 text-[10.5px] italic leading-relaxed text-ink/60">
                                  “{reference.comment}”
                                </p>
                              )}
                            </div>
                          )}

                          {reference.status === 'declined' && (
                            <p className="mt-3 flex items-start gap-2 rounded-xl bg-clay/[0.055] px-3 py-2.5 text-[10px] leading-relaxed text-clay/80">
                              <AlertCircle size={12} className="mt-0.5 shrink-0" />
                              This reference declined to confirm the work. It
                              does not count toward your level.
                            </p>
                          )}

                          {reference.status === 'invited' && (
                            <div className="mt-3 flex flex-col gap-2 rounded-xl border border-amber/20 bg-amber/[0.055] p-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-start gap-2">
                                <Send
                                  size={12}
                                  className="mt-0.5 shrink-0 text-[#8a5a10]"
                                />
                                <p className="text-[10px] leading-relaxed text-[#8a5a10]/80">
                                  Send this private link to {reference.name.split(' ')[0]}.
                                  Only they can respond.
                                </p>
                              </div>
                              <CopyButton
                                value={referenceUrl(reference.token)}
                                label="Copy link"
                                className="shrink-0 !border-amber/25 !bg-paper !py-1.5 !text-[9px] !text-[#8a5a10]"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 self-end sm:self-start">
                          <button
                            type="button"
                            onClick={() => setPendingDelete(reference)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-muted/45 transition hover:bg-clay/10 hover:text-clay"
                            aria-label="Remove reference"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Add reference */}
        <aside className="space-y-5">
          <form
            onSubmit={addReference}
            className="rounded-[24px] border border-line bg-paper-soft p-5 shadow-card"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/[0.07] text-forest">
                <UserPlus size={15} />
              </span>
              <div>
                <p className="text-[12px] font-extrabold">Invite a reference</p>
                <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-muted">
                  No account needed
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3.5">
              <div>
                <label htmlFor="name" className="label">
                  Their name
                </label>
                <input
                  id="name"
                  className="input"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Ashu Nkeng"
                  required
                />
              </div>
              <div>
                <label htmlFor="contact" className="label">
                  Email or phone
                </label>
                <input
                  id="contact"
                  className="input"
                  value={form.contact}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      contact: event.target.value,
                    }))
                  }
                  placeholder="ashu@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="relationship" className="label">
                  Relationship
                </label>
                <select
                  id="relationship"
                  className="input"
                  value={form.relationship}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      relationship: event.target.value as Relationship,
                    }))
                  }
                >
                  {RELATIONSHIPS.map((value) => (
                    <option key={value} value={value}>
                      {RELATIONSHIP_LABEL[value]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="mt-3 text-[10.5px] text-clay">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary mt-4 w-full"
            >
              {saving ? <Spinner className="h-4 w-4" /> : <Plus size={14} />}
              Create invite link
            </button>
            <p className="mt-3 text-center text-[9px] leading-relaxed text-muted">
              You&apos;ll get a unique link to send yourself. VeriPass does not
              automatically message references in this demo.
            </p>
          </form>

          <section className="rounded-[24px] border border-line bg-paper-soft p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-forest" />
              <p className="text-[11px] font-extrabold">How references work</p>
            </div>
            <div className="mt-4 space-y-3">
              {[
                {
                  icon: Send,
                  title: 'You send a private link',
                  copy: 'Each reference gets a unique, unguessable URL.',
                },
                {
                  icon: Check,
                  title: 'They confirm or decline',
                  copy: 'A short form records a rating and optional comment.',
                },
                {
                  icon: BadgeCheck,
                  title: 'Your level recalculates',
                  copy: 'Confirmations feed directly into your verification level.',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/[0.06] text-forest">
                    <item.icon size={11} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold">{item.title}</p>
                    <p className="mt-0.5 text-[9.5px] leading-relaxed text-muted">
                      {item.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-line bg-paper p-5">
            <div className="flex items-center gap-2">
              <Info size={13} className="text-forest" />
              <p className="text-[10.5px] font-extrabold">A note on honesty</p>
            </div>
            <p className="mt-2 text-[9.5px] leading-relaxed text-muted">
              Only invite people who have directly seen or received your work.
              Confirmations are tied to unique links and timestamps. VeriPass
              may review suspicious patterns.
            </p>
          </section>
        </aside>
      </div>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => (deleting ? null : setPendingDelete(null))}
        title="Remove this reference?"
        description="The invite link will stop working. If they already responded, their confirmation will no longer count toward your level."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
              className="btn-outline btn-sm"
            >
              Keep reference
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="btn btn-sm bg-clay px-4 text-paper hover:bg-[#a9472a]"
            >
              {deleting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              Remove
            </button>
          </div>
        }
      >
        {pendingDelete && (
          <div className="rounded-xl border border-line bg-paper p-4">
            <p className="text-[12px] font-bold">{pendingDelete.name}</p>
            <p className="mt-1 text-[10px] text-muted">
              {RELATIONSHIP_LABEL[pendingDelete.relationship]} ·{' '}
              {pendingDelete.contact}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
