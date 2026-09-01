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
  const cards: Partial<Record<RealmLevelId, string>> = {
    "Year 3": `patternox-wigglecode-y3-${side}.png`,
    "Year 4": `patternox-sequencer-y4-${side}.png`,
    "Year 5": `patternox-solver-y5-${side}.png`,
    "Year 6": `patternox-codemaster-y6-${side}.png`,
  };
  return `/cards/${cards[level] ?? cards["Year 3"]}`;
}
