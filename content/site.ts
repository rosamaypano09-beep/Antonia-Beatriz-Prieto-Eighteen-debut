import {
  proposalRoleDefinitions,
  proposalRoleIdAliases,
} from "@/content/proposal-roles"

export type TimelineIconName =
  | "arrival"
  | "rings"
  | "departure"
  | "cocktail"
  | "fireworks"
  | "dance"
  // Debut program icons
  | "sun"
  | "moon"
  | "crown"
  | "rose"
  | "gift"
  | "toast"
  | "candle"
  | "music"
  | "video"
  | "dinner"

export type AttireGroupId = "sponsors" | "entourage" | "guests"
// A palette color: "#9CAF88" or { name: "Sage", hex: "#9CAF88" }
export type AttireColor = string | { name: string; hex: string }

/* ============================================================================
   SOP — CREATING / UPDATING A DEBUT INVITATION
   ----------------------------------------------------------------------------
   This file is the single source of truth for the celebrant's content. Pages,
   metadata (link previews), robots.txt, sitemap.xml, QR codes, the table
   finder and proposal pages all read from here. Avoid hard-coding the
   celebrant's name, dates, URLs or image paths in components — add them here.

   Colors live in app/globals.css (→ "MOTIF COLORS — DEBUT"), not here.

   NEW INVITATION — work top to bottom:
     1. CELEBRANT       name + nickname + age ({celebrant} in any text → nickname)
     2. DATE & TIMES    debut date, day, guest arrival / program / end times
     3. VENUE           name, address, Google Maps link, photos;
                        VENUE_CARDS = labels on the Event Details venue card
     4. RSVP            deadline, coordinator, phone; HASHTAGS
     5. WEBSITE         SITE_URL = the live domain (keep the trailing "/").
                        LINK_PREVIEW_IMAGE = 1200×630 JPG for Facebook/Messenger.
                        NEXT_PUBLIC_SITE_URL (env, e.g. on Vercel) overrides SITE_URL.
     6. LOOK & FEEL     DISPLAY_MODE "plain" or "photos"
     7. SHARED IMAGES   monogram, name lettering, wax seal, theme song, CELEBRANT_PHOTOS
     8. googleAPI       new Apps Script / Form URLs for THIS celebrant's sheet —
                        never reuse a previous client's (guests would mix).
     9. SECTIONS        program flow, attire, reminders, FAQ, gift guide,
                        theme song, snap & share, socials.
    10. Search for "⚠ check" and replace anything still left over.

   BEFORE GOING LIVE:
     • Put every referenced file in /public (paths are case-sensitive on Vercel).
     • Run `npm run build` to catch typos.
     • Paste the live URL in https://developers.facebook.com/tools/debug/ and
       click "Scrape Again" so Facebook picks up the new title + preview image.
     • Test RSVP search, a test RSVP submission, messages and /table on mobile.

   CONVENTIONS:
     • Image paths start with "/" and are relative to /public.
     • "" on a decoration/image hides it; show: false hides a card/account/link.
     • Placeholders like {celebrant}, {name}, {deadline} are filled automatically —
       keep the braces when editing text.
     • ⚠ marks values that still need the client's confirmation.
   ============================================================================ */

/* ============================================================================
   QUICK SETUP — edit these first.
   Every section below reads from here, so one change updates the whole site
   (loader, envelope, hero, details, program, RSVP, FAQ, footer, …).
   ============================================================================ */

// ── The celebrant ───────────────────────────────────────────────────────────
const CELEBRANT = {
  fullName: "Antonia Beatriz Prieto", // Add surname only if provided
  nickname: "Bea", // Used everywhere as {celebrant}
  age: "18",
  ageWords: "Eighteen",
  title: "Debutante",
}

// ── Event details (from the client brief) ───────────────────────────────────
const EVENT = {
  type: "18th Birthday",
  theme: "An Evening of Roses & Gold",
  motif: "Red Roses, Black Elegance, Champagne Gold Accents",
  colors: "Luxury Red, Deep Black, Champagne Gold, Soft Ivory",
  themeSong: {
    title: "", // Add the celebrant's chosen theme song
    artist: "",
  },
}

// ── Date & times ────────────────────────────────────────────────────────────
const EVENT_DATE = "November 22, 2026"
const EVENT_DAY = "Sunday"

const TIMES = {
  guestArrival: "5:00 PM", // Call time
  program: "5:30 PM", // Program proper — countdown target
  end: "", // Add confirmed event end time
}

// ── Venue ───────────────────────────────────────────────────────────────────
const VENUE = {
  name: "Venue To Follow", // ⚠ check — replace once the family confirms the venue
  address: "Location details to follow",
  map: "", // Google Maps pin (directions button + QR); "" hides the map QR and buttons
  // Step-by-step directions (FAQ) — add once the venue is confirmed
  directions: [] as string[],
  landmarks: [] as string[],
  // Add confirmed venue photos when available ([] shows the gold monogram panel)
  photos: [] as string[],
}
const CEREMONY_VENUE = VENUE
const RECEPTION_VENUE = VENUE

// ── Venue card (Event Details section) ──────────────────────────────────────
// layout:
//   "combined" = ONE card (use this for a debut — single venue)
//   "separate" = two cards (CEREMONY_VENUE + RECEPTION_VENUE)
// badge        = small pill on the photo
// sectionLabel = label above the venue name
// showDate     = show the big Month / Day / Year
// showArrival  = show "Arrival: <guest arrival time>" (otherwise "At <time>")
const VENUE_CARDS = {
  layout: "combined" as "separate" | "combined",
  combined: {
    badge: "The Debut",
    sectionLabel: "Venue",
    showDate: true,
    showArrival: true,
    // Time rows on the card, e.g. "Doors 7:00 PM | Program 7:30 PM"
    ceremonyLabel: "Program",
    receptionLabel: "Until",
    // true = also show the end time on the card
    showReceptionTime: true,
  },
  ceremony: {
    show: true,
    badge: "Program",
    sectionLabel: "Venue",
    showDate: true,
    showArrival: true,
  },
  reception: {
    show: false,
    badge: "After Glow",
    sectionLabel: "Venue",
    showDate: false,
    showArrival: false,
  },
}

// ── RSVP & contact ──────────────────────────────────────────────────────────
const RSVP = {
  deadline: "", // Add confirmed RSVP deadline
  coordinator: "Bea's Family",
  phone: "0942 569 3287", // ⚠ check — carried over from the previous invitation
  alternatePhone: "0924 136 4683", // ⚠ check — carried over from the previous invitation
}

const HASHTAGS = [
  "#BeaTurns18", // ⚠ check — confirm with the family
  "#BeautifullyBea18",
]
// ── Attire guide (Event Details → Attire Guidelines) ────────────────────────
// SHOW = which cards to display AND their order, top to bottom. Examples:
//   ["guests"]                            guests only
//   ["entourage", "guests"]               entourage (18 Roses etc.) + guests
//   []                                    hide the whole attire guide
// Each card: fill in only what you need — anything left "" or [] is hidden.
//   image:     illustration path in /public ("" = no image)
//   palette:   colors for this card — "#9CAF88" or { name: "Sage", hex: "#9CAF88" }
//   ladies / gentlemen:
//     label:     e.g. "Ladies", "Gentlemen" — leave "" to hide the heading (good for one inclusive blurb)
//     details:   the dress code text ("" hides this half of the card)
//     highlight: phrase inside details shown bold + underlined ("" for none)
// Dress code: the evening's colors — burgundy, red, black, and gold (DRESS_PALETTE)

// Dress code colors, sampled from public/Details/attire.png — the attire card shows
// them with names, the Dress Code reminder shows the same strip without names
const DRESS_PALETTE: AttireColor[] = [
  { name: "Burgundy", hex: "#6A1420" }, // the suits
  { name: "Red", hex: "#961B22" }, // the gowns + roses
  { name: "Black", hex: "#2B2526" }, // shirts, ties, shoes (warm black)
  { name: "Gold", hex: "#C6A15B" }, // accents
]

const ATTIRE = {
  show: ["guests"] as AttireGroupId[], // one dress code for everyone

  sponsors: {
    title: "Family & Principal Sponsors",
    image: "",
    palette: [],
    ladies: {
      label: "Ladies",
      details:
        "Elegant formal gowns or cocktail dresses in burgundy, red, black, or gold.",
      highlight: "Formal Gowns",
    },
    gentlemen: {
      label: "Gentlemen",
      details:
        "Formal black suits, tuxedos, or elegant barong with tailored slacks, with touches of burgundy, red, or gold.",
      highlight: "Formal Black Suits",
    },
  },

  entourage: {
    title: "18 Roses · Treasures · Cheers",
    image: "",
    palette: [],
    ladies: {
      label: "Ladies",
      details:
        "Elegant formal gowns or cocktail dresses in burgundy, red, black, or gold. Choose a polished, formal look.",
      highlight: "Formal Gowns",
    },
    gentlemen: {
      label: "Gentlemen",
      details:
        "Black suits, tuxedos, or black long-sleeved dress shirts with tailored slacks. Keep your look formal and refined.",
      highlight: "Formal Attire",
    },
  },

  guests: {
    title: "", // no heading — this dress code is for everyone
    image: "/Details/attire.png",
    palette: DRESS_PALETTE,
    // One inclusive blurb (no Ladies / Gentlemen headings); \n starts a new line
    ladies: {
      label: "",
      details:
        "Come in your most elegant best — formal or semi-formal, whatever makes you feel wonderful.\n\n" +
        "Please dress in the colors of the evening: burgundy, red, black, or gold.",
      highlight: "burgundy, red, black, or gold",
    },
    gentlemen: {
      label: "",
      details: "",
      highlight: "",
    },
  },
}

// ── Website address (used for QR codes, link previews, table finder) ────────
// NEXT_PUBLIC_SITE_URL (env) overrides this when set.
const SITE_URL = "https://basha-debut-invitation.weddinginvitationrsvp.com/" // ⚠ check — still the previous client's domain
// Image shown when the link is shared (Facebook, Messenger, Viber, X, …).
// Messenger is strict: use a JPG exactly 1200×630, under ~300 KB. When you replace it,
// change the file name (or bump ?v=) so Facebook fetches the new one instead of its cache.
const LINK_PREVIEW_IMAGE = "/Details/LinkPreview.jpg?v=2"
const LINK_PREVIEW_IMAGE_SIZE = { width: 1200, height: 630, type: "image/jpeg" }

// Site address with env override applied and no trailing slash — no need to edit
export const canonicalSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/$/, "")
// A leftover NEXT_PUBLIC_SITE_URL from another client's project makes every link preview
// point at the wrong site (Messenger follows og:url) — flag it in the build log.
if (canonicalSiteUrl !== SITE_URL.replace(/\/$/, "")) {
  console.warn(
    `[site] NEXT_PUBLIC_SITE_URL (${canonicalSiteUrl}) differs from SITE_URL (${SITE_URL}). ` +
      "Link previews, QR codes and canonical URLs will use the env value.",
  )
}

// ── Look & feel ─────────────────────────────────────────────────────────────
// "plain"  = no photos anywhere: pearl pattern backgrounds, gold ornaments,
//            hides photo-only blocks (best until the debut photos arrive)
// "photos" = celebrant photos on the loader, envelope, hero, messages,
//            reminders, snap & share and the closing section
const DISPLAY_MODE = "photos" as "photos" | "plain"

// ── Shared images ───────────────────────────────────────────────────────────
const BRAND = {
  monogram: "/monogram/new-monogram.png", // botanical "B" (tinted per section)
  // Name lettering image (loader, envelope, proposals). "" = name in script text
  nameImage: "",
  seal: "/monogram/newseal.png", // envelope wax seal
  // Theme song — drop the MP3 into /public/background_music with this exact name
  backgroundMusic: "/background_music/Kylie Minogue - Lights Camera Action (Official Video).mp3", // ⚠ check — file not added yet
}

// Celebrant photos used in "photos" mode (loader, envelope, hero, reminders,
// snap & share, closing) — Bea's debut shoot in /public/mobile-background.
// The /gallery page reads every file in /public/mobile-background and /public/desktop-background.
const CELEBRANT_PHOTOS = Array.from(
  { length: 4 }, // ⚠ check — raise this as more of Bea's photos are added
  (_, i) => `/mobile-background/debut (${i + 1}).jpg`,
)
// Favorites picked for specific spots (index = file number − 1)
const PHOTO = (n: number) => CELEBRANT_PHOTOS[n - 1]

// ── Decorations ─────────────────────────────────────────────────────────────
// The botanical PNGs are tinted antique gold by --deco-filter in app/globals.css.
// Change a path here to swap it on every section at once.
// To change ONE section only, override it there, e.g. decos: { ...SECTION_DECOS, footerVine: "" }
const DECOR = {
  cornerTopLeft: "/deco/top-left-deco.png",
  cornerTopRight: "/deco/top-right-deco.png",
  cornerBottomLeft: "/deco/bottom-left-deco.png",
  cornerBottomRight: "/deco/bottom-right-deco.png",
  headerOrnament: "/deco/lovestorydeco/Elegant-Eucalyptus-centerdot.png", // small sprig above titles
  footerVine: "/deco/lovestorydeco/Elegant-Eucalyptus-bottom.png", // long vine at section ends
  sideLeft: "/deco/lovestorydeco/Elegant-Eucalyptus-Left.png", // side sprigs
  sideRight: "/deco/lovestorydeco/Elegant-Eucalyptus-Right.png",
}

// The four corners as one set
const CORNER_DECOS = {
  topLeft: DECOR.cornerTopLeft,
  topRight: DECOR.cornerTopRight,
  bottomLeft: DECOR.cornerBottomLeft,
  bottomRight: DECOR.cornerBottomRight,
}

// Default decoration set used by most sections (corners + ornament + vine)
const SECTION_DECOS = {
  ...CORNER_DECOS,
  headerOrnament: DECOR.headerOrnament,
  footerVine: DECOR.footerVine,
}

/* ============================================================================
   SECTIONS — wording and per-section options. Values above are referenced here.
   ============================================================================ */

// Principal sponsors Google Apps Script — used by the main page and /inviteone
// ⚠ check — every googleAPI URL below still points to the template's sheets.
const SPONSORS_API = "https://script.google.com/macros/s/AKfycbzo96CZ3_PXZ9xm8_KLx5I_O14-2x44mVD6fpjKAmXuW76q8knjy7voB2KyXa42KbI2Vw/exec"

export const siteConfig = {
  siteUrl: SITE_URL,
  linkPreviewImage: LINK_PREVIEW_IMAGE,
  linkPreviewImageSize: LINK_PREVIEW_IMAGE_SIZE,
  // The celebrant — read by every section. {celebrant} in any text → nickname.
  celebrant: {
    ...CELEBRANT,
    monogram: BRAND.monogram,
  },
  event: EVENT,
  // Navbar links (components/navbar.tsx) — same order as the sections on the page.
  // wideOnly: shown in the desktop bar only on extra-wide screens (always in the phone menu).
  nav: {
    links: [
      { href: "#home", label: "Home" },
      { href: "#welcome", label: "Welcome", wideOnly: true },
      { href: "#love-story", label: "My Note" },
      { href: "#countdown", label: "Countdown", wideOnly: true },
      { href: "#gallery", label: "Gallery" },
      { href: "#messages", label: "Messages" },
      { href: "#details", label: "Details" },
      { href: "#wedding-timeline", label: "Program" },
      { href: "#entourage", label: "Entourage" },
      { href: "#guest-list", label: "RSVP" },
      { href: "#guests", label: "Guests" },
      { href: "#faq", label: "FAQ" },
      { href: "#registry", label: "Gifts" },
      { href: "#playlist", label: "Theme Song" },
      { href: "#snap-share", label: "Snap & Share" },
      { href: "#see-you-there", label: "See You There", wideOnly: true },
    ] as { href: string; label: string; wideOnly?: boolean }[],
  },
  // Legacy shape kept for the dashboard / Google Sheet merge — mirrors the celebrant.
  couple: {
    bride: CELEBRANT.fullName,
    brideNickname: CELEBRANT.nickname,
    groom: "",
    groomNickname: "",
    monogram: BRAND.monogram,
    backgroundMusic: BRAND.backgroundMusic,
  },
  googleAPI:{
    messageForm: "https://docs.google.com/forms/d/e/1FAIpQLScLB7r_-OfWdCFBxw2vblcCZGbzAMc8B7wkG9SljaOVp9XuYQ/formResponse", // ⚠ check
    message: "https://script.google.com/macros/s/AKfycbzKnD53EvOpAu-MqB3z13bgYDryUTalkIglLzYQzSNunDsxKiroXrcn2Dz7dz5TWwvrKg/exec", // ⚠ check
    guestList: "https://script.google.com/macros/s/AKfycbyki1HG1XVHCIkE9Q0nQcfdEq7DQyQmjBvSQyiTWcLi2Wce4uN6D1D6Z2HifjDwD3MUWA/exec", // ⚠ check
    guestRequest: "https://script.google.com/macros/s/AKfycbyJ7uy-6GqUpSPmkGVNuFCjeiGzgenAknkVpxfCzg3-W3DsQ97GoOjAlqWgQPq3EOoKlw/exec", // ⚠ check
    entourage: "https://script.google.com/macros/s/AKfycbxYLmro6-Gu9YF7BItT4OmXIE0RjGU4UedKREl4bIvQu24jsJ9K7SSSQGDx-CbNBiR4_Q/exec", // ⚠ check
    sponsors: SPONSORS_API,
    // Principal sponsors shown on /inviteone and /invitetwo (entourage section)
    sponsorsInviteOne: SPONSORS_API,
    sponsorsInviteTwo: "https://script.google.com/macros/s/AKfycbzo96CZ3_PXZ9xm8_KLx5I_O14-2x44mVD6fpjKAmXuW76q8knjy7voB2KyXa42KbI2Vw/exec",
    googleShare: "https://docs.google.com/spreadsheets/d/1XFuCKtVvN4qXNIevVbghCZd1Xb-Iiah0yXHH1OHqYug/edit?usp=sharing", // ⚠ check
    videoMessageForm:
      "https://docs.google.com/forms/d/e/1FAIpQLSfeGlEl4CMXWefdvCw6AOPHFS1ROku_rs-Gbofa2LkVJ0sLGQ/viewform",
  },
  wedding: {
    date: EVENT_DATE,
    time: TIMES.program,
    venue: VENUE.name,
    tagline: `is turning ${CELEBRANT.age}`,
    theme: EVENT.theme,
    motif: EVENT.colors,
  },
  // Top hero on the main page (components/sections/hero.tsx)
  hero: {
    srTitle: "You're invited to the debut of {celebrant} — Antonia Beatriz Prieto turns eighteen",
    kicker: "You are invited to the debut of", // Small line above the name ("" hides it)
    titleMain: "{celebrant}", // Nickname in large gold script
    eyebrow: CELEBRANT.fullName, // Full name in caps under the nickname ("" hides it)
    titleScript: "turns eighteen", // Script line above the date ("" hides it)
    countdownHeading: "Until {celebrant}'s grand entrance",
    countdownLabels: {
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
    },
  },
  // Welcome letter (components/sections/welcome.tsx)
  welcome: {
    title: "Welcome",
    script: "to my eighteenth",
    paragraphs: [
      "Dear family and friends — eighteen years ago, my story began in your arms. Now I am stepping into a brand-new chapter, and there is no one I would rather have beside me than you.",
      "Inside this invitation you will find everything for the evening: the program, the venue, the dress code, and a few gentle reminders. Come in your elegant best — in burgundy, red, black, or gold — and bring your warmest smile for a night of roses, candlelight, and music.",
      "Thank you for every lesson, every laugh, and every prayer that carried me here. Sharing this night with the people who shaped me is the most beautiful gift I could ask for.",
    ],
    signOff: "With all my love and gratitude,",
    signature: "{celebrant}",
  },
  // Opening "Save the Date" loading screen (components/loader/LoadingScreen.tsx).
  // Styled like a red-velvet soirée poster: celebrant name as the big serif title,
  // pearls + gold details, a two-column "highlights" row and a three-column details row.
  loadingScreen: {
    // "photos" = sliding photo background + photo date cards
    // "plain"  = no photos: red velvet backdrop with pearls + engraved date
    display: DISPLAY_MODE,
    // Debut poster (red velvet + gold). {celebrant} → nickname; "" hides a line.
    // Date / time / venue in the details row come from ceremony.
    gala: {
      photo: "/Details/debutant.png", // cut-out portrait (transparent background)
      eyebrow: "You are cordially invited to the debut of",
      cardEyebrow: "You're Invited", // top line on the paper card inside the envelope
      // Invitation line on the paper card, above the name ("" hides it)
      cardLine: "Her family joyfully invites you to celebrate the debut of",
      title: "{celebrant}", // nickname in gold script
      subtitle: CELEBRANT.fullName, // full name in caps beneath
      taglineLeft: ["Eighteen years", "of love.", "One night", "to remember."],
      taglineRight: ["Faith", "Family", "Friends", "Forever."],
      kicker: "Celebrating her",
      // Ghost lettering that drifts down the left edge and up the right ([] hides it)
      ghostText: ["{celebrant}", CELEBRANT.fullName, "Eighteen"],
      occasionNumber: CELEBRANT.age,
      occasionSuffix: "th",
      occasion: "Birthday",
    },
    // Colors used when display is "plain"
    plainTheme: {
      background: "var(--color-welcome-bg)",
      text: "var(--color-welcome-text)",
      accent: "var(--color-welcome-gold)",
    },
    // Sliding background photos (display: "photos"); files live in /public
    backgroundPhotos: CELEBRANT_PHOTOS,
    // Poster corners: small caps at the very top (left sits beside the monogram). "" hides one.
    topLeft: "The Debut",
    topRight: VENUE.name,
    headline: "Save the Date",
    // {days} is replaced with the number of days left before the debut
    countdownText: "{days} nights until the eighteenth",
    countdownOneDayText: "One night until the eighteenth",
    countdownTodayText: "Tonight, she turns eighteen",
    countdownPastText: "Thank you for celebrating her eighteenth",
    coupleNameImage: BRAND.nameImage,
    // Polaroids that rise out of the envelope: [left, right, then extra desktop spots]
    photos: [
      "/mobile-background/debut (38).webp", // left
      "/mobile-background/debut (24).webp", // right
      PHOTO(6),
      PHOTO(10),
    ],
    dateLabels: ["Month", "Day", "Year"],
    // Wording around the celebrant's name (both modes; "" to hide a line)
    plainInvite: {
      ornament: DECOR.headerOrnament, // sprig on the envelope letter ("" = none)
      lineAbove: "With love and joy, you are invited to celebrate the debut of",
      lineBelow: "",
    },
    // Two numbered highlights, like a poster's "01 / 02" offers ([] hides the row)
    highlights: [
      { label: "Dress Code", text: "Burgundy, red, black & gold" },
      { label: "The Night", text: "Roses, candlelight & gold" },
    ],
    // Bottom details row — {guestsTime}, {programTime}, {endTime}, {venue} are filled in
    showCeremonyDetails: true,
    details: [
      { label: "Doors", value: "{guestsTime}" },
      { label: "Venue", value: "{venue}" },
      { label: "Until", value: "{endTime}" },
    ],
    // Used by the envelope (components/loader/Hero.tsx)
    eyebrow: "You are invited",
    message: "An evening of roses, gold & gratitude",
    // Rotates under the progress bar while the invitation loads
    statusMessages: [
      "Arranging eighteen roses",
      "Lighting eighteen candles",
      "Setting the tables",
      "Saving your seat",
    ],
    durationMs: 8000, // minimum — longer only if the files are still loading
    // Invitation envelope (components/loader/Hero.tsx) — shares display + photos with loader above
    hintText: "Tap the Seal to Open",
    enterButtonText: "View the Invitation",
    sealImage: BRAND.seal,
    cornerDecos: { ...CORNER_DECOS },
  },
  // Letters section (components/sections/love-story.tsx + StorySection)
  // Plain mode shows each note as a card; photos mode adds the chapter image.
  loveStory: {
    title: "My Story",
    subtitle: "four chapters, eighteen years",
    // Word before each card's number, e.g. "Chapter 01"
    chapterLabel: "Chapter",
    closingQuote:
      "For I know the plans I have for you, plans to give you hope and a future.",
    closingCitation: "Jeremiah 29:11",
    eucalyptusDecos: {
      topLeft: DECOR.sideLeft,
      bottomRight: DECOR.sideRight,
      timelineTop: DECOR.headerOrnament,
      sectionBottom: DECOR.footerVine,
    },
    // Four chapters, one per photo (PHOTO(n) = public/mobile-background/debut (n).jpg).
    // Keep each to one or two short paragraphs so the cards stay light on phones.
    chapters: [
      {
        // 1 — the beginning
        title: "Where It All Began",
        theme: "light" as const,
        layout: "image-left" as const,
        image: PHOTO(1),
        paragraphs: [
          "Eighteen years ago, a little girl arrived and was named Antonia Beatriz — though to everyone who loves her, she has always simply been Bea.",
          "Every story worth telling begins with love, and mine began in the arms of the family who has carried me ever since.",
        ],
      },
      {
        // 2 — growing up
        title: "Growing Up, Little by Little",
        theme: "dark" as const,
        layout: "image-right" as const,
        image: PHOTO(2),
        paragraphs: [
          "First steps and first days of school, scraped knees and late-night homework, big questions and even bigger dreams.",
          "Through every stage, you taught me to be kind, to keep going, and to laugh at the little things along the way.",
        ],
      },
      {
        // 3 — the people
        title: "The People Who Shaped Me",
        theme: "light" as const,
        layout: "image-left" as const,
        image: PHOTO(3),
        paragraphs: [
          "To my family, thank you for the quiet sacrifices and the love that never ran out. To my friends, thank you for turning ordinary days into my favorite memories.",
          "And to God, who has been faithful in every season — every prayer whispered for me has brought me here.",
        ],
      },
      {
        // 4 — tonight
        title: "A New Chapter Begins",
        theme: "dark" as const,
        layout: "image-right" as const,
        image: PHOTO(4),
        paragraphs: [
          "Now I step into eighteen with a grateful heart, and there is no one I would rather celebrate with than you.",
          "Come raise a toast, share a dance, and help me begin this new chapter surrounded by love.",
          "With all my love, {celebrant}",
        ],
      },
    ],
  },
  // Gallery section (components/sections/gallery.tsx — not on the main page by default)
  gallery: {
    eyebrow: "My Moments",
    title: "Gallery",
    subtitle: "eighteen years of memories",
    description:
      "From my very first steps to this new chapter — every photo holds a memory I treasure.",
    footnote:
      "More pictures will be added after the debut. Please check back — this gallery is still growing.",
    buttonText: "View Full Gallery",
    buttonHref: "/gallery",
    decos: { ...SECTION_DECOS },
    images: CELEBRANT_PHOTOS.map((image) => ({ image, text: "" })),
  },
  // Countdown section (components/sections/countdown.tsx)
  countdown: {
    title: "Counting Down",
    script: "to my eighteenth",
  },
  // Event details section (components/sections/details.tsx)
  // Venue name, address, date, times, map and photos come from VENUE above.
  // In reminder text, {guestsTime}, {ceremonyTime} and {endTime} are filled in.
  eventDetails: {
    eyebrow: "The Celebration",
    title: "Event Details",
    subtitle: "the night of my debut",
    description: "Everything you need to know for an unforgettable night.",
    decos: { ...SECTION_DECOS },
    venues: VENUE_CARDS,
    labels: {
      arrival: "Arrival",
      at: "At",
      scanForDirections: "Scan for directions",
      getDirections: "Get Directions",
      copyAddress: "Copy Address",
      copied: "Copied!",
    },
    attire: {
      title: "Attire Guidelines",
      description: "Formal and elegant — come dressed for a night to remember.",
      paletteTitle: "Dress Code Palette",
      paletteSubtitle: "Burgundy · Red · Black · Gold",
      colorGuideTitle: "The Evening's Colors",
      colorGuideNote: "Choose any one, or pair them together — deep burgundy, rich reds, classic black, and a touch of gold.",
      // Order and visibility come from ATTIRE.show (skips blanks, typos and repeats)
      groups: ATTIRE.show
        .filter((id, i, list) => ["sponsors", "entourage", "guests"].includes(id) && list.indexOf(id) === i)
        .map((id) => ({ id, ...ATTIRE[id] })),
      palette: DRESS_PALETTE, // shown (without names) in the Dress Code reminder
    },
    reminders: {
      title: "Gentle Reminders",
      description: "A few thoughtful notes so everyone can enjoy the night.",
      // Shown as 9:16 portrait cards; the 1st sits in front, the rest fan out behind it
      images: [PHOTO(1), PHOTO(2), PHOTO(3), PHOTO(4)],
      // showPalette: shows the dress code palette after the first paragraph
      items: [
        {
          title: "Dress Code",
          variant: "accent" as "accent" | "soft",
          showPalette: true, // color strip after the first paragraph
          paragraphs: [
            "Come in your most elegant best — formal or semi-formal, whatever makes you feel wonderful.",
            "Please dress in the colors of the evening: burgundy, red, black, or gold.",
          ],
        },
        {
          title: "Arrival",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Doors open at {guestsTime}. Please arrive on time so you can find your seat and settle in before the program begins at {ceremonyTime}.",
          ],
        },
        {
          title: "Capture the Night",
          variant: "accent" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Photos are welcome! Please give way to the official photographers during the entrance, the 18 Roses and the candle blowing so every moment is captured beautifully.",
          ],
        },
        {
          title: "After Party",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Stay for the after party from 8:30 PM — dance, laugh, and celebrate with me until the very last song.",
          ],
        },
      ],
    },
  },
  // Program flow (components/sections/wedding-timeline.tsx) — from the client brief
  weddingTimeline: {
    // Built from EVENT_DATE + TIMES so it always matches Event Details
    kicker: `${EVENT_DATE.replace(/,\s*\d{4}$/, "")} · Doors ${TIMES.guestArrival} · Program ${TIMES.program}`,
    title: "Program",
    subtitle: "the night unfolds",
    description:
      "From the first welcome to the final farewell, here is how the evening will unfold.",
    quote: "She is clothed in strength and dignity, and she laughs without fear of the future.",
    quoteCitation: "Proverbs 31:25",
    // Optional corner decorations — leave "" to hide
    decos: {
      topLeft: "",
      topRight: "",
      bottomLeft: "",
      bottomRight: "",
    },
    // Each event — shown top to bottom in this order (move a block to reorder):
    //   show:     false = hide it (kept here to edit later)
    //   location: text under the title; {ceremony} / {reception} → venue name ("" to hide)
    //   image:    line-art illustration in /public/debut-timeline (black on transparent,
    //             shown pearl-white); "" uses the icon instead
    //   icon:     "sun" | "moon" | "crown" | "rose" | "gift" | "toast" | "candle" |
    //             "music" | "video" | "dinner" | "arrival" | "dance" | "departure" | …
    //   description: optional extra line ("" to hide)
    // ⚠ check — placeholder program for Bea's debut; replace with the family's final flow
    events: [
      {
        show: true,
        time: "5:00 – 5:30 PM",
        title: "Arrival of Guests",
        description: "",
        location: "",
        image: "/debut-timeline/message.png",
        icon: "arrival" as TimelineIconName,
      },
      {
        show: true,
        time: "5:30 – 5:45 PM",
        title: "Opening Prayer & Welcome Remarks",
        description: "",
        location: "",
        image: "/debut-timeline/Invocation.png",
        icon: "sun" as TimelineIconName,
      },
      {
        show: true,
        time: "5:45 – 5:55 PM",
        title: "Pre-Debut Video",
        description: "",
        location: "",
        image: "/debut-timeline/Processional.png",
        icon: "video" as TimelineIconName,
      },
      {
        show: true,
        time: "5:55 – 6:05 PM",
        title: "Grand Entrance of the Debutante",
        description: "",
        location: "",
        image: "/debut-timeline/assembly.png",
        icon: "crown" as TimelineIconName,
      },
      {
        show: true,
        time: "6:05 – 6:20 PM",
        title: "Cotillion de Honor",
        description: "",
        location: "",
        image: "/debut-timeline/dance-party.png",
        icon: "dance" as TimelineIconName,
      },
      {
        show: true,
        time: "6:20 – 6:50 PM",
        title: "18 Roses",
        description: "",
        location: "",
        image: "/debut-timeline/18roses-candle-lighting.png",
        icon: "rose" as TimelineIconName,
      },
      {
        show: true,
        time: "6:50 – 7:15 PM",
        title: "18 Candles & 18 Treasures",
        description: "",
        location: "",
        image: "/debut-timeline/18roses-candle-lighting.png",
        icon: "candle" as TimelineIconName,
      },
      {
        show: true,
        time: "7:15 – 7:30 PM",
        title: "Message from the Debutante & Toast",
        description: "",
        location: "",
        image: "/debut-timeline/debutant-speech.png",
        icon: "toast" as TimelineIconName,
      },
      {
        show: true,
        time: "7:30 – 8:30 PM",
        title: "Dinner",
        description: "",
        location: "",
        image: "/debut-timeline/dinner.png",
        icon: "dinner" as TimelineIconName,
      },
      {
        show: true,
        time: "8:30 – 10:00 PM",
        title: "After Party",
        description: "",
        location: "",
        image: "/debut-timeline/dance-party.png",
        icon: "dance" as TimelineIconName,
      },
      {
        show: true,
        time: "10:00 PM",
        title: "Farewell & Thank You",
        description: "",
        location: "",
        image: "/debut-timeline/end-program.png",
        icon: "moon" as TimelineIconName,
      },
    ],
  },
  // Debut entourage (components/sections/entourage.tsx)
  // Names and roles come from the Google Sheet (googleAPI.entourage) — use the
  // RoleCategory values listed in categoryOrder below.
  entourage: {
    // ⚠ Shown on request while googleAPI.entourage still points to the template's
    // sheet — it lists a previous client's wedding party (Parents of the Groom/Bride,
    // Best Man, …). Swap in Bea's own sheet before sharing the invitation.
    show: true,
    eyebrow: "My Eighteen",
    title: "The Entourage",
    subtitle: "roses, treasures & cheers",
    description: "Honoring the people who shaped my first eighteen years",
    coupleKicker: "The Debutante",
    coupleLine: "Eighteen years of grace",
    coupleHeading: "The Celebrant",
    celebrantRole: "Debutante",
    // Kept for the template — not shown on a debut
    groomRole: "",
    brideRole: "Debutante",
    loadingText: "Loading the entourage...",
    retryingText: "Still gathering the entourage. Trying again...",
    errorText: "Unable to load the entourage",
    retryText: "Try again",
    // Sheet RoleCategory values shown in this order (anything else shows after them)
    categoryOrder: [
      "Parents of the Debutante",
      "18 Roses",
      "One of My 18 Roses",
      "18 Candles",
      "One of My 18 Candles",
      "18 Treasures",
      "One of My 18 Treasures",
      "18 Cheers",
      "One of My 18 Cheers",
      "18 Monetary Gifts",
      "One of My 18 Monetary Gifts",
    ],
    // Leave any path "" to hide that decoration
    decos: { ...SECTION_DECOS },
    // Rename any heading shown in the entourage card: "Heading as shown": "Your text"
    headingLabels: {
      "Parents of the Debutante": "Parents of the Debutante",
      Escort: "Escort",
      "18 Roses": "18 Roses",
      "18 Candles": "18 Candles",
      "18 Treasures": "18 Treasure Gifts",
      "18 Cheers": "18 Cheers",
      "18 Monetary Gifts": "18 Monetary Gifts",
      // Category names as written in the entourage sheet
      "One of My 18 Roses": "18 Roses",
      "One of My 18 Candles": "18 Candles",
      "One of My 18 Treasures": "18 Treasure Gifts",
      "One of My 18 Treasure Gifts": "18 Treasure Gifts",
      "One of My 18 Cheers": "18 Cheers",
      "One of My 18 Monetary Gifts": "18 Monetary Gifts",
    } as Record<string, string>,
  },
  // RSVP / guest list (components/sections/guest-list.tsx) — card, search, RSVP form and all modals.
  // Placeholders: {name}, {count}, {n}, {celebrant}. The deadline comes from details.rsvp.deadline.
  rsvp: {
    headerOrnament: DECOR.headerOrnament, // "" to hide
    title: "RSVP",
    script: "Will you be there",
    intro: "Kindly confirm your attendance so a seat can be saved for you on this special night.",
    deadlineLabel: "RSVP Deadline",
    openButton: "Tap here to respond",
    search: {
      title: "RSVP",
      script: "Find your Name",
      placeholder: "Begin with your first name",
      loading: "Preparing the guest list. We'll keep trying until names appear.",
      refine: "Keep typing to refine results",
      notFoundTitle: "Not finding your name?",
      notFoundText: "I'd love to have you there. Send a request to join the celebration.",
      requestButton: "Request to Join",
    },
    invite: {
      title: "You are Invited",
      scriptFallback: "to my debut",
      greeting: "Hello {name}, you are invited to {celebrant}'s debut!",
      seats: "We've reserved {count} for you.",
      seatSingular: "seat",
      seatPlural: "seats",
    },
    responded: {
      title: "Thank You for Responding!",
      text: "Your RSVP is in — I can't wait to celebrate with you!",
      attending: "You're Attending!",
      declined: "Unable to Attend",
      guestCountLabel: "Number of Guests",
      closeButton: "Close",
    },
    form: {
      attendLabel: "Can you attend? *",
      yes: "Yes!",
      no: "Sorry, No",
      companionsLabel: "Who's Coming With You?",
      companionsHint: "Please provide names and relationships for your {count} additional {guests}",
      guestSingular: "guest",
      guestPlural: "guests",
      companionTitle: "Guest {n}",
      companionNameLabel: "Full Name",
      companionNamePlaceholder: "Name of guest {n}",
      relationshipLabel: "Relationship with {name}",
      relationshipFallbackName: "Primary Guest",
      relationshipPlaceholder: "e.g., Spouse, Friend, Child, Parent",
      relationshipOptions: ["Spouse", "Partner", "Child", "Parent", "Sibling", "Friend"],
      companionProgress: "Guest {n} of {total}",
      companionsAdded: "{done} of {total} added",
      prevButton: "Back",
      nextButton: "Next guest",
      phoneLabel: "Phone Number *",
      phonePlaceholder: "09XX XXX XXXX",
      phoneNote: "For debut updates only. Your number stays private and will never be shown to other guests.",
      submitting: "Submitting...",
      submit: "Submit RSVP",
    },
    phoneAlert: {
      title: "A phone number is needed",
      paragraphs: [
        "We ask for your number so we can reach you with important updates — seating, timing, or anything you may need on the night.",
        "Your number will not appear on this invitation and will not be shared with other guests. It is kept private and used only by the family and coordinators.",
      ],
      button: "Add my number",
    },
    success: {
      title: "RSVP Confirmed",
      attending: "I'm so happy you'll be there — your seat is saved!",
      declined: "You'll be missed, but thank you for letting me know.",
      neutral: "Thank you for your response!",
      messagePrompt:
        "Before you go, leave a message for {celebrant} — your words will be a keepsake from her eighteenth.",
      messageButton: "Leave a Message",
      laterButton: "Maybe later — close",
    },
    request: {
      title: "Request",
      script: "to join",
      greetingNamed: "Hi {name} — want to celebrate with us? Send a request!",
      greeting: "Want to celebrate with us? Send a request!",
      optional: "(Optional)",
      nameLabel: "Full Name *",
      namePlaceholder: "Enter your full name",
      emailLabel: "Email Address",
      emailPlaceholder: "your.email@example.com",
      phoneLabel: "Phone Number",
      phonePlaceholder: "+63 912 345 6789",
      guestsLabel: "Number of Guests *",
      guestsPlaceholder: "How many guests?",
      messageLabel: "Message",
      messagePlaceholder: "Share why you'd like to join...",
      submitting: "Submitting...",
      submit: "Send Request",
      sentTitle: "Request Sent!",
      sentText: "Your request has been received",
      sentSubtext: "The family will review it and get back to you soon",
      autoClose: "This will close automatically",
    },
    messages: {
      thankYou: "Thank you for your response!",
      requestSubmitted: "Request submitted! The family will review and get back to you.",
      loadFailed: "Failed to load guest list",
      selectAttendance: "Please select if you can attend",
      nameRequired: "Name is required",
      requestFailed: "Failed to submit request. Please try again.",
      submitFailed: "We couldn't save your RSVP. Please check your connection and try again.",
    },
  },
  // Messages section (components/sections/messages.tsx)
  messages: {
    title: "Love Notes",
    script: "for the debutante",
    description: "Share a note, a wish, or a prayer for {celebrant}. Every message becomes a keepsake from her eighteenth.",
    formTitle: "Share Your Wishes",
    formSubtitle: "Leave a note for {celebrant} to read and keep.",
    messagePlaceholder: "Write your wishes, prayer, or kind words for {celebrant}...",
    wallTitle: "Messages from Loved Ones",
    wallSubtitle: "Warm words from family and friends",
  },
  // Messages wall (components/sections/message-wall-display.tsx)
  // Small decorations on each message card — leave "" to hide
  messageWall: {
    emptyText: "Be the first to leave a note for the debutante.",
    cardDecos: {
      topRight: DECOR.cornerTopRight,
      bottomLeft: "",
    },
  },
  // Book of guests (components/sections/book-of-guests.tsx) — confirmed guests come from the guest list API.
  bookOfGuests: {
    title: "Book of Guests",
    subtitle: "celebrating with me",
    description:
      "Meet the cherished people joining the celebration — your presence makes this night truly special.",
    statsEyebrow: "The Celebration",
    guestSingular: "Guest",
    guestPlural: "Guests",
    statsCaption: "Celebrating With Me",
    rsvpSingular: "RSVP",
    rsvpPlural: "RSVPs",
    partySingular: "Party",
    partyPlural: "Parties",
    thankYou: "Thank you for confirming your RSVP — your presence means the world to me.",
    updatedLabel: "Updated",
    refreshLabel: "Refresh guest counts",
    listEyebrow: "Joining Us",
    listDescription: "A glimpse of the wonderful guests celebrating with me",
    vipLabel: "VIP",
    noTable: "No Table Yet",
    companionsLabel: "With Them",
    companionsMore: "+{count} more",
    companionsLess: "Show less",
    confirmedLabel: "Confirmed",
    emptyTitle: "Guest list updating",
    emptyText: "Confirmed guests will appear here as RSVPs come in.",
    cardsPerView: 4,
    decos: { ...SECTION_DECOS },
  },
  // FAQ (components/sections/faq.tsx)
  // In answers you can use:
  //   {deadline}    → details.rsvp.deadline
  //   {coordinator} → details.rsvp.coordinator
  //   {contact}     → " at <phone>" when details.rsvp.phone is set (empty while "to be announced")
  //   {celebrant}   → celebrant nickname
  //   [link text](#section-id) → a link that smoothly scrolls to that section
  //   A blank line (\n\n) starts a new paragraph; lines starting with "• " show as a bulleted list
  faq: {
    eyebrow: "Before the Night",
    title: "Frequently Asked Questions",
    subtitle: "everything you need to know",
    description:
      "A few gentle notes so you can simply arrive, celebrate, and enjoy the night with me.",
    decos: { ...SECTION_DECOS },
    // In answers: {deadline}, {coordinator}, {contact}, {celebrant}, {guestsTime},
    // {programTime}, {endTime}, {venueName}, {venueAddress} are filled in, and
    // [label](#section-id) becomes a link that scrolls to that section.
    items: [
      {
        question: "How do I RSVP?",
        answer:
          "Simply open the [RSVP](#guest-list) card on this invitation, search for your name, and confirm whether you can join us.\n\nKindly respond by {deadline} so we can prepare your seat.\n\nFor any questions, please reach out to {coordinator}{contact}.",
      },
      {
        question: "What should I wear?",
        answer:
          "Come in your most elegant best — formal or semi-formal, whatever makes you feel wonderful.\n\nPlease dress in the colors of the evening: burgundy, red, black, or gold.\n\nSee the [Attire Guidelines](#details) for more.",
      },
      {
        question: "What time should I arrive?",
        answer:
          "Doors open at {guestsTime} and the program begins at {programTime}. Please arrive a little early so you can find your seat and not miss the debutante's grand entrance.",
      },
      {
        question: "Where is the celebration?",
        answer:
          "The venue will be announced soon. We'll update this invitation with the address, map, and directions — please check back in [Event Details](#details).",
      },
      {
        question: "May I bring a plus one?",
        answer:
          "Seating is limited and the celebration is by invitation only. Kindly RSVP only for the number of seats reserved under your name.",
      },
      {
        question: "What if I can no longer attend?",
        answer:
          "Please let us know as soon as you can, so your seat can be offered to another guest.",
      },
      {
        question: "Is parking available?",
        answer:
          "Parking details will be shared together with the venue. Please allow a few extra minutes to park and make your way in.",
      },
      {
        question: "May I take photos and videos?",
        answer:
          "Of course! We'd love to see the night through your eyes — share them using the hashtags in [Snap & Share](#snap-share).\n\nDuring the grand entrance, the 18 Roses, and the candle blowing, kindly give way to the official photographers.",
      },
      {
        question: "How long is the celebration?",
        answer:
          "The program begins at {programTime}, followed by dinner and an after party. The night comes to a close at {endTime}.",
      },
      {
        question: "I have dietary restrictions or allergies.",
        answer:
          "Please mention them when you RSVP, or let {coordinator} know, so the kitchen can prepare something just for you.",
      },
    ],
  },
  // Gift guide (components/sections/registry.tsx).
  registry: {
    eyebrow: "A Token of Love",
    title: "Gift Guide",
    subtitle: "with gratitude",
    description: "Your presence on my eighteenth is the best gift I could ask for.",
    paragraphs: [
      "Having you with me on my debut is already a precious blessing. If you wish to give a gift, a monetary gift toward my studies and dreams would be deeply appreciated — but your love, prayers, and presence mean the most.",
    ],
    thankYou: "", // "" hides the line
    signOff: "With a grateful heart,",
    signature: "", // "" falls back to the celebrant's nickname
    // Colors — any CSS color or a palette token from app/globals.css (e.g. "var(--color-motif-accent)")
    colors: {
      title: "var(--color-motif-deep)",                                       // account names / numbers: wine
      script: "color-mix(in srgb, var(--color-welcome-gold) 78%, var(--color-motif-deep))", // drop cap, signature: gold
      eyebrow: "color-mix(in srgb, var(--color-welcome-gold) 78%, var(--color-motif-deep))", // small caps labels, heart
      body: "color-mix(in srgb, var(--color-welcome-text) 85%, var(--color-motif-deep))",  // paragraphs: warm ink
      soft: "color-mix(in srgb, var(--color-motif-deep) 70%, transparent)",   // "With love," and secondary text
      card: "var(--color-motif-soft)",                                        // letter card (top)
      cardEdge: "var(--color-motif-cream)",                                   // letter card (bottom of the paper gradient)
      accountCard: "color-mix(in srgb, var(--color-motif-blush) 22%, var(--color-motif-soft))", // e-gift account cards
      button: "var(--color-motif-accent)",                                    // tab shadow tint (seal + selected tab use a crimson → wine gradient)
      line: "color-mix(in srgb, var(--color-welcome-gold) 45%, transparent)", // card edge + seal ring
      glow: "color-mix(in srgb, var(--color-welcome-gold) 22%, transparent)", // tab track / letter badge
      background: "transparent",                                              // section has no background
    },
    // E-gift accounts — optional, as many as you like.
    //   showAccounts: false hides the whole block
    //   show:  false hides one account
    //   qr:    "/QR/BPI.png" to show a QR image, or "" when you have no QR
    showAccounts: true,
    accountsTitle: "For e-gifts",
    // Small italic note under the QR ("" hides it)
    accountsNote: "Sample image for display only — not yet official.", // ⚠ check — clear once the real QR codes are in
    accounts: [
      { show: true, label: "GCash", accountName: "", accountNumber: "", qr: "/QR/GCASH.png" },
      { show: true, label: "BDO", accountName: "", accountNumber: "", qr: "/QR/BDO.png" },
    ] as { show: boolean; label: string; accountName: string; accountNumber: string; qr: string }[],
    // Leave any path "" to hide that decoration
    decos: { ...SECTION_DECOS },
  },
  // Table finder page (/table — components/table-finder.tsx)
  tableFinder: {
    decos: { ...CORNER_DECOS },
    // "Find Your Table" QR card on the dashboard (components/table-finder-qr-card.tsx)
    // {celebrant} → nickname. "" hides a line or image.
    qrCard: {
      coupleNameImage: BRAND.nameImage, // name lettering; "" shows the name as text
      coupleImage: "/Details/debutantattire.png", // illustration beside the text
      eyebrow: "The debut of",
      title: "Find Your Table",
      script: "please be seated",
      description:
        "Place this code at the entrance. Guests scan it, search their name, and go straight to their table.",
      scanLabel: "Scan to find your table",
      buttonText: "Download QR",
      downloadNote: "Saves a print-ready PNG for signs and table cards.",
      previewText: "Preview seating page",
    },
  },
  // Entourage proposal pages (components/proposal-page.tsx)
  // Roles live in content/proposal-roles.ts (18 Roses, 18 Treasures, 18 Cheers, …).
  // Text placeholders: {name} = invitee, {role} = role title, {celebrant} = nickname.
  // Each invitation type has its own wording:
  //   party      → every debut role (18 Roses, Candles, Cheers, Treasure Gifts, Monetary Gifts)
  //   sponsor    → Principal Sponsors (only if you add sponsor roles)
  //   bearer     → kept from the template (unused)
  //   flowerGirl → kept from the template (unused)
  // A list ([...]) shows one paragraph per line; "" or [] hides that part.
  proposal: {
    decos: { ...CORNER_DECOS },
    coupleNameImage: BRAND.nameImage, // name lettering at the top of the card; "" shows the name as text
    coupleImage: "/Details/debutantattire.png", // illustration above the question
    ornament: DECOR.headerOrnament, // small sprig at the top of the card; "" to hide
    // Eucalyptus sprigs on either side of the couple name; "" to hide one
    nameDecos: { left: DECOR.sideLeft, right: DECOR.sideRight },
    showDate: true, // big date under the couple name (Month / Day / Day-number / Time / Year)
    // Use "Maid of Honor" for unmarried, "Matron of Honor" for married
    honorAttendant: "Matron of Honor" as "Matron of Honor" | "Maid of Honor",
    roles: proposalRoleDefinitions,
    roleIdAliases: proposalRoleIdAliases,
    // Shared labels used on every invitation
    labels: {
      // Two lines above the picture ("" hides one)
      topEyebrow: "A Personal Invitation",
      topLine: "From my heart to yours",
      headerEyebrow: "A Special Place", // small gold line above the heading
      headerScript: "in my 18th Birthday", // big heading under the image
      saveTheDate: "Save the Date",
      roleOffered: "Role offered",
      preparedFor: "Prepared for",
      askQuestion: "Will you be", // + role title, e.g. "Will you be one of my 18 Roses?"
      registeredName: "Registered name",
      returnButton: "Return to the Invitation",
      saving: "Saving...",
      sending: "Sending...",
      sendButton: "Send Response",
      goBack: "Go Back",
      saveError: "We couldn't save your response. Please try again.",
      // Shown when the invite link has no name and the guest says yes
      nameForm: {
        title: "You Said Yes",
        script: "we're so happy",
        subheader: "One quick detail",
        body: "I couldn't be happier to have you by my side! Please confirm the name you'd like on the invitation and guest lists.",
        label: "Your Preferred Name",
        placeholder: "e.g. Aunt Maria Clara / Mr. James Bond",
        required: "Please type your preferred name so we can add it to our invitation.",
        submit: "Submit Response",
        cancel: "Cancel",
      },
    },
    copy: {
      party: {
        greeting: "Dear",
        intro: [],
        body: [
          "Your presence would make this milestone even more meaningful. I would be honored to have you by my side as a symbol of love, friendship, and the beautiful memories we share.",
        ],
        askLead: "",
        askNote: "",
        yesButton: "Yes, I'd Love To!",
        noButton: "No, With Love & Warm Wishes",
        signOff: "With love,", // followed by the celebrant's name
        yes: {
          title: "You Said Yes",
          script: "thank you",
          subheader: "I couldn't be happier",
          roleLine: "As {role}",
          body: [
            "Thank you for saying yes! I can't wait to celebrate, laugh, and make memories with you on my eighteenth. Having you be part of the program will make the night even more special.",
          ],
          signOff: "With love,",
        },
        no: {
          title: "Thank You",
          script: "for responding",
          subheader: "I completely understand",
          body: [
            "Thank you for taking the time to consider it. There are absolutely no hard feelings — I'm grateful to have you in my life, and I hope to celebrate with you in any way you can.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "successfully",
          subheader: "Your message has reached me",
          body: [
            "Your love and warmest wishes mean the world to me. Thank you!",
          ],
          signOff: "With love,",
        },
      },
      sponsor: {
        greeting: "Dear",
        intro: [
          "I have some wonderful news that I would love to share with you.",
          "I am turning eighteen and will be celebrating my debut — a brand-new chapter of my life.",
        ],
        body: [
          "This is not a general invitation. This is a personal ask, especially meant for you.",
          "As I prepare for my debut, I keep thinking of the people I would be grateful to have by my side on one of the most meaningful nights of my life.",
          "To me, a {role} is more than a part in the program. It is someone I look up to, someone whose wisdom and blessings I would be grateful to carry with me into adulthood.",
        ],
        askLead: "With great respect and sincerity, I would like to ask you a very special question:",
        askNote: "Having you share this moment with me would make my eighteenth truly meaningful.",
        yesButton: "Yes, I'd Be Honored 🤍",
        noButton: "No, With Love & Warm Wishes",
        signOff: "With love and respect,",
        yes: {
          title: "You Said Yes",
          script: "thank you",
          subheader: "Thank you for saying yes!",
          roleLine: "Our {role}",
          body: [
            "I am truly happy and honored that you accepted this special role in my debut. Your support means so much to me, and I look forward to celebrating with you and creating a memory I will cherish for years to come.",
          ],
          signOff: "With love and heartfelt gratitude,",
        },
        no: {
          title: "Thank You",
          script: "for responding",
          subheader: "I completely understand and respect your decision",
          body: [
            "Thank you for taking the time to read my letter and consider my request. There are no hard feelings at all — I am simply grateful to have you in my life and to have you celebrate with me in your own way.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "successfully",
          subheader: "Your message has reached me",
          body: [
            "Thank you for sharing this moment with me. Your love and warmest wishes mean the world to me.",
          ],
          signOff: "With love,",
        },
      },
      bearer: {
        greeting: "Hi",
        intro: [
          "We have a very special day coming up, and we would love for you to be part of it! 🤍",
          "{celebrant} is turning eighteen!",
        ],
        body: [
          "Our wedding day is a very important moment for us, and we would love to have you take part in making it even more special.",
        ],
        askLead: "So we have a very important question for you:",
        askNote: "We would be so happy to have you walk down the aisle and carry this special part of our wedding ceremony.",
        yesButton: "Yes, I'd Love To! 🤍",
        noButton: "Maybe Next Time 🤍",
        signOff: "With lots of love,",
        yes: {
          title: "Yay!",
          script: "you said yes!",
          subheader: "We are so excited to have you on our team!",
          roleLine: "Our {role}",
          body: [
            "We are so excited to have you as our {role}! We can't wait to see you walk down the aisle and be part of our special day. Your little role will be a very special part of our wedding, and we hope you have lots of fun celebrating with us! See you on our big day! 🤍",
          ],
          signOff: "With lots of love,",
        },
        no: {
          title: "That's Okay!",
          script: "we understand",
          subheader: "We completely understand 😊",
          body: [
            "Thank you for considering being our {role}. We hope you know that you are special to us, and we'll be happy to have you celebrate our wedding with us in any way.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "successfully",
          subheader: "Thank you for letting us know",
          body: ["We hope you know how special you are to us, and we look forward to celebrating with you."],
          signOff: "With lots of love,",
        },
      },
      flowerGirl: {
        greeting: "Hi",
        intro: [
          "We have a very special day coming up, and we would love for you to be part of it! 🤍",
          "{celebrant} is turning eighteen!",
        ],
        body: [
          "Our wedding day wouldn't be complete without some extra sweetness, smiles, and a little bit of magic.",
        ],
        askLead: "And we have a very special role we would love for you to have.",
        askNote: "We would love to have you walk down the aisle and help make our wedding day even more beautiful and memorable.",
        yesButton: "Yes, I'd Love To! 🌸",
        noButton: "Maybe Next Time 🤍",
        signOff: "With lots of love,",
        yes: {
          title: "Yay!",
          script: "you said yes!",
          subheader: "We are so happy to have you as our Flower Girl!",
          roleLine: "Our {role}",
          body: [
            "We can't wait to see you walk down the aisle and be part of our special day. We hope you have lots of fun, smile big, and enjoy every moment! We can't wait to see you on our big day! 🤍",
          ],
          signOff: "With lots of love,",
        },
        no: {
          title: "That's Okay!",
          script: "we understand",
          subheader: "We completely understand 😊",
          body: [
            "Thank you for taking the time to consider being our Flower Girl. Whether you're able to be part of our wedding or not, we hope you know how special you are to us. We'll still be very happy to celebrate our special day with you!",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "successfully",
          subheader: "Thank you for letting us know",
          body: ["We hope you know how special you are to us, and we look forward to celebrating with you."],
          signOff: "With lots of love,",
        },
      },
    },
  },
  details: {
    rsvp: { ...RSVP },
  },
  contact: {
    bridePhone: "to be announced",
    groomPhone: "to be announced",
    email: "to be announced",
  },
  giftRegistry: {
    // QR_1:{
    // id: "BPI",
    // src: "/QR/BPI.png",
    // label: "BPI",
    // accountNumber: "KAMS : ***********569",
    // },
    // QR_2:{
    // id: "MariBank",
    // src: "/QR/MariBank.png",
    // label: "MariBank",
    // accountNumber: "****7672",
    // }
    // ,
    // QR_3:{
    // id: "Gcash",
    // src: "/QR/pleaseProvideQR.png",
    // label: "Gcash",
    // accountNumber: "to be announced",
    // }
  },
  // Built from QUICK SETUP — edit the values at the top of the file
  // The program ("ceremony") and the end of the night ("reception") at the one venue —
  // names kept from the template so every section keeps working.
  ceremony: {
    location: CEREMONY_VENUE.name,
    venue: CEREMONY_VENUE.address,
    map: CEREMONY_VENUE.map,
    date: EVENT_DATE,
    day: EVENT_DAY,
    time: TIMES.program,
    entourageTime: TIMES.guestArrival,
    guestsTime: TIMES.guestArrival,
    image: CEREMONY_VENUE.photos,
  },
  reception: {
    location: RECEPTION_VENUE.name,
    venue: RECEPTION_VENUE.address,
    map: RECEPTION_VENUE.map,
    date: EVENT_DATE,
    day: EVENT_DAY,
    time: TIMES.end,
    image: RECEPTION_VENUE.photos,
  },
  // Legacy blocks (not shown on the main page) — kept so older components compile.
  dressCode: {
    theme: EVENT.theme,
    sponsors: {
      title: "Family",
      ninang: { label: "Ladies", description: "Formal gown in black, silver, or deep red.", image: "", palette: ["#111013", "#C0C0C6", "#7A0F1A"] },
      ninong: { label: "Gentlemen", description: "Black suit or barong with black slacks.", image: "", palette: ["#111013", "#3A3A40"] },
    },
    entourage: {
      title: "Entourage",
      bridesmaid: { label: "18 Candles", description: "Formal dress in silver or black.", image: "", palette: ["#C0C0C6", "#111013"] },
      groomsmen: { label: "18 Roses", description: "Black suit with a red rose boutonniere.", image: "", palette: ["#111013", "#7A0F1A"] },
    },
    guests: {
      title: "Guests",
      label: "Guests",
      description: "Your best formal look in burgundy, red, black, or gold.",
      image: "",
      palette: ["#C0C0C6", "#8E8E96", "#3A3A40", "#111013"],
    },
    paletteNote: `Our theme is ${EVENT.theme}: ${EVENT.colors}. Guests: wear burgundy, red, black, or gold.`,
    closing: "Thank you for helping make this night so special. I can't wait to celebrate with you!",
    note: "Kindly wear burgundy, red, black, or gold.",
  },
  narratives: {
    ourStory: "",
    groom: "",
    bride: "",
  },
  colors: {
    primary: "#7A0F1A",
    secondary: "#C9A24A",
  },
  // Theme song (components/sections/wedding-playlist.tsx). {celebrant} → nickname.
  playlist: {
    eyebrow: "Now Playing",
    title: "The Sound of the Night",
    script: "my eighteenth, in a song",
    subtitle: "Every celebration has a soundtrack — this is the one that sets the mood for mine.",
    // Shown on the player card: small label (artist), big title (song), then the note
    cardEyebrow: `Theme song · ${EVENT.themeSong.artist}`,
    playlistName: EVENT.themeSong.title,
    cardNote:
      "The song I chose to open my eighteenth. Press play and step into the night with me.",
    buttonText: "Listen on Spotify",
    // Leave any path "" to hide that decoration
    decos: { ...CORNER_DECOS, headerOrnament: DECOR.headerOrnament },
    // ⚠ check — Spotify link for "Goth" by Sidewalks and Skeletons (track, playlist or album links all work)
    embedUrl: "https://open.spotify.com/embed/playlist/1YChzOo1Wj6GrTcnz0ap5C?utm_source=generator&si=49d7c00b589b4840",
    spotifyUrl: "https://open.spotify.com/playlist/1YChzOo1Wj6GrTcnz0ap5C",
  },
  // Closing "See you there!" section (components/sections/see-you-there.tsx).
  //   photos mode (loadingScreen.display "photos") → full-screen celebrant photo
  //   plain mode  (loadingScreen.display "plain")  → ornamental card, no photo
  // {celebrant} → nickname.
  seeYouThere: {
    titleLine1: "See you",
    titleLine2: "there!",
    // Photos mode — lines around the title (like the closing card of the invitation); "" hides one
    eyebrow: "Until we celebrate",
    script: "with love, {celebrant}",
    message: "I can't wait to celebrate my eighteenth with you.",
    // Photos mode — full-screen background that slowly crossfades between the photos.
    // Phones (portrait) use "mobile", tablets / desktops (landscape) use "desktop".
    photos: {
      mobile: [PHOTO(3), PHOTO(4), PHOTO(1), PHOTO(2)],
      // Same portraits on wide screens (cropped to fill, framed on her face)
      desktop: [PHOTO(3), PHOTO(4), PHOTO(1), PHOTO(2)],
    },
    photoAlt: "{celebrant}",
    // Plain mode
    plain: {
      eyebrow: `Until the night of ${EVENT_DATE.replace(/,\s*\d{4}$/, "")}`,
      script: "with love, {celebrant}",
      message: "I can't wait to celebrate my eighteenth with you.",
      decos: { ...CORNER_DECOS, footerVine: DECOR.footerVine },
    },
  },
  // Footer (components/sections/footer.tsx).
  // {celebrant} → nickname, {year} → current year. Date comes from ceremony, deadline from details.rsvp.
  footer: {
    showMonogram: true, // celebrant.monogram, tinted to the motif
    // Small line under the name, e.g. "turns eighteen" ("" to hide)
    nameLine: `turns ${CELEBRANT.ageWords.toLowerCase()}`,
    dateLabel: "Debut Date",
    // Program & end of night at a glance (times and places come from ceremony / reception)
    summary: {
      show: true,
      ceremonyLabel: "Program",
      receptionLabel: "Until",
    },
    noteTitle: "A Note From Me",
    // Typed out one after another
    quotes: [
      "She is clothed in strength and dignity, and she laughs without fear of the future. – Proverbs 31:25",
      "Welcome to my debut website! Eighteen years of love, lessons, and grace — and I'm so grateful to share this night with you.",
      "Thank you for your love, prayers, and support. I can't wait to celebrate with you!",
    ],
    rsvp: {
      show: true,
      title: "RSVP Deadline",
      label: "Please respond by",
      note: "Please confirm your attendance by this date.",
      button: "Tap here to respond",
      href: "#guest-list",
    },
    // Social links — replace each href with your own profile link.
    //   show: false hides one; platforms: facebook | instagram | tiktok | youtube | twitter | threads | messenger | email
    //   email: use "mailto:you@example.com"; messenger: use "https://m.me/yourpage"
    followTitle: "Follow Along",
    followNote: "Share your photos and tag me — I'd love to see the night through your eyes.",
    socials: [
      { show: true, platform: "facebook", href: "https://www.facebook.com" },
      { show: true, platform: "instagram", href: "https://www.instagram.com/" },
      { show: true, platform: "tiktok", href: "https://www.tiktok.com/" },
      { show: true, platform: "youtube", href: "https://www.youtube.com" },
      { show: true, platform: "twitter", href: "https://x.com/" },
      { show: false, platform: "threads", href: "https://www.threads.net/" },
      { show: false, platform: "messenger", href: "https://m.me/" },
      { show: false, platform: "email", href: "mailto:" },
    ] as {
      show: boolean
      platform: "facebook" | "instagram" | "tiktok" | "youtube" | "twitter" | "threads" | "messenger" | "email"
      href: string
    }[],
    quickLinksTitle: "Quick Links",
    links: [
      { label: "Home", href: "#home" },
      { label: "Event Details", href: "#details" },
      { label: "Gallery", href: "#gallery" },
      { label: "RSVP", href: "#guest-list" },
      { label: "Program", href: "#wedding-timeline" },
      { label: "Messages", href: "#messages" },
      { label: "FAQ", href: "#faq" },
    ],
    copyright: "© {year} {celebrant}'s Debut — crafted with love, prayers, and gratitude.",
    tagline: "This celebration site was made to share the joy of my eighteenth with you.",
    // Hashtag chips under the date in the footer header ([] hides them)
    hashtags: HASHTAGS,
    credit: {
      show: true,
      developedBy: "Developed by",
      developerName: "Lance Valle",
      developerUrl: "https://lance28-beep.github.io/portfolio-website/",
      promoText: "Visit and follow us:",
      promoName: "Debut Digital Invites",
      promoUrl: "https://www.facebook.com/debutinvitation/",
    },
  },
  // Snap & Share (components/sections/snap-share.tsx). {celebrant} → nickname.
  snapShare: {
    // ⚠ check — Google Drive upload folder + its QR are still from the template
    googleDriveLink:
      "https://drive.google.com/drive/folders/1UnYn0ZkNX92Q4HNE48JErNNZOhBU2U3B?usp=sharing",
    albumQR: "/QR/AlbumQR.png",
    hashtag: HASHTAGS,
    instructions: "Please scan this QR code and upload the photos and videos you took during the debut. I'd love to see the night through your eyes!",
    title: "Snap and Share",
    subtitle: "Share your memories",
    description:
      "Help capture the little moments of {celebrant}'s eighteenth — every smile, dance, and candid laugh. Your photos and clips complete the story of the night.",
    // "Favorite Moments" photo card — always hidden when loadingScreen.display is "plain"
    moments: {
      show: false, // hidden — set true to bring back the photo card
      title: "Favorite Moments",
      caption: "Share your snapshots to be featured in the keepsake gallery.",
      // 3 photos: two side by side on top (3:4 frames), one wider frame below (4:3, framed on the face)
      images: [PHOTO(4), PHOTO(1), PHOTO(2)],
    },
    website: {
      show: true,
      title: "Share the Debut Website",
      description:
        "Spread the word about {celebrant}'s celebration. Share this QR code so friends and family can find every detail.",
      downloadButton: "Download QR",
      note: "Scan with any camera app to open the full invitation and schedule.",
    },
    hashtags: {
      show: true,
      title: "Debut Hashtags",
      copy: "Copy",
      copied: "Copied",
      copyAll: "Copy All",
      allCopied: "All Copied!",
    },
    social: {
      show: true,
      title: "Share on Social Media",
      description: "Help spread the word about {celebrant}'s debut across your favorite platforms.",
      // Remove any you don't want: "instagram" | "facebook" | "tiktok" | "twitter"
      platforms: ["instagram", "facebook", "tiktok", "twitter"] as ("instagram" | "facebook" | "tiktok" | "twitter")[],
      shareText: "Celebrate {celebrant}'s debut! Explore the details and share your special memories:",
    },
    // Shown only when googleDriveLink is set
    upload: {
      badge: "Upload Your Photos & Videos",
      scanNote: "Scan with your camera app",
      copyLink: "Copy Link",
      copied: "Copied!",
      downloadQr: "Download QR",
      uploadButton: "Upload Photos",
    },
    closing:
      "Thank you for helping make {celebrant}'s eighteenth unforgettable. Your photos and messages become memories she will treasure for a lifetime.",
    closingTag: "Thank you for sharing the joy",
  },
  // Accommodation (components/sections/accommodation.tsx — not on the main page)
  accommodation: {
    coordinator: {
      name: RSVP.coordinator,
      phone: RSVP.phone,
    },
    hotels: [] as { name: string; discount?: string; phone?: string; facebook?: string }[],
    carRentals: [] as { name: string; facebook?: string }[],
  },
}
