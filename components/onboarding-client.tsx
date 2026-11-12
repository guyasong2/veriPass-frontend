'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Fingerprint,
  ImagePlus,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  ScanFace,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/avatar';
import { CopyButton } from '@/components/copy-button';
import { LevelBadge } from '@/components/level-badge';
import { InlineLoader, PageLoader, Spinner } from '@/components/loaders';
import { Logo } from '@/components/logo';
import { PassCard } from '@/components/pass-card';
import { TrustSeal } from '@/components/trust-seal';
import { useAuth } from '@/components/auth-provider';
import { apiFetch, assetUrl, referenceUrl } from '@/lib/api';
import {
  AVAILABILITY,
  IDENTITY_META,
  LEVEL_META,
  REFERENCE_STATUS_META,
  RELATIONSHIP_LABEL,
  RELATIONSHIPS,
  TRADES,
} from '@/lib/levels';
import type {
  ArtisanProfile,
  Relationship,
  VerificationLevel,
} from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

type StepKey =
  | 'account'
  | 'identity'
  | 'profile'
  | 'evidence'
  | 'references'
  | 'review';

const STEPS: {
  key: StepKey;
  label: string;
  short: string;
  copy: string;
  icon: typeof UserRound;
}[] = [
  {
    key: 'account',
    label: 'Create your account',
    short: 'Account',
    copy: 'A secure login for your verification record.',
    icon: UserRound,
  },
  {
    key: 'identity',
    label: 'Verify your identity',
    short: 'Identity',
    copy: 'Document, liveness and face match via Didit.',
    icon: Fingerprint,
  },
  {
    key: 'profile',
    label: 'Build your profile',
    short: 'Profile',
    copy: 'Trade, location and what you do.',
    icon: BriefcaseBusiness,
  },
  {
    key: 'evidence',
    label: 'Show your work',
    short: 'Evidence',
    copy: 'Photos of completed jobs and projects.',
    icon: Camera,
  },
  {
    key: 'references',
    label: 'Invite references',
    short: 'References',
    copy: 'Clients and peers who know your work.',
    icon: Users,
  },
  {
    key: 'review',
    label: 'Review & submit',
    short: 'Review',
    copy: 'Check your record and publish your pass.',
    icon: BadgeCheck,
  },
];

const RELATIONSHIP_OPTIONS = RELATIONSHIPS.map((value) => ({
  value,
  label: RELATIONSHIP_LABEL[value],
}));

export function OnboardingClient() {
  const { session, ready, register, signOut, updateUser } = useAuth();
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  const step = STEPS[stepIndex];

  const isArtisan = session?.user.role === 'artisan';

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const data = await apiFetch<ArtisanProfile>('/artisans/me');
      setProfile(data);
      updateUser({
        fullName: data.fullName,
        phone: data.phone,
        verificationLevel: data.verificationLevel,
        accountStatus: data.accountStatus,
      });
      return data;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not load your profile.',
      );
      return null;
    } finally {
      setLoadingProfile(false);
    }
  }, [updateUser]);

  useEffect(() => {
    if (!ready) return;
    if (session?.user.role === 'admin') {
      router.replace('/admin');
      return;
    }
    if (!session) {
      setStepIndex(0);
      setBootstrapped(true);
      return;
    }
    if (profile || loadingProfile) return;
    void (async () => {
      const data = await loadProfile();
      if (data) {
        if (!data.checklist.identity) setStepIndex(1);
        else if (!data.checklist.profile) setStepIndex(2);
        else if (!data.checklist.evidence) setStepIndex(3);
        else if (!data.checklist.references) setStepIndex(4);
        else setStepIndex(5);
      }
      setBootstrapped(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session?.token, session?.user.role]);

  const goToStep = (index: number) => {
    if (!session && index > 0) {
      toast.error('Create your account first.');
      return;
    }
    setStepIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completed = useMemo(() => {
    const map: Record<StepKey, boolean> = {
      account: Boolean(session),
      identity: profile?.checklist.identity ?? false,
      profile: profile?.checklist.profile ?? false,
      evidence: (profile?.evidence.length ?? 0) > 0,
      references: (profile?.references.length ?? 0) > 0,
      review: Boolean(profile?.submittedForReviewAt),
    };
    return map;
  }, [session, profile]);

  if (!ready || !bootstrapped) {
    return <PageLoader label="Preparing your verification journey" />;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/90 backdrop-blur-xl">
        <div className="container-wide flex h-[70px] items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo href="/" />
            <span className="hidden h-5 w-px bg-line sm:block" />
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-muted sm:block">
              Artisan onboarding
            </span>
          </div>
          <div className="flex items-center gap-2">
            {session ? (
              <Link href="/dashboard" className="btn-ghost btn-sm">
                Go to dashboard
                <ArrowRight size={13} />
              </Link>
            ) : (
              <Link href="/login" className="btn-ghost btn-sm">
                Sign in
              </Link>
            )}
            <span className="hidden items-center gap-1.5 rounded-full border border-forest/15 bg-forest/[0.05] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-forest sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-forest animate-pulse-soft" />
              Save as you go
            </span>
          </div>
        </div>
      </header>

      <main id="main-content" className="container-wide py-8 pb-20 md:py-12">
        <div className="mb-7 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar lg:hidden">
          {STEPS.map((item, index) => (
            <button
              key={item.key}
              type="button"
              onClick={() => goToStep(index)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] transition',
                index === stepIndex
                  ? 'border-forest bg-forest text-lime'
                  : completed[item.key]
                    ? 'border-forest/20 bg-forest/[0.05] text-forest'
                    : 'border-line bg-paper-soft text-muted',
              )}
            >
              {completed[item.key] && index !== stepIndex ? (
                <Check size={10} strokeWidth={3} />
              ) : (
                <span>{String(index + 1).padStart(2, '0')}</span>
              )}
              {item.short}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[310px_1fr] lg:gap-12">
          {/* Journey rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-[100px]">
              <p className="eyebrow text-forest">Your verification journey</p>
              <h2 className="mt-3 font-display text-[32px] font-light leading-[1.05] tracking-[-0.04em]">
                Six steps.
                <br />
                <span className="italic text-forest">One portable record.</span>
              </h2>
              <div className="mt-7 space-y-0.5">
                {STEPS.map((item, index) => {
                  const active = index === stepIndex;
                  const done = completed[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => goToStep(index)}
                      className={cn(
                        'group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition',
                        active
                          ? 'bg-forest text-paper'
                          : 'hover:bg-ink/[0.035]',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[9px]',
                          active
                            ? 'border-lime bg-lime text-forest'
                            : done
                              ? 'border-forest/25 bg-forest/[0.07] text-forest'
                              : 'border-line bg-paper text-muted/60',
                        )}
                      >
                        {done && !active ? (
                          <Check size={11} strokeWidth={3} />
                        ) : (
                          String(index + 1).padStart(2, '0')
                        )}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={cn(
                            'block text-[12px] font-bold',
                            active ? 'text-paper' : 'text-ink/75',
                          )}
                        >
                          {item.label}
                        </span>
                        <span
                          className={cn(
                            'mt-0.5 block text-[10.5px] leading-relaxed',
                            active ? 'text-paper/50' : 'text-muted',
                          )}
                        >
                          {item.copy}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 rounded-2xl border border-line bg-paper-soft p-5">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">
                    Your current level
                  </p>
                  <TrustSeal size={38} tone="light" label="VP" />
                </div>
                <div className="mt-3">
                  <LevelBadge
                    level={(profile?.verificationLevel || 'Draft') as VerificationLevel}
                    size="sm"
                  />
                </div>
                <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
                  {profile
                    ? LEVEL_META[profile.verificationLevel]?.description
                    : 'Your level updates automatically as each step is completed.'}
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
                  <div
                    className="h-full rounded-full bg-forest transition-all duration-700"
                    style={{ width: `${profile?.progress ?? 0}%` }}
                  />
                </div>
                <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.12em] text-muted/70">
                  {profile?.progress ?? 0}% complete
                </p>
              </div>

              {session && (
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setProfile(null);
                    setStepIndex(0);
                    toast.success('Signed out');
                  }}
                  className="mt-5 px-1 text-[11px] font-semibold text-muted transition hover:text-clay"
                >
                  Sign out of this account
                </button>
              )}
            </div>
          </aside>

          {/* Step panel */}
          <section className="min-w-0">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-forest">
                  Step {stepIndex + 1} of {STEPS.length}
                </p>
                <h1 className="display-tight mt-3 text-[40px] font-light sm:text-[50px]">
                  {step.label}
                </h1>
                <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
                  {step.copy}
                </p>
              </div>
              <span className="hidden font-display text-[54px] font-light leading-none tracking-[-0.05em] text-ink/[0.07] sm:block">
                0{stepIndex + 1}
              </span>
            </div>

            {loadingProfile && !profile ? (
              <InlineLoader label="Loading your record" />
            ) : (
              <>
                {step.key === 'account' && (
                  <AccountStep
                    session={session}
                    onComplete={() => {
                      setStepIndex(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onRegistered={async () => {
                      const data = await loadProfile();
                      if (data) setProfile(data);
                    }}
                  />
                )}

                {step.key === 'identity' && (
                  <IdentityStep
                    profile={profile}
                    setProfile={setProfile}
                    onContinue={() => {
                      setStepIndex(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}

                {step.key === 'profile' && (
                  <ProfileStep
                    profile={profile}
                    onSaved={(next) => {
                      setProfile(next);
                      setStepIndex(3);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}

                {step.key === 'evidence' && (
                  <EvidenceStep
                    profile={profile}
                    setProfile={setProfile}
                    onContinue={() => {
                      setStepIndex(4);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onSkip={() => setStepIndex(4)}
                  />
                )}

                {step.key === 'references' && (
                  <ReferencesStep
                    profile={profile}
                    setProfile={setProfile}
                    onContinue={() => {
                      setStepIndex(5);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onSkip={() => setStepIndex(5)}
                  />
                )}

                {step.key === 'review' && (
                  <ReviewStep
                    profile={profile}
                    email={session?.user.email}
                    onSubmitted={(next) => setProfile(next)}
                  />
                )}
              </>
            )}

            {stepIndex > 0 && step.key !== 'review' && (
              <button
                type="button"
                onClick={() => goToStep(stepIndex - 1)}
                className="mt-8 inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition hover:text-ink"
              >
                <ArrowLeft size={13} />
                Back to {STEPS[stepIndex - 1].short.toLowerCase()}
              </button>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* ----------------------------- Account step ----------------------------- */

function AccountStep({
  session,
  onComplete,
  onRegistered,
}: {
  session: ReturnType<typeof useAuth>['session'];
  onComplete: () => void;
  onRegistered: () => Promise<void>;
}) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (session?.user.role === 'artisan') {
    return (
      <div className="rounded-[28px] border border-line bg-paper-soft p-6 shadow-card sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-lime">
            <Check size={22} strokeWidth={2.5} />
          </span>
          <div>
            <p className="eyebrow text-forest">Account ready</p>
            <h2 className="mt-2 font-display text-[28px] font-normal tracking-[-0.03em]">
              You&apos;re signed in, {session.user.fullName.split(' ')[0]}.
            </h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
              {session.user.email} · Your account is secure. Continue to verify
              your identity.
            </p>
          </div>
        </div>
        <div className="mt-7 border-t border-line pt-6">
          <button type="button" onClick={onComplete} className="btn-primary">
            Continue to identity
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      setError('Enter your full name as it appears on your ID.');
      return;
    }
    if (form.password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Your passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      });
      await onRegistered();
      toast.success('Account created. Let’s verify your identity.');
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-line bg-paper-soft p-6 shadow-card sm:p-8"
    >
      <div className="flex items-center gap-2 rounded-xl border border-forest/15 bg-forest/[0.045] px-3.5 py-2.5">
        <Lock size={13} className="shrink-0 text-forest" />
        <p className="text-[10.5px] leading-relaxed text-forest/80">
          This is a local demo. Your data stays in the SQLite database on this
          machine.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="label">
            Full name
          </label>
          <input
            id="fullName"
            className="input"
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({ ...current, fullName: event.target.value }))
            }
            placeholder="e.g. Ama Njie"
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30"
            />
            <input
              id="email"
              type="email"
              className="input pl-10"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="label">
            Phone <span className="text-muted/60">(optional)</span>
          </label>
          <div className="relative">
            <Phone
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30"
            />
            <input
              id="phone"
              className="input pl-10"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="+237 ..."
              autoComplete="tel"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="input"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label htmlFor="confirm" className="label">
            Confirm password
          </label>
          <input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            className="input"
            value={form.confirm}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                confirm: event.target.value,
              }))
            }
            placeholder="Repeat your password"
            autoComplete="new-password"
            required
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-[11px] text-muted sm:col-span-2">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
            className="h-3.5 w-3.5 rounded border-line accent-forest"
          />
          Show passwords
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-clay/25 bg-clay/[0.06] px-4 py-3 text-[12px] leading-relaxed text-clay">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-[10px] leading-relaxed text-muted">
          By creating an account you agree to VeriPass keeping a verification
          record for this demo.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary shrink-0"
        >
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" /> Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ----------------------------- Identity step ----------------------------- */

function IdentityStep({
  profile,
  setProfile,
  onContinue,
}: {
  profile: ArtisanProfile | null;
  setProfile: (profile: ArtisanProfile) => void;
  onContinue: () => void;
}) {
  const [busy, setBusy] = useState<'start' | 'pass' | 'fail' | null>(null);
  const status = profile?.identityStatus || 'not_started';
  const meta = IDENTITY_META[status] || IDENTITY_META.not_started;

  async function act(action: 'start' | 'pass' | 'fail') {
    setBusy(action);
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
        toast.success('Identity verified through the simulated Didit check.');
      } else if (action === 'fail') {
        toast.error('The simulated identity check was declined.');
      } else {
        toast.success('Didit session started.');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'The identity check failed.',
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[28px] bg-forest-deep p-6 text-paper shadow-lift sm:p-8">
        <div className="pointer-events-none absolute inset-0 pattern-grid-light opacity-50" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full border border-lime/15" />
        <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime text-forest">
                <Fingerprint size={20} />
              </span>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-paper/40">
                  Identity partner
                </p>
                <p className="text-[14px] font-bold text-paper">Didit</p>
              </div>
              <span className="ml-1 rounded-full border border-paper/15 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.14em] text-paper/45">
                Simulated
              </span>
            </div>
            <h2 className="mt-5 font-display text-[32px] font-light leading-[1.06] tracking-[-0.04em] text-paper sm:text-[38px]">
              Prove you are who
              <br />
              you say you are.
            </h2>
            <p className="mt-3 max-w-md text-[12px] leading-[1.8] text-paper/50">
              Didit checks a government-issued ID, confirms you are physically
              present, and matches your face to the document. VeriPass stores
              the outcome — never the raw document.
            </p>
          </div>
          <div className="relative mx-auto w-[220px]">
            <div className="absolute -inset-4 rounded-[28px] border border-lime/15" />
            <div className="relative overflow-hidden rounded-2xl border border-paper/15 bg-paper/[0.06] p-4">
              <div className="h-1.5 w-16 rounded-full bg-lime/70" />
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper/10">
                  <ScanFace size={24} className="text-lime" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-24 rounded-full bg-paper/20" />
                  <div className="h-1.5 w-16 rounded-full bg-paper/15" />
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-paper/10" />
                <div className="h-1.5 w-4/5 rounded-full bg-paper/10" />
                <div className="h-1.5 w-2/3 rounded-full bg-paper/10" />
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-paper/10 pt-3">
                <span className="font-mono text-[7px] uppercase tracking-[0.16em] text-paper/35">
                  Face match
                </span>
                <span className="font-mono text-[8px] text-lime">
                  {status === 'verified' ? '98.4%' : '—'}
                </span>
              </div>
              <div className="pointer-events-none absolute inset-x-3 top-8 h-px bg-lime/60 shadow-[0_0_18px_2px_rgba(216,242,107,0.35)] animate-scan" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-line bg-paper-soft p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-muted">Check status</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
              <h3 className="font-display text-[27px] font-normal tracking-[-0.03em]">
                {status === 'verified'
                  ? 'Your identity is verified.'
                  : status === 'pending'
                    ? 'Your check is in progress.'
                    : status === 'failed'
                      ? 'The check was declined.'
                      : 'Ready when you are.'}
              </h3>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold',
              meta.badge,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
            {meta.label}
          </span>
        </div>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              label: 'Government ID',
              copy: 'Document authenticity',
              done: status === 'verified',
            },
            {
              icon: ScanFace,
              label: 'Liveness',
              copy: 'You are present',
              done: status === 'verified',
            },
            {
              icon: Fingerprint,
              label: 'Face match',
              copy: 'Face matches ID',
              done: status === 'verified',
            },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                'rounded-2xl border p-4',
                item.done
                  ? 'border-forest/20 bg-forest/[0.05]'
                  : 'border-line bg-paper',
              )}
            >
              <div className="flex items-center justify-between">
                <item.icon
                  size={17}
                  className={item.done ? 'text-forest' : 'text-muted/60'}
                />
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
                    <Circle size={8} />
                  )}
                </span>
              </div>
              <p className="mt-4 text-[12px] font-bold">{item.label}</p>
              <p className="mt-0.5 text-[10px] text-muted">{item.copy}</p>
            </div>
          ))}
        </div>

        {status === 'verified' ? (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-forest p-5 text-paper sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime text-forest">
                <Check size={17} strokeWidth={3} />
              </span>
              <div>
                <p className="text-[12px] font-bold">Identity verified</p>
                <p className="mt-0.5 text-[10px] text-paper/45">
                  {profile?.identityVerifiedAt
                    ? formatDate(profile.identityVerifiedAt)
                    : 'Just now'}{' '}
                  · Powered by Didit (simulated)
                </p>
              </div>
            </div>
            <button type="button" onClick={onContinue} className="btn-lime">
              Continue to profile
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-line pt-5">
            {status === 'not_started' || status === 'failed' ? (
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => act('start')}
                className="btn-primary"
              >
                {busy === 'start' ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Fingerprint size={14} />
                )}
                Start Didit check
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => act('pass')}
                  className="btn-primary"
                >
                  {busy === 'pass' ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Complete demo check
                </button>
                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => act('fail')}
                  className="btn-outline border-clay/25 text-clay hover:border-clay/50 hover:bg-clay/[0.04]"
                >
                  Simulate failure
                </button>
              </>
            )}
            {status === 'not_started' && (
              <button
                type="button"
                onClick={onContinue}
                className="ml-auto text-[11px] font-semibold text-muted hover:text-ink"
              >
                Skip identity for now
              </button>
            )}
          </div>
        )}

        <p className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-muted/75">
          <Lock size={12} className="mt-0.5 shrink-0" />
          Demo note: identity checks are simulated locally. No documents leave
          this machine and no real Didit call is made.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ Profile step ----------------------------- */

function ProfileStep({
  profile,
  onSaved,
}: {
  profile: ArtisanProfile | null;
  onSaved: (profile: ArtisanProfile) => void;
}) {
  const [form, setForm] = useState({
    trade: profile?.trade || '',
    location: profile?.location || '',
    yearsExperience: profile?.yearsExperience
      ? String(profile.yearsExperience)
      : '',
    availability: profile?.availability || AVAILABILITY[0],
    bio: profile?.bio || '',
    fullName: profile?.fullName || '',
    phone: profile?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatarUrl || null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAvatar(event: ChangeEvent<HTMLInputElement>) {
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
      setAvatarPreview(next.avatarUrl || null);
      setForm((current) => ({ ...current, fullName: next.fullName }));
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!form.trade) {
      setError('Choose the trade you work in.');
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
      toast.success('Professional profile saved');
      onSaved(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-line bg-paper-soft p-6 shadow-card sm:p-8"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative">
          <Avatar
            name={form.fullName || profile?.fullName}
            src={avatarPreview}
            size={78}
            className="border-4 border-paper shadow-card"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-paper bg-forest text-lime transition hover:bg-forest-mid"
            aria-label="Upload profile photo"
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
            onChange={handleAvatar}
          />
        </div>
        <div>
          <p className="text-[13px] font-extrabold">Add a profile photo</p>
          <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-muted">
            A clear photo of your face builds trust. You can add or change this
            at any time.
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="label">
            Full name
          </label>
          <input
            id="fullName"
            className="input"
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({ ...current, fullName: event.target.value }))
            }
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="label">
            Phone <span className="text-muted/60">(optional)</span>
          </label>
          <input
            id="phone"
            className="input"
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
            placeholder="+237 ..."
          />
        </div>
        <div>
          <label htmlFor="trade" className="label">
            Your trade
          </label>
          <select
            id="trade"
            className="input"
            value={form.trade}
            onChange={(event) =>
              setForm((current) => ({ ...current, trade: event.target.value }))
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
            placeholder="e.g. 8"
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
              placeholder="e.g. Molyko, Buea"
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
            placeholder="What do you do? What kinds of jobs do you take? What are you known for?"
            maxLength={600}
            required
          />
          <div className="mt-1.5 flex items-center justify-between">
            <p className="field-hint">
              Be specific. Mention the jobs you complete most often.
            </p>
            <p className="field-hint">{form.bio.length}/600</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-clay/25 bg-clay/[0.06] px-4 py-3 text-[12px] text-clay">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[10px] text-muted">
          <ShieldCheck size={12} className="text-forest" />
          This information appears on your public pass.
        </p>
        <button type="submit" disabled={saving} className="btn-primary shrink-0">
          {saving ? <Spinner className="h-4 w-4" /> : null}
          Save and continue
          <ArrowRight size={14} />
        </button>
      </div>
    </form>
  );
}

/* ------------------------------ Evidence step ---------------------------- */

function EvidenceStep({
  profile,
  setProfile,
  onContinue,
  onSkip,
}: {
  profile: ArtisanProfile | null;
  setProfile: (profile: ArtisanProfile) => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sampling, setSampling] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const evidence = profile?.evidence || [];

  async function handleUpload(event: FormEvent) {
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
      toast.success('Work photo added');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this photo.');
    } finally {
      setUploading(false);
    }
  }

  async function addSamples() {
    setSampling(true);
    try {
      const next = await apiFetch<ArtisanProfile>('/artisans/me/evidence/sample', {
        method: 'POST',
      });
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

  async function remove(id: string) {
    setDeleting(id);
    try {
      const next = await apiFetch<ArtisanProfile>(`/artisans/me/evidence/${id}`, {
        method: 'DELETE',
      });
      setProfile(next);
      toast.success('Work photo removed');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not remove this photo.',
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-line bg-paper-soft p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-muted">Add work evidence</p>
            <h2 className="mt-2 font-display text-[28px] font-normal tracking-[-0.03em]">
              Show what you have built.
            </h2>
          </div>
          <span className="rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-muted">
            {evidence.length} of 12 photos
          </span>
        </div>

        <form onSubmit={handleUpload} className="mt-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
            <div>
              <label className="label">Work photo</label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-[112px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line bg-paper text-center transition hover:border-forest/40 hover:bg-forest/[0.025]"
              >
                <ImagePlus size={20} className="text-forest" />
                <span className="text-[11px] font-bold text-ink/70">
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
                onChange={(event) =>
                  setFileName(event.target.files?.[0]?.name || '')
                }
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="caption" className="label">
                Short description
              </label>
              <textarea
                id="caption"
                className="input min-h-[76px] flex-1"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="e.g. Rewired a four-bedroom home in Molyko"
                maxLength={140}
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
          {error && (
            <p className="mt-3 text-[11px] text-clay">{error}</p>
          )}
        </form>

        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] leading-relaxed text-muted">
            No photos ready? Add representative samples for your trade to keep
            the demo moving.
          </p>
          <button
            type="button"
            onClick={addSamples}
            disabled={sampling}
            className="btn-outline btn-sm shrink-0"
          >
            {sampling ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : (
              <Plus size={13} />
            )}
            Add sample evidence
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-line bg-paper-soft p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-muted">Your evidence</p>
          {evidence.length >= 3 && (
            <span className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.12em] text-forest">
              <Check size={11} /> Minimum met
            </span>
          )}
        </div>
        {evidence.length === 0 ? (
          <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-paper px-6 py-12 text-center">
            <Camera size={22} className="text-muted/50" />
            <p className="mt-3 font-display text-[22px] font-normal">
              No work photos yet
            </p>
            <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-muted">
              Add at least one photo so customers can see the quality of your
              work.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-line bg-paper"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assetUrl(item.url) || ''}
                  alt={item.caption}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
                <div className="flex items-start justify-between gap-2 p-3">
                  <p className="line-clamp-2 text-[10.5px] font-semibold leading-relaxed text-ink/70">
                    {item.caption}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    disabled={deleting === item.id}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted/50 transition hover:bg-clay/10 hover:text-clay"
                    aria-label="Remove work photo"
                  >
                    {deleting === item.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex max-w-sm items-start gap-2 text-[10px] leading-relaxed text-muted">
            <ShieldCheck size={12} className="mt-0.5 shrink-0 text-forest" />
            Only upload work you completed. Do not include people&apos;s faces or
            private documents.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="text-[11px] font-semibold text-muted hover:text-ink"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={onContinue}
              disabled={evidence.length === 0}
              className="btn-primary shrink-0"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- References step --------------------------- */

function ReferencesStep({
  profile,
  setProfile,
  onContinue,
  onSkip,
}: {
  profile: ArtisanProfile | null;
  setProfile: (profile: ArtisanProfile) => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    contact: '',
    relationship: 'client' as Relationship,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const references = profile?.references || [];
  const counts = profile?.counts;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Add the name of the person who can vouch for you.');
      return;
    }
    if (form.contact.trim().length < 5) {
      setError('Add an email address or phone number for your reference.');
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
      toast.success('Reference invitation created');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not add this reference.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setDeleting(id);
    try {
      const next = await apiFetch<ArtisanProfile>(`/artisans/me/references/${id}`, {
        method: 'DELETE',
      });
      setProfile(next);
      toast.success('Reference removed');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not remove this reference.',
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Confirmed',
            value: counts?.confirmed ?? 0,
            tone: 'text-forest',
          },
          {
            label: 'Awaiting',
            value: counts?.invited ?? 0,
            tone: 'text-[#8a5a10]',
          },
          {
            label: 'Fellow artisans',
            value: counts?.fellowArtisans ?? 0,
            tone: 'text-forest',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-line bg-paper-soft px-5 py-4"
          >
            <p className={cn('font-display text-[30px] tracking-[-0.04em]', stat.tone)}>
              {stat.value}
            </p>
            <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-line bg-paper-soft p-6 shadow-card sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-muted">Invite a reference</p>
            <h2 className="mt-2 font-display text-[28px] font-normal tracking-[-0.03em]">
              Who can vouch for your work?
            </h2>
            <p className="mt-1.5 max-w-md text-[11px] leading-relaxed text-muted">
              Clients, employers, supervisors or fellow artisans. They do not
              need a VeriPass account.
            </p>
          </div>
          <Users size={22} className="hidden shrink-0 text-forest/30 sm:block" />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ref-name" className="label">
              Their name
            </label>
            <input
              id="ref-name"
              className="input"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="e.g. Ashu Nkeng"
              required
            />
          </div>
          <div>
            <label htmlFor="ref-contact" className="label">
              Email or phone
            </label>
            <input
              id="ref-contact"
              className="input"
              value={form.contact}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  contact: event.target.value,
                }))
              }
              placeholder="ashu@example.com or +237 ..."
              required
            />
          </div>
          <div>
            <label htmlFor="ref-relationship" className="label">
              How do they know your work?
            </label>
            <select
              id="ref-relationship"
              className="input"
              value={form.relationship}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  relationship: event.target.value as Relationship,
                }))
              }
            >
              {RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full sm:w-auto"
            >
              {saving ? <Spinner className="h-4 w-4" /> : <Plus size={14} />}
              Create invite link
            </button>
          </div>
          {error && (
            <p className="text-[11px] text-clay sm:col-span-2">{error}</p>
          )}
        </form>
      </div>

      <div className="rounded-[28px] border border-line bg-paper-soft p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-muted">Your references</p>
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted">
            {references.length} invited
          </span>
        </div>

        {references.length === 0 ? (
          <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-paper px-6 py-10 text-center">
            <Users size={22} className="text-muted/50" />
            <p className="mt-3 font-display text-[22px] font-normal">
              No references yet
            </p>
            <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-muted">
              Add at least one reference to reach Work Confirmed after identity
              verification.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-2.5">
            {references.map((reference) => {
              const statusMeta = REFERENCE_STATUS_META[reference.status];
              return (
                <div
                  key={reference.id}
                  className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-4 sm:flex-row sm:items-center"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/[0.07] text-[11px] font-bold text-forest">
                    {reference.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[12px] font-extrabold">
                        {reference.name}
                      </p>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em]',
                          statusMeta.badge,
                        )}
                      >
                        <span
                          className={cn('h-1 w-1 rounded-full', statusMeta.dot)}
                        />
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {RELATIONSHIP_LABEL[reference.relationship]} ·{' '}
                      {reference.contact}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {reference.status === 'invited' && (
                      <CopyButton
                        value={referenceUrl(reference.token)}
                        label="Copy invite"
                        className="!py-1.5 !text-[10px]"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => remove(reference.id)}
                      disabled={deleting === reference.id}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted/50 transition hover:bg-clay/10 hover:text-clay"
                      aria-label="Remove reference"
                    >
                      {deleting === reference.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-forest/[0.045] p-4">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-forest/70">
            The Trusted rule
          </p>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
            To reach <strong className="text-forest">Trusted</strong>, you need
            3 positive references, including at least one from a fellow artisan.
            Invite links are private and unique to each person.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onSkip}
            className="text-left text-[11px] font-semibold text-muted hover:text-ink"
          >
            I&apos;ll add references later
          </button>
          <button type="button" onClick={onContinue} className="btn-primary shrink-0">
            Continue to review
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Review step ------------------------------ */

function ReviewStep({
  profile,
  email,
  onSubmitted,
}: {
  profile: ArtisanProfile | null;
  email?: string;
  onSubmitted: (profile: ArtisanProfile) => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      const next = await apiFetch<ArtisanProfile>('/artisans/me/submit', {
        method: 'POST',
      });
      onSubmitted(next);
      toast.success('Your profile has been submitted');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not submit your profile.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!profile) {
    return (
      <div className="rounded-[28px] border border-line bg-paper-soft p-8 text-center">
        <p className="text-sm text-muted">
          Create your account and complete a step to review your record.
        </p>
      </div>
    );
  }

  const submitted = Boolean(profile.submittedForReviewAt);
  const identityMeta = IDENTITY_META[profile.identityStatus];
  const pending = [
    !profile.checklist.identity && 'Identity verification',
    !profile.checklist.profile && 'Professional profile',
    !profile.checklist.evidence && 'Work evidence',
    !profile.checklist.references && 'A reference invitation',
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-paper-soft p-6 shadow-card sm:p-8">
        <div className="pointer-events-none absolute inset-0 pattern-dots opacity-40" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-muted">Record summary</p>
              <h2 className="mt-2 font-display text-[30px] font-normal tracking-[-0.03em]">
                {submitted
                  ? 'Your record is in the system.'
                  : 'Everything look right?'}
              </h2>
            </div>
            <LevelBadge level={profile.verificationLevel} size="lg" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <ReviewRow
              label="Account"
              value={email || profile.email}
              complete={profile.checklist.account}
            />
            <ReviewRow
              label="Identity"
              value={identityMeta.label}
              complete={profile.checklist.identity}
            />
            <ReviewRow
              label="Trade"
              value={
                profile.trade
                  ? `${profile.trade} · ${profile.location}`
                  : 'Not set'
              }
              complete={profile.checklist.profile}
            />
            <ReviewRow
              label="Work evidence"
              value={`${profile.evidence.length} photo${
                profile.evidence.length === 1 ? '' : 's'
              }`}
              complete={profile.checklist.evidence}
            />
            <ReviewRow
              label="References"
              value={`${profile.counts.confirmed} confirmed · ${profile.counts.invited} invited`}
              complete={profile.checklist.references}
            />
            <ReviewRow
              label="Verification code"
              value={profile.verificationCode}
              complete
              mono
            />
          </div>

          {!submitted && pending.length > 0 && (
            <div className="mt-5 rounded-xl border border-amber/25 bg-amber/[0.07] p-4">
              <p className="text-[11px] font-bold text-[#8a5a10]">
                Still to do for a stronger pass
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-[#8a5a10]/70">
                {pending.join(' · ')}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-[10px] leading-relaxed text-muted">
              {submitted
                ? `Submitted ${formatDate(profile.submittedForReviewAt)}. You can keep adding evidence and references from your dashboard.`
                : 'Submitting sends your profile to the VeriPass review queue. Your references can be confirmed at any time.'}
            </p>
            {submitted ? (
              <Link href="/dashboard" className="btn-primary shrink-0">
                Open your dashboard
                <ArrowRight size={14} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="btn-primary shrink-0"
              >
                {submitting ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <BadgeCheck size={15} />
                )}
                Submit profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_290px]">
        <PassCard
          name={profile.fullName}
          trade={profile.trade}
          location={profile.location}
          code={profile.verificationCode}
          level={profile.verificationLevel}
          avatarUrl={profile.avatarUrl}
          large
          qrSize={78}
        />
        <div className="flex flex-col gap-4">
          <div className="rounded-[22px] border border-line bg-paper-soft p-5">
            <div className="flex items-center gap-2">
              <TrustSeal size={34} tone="light" label="VP" />
              <div>
                <p className="text-[12px] font-extrabold">Your next level</p>
                <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted">
                  {profile.nextLevel.target}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              {profile.nextLevel.hint}
            </p>
          </div>
          <div className="rounded-[22px] bg-forest p-5 text-paper">
            <p className="text-[12px] font-bold">Share your record</p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-paper/45">
              Your pass is public. Anyone with the code{' '}
              <span className="font-mono text-lime">
                {profile.verificationCode}
              </span>{' '}
              can check it.
            </p>
            <Link
              href={`/verify/${profile.verificationCode}`}
              className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-lime hover:underline"
            >
              View public record <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  complete,
  mono = false,
}: {
  label: string;
  value: string;
  complete: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-paper px-4 py-3.5">
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
          complete
            ? 'bg-forest text-lime'
            : 'border border-line bg-paper text-muted/40',
        )}
      >
        {complete ? (
          <Check size={10} strokeWidth={3} />
        ) : (
          <Clock3 size={10} />
        )}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-muted/70">
          {label}
        </p>
        <p
          className={cn(
            'mt-1 truncate text-[11.5px] font-semibold text-ink/75',
            mono && 'font-mono tracking-[0.08em]',
          )}
        >
          {value || '—'}
        </p>
      </div>
    </div>
  );
}
