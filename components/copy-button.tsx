'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn, copyText } from '@/lib/utils';

export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  className,
  iconOnly = false,
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyText(value);
    if (ok) {
      setCopied(true);
      toast.success('Copied to clipboard');
      window.setTimeout(() => setCopied(false), 1800);
    } else {
      toast.error('Could not copy — please copy manually.');
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-bold transition',
        iconOnly
          ? 'h-8 w-8 text-ink/50 hover:bg-ink/5 hover:text-ink'
          : 'border border-line bg-paper px-3.5 py-2 text-ink/70 hover:border-ink/30 hover:text-ink',
        className,
      )}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {!iconOnly && (copied ? copiedLabel : label)}
    </button>
  );
}
