import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

const BACKGROUNDS: Partial<Record<RealmLevelId, string>> = {
  "Year 3": "/images/chancehollow-home-y3.jpeg",
};

export function getChanceHollowBackground(level: RealmLevelId) {
  return BACKGROUNDS[level] ?? BACKGROUNDS["Year 3"]!;
}
