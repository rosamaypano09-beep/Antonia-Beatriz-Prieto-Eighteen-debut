import MasonryGallery from "@/components/masonry-gallery"
import { fetchGalleryImages } from "@/lib/fetch-gallery-images"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import { siteConfig } from "@/content/site"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { RisingMotes } from "@/components/rising-motes"
import "@/components/loader/loading-screen.css"
import "@/components/sections/love-story-red.css"
import localFont from "next/font/local"
import { cinzel } from "@/lib/fonts"
import { Camera } from "lucide-react"


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

// Same red velvet vibe as the My Story section: white + gold text on a red circle pattern
const GOLD = "var(--color-welcome-gold)"
const WHITE = "#fff"
const BG = "color-mix(in srgb, var(--color-motif-deep) 70%, var(--color-coastal-deep))"
const TEXT_LIFT =
  "0 1px 2px color-mix(in srgb, var(--color-coastal-deep) 60%, transparent), 0 2px 14px color-mix(in srgb, var(--color-coastal-deep) 45%, transparent)"

const goldDividerStyle = {
  background: "linear-gradient(to right, transparent, var(--color-welcome-gold), transparent)",
} as const

const goldDividerStyleLeft = {
  background: "linear-gradient(to left, transparent, var(--color-welcome-gold), transparent)",
} as const

export const dynamic = "force-static"

function OutsideDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="h-px w-6 sm:w-10" style={goldDividerStyle} />
      <span className="h-0.5 w-0.5 rounded-full sm:h-1 sm:w-1" style={{ background: GOLD }} aria-hidden />
      <span className="h-px w-6 sm:w-10" style={goldDividerStyleLeft} />
    </div>
  )
}

function GalleryTitle({ title, script }: { title: string; script: string }) {
  return (
    <h1
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as React.CSSProperties
      }
    >
      <span className="sr-only">
        {title} — {script}
      </span>
      <span
        aria-hidden
        className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.04em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--title-size)",
          color: WHITE,
          textShadow: TEXT_LIFT,
        }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
        style={{
          fontSize: "var(--script-size)",
          color: GOLD,
          textShadow: TEXT_LIFT,
        }}
      >
        {script}
      </span>
    </h1>
  )
}

export default async function GalleryPage() {
  const { desktop, mobile } = await fetchGalleryImages()
  const copy = siteConfig.gallery
  const images = [
    ...desktop.map((image) => ({
      ...image,
      category: "desktop" as const,
      orientation: (image.width >= image.height ? "landscape" : "portrait") as "portrait" | "landscape",
    })),
    ...mobile.map((image) => ({
      ...image,
      category: "mobile" as const,
      orientation: (image.width >= image.height ? "landscape" : "portrait") as "portrait" | "landscape",
    })),
  ]

  return (
    <main
      className={`gallery-root ${theSeasons.variable} ${aboveTheBeyond.variable} relative min-h-screen overflow-x-hidden`}
      style={{ background: BG }}
    >
      {/* Red circle pattern, softly blurred, with gold dust rising behind the photos
          (colors + blur: components/sections/love-story-red.css) */}
      <PlainBubbles />
      <RisingMotes count={60} />

      <section className="relative z-20 mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="relative z-20 mb-8 px-3 text-center sm:mb-10 sm:px-4 md:mb-12">
          <div className="mx-auto mb-4 sm:mb-5 md:mb-6">
            <OutsideDivider />
          </div>
          <p
            className={`${cinzel.className} mx-auto mt-4 max-w-[20rem] px-2 text-[0.6875rem] font-semibold leading-snug tracking-[0.12em] min-[400px]:max-w-none min-[400px]:text-[0.75rem] min-[400px]:tracking-[0.16em] sm:mt-6 sm:text-[0.9375rem] sm:tracking-[0.2em] md:text-base md:tracking-[0.22em]`}
            style={{ color: GOLD, textShadow: TEXT_LIFT }}
          >
            {copy.eyebrow}
          </p>
          <div className="mx-auto mt-3 sm:mt-4 md:mt-5">
            <GalleryTitle title={copy.title} script={copy.subtitle} />
          </div>
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-xl px-2 sm:mt-5 md:mt-6 ${sectionType.textRelaxed}`}
            style={{ color: WHITE, textShadow: TEXT_LIFT }}
          >
            {copy.description}
          </p>

          <div className="mt-4 flex items-center justify-center gap-1.5 sm:mt-5">
            <span className="h-px w-8 sm:w-12 md:w-16" style={goldDividerStyle} />
            <Camera
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              style={{ color: GOLD }}
              aria-hidden
            />
            <span className="h-px w-8 sm:w-12 md:w-16" style={goldDividerStyleLeft} />
          </div>
        </div>

        {images.length > 0 ? (
          <MasonryGallery images={images} />
        ) : (
          <p
            className={`text-center font-goudy-italic ${sectionType.text}`}
            style={{ color: WHITE }}
          >
            No images to display.
          </p>
        )}
      </section>
    </main>
  )
}
