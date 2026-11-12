import { ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'flex flex-col gap-5 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="eyebrow mb-3 flex items-center gap-2 text-forest">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-forest" />
            {eyebrow}
          </p>
        )}
        <h1 className="display-tight text-[38px] font-light sm:text-[46px] md:text-[52px]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-[14px] leading-relaxed text-muted md:text-[15px]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}

export function ArrowLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <ArrowRight size={14} />
    </span>
  );
}
