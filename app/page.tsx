import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Camera,
  Check,
  Code2,
  FileCheck2,
  Fingerprint,
  MapPin,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  UserRoundCheck,
  Users,
  X,
} from 'lucide-react';
import { ApiExample } from '@/components/api-example';
import { Avatar } from '@/components/avatar';
import { LevelBadge } from '@/components/level-badge';
import { LogoMark } from '@/components/logo';
import { PassCard } from '@/components/pass-card';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Stars } from '@/components/stars';
import { TrustSeal } from '@/components/trust-seal';
import { VerifyForm } from '@/components/verify-form';
import { LADDER, LEVEL_META } from '@/lib/levels';
import type { VerificationLevel } from '@/lib/types';

const STEPS = [
  {
    number: '01',
    icon: Smartphone,
    title: 'Build your profile',
    copy: 'Trade, location, experience and availability. A simple, mobile-first record that works on any phone.',
    tag: '2 minutes',
  },
  {
    number: '02',
    icon: Fingerprint,
    title: 'Verify your identity',
    copy: 'A government ID, a liveness check and facial matching. Powered by Didit, never stored as loose photos.',
    tag: 'Didit',
  },
  {
    number: '03',
    icon: Camera,
    title: 'Show your work',
    copy: 'Add photographs and short descriptions of completed jobs. Evidence people can actually see.',
    tag: 'Work evidence',
  },
  {
    number: '04',
    icon: Users,
    title: 'Invite references',
    copy: 'Clients, employers and fellow artisans get a private link to confirm the work they know about.',
    tag: 'No account needed',
  },
  {
    number: '05',
    icon: BadgeCheck,
    title: 'Earn a level',
    copy: 'Confirmed references build a clear verification level — from ID Verified to Work Confirmed to Trusted.',
    tag: 'Transparent rules',
  },
  {
    number: '06',
    icon: QrCode,
    title: 'Share your pass',
    copy: 'Every artisan gets a unique code and QR. Anyone can check the record before hiring, in one scan.',
    tag: 'Portable proof',
  },
];

const LEVEL_ROWS: {
  level: VerificationLevel;
  meaning: string;
  signal: string;
}[] = [
  {
    level: 'Draft',
    meaning: 'Profile incomplete or identity verification not completed.',
    signal: 'Setup',
  },
  {
    level: 'Under Review',
    meaning: 'Information submitted and waiting for a verification outcome.',
    signal: 'In progress',
  },
  {
    level: 'ID Verified',
    meaning:
      'Government ID, liveness and face match confirmed through Didit.',
    signal: 'Identity',
  },
  {
    level: 'Work Confirmed',
    meaning: 'Identity verified and at least one reference confirms their work.',
    signal: '1+ reference',
  },
  {
    level: 'Trusted',
    meaning:
      '3+ positive references, including at least one from a fellow artisan.',
    signal: 'Highest trust',
  },
  {
    level: 'Rejected',
    meaning: 'Identity verification or profile review was declined.',
    signal: 'Restricted',
  },
  {
    level: 'Suspended',
    meaning: 'Account suspended by VeriPass operations pending review.',
    signal: 'Restricted',
  },
];

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/verify/:code',
    copy: 'Look up an artisan pass, verification level and trust signals.',
  },
  {
    method: 'POST',
    path: '/api/references/:token/respond',
    copy: 'Receive a confirmation from a client, employer or peer.',
  },
  {
    method: 'GET',
    path: '/api/artisans/me',
    copy: 'Issue and manage a verified artisan identity and work record.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main id="main-content">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="pointer-events-none absolute inset-0 pattern-grid opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
          <div className="pointer-events-none absolute -left-40 top-20 h-[460px] w-[460px] rounded-full border border-ink/[0.06]" />
          <div className="pointer-events-none absolute -right-60 top-40 h-[620px] w-[620px] rounded-full border border-ink/[0.05]" />
          <div className="container-wide relative z-10 grid items-center gap-14 pb-24 pt-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10 lg:pb-32 lg:pt-20">
            <div className="animate-fade-up">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-forest/[0.055] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.17em] text-forest">
                  <span className="h-1.5 w-1.5 rounded-full bg-forest animate-pulse-soft" />
                  Artisan verification infrastructure
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                  Buea → Africa
                </span>
              </div>

              <h1 className="display-tight text-[62px] font-light sm:text-[80px] lg:text-[86px] xl:text-[100px]">
                Proof of craft.
                <br />
                Built on{' '}
                <span className="relative inline-block italic font-normal text-forest">
                  trust
                  <span className="absolute inset-x-1 bottom-[0.1em] -z-10 h-[0.22em] bg-lime/85" />
                </span>
                .
              </h1>

              <p className="mt-7 max-w-[520px] text-[15px] leading-[1.75] text-ink/60 sm:text-base">
                VeriPass gives electricians, carpenters, mechanics and every
                skilled artisan a verifiable digital identity — so the next
                customer can know exactly who they&apos;re hiring, and what
                their work is worth.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/onboarding" className="btn-primary">
                  Create your VeriPass
                  <ArrowUpRight size={15} />
                </Link>
                <Link href="/verify" className="btn-outline">
                  <ScanLine size={15} />
                  Check an artisan pass
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px] font-semibold text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Fingerprint size={14} className="text-forest" />
                  Identity via Didit
                </span>
                <span className="h-[3px] w-[3px] rounded-full bg-ink/20" />
                <span className="inline-flex items-center gap-1.5">
                  <Camera size={14} className="text-forest" />
                  Work evidence
                </span>
                <span className="h-[3px] w-[3px] rounded-full bg-ink/20" />
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} className="text-forest" />
                  Human references
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div
              className="relative mx-auto w-full max-w-[500px] animate-fade-up lg:ml-auto"
              style={{ animationDelay: '140ms' }}
            >
              <div className="absolute -inset-x-6 bottom-0 top-14 -rotate-[5deg] rounded-[46px] bg-lime sm:-inset-x-8" />
              <div className="pointer-events-none absolute -left-8 -top-9 h-24 w-24 rounded-full border border-ink/15 pattern-dots" />
              <div className="pointer-events-none absolute -right-6 top-24 h-12 w-12 rounded-full bg-amber/80" />
              <div className="relative z-10 rotate-[-2deg] transition-transform duration-700 ease-out hover:rotate-0">
                <PassCard
                  name="Ama Njie"
                  trade="Electrician"
                  location="Molyko, Buea"
                  code="VP-AMA7-2041"
                  level="Trusted"
                  avatarUrl="/images/ama.jpg"
                  large
                  qrSize={82}
                  verifiedSince="Aug 2026"
                />
              </div>

              <TrustSeal
                size={126}
                tone="light"
                label="TRUSTED"
                className="absolute -bottom-12 -left-7 z-20 hidden sm:block"
              />

              <div className="absolute -right-3 top-8 z-20 hidden w-[200px] rotate-[2.5deg] rounded-2xl border border-line bg-paper-soft/95 p-3.5 shadow-card backdrop-blur sm:block">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[8px] uppercase tracking-[0.17em] text-muted">
                    Reference confirmed
                  </p>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest text-lime">
                    <Check size={11} strokeWidth={3} />
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Avatar name="Tabe Ekema" size={28} />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold">Tabe Ekema</p>
                    <p className="font-mono text-[8px] uppercase tracking-wider text-muted">
                      Fellow artisan
                    </p>
                  </div>
                </div>
                <Stars rating={5} size={10} className="mt-2.5" />
                <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-ink/50">
                  “Meticulous with safety and finishing.”
                </p>
              </div>

              <div className="absolute -bottom-7 right-0 z-20 hidden rounded-full border border-ink/10 bg-paper px-4 py-2 font-mono text-[8px] uppercase tracking-[0.18em] text-ink/55 shadow-crisp sm:flex">
                Scan · Verify · Decide
              </div>
            </div>
          </div>

          <div className="container-wide relative z-10 grid gap-4 border-t border-line py-5 text-[11px] sm:grid-cols-3">
            <p className="flex items-center gap-2 text-muted">
              <UserRoundCheck size={14} className="text-forest" />
              For artisans building portable reputation
            </p>
            <p className="flex items-center gap-2 text-muted sm:justify-center">
              <ShieldCheck size={14} className="text-forest" />
              For customers making a confident hire
            </p>
            <p className="flex items-center gap-2 text-muted sm:justify-end">
              <Building2 size={14} className="text-forest" />
              For platforms that need trust at scale
            </p>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="overflow-hidden border-b border-forest bg-forest py-3.5 text-lime">
          <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-[0.22em]"
                aria-hidden={copy === 1}
              >
                {[
                  'Identity',
                  'Work evidence',
                  'Client references',
                  'Peer confirmation',
                  'One scannable pass',
                  'Trust that travels',
                ].map((item) => (
                  <span key={item} className="flex items-center gap-8">
                    {item}
                    <span className="text-lime/35">✳</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* PROBLEM / TRUST STACK */}
        <section className="container-wide py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="eyebrow flex items-center gap-2 text-forest">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                The trust gap
              </p>
              <h2 className="display-tight mt-5 max-w-[560px] text-[46px] font-light sm:text-[58px]">
                A handshake is
                <br />
                not a{' '}
                <span className="italic text-forest">credential.</span>
              </h2>
            </div>
            <div className="max-w-[520px] lg:justify-self-end">
              <p className="text-[15px] leading-[1.8] text-ink/60">
                Across Africa, skilled work runs on reputation. But that
                reputation lives in WhatsApp threads, old customers&apos;
                memories and a list of names on a phone. The moment an artisan
                moves neighbourhoods — or a customer needs to trust someone new
                — it disappears.
              </p>
              <p className="mt-4 text-[15px] leading-[1.8] text-ink/60">
                VeriPass makes that invisible reputation visible, portable and
                checkable.
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              {
                image: '/images/artisan-electrician.jpg',
                index: '01',
                title: 'Who is this person?',
                copy: 'Identity, verified against a real document and a live face.',
                label: 'Identity',
              },
              {
                image: '/images/craft-carpentry.jpg',
                index: '02',
                title: 'Can they do the work?',
                copy: 'A visible record of finished jobs, not just a description.',
                label: 'Evidence',
              },
              {
                image: '/images/artisan-tailor.jpg',
                index: '03',
                title: 'Do others vouch for them?',
                copy: 'Confirmations from clients, employers and fellow artisans.',
                label: 'References',
              },
            ].map((item) => (
              <article
                key={item.label}
                className="group relative overflow-hidden rounded-[26px] bg-forest"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt=""
                  className="h-[330px] w-full object-cover opacity-80 grayscale-[25%] transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/25 to-transparent" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                  <span className="rounded-full border border-paper/20 bg-forest-deep/40 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-paper/70 backdrop-blur">
                    {item.label}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.15em] text-paper/40">
                    {item.index}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-[27px] font-light leading-tight text-paper">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 max-w-[280px] text-[12px] leading-relaxed text-paper/55">
                    {item.copy}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.16em] text-lime">
                    <Check size={11} /> One trust signal
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="relative overflow-hidden bg-forest-deep text-paper"
        >
          <div className="pointer-events-none absolute inset-0 pattern-grid-light opacity-50" />
          <div className="pointer-events-none absolute -right-48 -top-48 h-[600px] w-[600px] rounded-full border border-paper/[0.07]" />
          <div className="pointer-events-none absolute -bottom-60 -left-20 h-[500px] w-[500px] rounded-full border border-paper/[0.06]" />
          <div className="container-wide relative z-10 py-24 lg:py-32">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
              <div>
                <p className="eyebrow flex items-center gap-2 text-lime">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                  How VeriPass works
                </p>
                <h2 className="display-tight mt-5 max-w-[760px] text-[46px] font-light text-paper sm:text-[60px]">
                  Six steps from
                  <br />
                  <span className="italic text-lime">stranger</span> to someone
                  you can verify.
                </h2>
              </div>
              <div className="max-w-[380px] lg:justify-self-end">
                <p className="text-[14px] leading-[1.8] text-paper/55">
                  The artisan does the work. Didit checks identity. Real people
                  confirm the record. VeriPass turns those signals into one
                  clear level.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-paper/15 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-paper/50">
                    Mobile-first
                  </span>
                  <span className="rounded-full border border-paper/15 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-paper/50">
                    Under 10 minutes
                  </span>
                  <span className="rounded-full border border-paper/15 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-paper/50">
                    Consent-led
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-16 grid gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="group border-t border-paper/15 pt-5 transition-colors hover:border-lime/50"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-paper/30">
                      {step.number}
                    </span>
                    <step.icon
                      size={20}
                      strokeWidth={1.6}
                      className="text-paper/35 transition group-hover:text-lime"
                    />
                  </div>
                  <h3 className="mt-8 font-display text-[27px] font-light tracking-[-0.03em] text-paper">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[320px] text-[13px] leading-[1.7] text-paper/45">
                    {step.copy}
                  </p>
                  <span className="mt-5 inline-block rounded-full border border-paper/10 bg-paper/[0.04] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-lime/65">
                    {step.tag}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-2xl border border-paper/12 bg-paper/[0.04] p-6 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-[24px] font-light text-paper">
                  Ready to turn your reputation into a record?
                </p>
                <p className="mt-1 text-[12px] text-paper/40">
                  Demo environment — takes about three minutes.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link href="/onboarding" className="btn-lime">
                  Start verification
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/verify/VP-AMA7-2041"
                  className="btn inline-flex h-11 items-center rounded-full border border-paper/20 px-5 text-[13px] font-bold text-paper transition hover:bg-paper/10"
                >
                  See a sample pass
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* LEVELS */}
        <section id="levels" className="container-wide py-24 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="self-start lg:sticky lg:top-28">
              <p className="eyebrow flex items-center gap-2 text-forest">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                The verification ladder
              </p>
              <h2 className="display-tight mt-5 max-w-[420px] text-[46px] font-light sm:text-[58px]">
                Trust you can read{' '}
                <span className="italic text-forest">at a glance.</span>
              </h2>
              <p className="mt-5 max-w-[380px] text-[14px] leading-[1.8] text-ink/55">
                Every level has a rule. No mystery scores, no pay-to-win. Just
                identity, evidence and people willing to put their name behind
                the work.
              </p>

              <div className="relative mt-10 overflow-hidden rounded-[28px] border border-line bg-paper-soft p-6">
                <div className="pointer-events-none absolute inset-0 pattern-dots opacity-60" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                      The three signals
                    </p>
                    <div className="mt-5 space-y-4">
                      {[
                        { label: 'Who you are', icon: Fingerprint },
                        { label: 'What you have done', icon: Camera },
                        { label: 'Who vouches for you', icon: Users },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 text-[13px] font-semibold"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-forest/15 bg-forest/[0.05] text-forest">
                            <item.icon size={14} />
                          </span>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <TrustSeal size={110} tone="lime" label="TRUSTED" />
                </div>
                <Link
                  href="/verify/VP-AMA7-2041"
                  className="relative mt-6 inline-flex items-center gap-1.5 text-[12px] font-bold text-forest hover:underline"
                >
                  Open a real demo record <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

            <div>
              {LEVEL_ROWS.map((row, index) => {
                const meta = LEVEL_META[row.level];
                const highlight = row.level === 'Trusted';
                return (
                  <div
                    key={row.level}
                    className={
                      highlight
                        ? 'relative -mx-3 my-3 grid gap-3 rounded-[24px] bg-forest p-6 text-paper sm:grid-cols-[44px_1fr_auto] sm:items-center sm:px-7'
                        : 'group grid gap-3 border-t border-line py-6 transition-colors last:border-b sm:grid-cols-[44px_1fr_auto] sm:items-center'
                    }
                  >
                    <span
                      className={
                        highlight
                          ? 'font-mono text-[10px] tracking-[0.15em] text-lime/60'
                          : 'font-mono text-[10px] tracking-[0.15em] text-muted/60'
                      }
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
                      <div className="w-[132px] shrink-0">
                        <LevelBadge
                          level={row.level}
                          size="sm"
                          className={
                            highlight
                              ? '!border-lime !bg-lime !text-forest'
                              : undefined
                          }
                        />
                      </div>
                      <p
                        className={
                          highlight
                            ? 'max-w-[390px] text-[13px] leading-relaxed text-paper/65'
                            : 'max-w-[390px] text-[13px] leading-relaxed text-ink/55'
                        }
                      >
                        {row.meaning}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <span
                        className={
                          highlight
                            ? 'font-mono text-[8px] uppercase tracking-[0.16em] text-lime/65'
                            : 'font-mono text-[8px] uppercase tracking-[0.16em] text-muted/50'
                        }
                      >
                        {row.signal}
                      </span>
                      {highlight && (
                        <div className="mt-2 flex justify-end gap-1">
                          {[0, 1, 2].map((dot) => (
                            <span
                              key={dot}
                              className="h-1.5 w-1.5 rounded-full bg-lime"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <p className="mt-5 flex items-start gap-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-muted/60">
                <ShieldCheck size={13} className="mt-0.5 shrink-0 text-forest" />
                Levels are recalculated automatically as identity checks and
                references are completed.
              </p>
            </div>
          </div>
        </section>

        {/* BUSINESS */}
        <section id="business" className="container-wide pb-8">
          <div className="relative overflow-hidden rounded-[36px] bg-forest text-paper">
            <div className="pointer-events-none absolute inset-0 pattern-grid-light opacity-50" />
            <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border border-paper/10" />
            <div className="grid gap-12 p-7 sm:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:p-14">
              <div className="flex flex-col justify-center">
                <p className="eyebrow flex items-center gap-2 text-lime">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                  For businesses & marketplaces
                </p>
                <h2 className="display-tight mt-5 max-w-[480px] text-[42px] font-light text-paper sm:text-[54px]">
                  One API call.
                  <br />
                  A decision you can{' '}
                  <span className="italic text-lime">stand behind.</span>
                </h2>
                <p className="mt-5 max-w-[440px] text-[14px] leading-[1.8] text-paper/55">
                  Stop asking for screenshots and phone numbers. Check identity
                  and work history before an artisan joins your marketplace,
                  enters a property or takes on a job.
                </p>
                <ul className="mt-7 space-y-3">
                  {[
                    'Verify identity and level at onboarding',
                    'Display confirmed work evidence on listings',
                    'Flag suspended or rejected accounts before they transact',
                    'Integrate with a single read-only endpoint',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[13px] text-paper/70"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime text-forest">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-2.5">
                  <a href="#developers" className="btn-lime">
                    Explore the API
                    <ArrowRight size={14} />
                  </a>
                  <Link
                    href="/verify/VP-GRA2-7745"
                    className="btn inline-flex h-11 items-center rounded-full border border-paper/20 px-5 text-[13px] font-bold text-paper transition hover:bg-paper/10"
                  >
                    Verify a sample artisan
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <ApiExample className="w-full" />
              </div>
            </div>
            <div className="grid border-t border-paper/10 sm:grid-cols-3">
              {[
                {
                  icon: Building2,
                  label: 'Marketplaces',
                  copy: 'Trusted supply from day one',
                },
                {
                  icon: ShieldCheck,
                  label: 'Property teams',
                  copy: 'Know who enters your sites',
                },
                {
                  icon: Users,
                  label: 'Hiring teams',
                  copy: 'Shortlist on evidence, not vibes',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 border-b border-paper/10 px-7 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:px-10"
                >
                  <item.icon size={16} className="text-lime/70" />
                  <div>
                    <p className="text-[12px] font-bold text-paper/85">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-paper/35">
                      {item.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEVELOPERS */}
        <section id="developers" className="container-wide py-24 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="eyebrow flex items-center gap-2 text-forest">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                Developers
              </p>
              <h2 className="display-tight mt-5 max-w-[440px] text-[44px] font-light sm:text-[54px]">
                Verification infrastructure,{' '}
                <span className="italic text-forest">not another marketplace.</span>
              </h2>
              <p className="mt-5 max-w-[460px] text-[14px] leading-[1.8] text-ink/55">
                VeriPass does not take bookings, process payments or compete for
                customers. It provides the trust layer other products build on.
              </p>

              <div className="mt-8 space-y-3">
                {ENDPOINTS.map((endpoint) => (
                  <div
                    key={endpoint.path}
                    className="group flex items-start gap-4 rounded-2xl border border-line bg-paper-soft p-4 transition hover:border-forest/30"
                  >
                    <span
                      className={
                        endpoint.method === 'GET'
                          ? 'rounded-md border border-sky/30 bg-sky/10 px-2 py-1 font-mono text-[9px] font-medium text-[#345a75]'
                          : 'rounded-md border border-forest/25 bg-forest/[0.07] px-2 py-1 font-mono text-[9px] font-medium text-forest'
                      }
                    >
                      {endpoint.method}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[11px] font-medium text-ink/75">
                        {endpoint.path}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted">
                        {endpoint.copy}
                      </p>
                    </div>
                    <Code2
                      size={15}
                      className="ml-auto mt-1 shrink-0 text-ink/20 transition group-hover:text-forest"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:content-start">
              <div className="rounded-[24px] border border-forest/15 bg-forest/[0.055] p-6 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-forest/60">
                    What VeriPass is
                  </p>
                  <LogoMark size={28} />
                </div>
                <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {[
                    'A portable identity for artisans',
                    'A work-evidence record',
                    'A reference confirmation loop',
                    'A clear verification level',
                    'A read-only trust API',
                    'A consent-led system',
                  ].map((item) => (
                    <p
                      key={item}
                      className="flex items-start gap-2 text-[12px] font-semibold text-ink/65"
                    >
                      <Check size={13} className="mt-0.5 text-forest" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-line bg-paper-soft p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-clay/70">
                  What it is not
                </p>
                <div className="mt-5 space-y-3">
                  {['A booking platform', 'A payment processor', 'A popularity score'].map(
                    (item) => (
                      <p
                        key={item}
                        className="flex items-start gap-2 text-[12px] font-semibold text-ink/50"
                      >
                        <X size={13} className="mt-0.5 text-clay/60" />
                        {item}
                      </p>
                    ),
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-[24px] bg-lime p-6">
                <div>
                  <FileCheck2 size={22} className="text-forest" />
                  <p className="mt-4 font-display text-[23px] font-normal leading-tight tracking-[-0.03em]">
                    Built offline-first for this demo.
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-forest/60">
                    Next.js frontend. NestJS API. Local SQLite. Full source in
                    this workspace.
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {['Next.js', 'NestJS', 'SQLite', 'JWT'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-forest/20 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-forest/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRINCIPLE */}
        <section className="container-wide pb-24">
          <div className="relative overflow-hidden rounded-[36px] bg-lime px-7 py-14 text-forest sm:px-12 lg:px-20 lg:py-20">
            <div className="pointer-events-none absolute inset-0 pattern-grid opacity-40" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full border border-forest/15" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="eyebrow text-forest/55">A principle, not a feature</p>
                <blockquote className="mt-6 max-w-[900px] font-display text-[38px] font-light leading-[1.07] tracking-[-0.045em] sm:text-[52px] lg:text-[64px]">
                  “Reputation built over ten years shouldn&apos;t disappear when
                  a customer changes{' '}
                  <span className="italic">neighbourhood.</span>”
                </blockquote>
                <div className="mt-7 flex items-center gap-3">
                  <LogoMark size={34} inverse />
                  <div>
                    <p className="text-[12px] font-extrabold">The VeriPass principle</p>
                    <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-forest/50">
                      Verifiable identity · portable trust
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <TrustSeal size={190} tone="lime" label="PROOF OF CRAFT" text="IDENTITY • EVIDENCE • REFERENCES •" />
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="container-wide pb-24">
          <div className="relative overflow-hidden rounded-[36px] bg-forest-deep p-7 text-paper sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute inset-0 pattern-grid-light opacity-50" />
            <div className="pointer-events-none absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full border border-paper/[0.07]" />
            <div className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="eyebrow flex items-center gap-2 text-lime">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-soft" />
                  Start here
                </p>
                <h2 className="display-tight mt-5 max-w-[620px] text-[46px] font-light sm:text-[62px]">
                  The next customer
                  <br />
                  should <span className="italic text-lime">know.</span>
                </h2>
                <p className="mt-5 max-w-[460px] text-[14px] leading-[1.8] text-paper/50">
                  Build your verification record in minutes. Or check someone
                  else&apos;s pass before you agree to the job.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/onboarding" className="btn-lime">
                    Get verified
                    <ArrowUpRight size={15} />
                  </Link>
                  <Link
                    href="/login"
                    className="btn inline-flex h-11 items-center rounded-full border border-paper/20 px-5 text-[13px] font-bold text-paper transition hover:bg-paper/10"
                  >
                    Try the demo workspace
                  </Link>
                </div>
                <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[8px] uppercase tracking-[0.16em] text-paper/30">
                  <span>Free for artisans</span>
                  <span>No bookings</span>
                  <span>No commissions</span>
                  <span>Verification only</span>
                </div>
              </div>

              <div className="rounded-[28px] border border-paper/12 bg-paper/[0.055] p-5 backdrop-blur-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScanLine size={17} className="text-lime" />
                    <p className="text-[13px] font-bold">Check a pass</p>
                  </div>
                  <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-paper/30">
                    Public record
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-paper/40">
                  Enter any VeriPass code to see identity, evidence and
                  references. No account needed.
                </p>
                <VerifyForm dark className="mt-5" />
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-paper/25">
                    Try:
                  </span>
                  {[
                    { code: 'VP-AMA7-2041', label: 'Trusted' },
                    { code: 'VP-GRA2-7745', label: 'Trusted' },
                    { code: 'VP-CHI4-9012', label: 'Review' },
                  ].map((sample) => (
                    <Link
                      key={sample.code}
                      href={`/verify/${sample.code}`}
                      className="rounded-full border border-paper/15 px-2.5 py-1.5 font-mono text-[8px] tracking-[0.08em] text-paper/50 transition hover:border-lime/35 hover:text-lime"
                    >
                      {sample.code}
                    </Link>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3 border-t border-paper/10 pt-5">
                  <QrCode size={24} className="text-lime/70" />
                  <p className="text-[10px] leading-relaxed text-paper/35">
                    Every pass carries a QR code that resolves to a live
                    verification record.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
