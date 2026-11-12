import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Logo } from './logo';
import { TrustSeal } from './trust-seal';

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-forest-deep text-paper">
      <div className="pointer-events-none absolute inset-0 pattern-grid-light opacity-60" />
      <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full border border-paper/10" />
      <div className="container-wide relative z-10 pb-12 pt-16 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Logo inverse href="/" />
            <p className="mt-6 font-display text-[28px] font-light leading-[1.15] tracking-[-0.03em] text-paper/90">
              Proof of identity.
              <br />
              Proof of work.
              <br />
              <span className="italic text-lime">Proof of craft.</span>
            </p>
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-paper/50">
              Verification infrastructure for Africa&apos;s skilled workers.
              Built in Buea, designed to scale across the continent.
            </p>
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-paper/15 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-paper/50">
              <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-soft" />
              Demo environment · SQLite
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <FooterColumn
              title="Product"
              links={[
                { label: 'How it works', href: '/#how-it-works' },
                { label: 'Verification levels', href: '/#levels' },
                { label: 'Get verified', href: '/onboarding' },
                { label: 'Verify an artisan', href: '/verify' },
              ]}
            />
            <FooterColumn
              title="Business"
              links={[
                { label: 'For marketplaces', href: '/#business' },
                { label: 'For developers', href: '/#developers' },
                { label: 'API reference', href: '/#developers' },
                { label: 'Trust & safety', href: '/verify' },
              ]}
            />
            <div>
              <p className="eyebrow text-paper/35">Demo access</p>
              <div className="mt-5 space-y-3 text-[12px] leading-relaxed text-paper/55">
                <p>
                  Artisan
                  <br />
                  <span className="font-mono text-paper/80">
                    ama@veripass.demo
                  </span>
                  <br />
                  <span className="font-mono text-paper/80">artisan123</span>
                </p>
                <p>
                  Admin
                  <br />
                  <span className="font-mono text-paper/80">
                    admin@veripass.africa
                  </span>
                  <br />
                  <span className="font-mono text-paper/80">Admin@123</span>
                </p>
              </div>
              <Link
                href="/login"
                className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-bold text-lime hover:underline"
              >
                Sign in to demo <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-8 border-t border-paper/10 pt-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.16em] text-paper/30">
            <span>© {new Date().getFullYear()} VeriPass</span>
            <span>Buea · Cameroon</span>
            <span>Not a marketplace</span>
            <span>We verify. You decide.</span>
          </div>
          <div className="flex items-center gap-5">
            <p className="max-w-[220px] text-[11px] leading-relaxed text-paper/35">
              Identity checks are simulated for this demo. Production
              verification is powered by Didit.
            </p>
            <TrustSeal size={84} label="TRUST" tone="dark" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="eyebrow text-paper/35">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-[13px] text-paper/55 transition hover:text-paper"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
