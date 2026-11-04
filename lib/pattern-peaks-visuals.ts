import { getLegendArtwork } from "@/data/legend-artwork";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

const BACKGROUNDS: Partial<Record<RealmLevelId, string>> = {
  "Year 3": "/images/patternpeaks-home-bg-y3.jpeg",
  "Year 4": "/images/patternpeaks-home-bg-y4.jpeg",
  "Year 5": "/images/patternpeaks-home-bg-y5.jpeg",
  "Year 6": "/images/patternpeaks-home-bg-y6.jpeg",
};

export function getPatternPeaksBackground(level: RealmLevelId) {
  return BACKGROUNDS[level] ?? BACKGROUNDS["Year 3"]!;
}

export function getPatternoxCard(level: RealmLevelId, side: "front" | "back" = "front") {
  const images = getLegendArtwork("pattern-peaks", level);
  return side === "front" ? images.cardFront : images.cardBack;
}
