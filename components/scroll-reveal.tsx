"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react"

const revealEase = [0.22, 1, 0.36, 1] as const

/**
 * Wraps one page section: it rises, settles from a hair smaller and fades in as it
 * scrolls into view (once). The section's own inner animations still play on top.
 * Only opacity + transform animate (no blur), so it stays smooth on phones; when the
 * reveal ends the transform is back to "none", so fixed-position modals inside work.
 */
export function RevealSection({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return <>{children}</>

  return (
    <motion.div
      initial={{ opacity: 0, y: 56, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      // Starts as the section's top edge comes up past the bottom ~10% of the screen
      viewport={{ once: true, amount: 0.04, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.05, ease: revealEase }}
      style={{ transformOrigin: "50% 0%" }}
    >
      {children}
    </motion.div>
  )
}

/** Thin gold bar along the top of the screen that fills as the invitation is scrolled. */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 })

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, color-mix(in srgb, var(--color-welcome-gold) 70%, transparent), var(--color-welcome-gold) 60%, #fff1c4)",
        boxShadow: "0 0 8px color-mix(in srgb, var(--color-welcome-gold) 70%, transparent)",
      }}
    />
  )
}
