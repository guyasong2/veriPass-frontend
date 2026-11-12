import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth-provider';
import { SITE_URL } from '@/lib/api';
import './globals.css';

const fraunces = localFont({
  src: [
    {
      path: '../fonts/Fraunces-Variable.woff2',
      weight: '300 700',
      style: 'normal',
    },
    {
      path: '../fonts/Fraunces-Italic-Variable.woff2',
      weight: '300 700',
      style: 'italic',
    },
  ],
  variable: '--font-fraunces',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

const manrope = localFont({
  src: [
    {
      path: '../fonts/Manrope-Variable.woff2',
      weight: '400 800',
      style: 'normal',
    },
  ],
  variable: '--font-manrope',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

const plexMono = localFont({
  src: [
    {
      path: '../fonts/IBMPlexMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/IBMPlexMono-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-plex-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'monospace'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'VeriPass — Proof of craft, built on trust',
    template: '%s · VeriPass',
  },
  description:
    'VeriPass gives skilled artisans a verifiable digital identity and gives businesses a reliable way to confirm who they are and whether their work can be trusted.',
  openGraph: {
    title: 'VeriPass — Artisan verification infrastructure',
    description:
      'Identity. Work evidence. References. One scannable standard for Africa’s skilled workers.',
    url: SITE_URL,
    siteName: 'VeriPass',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable}`}
    >
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper transition focus:translate-y-0"
        >
          Skip to content
        </a>
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="top-center"
          closeButton
          toastOptions={{
            className: 'font-sans !rounded-2xl',
            style: {
              background: '#14160F',
              color: '#F4F0E6',
              border: '1px solid rgba(244,240,230,0.16)',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  );
}
