'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Fingerprint,
  Loader2,
  Lock,
  MapPin,
  Save,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useArtisanData } from '@/components/artisan-data-provider';
import { Avatar } from '@/components/avatar';
import { LevelBadge } from '@/components/level-badge';
import { PageHeader } from '@/components/page-header';
import { Spinner } from '@/components/loaders';
import { apiFetch } from '@/lib/api';
import {
  ACCOUNT_STATUS_META,
  AVAILABILITY,
  IDENTITY_META,
  TRADES,
} from '@/lib/levels';
import type { ArtisanProfile } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { profile, setProfile } = useArtisanData();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    trade: '',
    location: '',
    yearsExperience: '',
    availability: 'Available now',
    bio: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [identityBusy, setIdentityBusy] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName || '',
      phone: profile.phone || '',
      trade: profile.trade || '',
      location: profile.location || '',
      yearsExperience: profile.yearsExperience
        ? String(profile.yearsExperience)
        : '',
      availability: profile.availability || 'Available now',
      bio: profile.bio || '',
    });
    setAvatarPreview(profile.avatarUrl || null);
  }, [profile?.id, profile?.updatedAt]);

  if (!profile) return null;

  const identityMeta = IDENTITY_META[profile.identityStatus];
  const accountMeta = ACCOUNT_STATUS_META[profile.accountStatus];

  async function save(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!form.trade) {
      setError('Choose your trade.');
      return;
    }
    if (!form.location.trim()) {
      setError('Add the area where you work.');
      return;
    }
    if (!form.yearsExperience || Number(form.yearsExperience) < 1) {
      setError('Add at least one year of experience.');
      return;
    }
    if (form.bio.trim().length < 30) {
      setError('Write at least 30 characters about your work.');
      return;
    }
    setSaving(true);
    try {
      const next = await apiFetch<ArtisanProfile>('/artisans/me', {
        method: 'PATCH',
        body: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim() || undefined,
          trade: form.trade,
          location: form.location.trim(),
          yearsExperience: Number(form.yearsExperience),
          availability: form.availability,
          bio: form.bio.trim(),
        },
      });
      setProfile(next);
      toast.success('Profile saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const next = await apiFetch<ArtisanProfile>('/artisans/me/avatar', {
        method: 'POST',
        body,
      });
      setProfile(next);
      setAvatarPreview(next.avatarUrl || null);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not upload your photo.',
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function identityAction(action: 'start' | 'pass' | 'fail') {
    setIdentityBusy(action);
    try {
      const next =
        action === 'start'
          ? await apiFetch<ArtisanProfile>('/artisans/me/identity/start', {
              method: 'POST',
            })
          : await apiFetch<ArtisanProfile>('/artisans/me/identity/complete', {
              method: 'POST',
              body: { outcome: action === 'pass' ? 'passed' : 'failed' },
            });
      setProfile(next);
      if (action === 'pass') {
        toast.success('Identity verified via the simulated Didit check');
      } else if (action === 'fail') {
        toast.error('The simulated identity check was declined');
      } else {
        toast.success('Didit session started');
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'The identity action failed.',
      );
    } finally {
      setIdentityBusy(null);
    }
  }

  async function submitProfile() {
    setSubmitting(true);
    try {
      const next = await apiFetch<ArtisanProfile>('/artisans/me/submit', {
        method: 'POST',
      });
      setProfile(next);
      toast.success('Profile submitted to the review queue');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not submit your profile.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Profile & identity"
        title="The person behind the pass."
        description="Your public profile and identity checks. Keep your trade, location and story accurate — customers and platforms rely on this information."
        actions={<LevelBadge level={profile.verificationLevel} size="lg" />}
      />

      {profile.accountStatus !== 'active' && (
        <div className="flex items-start gap-3 rounded-2xl bg-ink p-4 text-paper">
          <ShieldAlert size={17} className="mt-0.5 shrink-0 text-clay" />
          <div>
            <p className="text-[11.5px] font-bold">
              Account {accountMeta?.label.toLowerCase()}
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-paper/50">
              Your public pass is restricted. Contact VeriPass operations if you
              believe this is a mistake.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
        <form
          onSubmit={save}
          className="rounded-[26px] border border-line bg-paper-soft p-5 shadow-card sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative">
              <Avatar
                name={form.fullName}
                src={avatarPreview}
                size={80}
                className="border-4 border-paper shadow-card"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-paper bg-forest text-lime transition hover:bg-forest-mid"
                aria-label="Change profile photo"
              >
                {uploading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Camera size={12} />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={uploadAvatar}
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[16px] font-extrabold tracking-[-0.02em]">
                  {profile.fullName}
                </p>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em]',
                    accountMeta?.badge,
                  )}
                >
                  {accountMeta?.label}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                {profile.email} · Member since {formatDate(profile.createdAt)}
              </p>
              <p className="mt-1 font-mono text-[9px] tracking-[0.1em] text-forest">
                {profile.verificationCode}
              </p>
            </div>
            <div className="sm:ml-auto">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary btn-sm w-full sm:w-auto"
              >
                {saving ? <Spinner className="h-3.5 w-3.5" /> : <Save size={13} />}
                Save changes
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="label">
                Full name
              </label>
              <input
                id="fullName"
                className="input"
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="label">
                Phone <span className="text-muted/60">(private)</span>
              </label>
              <input
                id="phone"
                className="input"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="+237 ..."
              />
            </div>
            <div>
              <label htmlFor="trade" className="label">
                Trade
              </label>
              <select
                id="trade"
                className="input"
                value={form.trade}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    trade: event.target.value,
                  }))
                }
                required
              >
                <option value="">Select a trade</option>
                {TRADES.map((trade) => (
                  <option key={trade} value={trade}>
                    {trade}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="years" className="label">
                Years of experience
              </label>
              <input
                id="years"
                type="number"
                min={1}
                max={60}
                className="input"
                value={form.yearsExperience}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    yearsExperience: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <label htmlFor="location" className="label">
                Where you work
              </label>
              <div className="relative">
                <MapPin
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30"
                />
                <input
                  id="location"
                  className="input pl-10"
                  value={form.location}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="availability" className="label">
                Availability
              </label>
              <select
                id="availability"
                className="input"
                value={form.availability}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    availability: event.target.value,
                  }))
                }
              >
                {AVAILABILITY.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bio" className="label">
                About your work
              </label>
              <textarea
                id="bio"
                className="input"
                value={form.bio}
                onChange={(event) =>
                  setForm((current) => ({ ...current, bio: event.target.value }))
                }
                maxLength={600}
                required
              />
              <div className="mt-1.5 flex justify-between">
                <p className="field-hint">
                  This appears at the top of your public record.
                </p>
                <p className="field-hint">{form.bio.length}/600</p>
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-clay/25 bg-clay/[0.06] px-4 py-3 text-[11.5px] text-clay">
              {error}
            </p>
          )}
        </form>

        <aside className="space-y-5">
          {/* Identity */}
          <section className="rounded-[24px] border border-line bg-paper-soft p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Fingerprint size={16} className="text-forest" />
                <p className="text-[12px] font-extrabold">Identity</p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold',
                  identityMeta?.badge,
                )}
              >
                <span className={cn('h-1 w-1 rounded-full', identityMeta?.dot)} />
                {identityMeta?.label}
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-paper p-3.5">
              <p className="text-[10.5px] font-bold">
                {profile.identityStatus === 'verified'
                  ? 'Verified through Didit'
                  : profile.identityStatus === 'pending'
                    ? 'Check in progress'
                    : profile.identityStatus === 'failed'
                      ? 'Check declined'
                      : 'Not started'}
              </p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
                {profile.identityStatus === 'verified'
                  ? `Document, liveness and face match confirmed ${
                      profile.identityVerifiedAt
                        ? formatDate(profile.identityVerifiedAt)
                        : ''
                    }.`
                  : 'Complete a simulated Didit check to unlock public verification.'}
              </p>
              <div className="mt-3 space-y-1.5">
                {['Government ID', 'Liveness check', 'Face match'].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between text-[9.5px]"
                    >
                      <span className="text-muted">{item}</span>
                      {profile.identityStatus === 'verified' ? (
                        <Check size={11} className="text-forest" strokeWidth={3} />
                      ) : (
                        <span className="h-1 w-1 rounded-full bg-ink/15" />
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {(profile.identityStatus === 'not_started' ||
                profile.identityStatus === 'failed') && (
                <button
                  type="button"
                  onClick={() => identityAction('start')}
                  disabled={Boolean(identityBusy)}
                  className="btn-primary btn-sm w-full"
                >
                  {identityBusy === 'start' ? (
                    <Spinner className="h-3.5 w-3.5" />
                  ) : (
                    <Fingerprint size={12} />
                  )}
                  {profile.identityStatus === 'failed'
                    ? 'Retry Didit check'
                    : 'Start Didit check'}
                </button>
              )}
              {profile.identityStatus === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => identityAction('pass')}
                    disabled={Boolean(identityBusy)}
                    className="btn-primary btn-sm w-full"
                  >
                    {identityBusy === 'pass' ? (
                      <Spinner className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 size={12} />
                    )}
                    Complete demo check
                  </button>
                  <button
                    type="button"
                    onClick={() => identityAction('fail')}
                    disabled={Boolean(identityBusy)}
                    className="btn-outline btn-sm w-full border-clay/25 text-clay hover:border-clay/50"
                  >
                    Simulate failure
                  </button>
                </>
              )}
              {profile.identityStatus === 'verified' && (
                <div className="flex items-center gap-1.5 rounded-lg bg-forest/[0.05] px-2.5 py-2 text-[9px] text-forest">
                  <Lock size={10} />
                  Identity checks are complete.
                </div>
              )}
            </div>
            <p className="mt-3 text-[8.5px] leading-relaxed text-muted/70">
              Demo simulation. No real Didit request is made.
            </p>
          </section>

          {/* Submission */}
          <section className="rounded-[24px] border border-line bg-paper-soft p-5">
            <div className="flex items-center gap-2">
              <BadgeCheck size={16} className="text-forest" />
              <p className="text-[12px] font-extrabold">Review & submission</p>
            </div>
            {profile.submittedForReviewAt ? (
              <div className="mt-3">
                <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-forest">
                  <Check size={12} strokeWidth={3} />
                  Submitted {formatDate(profile.submittedForReviewAt)}
                </p>
                <p className="mt-1.5 text-[9.5px] leading-relaxed text-muted">
                  Your profile is in the review queue. You can keep adding
                  evidence and references while it is reviewed.
                </p>
                <button
                  type="button"
                  onClick={submitProfile}
                  disabled={submitting}
                  className="btn-outline btn-sm mt-3 w-full"
                >
                  {submitting ? (
                    <Spinner className="h-3.5 w-3.5" />
                  ) : (
                    <Clock3 size={12} />
                  )}
                  Resubmit for review
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-[9.5px] leading-relaxed text-muted">
                  Ready to publish? Submit your profile to the verification
                  review queue. Your level is calculated from identity and
                  references automatically.
                </p>
                <button
                  type="button"
                  onClick={submitProfile}
                  disabled={submitting}
                  className="btn-primary btn-sm mt-3 w-full"
                >
                  {submitting ? (
                    <Spinner className="h-3.5 w-3.5" />
                  ) : (
                    <BadgeCheck size={12} />
                  )}
                  Submit for review
                </button>
              </div>
            )}
          </section>

          <section className="rounded-[24px] bg-forest p-5 text-paper">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-lime/70">
                Public profile
              </p>
              <ShieldCheck size={15} className="text-lime/70" />
            </div>
            <p className="mt-3 font-display text-[22px] font-light leading-tight tracking-[-0.03em]">
              See exactly what
              <br />
              a customer sees.
            </p>
            <Link
              href={`/verify/${profile.verificationCode}`}
              className="btn-lime btn-sm mt-4"
            >
              View public pass
              <ArrowRight size={12} />
            </Link>
          </section>

          <section className="rounded-[24px] border border-line bg-paper-soft p-5">
            <div className="flex items-center gap-2">
              <UserRound size={14} className="text-forest" />
              <p className="text-[10.5px] font-extrabold">Account privacy</p>
            </div>
            <p className="mt-2 text-[9.5px] leading-relaxed text-muted">
              Your email and phone number are never shown publicly. Reference
              contacts are masked. Only your verified name, trade, location,
              evidence and confirmed reference statements are public.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
