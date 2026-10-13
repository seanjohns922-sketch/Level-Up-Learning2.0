import { AC_STRANDS, type AcStrand } from "@/lib/curriculum/ac-standards";
import { share, type Distribution } from "@/lib/proficiency";

/** "Where to look": a short ranked list of plain-English signals from the
 * proficiency distributions (each student once overall, once per strand).
 * Signals describe one group of students at a time; they never rank classes. */

export type LeaderSignal = {
  key: string;
  tone: "concern" | "watch" | "strength";
  headline: string;
  detail: string;
  target: "intervention" | "curriculum" | "classes" | "overview" | "placement";
  filter?: { yearLevel?: string; strand?: string };
};

type Distributions = {
  overall: Distribution;
  years: Array<[string, Distribution]>;
  strands: Array<[AcStrand, Distribution]>;
};

/** Groups smaller than this are too noisy to call out. */
const MIN_GROUP = 5;
const BELOW_SHARE = 30;
const STRAND_BELOW_SHARE = 25;
const ABOVE_SHARE = 15;
const LOW_PARTICIPATION = 50;
const MAX_SIGNALS = 5;

export function buildLeaderSignals(
  distributions: Distributions,
  activity: { students: number; activeThisWeek: number },
  scope: "school" | "class",
): LeaderSignal[] {
  const concerns: LeaderSignal[] = [];
  const watches: LeaderSignal[] = [];
  const strengths: LeaderSignal[] = [];
  // Below level here means Below or Well below.
  const below = (row: Distribution) => row.counts.below + row.counts.wellBelow;

  // 1. School year with the largest share needing support (whole school only).
  if (scope === "school") {
    const year = distributions.years
      .filter(([label, row]) => label !== "Not recorded" && row.total >= MIN_GROUP && share(below(row), row.total) >= BELOW_SHARE)
      .sort((a, b) => share(below(b[1]), b[1].total) - share(below(a[1]), a[1].total))[0];
    if (year) {
      concerns.push({
        key: `year-${year[0]}`,
        tone: "concern",
        headline: `${year[0]}: ${share(below(year[1]), year[1].total)}% below level`,
        detail: `${below(year[1])} of ${year[1].total} students, ${year[1].counts.wellBelow} of them a year or more behind.`,
        target: "intervention",
        filter: { yearLevel: year[0] },
      });
    }
  }

  // 2. Strand with the largest share needing support.
  const strand = distributions.strands
    .filter(([, row]) => row.total >= MIN_GROUP && share(below(row), row.total) >= STRAND_BELOW_SHARE)
    .sort((a, b) => share(below(b[1]), b[1].total) - share(below(a[1]), a[1].total))[0];
  if (strand) {
    concerns.push({
      key: `strand-${strand[0]}`,
      tone: "concern",
      headline: `${AC_STRANDS[strand[0]].label}: ${share(below(strand[1]), strand[1].total)}% below level`,
      detail: `${below(strand[1])} of ${strand[1].total} students tested in ${AC_STRANDS[strand[0]].label}, ${strand[1].counts.wellBelow} a year or more behind.`,
      target: "intervention",
      filter: { strand: strand[0] },
    });
  }

  // 3. Strands with little or no pre-test evidence.
  const thin = distributions.strands.filter(([, row]) => row.total < MIN_GROUP);
  if (thin.length && distributions.overall.total >= MIN_GROUP) {
    const names = thin.map(([id]) => AC_STRANDS[id].label);
    const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];
    const none = thin.every(([, row]) => row.total === 0);
    watches.push({
      key: "thin-strands",
      tone: "watch",
      headline: `${list}: ${none ? "no tests yet" : "few students tested"}`,
      detail: `${none ? "" : `${thin.map(([id, row]) => `${AC_STRANDS[id].label} ${row.total}`).join(" · ")}. `}${scope === "school" ? "Ask teachers to set these pre-tests so these strands can be reported." : "Set these pre-tests to see where your students are."}`,
      target: "placement",
    });
  }

  // 4. Participation in the last 7 days.
  if (activity.students >= MIN_GROUP && share(activity.activeThisWeek, activity.students) < LOW_PARTICIPATION) {
    watches.push({
      key: "participation",
      tone: "watch",
      headline: `${share(activity.activeThisWeek, activity.students)}% of students used RELIQ in the last 7 days`,
      detail: `${activity.activeThisWeek} of ${activity.students} students had a lesson, quiz or test.`,
      target: "classes",
    });
  }

  // 5. One strength: the largest share working above their year.
  const groups: Array<[string, Distribution, LeaderSignal["filter"]]> = [
    ...(scope === "school" ? distributions.years.filter(([label]) => label !== "Not recorded").map(([label, row]) => [label, row, { yearLevel: label }] as [string, Distribution, LeaderSignal["filter"]]) : []),
    ...distributions.strands.map(([id, row]) => [AC_STRANDS[id].label, row, { strand: id }] as [string, Distribution, LeaderSignal["filter"]]),
  ];
  const best = groups
    .filter(([, row]) => row.total >= MIN_GROUP && share(row.counts.above, row.total) >= ABOVE_SHARE)
    .sort((a, b) => share(b[1].counts.above, b[1].total) - share(a[1].counts.above, a[1].total))[0];
  if (best) {
    strengths.push({
      key: `strength-${best[0]}`,
      tone: "strength",
      headline: `${best[0]}: ${share(best[1].counts.above, best[1].total)}% above level`,
      detail: `${best[1].counts.above} of ${best[1].total} students are more than a term ahead.`,
      target: "placement",
      filter: best[2],
    });
  }

  return [...concerns, ...watches].slice(0, MAX_SIGNALS - strengths.length).concat(strengths);
}
