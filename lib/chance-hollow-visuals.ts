import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

const BACKGROUNDS: Partial<Record<RealmLevelId, string>> = {
  "Year 3": "/images/chancehollow-home-y3.jpeg",
  "Year 4": "/images/chancehollow-home-y4.jpeg",
  "Year 5": "/images/chancehollow-home-y5.jpeg",
};

export function getChanceHollowBackground(level: RealmLevelId) {
  return BACKGROUNDS[level] ?? BACKGROUNDS["Year 3"]!;
}
