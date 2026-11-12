import { cn, initials } from '@/lib/utils';
import { assetUrl } from '@/lib/api';

export function Avatar({
  name,
  src,
  size = 48,
  className,
  textClassName,
  ring = false,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
  textClassName?: string;
  ring?: boolean;
}) {
  const image = assetUrl(src);
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest text-lime',
        ring && 'ring-2 ring-paper/70 ring-offset-2 ring-offset-forest',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={name ? `${name}'s profile photo` : 'Artisan profile photo'}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span
          className={cn(
            'font-display text-[0.9rem] font-medium tracking-tight text-lime',
            textClassName,
          )}
          style={{ fontSize: Math.max(11, size * 0.32) }}
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}
