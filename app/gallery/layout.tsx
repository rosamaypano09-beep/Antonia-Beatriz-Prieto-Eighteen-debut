"use client"

import Link from "next/link"
import { useEffect } from "react"
import { cinzel } from "@/lib/fonts"


const IVORY = "#fffaf4"
const GOLD = "var(--color-welcome-gold)"
const GOLD_BORDER = "color-mix(in srgb, var(--color-welcome-gold) 38%, transparent)"
const NAV_GOLD =
  "linear-gradient(180deg, #E8D5A3 0%, #CDB072 52%, #C4A265 100%)"

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const navbar = document.querySelector("nav") as HTMLElement | null
    if (navbar) navbar.style.display = "none"
    return () => {
      if (navbar) navbar.style.display = ""
    }
  }, [])

  return (
    <div style={{ background: "color-mix(in srgb, var(--color-motif-deep) 70%, var(--color-coastal-deep))" }}>
      <div
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-motif-deep) 82%, transparent)",
          borderColor: GOLD_BORDER,
          boxShadow: "0 4px 18px color-mix(in srgb, var(--color-coastal-deep) 40%, transparent)",
        }}
      >
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-3 sm:h-14 sm:px-6 lg:px-8">
          <Link
            href="/#gallery"
            onClick={() => sessionStorage.setItem("returnFromGallery", "true")}
            className={`${cinzel.className} inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:gap-2 sm:px-4 sm:py-2 sm:text-[0.6875rem] sm:tracking-[0.2em]`}
            style={{
              background: NAV_GOLD,
              borderColor: GOLD_BORDER,
              color: IVORY,
            }}
          >
            <span aria-hidden>←</span>
            <span className="hidden xs:inline">Back to main page</span>
            <span className="xs:hidden">Back</span>
          </Link>
          <div
            className={`${cinzel.className} text-[0.625rem] font-semibold uppercase tracking-[0.24em] sm:text-[0.6875rem] sm:tracking-[0.28em]`}
            style={{ color: GOLD }}
          >
            Gallery
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
