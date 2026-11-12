'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck, UserRound } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { Logo, LogoMark } from '@/components/logo';
import { PassCard } from '@/components/pass-card';
import { Spinner } from '@/components/loaders';
import { TrustSeal } from '@/components/trust-seal';

const DEMO_ACCOUNTS = [
  {
    role: 'Artisan',
    icon: UserRound,
    email: 'ama@veripass.demo',
    password: 'artisan123',
    description: 'Ama Njie · Trusted electrician',
  },
  {
    role: 'Admin',
    icon: ShieldCheck,
    email: 'admin@veripass.africa',
    password: 'Admin@123',
    description: 'Verification operations',
  },
];

export function LoginClient() {
  const { session, ready, signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const next = searchParams.get('next');

  useEffect(() => {
    if (!ready || !session) return;
    if (session.user.role === 'admin') {
      router.replace('/admin');
    } else {
      router.replace(next && next.startsWith('/') ? next : '/dashboard');
    }
  }, [session, ready, next, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn(email, password);
      toast.success(`Welcome back, ${result.user.fullName.split(' ')[0]}`);
      if (result.user.role === 'admin') router.push('/admin');
      else router.push(next && next.startsWith('/') ? next : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setError('');
    setDemoLoading(account.email);
    setEmail(account.email);
    setPassword(account.password);
    try {
      const result = await signIn(account.email, account.password);
      toast.success(
        `Signed in as ${result.user.role === 'admin' ? 'demo admin' : 'demo artisan'}`,
      );
      router.push(result.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        {/* Editorial side */}
        <aside className="relative hidden overflow-hidden bg-forest-deep p-10 text-paper lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="pointer-events-none absolute inset-0 pattern-grid-light opacity-60" />
          <div className="pointer-events-none absolute -right-40 top-20 h-[540px] w-[540px] rounded-full border border-paper/[0.08]" />
          <div className="pointer-events-none absolute -bottom-48 -left-24 h-[520px] w-[520px] rounded-full border border-paper/[0.06]" />
          <div className="relative z-10 flex items-center justify-between">
            <Logo inverse href="/" />
            <span className="rounded-full border border-paper/15 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-paper/45">
              Demo workspace
            </span>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[430px] py-12">
            <p className="eyebrow text-lime/70">Your reputation, portable</p>
            <h1 className="mt-5 font-display text-[52px] font-light leading-[0.98] tracking-[-0.045em] text-paper xl:text-[62px]">
              One identity.
              <br />
              One record.
              <br />
              <span className="italic text-lime">Anywhere.</span>
            </h1>
            <p className="mt-5 max-w-[340px] text-[13px] leading-[1.8] text-paper/50">
              Sign in to manage your verification record, invite references, and
              share a pass that anyone can check.
            </p>

            <div className="relative mt-10 rotate-[-2deg]">
              <PassCard
                name="Ama Njie"
                trade="Electrician"
                location="Molyko, Buea"
                code="VP-AMA7-2041"
                level="Trusted"
                avatarUrl="/images/ama.jpg"
                qrSize={62}
                className="max-w-[360px]"
              />
            </div>
            <TrustSeal
              size={112}
              tone="dark"
              label="TRUSTED"
              className="absolute -bottom-6 right-0 rotate-[7deg]"
            />
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-paper/10 pt-5 font-mono text-[8px] uppercase tracking-[0.16em] text-paper/30">
            <span>Identity · Evidence · References</span>
            <span>Buea → Africa</span>
          </div>
        </aside>

        {/* Form side */}
        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
          <div className="flex items-center justify-between lg:hidden">
            <Logo />
            <Link href="/" className="btn-ghost">
              <ArrowLeft size={14} />
              Home
            </Link>
          </div>
          <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-10">
            <div className="hidden items-center gap-2 text-[12px] font-semibold text-muted lg:flex">
              <Link href="/" className="link-quiet inline-flex items-center gap-1.5">
                <ArrowLeft size={13} />
                Back to VeriPass
              </Link>
            </div>
            <div className="mt-8">
              <p className="eyebrow flex items-center gap-2 text-forest">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                Sign in
              </p>
              <h2 className="display-tight mt-4 text-[44px] font-light sm:text-[50px]">
                Welcome back.
              </h2>
              <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
                Manage your verification record or open the operations
                dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input input-lg"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="label !mb-0">
                    Password
                  </label>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted/60">
                    Demo only
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="input input-lg pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/35 transition hover:text-ink"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-clay/25 bg-clay/[0.06] px-4 py-3 text-[12px] leading-relaxed text-clay">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || Boolean(demoLoading)}
                className="btn-primary h-12 w-full"
              >
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4" /> Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <span className="h-px flex-1 bg-line" />
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-muted/55">
                Or use a demo account
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="space-y-2.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleDemo(account)}
                  disabled={Boolean(demoLoading) || loading}
                  className="group flex w-full items-center gap-3.5 rounded-2xl border border-line bg-paper-soft p-3.5 text-left transition hover:border-forest/35 hover:bg-white disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest/[0.07] text-forest">
                    {demoLoading === account.email ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <account.icon size={17} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-extrabold">{account.role} demo</p>
                      <span className="rounded-full bg-ink/[0.055] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.08em] text-muted">
                        one click
                      </span>
                    </div>
                    <p className="truncate text-[10px] text-muted">
                      {account.description}
                    </p>
                  </div>
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-forest"
                  />
                </button>
              ))}
            </div>

            <p className="mt-8 text-center text-[12px] text-muted">
              New to VeriPass?{' '}
              <Link
                href="/onboarding"
                className="font-bold text-forest hover:underline"
              >
                Create your digital pass
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-line py-4 font-mono text-[8px] uppercase tracking-[0.14em] text-muted/50">
            <span className="inline-flex items-center gap-1.5">
              <LogoMark size={16} /> VeriPass demo
            </span>
            <span>SQLite · local API</span>
          </div>
        </section>
      </div>
    </main>
  );
}
