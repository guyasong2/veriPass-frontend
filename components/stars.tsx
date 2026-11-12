import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stars({
  rating,
  size = 13,
  className,
}: {
  rating?: number | null;
  size?: number;
  className?: string;
}) {
  const value = rating ?? 0;
  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = value >= index + 1;
        const half = !filled && value > index && value < index + 1;
        const Icon = half ? StarHalf : Star;
        return (
          <Icon
            key={index}
            size={size}
            className={cn(
              filled || half
                ? 'fill-amber text-amber'
                : 'fill-transparent text-ink/20',
            )}
          />
        );
      })}
    </span>
  );
}
