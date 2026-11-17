import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";
import type { ParentActivityFeedItem, ParentReportLevel } from "@/lib/parent-insights";

/**
 * Plain-language status for the Parent views: how recent work is going in a
 * realm, what happened this week, and where week skips stand.
 *
 * A child can be on a different level in every realm, so nothing here makes
 * one overall "on track" judgement. Everything is per realm, from the child's
 * own scores. Pure functions only: no data fetching, no React.
 */

/** Recent scores at or above the weekly quiz pass mark are going well. */
export const GOING_WELL_PERCENT = ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent;
/** Below this, a realm needs practice (the same 60% "Developing" line the weekly journey uses). */
export const GETTING_THERE_PERCENT = 60;
/** How many recent lessons and quizzes a realm's band is averaged over. */
const RECENT_SCORE_COUNT = 3;

export type ScoreBand = "going-well" | "getting-there" | "needs-practice";

export const SCORE_BAND_LABEL: Record<ScoreBand, string> = {
  "going-well": "Going well",
  "getting-there": "Getting there",
  "needs-practice": "Needs practice",
};

export function scoreBand(percent: number): ScoreBand {
  if (percent >= GOING_WELL_PERCENT) return "going-well";
  if (percent >= GETTING_THERE_PERCENT) return "getting-there";
  return "needs-practice";
}

type ScoredItem = ParentActivityFeedItem & { accuracy: number };

function isScoredWork(item: ParentActivityFeedItem): item is ScoredItem {
  return (item.kind === "lesson" || item.kind === "quiz") && typeof item.accuracy === "number";
}

function newestFirst(left: ParentActivityFeedItem, right: ParentActivityFeedItem) {
  return Date.parse(right.completedAt) - Date.parse(left.completedAt);
}

function average(values: readonly number[]) {
  return values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : null;
}

export type RealmScoreSummary = {
  band: ScoreBand | null;
  average: number | null;
  /** One short line of evidence behind the band, e.g. "Week 6 quiz 55%, 2 tries · needs 80%". */
  detail: string | null;
};

/** How the latest lessons and quizzes on this realm's current level went. */
export function summariseRealmScores(
  feed: readonly ParentActivityFeedItem[],
  realmId: string,
  workingLevel: string,
): RealmScoreSummary {
  const scored = feed
    .filter((item) => item.realmId === realmId && item.workingLevel === workingLevel)
    .filter(isScoredWork)
    .sort(newestFirst);
  const recent = scored.slice(0, RECENT_SCORE_COUNT);
  const recentAverage = average(recent.map((item) => item.accuracy));
  if (recentAverage === null) return { band: null, average: null, detail: null };

  const latestQuiz = recent.find((item) => item.kind === "quiz");
  let detail: string;
  if (latestQuiz) {
    const tries = scored.filter((item) => item.kind === "quiz" && item.week === latestQuiz.week).length;
    const weekLabel = latestQuiz.week ? `Week ${latestQuiz.week} quiz` : "Quiz";
    detail = latestQuiz.accuracy >= GOING_WELL_PERCENT
      ? `${weekLabel} ${latestQuiz.accuracy}%`
      : `${weekLabel} ${latestQuiz.accuracy}%${tries > 1 ? `, ${tries} tries` : ""} · needs ${GOING_WELL_PERCENT}%`;
  } else {
    detail = `Last lesson ${recent[0].accuracy}%`;
  }
  return { band: scoreBand(recentAverage), average: recentAverage, detail };
}

/** Monday 00:00 of the week containing `today`, local time. */
export function startOfWeek(today = new Date()) {
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

export type WeekSummary = {
  finished: number;
  average: number | null;
  strongestRealmId: string | null;
  needsPracticeRealmId: string | null;
};

/** What was finished since Monday, and which realms stood out either way. */
export function summariseWeek(feed: readonly ParentActivityFeedItem[], today = new Date()): WeekSummary {
  const since = startOfWeek(today).getTime();
  const thisWeek = feed.filter((item) => Date.parse(item.completedAt) >= since);
  const scored = thisWeek.filter(isScoredWork);

  const byRealm = new Map<string, number[]>();
  for (const item of scored) byRealm.set(item.realmId, [...(byRealm.get(item.realmId) ?? []), item.accuracy]);
  const realmAverages = [...byRealm.entries()]
    .map(([realmId, scores]) => ({ realmId, average: average(scores) ?? 0 }))
    .sort((left, right) => right.average - left.average);

  const strongest = realmAverages.length > 1 && realmAverages[0].average >= GOING_WELL_PERCENT ? realmAverages[0] : null;
  const weakest = realmAverages.at(-1);
  const needsPractice = weakest && weakest.average < GETTING_THERE_PERCENT ? weakest : null;

  return {
    finished: thisWeek.length,
    average: average(scored.map((item) => item.accuracy)),
    strongestRealmId: strongest?.realmId ?? null,
    needsPracticeRealmId: needsPractice?.realmId ?? null,
  };
}

export type RealmTests = {
  pretestScore: number | null;
  posttestScore: number | null;
  /** The most recent earlier level in this realm with both tests done. */
  finishedLevel: { workingLevel: string; pretestScore: number; posttestScore: number } | null;
};

/** Pre-test and post-test for the realm's current level, plus the last finished level. */
export function realmTests(levels: readonly ParentReportLevel[], realmId: string, workingLevel: string): RealmTests {
  const inRealm = levels.filter((level) => level.realmId === realmId);
  const current = inRealm.find((level) => level.workingLevel === workingLevel);
  const finished = inRealm
    .filter((level) => level.workingLevel !== workingLevel && level.pretestScore !== null && level.posttestScore !== null)
    .sort((left, right) => Date.parse(right.posttestCompletedAt ?? "") - Date.parse(left.posttestCompletedAt ?? ""))[0];
  return {
    pretestScore: current?.pretestScore ?? null,
    posttestScore: current?.posttestScore ?? null,
    finishedLevel: finished
      ? { workingLevel: finished.workingLevel, pretestScore: finished.pretestScore ?? 0, posttestScore: finished.posttestScore ?? 0 }
      : null,
  };
}

/** Skip state as returned by get_parent_child_week_skips. */
export type ParentWeekSkips = {
  canSkip: boolean;
  limit: number;
  realms: Array<{
    realmId: string;
    workingLevel: string;
    weekCount: number;
    skippedWeeks: Array<{ week: number; skippedAt: string }>;
    skipsLeft: number;
  }>;
};

export type RealmSkipState = {
  /** Skip data loaded; without it nothing is said about who manages weeks. */
  known: boolean;
  /** This parent may skip on this realm's current level (home learner, placed, skips left, not the last week). */
  canSkipNow: boolean;
  /** Skips are offered at all (home learner); false hides skip controls entirely. */
  offered: boolean;
  skipsLeft: number;
  limit: number;
  weekCount: number | null;
  skippedWeeks: ReadonlyArray<{ week: number; skippedAt: string }>;
};

export function realmSkipState(
  skips: ParentWeekSkips | null,
  realmId: string,
  workingLevel: string,
  currentWeek: number | null,
): RealmSkipState {
  const realm = skips?.realms.find((entry) => entry.realmId === realmId && entry.workingLevel === workingLevel);
  const offered = Boolean(skips?.canSkip);
  const skipsLeft = realm?.skipsLeft ?? skips?.limit ?? 0;
  const weekCount = realm?.weekCount ?? null;
  return {
    known: skips !== null,
    offered,
    canSkipNow: offered && Boolean(realm) && currentWeek !== null && weekCount !== null && currentWeek < weekCount && skipsLeft > 0,
    skipsLeft,
    limit: skips?.limit ?? 0,
    weekCount,
    skippedWeeks: realm?.skippedWeeks ?? [],
  };
}
