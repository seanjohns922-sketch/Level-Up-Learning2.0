import { cave7Realm, cave7WeekCount, type Cave7Realm } from "./cave7-config";

/**
 * Level 7 release switch. While it is off, Level 7 lessons and quizzes stay in demo review
 * only. Turn it on by setting NEXT_PUBLIC_LEVEL7_LIVE=true in the deployment environment.
 */
export const LEVEL7_LIVE = process.env.NEXT_PUBLIC_LEVEL7_LIVE === "true";

/** True for a real (non-demo) Level 7 activity in one of the six Level 7 realms. */
export function isLiveLevel7(year: string | null | undefined, realmId: string | null | undefined): realmId is Cave7Realm {
  return LEVEL7_LIVE && year === "Year 7" && realmId != null && cave7Realm(realmId);
}

export function level7LessonId(realm: Cave7Realm, week: number, lesson: number) {
  return `${realm === "number" ? "y7" : `y7-${realm}`}-w${week}-l${lesson}`;
}

/** Student routes for live Level 7. The final week ends with the post-test instead of a quiz. */
export function level7LiveHref(realm: Cave7Realm, week: number, activity: number | "quiz" | "posttest" | "week") {
  const base = `year=${encodeURIComponent("Year 7")}&realm_id=${realm}`;
  if (activity === "posttest" || (activity === "quiz" && week === cave7WeekCount(realm))) return `/posttest?${base}`;
  if (activity === "week") return `/program?${base}&week=${week}&expedition=1`;
  if (activity === "quiz") return `/level7/quiz?${base}&week=${week}&type=quiz&n=1`;
  return `/lesson?${base}&week=${week}&lessonId=${level7LessonId(realm, week, activity)}`;
}
