import { isLiveLevel7, level7LiveHref } from "./level7-release";
import { isLiveLevel8, level8LiveHref } from "./level8-release";

/** The live student route for a Level 7 or Level 8 activity, or null when that level is not live for this realm. */
export function liveExpeditionHref(year: string | null | undefined, realmId: string | null | undefined, week: number, activity: number | "quiz" | "posttest" | "week") {
  if (isLiveLevel7(year, realmId)) return level7LiveHref(realmId, week, activity);
  if (isLiveLevel8(year, realmId)) return level8LiveHref(realmId, week, activity);
  return null;
}
