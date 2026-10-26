'use client';

import { fillCelebrant } from '@/lib/celebrant';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';
import { Cinzel, Cormorant_Garamond, Playfair_Display } from 'next/font/google';
import localFont from 'next/font/local';
import { useSiteConfig } from '@/hooks/use-site-config';
import { siteConfig as defaultSiteConfig } from '@/content/site';
import { InvitePhotoBackdrop } from '@/components/loader/invite-photo-backdrop';
import './loading-screen.css';
import './loading-screen-gala.css';

// Poster type: Didone display for the gold titles, engraved caps for tracked lines,
// a refined old-style serif for the small details
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--gala-font-display',
});
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--gala-font-caps',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--gala-font-body',
});

// Title + "18th Birthday": same lettering pair as the home hero — serif line + overlapping script
const theSeasons = localFont({
  src: '../../Font/Fontspring-DEMO-theseasons-reg.otf',
  display: 'swap',
  variable: '--gala-font-seasons',
});
const aboveTheBeyond = localFont({
  src: '../../Font/above-the-beyond-script.otf',
  display: 'swap',
  variable: '--gala-font-script',
});

// Each curtain panel is a row of velvet folds that bunch toward the side as it opens
const CURTAIN_FOLDS = 8;

interface LoadingScreenProps {
  onComplete: () => void;
  onFadeStart?: () => void;
}

const FADE_OUT_MS = 1400;

// When the current loading run first painted (performance.now() clock). Module-level so it
// outlives a remount: a hydration fallback or parent re-render that rebuilds this DOM would
// otherwise restart every CSS animation — the curtains close and part a second time.
let runStart: number | null = null;

// Stamped by an inline script in the server HTML as the loader is parsed, so the run's start
// survives even when React discards the server DOM before any effect runs (hydration fallback)
const RUN_START_KEY = '__galaRunStart';
const RUN_START_SCRIPT = `window.${RUN_START_KEY}=performance.now()`;

// A rebuilt animation is this far behind the run before it gets fast-forwarded
const RESYNC_SLACK_MS = 120;

// Entrance timeline (ms). CSS-delay driven so it plays from first paint, before hydration.
// The velvet curtains part first; everything else enters as they open.
const T = {
  eyebrow: 900,
  topRule: 1050,
  nameStart: 1150,
  nameStagger: 70,
  subtitle: 1900,
  photo: 1300,
  taglines: 2300,
  kicker: 2700,
  age: 2900,
  occasion: 3150,
  bottomRule: 3500,
  details: 3650,
  detailsStagger: 160,
  progress: 4300,
} as const;

// Gold dust drifting up over the velvet
const MOTES = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  size: 2 + ((i * 7) % 4),
  dur: 12 + ((i * 5) % 10),
  delay: -((i * 3.1) % 16),
  drift: (i % 2 === 0 ? 1 : -1) * (10 + ((i * 11) % 22)),
}));

const delay = (ms: number) => ({ '--gala-delay': `${ms}ms` }) as React.CSSProperties;

function GoldRule({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`gala-rule ${className}`} style={style} aria-hidden="true">
      <span className="gala-rule__line" />
      <svg className="gala-rule__gem" viewBox="0 0 28 12">
        <path d="M14 1 L20 6 L14 11 L8 6 Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <path d="M14 4 L16.5 6 L14 8 L11.5 6 Z" fill="currentColor" />
        <circle cx="3" cy="6" r="1.2" fill="currentColor" />
        <circle cx="25" cy="6" r="1.2" fill="currentColor" />
      </svg>
      <span className="gala-rule__line" />
    </div>
  );
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, onFadeStart }) => {
  const siteConfig = useSiteConfig();
  // Fall back to the bundled config if a remote override is missing these blocks.
  const content = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen;
  const gala = content.gala ?? defaultSiteConfig.loadingScreen.gala;
  // Locked at mount: the remote config (/api/wedding-details) lands mid-animation as a
  // fresh object — re-reading these would reset the timer and the progress bar.
  const [totalDurationMs] = useState(content.durationMs);
  const [statusMessages] = useState(content.statusMessages);
  const fill = (text: string) => fillCelebrant(text, siteConfig);
  // Keyed by the photo list's contents, not its reference, so the same photos arriving
  // in the remote config don't reshuffle the marquee
  const photosKey = (content.backgroundPhotos ?? []).join('\n');
  const backgroundPhotos = useMemo(
    () => (photosKey ? photosKey.split('\n').map((src) => encodeURI(src)) : []),
    [photosKey],
  );

  const reduceMotion = useHydratedReducedMotion();
  // Latest callbacks without restarting the timer when the parent re-renders
  const onCompleteRef = useRef(onComplete);
  const onFadeStartRef = useRef(onFadeStart);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onFadeStartRef.current = onFadeStart;
  });
  const [fadeOut, setFadeOut] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  // Time already played before this mount (0 on a normal first load)
  const elapsedRef = useRef(0);

  const eventDate = useMemo(() => new Date(siteConfig.wedding.date), [siteConfig.wedding.date]);
  const dateLabel = Number.isNaN(eventDate.getTime())
    ? siteConfig.wedding.date
    : eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const name = fill(gala.title);
  const { ceremony } = siteConfig;
  const details = [
    { key: 'date', label: 'Date', value: dateLabel, sub: ceremony.day },
    {
      key: 'time',
      label: 'Time',
      value: ceremony.time,
      sub: ceremony.guestsTime ? `Call time ${ceremony.guestsTime}` : '',
    },
    { key: 'venue', label: 'Venue', value: ceremony.location, sub: ceremony.venue },
  ].filter((d) => d.value);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  // Before paint: anchor the run to first paint, and fast-forward any rebuilt DOM to it
  useLayoutEffect(() => {
    const now = performance.now();
    if (runStart === null) {
      const w = window as unknown as Record<string, unknown>;
      const stamped = w[RUN_START_KEY];
      runStart = typeof stamped === 'number' && stamped <= now ? stamped : now;
      // A later client-side run (navigation back) has no script stamp and starts fresh
      delete w[RUN_START_KEY];
    }
    elapsedRef.current = Math.max(0, now - runStart);
    const root = rootRef.current;
    if (!root || elapsedRef.current < RESYNC_SLACK_MS) return;
    for (const a of root.getAnimations({ subtree: true })) {
      // Only CSS keyframes — leave JS-driven (motion) animations alone
      if (typeof CSSAnimation !== 'undefined' && !(a instanceof CSSAnimation)) continue;
      const t = Number(a.currentTime) || 0;
      if (elapsedRef.current - t > RESYNC_SLACK_MS) a.currentTime = elapsedRef.current;
    }
  }, []);

  useEffect(() => {
    if (statusMessages.length < 2) return;
    const step = totalDurationMs / statusMessages.length;
    const tick = () =>
      setStatusIndex(
        Math.min(Math.floor((performance.now() - (runStart ?? 0)) / step), statusMessages.length - 1),
      );
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [statusMessages.length, totalDurationMs]);

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    const t = setTimeout(() => {
      setFadeOut(true);
      onFadeStartRef.current?.();
      const fadeMs = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 200 : FADE_OUT_MS;
      fadeTimer = setTimeout(() => {
        runStart = null; // the next loading run (e.g. client navigation back) starts fresh
        onCompleteRef.current();
      }, fadeMs);
    }, Math.max(0, totalDurationMs - elapsedRef.current));
    return () => {
      clearTimeout(t);
      clearTimeout(fadeTimer);
    };
    // Runs once per mount — inputs are locked above
  }, [totalDurationMs]);

  return (
    <div
      ref={rootRef}
      className={`gala-loader ${playfair.variable} ${cinzel.variable} ${cormorant.variable} ${theSeasons.variable} ${aboveTheBeyond.variable} fixed inset-0 z-50 overflow-hidden overscroll-none h-dvh max-h-dvh w-screen${fadeOut ? ' is-fading' : ''}${reduceMotion ? ' is-reduced-motion' : ''}`}
      aria-live="polite"
      aria-busy={!fadeOut}
      aria-label="Loading invitation"
      style={{ pointerEvents: fadeOut ? 'none' : 'auto' }}
    >
      {/* Runs only from the server HTML (React never executes client-rendered scripts) */}
      <script dangerouslySetInnerHTML={{ __html: RUN_START_SCRIPT }} suppressHydrationWarning />
      {/* Same photo marquee as the envelope hero, softly blurred under a red-velvet tint */}
      {backgroundPhotos.length > 0 && (
        <div className="gala-marquee" aria-hidden="true">
          <InvitePhotoBackdrop className="invite-photo-backdrop--gala" photos={backgroundPhotos} />
        </div>
      )}

      {/* Velvet tint: folds, blurred roses + gold blooms, spotlight, vignette */}
      <div className="gala-bg" aria-hidden="true">
        <div className="gala-bg__folds" />
        <div className="gala-bg__bloom gala-bg__bloom--left" />
        <div className="gala-bg__bloom gala-bg__bloom--right" />
        <div className="gala-bg__spot" />
        <div className="gala-bg__vignette" />
      </div>
      {!reduceMotion && (
        <div className="gala-motes" aria-hidden="true">
          {MOTES.map((m, i) => (
            <span
              key={i}
              className="gala-mote"
              style={
                {
                  '--x': `${m.x}%`,
                  '--size': `${m.size}px`,
                  '--dur': `${m.dur}s`,
                  '--delay': `${m.delay}s`,
                  '--drift': `${m.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div className="gala">
        <header className="gala__head">
          {gala.eyebrow && (
            <p className="gala__eyebrow gala-reveal" style={delay(T.eyebrow)}>
              {gala.eyebrow}
            </p>
          )}
          <GoldRule className="gala-reveal gala-reveal--wide" style={delay(T.topRule)} />
          <h1 className="gala__title" aria-label={`${name} ${gala.subtitle}`}>
            <span className="gala__name" aria-hidden="true">
              {Array.from(name).map((ch, i) => (
                <span
                  key={i}
                  className="gala__name-letter gala-gold gala-letter"
                  style={delay(T.nameStart + i * T.nameStagger)}
                >
                  {ch}
                </span>
              ))}
            </span>
            {gala.subtitle && (
              <span className="gala__subtitle-wrap" aria-hidden="true">
                <span className="gala__subtitle gala-script gala-gold gala-write" style={delay(T.subtitle)}>
                  {gala.subtitle}
                </span>
              </span>
            )}
          </h1>
        </header>

        <div className="gala__stage">
          {gala.taglineLeft.length > 0 && (
            <div className="gala__tagline gala__tagline--left gala-reveal gala-reveal--left" style={delay(T.taglines)}>
              <p>
                {gala.taglineLeft.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <GoldRule />
            </div>
          )}
          {gala.taglineRight.length > 0 && (
            <div className="gala__tagline gala__tagline--right gala-reveal gala-reveal--right" style={delay(T.taglines + 150)}>
              <p>
                {gala.taglineRight.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <GoldRule />
            </div>
          )}
          {gala.photo && (
            <div className="gala__photo gala-reveal gala-reveal--photo" style={delay(T.photo)}>
              <Image
                src={gala.photo}
                alt={fill('{celebrant}')}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 620px"
                className="gala__photo-img"
              />
            </div>
          )}
        </div>

        <footer className="gala__foot">
          {gala.kicker && (
            <p className="gala__kicker gala-reveal gala-reveal--track" style={delay(T.kicker)}>
              {gala.kicker}
            </p>
          )}
          <h2
            className="gala__occasion"
            aria-label={`${gala.occasionNumber}${gala.occasionSuffix} ${gala.occasion}`}
          >
            {/* Each piece carries its own gold fill — background-clip text doesn't reach nested elements */}
            <span className="gala__age gala-pop" style={delay(T.age)} aria-hidden="true">
              <span className="gala__age-num gala-gold">{gala.occasionNumber}</span>
              {gala.occasionSuffix && (
                <span className="gala__age-suffix">
                  <span className="gala-gold">{gala.occasionSuffix}</span>
                </span>
              )}
            </span>
            {/* Script line is written on left → right, overlapping the age like the hero title */}
            <span className="gala__occasion-script-wrap" aria-hidden="true">
              <span
                className="gala__occasion-script gala-script gala-gold gala-write"
                style={delay(T.occasion)}
              >
                {gala.occasion}
              </span>
            </span>
          </h2>
          <GoldRule className="gala-reveal gala-reveal--wide" style={delay(T.bottomRule)} />

          {details.length > 0 && (
            <dl className="gala__details">
              {details.map(({ key, label, value, sub }, i) => (
                <div
                  key={key}
                  className={`gala__detail gala__detail--${key} gala-reveal`}
                  style={delay(T.details + i * T.detailsStagger)}
                >
                  <dt>{label}</dt>
                  <dd className="gala__detail-value">{value}</dd>
                  {sub && <dd className="gala__detail-sub">{sub}</dd>}
                </div>
              ))}
            </dl>
          )}

          <div
            className="gala__progress gala-reveal"
            style={delay(T.progress)}
            role="progressbar"
            aria-label="Loading invitation"
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="gala__progress-track">
              {/* Fill timing runs from mount, independent of the reveal delay */}
              <div className="gala__progress-bar" style={{ animationDuration: `${totalDurationMs}ms` }} />
            </div>
            {statusMessages.length > 0 && (
              <p key={statusIndex} className="gala__status">
                {statusMessages[statusIndex]}
              </p>
            )}
          </div>
        </footer>
      </div>

      {/* Opening: velvet curtains part to reveal the poster */}
      {!reduceMotion && (
        <div className="gala-curtains" aria-hidden="true">
          {(['left', 'right'] as const).map((side) => (
            <div key={side} className={`gala-curtain gala-curtain--${side}`}>
              {Array.from({ length: CURTAIN_FOLDS }, (_, i) => (
                <span
                  key={i}
                  className="gala-curtain__fold"
                  // i = 0 is the outer edge; inner folds travel furthest and start first
                  style={{ '--i': i, '--inner': CURTAIN_FOLDS - 1 - i } as React.CSSProperties}
                />
              ))}
            </div>
          ))}
          <div className="gala-curtains__seam" />
        </div>
      )}
    </div>
  );
};
