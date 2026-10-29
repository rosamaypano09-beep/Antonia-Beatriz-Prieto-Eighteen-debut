"use client"

import { fillCelebrant } from "@/lib/celebrant"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { PlainBubbles } from "@/components/loader/PlainBubbles"


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

const IVORY = "#fffaf4"
const entryEase = [0.22, 1, 0.36, 1] as const
// Photo background: each photo holds this long before crossfading to the next
const PHOTO_HOLD_MS = 6000

const titleSize = "clamp(2.85rem, 13.5vw, 6.75rem)"
const photoTitleShadow =
  "0 1px 0 rgb(255 250 244 / 28%), 0 2px 18px rgb(30 4 10 / 60%), 0 12px 36px rgb(30 4 10 / 45%)"
// Small lines over the photo: a tight, deep shadow so they read on any part of the image
const softShadow = "0 1px 2px rgb(20 2 6 / 85%), 0 2px 8px rgb(20 2 6 / 70%), 0 6px 24px rgb(20 2 6 / 55%)"
const SCRIPT_GOLD = "var(--color-welcome-gold)"

const CORNER_DECO_CLASS =
  "block h-auto w-auto max-w-[150px] sm:max-w-[230px] md:max-w-[300px] lg:max-w-[360px] select-none opacity-90"

// Plain background = the hero's circle pattern (PlainBubbles paints its own aqua base)
const plainBg = "var(--color-bg-pattern-base)"

// Text sitting directly on the circle pattern (colors: globals.css → --color-on-pattern*)
const onBg = {
  color: "var(--color-on-pattern)",
  textShadow: "0 1px 0 var(--color-on-pattern-glow), 0 2px 12px var(--color-on-pattern-glow)",
} as const

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.85, ease: entryEase } },
}

function DecoImg({ src, className }: { src: string; className: string }) {
  if (!src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} loading="lazy" decoding="async" alt="" aria-hidden="true" className={className} />
  )
}

// "!" and other symbols in Cinzel, letters in The Seasons
function SpecialCharFont({ text }: { text: string }) {
  return (
    <>
      {text.split(/([^\p{L}\s]+)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={`${cinzel.className} relative -top-[0.06em] inline-block font-normal tracking-normal`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function PlainSeeYouThere() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.seeYouThere
  const plain = content.plain
  const reduceMotion = useReducedMotion()
  const fill = (text: string) => fillCelebrant(text, siteConfig)

  return (
    <section
      id="see-you-there"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative isolate w-full overflow-hidden`}
      style={{ background: plainBg }}
    >
      {/* Same circle pattern as the hero */}
      <PlainBubbles />

      {/* Corner decorations (from site.ts) */}
      <div className="pointer-events-none absolute left-0 top-0 z-10">
        <DecoImg src={plain.decos.topLeft} className={CORNER_DECO_CLASS} />
      </div>
      <div className="pointer-events-none absolute right-0 top-0 z-10">
        <DecoImg src={plain.decos.topRight} className={CORNER_DECO_CLASS} />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 z-10">
        <DecoImg src={plain.decos.bottomLeft} className={CORNER_DECO_CLASS} />
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 z-10">
        <DecoImg src={plain.decos.bottomRight} className={CORNER_DECO_CLASS} />
      </div>

      <motion.div
        className="relative z-20 mx-auto flex min-h-[78svh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center sm:min-h-[88svh] sm:py-28"
        variants={stagger}
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {plain.eyebrow ? (
          <motion.p
            variants={rise}
            className={`${cinzel.className} text-[0.65rem] font-semibold uppercase tracking-[0.3em] sm:text-xs`}
            style={onBg}
          >
            {plain.eyebrow}
          </motion.p>
        ) : null}

        <motion.h2 variants={rise} className="relative mt-3 sm:mt-4">
          <span className="sr-only">
            {content.titleLine1} {content.titleLine2}
          </span>
          <span
            aria-hidden
            className={`${theSeasons.className} block uppercase leading-[0.88] tracking-[0.06em] sm:tracking-[0.08em]`}
            style={{ fontSize: titleSize, ...onBg }}
          >
            <SpecialCharFont text={content.titleLine1} />
            <br />
            <SpecialCharFont text={content.titleLine2} />
          </span>
        </motion.h2>

        {plain.script ? (
          <motion.p
            variants={rise}
            className={`${aboveTheBeyond.className} mt-3 text-[1.5rem] leading-tight sm:mt-4 sm:text-[2rem] md:text-[2.35rem]`}
            style={onBg}
          >
            {fill(plain.script)}
          </motion.p>
        ) : null}

        <motion.div variants={rise} className="my-5 flex items-center justify-center gap-2 sm:my-6" aria-hidden>
          <span className="h-px w-12 sm:w-20" style={{ background: "var(--color-on-pattern-line)" }} />
          <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-on-pattern-line)" }} />
          <span className="h-px w-12 sm:w-20" style={{ background: "var(--color-on-pattern-line)" }} />
        </motion.div>

        {plain.message ? (
          <motion.p
            variants={rise}
            className="font-goudy-italic mx-auto mt-4 max-w-md text-sm leading-relaxed sm:mt-5 sm:text-base"
            style={{ ...onBg, fontWeight: 600 }}
          >
            {fill(plain.message)}
          </motion.p>
        ) : null}

        {plain.decos.footerVine ? (
          <motion.div variants={rise} className="mt-7 sm:mt-9">
            <DecoImg src={plain.decos.footerVine} className="mx-auto block h-auto w-56 select-none opacity-90 sm:w-72 md:w-80" />
          </motion.div>
        ) : null}
      </motion.div>
    </section>
  )
}

// One stack of full-bleed photos that crossfade (with a slow zoom) on a shared clock
function PhotoStack({
  photos,
  activeIndex,
  alt,
  className,
  imageClassName,
  sizes,
}: {
  photos: readonly string[]
  activeIndex: number
  alt: string
  className: string
  imageClassName: string
  sizes: string
}) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {photos.map((src, i) => {
        const active = i === activeIndex % photos.length
        return (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${active ? "opacity-100" : "opacity-0"}`}
            aria-hidden={!active}
          >
            <Image
              src={encodeURI(src)}
              alt={active ? alt : ""}
              fill
              sizes={sizes}
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
              className={`object-cover transition-transform duration-[7000ms] ease-out ${active ? "scale-[1.06]" : "scale-100"} ${imageClassName}`}
            />
          </div>
        )
      })}
    </div>
  )
}

function PhotoSeeYouThere() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.seeYouThere
  const fill = (text: string) => fillCelebrant(text, siteConfig)
  const alt = fill(content.photoAlt)
  const { mobile, desktop } = content.photos
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const slideCount = Math.max(mobile.length, desktop.length)

  useEffect(() => {
    if (reduceMotion || slideCount <= 1) return
    const timer = setInterval(() => setActiveIndex((i) => (i + 1) % slideCount), PHOTO_HOLD_MS)
    return () => clearInterval(timer)
  }, [reduceMotion, slideCount])

  return (
    <section
      id="see-you-there"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative isolate w-full overflow-hidden`}
      style={{ background: "var(--color-motif-deep)" }}
    >
      <div className="relative min-h-[100svh] w-full">
        {/* Phones: portrait photos · tablets / desktops: the same set, cropped to fill */}
        {mobile.length > 0 && (
          <PhotoStack
            photos={mobile}
            activeIndex={activeIndex}
            alt={alt}
            className="md:hidden"
            imageClassName="object-[center_25%]"
            sizes="100vw"
          />
        )}
        {desktop.length > 0 && (
          <PhotoStack
            photos={desktop}
            activeIndex={activeIndex}
            alt={alt}
            className="hidden md:block"
            imageClassName="object-[center_15%]"
            sizes="100vw"
          />
        )}

        {/* Phones: the text sits low, so the bottom half deepens to wine */}
        <div
          className="pointer-events-none absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgb(30 4 10 / 35%) 0%, rgb(30 4 10 / 6%) 26%, rgb(30 4 10 / 22%) 46%, rgb(40 5 14 / 76%) 66%, rgb(26 3 9 / 93%) 100%)",
          }}
          aria-hidden
        />
        {/* Tablets / desktops: the text is centred, so darken a soft oval behind it */}
        <div
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{
            background:
              "radial-gradient(48% 42% at 50% 50%, rgb(30 4 10 / 66%) 0%, rgb(30 4 10 / 38%) 60%, transparent 100%), linear-gradient(180deg, rgb(30 4 10 / 38%) 0%, rgb(30 4 10 / 12%) 35%, rgb(30 4 10 / 12%) 65%, rgb(30 4 10 / 58%) 100%)",
          }}
          aria-hidden
        />

        <motion.div
          className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-end px-6 pb-[11svh] pt-24 text-center md:justify-center md:pb-24"
          variants={stagger}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {content.eyebrow ? (
            <motion.p
              variants={rise}
              className={`${cinzel.className} text-[0.75rem] font-bold uppercase tracking-[0.3em] sm:text-[0.8125rem]`}
              style={{ color: IVORY, textShadow: softShadow, paddingLeft: "0.3em" }}
            >
              {fill(content.eyebrow)}
            </motion.p>
          ) : null}

          <motion.h2 variants={rise} className="relative mt-3 sm:mt-4">
            <span className="sr-only">
              {content.titleLine1} {content.titleLine2}
            </span>
            <span
              aria-hidden
              className={`${theSeasons.className} block uppercase leading-[0.88] tracking-[0.06em] sm:tracking-[0.08em]`}
              style={{ fontSize: titleSize, color: IVORY, textShadow: photoTitleShadow }}
            >
              <SpecialCharFont text={content.titleLine1} />
              <br />
              <SpecialCharFont text={content.titleLine2} />
            </span>
          </motion.h2>

          {content.script ? (
            <motion.p
              variants={rise}
              className={`${aboveTheBeyond.className} mt-2 px-2 pb-1 pt-2 text-[1.9rem] leading-tight sm:mt-3 sm:text-[2.4rem] md:text-[2.75rem]`}
              style={{ color: SCRIPT_GOLD, textShadow: softShadow }}
            >
              {fill(content.script)}
            </motion.p>
          ) : null}

          {content.message ? (
            <motion.p
              variants={rise}
              className="font-goudy-italic mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed sm:mt-4 sm:text-[1.0625rem]"
              style={{ color: "#FFFFFF", textShadow: softShadow, fontWeight: 600 }}
            >
              {fill(content.message)}
            </motion.p>
          ) : null}

          {/* Slideshow position */}
          {slideCount > 1 && (
            <motion.div variants={rise} className="mt-7 flex items-center gap-1.5" aria-hidden>
              {Array.from({ length: slideCount }, (_, i) => (
                <span
                  key={i}
                  className="h-[3px] rounded-full transition-all duration-[1400ms] ease-in-out"
                  style={{
                    width: i === activeIndex ? "1.5rem" : "0.5rem",
                    background: i === activeIndex ? SCRIPT_GOLD : "rgb(255 250 244 / 45%)",
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export function SeeYouThere() {
  const siteConfig = useSiteConfig()
  const isPlain = siteConfig.loadingScreen?.display === "plain"
  return isPlain ? <PlainSeeYouThere /> : <PhotoSeeYouThere />
}
