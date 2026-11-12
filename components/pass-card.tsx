import { MapPin } from 'lucide-react';
import type { VerificationLevel } from '@/lib/types';
import { LEVEL_META } from '@/lib/levels';
import { assetUrl, verificationUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Avatar } from './avatar';
import { LogoMark } from './logo';
import { QRCode } from './qr';

export function PassCard({
  name,
  trade,
  location,
  code,
  level,
  avatarUrl,
  variant = 'dark',
  qrSize = 70,
  large = false,
  className,
  showQr = true,
  verifiedSince,
}: {
  name: string;
  trade: string;
  location: string;
  code: string;
  level: VerificationLevel | string;
  avatarUrl?: string | null;
  variant?: 'dark' | 'paper';
  qrSize?: number;
  large?: boolean;
  className?: string;
  showQr?: boolean;
  verifiedSince?: string | null;
}) {
  const meta = LEVEL_META[level as VerificationLevel] || LEVEL_META.Draft;
  const url = verificationUrl(code);
  const dark = variant === 'dark';

  const darkBadge =
    level === 'Trusted'
      ? 'border-lime bg-lime text-forest'
      : level === 'Rejected'
        ? 'border-clay/50 bg-clay/15 text-paper'
        : level === 'Suspended'
          ? 'border-paper/20 bg-paper/10 text-paper/70'
          : 'border-paper/25 bg-paper/10 text-paper';

  return (
    <article
      className={cn(
        'relative isolate overflow-hidden rounded-[26px]',
        dark
          ? 'bg-forest-deep text-paper shadow-lift'
          : 'border border-line bg-paper-soft text-ink shadow-card',
        large ? 'p-6 sm:p-8' : 'p-5 sm:p-6',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 guilloche opacity-90" />
      <div
        className={cn(
          'pointer-events-none absolute -right-28 -top-32 h-[320px] w-[320px] rounded-full border',
          dark ? 'border-lime/15' : 'border-forest/10',
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute -right-16 -top-20 h-[240px] w-[240px] rounded-full border',
          dark ? 'border-lime/10' : 'border-forest/[0.07]',
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute -bottom-20 -left-16 h-[220px] w-[220px] rounded-full',
          dark ? 'bg-lime/[0.045]' : 'bg-forest/[0.035]',
        )}
      />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoMark size={large ? 30 : 26} />
            <span
              className={cn(
                'font-sans text-[15px] font-extrabold tracking-[-0.04em]',
                dark ? 'text-paper' : 'text-ink',
              )}
            >
              Veri<span className="font-medium">Pass</span>
            </span>
          </div>
          <div className="text-right">
            <p
              className={cn(
                'font-mono text-[8px] uppercase tracking-[0.2em]',
                dark ? 'text-paper/45' : 'text-ink/40',
              )}
            >
              Digital artisan pass
            </p>
            <p
              className={cn(
                'mt-1 font-mono text-[9px] tracking-[0.06em]',
                dark ? 'text-paper/65' : 'text-ink/50',
              )}
            >
              {code}
            </p>
          </div>
        </div>

        <div className={cn(large ? 'mt-10' : 'mt-7')}>
          <div className="flex items-center gap-3.5">
            <Avatar
              name={name}
              src={avatarUrl}
              size={large ? 58 : 46}
              ring
              className={cn(!dark && 'ring-paper ring-offset-forest')}
            />
            <div className="min-w-0">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[8px] font-medium uppercase leading-none tracking-[0.14em]',
                  dark ? darkBadge : meta.badge,
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    dark && level === 'Trusted' ? 'bg-forest' : meta.dot,
                  )}
                />
                {meta.label}
              </span>
              <h3
                className={cn(
                  'mt-2 truncate font-display font-light leading-none tracking-[-0.035em]',
                  dark ? 'text-paper' : 'text-ink',
                  large ? 'text-[34px] sm:text-[40px]' : 'text-[26px]',
                )}
              >
                {name}
              </h3>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span
              className={cn(
                'text-[13px] font-semibold',
                dark ? 'text-paper/85' : 'text-ink/75',
              )}
            >
              {trade || 'Skilled artisan'}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px]',
                dark ? 'text-paper/50' : 'text-ink/45',
              )}
            >
              <MapPin size={11} />
              {location || 'Buea, Cameroon'}
            </span>
          </div>
        </div>

        <div
          className={cn(
            'mt-auto flex items-end justify-between gap-5 border-t pt-5',
            large ? 'mt-10' : 'mt-7',
            dark ? 'border-paper/15' : 'border-line',
          )}
        >
          <div className="min-w-0">
            <p
              className={cn(
                'font-mono text-[8px] uppercase tracking-[0.18em]',
                dark ? 'text-paper/40' : 'text-ink/35',
              )}
            >
              Verification code
            </p>
            <p
              className={cn(
                'mt-1.5 font-mono text-[11px] font-medium tracking-[0.14em]',
                dark ? 'text-lime' : 'text-forest',
              )}
            >
              {code}
            </p>
            <p
              className={cn(
                'mt-3 max-w-[170px] text-[9px] leading-relaxed',
                dark ? 'text-paper/35' : 'text-ink/35',
              )}
            >
              Scan the code to check identity, work evidence and references.
            </p>
            {verifiedSince && (
              <p
                className={cn(
                  'mt-2 font-mono text-[8px] uppercase tracking-[0.12em]',
                  dark ? 'text-paper/40' : 'text-ink/35',
                )}
              >
                On VeriPass since {verifiedSince}
              </p>
            )}
          </div>
          {showQr && (
            <div className="shrink-0 text-center">
              <div
                className={cn(
                  'rounded-xl p-1.5',
                  dark ? 'bg-paper' : 'border border-line bg-white p-1.5',
                )}
              >
                <QRCode
                  value={url}
                  size={qrSize}
                  fgColor="#123E33"
                  bgColor={dark ? '#F4F0E6' : '#FFFFFF'}
                />
              </div>
              <p
                className={cn(
                  'mt-1.5 font-mono text-[7px] uppercase tracking-[0.2em]',
                  dark ? 'text-paper/45' : 'text-ink/40',
                )}
              >
                Scan to verify
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
