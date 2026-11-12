'use client';

import { useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrustSeal({
  size = 132,
  tone = 'dark',
  label = 'VERIFIED',
  text = 'VERIPASS • DIGITAL TRUST INFRASTRUCTURE •',
  className,
}: {
  size?: number;
  tone?: 'dark' | 'light' | 'lime';
  label?: string;
  text?: string;
  className?: string;
}) {
  const uniqueId = useId().replace(/:/g, '');
  const pathId = `seal-path-${uniqueId}`;
  const palette =
    tone === 'dark'
      ? {
          ring: 'rgba(216,242,107,0.7)',
          text: 'rgba(216,242,107,0.8)',
          fill: 'rgba(216,242,107,0.05)',
          core: 'border-lime/40 bg-forest',
          coreText: 'text-lime',
        }
      : tone === 'lime'
        ? {
            ring: 'rgba(18,62,51,0.6)',
            text: 'rgba(18,62,51,0.75)',
            fill: 'rgba(18,62,51,0.04)',
            core: 'border-forest/25 bg-lime',
            coreText: 'text-forest',
          }
        : {
            ring: 'rgba(20,22,15,0.32)',
            text: 'rgba(20,22,15,0.6)',
            fill: 'rgba(20,22,15,0.025)',
            core: 'border-ink/15 bg-paper',
            coreText: 'text-forest',
          };

  return (
    <div
      className={cn('relative', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 200"
        className="rotating-seal absolute inset-0 h-full w-full"
      >
        <defs>
          <path
            id={pathId}
            d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0"
          />
        </defs>
        <circle
          cx="100"
          cy="100"
          r="96"
          fill={palette.fill}
          stroke={palette.ring}
          strokeWidth="0.8"
          strokeDasharray="1.5 6"
        />
        <circle
          cx="100"
          cy="100"
          r="63"
          fill="none"
          stroke={palette.ring}
          strokeWidth="0.7"
          opacity="0.7"
        />
        <text
          fill={palette.text}
          fontSize="9.2"
          fontFamily="var(--font-plex-mono), monospace"
          fontWeight="500"
          letterSpacing="2.7"
        >
          <textPath href={`#${pathId}`} startOffset="0">
            {text}
          </textPath>
        </text>
      </svg>
      <div
        className={cn(
          'absolute inset-[27%] flex flex-col items-center justify-center gap-1.5 rounded-full border backdrop-blur-sm',
          palette.core,
        )}
      >
        <Check size={22} strokeWidth={2.4} className={palette.coreText} />
        <span
          className={cn(
            'font-mono text-[7px] font-medium uppercase tracking-[0.22em]',
            palette.coreText,
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
