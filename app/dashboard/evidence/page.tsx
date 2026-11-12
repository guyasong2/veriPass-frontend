'use client';

import {
  Camera,
  Check,
  ImagePlus,
  Info,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ChangeEvent,
  FormEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useArtisanData } from '@/components/artisan-data-provider';
import { EmptyState } from '@/components/empty-state';
import { Modal } from '@/components/modal';
import { PageHeader } from '@/components/page-header';
import { Spinner } from '@/components/loaders';
import { apiFetch, assetUrl } from '@/lib/api';
import type { ArtisanProfile, EvidenceItem } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

export default function EvidencePage() {
  const { profile, setProfile } = useArtisanData();
  const [caption, setCaption] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sampling, setSampling] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<EvidenceItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const evidence = profile?.evidence || [];
  const sorted = useMemo(
    () =>
      [...evidence].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [evidence],
  );

  if (!profile) return null;

  async function upload(event: FormEvent) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError('Choose a photo of your work first.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      if (caption.trim()) body.append('caption', caption.trim());
      const next = await apiFetch<ArtisanProfile>('/artisans/me/evidence', {
        method: 'POST',
        body,
      });
      setProfile(next);
      setCaption('');
      setFileName('');
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Work photo added to your record');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not upload this photo.',
      );
    } finally {
      setUploading(false);
    }
  }

  async function addSamples() {
    setSampling(true);
    try {
      const next = await apiFetch<ArtisanProfile>(
        '/artisans/me/evidence/sample',
        { method: 'POST' },
      );
      setProfile(next);
      toast.success('Sample work photos added');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not add sample photos.',
      );
    } finally {
      setSampling(false);
    }
  }

  async function remove() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const next = await apiFetch<ArtisanProfile>(
        `/artisans/me/evidence/${pendingDelete.id}`,
        { method: 'DELETE' },
      );
      setProfile(next);
      setPendingDelete(null);
      toast.success('Work photo removed');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not remove this photo.',
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Work evidence"
        title="Show the work."
        description="Customers cannot visit every job you have done. Clear photos of completed work are the next best thing — and they stay attached to your public record."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-soft px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
            <Camera size={12} />
            {evidence.length} of 12 photos
          </span>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <form
            onSubmit={upload}
            className="rounded-[26px] border border-line bg-paper-soft p-5 shadow-card sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-muted">Add evidence</p>
                <h2 className="mt-1.5 font-display text-[26px] font-normal tracking-[-0.03em]">
                  Upload a work photo
                </h2>
              </div>
              <button
                type="button"
                onClick={addSamples}
                disabled={sampling || evidence.length >= 12}
                className="btn-outline btn-sm"
              >
                {sampling ? (
                  <Spinner className="h-3.5 w-3.5" />
                ) : (
                  <Sparkles size={13} />
                )}
                Add samples
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
              <div>
                <label className="label">Photo</label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-[150px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-paper text-center transition hover:border-forest/40 hover:bg-forest/[0.025]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/[0.07] text-forest">
                    <ImagePlus size={18} />
                  </span>
                  <span className="max-w-[220px] truncate text-[11px] font-bold text-ink/70">
                    {fileName || 'Choose a photo'}
                  </span>
                  <span className="text-[9px] text-muted">
                    JPG, PNG or WEBP · up to 8MB
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setFileName(event.target.files?.[0]?.name || '')
                  }
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="caption" className="label">
                  What was the job?
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  className="input min-h-[150px] flex-1"
                  maxLength={140}
                  placeholder="e.g. Replaced the distribution board and rewired a four-bedroom home in Molyko."
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="field-hint">{caption.length}/140</p>
                  <button
                    type="submit"
                    disabled={uploading || evidence.length >= 12}
                    className="btn-primary btn-sm"
                  >
                    {uploading ? (
                      <Spinner className="h-3.5 w-3.5" />
                    ) : (
                      <Upload size={13} />
                    )}
                    Upload photo
                  </button>
                </div>
              </div>
            </div>
            {error && <p className="mt-3 text-[11px] text-clay">{error}</p>}
            {evidence.length >= 12 && (
              <p className="mt-3 text-[11px] text-amber">
                You&apos;ve reached the 12-photo limit. Remove a photo to add a
                new one.
              </p>
            )}
          </form>

          <section className="rounded-[26px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-muted">Gallery</p>
                <h2 className="mt-1.5 font-display text-[26px] font-normal tracking-[-0.03em]">
                  Your public evidence
                </h2>
              </div>
              {evidence.length >= 3 ? (
                <span className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.12em] text-forest">
                  <Check size={11} strokeWidth={3} /> Minimum met
                </span>
              ) : (
                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted">
                  {Math.max(0, 3 - evidence.length)} more for checklist
                </span>
              )}
            </div>

            {sorted.length === 0 ? (
              <EmptyState
                icon={<Camera size={18} />}
                title="No work photos yet"
                description="Upload a photo or add sample evidence to see how your public record will look."
                className="mt-5 bg-paper"
              />
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {sorted.map((item) => (
                  <article
                    key={item.id}
                    className="group relative overflow-hidden rounded-2xl border border-line bg-paper"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={assetUrl(item.url) || ''}
                      alt={item.caption}
                      className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <div className="p-3.5">
                      <p className="line-clamp-2 min-h-[30px] text-[11px] font-semibold leading-relaxed text-ink/75">
                        {item.caption}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted/60">
                          {formatDate(item.createdAt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(item)}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold text-muted/60 transition hover:bg-clay/10 hover:text-clay"
                        >
                          <Trash2 size={11} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-[24px] bg-forest p-5 text-paper">
            <Camera size={19} className="text-lime" />
            <p className="mt-4 font-display text-[23px] font-light leading-tight tracking-[-0.03em]">
              Evidence is what makes a record real.
            </p>
            <p className="mt-2 text-[10.5px] leading-[1.8] text-paper/50">
              A level tells someone what has been checked. Your photos show them
              what you can actually do.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-paper/10 bg-paper/[0.04] px-3 py-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime text-forest">
                <Check size={10} strokeWidth={3} />
              </span>
              <p className="text-[9px] text-paper/50">
                At least 3 photos completes this step.
              </p>
            </div>
          </section>

          <section className="rounded-[24px] border border-line bg-paper-soft p-5">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-forest" />
              <p className="text-[11px] font-extrabold">What makes good evidence</p>
            </div>
            <ul className="mt-4 space-y-3">
              {[
                'Show the finished job, not just the tools.',
                'Use good light and a clear angle.',
                'Describe what you did in one line.',
                'Ask the customer before including their home.',
                'Never upload IDs, contracts or private documents.',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[10px] leading-relaxed text-muted"
                >
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-forest" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[24px] border border-line bg-paper-soft p-5">
            <ShieldCheck size={17} className="text-forest" />
            <p className="mt-3 text-[11px] font-bold">Evidence review</p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted">
              Work photos are visible on your public pass. VeriPass operations
              may remove images that expose personal data or do not show
              artisanal work.
            </p>
          </section>
        </aside>
      </div>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => (deleting ? null : setPendingDelete(null))}
        title="Remove this work photo?"
        description="It will disappear from your public verification record. This cannot be undone."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
              className="btn-outline btn-sm"
            >
              Keep photo
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="btn bg-clay px-4 text-paper hover:bg-[#a9472a] btn-sm"
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
          <div className="flex items-center gap-3 rounded-xl border border-line bg-paper p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetUrl(pendingDelete.url) || ''}
              alt={pendingDelete.caption}
              className="h-16 w-20 rounded-lg object-cover"
            />
            <p className="text-[11px] font-semibold leading-relaxed text-ink/70">
              {pendingDelete.caption}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
