'use client';

import { useState } from 'react';
import { CopyButton } from './copy-button';
import { cn } from '@/lib/utils';

const REQUEST = `curl http://localhost:4000/api/verify/VP-AMA7-2041`;

const RESPONSE = `{
  "found": true,
  "verified": true,
  "artisan": {
    "fullName": "Ama Njie",
    "trade": "Electrician",
    "location": "Molyko, Buea",
    "verificationLevel": "Trusted",
    "identityStatus": "verified",
    "counts": {
      "confirmed": 3,
      "fellowArtisans": 1
    },
    "lastCheckedAt": "2026-11-12T17:00:00.000Z"
  }
}`;

export function ApiExample({ className }: { className?: string }) {
  const [tab, setTab] = useState<'request' | 'response'>('request');
  const code = tab === 'request' ? REQUEST : RESPONSE;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[24px] border border-paper/15 bg-[#0C241D] text-paper shadow-lift',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-paper/10 px-4 py-3">
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em]">
          <span className="h-2 w-2 rounded-full bg-clay/80" />
          <span className="h-2 w-2 rounded-full bg-amber/80" />
          <span className="h-2 w-2 rounded-full bg-lime/80" />
          <span className="ml-2 text-paper/35">veripass · demo api</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-paper/[0.06] p-0.5">
          {(['request', 'response'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                'rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition',
                tab === item
                  ? 'bg-lime text-forest'
                  : 'text-paper/40 hover:text-paper/75',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="absolute right-3 top-3 z-10">
          <CopyButton
            value={code}
            iconOnly
            className="!border-paper/10 !bg-paper/[0.06] !text-paper/50 hover:!bg-paper/10 hover:!text-paper"
          />
        </div>
        <pre className="hide-scrollbar min-h-[252px] overflow-x-auto p-5 pr-14 font-mono text-[11px] leading-[1.85] text-paper/70">
          <code>{code}</code>
        </pre>
      </div>
      <div className="flex items-center justify-between border-t border-paper/10 px-5 py-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-paper/30">
          No API key required in demo
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-lime/70">
          <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-soft" />
          200 OK
        </span>
      </div>
    </div>
  );
}
