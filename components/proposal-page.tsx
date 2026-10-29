"use client"

import { celebrantName, fillCelebrant } from "@/lib/celebrant"
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  type CSSProperties,
  type ReactNode,
} from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Heart, Check, X, Sparkles } from "lucide-react"
import localFont from "next/font/local"
import { Playfair_Display } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import { ProposalMixedText, proposalMixedTextInter } from "@/lib/proposal-mixed-text"
import { useSiteConfig } from "@/hooks/use-site-config"
import { Hero as InvitationHero } from "@/components/loader/Hero"
import { LoadingScreen } from "@/components/loader/LoadingScreen"
import { InvitePhotoBackdrop } from "@/components/loader/invite-photo-backdrop"
import { RisingMotes } from "@/components/rising-motes"
import { sectionType, welcomeTitleSize } from "@/lib/section-typography"
import "@/components/loader/loading-screen.css"
import "@/components/sections/love-story-red.css"
import type { ProposalRole } from "@/lib/proposal-types"
import { parseInviteeNameFromSearchParams } from "@/lib/proposal-invite-link"

const Silk = dynamic(() => import("@/components/silk"), { ssr: false })

const proposalEntryEase = [0.22, 1, 0.36, 1] as const
const CINEMATIC_ENTRY_MS = 3000


const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
})

const inter = proposalMixedTextInter

const theSeasons = localFont({
  src: "../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

// Red velvet page (wine + crimson glows, crimson Silk folds, crimson corners) with the
// invitation on ivory paper: wine ink, gold labels / script, crimson → wine buttons.
const PAGE_BG =
  "radial-gradient(70% 40% at 20% 10%, color-mix(in srgb, var(--color-motif-accent) 40%, transparent) 0%, transparent 70%), radial-gradient(60% 35% at 85% 60%, color-mix(in srgb, var(--color-motif-accent) 28%, transparent) 0%, transparent 70%), linear-gradient(180deg, var(--color-motif-deep) 0%, color-mix(in srgb, var(--color-motif-deep) 60%, var(--color-coastal-deep)) 100%)"
// No card: everything sits straight on the velvet page, so the ink is light
const IVORY = "var(--color-motif-soft)"
const CHAMPAGNE = "var(--color-welcome-gold)"
const INK = "#fff"
const CREAM = "color-mix(in srgb, white 88%, transparent)"
const LABEL_GOLD = "var(--color-welcome-gold)"
// keeps its template name; now the gold script colour
const SCRIPT_GREEN = "var(--color-welcome-gold)"
const WINE = "var(--color-motif-deep)"
const TEXT_LIFT =
  "0 1px 2px color-mix(in srgb, var(--color-coastal-deep) 60%, transparent), 0 2px 14px color-mix(in srgb, var(--color-coastal-deep) 45%, transparent)"
const GOLD_BORDER = "color-mix(in srgb, var(--color-welcome-gold) 38%, transparent)"
const GOLD_BORDER_SOFT = "color-mix(in srgb, var(--color-welcome-gold) 22%, transparent)"
const INNER_SURFACE = "color-mix(in srgb, var(--color-coastal-deep) 35%, transparent)"

const goldGradientText: CSSProperties = {
  background: "linear-gradient(180deg, #fff6d6 0%, #f0d491 40%, #c9993f 75%, #f3dc9f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
}

const palette = {
  body: CREAM,
  bodySoft: "color-mix(in srgb, white 70%, transparent)",
  heading: INK,
  label: LABEL_GOLD,
  script: SCRIPT_GREEN,
} as const

const dividerLineStyle = {
  background:
    "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-welcome-gold) 65%, transparent), transparent)",
} as const

const primaryBtnStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, var(--color-motif-accent) 0%, var(--color-motif-deep) 100%)",
  borderColor: "color-mix(in srgb, var(--color-welcome-gold) 65%, transparent)",
  color: "#fff",
  boxShadow: "0 12px 24px -12px color-mix(in srgb, var(--color-welcome-navy) 70%, transparent)",
  textShadow: "none",
}

const secondaryBtnStyle: CSSProperties = {
  color: WINE,
  textShadow: "none",
  backgroundColor: "color-mix(in srgb, var(--color-motif-soft) 92%, transparent)",
  borderColor: GOLD_BORDER,
}

const primaryBtnClass =
  `${cinzel.className} touch-manipulation inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full border px-5 py-3.5 text-[0.72rem] font-semibold uppercase leading-snug tracking-[0.14em] transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 sm:px-8 sm:text-xs sm:tracking-[0.2em] sm:hover:scale-[1.02]`

const secondaryBtnClass =
  `${cinzel.className} touch-manipulation inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border px-5 py-3 text-[0.66rem] font-semibold uppercase leading-snug tracking-[0.12em] transition-all duration-300 active:scale-[0.98] sm:px-8 sm:text-[0.7rem] sm:tracking-[0.18em] sm:hover:scale-[1.02]`

/* ── Invitation types (wording lives in site.ts → proposal.copy) ──────────── */

type CopyKey = "party" | "sponsor" | "bearer" | "flowerGirl"

const CEREMONY_BEARER_ROLE_IDS = new Set(["ring-bearer", "coin-bearer", "bible-bearer", "herald-bearer"])

function copyKeyFor(role: ProposalRole): CopyKey {
  if (role.type === "sponsor-ninong" || role.type === "sponsor-ninang") return "sponsor"
  if (role.id === "flower-girl") return "flowerGirl"
  if (CEREMONY_BEARER_ROLE_IDS.has(role.id)) return "bearer"
  return "party"
}

function isPlayful(key: CopyKey) {
  return key === "bearer" || key === "flowerGirl"
}

/* ── Small pieces ─────────────────────────────────────────────────────────── */

/** Config text with emoji / apostrophes / "&" / "!" in a clean font (display fonts lack them). */
function T({ text, className = "" }: { text: string; className?: string }) {
  return (
    <ProposalMixedText
      text={text}
      className={className}
      specialClassName={`${inter.className} inline-block align-baseline text-[0.95em] leading-none font-normal not-italic tracking-normal`}
    />
  )
}

function DividerLine({ className = "w-16 sm:w-24 md:w-32" }: { className?: string }) {
  return <span className={`block h-px ${className}`} style={dividerLineStyle} aria-hidden />
}

function SmallCaps({
  children,
  className = "",
  color = palette.label,
}: {
  children: ReactNode
  className?: string
  color?: string
}) {
  return (
    <p
      className={`${cinzel.className} text-[0.64rem] font-semibold uppercase leading-relaxed tracking-[0.2em] sm:text-[0.7rem] sm:tracking-[0.24em] ${className}`}
      style={{ color }}
    >
      {children}
    </p>
  )
}

function LayeredProposalTitle({ main, script }: { main: string; script: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--welcome-size": welcomeTitleSize.main,
          "--script-size": welcomeTitleSize.script,
          "--script-overlap": welcomeTitleSize.overlap,
        } as CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.95] tracking-[0.06em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em]`}
        style={{ fontSize: "clamp(2rem, 9.5vw, 3.6rem)", color: INK }}
      >
        <T text={main} />
      </span>
      {script ? (
        <>
          <span
            aria-hidden
            className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1 block w-fit max-w-full px-2 leading-[1.15]`}
            style={{ fontSize: "clamp(1.6rem, 7vw, 2.5rem)", color: SCRIPT_GREEN }}
          >
            <T text={script} />
          </span>
          <span className="sr-only">{script}</span>
        </>
      ) : null}
    </h2>
  )
}

function Paragraphs({ lines, className = "" }: { lines: readonly string[]; className?: string }) {
  if (lines.length === 0) return null
  return (
    <div className={`mx-auto max-w-md space-y-3.5 text-pretty sm:space-y-4 ${className}`} style={{ color: palette.body }}>
      {lines.map((line, i) => (
        <p key={i}>
          <T text={line} />
        </p>
      ))}
    </div>
  )
}

/* ── Card shell ───────────────────────────────────────────────────────────── */

/** Plain column — no paper card, frame or glow. */
function ProposalCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-xl px-3 py-6 text-center sm:px-6 sm:py-10" style={{ textShadow: TEXT_LIFT }}>
      {children}
    </div>
  )
}

function SignOff({ line }: { line: string }) {
  const siteConfig = useSiteConfig()
  if (!line) return null
  return (
    <p className={`${aboveTheBeyond.className} text-center text-[clamp(1.5rem,6.5vw,2rem)] leading-tight`} style={{ color: SCRIPT_GREEN }}>
      <T text={`${line} ${celebrantName(siteConfig)}`} />
    </p>
  )
}

/* ── The letter ───────────────────────────────────────────────────────────── */

/** The Seasons (demo) has no clean digits / "?" — set those in Cinzel. */
function DigitsInCinzel({ text }: { text: string }) {
  return (
    <>
      {text.split(/([\d?]+)/).map((part, i) =>
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

/** Simple ask: image on top, "Will you be our {role}?", the letter, then the buttons. */
function ProposalQuestion({
  copyKey,
  roleTitle,
  inviteeName,
  submitting,
  onYes,
  onNo,
  fill,
  bodyClass,
}: {
  copyKey: CopyKey
  roleTitle: string
  inviteeName: string
  submitting?: boolean
  onYes: () => void
  onNo: () => void
  fill: (text: string) => string
  bodyClass: string
}) {
  const siteConfig = useSiteConfig()
  const copy = siteConfig.proposal.copy[copyKey]
  const { labels, coupleImage } = siteConfig.proposal
  const name = inviteeName.trim()

  return (
    <div className="flex flex-col items-center">
      {/* A PERSONAL INVITATION / FROM MY HEART TO YOURS — above the picture */}
      {labels.topEyebrow ? (
        <p className={`${cinzel.className} text-[0.72rem] font-semibold uppercase tracking-[0.34em] sm:text-xs`} style={{ color: LABEL_GOLD }}>
          <T text={labels.topEyebrow} />
        </p>
      ) : null}
      {labels.topLine ? (
        <p className={`${theSeasons.className} mt-2 mb-5 text-[clamp(1.2rem,5.4vw,1.8rem)] uppercase leading-tight tracking-[0.1em] sm:mb-6`} style={{ color: INK }}>
          <T text={labels.topLine} />
        </p>
      ) : null}

      {coupleImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coupleImage}
          alt={celebrantName(siteConfig)}
          className="mx-auto block h-auto max-h-[46dvh] w-auto max-w-full select-none object-contain drop-shadow-[0_18px_30px_color-mix(in_srgb,var(--color-coastal-deep)_55%,transparent)]"
        />
      ) : null}

      {/* A SPECIAL PLACE / IN MY 18TH BIRTHDAY */}
      {labels.headerEyebrow ? (
        <p className={`${cinzel.className} mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.34em] sm:mt-8 sm:text-xs`} style={{ color: LABEL_GOLD }}>
          <T text={labels.headerEyebrow} />
        </p>
      ) : null}
      {labels.headerScript ? (
        <h1 className={`${theSeasons.className} mt-2 text-[clamp(1.6rem,7.5vw,2.6rem)] uppercase leading-tight tracking-[0.08em]`} style={{ color: INK }}>
          <DigitsInCinzel text={fill(labels.headerScript)} />
        </h1>
      ) : null}

      <DividerLine className="mx-auto mt-5 w-24 sm:w-32" />

      {name ? (
        <p className={`${aboveTheBeyond.className} mt-5 text-[clamp(1.6rem,7vw,2.2rem)] leading-none`} style={{ color: SCRIPT_GREEN }}>
          <T text={`${fill(copy.greeting)} ${name},`} />
        </p>
      ) : null}

      {/* Will you be one of my 18 Roses? */}
      <h2
        className={`${theSeasons.className} mt-4 text-[clamp(1.25rem,5.8vw,1.85rem)] leading-snug tracking-[0.04em] [overflow-wrap:anywhere]`}
        style={{ ...goldGradientText, textShadow: "none" }}
      >
        <DigitsInCinzel text={`${labels.askQuestion} ${roleTitle.replace(/^One of My\b/i, "one of my")}?`} />
      </h2>

      <Paragraphs lines={[...copy.intro, ...copy.body, ...(copy.askNote ? [copy.askNote] : [])].map(fill)} className={`mt-5 ${bodyClass}`} />

      {copy.signOff ? (
        <p className={`${aboveTheBeyond.className} mt-6 text-[clamp(1.5rem,6.5vw,2rem)] leading-tight`} style={{ color: SCRIPT_GREEN }}>
          <T text={`${fill(copy.signOff)} ${celebrantName(siteConfig)}`} />
        </p>
      ) : null}

      <div className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-3 sm:mt-10" style={{ textShadow: "none" }}>
        <button type="button" disabled={submitting} onClick={onYes} className={primaryBtnClass} style={primaryBtnStyle}>
          {submitting ? labels.saving : <T text={fill(copy.yesButton)} />}
        </button>
        <button type="button" disabled={submitting} onClick={onNo} className={secondaryBtnClass} style={secondaryBtnStyle}>
          <T text={fill(copy.noButton)} />
        </button>
      </div>
    </div>
  )
}

/** Header for the after-answer cards (icon + layered title + subheader). */
function FlowHeader({
  icon,
  title,
  script,
  subheader,
  animated = false,
}: {
  icon: ReactNode
  title: string
  script: string
  subheader: string
  animated?: boolean
}) {
  const iconNode = (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-full"
      style={{
        background: "linear-gradient(180deg, var(--color-motif-accent) 0%, var(--color-motif-deep) 100%)",
        boxShadow:
          "0 0 0 3px color-mix(in srgb, var(--color-coastal-deep) 40%, transparent), 0 0 0 4px var(--color-welcome-gold), 0 0 28px color-mix(in srgb, var(--color-welcome-gold) 35%, transparent)",
      }}
    >
      {icon}
    </div>
  )
  return (
    <div className="mb-7">
      <div className="mb-7 flex justify-center">
        {animated ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.6 }}>
            {iconNode}
          </motion.div>
        ) : (
          iconNode
        )}
      </div>
      <LayeredProposalTitle main={title} script={script} />
      <DividerLine className="mx-auto mt-5 w-24 sm:w-32" />
      {subheader ? (
        <SmallCaps className="mx-auto mt-4 max-w-md">
          <T text={subheader} />
        </SmallCaps>
      ) : null}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

type ProposalFlowState = "question" | "yes_details" | "yes_submitted" | "no_clicked" | "no_submitted"

interface ProposalPageProps {
  role: ProposalRole
}

function ProposalPageInner({ role }: ProposalPageProps) {
  const searchParams = useSearchParams()
  const inviteeFromLink = useMemo(() => parseInviteeNameFromSearchParams(searchParams), [searchParams])

  const [flowState, setFlowState] = useState<ProposalFlowState>("question")
  const [preferredName, setPreferredName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [showInvitation, setShowInvitation] = useState(false)
  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(true)
  const [heroEnterFromLoading, setHeroEnterFromLoading] = useState(false)
  const [proposalVisible, setProposalVisible] = useState(false)
  const [enteringFromInvite, setEnteringFromInvite] = useState(false)

  const handleLoadingFadeStart = useCallback(() => {
    setShowInvitation(true)
    setHeroEnterFromLoading(true)
  }, [])

  const handleLoadingComplete = useCallback(() => {
    setLoadingOverlayVisible(false)
  }, [])

  const handleTransitionStart = useCallback(() => {
    setEnteringFromInvite(true)
    setProposalVisible(true)
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  const handleOpenInvitation = useCallback(() => {
    setShowInvitation(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
    window.setTimeout(() => setEnteringFromInvite(false), CINEMATIC_ENTRY_MS)
  }, [])

  const pageScrollLocked = loadingOverlayVisible || showInvitation
  const cinematicEntry = enteringFromInvite && proposalVisible

  useEffect(() => {
    if (inviteeFromLink) {
      setPreferredName(inviteeFromLink)
    }
  }, [inviteeFromLink])

  const siteConfig = useSiteConfig()
  const { labels } = siteConfig.proposal
  const copyKey = copyKeyFor(role)
  const copy = siteConfig.proposal.copy[copyKey]
  const confirmedDisplayName = (inviteeFromLink || preferredName).trim()

  const fill = (text: string) =>
    fillCelebrant(
      text
        .split("{name}").join(confirmedDisplayName || "Friend")
        .split("{role}").join(role.title),
      siteConfig,
    )

  // Playful roles (bearers, flower girl) read in Playfair; the rest in Goudy italic
  const bodyClass = isPlayful(copyKey)
    ? `${playfair.className} text-[0.95rem] font-medium leading-[1.7] sm:text-base`
    : `font-goudy-italic text-[0.98rem] sm:text-[1.05rem] ${sectionType.textRelaxed}`

  const submitResponse = async (status: "Confirmed" | "Declined", name: string) => {
    const response = await fetch("/api/proposal-responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: role.id,
        name,
        status,
        submittedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to submit response")
    }

    window.dispatchEvent(new Event("entourageUpdated"))
  }

  const handleYesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!preferredName.trim()) {
      setValidationError(labels.nameForm.required)
      return
    }
    setValidationError("")
    setSubmitting(true)

    try {
      await submitResponse("Confirmed", preferredName.trim())
      setFlowState("yes_submitted")
    } catch (err) {
      console.error("Failed to submit confirmation:", err)
      setValidationError(labels.saveError)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNoSubmit = async () => {
    setSubmitting(true)
    setValidationError("")
    try {
      const declineLabel = confirmedDisplayName ? `${confirmedDisplayName} (declined)` : "Declined Entourage Offer"
      await submitResponse("Declined", declineLabel)
      setFlowState("no_submitted")
    } catch (err) {
      console.error("Failed to submit decline:", err)
      setValidationError(labels.saveError)
    } finally {
      setSubmitting(false)
    }
  }

  const handleYesClick = async () => {
    const name = (inviteeFromLink || preferredName).trim()
    if (!name) {
      setFlowState("yes_details")
      return
    }
    setPreferredName(name)
    setValidationError("")
    setSubmitting(true)
    try {
      await submitResponse("Confirmed", name)
      setFlowState("yes_submitted")
    } catch (err) {
      console.error("Failed to submit confirmation:", err)
      setValidationError(labels.saveError)
    } finally {
      setSubmitting(false)
    }
  }

  const goTo = (state: ProposalFlowState) => {
    setValidationError("")
    setFlowState(state)
  }

  const errorLine = validationError ? (
    <p className="mt-4 text-center text-sm font-medium" style={{ color: "var(--color-motif-deep)" }} role="alert">
      <T text={validationError} />
    </p>
  ) : null

  const cardMotion = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { duration: 0.5, ease: "easeOut" as const },
  }

  return (
    <div
      className={`red-velvet-root ${theSeasons.variable} ${aboveTheBeyond.variable} relative min-h-[100dvh] select-none px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:py-16 md:py-20 ${pageScrollLocked ? "overflow-hidden" : "overflow-x-hidden"}`}
      style={{ background: PAGE_BG, color: CREAM }}
    >
      {/* Crimson Silk folds drifting over the wine background */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.28]" aria-hidden>
        <Suspense fallback={<div className="h-full w-full" style={{ background: PAGE_BG }} />}>
          <Silk speed={6} scale={1} color="#A3172A" noiseIntensity={0} rotation={0.25} />
        </Suspense>
      </div>

      {/* Gold dust rising behind the picture and text (content sits at z-10) */}
      <RisingMotes count={40} />

      {loadingOverlayVisible && (
        <div className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--loading" aria-hidden="true">
          <InvitePhotoBackdrop />
        </div>
      )}

      {loadingOverlayVisible && (
        <LoadingScreen onFadeStart={handleLoadingFadeStart} onComplete={handleLoadingComplete} />
      )}

      {(loadingOverlayVisible || showInvitation) && (
        <InvitationHero
          onOpen={handleOpenInvitation}
          onTransitionStart={handleTransitionStart}
          enterFromLoading={heroEnterFromLoading}
          visible={showInvitation}
        />
      )}

      {cinematicEntry && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[28] bg-[var(--color-motif-deep)]"
          aria-hidden="true"
          initial={{ clipPath: "circle(0% at 50% 46%)", opacity: 0.98 }}
          animate={{ clipPath: "circle(145% at 50% 46%)", opacity: 0 }}
          transition={{ duration: 1.55, delay: 0.12, ease: proposalEntryEase }}
        />
      )}

      <motion.div
        initial={false}
        animate={proposalVisible ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 40, filter: "blur(8px)" }}
        transition={cinematicEntry ? { duration: 1.08, ease: proposalEntryEase, delay: 0.86 } : { duration: 0.01 }}
        className={`relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center justify-center pt-4 pb-4 min-h-[calc(100dvh-2.5rem)] sm:min-h-[calc(100dvh-8rem)] sm:pt-0 ${proposalVisible ? "" : "pointer-events-none"}`}
        style={{ color: palette.body }}
      >

        <AnimatePresence mode="wait">
          {flowState === "question" && (
            <motion.div key="question" className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <ProposalQuestion
                  copyKey={copyKey}
                  roleTitle={role.title}
                  inviteeName={inviteeFromLink || preferredName}
                  submitting={submitting}
                  onYes={() => void handleYesClick()}
                  onNo={() => goTo("no_clicked")}
                  fill={fill}
                  bodyClass={bodyClass}
                />
                {errorLine}
              </ProposalCard>
            </motion.div>
          )}

          {flowState === "yes_details" && (
            <motion.form key="yes-form" onSubmit={handleYesSubmit} className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <FlowHeader
                  icon={<Check className="h-7 w-7" style={{ color: CHAMPAGNE }} />}
                  title={fill(labels.nameForm.title)}
                  script={fill(labels.nameForm.script)}
                  subheader={fill(labels.nameForm.subheader)}
                />
                <Paragraphs lines={[fill(labels.nameForm.body)]} className={bodyClass} />

                <div className="mx-auto mt-6 max-w-md text-left">
                  <label htmlFor="preferred-name" className="mb-2 block">
                    <SmallCaps>
                      <T text={labels.nameForm.label} /> <span style={{ color: CHAMPAGNE }}>*</span>
                    </SmallCaps>
                  </label>
                  <input
                    id="preferred-name"
                    type="text"
                    required
                    placeholder={labels.nameForm.placeholder}
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    // 16px text on phones so iOS doesn't zoom in while typing
                    className="font-goudy-italic w-full select-text rounded-xl px-4 py-3 text-base transition-all focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-welcome-gold)_45%,transparent)]"
                    style={{
                      color: WINE,
                      backgroundColor: IVORY,
                      textShadow: "none",
                      border: `1px solid ${GOLD_BORDER}`,
                      boxShadow: "inset 0 1px 2px color-mix(in srgb, var(--color-motif-deep) 8%, transparent)",
                    }}
                  />
                </div>
                {errorLine}

                <div className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
                  <button type="submit" disabled={submitting} className={primaryBtnClass} style={primaryBtnStyle}>
                    {submitting ? labels.saving : <T text={labels.nameForm.submit} />}
                  </button>
                  <button type="button" onClick={() => goTo("question")} className={secondaryBtnClass} style={secondaryBtnStyle}>
                    <T text={labels.nameForm.cancel} />
                  </button>
                </div>
              </ProposalCard>
            </motion.form>
          )}

          {flowState === "yes_submitted" && (
            <motion.div key="yes-success" className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <FlowHeader
                  animated
                  icon={<Sparkles className="h-7 w-7" style={{ color: CHAMPAGNE }} />}
                  title={fill(copy.yes.title)}
                  script={fill(copy.yes.script)}
                  subheader={fill(copy.yes.subheader)}
                />

                <div
                  className="mx-auto mb-7 max-w-sm rounded-2xl border px-5 py-4"
                  style={{ borderColor: GOLD_BORDER_SOFT, backgroundColor: INNER_SURFACE }}
                >
                  {confirmedDisplayName && !isPlayful(copyKey) ? (
                    <>
                      <SmallCaps className="text-[0.58rem] sm:text-[0.62rem]">
                        <T text={labels.registeredName} />
                      </SmallCaps>
                      <p className={`${theSeasons.className} mt-1 text-lg tracking-wide [overflow-wrap:anywhere]`} style={{ color: INK }}>
                        <T text={confirmedDisplayName} />
                      </p>
                    </>
                  ) : null}
                  <SmallCaps className="mt-1.5" color={palette.bodySoft}>
                    <T text={fill(copy.yes.roleLine)} />
                  </SmallCaps>
                </div>

                <Paragraphs lines={copy.yes.body.map(fill)} className={bodyClass} />

                <div className="mt-9 space-y-6">
                  <SignOff line={fill(copy.yes.signOff)} />
                  <DividerLine className="mx-auto w-full max-w-md" />
                  <Link href="/" className={`${primaryBtnClass} mx-auto max-w-sm`} style={primaryBtnStyle}>
                    <T text={labels.returnButton} />
                  </Link>
                </div>
              </ProposalCard>
            </motion.div>
          )}

          {flowState === "no_clicked" && (
            <motion.div key="no-confirm" className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <FlowHeader
                  icon={<X className="h-7 w-7" style={{ color: CHAMPAGNE }} />}
                  title={fill(copy.no.title)}
                  script={fill(copy.no.script)}
                  subheader={fill(copy.no.subheader)}
                />
                <Paragraphs lines={copy.no.body.map(fill)} className={bodyClass} />
                {errorLine}
                <div className="mt-9 space-y-6">
                  <DividerLine className="mx-auto w-full max-w-md" />
                  <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => void handleNoSubmit()}
                      disabled={submitting}
                      className={primaryBtnClass}
                      style={primaryBtnStyle}
                    >
                      {submitting ? labels.sending : <T text={labels.sendButton} />}
                    </button>
                    <button type="button" onClick={() => goTo("question")} className={secondaryBtnClass} style={secondaryBtnStyle}>
                      <T text={labels.goBack} />
                    </button>
                  </div>
                </div>
              </ProposalCard>
            </motion.div>
          )}

          {flowState === "no_submitted" && (
            <motion.div key="no-sent" className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <FlowHeader
                  icon={<Heart className="h-7 w-7" style={{ color: CHAMPAGNE, fill: CHAMPAGNE }} />}
                  title={fill(copy.sent.title)}
                  script={fill(copy.sent.script)}
                  subheader={fill(copy.sent.subheader)}
                />
                <Paragraphs lines={copy.sent.body.map(fill)} className={bodyClass} />
                <div className="mt-9 space-y-6">
                  <SignOff line={fill(copy.sent.signOff)} />
                  <DividerLine className="mx-auto w-full max-w-md" />
                  <Link href="/" className={`${secondaryBtnClass} mx-auto max-w-sm`} style={secondaryBtnStyle}>
                    <T text={labels.returnButton} />
                  </Link>
                </div>
              </ProposalCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export function ProposalPage(props: ProposalPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-6" style={{ background: PAGE_BG, color: "#fff" }}>
          <p className={`${cinzel.className} text-sm uppercase tracking-[0.2em]`}>Loading invitation…</p>
        </div>
      }
    >
      <ProposalPageInner {...props} />
    </Suspense>
  )
}
