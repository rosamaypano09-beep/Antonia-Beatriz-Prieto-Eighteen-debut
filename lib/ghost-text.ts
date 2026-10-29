import { fillCelebrant } from "@/lib/celebrant"
import type { SiteConfig } from "@/lib/site-config"

/** The ghost-marquee line (loadingScreen.gala.ghostText), e.g. "Bea  ·  Antonia Beatriz Prieto  ·  Eighteen". */
export function ghostTextFor(siteConfig: SiteConfig): string {
  return (siteConfig.loadingScreen?.gala?.ghostText ?? [])
    .map((t) => fillCelebrant(t, siteConfig))
    .filter(Boolean)
    .join("  ·  ")
}
