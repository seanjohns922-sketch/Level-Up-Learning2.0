import { isPlacementComplete, type ProgressRealmScope, type StudentProgress } from "@/data/progress";
import { STARPATH_REALM_ID, STARPATH_WORLD_ROUTE } from "@/lib/starpath-routes";

export type RealmCarouselId = "number-nexus" | "measurelands" | "starpath-realm";

type CurriculumRealmAvailability = {
  enabled: true;
  progressRealmId: ProgressRealmScope;
  destinationRealmId: ProgressRealmScope;
  route: string;
};

type PendingRealmAvailability = {
  enabled: false;
  progressRealmId: null;
  destinationRealmId: typeof STARPATH_REALM_ID;
  route: string;
};

type RealmAvailability = CurriculumRealmAvailability | PendingRealmAvailability;

const ENABLED_REALMS: Record<RealmCarouselId, RealmAvailability> = {
  "number-nexus": {
    enabled: true,
    progressRealmId: "number",
    destinationRealmId: "number",
    route: "/number-nexus",
  },
  measurelands: {
    enabled: true,
    progressRealmId: "measurement",
    destinationRealmId: "measurement",
    route: "/measurelands",
  },
  "starpath-realm": {
    enabled: false,
    progressRealmId: null,
    destinationRealmId: STARPATH_REALM_ID,
    route: STARPATH_WORLD_ROUTE,
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
