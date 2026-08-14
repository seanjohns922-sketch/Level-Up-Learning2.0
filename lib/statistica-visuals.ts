import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

export const STATISTICA_BACKGROUNDS: Partial<Record<RealmLevelId, string>> = {
  "Year 1": "/images/statistica-home-y1.png",
  "Year 2": "/images/statistica-home-y2.png",
  "Year 3": "/images/statistica-home-y3.png",
  "Year 4": "/images/statistica-home-y4.png",
  "Year 5": "/images/statistica-home-y5.png",
  "Year 6": "/images/statistica-home-y6.png",
};

export function getStatisticaBackground(level: RealmLevelId) {
  return STATISTICA_BACKGROUNDS[level] ?? STATISTICA_BACKGROUNDS["Year 1"]!;
}
