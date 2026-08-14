import { isPlacementComplete, type ProgressRealmScope, type StudentProgress } from "@/data/progress";
import { getStarpathLevelForYear, type StarpathLevelDefinition } from "@/lib/starpath-levels";
import { buildStarpathWorldHref, STARPATH_REALM_ID } from "@/lib/starpath-routes";
import {
  getLiveRealmDefinitions,
  getRealmDefinition,
} from "@/lib/realms/realm-registry";

type CurriculumRealmAvailability = {
  enabled: true;
  progressRealmId: ProgressRealmScope;
  destinationRealmId: ProgressRealmScope;
  route: string;
};

type RealmAvailability = CurriculumRealmAvailability;

const ENABLED_REALMS = Object.fromEntries(
  getLiveRealmDefinitions().map((realm) => [
    realm.portalId,
    {
      enabled: true,
      progressRealmId: realm.realmId,
      destinationRealmId: realm.realmId,
      route: `/${realm.slug}`,
    } satisfies RealmAvailability,
  ]),
) as Record<string, RealmAvailability>;

export function getRealmAvailability(realmId: string): RealmAvailability | null {
  return ENABLED_REALMS[realmId] ?? null;
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
  if (args.realmId === STARPATH_REALM_ID) {
    const starpathYear = (year === "Foundation" ? "Prep" : year) as StarpathLevelDefinition["yearLabel"];
    const level = getStarpathLevelForYear(starpathYear);
    if (year !== "Prep" && year !== "Foundation" && !isPlacementComplete(args.progress)) {
      return `/pretest?year=${encodeURIComponent(level.yearLabel)}&realm_id=${STARPATH_REALM_ID}`;
    }
    return buildStarpathWorldHref({ selectedLevel: level.id });
  }

  const route = `/${getRealmDefinition(args.realmId).slug}`;

  if (year === "Prep") return route;
  if (isPlacementComplete(args.progress)) return route;

  return `/pretest?year=${encodeURIComponent(year)}&realm_id=${args.realmId}`;
}
