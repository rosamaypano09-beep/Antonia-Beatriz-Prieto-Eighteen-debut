"use client"

import localFont from "next/font/local"
import { motion } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { fillCelebrant } from "@/lib/celebrant"
import { sectionType, welcomeTitleSize } from "@/lib/section-typography"
import { cinzel } from "@/lib/fonts"


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

// Welcome letter palette (colors from app/globals.css): wine headings, gold accents, warm ink body
const WELCOME_COLORS = {
  wine: "var(--color-motif-deep)",
  gold: "color-mix(in srgb, var(--color-welcome-gold) 82%, var(--color-motif-deep))",
  ink: "color-mix(in srgb, var(--color-welcome-text) 88%, var(--color-motif-deep))",
  hairline: "color-mix(in srgb, var(--color-welcome-gold) 45%, transparent)",
} as const

function OrnamentalDivider({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${compact ? "gap-1.5" : "gap-2"}`}>
      <span
        className={`h-px ${compact ? "w-6 sm:w-10" : "w-8 sm:w-12"}`}
        style={{
          background:
            "linear-gradient(to right, transparent, var(--color-welcome-gold))",
        }}
      />
      <span
        className="h-1 w-1 rotate-45 sm:h-1.5 sm:w-1.5"
        style={{ background: "var(--color-welcome-gold)" }}
        aria-hidden
      />
      <span
        className={`h-px ${compact ? "w-6 sm:w-10" : "w-8 sm:w-12"}`}
        style={{
          background:
            "linear-gradient(to left, transparent, var(--color-welcome-gold))",
        }}
      />
    </div>
  )
}

function LayeredWelcomeTitle({ title, script }: { title: string; script: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--welcome-size": welcomeTitleSize.main,
          "--script-size": welcomeTitleSize.script,
          "--script-overlap": welcomeTitleSize.overlap,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--welcome-size)",
          color: WELCOME_COLORS.wine,
        }}
      >
        {title}
      </span>

      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9]`}
        style={{
          fontSize: "var(--script-size)",
          color: WELCOME_COLORS.gold,
        }}
      >
        {script}
      </span>

      <span className="sr-only"> {script}</span>
    </h2>
  )
}

export function Welcome() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.welcome
  const fill = (text: string) => fillCelebrant(text, siteConfig)

  return (
    <section
      id="welcome"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-16`}
    >
      <div className="mx-auto w-full max-w-3xl">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative @container/welcome overflow-visible rounded-xl border px-5 py-8 sm:rounded-2xl sm:px-9 sm:py-10 md:px-11 md:py-12"
          style={{
            borderColor: WELCOME_COLORS.hairline,
            background:
              "radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, white 70%, transparent) 0%, transparent 60%), linear-gradient(180deg, var(--color-motif-soft) 0%, var(--color-motif-cream) 100%)",
            boxShadow:
              "0 14px 36px color-mix(in srgb, var(--color-motif-deep) 18%, transparent), 0 2px 6px color-mix(in srgb, var(--color-coastal-deep) 8%, transparent)",
          }}
        >
          <div
            className="wedding-frame-inner hidden min-[400px]:block"
            style={{ borderColor: "color-mix(in srgb, var(--color-welcome-gold) 30%, transparent)" }}
            aria-hidden
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px sm:inset-x-10 md:inset-x-12"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--color-welcome-gold), transparent)",
            }}
          />

          <div className="relative flex flex-col gap-8 sm:gap-9 md:gap-10">
            <header className="space-y-3 pt-2 text-center sm:space-y-3.5 sm:pt-3 md:space-y-4 md:pt-4">
              <LayeredWelcomeTitle title={content.title} script={content.script} />
              <OrnamentalDivider compact />
            </header>

            <div
              className={`font-goudy-italic mx-auto max-w-[36rem] space-y-3 text-center sm:space-y-3.5 md:space-y-4 ${sectionType.textRelaxed}`}
              style={{ color: WELCOME_COLORS.ink }}
            >
              {content.paragraphs.map((paragraph, index) => (
                <p key={index}>{fill(paragraph)}</p>
              ))}
            </div>

            <footer className="space-y-2 border-t pt-8 text-center sm:space-y-2.5 sm:pt-9 md:pt-10"
              style={{
                borderColor: WELCOME_COLORS.hairline,
              }}
            >
              <p
                className={`${aboveTheBeyond.className} ${sectionType.script}`}
                style={{ color: WELCOME_COLORS.wine }}
              >
                {content.signOff}
              </p>
              <p
                className={`${cinzel.className} ${sectionType.subheader} font-semibold tracking-[0.12em] sm:tracking-[0.16em] md:tracking-[0.18em]`}
                style={{ color: WELCOME_COLORS.gold }}
              >
                {fill(content.signature)}
              </p>
            </footer>
          </div>
        </motion.article>
      </div>
    </section>
  )
}
