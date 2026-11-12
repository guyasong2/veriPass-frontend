'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Camera,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  QrCode,
  ShieldCheck,
  UserRound,
  Users,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { cn, initials } from '@/lib/utils';
import { useAuth } from './auth-provider';
import { useArtisanData } from './artisan-data-provider';
import { Avatar } from './avatar';
import { LevelBadge } from './level-badge';
import { Logo, LogoMark } from './logo';
import { InlineLoader, PageLoader } from './loaders';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string | number;
}

function isActive(pathname: string | null, item: NavItem) {
  if (!pathname) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function ArtisanShell({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth();
  const { profile, loading, error, refresh } = useArtisanData();
  const pathname = usePathname();
  const router = useRouter();

  const nav: NavItem[] = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Digital pass', href: '/dashboard/card', icon: QrCode },
    { label: 'Work evidence', href: '/dashboard/evidence', icon: Camera },
    { label: 'References', href: '/dashboard/references', icon: Users },
    { label: 'Profile & identity', href: '/dashboard/profile', icon: UserRound },
  ];

  if (loading && !profile) return <PageLoader label="Opening your workspace" />;

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-5 text-center">
        <LogoMark size={40} />
        <p className="font-display text-[28px] font-normal">
          We couldn&apos;t open your record
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          {error || 'Your artisan profile could not be loaded.'}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => refresh()} className="btn-primary">
            Try again
          </button>
          <button
            type="button"
            onClick={() => {
              signOut();
              router.replace('/login');
            }}
            className="btn-outline"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const missingProfile = !profile.checklist.profile;
  const missingIdentity = !profile.checklist.identity;

  return (
    <div className="min-h-screen bg-paper">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[264px_1fr]">
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-paper-soft px-4 py-5 lg:flex">
          <div className="px-2">
            <Logo href="/" />
          </div>

          <div className="mt-7 rounded-2xl border border-line bg-paper p-3.5">
            <div className="flex items-center gap-3">
              <Avatar
                name={profile.fullName}
                src={profile.avatarUrl}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-extrabold">
                  {profile.fullName}
                </p>
                <p className="truncate text-[10px] text-muted">
                  {profile.trade || 'Artisan'} · {profile.location}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <LevelBadge level={profile.verificationLevel} size="sm" />
              <span className="font-mono text-[8px] tracking-[0.1em] text-muted">
                {profile.verificationCode}
              </span>
            </div>
          </div>

          <nav className="mt-6 space-y-0.5" aria-label="Dashboard">
            <p className="eyebrow px-3 pb-2 text-muted/60">Workspace</p>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition',
                  isActive(pathname, item)
                    ? 'bg-forest text-paper'
                    : 'text-ink/60 hover:bg-ink/[0.045] hover:text-ink',
                )}
              >
                <item.icon
                  size={15}
                  strokeWidth={1.8}
                  className={
                    isActive(pathname, item)
                      ? 'text-lime'
                      : 'text-ink/35 group-hover:text-forest'
                  }
                />
                {item.label}
                {item.label === 'References' &&
                  profile.counts.invited > 0 && (
                    <span
                      className={cn(
                        'ml-auto rounded-full px-1.5 py-0.5 font-mono text-[8px]',
                        isActive(pathname, item)
                          ? 'bg-lime text-forest'
                          : 'bg-amber/15 text-[#8a5a10]',
                      )}
                    >
                      {profile.counts.invited}
                    </span>
                  )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3 pt-6">
            {missingIdentity || missingProfile ? (
              <Link
                href="/onboarding"
                className="block rounded-2xl bg-forest p-4 text-paper transition hover:bg-forest-mid"
              >
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-lime">
                  Action needed
                </p>
                <p className="mt-1.5 text-[12px] font-bold">
                  {missingIdentity
                    ? 'Verify your identity'
                    : 'Complete your profile'}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-paper/45">
                  {missingIdentity
                    ? 'Finish the Didit check to unlock public verification.'
                    : 'Add your trade and story before sharing your pass.'}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-lime">
                  Continue setup <ArrowUpRight size={11} />
                </span>
              </Link>
            ) : (
              <Link
                href={`/verify/${profile.verificationCode}`}
                className="block rounded-2xl border border-forest/15 bg-forest/[0.045] p-4 transition hover:border-forest/30"
              >
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-forest">
                  Public pass
                </p>
                <p className="mt-1.5 font-mono text-[11px] tracking-[0.1em] text-forest">
                  {profile.verificationCode}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted">
                  {profile.profileViews} checks so far
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-forest">
                  View public record <ArrowUpRight size={11} />
                </span>
              </Link>
            )}

            <div className="flex items-center justify-between border-t border-line pt-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted transition hover:text-ink"
              >
                <ArrowLeft size={11} />
                Back to site
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.replace('/');
                }}
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted transition hover:text-clay"
              >
                <LogOut size={11} />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-xl lg:hidden">
            <div className="flex h-16 items-center justify-between gap-3 px-5">
              <Logo href="/" markSize={28} />
              <div className="flex items-center gap-2">
                <LevelBadge level={profile.verificationLevel} size="sm" />
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    router.replace('/');
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-paper-soft text-muted"
                  aria-label="Sign out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
            <nav
              className="flex items-center gap-1.5 overflow-x-auto px-4 pb-3 hide-scrollbar"
              aria-label="Dashboard"
            >
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold transition',
                    isActive(pathname, item)
                      ? 'border-forest bg-forest text-lime'
                      : 'border-line bg-paper-soft text-ink/60',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="min-w-0 px-5 py-7 pb-16 sm:px-7 lg:px-9 lg:py-9 xl:px-12">
            <div className="mx-auto w-full max-w-[1180px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const nav: NavItem[] = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Artisans', href: '/admin/artisans', icon: UsersRound },
    { label: 'Activity log', href: '/admin/activity', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[264px_1fr]">
        <aside className="relative hidden h-screen flex-col overflow-hidden bg-forest-deep px-4 py-5 text-paper lg:sticky lg:top-0 lg:flex">
          <div className="pointer-events-none absolute inset-0 pattern-grid-light opacity-40" />
          <div className="relative z-10 px-2">
            <Logo href="/" inverse />
            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-soft" />
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-paper/40">
                Operations console
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-7 rounded-2xl border border-paper/12 bg-paper/[0.05] p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime font-mono text-[12px] font-bold text-forest">
                {initials(session?.user.fullName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-bold">
                  {session?.user.fullName || 'VeriPass admin'}
                </p>
                <p className="truncate text-[9px] text-paper/40">
                  {session?.user.email}
                </p>
              </div>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-paper/15 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.14em] text-paper/45">
              <ShieldCheck size={9} />
              Admin access
            </span>
          </div>

          <nav className="relative z-10 mt-6 space-y-0.5" aria-label="Admin">
            <p className="eyebrow px-3 pb-2 text-paper/25">Operations</p>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition',
                  isActive(pathname, item)
                    ? 'bg-lime text-forest'
                    : 'text-paper/55 hover:bg-paper/[0.06] hover:text-paper',
                )}
              >
                <item.icon size={15} strokeWidth={1.8} />
                {item.label}
                <ChevronRight
                  size={13}
                  className={cn(
                    'ml-auto',
                    isActive(pathname, item) ? 'text-forest/50' : 'text-paper/20',
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="relative z-10 mt-6 rounded-2xl border border-paper/10 p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-paper/30">
              Demo environment
            </p>
            <p className="mt-2 text-[10px] leading-relaxed text-paper/40">
              Offline NestJS API · local SQLite · simulated Didit checks.
            </p>
            <div className="mt-3 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-lime/70">
              <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-soft" />
              All systems local
            </div>
          </div>

          <div className="relative z-10 mt-auto flex items-center justify-between border-t border-paper/10 pt-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-paper/35 transition hover:text-paper"
            >
              <ArrowLeft size={11} />
              Back to site
            </Link>
            <button
              type="button"
              onClick={() => {
                signOut();
                router.replace('/');
              }}
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-paper/35 transition hover:text-clay"
            >
              <LogOut size={11} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-xl lg:hidden">
            <div className="flex h-16 items-center justify-between gap-3 px-5">
              <div className="flex items-center gap-2.5">
                <LogoMark size={28} />
                <div>
                  <p className="text-[13px] font-extrabold tracking-[-0.03em]">
                    Veri<span className="font-medium">Pass</span>
                  </p>
                  <p className="font-mono text-[7px] uppercase tracking-[0.14em] text-muted">
                    Operations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.replace('/');
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-paper-soft text-muted"
                aria-label="Sign out"
              >
                <LogOut size={13} />
              </button>
            </div>
            <nav
              className="flex items-center gap-1.5 overflow-x-auto px-4 pb-3 hide-scrollbar"
              aria-label="Admin"
            >
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold transition',
                    isActive(pathname, item)
                      ? 'border-forest bg-forest text-lime'
                      : 'border-line bg-paper-soft text-ink/60',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="min-w-0 px-5 py-7 pb-16 sm:px-7 lg:px-9 lg:py-9 xl:px-12">
            <div className="mx-auto w-full max-w-[1240px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceLoading({ label }: { label?: string }) {
  return <InlineLoader label={label || 'Loading'} />;
}
