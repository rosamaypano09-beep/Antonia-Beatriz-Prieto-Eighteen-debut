import { siteConfig } from "@/content/site";

/** Mobile invitation photo marquee — `public/mobile-background` */
/** Same list as content/site.ts → loadingScreen.backgroundPhotos */
export const MOBILE_BACKGROUND_PHOTOS = siteConfig.loadingScreen.backgroundPhotos.map((src) => encodeURI(src));
export const MOBILE_BACKGROUND_PHOTO_COUNT = MOBILE_BACKGROUND_PHOTOS.length;

/**
 * Loader background photos for preloading — set in content/site.ts (loadingScreen.backgroundPhotos).
 * Empty in "plain" display so nothing is downloaded.
 */
export const LOADING_BG_PHOTOS =
  siteConfig.loadingScreen.display === "plain"
    ? []
    : (siteConfig.loadingScreen.backgroundPhotos ?? []).map((src) => encodeURI(src));

/** The loading poster's own marquee (loadingScreen.gala.marqueePhotos) — preloaded in app/layout.tsx */
const galaMarquee = siteConfig.loadingScreen.gala?.marqueePhotos ?? [];
export const LOADER_MARQUEE_PHOTOS =
  siteConfig.loadingScreen.display === "plain"
    ? []
    : galaMarquee.length > 0
      ? galaMarquee.filter(Boolean).map((src) => encodeURI(src))
      : LOADING_BG_PHOTOS;
