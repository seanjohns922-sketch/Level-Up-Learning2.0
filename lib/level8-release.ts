import { LEVEL7_LIVE } from "./level7-release";
import { isLevel8Realm, LEVEL8_WEEK_COUNTS, type Level8Realm } from "./level8-config";

/**
 * Level 8 release switch. Level 8 is live wherever Level 7 is (its strongholds sit on the
 * Level 7 summit). Set NEXT_PUBLIC_LEVEL8_LIVE=false to return it to demo review only.
 */
export const LEVEL8_LIVE = LEVEL7_LIVE && process.env.NEXT_PUBLIC_LEVEL8_LIVE !== "false";

/** True for a real (non-demo) Level 8 activity in one of the six Level 8 realms. */
export function isLiveLevel8(year: string | null | undefined, realmId: string | null | undefined): realmId is Level8Realm {
  return LEVEL8_LIVE && year === "Year 8" && realmId != null && isLevel8Realm(realmId);
}

export function level8LessonId(realm: Level8Realm, week: number, lesson: number) {
  return `y8-${realm}-w${week}-l${lesson}`;
}

/** Student routes for live Level 8. The final week ends with the post-test (the final battle) instead of a quiz. */
export function level8LiveHref(realm: Level8Realm, week: number, activity: number | "quiz" | "posttest" | "week") {
  const base = `year=${encodeURIComponent("Year 8")}&realm_id=${realm}`;
  if (activity === "posttest" || (activity === "quiz" && week === LEVEL8_WEEK_COUNTS[realm])) return `/posttest?${base}`;
  if (activity === "week") return `/program?${base}&week=${week}&expedition=1`;
  if (activity === "quiz") return `/level8/quiz?${base}&week=${week}&type=quiz&n=1`;
  return `/lesson?${base}&week=${week}&lessonId=${level8LessonId(realm, week, activity)}`;
}

/** A student's own stronghold; `week` returns them to that week's portal, `victory` plays the seal shattering. */
export function level8StrongholdHref(realm: Level8Realm, options: { week?: number; victory?: boolean } = {}) {
  const query = options.victory ? "?victory=1" : options.week ? `?week=${options.week}` : "";
  return `/world/expedition/${realm}/stronghold${query}`;
}
