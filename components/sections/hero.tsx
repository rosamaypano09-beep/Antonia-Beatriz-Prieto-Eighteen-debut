"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "motion/react"
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { withRomanNumerals } from "@/components/title-numerals"
import { useSiteConfig } from "@/hooks/use-site-config"
import { parseWeddingDate } from "@/lib/wedding-date"
import { InvitePhotoBackdrop } from "@/components/loader/invite-photo-backdrop"
import { GhostMarquee } from "@/components/loader/GhostMarquee"
import { PlainAtmosphere } from "@/components/loader/PlainAtmosphere"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import { fillCelebrant } from "@/lib/celebrant"
import "@/components/loader/loading-screen.css"
import "./hero.css"


const theSeasons = localFont({
  src: "../../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

const entryEase = [0.22, 1, 0.36, 1] as const

// Gold dust rising through the hero: most drift behind the title, a few pass in front
const HERO_MOTES_BACK = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  size: 2 + ((i * 7) % 4),
  dur: 11 + ((i * 5) % 10),
  delay: -((i * 3.1) % 16),
  drift: (i % 2 === 0 ? 1 : -1) * (10 + ((i * 11) % 22)),
}))
const HERO_MOTES_FRONT = Array.from({ length: 5 }, (_, i) => ({
  x: (i * 23 + 14) % 90 + 5,
  size: 3 + (i % 2),
  dur: 14 + i * 2.5,
  delay: -(i * 3.7),
  drift: (i % 2 === 0 ? -1 : 1) * (14 + i * 6),
}))

function HeroMotes({ layer }: { layer: "back" | "front" }) {
  const motes = layer === "back" ? HERO_MOTES_BACK : HERO_MOTES_FRONT
  return (
    <div className={`home-hero-motes home-hero-motes--${layer}`} aria-hidden="true">
      {motes.map((m, i) => (
        <span
          key={i}
          className="home-hero-mote"
          style={
            {
              "--x": `${m.x}%`,
              "--size": `${m.size}px`,
              "--dur": `${m.dur}s`,
              "--delay": `${m.delay}s`,
              "--drift": `${m.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
// Gold rule: line · gem · line (same ornament as the loading screen)
function HeroRule() {
  return (
    <div className="home-hero-rule" aria-hidden="true">
      <span className="home-hero-rule__line" />
      <svg className="home-hero-rule__gem" viewBox="0 0 28 12">
        <path d="M14 1 L20 6 L14 11 L8 6 Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <path d="M14 4 L16.5 6 L14 8 L11.5 6 Z" fill="currentColor" />
        <circle cx="3" cy="6" r="1.2" fill="currentColor" />
        <circle cx="25" cy="6" r="1.2" fill="currentColor" />
      </svg>
      <span className="home-hero-rule__line" />
    </div>
  )
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function useCeremonyCountdown() {
  const siteConfig = useSiteConfig()

  const targetTimestamp = useMemo(() => {
    const parsedDate = parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date)
    const monthMap: Record<string, string> = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    }
    const monthKey =
      parsedDate.month.charAt(0) + parsedDate.month.slice(1).toLowerCase()
    const monthNum = monthMap[monthKey] ?? "11"
    const timeRaw = siteConfig.ceremony.time ?? siteConfig.wedding.time
    const timeMatch = timeRaw.match(/(\d+):(\d+)\s*(AM|PM)/i)

    let hour = 9
    let minutes = 0
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10)
      minutes = parseInt(timeMatch[2], 10)
      const ampm = timeMatch[3].toUpperCase()
      if (ampm === "PM" && hour !== 12) hour += 12
      if (ampm === "AM" && hour === 12) hour = 0
    }

    return new Date(
      Date.UTC(
        parseInt(parsedDate.year, 10),
        parseInt(monthNum, 10) - 1,
        parseInt(parsedDate.day, 10),
        hour - 8,
        minutes,
        0,
      ),
    ).getTime()
  }, [
    siteConfig.ceremony.date,
    siteConfig.ceremony.time,
    siteConfig.wedding.date,
    siteConfig.wedding.time,
  ])

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const tick = () => {
      const difference = targetTimestamp - Date.now()
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [targetTimestamp])

  return timeLeft
}

function CountdownUnit({
  value,
  label,
  pad = false,
}: {
  value: number
  label: string
  pad?: boolean
}) {
  const display = pad ? pad2(value) : String(value)

  return (
    <div className="flex min-w-[3rem] flex-1 flex-col items-center sm:min-w-[3.5rem]">
      <span
        className={`${cinzel.className} home-hero-countdown-value text-[clamp(1.2rem,5.4vw,1.75rem)] font-semibold leading-none tabular-nums tracking-[0.04em]`}
      >
        {display}
      </span>
      <span
        className={`${cinzel.className} home-hero-countdown-label mt-1.5 text-[0.48rem] font-medium uppercase tracking-[0.16em] sm:mt-2 sm:text-[0.54rem]`}
      >
        {label}
      </span>
    </div>
  )
}

function HeroCountdown({
  heading,
  labels,
}: {
  heading: string
  labels: { days: string; hours: string; minutes: string; seconds: string }
}) {
  const timeLeft = useCeremonyCountdown()
  const colonClass = `${cinzel.className} home-hero-countdown-value shrink-0 self-start px-0.5 text-[clamp(1.2rem,5.4vw,1.75rem)] font-semibold leading-none tabular-nums sm:px-1`

  return (
    <div className="relative z-10 w-full px-4 py-4 sm:px-6 sm:py-5">
      <p
        className={`${cinzel.className} home-hero-countdown-heading text-center text-[0.58rem] font-semibold uppercase tracking-[0.22em] sm:text-[0.64rem] sm:tracking-[0.26em]`}
      >
        {heading}
      </p>
      <div
        className="mx-auto mt-2 flex max-w-md items-start justify-center sm:mt-2.5 sm:max-w-lg"
        aria-live="polite"
        aria-label={`${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`}
      >
        <CountdownUnit value={timeLeft.days} label={labels.days} />
        <span className={colonClass} aria-hidden="true">
          :
        </span>
        <CountdownUnit value={timeLeft.hours} label={labels.hours} pad />
        <span className={colonClass} aria-hidden="true">
          :
        </span>
        <CountdownUnit value={timeLeft.minutes} label={labels.minutes} pad />
        <span className={colonClass} aria-hidden="true">
          :
        </span>
        <CountdownUnit value={timeLeft.seconds} label={labels.seconds} pad />
      </div>
    </div>
  )
}

export function Hero() {
  const siteConfig = useSiteConfig()
  const loading = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen
  const isPlain = loading.display === "plain"
  const plainTheme =
    loading.plainTheme ?? defaultSiteConfig.loadingScreen.plainTheme
  const cornerDecos =
    loading.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos
  const backgroundPhotos = loading.backgroundPhotos ?? []
  const hero = siteConfig.hero ?? defaultSiteConfig.hero
  const fill = (text: string) => fillCelebrant(text, siteConfig)
  // Same edge lettering as the loading screen and envelope
  const gala = loading.gala ?? defaultSiteConfig.loadingScreen.gala
  const ghostText = (gala.ghostText ?? []).map((t) => fill(t)).filter(Boolean).join("  ·  ")
  const reduceMotion = useHydratedReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 40)
    return () => window.clearTimeout(id)
  }, [])

  const parsedDate = useMemo(
    () => parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date),
    [siteConfig.ceremony.date, siteConfig.wedding.date],
  )

  const weddingDate = new Date(`${parsedDate.month} ${parsedDate.day}, ${parsedDate.year}`)
  const numericDate = Number.isNaN(weddingDate.getTime())
    ? `${parsedDate.month} ${parsedDate.day}, ${parsedDate.year}`
    : `${pad2(weddingDate.getMonth() + 1)}.${pad2(weddingDate.getDate())}.${parsedDate.year}`

  const fadeUp = (delay: number) => {
    if (reduceMotion) {
      return { initial: false as const, animate: { opacity: 1, y: 0 } }
    }
    return {
      initial: { opacity: 0, y: 18 },
      animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
      transition: { duration: 0.9, delay, ease: entryEase },
    }
  }

  return (
    <section
      id="home"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} home-hero relative -mt-12 flex min-h-[100dvh] w-full flex-col overflow-hidden sm:-mt-14 md:-mt-16${isPlain ? " home-hero--plain" : " home-hero--photos"}`}
    >
      {isPlain ? (
        <>
          <PlainAtmosphere baseColor={plainTheme.background} />
          <PlainBubbles />
          <div className="home-hero-plain-corners" aria-hidden="true">
            {(
              [
                { src: cornerDecos.topLeft, className: "left-0 top-0" },
                { src: cornerDecos.topRight, className: "right-0 top-0" },
                { src: cornerDecos.bottomLeft, className: "left-0 bottom-0" },
                { src: cornerDecos.bottomRight, className: "right-0 bottom-0" },
              ] as const
            ).map(({ src, className }) => (
              <img
                key={src}
                src={src}
                alt=""
                className={`home-hero-plain-corner-img absolute ${className}`}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div
            className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--section"
            aria-hidden="true"
          >
            <InvitePhotoBackdrop
              className="invite-photo-backdrop--section"
              photos={backgroundPhotos}
            />
          </div>
          <div className="home-hero-photo-scrim pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
        </>
      )}

      {/* Ghost lettering drifting down the left edge and up the right */}
      <GhostMarquee
        text={ghostText}
        className="home-hero-ghost"
        fontClassName={theSeasons.className}
        still={!!reduceMotion}
      />

      {!reduceMotion && <HeroMotes layer="back" />}

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 pb-[clamp(2.5rem,9dvh,5rem)] pt-[clamp(4.25rem,12vw,7rem)] text-center sm:px-8">
        <motion.h1 className="relative mx-auto w-full max-w-full text-center" {...fadeUp(0.08)}>
          {hero.kicker && (
            <span
              aria-hidden
              className={`${cinzel.className} home-hero-eyebrow home-hero-kicker relative block font-semibold uppercase`}
            >
              {fill(hero.kicker)}
            </span>
          )}
          <span
            aria-hidden
            className="home-hero-title-glow pointer-events-none absolute left-1/2 top-[48%] h-[min(18rem,58vw)] w-[min(36rem,96%)] -translate-x-1/2 -translate-y-1/2 rounded-full"
          />
          <span className="sr-only">{fill(hero.srTitle)}</span>
          {/* Nickname in large gold script — padded so the swashes never clip */}
          <span aria-hidden className={`${aboveTheBeyond.className} home-hero-name relative block`}>
            {fill(hero.titleMain)}
          </span>
          {hero.eyebrow && (
            <span aria-hidden className={`${cinzel.className} home-hero-fullname relative`}>
              {fill(hero.eyebrow)}
            </span>
          )}
        </motion.h1>

        <motion.div className="w-full" {...fadeUp(0.18)}>
          <HeroRule />
        </motion.div>

        {hero.titleScript && (
          <motion.p
            className={`${aboveTheBeyond.className} home-hero-title-script home-hero-turns`}
            {...fadeUp(0.24)}
          >
            {withRomanNumerals(fill(hero.titleScript), theSeasons.className)}
          </motion.p>
        )}

        <motion.p
          className={`${theSeasons.className} home-hero-date text-[clamp(1.85rem,8.5vw,3.4rem)] font-normal leading-none tracking-[0.08em]`}
          {...fadeUp(0.3)}
        >
          {numericDate}
        </motion.p>

      </div>

      <motion.div className="home-hero-countdown-bar relative z-10 mt-auto w-full" {...fadeUp(0.42)}>
        <HeroCountdown heading={fill(hero.countdownHeading)} labels={hero.countdownLabels} />
      </motion.div>

      {!reduceMotion && <HeroMotes layer="front" />}
    </section>
  )
}