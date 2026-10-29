"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Users, Armchair, Crown } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import localFont from "next/font/local"
import { cinzel } from "@/lib/fonts"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import { fetchInvitationList } from "@/lib/invitation-data"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { RisingMotes } from "@/components/rising-motes"
import { GhostMarquee } from "@/components/loader/GhostMarquee"
import { ghostTextFor } from "@/lib/ghost-text"
import "@/components/loader/loading-screen.css"
import "@/components/sections/love-story-red.css"


// The Seasons (demo) has no clean number glyphs — set any digits in Cinzel
function DigitsInCinzel({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\d+)/).map((part, i) =>
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

// Red velvet vibe (same as My Story, Gallery, Event Details, Entourage): white + gold
// text on the red circle pattern; the stats and guest cards are ivory paper with wine
// names, gold labels and crimson → wine badges.
// Circle colors + blur: components/sections/love-story-red.css (.red-velvet-root); gold dust rises behind the content
// TEAL keeps its template name but is now the wine ink used on the ivory cards.
const TEAL = "var(--color-motif-deep)"
const IVORY = "var(--color-motif-soft)"
const PAPER = "var(--color-motif-soft)"
const GOLD = "var(--color-welcome-gold)"
const GOLD_INK = "color-mix(in srgb, var(--color-welcome-gold) 78%, var(--color-motif-deep))"
const NAVY = TEAL
const BODY = "color-mix(in srgb, var(--color-welcome-text) 85%, var(--color-motif-deep))"
const ACCENT = GOLD_INK
const HAIRLINE = "color-mix(in srgb, var(--color-welcome-gold) 45%, transparent)"
const TEAL_SOFT = "color-mix(in srgb, var(--color-motif-deep) 60%, transparent)"
const DEEP_GRADIENT = "linear-gradient(180deg, var(--color-motif-accent) 0%, var(--color-motif-deep) 100%)"
const SAGE_GRADIENT = "linear-gradient(180deg, var(--color-motif-deep) 0%, color-mix(in srgb, var(--color-motif-deep) 70%, var(--color-coastal-deep)) 100%)"

const sectionBg = "color-mix(in srgb, var(--color-motif-deep) 70%, var(--color-coastal-deep))"

const textLift =
  "0 1px 2px color-mix(in srgb, var(--color-coastal-deep) 60%, transparent), 0 2px 14px color-mix(in srgb, var(--color-coastal-deep) 45%, transparent)"

// Text sitting directly on the red pattern: white, or gold for scripts / eyebrows
const onBg = { color: "#fff", textShadow: textLift } as const
const onBgGold = { color: GOLD, textShadow: textLift } as const

const palette = {
  body: BODY,
  heading: NAVY,
  label: ACCENT,
  accent: ACCENT,
} as const

const cardStyle = {
  background:
    "radial-gradient(120% 50% at 50% 0%, color-mix(in srgb, white 70%, transparent) 0%, transparent 60%), linear-gradient(180deg, var(--color-motif-soft) 0%, var(--color-motif-cream) 100%)",
  boxShadow:
    "0 24px 50px -24px color-mix(in srgb, var(--color-coastal-deep) 75%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--color-welcome-gold) 35%, transparent)",
} as const

const refreshButtonStyle = {
  borderColor: "color-mix(in srgb, var(--color-welcome-gold) 65%, transparent)",
  background: DEEP_GRADIENT,
  boxShadow: "0 4px 14px -4px color-mix(in srgb, var(--color-coastal-deep) 55%, transparent)",
} as const

const chipPrimaryStyle = {
  color: NAVY,
  borderColor: "color-mix(in srgb, var(--color-welcome-gold) 55%, transparent)",
  backgroundColor: "color-mix(in srgb, var(--color-motif-blush) 35%, var(--color-motif-soft))",
} as const

const chipSecondaryStyle = {
  color: NAVY,
  borderColor: HAIRLINE,
  backgroundColor: IVORY,
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.97, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease } },
  exit: { opacity: 0, y: -14, scale: 0.98, filter: "blur(3px)", transition: { duration: 0.35, ease } },
}

// Gold hairlines + diamond; onBg = sits directly on the red pattern (bright gold)
function DiamondDivider({ onBg: onPattern = false }: { onBg?: boolean }) {
  const line = onPattern ? GOLD : GOLD_INK
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to right, transparent, ${line})` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: line }} />
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to left, transparent, ${line})` }} />
    </div>
  )
}

const ct = {
  label: sectionType.label,
  body: sectionType.text,
  bodyLg: sectionType.subheader,
  stat: "text-2xl sm:text-3xl md:text-4xl",
  guestName: sectionType.subheader,
  meta: sectionType.label,
} as const

function BookOfGuestsTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em] pb-1 sm:pb-1.5`}
        style={{
          fontSize: "var(--title-size)",
          ...onBg,
        }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9] mt-2 sm:mt-2.5 md:mt-3`}
        style={{
          fontSize: "var(--script-size)",
          ...onBgGold,
        }}
      >
        {subtitle}
      </span>
      <span className="sr-only">{subtitle}</span>
    </h2>
  )
}

interface Guest {
  id: string | number
  name: string
  role: string
  email?: string
  contact?: string
  message?: string
  allowedGuests: number
  companions: { name: string; relationship: string }[]
  tableNumber: string
  isVip: boolean
  status: 'pending' | 'confirmed' | 'declined' | 'request'
  addedBy?: string
  createdAt?: string
  updatedAt?: string
}

export function BookOfGuests() {
  const siteConfig = useSiteConfig()
  const copy = siteConfig.bookOfGuests
  const CARDS_PER_VIEW = Math.max(1, copy.cardsPerView || 4)
  const reduceMotion = useReducedMotion()
  const [totalGuests, setTotalGuests] = useState(0)
  const [rsvpCount, setRsvpCount] = useState(0)
  const [confirmedGuests, setConfirmedGuests] = useState<Guest[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [showIncrease, setShowIncrease] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  // Cards whose full companion list is open
  const [expandedCompanions, setExpandedCompanions] = useState<Set<string>>(new Set())
  const COMPANION_PREVIEW = 4

  const toggleCompanions = (id: string) =>
    setExpandedCompanions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    const words = name.trim().split(' ')
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatLastUpdate = (date: Date): string =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

  const fetchGuests = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true)
    
    try {
      const data = await fetchInvitationList<Guest>("/api/guests")

      // Filter only confirmed/attending guests
      const attendingGuests = data.filter((guest) => guest.status === "confirmed")
      
      // Sort guests: VIPs first, then by updatedAt (most recent first)
      const sortedGuests = attendingGuests.sort((a, b) => {
        // VIPs come first
        if (a.isVip && !b.isVip) return -1
        if (!a.isVip && b.isVip) return 1
        
        // Then sort by most recent update
        const dateA = new Date(a.updatedAt || 0).getTime()
        const dateB = new Date(b.updatedAt || 0).getTime()
        return dateB - dateA
      })
      
      // Calculate total guests by summing allowedGuests for each confirmed guest
      const totalGuestCount = attendingGuests.reduce((sum, guest) => {
        return sum + (guest.allowedGuests || 1)
      }, 0)
      
      // Show increase animation if count went up
      if (totalGuestCount > totalGuests && totalGuests > 0) {
        setShowIncrease(true)
        setTimeout(() => setShowIncrease(false), 2000)
      }
      
      setTotalGuests(totalGuestCount)
      setRsvpCount(attendingGuests.length)
      setConfirmedGuests(sortedGuests)
      setLastUpdate(new Date())
    } catch (error: any) {
      console.error("Failed to load guests:", error)
    } finally {
      if (showLoading) {
        setTimeout(() => setIsRefreshing(false), 500)
      }
    }
  }

  // Get visible guests (max 4 cards) for carousel
  const getVisibleGuests = () => {
    if (confirmedGuests.length <= CARDS_PER_VIEW) return confirmedGuests
    const visible: Guest[] = []
    for (let i = 0; i < CARDS_PER_VIEW; i++) {
      const index = (currentIndex + i) % confirmedGuests.length
      visible.push(confirmedGuests[index])
    }
    return visible
  }

  useEffect(() => {
    // Initial fetch
    fetchGuests()

    // Set up automatic polling every 30 seconds for real-time updates
    const pollInterval = setInterval(() => {
      fetchGuests()
    }, 30000) // 30 seconds

    // Set up event listener for RSVP updates
    const handleRsvpUpdate = () => {
      // Add a small delay to allow Google Sheets to update
      setTimeout(() => {
        fetchGuests(true)
      }, 2000)
    }

    window.addEventListener("rsvpUpdated", handleRsvpUpdate)

    return () => {
      clearInterval(pollInterval)
      window.removeEventListener("rsvpUpdated", handleRsvpUpdate)
    }
  }, [totalGuests])

  // Auto-rotate carousel every 5 seconds when there are more guests than fit
  useEffect(() => {
    if (confirmedGuests.length <= CARDS_PER_VIEW) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + CARDS_PER_VIEW
        return next >= confirmedGuests.length ? 0 : next
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [confirmedGuests.length, CARDS_PER_VIEW])

  const initial = reduceMotion ? false : "hidden"

  return (
    <div
      id="guests"
      className={`red-velvet-root ${theSeasons.variable} ${aboveTheBeyond.variable} relative isolate z-10 overflow-hidden pt-12 pb-10 sm:pt-14 sm:pb-12 md:pt-16 md:pb-14 lg:pt-20 lg:pb-16`}
      style={{ background: sectionBg }}
    >
      {/* Red circle pattern (colors: components/sections/love-story-red.css) */}
      <PlainBubbles />
      <RisingMotes count={50} />
      {/* Ghost lettering down the left edge and up the right (same as the loading screen) */}
      <GhostMarquee
        text={ghostTextFor(siteConfig)}
        className="section-ghost"
        fontClassName={theSeasons.className}
        still={!!reduceMotion}
        repeat={4}
      />

      {/* Corner decorations (from site.ts) */}

      {/* Section Header */}
      <motion.div
        className="relative z-20 mx-auto mb-8 max-w-5xl px-6 text-center @container/book-of-guests sm:mb-10 sm:px-10 md:px-12"
        variants={revealVariants}
        initial={initial}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <DiamondDivider onBg />
        <div className="mt-4 mb-4 sm:mt-5 sm:mb-5">
          <BookOfGuestsTitle title={copy.title} subtitle={copy.subtitle} />
        </div>
        <p
          className={`font-goudy-italic mx-auto max-w-2xl px-2 ${sectionType.textRelaxed}`}
          style={{ ...onBg, fontWeight: 600 }}
        >
          {copy.description}
        </p>
        <div className="flex items-center justify-center pt-4 sm:pt-5">
          <span
            className="h-px w-16 sm:w-24 md:w-32"
            style={{ background: "linear-gradient(to right, transparent, var(--color-welcome-gold), transparent)" }}
          />
        </div>
      </motion.div>

      <div className="relative z-20 px-5 sm:px-10 md:px-12">
        {/* Stats card */}
        <motion.div
          className="relative mx-auto mb-10 max-w-2xl text-center sm:mb-12 md:mb-14"
          variants={revealVariants}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div
            className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]"
            style={cardStyle}
          >
            {/* Inner frame */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-2.5 rounded-[1.4rem] border sm:inset-3 sm:rounded-[1.85rem]"
              style={{ borderColor: HAIRLINE }}
            />

            <button
              type="button"
              onClick={() => fetchGuests(true)}
              disabled={isRefreshing}
              className="group absolute top-5 right-5 z-30 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-45 disabled:hover:scale-100 sm:top-6 sm:right-6 sm:h-9 sm:w-9"
              style={refreshButtonStyle}
              title={copy.refreshLabel}
              aria-label={copy.refreshLabel}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-500 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"}`}
                style={{ color: IVORY }}
                aria-hidden
              />
            </button>

            <div className="relative z-[1] px-6 py-8 text-center sm:px-10 sm:py-10 md:px-12">
              <div
                className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full sm:mb-4 sm:h-12 sm:w-12"
                style={{
                  background: DEEP_GRADIENT,
                  boxShadow: `0 0 0 4px ${PAPER}, 0 0 0 5px ${HAIRLINE}`,
                }}
                aria-hidden
              >
                <Users className="h-5 w-5" style={{ color: IVORY }} />
              </div>
              <p
                className={`${cinzel.className} ${ct.label} uppercase tracking-[0.22em] font-semibold mb-3 sm:mb-4`}
                style={{ color: palette.label }}
              >
                {copy.statsEyebrow}
              </p>

              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={totalGuests}
                    initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: showIncrease ? 1.12 : 1 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.5, ease }}
                    className={`${cinzel.className} text-4xl font-semibold tabular-nums leading-none tracking-[0.02em] sm:text-5xl md:text-6xl`}
                    style={{ color: palette.heading }}
                  >
                    {totalGuests}
                  </motion.span>
                </AnimatePresence>
                <p
                  className={`${cinzel.className} ${ct.bodyLg} font-semibold uppercase leading-snug tracking-[0.12em] text-left`}
                  style={{ color: palette.heading }}
                >
                  {totalGuests === 1 ? copy.guestSingular : copy.guestPlural}
                  <span
                    className="block text-[0.72em] font-normal normal-case tracking-[0.04em]"
                    style={{ color: palette.label }}
                  >
                    {copy.statsCaption}
                  </span>
                </p>
              </div>

              <div className="mt-5 mb-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
                <span
                  className={`${cinzel.className} ${ct.meta} px-3.5 py-1 rounded-full border font-semibold uppercase tracking-[0.12em]`}
                  style={chipPrimaryStyle}
                >
                  {rsvpCount} {rsvpCount === 1 ? copy.rsvpSingular : copy.rsvpPlural}
                </span>
                <span
                  className={`${cinzel.className} ${ct.meta} px-3.5 py-1 rounded-full border font-semibold uppercase tracking-[0.12em]`}
                  style={chipSecondaryStyle}
                >
                  {confirmedGuests.length} {confirmedGuests.length === 1 ? copy.partySingular : copy.partyPlural}
                </span>
              </div>

              <DiamondDivider />

              <p className={`font-goudy-italic ${ct.body} mx-auto mt-4 max-w-md leading-relaxed sm:mt-5`} style={{ color: palette.body }}>
                {copy.thankYou}
              </p>

              <p
                className={`${cinzel.className} ${ct.meta} mt-3 sm:mt-4 uppercase tracking-[0.14em]`}
                style={{ color: TEAL_SOFT }}
              >
                {copy.updatedLabel} {formatLastUpdate(lastUpdate)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Guest List Display */}
        {confirmedGuests.length > 0 && (
          <div className="relative mx-auto max-w-4xl">
            <motion.div
              className="mb-5 text-center sm:mb-7 md:mb-8"
              variants={revealVariants}
              initial={initial}
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
            >
              <p
                className={`${cinzel.className} ${ct.label} uppercase tracking-[0.22em] font-semibold`}
                style={onBgGold}
              >
                {copy.listEyebrow}
              </p>
              <p className={`font-goudy-italic ${ct.body} mt-1.5`} style={{ ...onBg, fontWeight: 600 }}>
                {copy.listDescription}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 md:gap-4"
                variants={listVariants}
                initial={initial}
                animate="show"
                exit="exit"
              >
                {getVisibleGuests().map((guest, index) => {
                  const hasTable = Boolean(guest.tableNumber && guest.tableNumber.trim() !== "")
                  const companions = (guest.companions || []).filter((c) => c.name && c.name.trim() !== "")
                  return (
                    <motion.article
                      key={`${guest.id}-${index}`}
                      variants={cardVariants}
                      whileHover={reduceMotion ? undefined : { y: -3 }}
                      transition={{ duration: 0.3, ease }}
                      className="group relative overflow-hidden rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5"
                      style={cardStyle}
                    >
                      {/* Hairline inner frame — turns olive on hover */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-1.5 rounded-[0.85rem] border transition-colors duration-300 group-hover:border-[color-mix(in_srgb,var(--color-welcome-gold)_75%,transparent)]"
                        style={{ borderColor: HAIRLINE }}
                      />

                      <div className="relative z-[1] flex items-center gap-2.5 sm:gap-3">
                        {/* Monogram */}
                        <div
                          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-105 sm:h-12 sm:w-12"
                          style={{
                            background: SAGE_GRADIENT,
                            boxShadow: `0 0 0 2px ${IVORY}, 0 0 0 3px ${HAIRLINE}, 0 6px 14px -6px color-mix(in srgb, var(--color-coastal-deep) 45%, transparent)`,
                          }}
                        >
                          <span className={`${theSeasons.className} text-[1rem] tracking-[0.06em] sm:text-[1.08rem]`} style={{ color: IVORY }}>
                            {getInitials(guest.name)}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <h3
                              className={`${theSeasons.className} min-w-0 truncate text-[0.98rem] uppercase leading-tight tracking-[0.07em] sm:text-[1.06rem]`}
                              style={{ color: TEAL }}
                              title={guest.name}
                            >
                              <DigitsInCinzel text={guest.name} />
                            </h3>
                            {guest.isVip && (
                              <span
                                className={`${cinzel.className} inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.44rem] font-semibold uppercase leading-none tracking-[0.12em]`}
                                style={{ background: DEEP_GRADIENT, color: IVORY }}
                              >
                                <Crown className="h-2.5 w-2.5" aria-hidden />
                                {copy.vipLabel}
                              </span>
                            )}
                          </div>

                          {/* Meta line: guests · table · role (each item stays whole when wrapping) */}
                          <div
                            className={`${cinzel.className} mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.48rem] font-semibold uppercase leading-none tracking-[0.12em] sm:text-[0.52rem]`}
                            style={{ color: palette.label }}
                          >
                            <span className="inline-flex items-center gap-1 whitespace-nowrap">
                              <Users className="h-2.5 w-2.5" aria-hidden />
                              {guest.allowedGuests} {guest.allowedGuests === 1 ? copy.guestSingular : copy.guestPlural}
                            </span>
                            <span aria-hidden className="h-[3px] w-[3px] shrink-0 rotate-45" style={{ background: TEAL_SOFT }} />
                            <span className="inline-flex min-w-0 items-center gap-1 whitespace-nowrap">
                              <Armchair className="h-2.5 w-2.5 shrink-0" aria-hidden />
                              {hasTable ? (
                                <span className="truncate" style={{ color: palette.heading }}>{guest.tableNumber}</span>
                              ) : (
                                <span style={{ color: TEAL_SOFT }}>{copy.noTable}</span>
                              )}
                            </span>
                            {guest.role ? (
                              <>
                                <span aria-hidden className="h-[3px] w-[3px] shrink-0 rotate-45" style={{ background: TEAL_SOFT }} />
                                <span className="max-w-full truncate">{guest.role}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {companions.length > 0 && (() => {
                        const cardId = String(guest.id)
                        const expanded = expandedCompanions.has(cardId)
                        const shown = expanded ? companions : companions.slice(0, COMPANION_PREVIEW)
                        const hidden = companions.length - shown.length
                        return (
                          <div
                            className="relative z-[1] mt-2.5 rounded-xl px-2.5 pb-2 pt-1.5"
                            style={{ background: "color-mix(in srgb, var(--color-motif-blush) 22%, transparent)" }}
                          >
                            {/* Label row */}
                            <div className="mb-1.5 flex items-center gap-1.5">
                              <span
                                className={`${cinzel.className} text-[0.48rem] font-semibold uppercase tracking-[0.16em] sm:text-[0.52rem]`}
                                style={{ color: palette.label }}
                              >
                                {copy.companionsLabel}
                              </span>
                              <span className="h-px flex-1" style={{ background: "linear-gradient(to right, var(--color-welcome-gold), transparent)" }} aria-hidden />
                              <span
                                className={`${cinzel.className} rounded-full px-1.5 py-[1px] text-[0.46rem] font-semibold leading-none tracking-[0.06em]`}
                                style={{ background: IVORY, color: palette.label, boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
                              >
                                +{companions.length}
                              </span>
                            </div>

                            {/* Companion pills: mini monogram · name · relationship */}
                            <ul className="flex flex-wrap gap-1">
                              {shown.map((companion, idx) => (
                                <li
                                  key={idx}
                                  className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full py-[2px] pl-[2px] pr-2"
                                  style={{ background: IVORY, boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
                                >
                                  <span
                                    className={`${theSeasons.className} flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.45rem] leading-none`}
                                    style={{ background: SAGE_GRADIENT, color: IVORY }}
                                    aria-hidden
                                  >
                                    {getInitials(companion.name).slice(0, 1)}
                                  </span>
                                  <span className="font-goudy-italic min-w-0 truncate text-[0.66rem] leading-none sm:text-[0.7rem]" style={{ color: palette.heading }}>
                                    {companion.name}
                                  </span>
                                  {companion.relationship && companion.relationship.trim() !== "" ? (
                                    <span
                                      className={`${cinzel.className} shrink-0 text-[0.44rem] font-semibold uppercase leading-none tracking-[0.1em] sm:text-[0.48rem]`}
                                      style={{ color: TEAL_SOFT }}
                                    >
                                      · {companion.relationship}
                                    </span>
                                  ) : null}
                                </li>
                              ))}
                              {(hidden > 0 || expanded) && companions.length > COMPANION_PREVIEW && (
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => toggleCompanions(cardId)}
                                    className={`${cinzel.className} inline-flex h-[1.3rem] items-center rounded-full px-2 text-[0.48rem] font-semibold uppercase leading-none tracking-[0.12em] transition-all hover:brightness-110`}
                                    style={{ background: DEEP_GRADIENT, color: IVORY }}
                                    aria-expanded={expanded}
                                  >
                                    {expanded ? copy.companionsLess : copy.companionsMore.replace("{count}", String(hidden))}
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        )
                      })()}

                      <p
                        className="font-goudy-italic relative z-[1] mt-1.5 text-right text-[0.56rem] leading-none sm:text-[0.6rem]"
                        style={{ color: TEAL_SOFT }}
                      >
                        {copy.confirmedLabel} {formatDate(guest.updatedAt)}
                      </p>
                    </motion.article>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            {/* Page dots */}
            {confirmedGuests.length > CARDS_PER_VIEW && (
              <div className="mt-6 flex items-center justify-center gap-2 sm:mt-8" aria-hidden>
                {Array.from({ length: Math.ceil(confirmedGuests.length / CARDS_PER_VIEW) }).map((_, idx) => {
                  const isActive = Math.floor(currentIndex / CARDS_PER_VIEW) === idx
                  return (
                    <span
                      key={idx}
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: isActive ? "1.5rem" : "0.375rem",
                        background: isActive ? GOLD : "color-mix(in srgb, white 40%, transparent)",
                      }}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}

        {confirmedGuests.length === 0 && !isRefreshing && (
          <motion.div
            className="relative mx-auto max-w-xl px-4 text-center"
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true }}
          >
            <div className="rounded-[1.5rem] px-6 py-10 sm:py-12" style={cardStyle}>
              <p className={`${cinzel.className} ${ct.bodyLg} mb-2 font-semibold uppercase tracking-[0.1em]`} style={{ color: palette.heading }}>
                {copy.emptyTitle}
              </p>
              <p className={`font-goudy-italic ${ct.body}`} style={{ color: palette.body }}>
                {copy.emptyText}
              </p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
