'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  BadgeCheck,
  Camera,
  Check,
  Clock3,
  Download,
  ExternalLink,
  Fingerprint,
  Printer,
  QrCode,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useArtisanData } from '@/components/artisan-data-provider';
import { CopyButton } from '@/components/copy-button';
import { LevelBadge } from '@/components/level-badge';
import { PassCard } from '@/components/pass-card';
import { PageHeader } from '@/components/page-header';
import { LADDER, LEVEL_META } from '@/lib/levels';
import { verificationUrl } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';

export default function DigitalPassPage() {
  const { profile } = useArtisanData();
  if (!profile) return null;

  const url = verificationUrl(profile.verificationCode);
  const shareMessage = `Verify my VeriPass record: ${url}`;
  const level = profile.verificationLevel;
  const meta = LEVEL_META[level];

  const rank =
    level === 'Trusted'
      ? 4
      : level === 'Work Confirmed'
        ? 3
        : level === 'ID Verified'
          ? 2
          : level === 'Under Review'
            ? 1
            : 0;

  function printPass() {
    window.print();
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Your digital pass"
        title="One card. Portable proof."
        description="Your VeriPass carries a unique code and QR. Share it with any customer, employer or platform so they can check the record behind your work."
        actions={
          <>
            <CopyButton value={url} label="Copy link" />
            <button type="button" onClick={printPass} className="btn-primary print-hide">
              <Printer size={14} />
              Print pass
            </button>
          </>
        }
      />

      {profile.accountStatus !== 'active' && (
        <div className="flex items-start gap-3 rounded-2xl border border-clay/25 bg-clay/[0.06] p-4 print-hide">
          <ShieldAlert size={17} className="mt-0.5 shrink-0 text-clay" />
          <p className="text-[11px] leading-relaxed text-clay">
            Your account is currently{' '}
            <strong>{profile.accountStatus}</strong>. The public pass displays a
            restricted status until VeriPass operations reinstates the account.
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="print-area">
          <PassCard
            name={profile.fullName}
            trade={profile.trade}
            location={profile.location}
            code={profile.verificationCode}
            level={level}
            avatarUrl={profile.avatarUrl}
            large
            qrSize={116}
            verifiedSince={
              profile.identityVerifiedAt
                ? formatDate(profile.identityVerifiedAt)
                : undefined
            }
          />
          <div className="mt-4 hidden items-center justify-between rounded-xl border border-line bg-paper px-5 py-4 print:flex">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-forest" />
              <p className="text-[10px] font-bold">
                Verify this record at {url}
              </p>
            </div>
            <p className="font-mono text-[9px] tracking-[0.1em] text-forest">
              {profile.verificationCode}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-[24px] border border-line bg-paper-soft p-5">
            <p className="eyebrow text-muted">Pass details</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-line/80 pb-3">
                <span className="text-[10px] text-muted">Verification code</span>
                <span className="font-mono text-[11px] font-medium tracking-[0.1em] text-forest">
                  {profile.verificationCode}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line/80 pb-3">
                <span className="text-[10px] text-muted">Current level</span>
                <LevelBadge level={level} size="sm" />
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line/80 pb-3">
                <span className="text-[10px] text-muted">Member since</span>
                <span className="text-[10.5px] font-semibold">
                  {formatDate(profile.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line/80 pb-3">
                <span className="text-[10px] text-muted">Last updated</span>
                <span className="text-[10.5px] font-semibold">
                  {formatDate(profile.updatedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] text-muted">Record checks</span>
                <span className="font-display text-[20px] leading-none tracking-[-0.03em]">
                  {profile.profileViews}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="btn-outline btn-sm w-full"
              >
                <ExternalLink size={12} />
                Open public record
              </a>
              <CopyButton
                value={shareMessage}
                label="Copy share message"
                className="w-full !py-2.5"
              />
            </div>
          </section>

          <section className="rounded-[24px] border border-line bg-paper-soft p-5">
            <div className="flex items-center gap-2">
              <QrCode size={15} className="text-forest" />
              <p className="text-[12px] font-extrabold">How to share it</p>
            </div>
            <div className="mt-4 space-y-3">
              {[
                {
                  step: '01',
                  title: 'Copy your link',
                  copy: 'Send it in WhatsApp, SMS or an email.',
                },
                {
                  step: '02',
                  title: 'Print the card',
                  copy: 'Keep a copy in your workshop or toolkit.',
                },
                {
                  step: '03',
                  title: 'Let them scan',
                  copy: 'The QR opens the public verification record.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <span className="font-mono text-[9px] text-forest/50">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-[11px] font-bold">{item.title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                      {item.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] bg-forest p-5 text-paper">
            <p className="eyebrow text-lime">Public preview</p>
            <p className="mt-2 font-display text-[22px] font-light leading-tight tracking-[-0.03em]">
              This is the {level.toLowerCase()} record people see.
            </p>
            <p className="mt-2 text-[10.5px] leading-relaxed text-paper/50">
              {meta?.description} Full reference contacts and your private
              contact details are never shown.
            </p>
            <Link
              href={`/verify/${profile.verificationCode}`}
              className="btn-lime btn-sm mt-4"
            >
              View live pass
              <ArrowUpRight size={12} />
            </Link>
          </section>
        </div>
      </div>

      <section className="rounded-[26px] border border-line bg-paper-soft p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-muted">What the scan reveals</p>
            <h2 className="mt-1.5 font-display text-[26px] font-normal tracking-[-0.03em]">
              The proof behind the card.
            </h2>
          </div>
          <span className="rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-muted">
            {profile.verificationCode}
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Fingerprint,
              label: 'Identity',
              value:
                profile.identityStatus === 'verified'
                  ? 'Verified through Didit'
                  : 'Not yet verified',
              active: profile.identityStatus === 'verified',
            },
            {
              icon: Camera,
              label: 'Work evidence',
              value: `${profile.evidence.length} photo${
                profile.evidence.length === 1 ? '' : 's'
              } published`,
              active: profile.evidence.length > 0,
            },
            {
              icon: Users,
              label: 'References',
              value: `${profile.counts.confirmed} confirmed`,
              active: profile.counts.confirmed > 0,
            },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                'rounded-2xl border p-4',
                item.active
                  ? 'border-forest/20 bg-forest/[0.04]'
                  : 'border-line bg-paper',
              )}
            >
              <div className="flex items-center justify-between">
                <item.icon
                  size={16}
                  className={item.active ? 'text-forest' : 'text-muted/50'}
                />
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full',
                    item.active
                      ? 'bg-forest text-lime'
                      : 'bg-ink/[0.05] text-muted/40',
                  )}
                >
                  {item.active ? (
                    <Check size={10} strokeWidth={3} />
                  ) : (
                    <Clock3 size={10} />
                  )}
                </span>
              </div>
              <p className="mt-4 text-[11px] font-bold">{item.label}</p>
              <p className="mt-0.5 text-[10px] text-muted">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
            Level ladder
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {LADDER.map((step, index) => {
              const required = index + 2;
              const active = rank >= required;
              return (
                <div
                  key={step.level}
                  className={cn(
                    'rounded-xl border px-3 py-3',
                    active
                      ? 'border-forest/20 bg-forest/[0.045]'
                      : 'border-line bg-paper',
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold',
                        active
                          ? 'bg-forest text-lime'
                          : 'border border-line text-muted/50',
                      )}
                    >
                      {active ? <Check size={8} strokeWidth={3} /> : index + 1}
                    </span>
                    <p className="text-[10px] font-bold">{step.level}</p>
                  </div>
                  <p className="mt-1.5 text-[9px] leading-relaxed text-muted">
                    {step.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
