import type { StarpathLevelId } from "@/lib/starpath-levels";

export const STARPATH_CAROUSEL_ID = "starpath-realm";
export const STARPATH_REALM_ID = "space";
export const STARPATH_WORLD_ROUTE = "/starpath";

export type StarpathDestination =
  | "realm-entry"
  | "world"
  | "placement"
  | "pre-test"
  | "program"
  | "lesson"
  | "weekly-quiz"
  | "post-test";

export type StarpathRouteContext = {
  selectedLevel: StarpathLevelId;
  placementLevel?: StarpathLevelId | null;
};

function buildStarpathHref(
  destination: StarpathDestination,
  context: StarpathRouteContext,
  extra?: Record<string, string | number>,
) {
  const params = new URLSearchParams({
    realm_id: STARPATH_REALM_ID,
    level: context.selectedLevel,
    destination,
  });
  if (context.placementLevel) params.set("placement_level", context.placementLevel);
  Object.entries(extra ?? {}).forEach(([key, value]) => params.set(key, String(value)));
  return `${STARPATH_WORLD_ROUTE}?${params.toString()}`;
}

export const buildStarpathRealmEntryHref = (context: StarpathRouteContext) =>
  buildStarpathHref("realm-entry", context);
export const buildStarpathWorldHref = (context: StarpathRouteContext) =>
  buildStarpathHref("world", context);
export const buildStarpathPlacementHref = (context: StarpathRouteContext) =>
  buildStarpathHref("placement", context);
export const buildStarpathPreTestHref = (context: StarpathRouteContext) =>
  buildStarpathHref("pre-test", context);
export const buildStarpathProgramHref = (context: StarpathRouteContext) =>
  buildStarpathHref("program", context);
export const buildStarpathLessonHref = (
  context: StarpathRouteContext,
  week: number,
  lesson: number,
) => buildStarpathHref("lesson", context, { week, lesson });
export const buildStarpathWeeklyQuizHref = (context: StarpathRouteContext, week: number) =>
  buildStarpathHref("weekly-quiz", context, { week });
export const buildStarpathPostTestHref = (context: StarpathRouteContext) =>
  buildStarpathHref("post-test", context);

export function buildStarpathTowerReturnHref(level: StarpathLevelId) {
  return `/realms?level=${encodeURIComponent(level)}`;
}
