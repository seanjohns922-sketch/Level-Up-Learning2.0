import { LEVEL8_WEEK_COUNTS, type Level8Realm } from "./level8-config";
/** Authenticated demo routes while the authored bank completes its release review. */
export function level8DemoHref(
  realm: Level8Realm,
  week: number,
  activity: number | "week" | "quiz" | "posttest",
) {
  const base = `year=Year%208&realm_id=${realm}&week=${week}&expedition=1&teacher_preview=1&review=1`;
  if (
    activity === "posttest" ||
    (activity === "quiz" && week === LEVEL8_WEEK_COUNTS[realm])
  )
    return realm === "number"
      ? "/demo-review/number-level-8?form=posttest"
      : `/demo-review/${realm === "space" ? "starpath" : realm === "statistics" ? "statistica" : realm}-level8?form=posttest`;
  return `/demo-review/volcano/${realm}/${activity === "week" ? "week" : activity === "quiz" ? "quiz" : "lesson"}?${base}${typeof activity === "number" ? `&lessonId=y8-${realm}-w${week}-l${activity}` : ""}`;
}
export const level8Background = (realm: Level8Realm) =>
  `/backgrounds/level8/${realm}-stronghold.webp`;
