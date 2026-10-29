"use client"

import { fillCelebrant } from "@/lib/celebrant"
import { useEffect, useRef, useState } from "react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { useAudio } from "@/contexts/audio-context"
import { Lora } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { Music2, Disc3 } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "motion/react"

interface SpotifyPlaybackUpdate {
  playingURI: string
  isPaused: boolean
  isBuffering: boolean
  duration: number
  position: number
}

interface SpotifyEmbedController {
  addListener: (
    event: "playback_update" | "playback_started" | "ready",
    callback: (event: { data: SpotifyPlaybackUpdate }) => void
  ) => void
  removeListener: (
    event: "playback_update" | "playback_started" | "ready",
    callback: (event: { data: SpotifyPlaybackUpdate }) => void
  ) => void
  destroy: () => void
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string; height?: string },
    callback: (controller: SpotifyEmbedController) => void
  ) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIframeApi) => void
  }
}

let cachedSpotifyIframeApi: SpotifyIframeApi | null = null
const spotifyApiReadyQueue: Array<(api: SpotifyIframeApi) => void> = []

function parseSpotifyUrl(spotifyUrl: string): { type: string; id: string } | null {
  const match = spotifyUrl.match(
    /open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|episode)\/([^/?]+)/
  )
  return match ? { type: match[1], id: match[2] } : null
}

function getSpotifyUri(spotifyUrl: string): string {
  const parsed = parseSpotifyUrl(spotifyUrl)
  return parsed ? `spotify:${parsed.type}:${parsed.id}` : spotifyUrl
}

// Plain embed URL — used when the IFrame API doesn't come up in time
function getSpotifyEmbedUrl(spotifyUrl: string): string | null {
  const parsed = parseSpotifyUrl(spotifyUrl)
  return parsed ? `https://open.spotify.com/embed/${parsed.type}/${parsed.id}?utm_source=generator` : null
}

// Spotify's full layout (artwork + controls / track list). In-between heights render cropped.
const PLAYER_HEIGHT = 352
// If the IFrame API hasn't produced a player by then, fall back to a plain iframe
const API_FALLBACK_MS = 5000

function loadSpotifyIframeApi(onReady: (api: SpotifyIframeApi) => void) {
  if (cachedSpotifyIframeApi) {
    onReady(cachedSpotifyIframeApi)
    return
  }

  spotifyApiReadyQueue.push(onReady)

  if (spotifyApiReadyQueue.length > 1) return

  const previousReady = window.onSpotifyIframeApiReady
  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    cachedSpotifyIframeApi = IFrameAPI
    previousReady?.(IFrameAPI)
    spotifyApiReadyQueue.splice(0).forEach((callback) => callback(IFrameAPI))
  }

  const existingScript = document.querySelector(
    'script[src="https://open.spotify.com/embed/iframe-api/v1"]'
  )
  if (!existingScript) {
    const script = document.createElement("script")
    script.src = "https://open.spotify.com/embed/iframe-api/v1"
    script.async = true
    document.body.appendChild(script)
  }
}


// Upright, screen-friendly serif for the card note (same as the My Story paragraphs)
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500"],
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

// No section background or corner decorations: the header sits straight on the page
// backdrop in white (gold for the script / eyebrow) with a soft dark lift. The playlist
// card is ivory paper with wine headings, gold accents and a crimson → wine button.
// TEAL keeps its template name but is now the wine ink used on the card.
const TEAL = "var(--color-motif-deep)"
const IVORY = "var(--color-motif-soft)"
const PAPER = "var(--color-motif-soft)"
const GOLD = "var(--color-welcome-gold)"
const GOLD_INK = "color-mix(in srgb, var(--color-welcome-gold) 78%, var(--color-motif-deep))"
const NAVY = TEAL
const BODY = "color-mix(in srgb, var(--color-welcome-text) 85%, var(--color-motif-deep))"
const ACCENT = GOLD_INK
const HAIRLINE = "color-mix(in srgb, var(--color-welcome-gold) 45%, transparent)"
const BUTTON_GRADIENT = "linear-gradient(180deg, var(--color-motif-accent) 0%, var(--color-motif-deep) 100%)"
const DISC_GRADIENT = "linear-gradient(180deg, var(--color-motif-deep) 0%, color-mix(in srgb, var(--color-motif-deep) 70%, var(--color-coastal-deep)) 100%)"

const textLift =
  "0 1px 2px color-mix(in srgb, var(--color-coastal-deep) 60%, transparent), 0 2px 14px color-mix(in srgb, var(--color-coastal-deep) 45%, transparent)"
const onBg = { color: "#fff", textShadow: textLift } as const
const onBgGold = { color: GOLD, textShadow: textLift } as const

const cardStyle = {
  background:
    "radial-gradient(120% 45% at 50% 0%, color-mix(in srgb, white 70%, transparent) 0%, transparent 60%), linear-gradient(180deg, var(--color-motif-soft) 0%, var(--color-motif-cream) 100%)",
  boxShadow:
    "0 30px 60px -28px color-mix(in srgb, var(--color-coastal-deep) 80%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--color-welcome-gold) 40%, transparent)",
} as const

const ct = {
  body: "text-sm sm:text-[0.95rem] md:text-base",
  bodyLg: "text-sm sm:text-base md:text-lg",
  btn: "text-[0.65rem] sm:text-[0.7rem] md:text-xs",
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

function DecoImg({ src, className }: { src: string; className: string }) {
  if (!src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} loading="lazy" decoding="async" alt="" aria-hidden="true" className={className} />
  )
}

// Gold hairlines + diamond above the header
function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to right, transparent, var(--color-welcome-gold))" }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: GOLD }} />
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to left, transparent, var(--color-welcome-gold))" }} />
    </div>
  )
}

// The Seasons has no clean glyphs for symbols / digits — render only those
// characters (e.g. "&", "'", "-", numbers) in Cinzel, keep letters in The Seasons.
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

function PlaylistTitle({ title, script }: { title: string; script: string }) {
  return (
    <h2
      className="relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": "clamp(1.6rem, 8.5vw, 4.2rem)",
          "--script-size": "clamp(1rem, 4.2vw, 2.25rem)",
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.85] tracking-[0.06em] min-[400px]:tracking-[0.1em] sm:tracking-[0.14em] md:tracking-[0.16em]`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        <SpecialCharFont text={title} />
      </span>
      {script ? (
        <>
          <span
            aria-hidden
            className={`${aboveTheBeyond.className} mx-auto mt-2 block w-fit max-w-full px-1 leading-[0.9] sm:mt-3`}
            style={{ fontSize: "var(--script-size)", ...onBgGold }}
          >
            {script}
          </span>
          <span className="sr-only">{script}</span>
        </>
      ) : null}
    </h2>
  )
}

export function WeddingPlaylist() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.playlist
  const { title, subtitle, spotifyUrl, decos } = content
  const fillCouple = (text: string) => fillCelebrant(text, siteConfig)
  const playlistName = fillCouple(content.playlistName)
  const reduceMotion = useReducedMotion()
  const initial = reduceMotion ? false : "hidden"
  const spotifyUri = getSpotifyUri(spotifyUrl)
  const embedUrl = getSpotifyEmbedUrl(spotifyUrl)
  // React owns this wrapper; Spotify replaces a throwaway child inside it
  const embedContainerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SpotifyEmbedController | null>(null)
  const playbackStateRef = useRef<"playing" | "paused">("paused")
  const [playerReady, setPlayerReady] = useState(false)
  // true → render a plain <iframe> instead of the IFrame API player
  const [useFallback, setUseFallback] = useState(false)
  const { pauseMusic, resumeMusic } = useAudio()

  useEffect(() => {
    const container = embedContainerRef.current
    if (!container || useFallback) return

    let mounted = true
    // Give Spotify its own mount point so replacing it never touches a React-managed node
    const mountPoint = document.createElement("div")
    container.replaceChildren(mountPoint)

    const fallbackTimer = window.setTimeout(() => {
      if (mounted && !controllerRef.current) setUseFallback(true)
    }, API_FALLBACK_MS)

    const handlePlaybackStateChange = (isPlaying: boolean) => {
      if (isPlaying && playbackStateRef.current !== "playing") {
        playbackStateRef.current = "playing"
        pauseMusic()
      } else if (!isPlaying && playbackStateRef.current === "playing") {
        playbackStateRef.current = "paused"
        resumeMusic()
      }
    }

    const initController = (IFrameAPI: SpotifyIframeApi) => {
      if (!mounted || !mountPoint.isConnected) return

      IFrameAPI.createController(
        mountPoint,
        {
          uri: spotifyUri,
          width: "100%",
          height: String(PLAYER_HEIGHT),
        },
        (EmbedController) => {
          if (!mounted) {
            EmbedController.destroy()
            return
          }

          controllerRef.current = EmbedController
          window.clearTimeout(fallbackTimer)

          const handleReady = () => {
            if (mounted) setPlayerReady(true)
          }

          const handlePlaybackUpdate = (event: { data: SpotifyPlaybackUpdate }) => {
            handlePlaybackStateChange(!event.data.isPaused)
          }

          const handlePlaybackStarted = () => {
            handlePlaybackStateChange(true)
          }

          EmbedController.addListener("ready", handleReady)
          EmbedController.addListener("playback_update", handlePlaybackUpdate)
          EmbedController.addListener("playback_started", handlePlaybackStarted)
        }
      )
    }

    loadSpotifyIframeApi(initController)

    return () => {
      mounted = false
      window.clearTimeout(fallbackTimer)
      if (playbackStateRef.current === "playing") {
        resumeMusic()
      }
      playbackStateRef.current = "paused"
      controllerRef.current?.destroy()
      controllerRef.current = null
      container.replaceChildren()
      setPlayerReady(false)
    }
  }, [pauseMusic, resumeMusic, spotifyUri, useFallback])

  return (
    <div className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full`}>
      <section
        id="playlist"
        className="relative z-10 pt-10 pb-10 sm:pt-12 sm:pb-12 md:pt-14 md:pb-14"
      >
        <div className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
          {/* Header */}
          <motion.div
            className="relative px-4 text-center sm:px-10"
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <DecoImg
              src={decos.headerOrnament}
              className="mx-auto mb-2 block h-auto w-20 select-none sm:mb-4 sm:w-36 md:w-44"
            />
            <DiamondDivider />
            {content.eyebrow ? (
              <p
                className={`${cinzel.className} mt-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] sm:mt-5 sm:text-[0.8rem] sm:tracking-[0.24em]`}
                style={onBgGold}
              >
                {content.eyebrow}
              </p>
            ) : null}
            <div className="mx-auto mt-2 sm:mt-4">
              <PlaylistTitle title={title} script={content.script} />
            </div>
            <p
              className={`font-goudy-italic ${ct.bodyLg} mx-auto mt-3 max-w-lg px-2 leading-relaxed sm:mt-5`}
              style={{ ...onBg, fontWeight: 600 }}
            >
              {subtitle}
            </p>
          </motion.div>

          {/* Playlist card — stacked on mobile, side by side on desktop */}
          <motion.div
            className="relative mt-6 overflow-hidden rounded-[1.5rem] sm:mt-8 sm:rounded-[2.25rem]"
            style={cardStyle}
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="relative z-20 grid grid-cols-1 items-center gap-5 px-4 py-6 sm:gap-6 sm:px-7 sm:py-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-10 md:px-10 md:py-10">
              {/* Info — centered stack on phones / tablets, left-aligned beside the player on desktop */}
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full sm:h-16 sm:w-16"
                  style={{
                    background: DISC_GRADIENT,
                    boxShadow: `0 0 0 4px ${PAPER}, 0 0 0 5px ${HAIRLINE}, 0 14px 28px -12px color-mix(in srgb, var(--color-coastal-deep) 60%, transparent)`,
                  }}
                  aria-hidden
                >
                  <Disc3
                    className={`h-7 w-7 sm:h-8 sm:w-8 ${reduceMotion ? "" : "animate-[spin_6s_linear_infinite]"}`}
                    style={{ color: GOLD }}
                  />
                </span>
                <div className="mt-3 min-w-0 max-w-full sm:mt-4">
                  <p
                    className={`${cinzel.className} text-[0.6rem] font-semibold uppercase tracking-[0.22em] sm:text-[0.65rem]`}
                    style={{ color: ACCENT }}
                  >
                    {content.cardEyebrow}
                  </p>
                  <h3
                    className={`${theSeasons.className} mt-1 text-lg uppercase leading-tight tracking-[0.06em] [overflow-wrap:anywhere] sm:mt-1.5 sm:text-2xl sm:tracking-[0.08em]`}
                    style={{ color: NAVY }}
                    title={playlistName}
                  >
                    <SpecialCharFont text={playlistName} />
                  </h3>
                </div>
                {content.cardNote ? (
                  <p
                    className={`${lora.className} mt-2 max-w-sm text-[0.85rem] font-medium leading-relaxed sm:mt-3 sm:text-[0.92rem] md:text-[0.95rem]`}
                    style={{ color: BODY }}
                  >
                    {content.cardNote}
                  </p>
                ) : null}
                <span
                  aria-hidden
                  className="my-5 hidden h-px w-24 md:block"
                  style={{ background: "linear-gradient(to right, var(--color-welcome-gold), transparent)" }}
                />
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cinzel.className} mt-0 hidden items-center justify-center gap-2 rounded-full border px-7 py-3 font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-welcome-gold)] md:inline-flex ${ct.btn}`}
                  style={{
                    background: BUTTON_GRADIENT,
                    borderColor: "color-mix(in srgb, var(--color-welcome-gold) 65%, transparent)",
                    color: "#fff",
                    boxShadow: "0 12px 24px -12px color-mix(in srgb, var(--color-coastal-deep) 65%, transparent)",
                  }}
                >
                  <Music2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {content.buttonText}
                </a>
              </div>

              {/* Spotify player */}
              <div
                className="relative w-full overflow-hidden rounded-[14px] p-1 sm:rounded-2xl sm:p-2"
                style={{ background: IVORY, boxShadow: `0 0 0 1px ${HAIRLINE}, 0 18px 36px -24px color-mix(in srgb, var(--color-coastal-deep) 60%, transparent)` }}
              >
                {useFallback && embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={`${playlistName} — Spotify`}
                    width="100%"
                    height={PLAYER_HEIGHT}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="block w-full rounded-[12px] border-0"
                    style={{ height: PLAYER_HEIGHT }}
                    onLoad={() => setPlayerReady(true)}
                  />
                ) : (
                  <div
                    ref={embedContainerRef}
                    title={`${playlistName} — Spotify`}
                    aria-label={`${playlistName} — Spotify`}
                    className="w-full overflow-hidden rounded-[12px] [&_iframe]:block [&_iframe]:w-full [&_iframe]:border-0"
                    style={{ height: PLAYER_HEIGHT, background: "color-mix(in srgb, var(--color-motif-blush) 18%, transparent)" }}
                  />
                )}
                {/* Placeholder while the Spotify embed loads */}
                {!playerReady && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-1 flex flex-col items-center justify-center gap-3 rounded-[12px] sm:inset-2"
                    style={{ background: "color-mix(in srgb, var(--color-motif-blush) 22%, var(--color-motif-soft))" }}
                  >
                    <Disc3
                      className={`h-9 w-9 opacity-60 ${reduceMotion ? "" : "animate-[spin_3s_linear_infinite]"}`}
                      style={{ color: TEAL }}
                    />
                    <span
                      className={`${cinzel.className} text-[0.6rem] font-semibold uppercase tracking-[0.22em] opacity-70`}
                      style={{ color: TEAL }}
                    >
                      Loading song
                    </span>
                  </div>
                )}
              </div>

              {/* Phone: compact full-width button under the player */}
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cinzel.className} mx-auto inline-flex min-h-11 w-full max-w-sm items-center justify-center gap-2 rounded-full py-3 font-semibold uppercase tracking-[0.18em] transition-all active:scale-[0.98] md:hidden ${ct.btn}`}
                style={{
                  background: BUTTON_GRADIENT,
                  color: "#fff",
                  boxShadow: "0 10px 20px -12px color-mix(in srgb, var(--color-coastal-deep) 65%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--color-welcome-gold) 55%, transparent)",
                }}
              >
                <Music2 className="h-3.5 w-3.5" />
                {content.buttonText}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
