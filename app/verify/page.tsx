import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Fingerprint, Camera, Users, ShieldCheck, ScanLine, ExternalLink } from 'lucide-react';
import { LevelBadge } from '@/components/level-badge';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { TrustSeal } from '@/components/trust-seal';
import { VerifyForm } from '@/components/verify-form';

export const metadata: Metadata = {
  title: 'Verify an artisan',
  description:
    'Check a VeriPass code to see an artisan’s identity status, work evidence and confirmed references.',
};

const SAMPLES = [
  {
    code: 'VP-AMA7-2041',
    name: 'Ama Njie',
    trade: 'Electrician',
    level: 'Trusted' as const,
  },
  {
    code: 'VP-TAB3-1187',
    name: 'Tabe Ekema',
    trade: 'Carpenter',
    level: 'Work Confirmed' as const,
  },
  {
    code: 'VP-NKE5-3320',
    name: 'Nkem Okafor',
    trade: 'Mechanic',
    level: 'ID Verified' as const,
  },
];

export default function VerifyLandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main id="main-content">
        <section className="relative overflow-hidden border-b border-line">
          <div className="pointer-events-none absolute inset-0 pattern-grid opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
          <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full border border-ink/[0.06]" />
          <div className="container-reading relative z-10 py-16 text-center md:py-24">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-lime shadow-lift">
              <ScanLine size={22} />
            </div>
            <p className="eyebrow text-forest">Public verification</p>
            <h1 className="display-tight mx-auto mt-5 max-w-[740px] text-[52px] font-light sm:text-[68px] lg:text-[80px]">
              Check a VeriPass
              <br />
              code. <span className="italic text-forest">Know the person.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[520px] text-[14px] leading-[1.8] text-ink/55">
              Every VeriPass carries a code and QR. Enter it below to see a
              live record of identity, work evidence and the people who have
              vouched for that artisan.
            </p>
            <div className="mx-auto mt-8 max-w-[600px]">
              <VerifyForm autoFocus />
            </div>
            <div className="mx-auto mt-5 flex max-w-[640px] flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted/60">
                Try a demo pass
              </span>
              {SAMPLES.map((sample) => (
                <Link
                  key={sample.code}
                  href={`/verify/${sample.code}`}
                  className="rounded-full border border-line bg-paper-soft px-3 py-1.5 font-mono text-[9px] tracking-[0.06em] text-ink/55 transition hover:border-forest/30 hover:text-forest"
                >
                  {sample.code}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="container-wide py-20">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Fingerprint,
                number: '01',
                title: 'Identity',
                copy: 'Document authenticity, liveness detection and facial matching through Didit.',
              },
              {
                icon: Camera,
                number: '02',
                title: 'Work evidence',
                copy: 'Photographs and descriptions of completed projects, published by the artisan.',
              },
              {
                icon: Users,
                number: '03',
                title: 'References',
                copy: 'Confirmations from clients, employers and fellow artisans who know the work.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-[26px] border border-line bg-paper-soft p-6 transition hover:border-forest/25"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/[0.07] text-forest">
                    <item.icon size={19} />
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.16em] text-muted/50">
                    {item.number}
                  </span>
                </div>
                <h2 className="mt-8 font-display text-[26px] font-normal tracking-[-0.03em]">
                  {item.title}
                </h2>
                <p className="mt-2 text-[12px] leading-[1.7] text-muted">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative overflow-hidden rounded-[28px] bg-forest p-7 text-paper sm:p-9">
              <div className="pointer-events-none absolute inset-0 pattern-grid-light opacity-50" />
              <div className="relative z-10 max-w-[460px]">
                <p className="eyebrow text-lime">How to read a record</p>
                <h2 className="mt-4 font-display text-[32px] font-light leading-[1.08] tracking-[-0.035em] text-paper sm:text-[38px]">
                  The level is a summary.
                  <br />
                  <span className="italic text-lime">The record is the proof.</span>
                </h2>
                <p className="mt-4 text-[13px] leading-[1.8] text-paper/50">
                  A Trusted level means identity is verified and at least three
                  positive references — including one from a fellow artisan —
                  have been confirmed. Open the record to see the actual
                  evidence.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Draft', 'Under Review', 'ID Verified', 'Work Confirmed', 'Trusted'].map(
                    (level) => (
                      <LevelBadge
                        key={level}
                        level={level}
                        size="sm"
                        className={level === 'Trusted' ? '!border-lime !bg-lime !text-forest' : '!border-paper/15 !bg-paper/[0.06] !text-paper/65'}
                      />
                    ),
                  )}
                </div>
              </div>
              <TrustSeal
                size={124}
                tone="dark"
                label="PUBLIC RECORD"
                className="absolute -bottom-4 right-4 hidden sm:block"
              />
            </div>

            <div className="rounded-[28px] border border-line bg-paper-soft p-7 sm:p-9">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-forest" />
                <p className="text-[13px] font-extrabold">What verification is — and isn&apos;t</p>
              </div>
              <p className="mt-4 text-[13px] leading-[1.8] text-muted">
                VeriPass confirms identity signals and records what named
                references have confirmed. It is not a guarantee of future work,
                a quote, or a substitute for your own judgement.
              </p>
              <div className="mt-5 space-y-2.5">
                {[
                  'Always agree scope, timing and price directly.',
                  'Check that the trade and location match your job.',
                  'Read the references and evidence, not only the badge.',
                ].map((item) => (
                  <p
                    key={item}
                    className="flex items-start gap-2 text-[12px] font-semibold text-ink/60"
                  >
                    <Check size={13} className="mt-0.5 shrink-0 text-forest" />
                    {item}
                  </p>
                ))}
              </div>
              <Link
                href="/verify/VP-AMA7-2041"
                className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-bold text-forest hover:underline"
              >
                Open a full sample record <ExternalLink size={12} />
              </Link>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-2xl border border-line bg-paper-soft p-6 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-display text-[25px] font-normal tracking-[-0.02em]">
                Are you a skilled artisan?
              </p>
              <p className="mt-1 text-[12px] text-muted">
                Build a verification record your next customer can check.
              </p>
            </div>
            <Link href="/onboarding" className="btn-primary shrink-0">
              Create your pass
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
