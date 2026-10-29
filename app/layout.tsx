import type React from "react"
import type { Metadata, Viewport } from "next"
import { Great_Vibes, Inter, Imperial_Script } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { siteConfig, canonicalSiteUrl } from "@/content/site"
import { ClientLayout } from "@/components/client-layout"
import { LOADING_BG_PHOTOS } from "@/lib/loading-bg-photos"
import { anastasiaScript, cinzel } from "@/lib/fonts"

const canonicalUrl = canonicalSiteUrl
// One absolute https URL for the share image — Messenger ignores relative / mismatched ones
const OG_IMAGE_URL = `${canonicalUrl}${siteConfig.linkPreviewImage}`
const OG_IMAGE_SIZE = siteConfig.linkPreviewImageSize

const celebrant = siteConfig.celebrant.nickname
const hashtag = siteConfig.snapShare.hashtag[0] ?? `#${celebrant}Turns18`
const eventTitle = `${celebrant}'s Debut - ${siteConfig.event.theme}`
const eventDescription = `Celebrate ${celebrant}'s 18th birthday debut on ${siteConfig.wedding.date} at ${siteConfig.ceremony.location}. ${siteConfig.event.theme} — RSVP, see the program, dress code, and everything you need for the night.`

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: `${celebrant}'s Debut`,
  startDate: "2026-11-22T17:00:00+08:00", // ⚠ check — keep in step with EVENT_DATE + guest arrival in content/site.ts
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: siteConfig.ceremony.location,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.ceremony.venue,
      addressRegion: "Metro Manila",
      addressCountry: "PH",
    },
  },
  image: [OG_IMAGE_URL],
  description: eventDescription,
  organizer: {
    "@type": "Person",
    name: celebrant,
  },
  eventHashtag: hashtag,
}

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-serif" })
const imperialScript = Imperial_Script({ subsets: ["latin"], weight: "400", variable: "--font-imperial-script" })
const brittany = localFont({
  src: "../Font/brittany-signature-script/BrittanySignatureScript.ttf",
  variable: "--font-brittany",
  display: "swap",
})

const playlistScript = localFont({
  src: "../Font/playlist-script/Playlist Script.otf",
  variable: "--font-playlist-script",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl),
  title: {
    default: eventTitle,
    template: `%s | ${celebrant}'s Debut`,
  },
  description: eventDescription,
  keywords:
    `${celebrant} debut, ${celebrant} 18th birthday, debut invitation, ${siteConfig.ceremony.location}, 18 roses, RSVP, ${hashtag}`,
  applicationName: `${celebrant}'s Debut`,
  authors: [{ name: celebrant }],
  creator: celebrant,
  publisher: celebrant,
  category: "Event",
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  alternates: {
    canonical: canonicalUrl,
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon_io/favicon.ico",
    apple: "/favicon_io/apple-touch-icon.png",
    other: [
      { rel: "android-chrome-192x192", url: "/favicon_io/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/favicon_io/android-chrome-512x512.png" },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
  openGraph: {
    title: `${celebrant}'s Debut | ${siteConfig.wedding.date}`,
    description: eventDescription,
    url: `${canonicalUrl}/`,
    siteName: `${celebrant}'s Debut`,
    locale: "en_PH",
    type: "website",
    images: [
      {
        url: OG_IMAGE_URL,
        secureUrl: OG_IMAGE_URL,
        width: OG_IMAGE_SIZE.width,
        height: OG_IMAGE_SIZE.height,
        type: OG_IMAGE_SIZE.type,
        alt: `${celebrant}'s Debut Invitation - ${siteConfig.wedding.date}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${celebrant}'s Debut Invitation`,
    description: `You're invited to ${celebrant}'s debut on ${siteConfig.wedding.date}. RSVP and get all the details for the night! ${hashtag}`,
    images: [OG_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    title: `${celebrant}'s Debut`,
    statusBarStyle: "default",
    capable: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#0E0B0C", // --color-coastal-deep (meta tags need a literal color)
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#0E0B0C" />
        <meta name="format-detection" content="telephone=yes,email=no,address=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Lavishly+Yours&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Style+Script&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap" rel="stylesheet" />
        <link
          rel="preload"
          href="/fonts/AnastasiaScript.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {LOADING_BG_PHOTOS.slice(0, 3).map((href, index) => (
          <link
            key={href}
            rel="preload"
            as="image"
            href={href}
            type="image/webp"
            {...(index === 0 ? { fetchPriority: "high" as const } : {})}
          />
        ))}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body
        className={`${inter.variable} ${greatVibes.variable} ${imperialScript.variable} ${cinzel.variable} ${brittany.variable} ${playlistScript.variable} ${anastasiaScript.variable} font-inter antialiased text-foreground`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  )
}