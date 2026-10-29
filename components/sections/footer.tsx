"use client"

import { celebrantName, fillCelebrant } from "@/lib/celebrant"
import { useState, useEffect, useMemo, type ReactNode } from "react"
import { motion, type Variants } from "motion/react"
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion"
import localFont from "next/font/local"
import {
  Instagram,
  Facebook,
  Youtube,
  CalendarHeart,
  Heart,
  Mail,
  MessageCircle,
  Church,
  GlassWater,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { RisingMotes } from "@/components/rising-motes"
import "@/components/loader/loading-screen.css"
import "@/components/sections/love-story-red.css"
import { sectionType } from "@/lib/section-typography"
import { Lora } from "next/font/google"
import { cinzel } from "@/lib/fonts"


// Upright, screen-friendly serif for card text (same as the My Story paragraphs)
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
})

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

// Red velvet vibe (same as the sections above): white + gold text on the red circle
// pattern; the cards are ivory paper with wine headings, gold labels and crimson → wine
// buttons. Circle colors + blur: components/sections/love-story-red.css (.red-velvet-root); gold dust rises behind the content
// TEAL keeps its template name but is now the wine ink used on the ivory cards.
const TEAL = "var(--color-motif-deep)"
const BUTTON = "linear-gradient(180deg, var(--color-motif-accent) 0%, var(--color-motif-deep) 100%)"
const BUTTON_HOVER =
  "linear-gradient(180deg, color-mix(in srgb, var(--color-motif-accent) 88%, black) 0%, color-mix(in srgb, var(--color-motif-deep) 85%, black) 100%)"
const BUTTON_EDGE = "color-mix(in srgb, var(--color-welcome-gold) 60%, transparent)"
const BUTTON_SHADOW = "0 10px 22px -12px color-mix(in srgb, var(--color-coastal-deep) 65%, transparent)"
const IVORY = "var(--color-motif-soft)"
const GOLD = "var(--color-welcome-gold)"
const GOLD_INK = "color-mix(in srgb, var(--color-welcome-gold) 78%, var(--color-motif-deep))"
const HAIRLINE = "color-mix(in srgb, var(--color-welcome-gold) 45%, transparent)"
const CHAMPAGNE = "color-mix(in srgb, var(--color-motif-blush) 22%, var(--color-motif-soft))"

const palette = {
  body: "color-mix(in srgb, var(--color-welcome-text) 85%, var(--color-motif-deep))",
  soft: "color-mix(in srgb, var(--color-motif-deep) 65%, transparent)",
  heading: TEAL,
  label: GOLD_INK,
  accent: GOLD_INK,
} as const

const sectionBg = "color-mix(in srgb, var(--color-motif-deep) 70%, var(--color-coastal-deep))"

const textLift =
  "0 1px 2px color-mix(in srgb, var(--color-coastal-deep) 60%, transparent), 0 2px 14px color-mix(in srgb, var(--color-coastal-deep) 45%, transparent)"

// Text sitting directly on the red pattern: white, gold for scripts, soft white for fine print
const onBg = { color: "#fff", textShadow: textLift } as const
const onBgGold = { color: GOLD, textShadow: textLift } as const
const onBgSoft = { color: "color-mix(in srgb, white 82%, transparent)", textShadow: textLift } as const

const onBgLineStyle = {
  background: "linear-gradient(to right, transparent, var(--color-welcome-gold), transparent)",
} as const

const dividerLineStyle = {
  background: "linear-gradient(to right, transparent, var(--color-welcome-gold), transparent)",
} as const

const ct = {
  label: sectionType.label,
  body: sectionType.text,
  bodyLg: sectionType.textRelaxed,
  cardTitle: sectionType.subheader,
} as const

const cardStyle = {
  background:
    "radial-gradient(120% 45% at 50% 0%, color-mix(in srgb, white 70%, transparent) 0%, transparent 60%), linear-gradient(180deg, var(--color-motif-soft) 0%, var(--color-motif-cream) 100%)",
  boxShadow:
    "0 30px 60px -28px color-mix(in srgb, var(--color-coastal-deep) 80%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--color-welcome-gold) 40%, transparent)",
} as const

type IconProps = { className?: string }

// Brand marks lucide doesn't ship
function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.36-2.49V9.66a5.73 5.73 0 0 0-.76-.05 5.68 5.68 0 0 0-5.68 5.69A5.68 5.68 0 0 0 9.86 21a5.68 5.68 0 0 0 5.68-5.69V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48Z" />
    </svg>
  )
}

function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.75 3h3.07l-6.71 7.67L22 21h-6.18l-4.84-6.33L5.44 21H2.37l7.18-8.2L2 3h6.34l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.42 4.74H5.6l11.07 14.43Z" />
    </svg>
  )
}

function ThreadsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M16.7 11.13c-.1-.05-.2-.1-.31-.14-.18-3.33-2-5.24-5.05-5.26h-.04c-1.83 0-3.35.78-4.29 2.2l1.68 1.15c.7-1.06 1.8-1.29 2.61-1.29h.03c1 0 1.76.3 2.24.87.35.42.59 1 .7 1.73a12.6 12.6 0 0 0-2.83-.14c-2.85.17-4.68 1.83-4.56 4.13.06 1.17.64 2.17 1.64 2.83.84.55 1.93.82 3.06.76 1.5-.08 2.67-.65 3.48-1.7.62-.79 1.01-1.82 1.18-3.1.71.43 1.24.99 1.53 1.67.5 1.15.53 3.05-1.02 4.6-1.36 1.35-2.99 1.94-5.46 1.96-2.73-.02-4.8-.9-6.15-2.6C3.86 17.24 3.2 14.94 3.17 12c.03-2.94.69-5.24 1.97-6.82 1.35-1.7 3.42-2.58 6.15-2.6 2.75.02 4.85.9 6.25 2.62.69.84 1.2 1.9 1.55 3.13l1.97-.53c-.42-1.53-1.08-2.85-1.98-3.95C17.27 1.66 14.67.54 11.3.51h-.02C7.92.54 5.35 1.66 3.63 3.85 2.1 5.79 1.31 8.5 1.28 11.99v.02c.03 3.49.82 6.2 2.35 8.14 1.72 2.19 4.29 3.31 7.65 3.34h.02c2.98-.02 5.08-.8 6.81-2.53 2.27-2.27 2.2-5.1 1.45-6.84-.53-1.25-1.56-2.27-2.97-2.94Zm-5.15 4.84c-1.25.07-2.55-.49-2.61-1.69-.05-.89.63-1.88 2.68-2 .23-.01.46-.02.69-.02.74 0 1.44.07 2.07.21-.24 2.95-1.62 3.43-2.83 3.5Z" />
    </svg>
  )
}

const SOCIAL_ICONS = {
  facebook: { Icon: Facebook, label: "Facebook" },
  instagram: { Icon: Instagram, label: "Instagram" },
  tiktok: { Icon: TikTokIcon, label: "TikTok" },
  youtube: { Icon: Youtube, label: "YouTube" },
  twitter: { Icon: XIcon, label: "X" },
  threads: { Icon: ThreadsIcon, label: "Threads" },
  messenger: { Icon: MessageCircle, label: "Messenger" },
  email: { Icon: Mail, label: "Email" },
} as const

const ease = [0.22, 1, 0.36, 1] as const

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

// The Seasons has no clean glyphs for "&" and digits — show those in Cinzel
function SpecialCharFont({ text }: { text: string }) {
  return (
    <>
      {text.split(/([^\p{L}\s]+)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={`${cinzel.className} tracking-normal`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function FooterCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative w-full min-w-0 overflow-hidden rounded-[1.5rem] p-5 sm:p-6 ${className}`} style={cardStyle}>
      <div className="relative z-[1] min-w-0">{children}</div>
    </div>
  )
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p className={`${cinzel.className} ${ct.label} font-semibold uppercase tracking-[0.18em]`} style={{ color: palette.label }}>
      {children}
    </p>
  )
}

export function Footer() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.footer
  const reduceMotion = useHydratedReducedMotion()
  const year = new Date().getFullYear()
  const ceremonyDate = siteConfig.ceremony.date

  const celebrant = celebrantName(siteConfig)
  const monogram = siteConfig.celebrant?.monogram || siteConfig.couple.monogram
  const fill = (text: string) =>
    fillCelebrant(text, siteConfig).split("{year}").join(String(year))

  const quotes = content.quotes.length > 0 ? content.quotes : [""]
  const longestQuote = useMemo(
    () => quotes.reduce((longest, quote) => (quote.length > longest.length ? quote : longest), ""),
    [quotes],
  )
  const socials = content.socials.filter((s) => s.show && s.href)

  // Typewriter quote rotation
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (reduceMotion) {
      setDisplayedText(quotes[currentQuoteIndex] ?? "")
      const t = setTimeout(() => setCurrentQuoteIndex((p) => (p + 1) % quotes.length), 6000)
      return () => clearTimeout(t)
    }
    if (isPaused) {
      const pauseTimeout = setTimeout(() => setIsPaused(false), 3000)
      return () => clearTimeout(pauseTimeout)
    }
    if (isDeleting) {
      if (displayedText.length > 0) {
        const deleteTimeout = setTimeout(() => setDisplayedText(displayedText.slice(0, -1)), 30)
        return () => clearTimeout(deleteTimeout)
      }
      setIsDeleting(false)
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length)
      return
    }
    const currentQuote = quotes[currentQuoteIndex] ?? ""
    if (displayedText.length < currentQuote.length) {
      const typeTimeout = setTimeout(() => setDisplayedText(currentQuote.slice(0, displayedText.length + 1)), 50)
      return () => clearTimeout(typeTimeout)
    }
    setIsPaused(true)
    setIsDeleting(true)
  }, [displayedText, isDeleting, isPaused, currentQuoteIndex, quotes, reduceMotion])

  const scrollTo = (href: string) => (event: React.MouseEvent) => {
    if (!href.startsWith("#")) return
    const el = document.getElementById(href.slice(1))
    if (!el) return
    event.preventDefault()
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Same layout as the Event Details section: one combined row, or separate ceremony / reception rows
  const { ceremony, reception } = siteConfig
  const venues = siteConfig.eventDetails.venues
  const isCombined = venues.layout === "combined"
  type SummaryRow = {
    key: string
    Icon: typeof Church
    label: string
    place: string
    times: { label: string; time: string; showLabel: boolean }[]
  }
  const summaryRows: SummaryRow[] = isCombined
    ? [
        {
          key: "combined",
          Icon: Church,
          label: venues.combined.badge,
          place: ceremony.location,
          times: [
            { label: venues.combined.ceremonyLabel, time: ceremony.time, showLabel: true },
            ...(venues.combined.showReceptionTime
              ? [{ label: venues.combined.receptionLabel, time: reception.time, showLabel: true }]
              : []),
          ].filter((t) => t.time),
        },
      ]
    : [
        ...(venues.ceremony.show
          ? [{
              key: "ceremony",
              Icon: Church,
              label: content.summary.ceremonyLabel,
              place: ceremony.location,
              times: ceremony.time ? [{ label: content.summary.ceremonyLabel, time: ceremony.time, showLabel: false }] : [],
            }]
          : []),
        ...(venues.reception.show
          ? [{
              key: "reception",
              Icon: GlassWater,
              label: content.summary.receptionLabel,
              place: reception.location,
              times: reception.time ? [{ label: content.summary.receptionLabel, time: reception.time, showLabel: false }] : [],
            }]
          : []),
      ].filter((row) => row.place || row.times.length > 0)

  const initial = reduceMotion ? false : "hidden"

  return (
    <div
      className={`red-velvet-root ${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
      style={{ background: sectionBg }}
    >
      {/* Red circle pattern (colors: components/sections/love-story-red.css) */}
      <PlainBubbles />
      <RisingMotes count={30} />

      <footer className="relative z-20 pt-14 pb-10 sm:pt-16 sm:pb-12 md:pt-20 md:pb-14">
        {/* Header: monogram + celebrant */}
        <motion.div
          className="relative mx-auto mb-8 flex max-w-xl flex-col items-center px-6 text-center sm:mb-10 md:mb-12"
          variants={stagger}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {content.showMonogram && monogram ? (
            // Monogram in white (same as the navbar + countdown) with a soft drop shadow
            // eslint-disable-next-line @next/next/no-img-element
            <motion.img
              variants={rise}
              src={monogram}
              alt={`${celebrant} monogram`}
              loading="lazy"
              decoding="async"
              className="block h-28 w-28 select-none object-contain sm:h-36 sm:w-36 md:h-44 md:w-44"
              style={{ filter: "brightness(0) invert(1) drop-shadow(0 4px 14px color-mix(in srgb, var(--color-coastal-deep) 55%, transparent))" }}
            />
          ) : null}

          <motion.h2
            variants={rise}
            className={`${theSeasons.className} mt-4 text-4xl uppercase tracking-[0.1em] sm:mt-5 sm:text-5xl md:text-6xl`}
            style={onBg}
          >
            {celebrant}
          </motion.h2>
          {content.nameLine ? (
            <motion.p
              variants={rise}
              className={`${aboveTheBeyond.className} -mt-1 px-2 text-3xl sm:text-4xl`}
              style={onBgGold}
            >
              {content.nameLine}
            </motion.p>
          ) : null}

          {ceremonyDate ? (
            <motion.p
              variants={rise}
              className={`${cinzel.className} mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.28em] sm:mt-5 sm:text-xs`}
              style={onBgGold}
            >
              {ceremonyDate}
            </motion.p>
          ) : null}

          {content.hashtags.length > 0 ? (
            <motion.div variants={rise} className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {content.hashtags.map((tag) => (
                <span
                  key={tag}
                  className={`${lora.className} rounded-full border px-3.5 py-1 text-[0.8rem] font-semibold italic tracking-[0.02em] sm:text-[0.86rem]`}
                  style={{ borderColor: HAIRLINE, color: GOLD, background: "color-mix(in srgb, var(--color-coastal-deep) 35%, transparent)" }}
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          ) : null}

          <motion.span variants={rise} className="mt-5 block h-px w-40 sm:w-56" style={onBgLineStyle} aria-hidden />
        </motion.div>

        <div className="relative z-10 mx-auto flex max-w-6xl min-w-0 flex-col px-4 @container/footer sm:px-6 md:px-8">
          <motion.div
            className="mb-8 grid grid-cols-1 items-start gap-5 sm:mb-10 sm:gap-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-7"
            variants={stagger}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            {/* Note from us */}
            <motion.div className="min-w-0 md:col-span-2 lg:col-span-1" variants={rise}>
              <FooterCard className="h-full">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Label>{content.noteTitle}</Label>
                  <Heart className="h-3.5 w-3.5 shrink-0" style={{ color: palette.label, fill: palette.label }} aria-hidden />
                </div>
                <blockquote className={`${lora.className} relative ${ct.bodyLg} font-medium italic leading-[1.7]`}>
                  {/* Reserve height for the longest quote so the card doesn't jump */}
                  <span className="invisible block select-none" aria-hidden="true">
                    &ldquo;{longestQuote}&rdquo;
                  </span>
                  <span className="absolute inset-0" style={{ color: palette.body }} aria-live="polite">
                    &ldquo;{displayedText}
                    {!reduceMotion && (
                      <span
                        className="ml-1 inline-block h-4 w-0.5 animate-pulse align-middle sm:h-5"
                        style={{ backgroundColor: palette.label }}
                      />
                    )}
                    &rdquo;
                  </span>
                </blockquote>
                {quotes.length > 1 && (
                  <div className="mt-4 flex items-center gap-1.5">
                    {quotes.map((_, i) => (
                      <span
                        key={i}
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: i === currentQuoteIndex ? "1.25rem" : "0.375rem",
                          background: i === currentQuoteIndex ? palette.label : "color-mix(in srgb, var(--color-welcome-gold) 30%, transparent)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </FooterCard>
            </motion.div>

            {/* Date + RSVP */}
            <motion.div className="min-w-0 space-y-5" variants={rise}>
              <FooterCard>
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ background: BUTTON, boxShadow: `0 0 0 3px ${IVORY}, 0 0 0 4px ${HAIRLINE}` }}
                    aria-hidden
                  >
                    <CalendarHeart className="h-4.5 w-4.5" style={{ color: GOLD }} />
                  </span>
                  <div className="min-w-0">
                    <Label>{content.dateLabel}</Label>
                    <p className={`${theSeasons.className} mt-1 text-lg tracking-[0.06em] sm:text-xl`} style={{ color: palette.heading }}>
                      <SpecialCharFont text={ceremonyDate} />
                    </p>
                  </div>
                </div>

                {/* Day at a glance — mirrors the Event Details cards (eventDetails.venues.layout) */}
                {content.summary.show && summaryRows.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {summaryRows.map(({ key, Icon, label, place, times }) => (
                      <div
                        key={key}
                        className="flex items-start gap-3 rounded-2xl px-3 py-2.5"
                        style={{ background: CHAMPAGNE, boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--color-welcome-gold) 25%, transparent)` }}
                      >
                        <span
                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                          style={{ background: IVORY, boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
                          aria-hidden
                        >
                          <Icon className="h-4 w-4" style={{ color: palette.accent }} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`${cinzel.className} text-[0.66rem] font-semibold uppercase tracking-[0.16em]`} style={{ color: palette.heading }}>
                            {label}
                          </p>
                          {place ? (
                            <p className={`${lora.className} mt-0.5 flex items-start gap-1 text-[0.82rem] font-medium leading-snug`} style={{ color: palette.body }}>
                              <MapPin className="mt-[0.2em] h-3 w-3 shrink-0" style={{ color: palette.soft }} aria-hidden />
                              <span className="min-w-0">{place}</span>
                            </p>
                          ) : null}
                          {times.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {times.map((t) => (
                                <span
                                  key={t.label}
                                  className={`${cinzel.className} inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.06em]`}
                                  style={{ background: IVORY, color: palette.label, boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
                                >
                                  <Clock className="h-3 w-3" aria-hidden />
                                  {t.showLabel ? <span className="uppercase tracking-[0.12em]">{t.label}</span> : null}
                                  {t.time}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {content.rsvp.show && (
                  <>
                    <span className="my-4 block h-px w-full" style={dividerLineStyle} aria-hidden />
                    {/* No deadline yet → plain "RSVP" heading + a gentle ask instead of an empty date */}
                    <Label>{siteConfig.details.rsvp.deadline ? content.rsvp.title : "RSVP"}</Label>
                    {siteConfig.details.rsvp.deadline ? (
                      <p className={`${lora.className} mt-1 ${ct.body} font-medium`} style={{ color: palette.body }}>
                        {content.rsvp.label}{" "}
                        <span className="font-semibold" style={{ color: palette.heading }}>
                          {siteConfig.details.rsvp.deadline}
                        </span>
                      </p>
                    ) : (
                      <p className={`${lora.className} mt-1 ${ct.body} italic`} style={{ color: palette.soft }}>
                        Kindly let me know if you can join the celebration.
                      </p>
                    )}
                    {content.rsvp.note && siteConfig.details.rsvp.deadline ? (
                      <p className={`${lora.className} mt-1 ${ct.body} italic`} style={{ color: palette.soft }}>
                        {content.rsvp.note}
                      </p>
                    ) : null}
                    <a
                      href={content.rsvp.href}
                      onClick={scrollTo(content.rsvp.href)}
                      className={`${cinzel.className} ${ct.label} mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full border px-5 py-2.5 font-semibold uppercase tracking-[0.14em] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]`}
                      style={{
                        background: BUTTON,
                        borderColor: BUTTON_EDGE,
                        color: "#fff",
                        boxShadow: BUTTON_SHADOW,
                      }}
                    >
                      {content.rsvp.button}
                    </a>
                  </>
                )}
              </FooterCard>
            </motion.div>

            {/* Social + quick links */}
            <motion.div className="min-w-0" variants={rise}>
              <FooterCard>
                {socials.length > 0 && (
                  <>
                    <Label>{content.followTitle}</Label>
                    {content.followNote ? (
                      <p className={`${lora.className} mt-1 ${ct.body} italic`} style={{ color: palette.soft }}>
                        {content.followNote}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {socials.map(({ platform, href }) => {
                        const icon = SOCIAL_ICONS[platform]
                        if (!icon) return null
                        const { Icon, label } = icon
                        const external = !href.startsWith("mailto:")
                        return (
                          <a
                            key={platform}
                            href={href}
                            target={external ? "_blank" : undefined}
                            rel={external ? "noopener noreferrer" : undefined}
                            title={label}
                            aria-label={label}
                            className="group inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5"
                            style={{ background: BUTTON, color: "#fff", boxShadow: `${BUTTON_SHADOW}, inset 0 0 0 1px ${BUTTON_EDGE}` }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = BUTTON_HOVER
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = BUTTON
                            }}
                          >
                            <Icon className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem]" />
                          </a>
                        )
                      })}
                    </div>
                    <span className="my-4 block h-px w-full" style={dividerLineStyle} aria-hidden />
                  </>
                )}

                <Label>{content.quickLinksTitle}</Label>
                <nav className="mt-3 grid grid-cols-2 gap-2" aria-label={content.quickLinksTitle}>
                  {content.links.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={scrollTo(item.href)}
                      className="group flex min-w-0 items-center justify-between gap-1.5 rounded-full py-2 pl-3.5 pr-2 transition-all duration-300 hover:-translate-y-0.5"
                      style={{ background: BUTTON, boxShadow: `${BUTTON_SHADOW}, inset 0 0 0 1px ${BUTTON_EDGE}` }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = BUTTON_HOVER
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = BUTTON
                      }}
                    >
                      <span
                        className={`${cinzel.className} min-w-0 truncate text-[0.64rem] font-semibold uppercase tracking-[0.12em] sm:text-[0.68rem]`}
                        style={{ color: IVORY }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
                        style={{ background: "color-mix(in srgb, var(--color-motif-soft) 22%, transparent)" }}
                        aria-hidden
                      >
                        <ChevronRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" style={{ color: IVORY }} />
                      </span>
                    </a>
                  ))}
                </nav>
              </FooterCard>
            </motion.div>
          </motion.div>

          {/* Bottom bar */}
          <div className="pt-6 sm:pt-8">
            <span className="mb-6 block h-px w-full sm:mb-8" style={onBgLineStyle} aria-hidden />
            <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:gap-6 md:text-left">
              <div className="min-w-0">
                <p className={`${lora.className} ${ct.body} font-medium`} style={onBg}>
                  {fill(content.copyright)}
                </p>
                {content.tagline ? (
                  <p className={`${lora.className} mt-1 ${ct.body} italic`} style={onBgSoft}>
                    {fill(content.tagline)}
                  </p>
                ) : null}
              </div>
              {content.credit.show && (
                <div className="min-w-0 space-y-1 md:text-right">
                  <p className={`${lora.className} ${ct.body}`} style={onBgSoft}>
                    {content.credit.developedBy}{" "}
                    <a
                      href={content.credit.developerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline decoration-[var(--color-welcome-gold)] underline-offset-2 hover:opacity-80"
                      style={{ color: GOLD }}
                    >
                      {content.credit.developerName}
                    </a>
                  </p>
                  <p className={`${lora.className} ${ct.body}`} style={onBgSoft}>
                    {content.credit.promoText}{" "}
                    <a
                      href={content.credit.promoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline decoration-[var(--color-welcome-gold)] underline-offset-2 hover:opacity-80"
                      style={{ color: GOLD }}
                    >
                      {content.credit.promoName}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
