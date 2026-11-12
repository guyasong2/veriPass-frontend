'use client';

import { ArrowRight, ScanLine } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function VerifyForm({
  dark = false,
  className,
  autoFocus = false,
  defaultValue = '',
}: {
  dark?: boolean;
  className?: string;
  autoFocus?: boolean;
  defaultValue?: string;
}) {
  const [code, setCode] = useState(defaultValue);
  const [error, setError] = useState('');
  const router = useRouter();

  function submit(event: FormEvent) {
    event.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError('Enter the code printed on the artisan’s pass.');
      return;
    }
    setError('');
    router.push(`/verify/${encodeURIComponent(clean)}`);
  }

  return (
    <form onSubmit={submit} className={cn('w-full', className)}>
      <div
        className={cn(
          'flex flex-col gap-2 rounded-2xl border p-2 sm:flex-row sm:items-center',
          dark
            ? 'border-paper/18 bg-paper/[0.07]'
            : 'border-line bg-paper-soft',
        )}
      >
        <div className="flex flex-1 items-center gap-3 px-2.5">
          <ScanLine
            size={18}
            className={dark ? 'text-lime' : 'text-forest'}
            aria-hidden
          />
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoFocus={autoFocus}
            placeholder="Enter a VeriPass code — e.g. VP-AMA7-2041"
            aria-label="VeriPass code"
            spellCheck={false}
            className={cn(
              'h-10 w-full min-w-0 bg-transparent font-mono text-[13px] uppercase tracking-[0.08em] outline-none placeholder:normal-case placeholder:tracking-normal',
              dark
                ? 'text-paper placeholder:text-paper/35'
                : 'text-ink placeholder:text-muted/60',
            )}
          />
        </div>
        <button
          type="submit"
          className={cn('h-11 shrink-0 px-5 sm:h-10', dark ? 'btn-lime' : 'btn-primary')}
        >
          Check pass
          <ArrowRight size={14} />
        </button>
      </div>
      {error && (
        <p
          className={cn(
            'mt-2 pl-1 text-[11px]',
            dark ? 'text-lime/80' : 'text-clay',
          )}
        >
          {error}
        </p>
      )}
    </form>
  );
}
