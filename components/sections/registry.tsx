"use client"

import { celebrantName, fillCelebrant } from "@/lib/celebrant"
import { useState, type CSSProperties } from "react"
import Image from "next/image"
import localFont from "next/font/local"
import { Cormorant_Garamond } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import { Gift, Heart } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize } from "@/lib/section-typography"


// Refined Garamond for the letter — calligraphic, keepsake feel on the ivory card
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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

// No section background or decorations: the header sits straight on the page backdrop,
// so it's white (gold for the script) with a soft dark lift. The letter card is ivory
// paper in wine + gold (colors: content/site.ts → registry.colors).
const textLift =
  "0 1px 2px color-mix(in srgb, var(--color-coastal-deep) 60%, transparent), 0 2px 14px color-mix(in srgb, var(--color-coastal-deep) 45%, transparent)"
const onBg = { color: "#fff", textShadow: textLift } as const
const onBgGold = { color: "var(--color-welcome-gold)", textShadow: textLift } as const
const SEAL_GRADIENT = "linear-gradient(180deg, var(--color-motif-accent) 0%, var(--color-motif-deep) 100%)"

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

const staggerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

// Gold hairlines + diamond above the header
function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to right, transparent, var(--color-welcome-gold))" }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-welcome-gold)" }} />
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to left, transparent, var(--color-welcome-gold))" }} />
    </div>
  )
}

function RegistryTitle({ title, subtitle }: { title: string; subtitle: string }) {
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

export function Registry() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.registry
  const c = content.colors // siteConfig.registry.colors (content/site.ts)
  const celebrant = celebrantName(siteConfig)
  const reduceMotion = useReducedMotion()
  const [activeTab, setActiveTab] = useState(0)
  const initial = reduceMotion ? false : "hidden"

  const buttonBg = SEAL_GRADIENT
  const buttonText = "#fff"
  const cardStyle = {
    background: `radial-gradient(120% 45% at 50% 0%, color-mix(in srgb, white 70%, transparent) 0%, transparent 60%), linear-gradient(180deg, ${c.card} 0%, ${c.cardEdge} 100%)`,
    boxShadow: `0 30px 60px -28px color-mix(in srgb, var(--color-coastal-deep) 80%, transparent), inset 0 0 0 1px ${c.line}`,
  }
  const dividerLineStyle = { background: "linear-gradient(to right, transparent, var(--color-welcome-gold), transparent)" }

  // "Dear family and friends — eighteen years…" → salutation line + letter body
  const [firstParagraph = "", ...restParagraphs] = content.paragraphs
  const salutationMatch = firstParagraph.match(/^(.{1,48}?)\s+[—–]\s+(.+)$/s)
  const salutation = salutationMatch ? `${salutationMatch[1].replace(/[,:]$/, "")},` : null
  const letter = salutationMatch
    ? [salutationMatch[2].charAt(0).toUpperCase() + salutationMatch[2].slice(1), ...restParagraphs]
    : content.paragraphs

  const accounts = content.showAccounts
    ? content.accounts.filter((a) => a.show && (a.accountNumber || a.qr))
    : []
  const activeIndex = Math.min(activeTab, Math.max(0, accounts.length - 1))
  const active = accounts[activeIndex]

  return (
    <div className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full`}>
      <section
        id="registry"
        className="relative z-10 pt-10 pb-10 sm:pt-12 sm:pb-12 md:pt-14 md:pb-14"
      >
        {/* Header */}
        <motion.div
          className="relative z-20 mx-auto mb-6 max-w-5xl px-3 text-center @container/registry sm:mb-8"
          variants={revealVariants}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <DiamondDivider />
          <p
            className={`${cinzel.className} mx-auto mt-4 max-w-[20rem] px-2 text-[0.6875rem] font-bold uppercase leading-snug tracking-[0.16em] min-[400px]:max-w-none min-[400px]:text-[0.75rem] sm:mt-5 sm:text-[0.875rem] sm:tracking-[0.22em]`}
            style={onBgGold}
          >
            {content.eyebrow}
          </p>
          <div className="mx-auto mt-3 sm:mt-4 md:mt-5">
            <RegistryTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className={`${cormorant.className} mx-auto mt-4 max-w-xl px-2 text-[1.1rem] font-semibold italic leading-relaxed sm:mt-5 sm:text-[1.25rem] md:mt-6`}
            style={onBg}
          >
            {content.description}
          </p>
          <div className="mt-4 flex items-center justify-center sm:mt-5">
            <span className="h-px w-16 sm:w-24 md:w-32" style={dividerLineStyle} />
          </div>
        </motion.div>

        <div className="relative z-20 mx-auto max-w-2xl px-4 sm:px-6 md:px-8">
          {/* Letter card */}
          <motion.div
            className="relative mt-8 rounded-[1.75rem] px-7 pb-10 pt-12 text-center sm:mt-10 sm:rounded-[2.25rem] sm:px-12 sm:pb-12 sm:pt-14 md:px-14"
            style={cardStyle}
            variants={staggerVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
          >
            {/* Seal sitting on the top edge */}
            <motion.div variants={itemVariants} className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
                style={{
                  background: buttonBg,
                  boxShadow: `0 0 0 5px ${c.card}, 0 0 0 6px color-mix(in srgb, ${c.line} 60%, transparent), 0 16px 30px -12px color-mix(in srgb, ${c.title} 65%, transparent)`,
                }}
                aria-hidden
              >
                <Gift className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: buttonText }} />
              </span>
            </motion.div>

            {/* Formal salutation, set apart in engraved capitals */}
            {salutation ? (
              <motion.div variants={itemVariants} className="relative mb-6 sm:mb-7">
                <p
                  className={`${cinzel.className} text-[0.85rem] font-bold uppercase tracking-[0.22em] sm:text-[0.95rem] sm:tracking-[0.26em]`}
                  style={{ color: c.title }}
                >
                  {salutation}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2" aria-hidden>
                  <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(to right, transparent, ${c.eyebrow})` }} />
                  <span className="h-1 w-1 rotate-45" style={{ background: c.eyebrow }} />
                  <span className="h-px w-8 sm:w-12" style={{ background: `linear-gradient(to left, transparent, ${c.eyebrow})` }} />
                </div>
              </motion.div>
            ) : null}

            <div
              className={`${cormorant.className} relative mx-auto max-w-[34rem] space-y-5 text-center text-[1.15rem] font-semibold leading-[1.7] tracking-[0.005em] [font-feature-settings:'liga','kern'] [text-wrap:pretty] sm:space-y-6 sm:text-[1.25rem] md:text-[1.3rem]`}
              style={{ color: c.body }}
            >
              {letter.map((text, i) => (
                <motion.p key={i} variants={itemVariants}>
                  {text}
                </motion.p>
              ))}
            </div>

            {/* Optional e-gift accounts — tap a tab to switch */}
            {active && (
              <motion.div
                className="relative mt-8 sm:mt-9"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.6, ease }}
              >
                <p
                  className={`${cinzel.className} flex items-center justify-center gap-2.5 text-[0.7rem] font-bold uppercase tracking-[0.22em] sm:text-[0.78rem]`}
                  style={{ color: c.eyebrow }}
                >
                  <span className="h-px w-8 sm:w-10" style={{ background: `linear-gradient(to right, transparent, ${c.eyebrow})` }} aria-hidden />
                  {content.accountsTitle}
                  <span className="h-px w-8 sm:w-10" style={{ background: `linear-gradient(to left, transparent, ${c.eyebrow})` }} aria-hidden />
                </p>

                {accounts.length > 1 && (
                  <div
                    role="tablist"
                    aria-label={content.accountsTitle}
                    className="mx-auto mt-3 inline-flex max-w-full flex-wrap justify-center gap-1 rounded-full p-1"
                    style={{ background: `color-mix(in srgb, ${c.glow} 70%, transparent)` }}
                  >
                    {accounts.map((account, i) => {
                      const selected = i === activeIndex
                      return (
                        <button
                          key={`${account.label}-${i}`}
                          type="button"
                          role="tab"
                          id={`registry-tab-${i}`}
                          aria-selected={selected}
                          aria-controls="registry-tabpanel"
                          onClick={() => setActiveTab(i)}
                          className={`${cinzel.className} rounded-full px-5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] transition-all duration-300 sm:px-5 sm:text-[0.72rem]`}
                          style={
                            selected
                              ? {
                                  background: buttonBg,
                                  color: buttonText,
                                  boxShadow: `0 6px 14px -8px color-mix(in srgb, ${c.button} 70%, transparent)`,
                                }
                              : { color: c.title }
                          }
                        >
                          {account.label}
                        </button>
                      )
                    })}
                  </div>
                )}

                <div
                  id="registry-tabpanel"
                  role={accounts.length > 1 ? "tabpanel" : undefined}
                  aria-labelledby={accounts.length > 1 ? `registry-tab-${activeIndex}` : undefined}
                  className="mx-auto mt-4 max-w-[17rem]"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeIndex}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease }}
                      className="flex flex-col items-center rounded-2xl px-5 py-5"
                      style={{
                        background: c.accountCard,
                        border: `1px solid ${c.glow}`,
                        boxShadow: `0 18px 34px -22px color-mix(in srgb, ${c.title} 45%, transparent)`,
                      }}
                    >
                      {accounts.length === 1 && (
                        <p className={`${theSeasons.className} mb-3 text-lg uppercase tracking-[0.12em]`} style={{ color: c.title }}>
                          {active.label}
                        </p>
                      )}
                      {active.qr ? (
                        <div className="relative h-44 w-44 overflow-hidden rounded-xl bg-white sm:h-48 sm:w-48">
                          <Image
                            src={active.qr}
                            alt={`${active.label} QR code`}
                            fill
                            unoptimized
                            sizes="192px"
                            draggable={false}
                            className="pointer-events-none select-none object-contain p-2"
                          />
                        </div>
                      ) : (
                        <span
                          className={`${theSeasons.className} flex h-14 w-14 items-center justify-center rounded-full text-xl`}
                          style={{ background: `color-mix(in srgb, ${c.glow} 80%, transparent)`, color: c.title }}
                          aria-hidden
                        >
                          {active.label.charAt(0)}
                        </span>
                      )}
                      {active.accountName ? (
                        <p className={`${cormorant.className} mt-3 text-[1.05rem] font-bold`} style={{ color: c.body }}>
                          {active.accountName}
                        </p>
                      ) : null}
                      {active.accountNumber ? (
                        <p
                          className={`${cinzel.className} mt-1 text-[0.85rem] font-bold tabular-nums tracking-[0.12em]`}
                          style={{ color: c.title }}
                        >
                          {active.accountNumber}
                        </p>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                  {content.accountsNote ? (
                    <p
                      className={`${cormorant.className} mt-3 text-[0.95rem] font-semibold italic leading-snug sm:text-[1rem]`}
                      style={{ color: c.soft }}
                    >
                      {content.accountsNote}
                    </p>
                  ) : null}
                </div>
              </motion.div>
            )}

            <div className="h-6 sm:h-7" aria-hidden />

            {/* Sign-off */}
            <motion.div variants={itemVariants} className="relative space-y-1.5">
              {content.thankYou ? (
                <p className={`${cormorant.className} text-[1.15rem] font-bold tracking-[0.01em] sm:text-[1.25rem]`} style={{ color: c.body }}>
                  {content.thankYou}
                </p>
              ) : null}
              <p className={`${cormorant.className} text-[1.15rem] font-semibold italic sm:text-[1.25rem]`} style={{ color: c.soft }}>
                {content.signOff}
              </p>
              <p className={`${aboveTheBeyond.className} px-2 pb-1 pt-2 text-[2.1rem] leading-tight sm:text-[2.6rem]`} style={{ color: c.script }}>
                {content.signature ? fillCelebrant(content.signature, siteConfig) : celebrant}
              </p>
              <Heart className="mx-auto mt-2 h-3.5 w-3.5" style={{ color: c.eyebrow, fill: c.eyebrow }} aria-hidden />
            </motion.div>
          </motion.div>

        </div>
      </section>
    </div>
  )
}
