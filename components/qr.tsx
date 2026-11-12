'use client';

import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';

export function QRCode({
  value,
  size = 80,
  className,
  fgColor = '#123E33',
  bgColor = '#F4F0E6',
}: {
  value: string;
  size?: number;
  className?: string;
  fgColor?: string;
  bgColor?: string;
}) {
  return (
    <div className={cn('inline-flex', className)}>
      <QRCodeSVG
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level="M"
        marginSize={0}
      />
    </div>
  );
}
