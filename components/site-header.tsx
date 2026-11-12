'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from './auth-provider';
import { Logo } from './logo';

const NAV = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Verification levels', href: '/#levels' },
  { label: 'For business', href: '/#business' },
  { label: 'Developers', href: '/#developers' },
];

export function SiteHeader({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const dashboardHref =
    session?.user.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-line/60 bg-paper/85 backdrop-blur-xl',
          className,
        )}
      >
        <div className="container-wide flex h-[72px] items-center justify-between gap-6">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[13px] font-semibold text-ink/60 transition hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/verify" className="btn-ghost">
              Verify a pass
            </Link>
            {session ? (
              <Link href={dashboardHref} className="btn-primary">
                Open workspace
                <ArrowUpRight size={14} />
              </Link>
            ) : (
              <Link href="/onboarding" className="btn-primary">
                Get verified
                <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper-soft sm:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto bg-paper px-5 pb-8 pt-8 sm:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between border-b border-line py-4 font-display text-[28px] font-light tracking-[-0.03em]"
              >
                {item.label}
                <span className="font-mono text-[10px] text-muted">
                  0{index + 1}
                </span>
              </Link>
            ))}
            <Link
              href="/verify"
              className="flex items-center justify-between border-b border-line py-4 font-display text-[28px] font-light tracking-[-0.03em]"
            >
              Verify a pass
              <ArrowUpRight size={20} />
            </Link>
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            {session ? (
              <Link href={dashboardHref} className="btn-primary w-full">
                Open workspace
              </Link>
            ) : (
              <Link href="/onboarding" className="btn-primary w-full">
                Get verified
              </Link>
            )}
            <Link href="/login" className="btn-outline w-full">
              Sign in
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
