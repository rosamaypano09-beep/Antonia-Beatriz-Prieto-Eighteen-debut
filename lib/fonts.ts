import localFont from "next/font/local"

/**
 * Couple-name script from public/fonts/AnastasiaScript.ttf
 * (AnastasiaScript Regular.ttf is the same face).
 */
export const anastasiaScript = localFont({
  src: "../Font/AnastasiaScript.ttf",
  display: "swap",
  preload: true,
  variable: "--font-anastasia-script",
  weight: "400",
  style: "normal",
  adjustFontFallback: false,
})

/**
 * Cinzel from Font/cinzel (static OTFs: 400 / 700 / 900).
 * Requested 500 renders as 400 and 600 as 700.
 */
export const cinzel = localFont({
  src: [
    { path: "../Font/cinzel/Cinzel-Regular.otf", weight: "400", style: "normal" },
    { path: "../Font/cinzel/Cinzel-Bold.otf", weight: "700", style: "normal" },
    { path: "../Font/cinzel/Cinzel-Black.otf", weight: "900", style: "normal" },
  ],
  display: "swap",
  variable: "--font-cinzel",
  fallback: ["Georgia", "serif"],
})
