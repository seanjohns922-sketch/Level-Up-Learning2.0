import { isPlacementComplete, type ProgressRealmScope, type StudentProgress } from "@/data/progress";

export type RealmCarouselId = "number-nexus" | "measurelands";

type RealmAvailability = {
  enabled: boolean;
  progressRealmId: ProgressRealmScope;
  route: string;
};

const ENABLED_REALMS: Record<RealmCarouselId, RealmAvailability> = {
  "number-nexus": {
    enabled: true,
    progressRealmId: "number",
    route: "/number-nexus",
  },
  measurelands: {
    enabled: true,
    progressRealmId: "measurement",
    route: "/measurelands",
  },
};

export function getRealmAvailability(realmId: string): RealmAvailability | null {
  return ENABLED_REALMS[realmId as RealmCarouselId] ?? null;
}

export function isRealmEnabled(realmId: string) {
  return getRealmAvailability(realmId)?.enabled === true;
}

export function resolveRealmEntryRoute(args: {
  realmId: ProgressRealmScope;
  progress: StudentProgress | null | undefined;
  fallbackYear: string;
  introSeen: boolean;
}) {
  if (!args.introSeen) return "/home";

  const year = args.progress?.year?.trim() || args.fallbackYear.trim() || "Year 1";
  const route = args.realmId === "measurement" ? "/measurelands" : "/number-nexus";

  if (year === "Prep") return route;
  if (isPlacementComplete(args.progress)) return route;

  return `/pretest?year=${encodeURIComponent(year)}&realm_id=${args.realmId}`;
}
