'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Star,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  ApiError,
  apiFetch,
} from '@/lib/api';
import { RELATIONSHIP_LABEL } from '@/lib/levels';
import type { ReferenceInvite } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Avatar } from './avatar';
import { LevelBadge } from './level-badge';
import { InlineLoader, Spinner } from './loaders';
import { LogoMark } from './logo';
import { TrustSeal } from './trust-seal';

export function ReferenceClient({ token }: { token: string }) {
  const [data, setData] = useState<ReferenceInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [choice, setChoice] = useState<'confirmed' | 'declined' | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{
    status: string;
    verificationLevel: string;
    message: string;
  } | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch<ReferenceInvite>(
        `/references/${encodeURIComponent(token)}`,
        { skipAuth: true },
      );
      setData(response);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? 'This reference link is invalid or has expired.'
          : err instanceof Error
            ? err.message
            : 'Could not load this reference request.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!choice) {
      toast.error('Choose whether you can confirm the work.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiFetch<{
        ok: boolean;
        status: string;
        verificationLevel: string;
        message: string;
      }>(`/references/${encodeURIComponent(token)}/respond`, {
        method: 'POST',
        skipAuth: true,
        body: {
          confirmed: choice === 'confirmed',
          rating: choice === 'confirmed' ? rating : undefined,
          comment: comment.trim() || undefined,
        },
      });
      setSubmitted(response);
      setData((current) =>
        current
          ? {
              ...current,
              canRespond: false,
              reference: {
                ...current.reference,
                status: response.status as ReferenceInvite['reference']['status'],
                rating: choice === 'confirmed' ? rating : null,
                comment: comment.trim() || null,
                respondedAt: new Date().toISOString(),
              },
            }
          : current,
      );
      toast.success('Your response has been recorded');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not submit your response.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <div className="pointer-events-none absolute inset-0 pattern-grid opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-ink/[0.06]" />

      <header className="relative z-10 border-b border-line/80 bg-paper/80 backdrop-blur">
        <div className="container-reading flex h-[70px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={31} />
            <span className="text-[17px] font-extrabold tracking-[-0.04em]">
              Veri<span className="font-medium">Pass</span>
            </span>
          </Link>
          <span className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.16em] text-muted">
            <ShieldCheck size={12} className="text-forest" />
            Secure reference link
          </span>
        </div>
      </header>

      <main className="container-reading relative z-10 py-10 md:py-16">
        {loading && <InlineLoader label="Opening reference request" />}

        {!loading && error && (
          <div className="rounded-[30px] border border-line bg-paper-soft p-8 text-center shadow-card sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay/10 text-clay">
              <X size={20} />
            </div>
            <h1 className="mt-5 font-display text-[34px] font-normal tracking-[-0.03em]">
              This link isn&apos;t working.
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
              {error} Ask the artisan to send you a fresh reference link.
            </p>
            <Link href="/" className="btn-outline mt-6">
              <ArrowLeft size={14} />
              Back to VeriPass
            </Link>
          </div>
        )}

        {!loading && data && (
          <>
            {submitted ? (
              <section className="relative overflow-hidden rounded-[32px] border border-line bg-paper-soft p-7 text-center shadow-card sm:p-12">
                <div className="pointer-events-none absolute inset-0 pattern-dots opacity-50" />
                <div className="relative z-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest text-lime">
                    <Check size={28} strokeWidth={2.4} />
                  </div>
                  <p className="eyebrow mt-6 text-forest">Response recorded</p>
                  <h1 className="display-tight mx-auto mt-4 max-w-[540px] text-[42px] font-light sm:text-[52px]">
                    Thank you for confirming the work.
                  </h1>
                  <p className="mx-auto mt-4 max-w-md text-[13px] leading-[1.8] text-muted">
                    Your response has been added to {data.artisan.fullName}
                    &apos;s VeriPass record. Their level was recalculated
                    automatically.
                  </p>
                  <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-line bg-paper p-5">
                    <div className="flex items-center justify-center gap-3">
                      <Avatar
                        name={data.artisan.fullName}
                        src={data.artisan.avatarUrl}
                        size={38}
                      />
                      <div className="text-left">
                        <p className="text-[12px] font-bold">
                          {data.artisan.fullName}
                        </p>
                        <p className="text-[10px] text-muted">
                          {data.artisan.trade}
                        </p>
                      </div>
                      <span className="ml-auto">
                        <LevelBadge
                          level={submitted.verificationLevel}
                          size="sm"
                        />
                      </span>
                    </div>
                  </div>
                  <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
                    <Link href="/" className="btn-primary">
                      Learn about VeriPass
                    </Link>
                    <Link
                      href={`/verify/${data.artisan.verificationCode}`}
                      className="btn-outline"
                    >
                      View public record
                    </Link>
                  </div>
                  <p className="mt-6 font-mono text-[8px] uppercase tracking-[0.14em] text-muted/50">
                    You can safely close this page
                  </p>
                </div>
              </section>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-forest/[0.05] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.16em] text-forest">
                    <Clock3 size={11} />
                    Reference request
                  </span>
                  <h1 className="display-tight mx-auto mt-5 max-w-[680px] text-[44px] font-light sm:text-[58px]">
                    {data.canRespond
                      ? 'Can you confirm this work?'
                      : 'This reference has already responded.'}
                  </h1>
                  <p className="mx-auto mt-4 max-w-[520px] text-[13px] leading-[1.8] text-muted">
                    {data.artisan.fullName} has invited you to confirm your
                    experience of their work. A short, honest response helps
                    the next customer make a better decision.
                  </p>
                </div>

                <section className="relative overflow-hidden rounded-[30px] border border-line bg-paper-soft shadow-card">
                  <div className="flex flex-col gap-5 border-b border-line bg-forest p-6 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-7">
                    <div className="flex items-center gap-4">
                      <Avatar
                        name={data.artisan.fullName}
                        src={data.artisan.avatarUrl}
                        size={58}
                        ring
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-[27px] font-light leading-none tracking-[-0.03em] text-paper">
                            {data.artisan.fullName}
                          </h2>
                          <LevelBadge
                            level={data.artisan.verificationLevel}
                            size="sm"
                            className="!border-lime !bg-lime !text-forest"
                          />
                        </div>
                        <p className="mt-2 text-[12px] text-paper/55">
                          {data.artisan.trade} · {data.artisan.location}
                        </p>
                        <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-paper/35">
                          <BadgeCheck size={11} className="text-lime" />
                          Identity verified · {data.artisan.verificationCode}
                        </p>
                      </div>
                    </div>
                    <TrustSeal
                      size={88}
                      tone="dark"
                      label="ARTISAN"
                      className="hidden sm:block"
                    />
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="grid gap-6 border-b border-line pb-7 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div>
                        <p className="eyebrow text-muted">Your role</p>
                        <p className="mt-2 text-[13px] font-bold">
                          {RELATIONSHIP_LABEL[data.reference.relationship] ||
                            'Reference'}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted">
                          This request was sent to{' '}
                          <span className="font-semibold text-ink/70">
                            {data.reference.name}
                          </span>
                          . Your contact details are never shown publicly.
                        </p>
                      </div>
                      <div className="rounded-full border border-line bg-paper px-3.5 py-2 font-mono text-[8px] uppercase tracking-[0.13em] text-muted">
                        Sent {formatDate(data.reference.createdAt ?? new Date())}
                      </div>
                    </div>

                    {!data.canRespond ? (
                      <div className="mt-7">
                        <div
                          className={`flex items-start gap-3 rounded-2xl border p-5 ${
                            data.reference.status === 'confirmed'
                              ? 'border-forest/20 bg-forest/[0.05]'
                              : 'border-clay/20 bg-clay/[0.05]'
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-paper ${
                              data.reference.status === 'confirmed'
                                ? 'bg-forest'
                                : 'bg-clay'
                            }`}
                          >
                            {data.reference.status === 'confirmed' ? (
                              <Check size={17} />
                            ) : (
                              <X size={17} />
                            )}
                          </span>
                          <div>
                            <p className="text-[13px] font-extrabold">
                              {data.reference.status === 'confirmed'
                                ? 'Work confirmed'
                                : 'Work not confirmed'}
                            </p>
                            <p className="mt-1 text-[12px] leading-relaxed text-muted">
                              A response was recorded for this reference on{' '}
                              {formatDate(data.reference.respondedAt)}. If you
                              did not make this response, contact VeriPass
                              support.
                            </p>
                            {data.reference.comment && (
                              <p className="mt-3 rounded-xl bg-paper p-3 text-[12px] italic leading-relaxed text-ink/60">
                                “{data.reference.comment}”
                              </p>
                            )}
                          </div>
                        </div>
                        <Link href="/" className="btn-outline mt-6">
                          <ArrowLeft size={14} />
                          Back to VeriPass
                        </Link>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="mt-7">
                        <fieldset>
                          <legend className="text-[13px] font-extrabold">
                            What can you confirm?
                          </legend>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => setChoice('confirmed')}
                              className={`group rounded-2xl border p-4 text-left transition ${
                                choice === 'confirmed'
                                  ? 'border-forest bg-forest text-paper'
                                  : 'border-line bg-paper hover:border-forest/35'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <span
                                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                    choice === 'confirmed'
                                      ? 'bg-lime text-forest'
                                      : 'bg-forest/[0.07] text-forest'
                                  }`}
                                >
                                  <ThumbsUp size={16} />
                                </span>
                                <span
                                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                    choice === 'confirmed'
                                      ? 'border-lime bg-lime text-forest'
                                      : 'border-line text-transparent'
                                  }`}
                                >
                                  <Check size={11} strokeWidth={3} />
                                </span>
                              </div>
                              <p className="mt-4 text-[13px] font-extrabold">
                                Yes, I know their work
                              </p>
                              <p
                                className={`mt-1 text-[10.5px] leading-relaxed ${
                                  choice === 'confirmed'
                                    ? 'text-paper/50'
                                    : 'text-muted'
                                }`}
                              >
                                I have directly seen or received work from this
                                artisan.
                              </p>
                            </button>
                            <button
                              type="button"
                              onClick={() => setChoice('declined')}
                              className={`group rounded-2xl border p-4 text-left transition ${
                                choice === 'declined'
                                  ? 'border-clay bg-clay text-paper'
                                  : 'border-line bg-paper hover:border-clay/35'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <span
                                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                    choice === 'declined'
                                      ? 'bg-paper/15 text-paper'
                                      : 'bg-clay/[0.07] text-clay'
                                  }`}
                                >
                                  <ThumbsDown size={16} />
                                </span>
                                <span
                                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                    choice === 'declined'
                                      ? 'border-paper/30 bg-paper text-clay'
                                      : 'border-line text-transparent'
                                  }`}
                                >
                                  <X size={11} strokeWidth={3} />
                                </span>
                              </div>
                              <p className="mt-4 text-[13px] font-extrabold">
                                No, I can&apos;t confirm
                              </p>
                              <p
                                className={`mt-1 text-[10.5px] leading-relaxed ${
                                  choice === 'declined'
                                    ? 'text-paper/50'
                                    : 'text-muted'
                                }`}
                              >
                                I didn&apos;t work with them, or the work did
                                not meet expectations.
                              </p>
                            </button>
                          </div>
                        </fieldset>

                        {choice === 'confirmed' && (
                          <div className="mt-6">
                            <label className="label">
                              How would you rate the work?
                            </label>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRating(star)}
                                  className="rounded p-0.5 transition hover:scale-110"
                                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                                >
                                  <Star
                                    size={26}
                                    className={
                                      star <= rating
                                        ? 'fill-amber text-amber'
                                        : 'fill-transparent text-ink/20'
                                    }
                                  />
                                </button>
                              ))}
                              <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                                {rating}/5
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="mt-6">
                          <label htmlFor="comment" className="label">
                            Add context{' '}
                            <span className="normal-case tracking-normal text-muted/60">
                              (optional but useful)
                            </span>
                          </label>
                          <textarea
                            id="comment"
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            className="input"
                            maxLength={500}
                            placeholder="What did they do? How was the quality, communication and follow-through?"
                          />
                          <p className="field-hint text-right">
                            {comment.length}/500
                          </p>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                          <p className="flex max-w-sm items-start gap-2 text-[10px] leading-relaxed text-muted">
                            <ShieldCheck
                              size={13}
                              className="mt-0.5 shrink-0 text-forest"
                            />
                            Your name is abbreviated publicly. Your contact
                            details and full response are kept for audit only.
                          </p>
                          <button
                            type="submit"
                            disabled={submitting || !choice}
                            className="btn-primary shrink-0"
                          >
                            {submitting ? (
                              <>
                                <Spinner className="h-4 w-4" />
                                Recording…
                              </>
                            ) : (
                              <>
                                Submit response
                                <CheckCircle2 size={15} />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </section>

                <div className="mt-7 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="max-w-md text-center text-[10px] leading-relaxed text-muted/70 sm:text-left">
                    VeriPass is a verification layer, not a review marketplace.
                    References are collected only for the artisan named above.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-forest hover:underline"
                  >
                    <LogoMark size={16} />
                    About VeriPass
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
