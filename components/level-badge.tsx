import type { VerificationLevel } from '@/lib/types';
import { LEVEL_META } from '@/lib/levels';
import { cn } from '@/lib/utils';

export function LevelBadge({
  level,
  size = 'md',
  className,
  withDot = true,
}: {
  level: VerificationLevel | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withDot?: boolean;
}) {
  const meta =
    LEVEL_META[level as VerificationLevel] || LEVEL_META.Draft;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-bold leading-none',
        meta.badge,
        size === 'sm' && 'px-2 py-1 text-[10px]',
        size === 'md' && 'px-2.5 py-1.5 text-[11px]',
        size === 'lg' && 'px-3.5 py-2 text-[12.5px]',
        className,
      )}
    >
      {withDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      )}
      {meta.label}
    </span>
  );
}
