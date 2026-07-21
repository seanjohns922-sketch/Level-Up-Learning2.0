import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

export const STARPATH_BACKGROUNDS: Record<RealmLevelId, string> = {
  Prep: "/images/starpath-home-bg-ground.png",
  "Year 1": "/images/starpath-home-bg-y1.png",
  "Year 2": "/images/starpath-home-bg-y2.png",
  "Year 3": "/images/starpath-home-bg-y3.png",
  "Year 4": "/images/starpath-home-bg-y4.png",
  "Year 5": "/images/starpath-home-bg-y5.png",
  "Year 6": "/images/starpath-home-bg-y6.png",
};

export function getStarpathBackground(level: RealmLevelId) {
  return STARPATH_BACKGROUNDS[level];
}
