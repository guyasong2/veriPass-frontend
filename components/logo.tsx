import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LogoMark({
  size = 36,
  className,
  inverse = false,
}: {
  size?: number;
  className?: string;
  inverse?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <rect
        width="40"
        height="40"
        rx="12"
        fill={inverse ? '#D8F26B' : '#123E33'}
      />
      <path
        d="M10.5 13.5L18.3 28.2L23 18.4L29.7 11.8"
        stroke={inverse ? '#123E33' : '#D8F26B'}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30.5" cy="11.5" r="2.4" fill="#E8A13B" />
    </svg>
  );
}

export function Wordmark({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <span
      className={cn(
        'font-sans text-[18px] font-extrabold tracking-[-0.05em]',
        inverse ? 'text-paper' : 'text-ink',
        className,
      )}
    >
      Veri<span className="font-medium">Pass</span>
    </span>
  );
}

export function Logo({
  href = '/',
  className,
  inverse = false,
  markSize = 34,
}: {
  href?: string;
  className?: string;
  inverse?: boolean;
  markSize?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-2.5',
        className,
      )}
      aria-label="VeriPass home"
    >
      <LogoMark size={markSize} inverse={inverse} />
      <Wordmark inverse={inverse} className="text-[19px]" />
    </Link>
  );
}
