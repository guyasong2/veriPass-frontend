import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoMark } from './logo';

export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      className={cn('animate-spin text-forest', className)}
      size={18}
      aria-hidden
    />
  );
}

export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-paper">
      <LogoMark size={44} />
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
        <Spinner className="h-3.5 w-3.5" />
        {label}
      </div>
    </div>
  );
}

export function InlineLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
      <Spinner className="h-4 w-4" />
      {label}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-ink/[0.06]',
        className,
      )}
    />
  );
}
