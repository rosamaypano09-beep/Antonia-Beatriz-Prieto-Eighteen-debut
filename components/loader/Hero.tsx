'use client';

import { fillCelebrant } from '@/lib/celebrant';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import {
  motion,
  type Transition,
  type Variants,
} from 'motion/react';
import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';
import { useSiteConfig } from '@/hooks/use-site-config';
import { siteConfig as defaultSiteConfig } from '@/content/site';
import { parseWeddingDate } from '@/lib/wedding-date';
import { InvitePhotoBackdrop } from '@/components/loader/invite-photo-backdrop';
import { PlainAtmosphere } from '@/components/loader/PlainAtmosphere';
import { PlainBubbles } from '@/components/loader/PlainBubbles';
import { GhostMarquee } from '@/components/loader/GhostMarquee';
import localFont from 'next/font/local';
import { Lora, Playfair_Display } from 'next/font/google';
import { cinzel } from '@/lib/fonts';
import './envelope-invite.css';

// Paper lettering — same faces as the loading screen and the home hero
const theSeasons = localFont({
  src: '../../Font/Fontspring-DEMO-theseasons-reg.otf',
  display: 'swap',
});
const aboveTheBeyond = localFont({
  src: '../../Font/above-the-beyond-script.otf',
  display: 'swap',
});
// Lines under the envelope: italic countdown (Playfair) + italic tagline (Lora)
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['italic'],
  display: 'swap',
  variable: '--env-font-countdown',
});
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['italic'],
  display: 'swap',
  variable: '--env-font-tagline',
});

interface HeroProps {
  onOpen: () => void;
  onTransitionStart?: () => void;
  visible: boolean;
  enterFromLoading?: boolean;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Gold dust drifting up over the scene — same feel as the loading screen
const RISING_MOTES = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  size: 2 + ((i * 7) % 4),
  dur: 11 + ((i * 5) % 10),
  delay: -((i * 3.1) % 16),
  drift: (i % 2 === 0 ? 1 : -1) * (10 + ((i * 11) % 22)),
}));

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

const focusLiftEase: Transition = { duration: 1.15, ease: [0.22, 1, 0.36, 1] };
const revealEntryEase: Transition = { duration: 0.9, ease: [0.22, 1, 0.36, 1] };
const buttonEntryEase: Transition = { duration: 0.95, ease: [0.16, 1, 0.3, 1] };

type EnvelopePhase =
  | 'idle'
  | 'seal-press'
  | 'seal-break'
  | 'flap-open'
  | 'rising'
  | 'photos'
  | 'revealed'
  | 'cta';

function getFocusLiftPhase(phase: EnvelopePhase): 'idle' | 'opening' | 'photos' | 'revealed' | 'cta' {
  if (phase === 'idle') return 'idle';
  if (
    phase === 'seal-press' ||
    phase === 'seal-break' ||
    phase === 'flap-open' ||
    phase === 'rising'
  ) {
    return 'opening';
  }
  if (phase === 'photos') return 'photos';
  if (phase === 'revealed') return 'revealed';
  return 'cta';
}

const letterEmergenceEase: Transition = { duration: 3.05, ease: [0.5, 0.02, 0.14, 1] };
const flapEase: Transition = { duration: 1.1, ease: [0.65, 0, 0.35, 1] };
const inviteExitEase: Transition = { duration: 1.65, ease: [0.22, 1, 0.36, 1], delay: 0.75 };
const inviteEnterEase: Transition = { duration: 1.2, ease: [0.22, 1, 0.36, 1] };
const letterExitEase: Transition = { duration: 1.55, ease: [0.16, 1, 0.3, 1] };
const inviteRevealLeadMs = 460;
const INVITE_EXIT_MS = 2500;

export const Hero: React.FC<HeroProps> = ({
  onOpen,
  onTransitionStart,
  visible,
  enterFromLoading = false,
}) => {
  const siteConfig = useSiteConfig();
  const content = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen;
  const isPlain = content.display === 'plain';
  const plainTheme = content.plainTheme ?? defaultSiteConfig.loadingScreen.plainTheme;
  const cornerDecos = content.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos;
  const plainInvite = content.plainInvite ?? defaultSiteConfig.loadingScreen.plainInvite;
  // Paper card wording is shared with the loading screen poster
  const gala = content.gala ?? defaultSiteConfig.loadingScreen.gala;
  const reduceMotion = useHydratedReducedMotion();
  const openedRef = useRef(false);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<EnvelopePhase>('idle');
  const [liveMessage, setLiveMessage] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const fill = (text: string) => fillCelebrant(text, siteConfig);
  // Same edge lettering as the loading screen
  const ghostText = (gala.ghostText ?? []).map((t) => fill(t)).filter(Boolean).join('  ·  ');

  const letterDateNumeric = useMemo(() => {
    const parsed = parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date);
    const wedding = new Date(`${parsed.month} ${parsed.day}, ${parsed.year}`);
    if (Number.isNaN(wedding.getTime())) {
      const monthDate = new Date(`${parsed.month} 1, ${parsed.year}`);
      const month = Number.isNaN(monthDate.getTime())
        ? '00'
        : String(monthDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.day).padStart(2, '0');
      const year = String(parsed.year).slice(-2);
      return `${month} | ${day} | ${year}`;
    }
    const month = String(wedding.getMonth() + 1).padStart(2, '0');
    const day = String(wedding.getDate()).padStart(2, '0');
    const year = String(wedding.getFullYear()).slice(-2);
    return `${month} | ${day} | ${year}`;
  }, [siteConfig.ceremony.date, siteConfig.wedding.date]);

  // Letter date: weekday above, then Mon · day · year (short month; the full date stays in the aria-label)
  const letterDate = useMemo(() => {
    const parsed = parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date);
    return {
      weekday: parsed.dayOfWeek,
      month: parsed.month.charAt(0) + parsed.month.slice(1, 3).toLowerCase(),
      day: String(parsed.day).padStart(2, '0'),
      year: parsed.year,
      label: `${parsed.dayOfWeek}, ${parsed.month} ${parsed.day}, ${parsed.year}`,
    };
  }, [siteConfig.ceremony.date, siteConfig.wedding.date]);

  const monogram = siteConfig.celebrant?.monogram;

  const weddingDateGhost = useMemo(() => {
    const [month, day, year] = letterDateNumeric.split(' | ');
    return { month, day, year };
  }, [letterDateNumeric]);

  const backgroundPhotos = useMemo(
    () => (content.backgroundPhotos ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotos],
  );
  const showPhotoBackdrop = !isPlain && backgroundPhotos.length > 0;

  const countdownText = useMemo(() => {
    const weddingDate = new Date(siteConfig.wedding.date);
    if (Number.isNaN(weddingDate.getTime())) return '';
    const now = new Date();
    const days = Math.round((startOfDay(weddingDate) - startOfDay(now)) / MS_PER_DAY);
    if (days < 0) return content.countdownPastText;
    if (days === 0) return content.countdownTodayText;
    if (days === 1) return content.countdownOneDayText;
    return content.countdownText.replace('{days}', days.toLocaleString());
  }, [content, siteConfig.wedding.date]);

  const flapIsOpen =
    phase === 'flap-open' ||
    phase === 'rising' ||
    phase === 'photos' ||
    phase === 'revealed' ||
    phase === 'cta';

  const contentsVisible =
    phase === 'rising' ||
    phase === 'photos' ||
    phase === 'revealed' ||
    phase === 'cta';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!visible) {
      openedRef.current = false;
      setPhase('idle');
      setLiveMessage('');
      setIsExiting(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || isExiting) return;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [visible, isExiting]);

  useEffect(() => {
    if (phase === 'cta') {
      enterBtnRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  const handleEnterInvitation = useCallback(async () => {
    if (isExiting || phase !== 'cta') return;

    setIsExiting(true);
    setLiveMessage('Opening your invitation.');

    if (reduceMotion) {
      onTransitionStart?.();
      onOpen();
      return;
    }

    await wait(inviteRevealLeadMs);
    onTransitionStart?.();
    await wait(INVITE_EXIT_MS - inviteRevealLeadMs);
    onOpen();
  }, [isExiting, onOpen, onTransitionStart, phase, reduceMotion]);

  const runOpenSequence = useCallback(async () => {
    if (reduceMotion) {
      setPhase('cta');
      setLiveMessage('Invitation opened.');
      return;
    }

    setLiveMessage('Pressing seal.');
    setPhase('seal-press');
    await wait(180);

    setLiveMessage('Breaking seal.');
    setPhase('seal-break');
    await wait(320);

    setLiveMessage('Opening envelope.');
    setPhase('flap-open');
    await wait(1100);

    setLiveMessage('Invitation rising.');
    setPhase('rising');
    await wait(isPlain ? 2400 : 3400);

    setPhase('revealed');
    await wait(650);

    setPhase('cta');
    setLiveMessage('Invitation ready.');
  }, [isPlain, reduceMotion]);

  const handleSealClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      if (openedRef.current || phase !== 'idle') return;
      openedRef.current = true;
      void runOpenSequence();
    },
    [phase, runOpenSequence]
  );

  /* Match reference sample: single flap, rotateX(180deg) positive, origin top center */
  const flapVariants: Variants = {
    closed: { rotateX: 0 },
    open: { rotateX: 180 },
  };

  // The seal is kept exactly where it is: a quick press, then it springs back to full size
  const sealVariants: Variants = {
    idle: { scale: 1, opacity: 1, rotate: 0, y: 0 },
    press: { scale: 0.94, opacity: 1, rotate: 0, y: 2 },
    settled: { scale: 1, opacity: 1, rotate: 0, y: 0 },
  };

  /*
    Letter starts deep in the pocket (positive y) and pulls up through the lip.
    Phones stop with the lower part still tucked in the pocket; desktop keeps its settled position.
  */
  const letterVariants: Variants = useMemo(
    () => ({
      hidden: { y: '100%', scale: 0.86, opacity: 1, rotate: -0.4 },
      rising: {
        y: isMobileViewport ? '-8%' : '14%',
        scale: 1,
        opacity: 1,
        rotate: 0,
      },
      out: {
        y: isMobileViewport ? '-8%' : '14%',
        scale: 1,
        opacity: 1,
        rotate: 0,
      },
      exitPortal: {
        y: '-118%',
        scale: 3.35,
        opacity: 1,
        rotate: 0,
        zIndex: 48,
      },
    }),
    [isMobileViewport],
  );

  const revealCopyContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.16, delayChildren: 0.1 },
    },
    exit: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  const revealCopyItemVariants: Variants = {
    hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: revealEntryEase,
    },
    exit: {
      opacity: 0,
      y: 28,
      filter: 'blur(6px)',
      transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
    },
  };

  const buttonRevealVariants: Variants = {
    hidden: { opacity: 0, y: 28, scale: 0.92, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: buttonEntryEase,
    },
    exit: {
      opacity: 0,
      y: 18,
      scale: 1.06,
      filter: 'blur(8px)',
      transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
    },
  };

  const focusLiftVariants: Variants = {
    idle: { y: 0, scale: 1, opacity: 1 },
    opening: { y: 0, scale: 1, opacity: 1 },
    photos: { y: 0, scale: 1, opacity: 1 },
    revealed: { y: 0, scale: 1, opacity: 1 },
    cta: { y: 0, scale: 1, opacity: 1 },
    exit: {
      y: -18,
      scale: 0.94,
      opacity: 0,
      transition: { duration: 1.15, delay: 0.52, ease: [0.4, 0, 0.2, 1] },
    },
  };

  if (!mounted) return null;

  const letterState =
    phase === 'idle' ||
    phase === 'seal-press' ||
    phase === 'seal-break' ||
    phase === 'flap-open'
      ? 'hidden'
      : phase === 'rising'
        ? 'rising'
        : 'out';

  const sealState =
    phase === 'idle' ? 'idle' : phase === 'seal-press' ? 'press' : 'settled';

  return (
    <motion.div
      className={`env-invite-screen ${playfair.variable} ${lora.variable}${isPlain ? ' env-invite-screen--plain' : ''}${isPlain && enterFromLoading && visible && !reduceMotion ? ' is-arriving' : ''} ${visible ? '' : 'is-hidden'}`}
      data-phase={isExiting ? 'exiting' : phase}
      aria-hidden={!visible}
      initial={false}
      animate={
        isExiting
          ? { opacity: 0, y: 0, scale: 1 }
          : visible
            ? { opacity: 1, y: 0, scale: 1 }
            : isPlain
              ? // plain: the background matches the loader's, so only fade — the envelope itself arrives (CSS .is-arriving)
                { opacity: 0, y: 0, scale: 1 }
              : { opacity: 0, y: 18, scale: 0.985 }
      }
      transition={
        isExiting
          ? inviteExitEase
          : visible && enterFromLoading && !reduceMotion
            ? inviteEnterEase
            : { duration: reduceMotion ? 0.2 : 0.01 }
      }
      style={{
        pointerEvents: !visible || isExiting ? 'none' : undefined,
        ...(isPlain && {
          '--env-plain-bg': plainTheme.background,
          '--env-plain-ink': plainTheme.text,
          '--env-plain-accent': plainTheme.accent,
        }),
      } as React.CSSProperties}
    >
      {showPhotoBackdrop && (
        <div className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--envelope" aria-hidden="true">
          <InvitePhotoBackdrop className="invite-photo-backdrop--envelope" photos={backgroundPhotos} />
        </div>
      )}

      {isPlain && (
        <>
          <PlainAtmosphere fixed baseColor={plainTheme.background} />
          <PlainBubbles fixed />
          <div className="env-invite-plain-corners" aria-hidden="true">
            {(
              [
                { src: cornerDecos.topLeft, className: 'left-0 top-0' },
                { src: cornerDecos.topRight, className: 'right-0 top-0' },
                { src: cornerDecos.bottomLeft, className: 'left-0 bottom-0' },
                { src: cornerDecos.bottomRight, className: 'right-0 bottom-0' },
              ] as const
            ).map(({ src, className }) => (
              <div key={src} className={`pointer-events-none absolute ${className}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="env-invite-plain-corner-img" />
              </div>
            ))}
          </div>
        </>
      )}

      {!isPlain && <div className="env-invite-readability-scrim" aria-hidden="true" />}

      {!reduceMotion && (
        <div className="env-invite-particles pointer-events-none" aria-hidden="true">
          {RISING_MOTES.map((m, i) => (
            <span
              key={i}
              className="env-invite-mote"
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

      <div className="env-invite-bg-glow pointer-events-none" aria-hidden="true" />

      <div className="env-invite-ghost-date pointer-events-none select-none" aria-hidden="true">
        <span className="env-invite-ghost-date-part">{weddingDateGhost.month}</span>
        <span className="env-invite-ghost-date-sep" aria-hidden="true" />
        <span className="env-invite-ghost-date-part">{weddingDateGhost.day}</span>
        <span className="env-invite-ghost-date-sep" aria-hidden="true" />
        <span className="env-invite-ghost-date-part">{weddingDateGhost.year}</span>
      </div>

      {/* Ghost lettering drifting down the left edge and up the right */}
      <GhostMarquee
        text={ghostText}
        className="env-invite-ghost-marquee"
        fontClassName={theSeasons.className}
        still={!!reduceMotion}
      />

      {isExiting && !reduceMotion && (
        <>
          <motion.div
            className="env-invite-exit-ring"
            aria-hidden="true"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 3.45, opacity: [0, 0.62, 0] }}
            transition={{ duration: 1.65, ease: [0.22, 1, 0.36, 1], times: [0, 0.34, 1], delay: 0.06 }}
          />
          <motion.div
            className="env-invite-exit-bloom"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.28 }}
            animate={{ opacity: [0, 0.96, 0.72, 0], scale: [0.28, 1.08, 1.52, 1.78] }}
            transition={{
              duration: 1.72,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.26, 0.58, 1],
              delay: 0.1,
            }}
          />
          <motion.div
            className="env-invite-exit-shimmer"
            aria-hidden="true"
            initial={{ x: '-130%', opacity: 0 }}
            animate={{ x: '130%', opacity: [0, 0.85, 0] }}
            transition={{ duration: 1.25, ease: 'easeInOut', delay: 0.22 }}
          />
          <motion.div
            className="env-invite-exit-curtain env-invite-exit-curtain--left"
            aria-hidden="true"
            initial={{ x: '-105%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.95, delay: 1.15, ease: [0.65, 0, 0.35, 1] }}
          />
          <motion.div
            className="env-invite-exit-curtain env-invite-exit-curtain--right"
            aria-hidden="true"
            initial={{ x: '105%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.95, delay: 1.15, ease: [0.65, 0, 0.35, 1] }}
          />
        </>
      )}

      <p className="env-invite-live" aria-live="polite">
        {liveMessage}
      </p>

      <div className="env-invite-stage">
        <div className="env-invite-cluster">
          <motion.div
            className="env-invite-focus"
            variants={focusLiftVariants}
            initial="idle"
            animate={isExiting ? 'exit' : getFocusLiftPhase(phase)}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : isExiting
                  ? { duration: 1.15, delay: 0.52, ease: [0.4, 0, 0.2, 1] }
                  : focusLiftEase
            }
          >
          <motion.div
            className="env-invite-scene"
            initial={false}
            animate={
              isExiting
                ? { opacity: 0, scale: 0.98, y: 0 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            transition={
              isExiting
                ? { duration: 1.1, delay: 0.68, ease: [0.4, 0, 0.2, 1] }
                : { duration: 0.01 }
            }
          >
          <div className="env-invite-ground-shadow" aria-hidden="true" />
          <div className="env-invite-ground-contact" aria-hidden="true" />

          <div className="env-invite-envelope">
            {/* Flap behind body when open — rendered first in paint order */}
            <div className="env-invite-flap-shadow" aria-hidden="true" />
            <motion.div
              className="env-invite-flap"
              variants={flapVariants}
              initial="closed"
              animate={flapIsOpen ? 'open' : 'closed'}
              transition={flapEase}
              style={{ transformOrigin: 'top center' }}
              aria-hidden="true"
            >
              {/* Two-sided flap: velvet outside, gold-lattice liner on the back once it folds open */}
              <span className="env-invite-flap-face env-invite-flap-face--outer" />
              <span className="env-invite-flap-face env-invite-flap-face--liner" />
            </motion.div>

            <div className="env-invite-envelope-body">
              {/* Back panel */}
              <div className="env-invite-back" aria-hidden="true" />

              {/* Interior shadow — only visible once contents rise */}
              <div className="env-invite-interior" aria-hidden="true" />

              {/* Contents — clipped inside pocket */}
              <div className="env-invite-contents-clip" aria-hidden={!contentsVisible}>
              <div className="env-invite-contents">
                <div className="env-invite-emerge-stack">
                  <motion.div
                    className="env-invite-letter"
                    variants={letterVariants}
                    initial="hidden"
                    animate={isExiting ? 'exitPortal' : letterState}
                    transition={
                      isExiting
                        ? { ...letterExitEase, delay: 0.14 }
                        : letterState === 'rising'
                          ? {
                              ...letterEmergenceEase,
                              opacity: { duration: 0 },
                            }
                          : { duration: 0.01 }
                    }
                  >
                    <div className="env-invite-letter-frame" aria-hidden="true" />
                    {monogram && (
                      <div
                        className="env-invite-letter-watermark"
                        aria-hidden="true"
                        style={{ maskImage: `url("${monogram}")`, WebkitMaskImage: `url("${monogram}")` }}
                      />
                    )}
                    <div className="env-invite-letter-inner">
                      <div className="env-invite-letter-top">
                        {isPlain && plainInvite.ornament && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={plainInvite.ornament}
                            alt=""
                            aria-hidden="true"
                            className="env-invite-letter-ornament"
                          />
                        )}
                        <span className="env-invite-letter-eyebrow">{gala.cardEyebrow ?? gala.eyebrow}</span>
                        <span className="env-invite-letter-divider" aria-hidden="true" />
                        {gala.cardLine && <span className="env-invite-letter-line">{fill(gala.cardLine)}</span>}
                      </div>
                      <span className="env-invite-letter-title" role="img" aria-label={`${fill(gala.title)} — ${fill(gala.subtitle)}`}>
                        <span className={`${aboveTheBeyond.className} env-invite-letter-title__main`}>
                          {fill(gala.title)}
                        </span>
                        {gala.subtitle && (
                          <span className={`${cinzel.className} env-invite-letter-title__script`}>
                            {fill(gala.subtitle)}
                          </span>
                        )}
                      </span>
                      <div className="env-invite-letter-bottom">
                        <span
                          className="env-invite-letter-occasion"
                          role="img"
                          aria-label={`${gala.occasionNumber}${gala.occasionSuffix} ${gala.occasion}`}
                        >
                          <span className={`${theSeasons.className} env-invite-letter-occasion__age`}>
                            {gala.occasionNumber}
                            <sup>{gala.occasionSuffix}</sup>
                          </span>
                          <span className={`${aboveTheBeyond.className} env-invite-letter-occasion__script`}>
                            {gala.occasion}
                          </span>
                        </span>
                        <span className="env-invite-letter-divider" aria-hidden="true" />
                        <span className="env-invite-letter-date" role="img" aria-label={letterDate.label}>
                          <span className="env-invite-letter-date__weekday">{letterDate.weekday}</span>
                          <span className="env-invite-letter-date__row">
                            <span className="env-invite-letter-date__side">{letterDate.month}</span>
                            <span className="env-invite-letter-date__day">{letterDate.day}</span>
                            <span className="env-invite-letter-date__side">{letterDate.year}</span>
                          </span>
                        </span>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </div>
            </div>

            {/* 3. Closed front skin — solid cover, hides when open */}
            <div className="env-invite-front-closed" aria-hidden="true">
              <div className="env-invite-fold env-invite-fold--tl" />
              <div className="env-invite-fold env-invite-fold--bl" />
              <div className="env-invite-fold env-invite-fold--br" />
              <div className="env-invite-fold env-invite-fold--b" />
              <svg
                className="env-invite-creases"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <line x1="0" y1="0" x2="50" y2="50" />
                <line x1="100" y1="0" x2="50" y2="50" />
                <line x1="0" y1="100" x2="50" y2="50" />
                <line x1="100" y1="100" x2="50" y2="50" />
              </svg>
            </div>

            <div className="env-invite-hinge" aria-hidden="true" />
            </div>

            {/* Front pocket — above body so paper stays tucked inside */}
            <div className="env-invite-pocket" aria-hidden="true">
              <div className="env-invite-pocket-front" />
              <div className="env-invite-pocket-left" />
              <div className="env-invite-pocket-right" />
            </div>


            {/* Wax seal — centered on flap junction */}
            <div className="env-invite-seal-wrap">
              <motion.button
                type="button"
                className="env-invite-seal-btn"
                variants={sealVariants}
                initial="idle"
                animate={sealState}
                transition={
                  sealState === 'settled'
                    ? { duration: 0.3, ease: 'easeOut' }
                    : { duration: 0.16, ease: 'easeOut' }
                }
                onClick={handleSealClick}
                disabled={phase !== 'idle'}
                aria-label="Break the wax seal to open the invitation"
              >
                <Image
                  src={content.sealImage ?? defaultSiteConfig.loadingScreen.sealImage}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 768px) 148px, 132px"
                  className="env-invite-seal-img object-contain"
                />
              </motion.button>
            </div>

          </div>
        </motion.div>

          <p className="env-invite-hint">{content.hintText}</p>

          </motion.div>
        </div>
      </div>

      <div className="env-invite-cta-bar" aria-live="off">
        <motion.div
          className="env-invite-reveal-copy"
          variants={revealCopyContainerVariants}
          initial="hidden"
          animate={
            isExiting
              ? 'exit'
              : phase === 'revealed' || phase === 'cta'
                ? 'visible'
                : 'hidden'
          }
        >
          {countdownText && (
            <motion.p
              className="env-invite-days-to-go"
              variants={revealCopyItemVariants}
            >
              {countdownText}
            </motion.p>
          )}
          <motion.h2 variants={revealCopyItemVariants}>{content.message}</motion.h2>
        </motion.div>

        <motion.button
          ref={enterBtnRef}
          type="button"
          className="env-invite-enter-btn"
          variants={buttonRevealVariants}
          initial="hidden"
          animate={
            isExiting
              ? 'exit'
              : phase === 'cta'
                ? 'visible'
                : 'hidden'
          }
          whileHover={
            phase === 'cta' && !isExiting && !reduceMotion
              ? { y: -2, scale: 1.02 }
              : undefined
          }
          whileTap={
            phase === 'cta' && !isExiting && !reduceMotion
              ? { y: 0, scale: 0.98 }
              : undefined
          }
          onClick={handleEnterInvitation}
          disabled={phase !== 'cta' || isExiting}
        >
          {content.enterButtonText}
        </motion.button>
      </div>
    </motion.div>
  );
};

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
