"use client"

import { celebrantName } from "@/lib/celebrant"
import { useState, type CSSProperties, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { Lora, Playfair_Display } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { RisingMotes } from "@/components/rising-motes"
import { GhostMarquee } from "@/components/loader/GhostMarquee"
import { ghostTextFor } from "@/lib/ghost-text"
import "@/components/loader/loading-screen.css"
import "@/components/sections/love-story-red.css"


// Upright, screen-friendly serif for the answers (same as the My Story paragraphs)
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

// Question numbers: high-contrast italic numerals (The Seasons has no clean digits)
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic"],
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

// Red velvet vibe (same as the sections around it): white + gold text on the red
// circle pattern; the questions sit on an ivory card with wine questions, gold accents
// and crimson → wine number badges.
// Circle colors + blur: components/sections/love-story-red.css (.red-velvet-root); gold dust rises behind the content
const WINE = "var(--color-motif-deep)"
const CRIMSON = "var(--color-motif-accent)"
const IVORY = "var(--color-motif-soft)"
const GOLD = "var(--color-welcome-gold)"
const GOLD_INK = "color-mix(in srgb, var(--color-welcome-gold) 78%, var(--color-motif-deep))"
const BODY = "color-mix(in srgb, var(--color-welcome-text) 85%, var(--color-motif-deep))"
const BADGE_GRADIENT = "linear-gradient(180deg, var(--color-motif-accent) 0%, var(--color-motif-deep) 100%)"

const sectionBg = "color-mix(in srgb, var(--color-motif-deep) 70%, var(--color-coastal-deep))"

const textLift =
  "0 1px 2px color-mix(in srgb, var(--color-coastal-deep) 60%, transparent), 0 2px 14px color-mix(in srgb, var(--color-coastal-deep) 45%, transparent)"

// Text sitting directly on the red pattern: white, or gold for scripts / eyebrows
const onBg = { color: "#fff", textShadow: textLift } as const
const onBgGold = { color: GOLD, textShadow: textLift } as const

const cardStyle = {
  background:
    "radial-gradient(120% 40% at 50% 0%, color-mix(in srgb, white 70%, transparent) 0%, transparent 60%), linear-gradient(180deg, var(--color-motif-soft) 0%, var(--color-motif-cream) 100%)",
  boxShadow:
    "0 30px 60px -28px color-mix(in srgb, var(--color-coastal-deep) 80%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--color-welcome-gold) 40%, transparent)",
} as const

const dividerLineStyle = {
  background: "linear-gradient(to right, transparent, var(--color-welcome-gold), transparent)",
} as const

const ct = {
  body: sectionType.textRelaxed,
  // a touch smaller than sectionType.text (13 / 15 / 16px → 12.5 / 14 / 15px)
  question: "text-[0.78rem] sm:text-[0.875rem] md:text-[0.95rem]",
  // answers: 14 / 15 / 16px → 13 / 14.5 / 15px
  answer: "text-[0.82rem] sm:text-[0.9rem] md:text-[0.95rem]",
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
}

// Sits directly on the red pattern: gold hairlines + diamond
function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to right, transparent, var(--color-welcome-gold))" }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: GOLD }} />
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to left, transparent, var(--color-welcome-gold))" }} />
    </div>
  )
}

function FaqTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as CSSProperties
      }
    >
      <span className="sr-only">
        {title} — {subtitle}
      </span>
      <span
        aria-hidden
        className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.04em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
        style={{ fontSize: "var(--script-size)", ...onBgGold }}
      >
        {subtitle}
      </span>
    </h2>
  )
}

// "[guest list](#guest-list)" → smooth-scrolling link; "[label](https://…)" → opens in a
// new tab; everything else stays text
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\((?:#|https?:\/\/)[^)]+\))/g)
  return parts.map((part, i) => {
    const external = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/)
    if (external) {
      return (
        <a
          key={i}
          href={external[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline decoration-[var(--color-welcome-gold)] decoration-1 underline-offset-[3px] transition-opacity hover:opacity-80"
          style={{ color: CRIMSON }}
        >
          {external[1]}
        </a>
      )
    }
    const match = part.match(/^\[([^\]]+)\]\(#([^)]+)\)$/)
    if (!match) return part
    const [, label, id] = match
    return (
      <a
        key={i}
        href={`#${id}`}
        className="font-semibold underline decoration-[var(--color-welcome-gold)] decoration-1 underline-offset-[3px] transition-opacity hover:opacity-80"
        style={{ color: CRIMSON }}
        onClick={(e) => {
          e.preventDefault()
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
        }}
      >
        {label}
      </a>
    )
  })
}

// Paragraphs split on blank lines; lines starting with "• " render as a list
function FaqAnswer({ answer }: { answer: string }) {
  const blocks = answer.split(/\n{2,}/)
  return (
    <div
      className={`${lora.className} ${ct.answer} space-y-2.5 font-medium leading-[1.7]`}
      style={{ color: BODY }}
    >
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean)
        if (lines.length > 0 && lines.every((line) => line.trim().startsWith("•"))) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines.map((line, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rotate-45"
                    style={{ background: GOLD_INK }}
                  />
                  <span>{renderInline(line.replace(/^\s*•\s*/, ""))}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {renderInline(block)}
          </p>
        )
      })}
    </div>
  )
}

export function FAQ() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.faq
  const reduceMotion = useReducedMotion()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const rsvp = siteConfig.details.rsvp
  const rsvpPhone = rsvp.phone.trim()
  const showRsvpPhone = rsvpPhone.length > 0 && !/to be announced/i.test(rsvpPhone)
  const fillAnswer = (text: string) =>
    text
      .split("{deadline}").join(rsvp.deadline.replace(/\.\s*$/, ""))
      .split("{coordinator}").join(rsvp.coordinator)
      // coordinator may itself use {celebrant}
      .split("{celebrant}").join(celebrantName(siteConfig))
      .split("{contact}").join(showRsvpPhone ? ` at ${rsvpPhone}` : "")
      .split("{guestsTime}").join(siteConfig.ceremony.guestsTime ?? "")
      .split("{programTime}").join(siteConfig.ceremony.time ?? "")
      .split("{endTime}").join(siteConfig.reception.time ?? "")
      .split("{venueName}").join(siteConfig.ceremony.location ?? "")
      .split("{venueAddress}").join(siteConfig.ceremony.venue ?? "")

  const initial = reduceMotion ? false : "hidden"

  return (
    <div
      className={`red-velvet-root ${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
      style={{ background: sectionBg }}
    >
      {/* Red circle pattern (colors: components/sections/love-story-red.css) */}
      <PlainBubbles />
      <RisingMotes count={30} />
      {/* Ghost lettering down the left edge and up the right (same as the loading screen) */}
      <GhostMarquee
        text={ghostTextFor(siteConfig)}
        className="section-ghost"
        fontClassName={theSeasons.className}
        still={!!reduceMotion}
        repeat={6}
      />
      <section
        id="faq"
        className="relative z-10 overflow-hidden pt-14 pb-12 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
      >
        {/* Corner decorations (from site.ts) */}

        {/* Header */}
        <motion.div
          className="relative z-20 mx-auto mb-8 max-w-5xl px-3 text-center @container/faq sm:mb-10 sm:px-4 md:mb-12"
          variants={revealVariants}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <DiamondDivider />
          <p
            className={`${cinzel.className} mx-auto mt-4 max-w-[20rem] px-2 text-[0.6875rem] font-semibold uppercase leading-snug tracking-[0.16em] min-[400px]:max-w-none min-[400px]:text-[0.75rem] sm:mt-5 sm:text-[0.875rem] sm:tracking-[0.22em]`}
            style={onBgGold}
          >
            {content.eyebrow}
          </p>
          <div className="mx-auto mt-3 sm:mt-4 md:mt-5">
            <FaqTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-xl px-2 sm:mt-5 md:mt-6 ${ct.body}`}
            style={{ ...onBg, fontWeight: 600 }}
          >
            {content.description}
          </p>
          <div className="mt-4 flex items-center justify-center sm:mt-5">
            <span
              className="h-px w-16 sm:w-24 md:w-32"
              style={{ background: "linear-gradient(to right, transparent, var(--color-welcome-gold), transparent)" }}
            />
          </div>
        </motion.div>

        {/* Questions */}
        <div className="relative z-20 mx-auto max-w-3xl px-4 sm:px-6 md:px-8">
          <motion.div
            className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]"
            style={cardStyle}
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.ul
              className="relative z-20 space-y-2 px-4 py-5 sm:space-y-2.5 sm:px-6 sm:py-7 md:px-8"
              variants={listVariants}
              initial={initial}
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {content.items.map((item, index) => {
                const isOpen = openIndex === index
                const contentId = `faq-item-${index}`
                return (
                  <motion.li
                    key={item.question}
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl transition-all duration-300"
                    style={{
                      background: isOpen
                        ? "color-mix(in srgb, var(--color-motif-blush) 26%, var(--color-motif-soft))"
                        : "color-mix(in srgb, var(--color-motif-blush) 8%, var(--color-motif-soft))",
                      boxShadow: isOpen
                        ? "0 12px 24px -16px color-mix(in srgb, var(--color-coastal-deep) 50%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--color-welcome-gold) 45%, transparent)"
                        : "inset 0 0 0 1px color-mix(in srgb, var(--color-welcome-gold) 18%, transparent)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="group flex w-full items-center gap-3 px-3.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-welcome-gold)] sm:px-5 sm:py-3.5"
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                    >
                      <span
                        className={`${playfair.className} flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.78rem] font-semibold italic leading-none tabular-nums transition-all duration-300 sm:h-8 sm:w-8 sm:text-[0.86rem]`}
                        style={
                          isOpen
                            ? {
                                background: BADGE_GRADIENT,
                                color: IVORY,
                              }
                            : {
                                background: "color-mix(in srgb, var(--color-welcome-gold) 14%, transparent)",
                                color: WINE,
                                boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-welcome-gold) 45%, transparent)",
                              }
                        }
                        aria-hidden
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`${cinzel.className} ${ct.question} flex-1 font-semibold leading-snug transition-colors duration-200`}
                        style={{ color: WINE }}
                      >
                        {item.question}
                      </span>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? "rotate-180" : "group-hover:translate-y-0.5"}`}
                        style={{ background: isOpen ? IVORY : "color-mix(in srgb, var(--color-welcome-gold) 14%, transparent)" }}
                        aria-hidden
                      >
                        <ChevronDown className="h-4 w-4" style={{ color: GOLD_INK }} />
                      </span>
                    </button>

                    <div
                      id={contentId}
                      role="region"
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-3.5 pb-4 sm:px-5 sm:pb-5">
                          <span className="mb-3 block h-px w-full" style={dividerLineStyle} aria-hidden />
                          <div className="sm:pl-11">
                            <FaqAnswer answer={fillAnswer(item.answer)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                )
              })}
            </motion.ul>
          </motion.div>

        </div>
      </section>
    </div>
  )
}
