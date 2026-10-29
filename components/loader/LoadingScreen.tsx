'use client';

import { fillCelebrant } from '@/lib/celebrant';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';
import { Cormorant_Garamond, Playfair_Display } from 'next/font/google';
import { cinzel } from '@/lib/fonts';
import localFont from 'next/font/local';
import { useSiteConfig } from '@/hooks/use-site-config';
import { siteConfig as defaultSiteConfig } from '@/content/site';
import { InvitePhotoBackdrop } from '@/components/loader/invite-photo-backdrop';
import { GhostMarquee } from '@/components/loader/GhostMarquee';
import './loading-screen.css';
import './loading-screen-gala.css';

// Poster type: Didone display for the gold titles, engraved caps for tracked lines,
// a refined old-style serif for the small details
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--gala-font-display',
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
// On a very slow connection, stop waiting for files after this long and finish anyway
const MAX_WAIT_MS = 15000;

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

// Gold dust drifting up over the velvet
const MOTES = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  size: 2 + ((i * 7) % 4),
  dur: 12 + ((i * 5) % 10),
  delay: -((i * 3.1) % 16),
  drift: (i % 2 === 0 ? 1 : -1) * (10 + ((i * 11) % 22)),
}));

function GoldRule() {
  return (
    <div className="gala-rule" aria-hidden="true">
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
  const progressRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  // Time already played before this mount (0 on a normal first load)
  const elapsedRef = useRef(0);

  const name = fill(gala.title);
  const ghostText = (gala.ghostText ?? []).map((t) => fill(t)).filter(Boolean).join('  ·  ');

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

  // Real progress: the bar follows the clock (at least totalDurationMs) but can't pass
  // what has actually loaded — fonts, the portrait and the page's own load event.
  // Written straight to the DOM each frame so the poster doesn't re-render 60×/s.
  useEffect(() => {
    let assetsDone = 0;
    let cancelled = false;
    const tasks: Promise<unknown>[] = [
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
    ];
    if (gala.photo) {
      tasks.push(
        new Promise((resolve) => {
          const img = new window.Image();
          img.onload = img.onerror = resolve;
          img.src = encodeURI(gala.photo);
        }),
      );
    }
    tasks.forEach((task) =>
      task.then(() => {
        if (!cancelled) assetsDone += 1;
      }),
    );

    let shown = 0;
    let lastPercent = -1;
    let lastStatus = 0;
    let frame = 0;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let doneTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      setFadeOut(true);
      onFadeStartRef.current?.();
      const fadeMs = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 200 : FADE_OUT_MS;
      fadeTimer = setTimeout(() => {
        runStart = null; // the next loading run (e.g. client navigation back) starts fresh
        onCompleteRef.current();
      }, fadeMs);
    };

    const tick = () => {
      const elapsed = performance.now() - (runStart ?? 0);
      const t = Math.min(elapsed / totalDurationMs, 1);
      // Uneven pace, like a real download: quick bursts and short stalls (still never backwards)
      const timed = Math.min(t + 0.035 * Math.sin(t * Math.PI * 3), 1);
      const loaded = assetsDone >= tasks.length || elapsed >= MAX_WAIT_MS;
      // Until everything has arrived, hold short of the end (≈ 90%)
      const cap = loaded ? 1 : 0.35 + 0.55 * (assetsDone / tasks.length);
      const target = Math.min(timed, cap);
      shown = Math.max(shown, shown + (target - shown) * 0.14);
      if (target === 1 && 1 - shown < 0.004) shown = 1;

      if (barRef.current) barRef.current.style.width = `${shown * 100}%`;
      const percent = Math.round(shown * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        progressRef.current?.setAttribute('aria-valuenow', String(percent));
      }
      if (statusMessages.length > 1) {
        const index = Math.min(Math.floor(shown * statusMessages.length), statusMessages.length - 1);
        if (index !== lastStatus) {
          lastStatus = index;
          setStatusIndex(index);
        }
      }

      if (shown >= 1) {
        // Let "100%" register for a beat before the fade
        doneTimer = setTimeout(finish, 350);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(doneTimer);
      clearTimeout(fadeTimer);
    };
    // Runs once per mount — inputs are locked above
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {/* Ghost lettering drifting down the left edge and up the right */}
      <GhostMarquee
        text={ghostText}
        className="gala-ghost"
        fontClassName={theSeasons.className}
        still={reduceMotion}
      />
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
            <p className="gala__eyebrow">
              {gala.eyebrow}
            </p>
          )}
          <GoldRule />
          <h1 className="gala__title" aria-label={name}>
            {/* Nickname in gold script, with a soft glow behind it */}
            <span className="gala__name-wrap" aria-hidden="true">
              <span className="gala__name gala-script gala-gold">
                {name}
              </span>
            </span>
          </h1>
        </header>

        <div className="gala__stage">
          {gala.taglineLeft.length > 0 && (
            <div className="gala__tagline gala__tagline--left">
              <p>
                {gala.taglineLeft.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <GoldRule />
            </div>
          )}
          {gala.taglineRight.length > 0 && (
            <div className="gala__tagline gala__tagline--right">
              <p>
                {gala.taglineRight.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <GoldRule />
            </div>
          )}
          {gala.photo && (
            <div className="gala__photo">
              <Image
                src={gala.photo}
                alt={fill('{celebrant}')}
                fill
                priority
                sizes="(max-width: 559px) 135vw, 680px"
                className="gala__photo-img"
              />
            </div>
          )}
        </div>

        <footer className="gala__foot">
          {gala.kicker && (
            <p className="gala__kicker">
              {gala.kicker}
            </p>
          )}
          <h2
            className="gala__occasion"
            aria-label={`${gala.occasionNumber}${gala.occasionSuffix} ${gala.occasion}`}
          >
            {/* Each piece carries its own gold fill — background-clip text doesn't reach nested elements */}
            <span className="gala__age" aria-hidden="true">
              <span className="gala__age-num gala-gold">{gala.occasionNumber}</span>
              {gala.occasionSuffix && (
                <span className="gala__age-suffix">
                  <span className="gala-gold">{gala.occasionSuffix}</span>
                </span>
              )}
            </span>
            {/* Script line overlapping the age, like the hero title */}
            <span className="gala__occasion-script-wrap" aria-hidden="true">
              <span className="gala__occasion-script gala-script gala-gold">{gala.occasion}</span>
            </span>
          </h2>
          {/* Full name in engraved caps under "18th Birthday" */}
          {gala.subtitle && (
            <p className="gala__fullname">
              <span className="gala-gold">{fill(gala.subtitle)}</span>
            </p>
          )}
          <GoldRule />

          <div
            ref={progressRef}
            className="gala__progress"
            role="progressbar"
            aria-label="Loading invitation"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <div className="gala__progress-frame">
              <div className="gala__progress-track">
                {/* Width driven by the progress loop above */}
                <div ref={barRef} className="gala__progress-bar" />
              </div>
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
