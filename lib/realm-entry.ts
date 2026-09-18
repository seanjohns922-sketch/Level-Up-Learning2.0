import { isPlacementComplete, type ProgressRealmScope, type StudentProgress } from "@/data/progress";
import { realmEntryLevel } from "@/lib/realm-unlock";
import { getStarpathLevelForYear, type StarpathLevelDefinition } from "@/lib/starpath-levels";
import { buildStarpathWorldHref, STARPATH_REALM_ID } from "@/lib/starpath-routes";
import {
  getLiveRealmDefinitions,
  getRealmDefinition,
  isFirstLevelPretestEnabled,
  isRealmFirstLevel,
  type LiveRealmId,
} from "@/lib/realms/realm-registry";

type CurriculumRealmAvailability = {
  enabled: true;
  progressRealmId: LiveRealmId;
  destinationRealmId: LiveRealmId;
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
    if (!isPlacementComplete(args.progress)) {
      return `/pretest?year=${encodeURIComponent(level.yearLabel)}&realm_id=${STARPATH_REALM_ID}`;
    }
    return buildStarpathWorldHref({ selectedLevel: level.id });
  }

  const route = `/${getRealmDefinition(args.realmId).slug}`;

  // Clamp to a level this realm actually teaches. A learner below a realm's
  // floor (Chance Hollow and Pattern Peaks start at Level 3) would otherwise be
  // sent to a pre-test bank that does not exist and shown "No questions found".
  const entryLevel = realmEntryLevel(args.realmId, year) ?? year;

  if (isRealmFirstLevel(args.realmId, entryLevel) && !isFirstLevelPretestEnabled(args.realmId, entryLevel)) return route;
  if (isPlacementComplete(args.progress)) return route;

  return `/pretest?year=${encodeURIComponent(entryLevel)}&realm_id=${args.realmId}`;
}
