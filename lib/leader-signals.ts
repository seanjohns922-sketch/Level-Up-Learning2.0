import { AC_STRANDS, type AcStrand } from "@/lib/curriculum/ac-standards";
import { PROFICIENCY_META, share, type Distribution } from "@/lib/proficiency";

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
const NEEDS_SHARE = 25;
const STRAND_NEEDS_SHARE = 20;
const EXCEEDING_SHARE = 15;
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
  const needsLabel = PROFICIENCY_META.needs.label.toLowerCase();

  // 1. School year with the largest share needing support (whole school only).
  if (scope === "school") {
    const year = distributions.years
      .filter(([label, row]) => label !== "Not recorded" && row.total >= MIN_GROUP && share(row.counts.needs, row.total) >= NEEDS_SHARE)
      .sort((a, b) => share(b[1].counts.needs, b[1].total) - share(a[1].counts.needs, a[1].total))[0];
    if (year) {
      concerns.push({
        key: `year-${year[0]}`,
        tone: "concern",
        headline: `${year[0]}: ${share(year[1].counts.needs, year[1].total)}% ${needsLabel}`,
        detail: `${year[1].counts.needs} of ${year[1].total} students are working below ${year[0]}.`,
        target: "intervention",
        filter: { yearLevel: year[0] },
      });
    }
  }

  // 2. Strand with the largest share needing support.
  const strand = distributions.strands
    .filter(([, row]) => row.total >= MIN_GROUP && share(row.counts.needs, row.total) >= STRAND_NEEDS_SHARE)
    .sort((a, b) => share(b[1].counts.needs, b[1].total) - share(a[1].counts.needs, a[1].total))[0];
  if (strand) {
    concerns.push({
      key: `strand-${strand[0]}`,
      tone: "concern",
      headline: `${AC_STRANDS[strand[0]].label}: ${share(strand[1].counts.needs, strand[1].total)}% ${needsLabel}`,
      detail: `${strand[1].counts.needs} of ${strand[1].total} students placed in ${AC_STRANDS[strand[0]].label}.`,
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
      headline: `${list}: ${none ? "no pre-tests yet" : "few students tested"}`,
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
    .filter(([, row]) => row.total >= MIN_GROUP && share(row.counts.exceeding, row.total) >= EXCEEDING_SHARE)
    .sort((a, b) => share(b[1].counts.exceeding, b[1].total) - share(a[1].counts.exceeding, a[1].total))[0];
  if (best) {
    strengths.push({
      key: `strength-${best[0]}`,
      tone: "strength",
      headline: `${best[0]}: ${share(best[1].counts.exceeding, best[1].total)}% exceeding`,
      detail: `${best[1].counts.exceeding} of ${best[1].total} students are working above their school year.`,
      target: "placement",
      filter: best[2],
    });
  }

  return [...concerns, ...watches].slice(0, MAX_SIGNALS - strengths.length).concat(strengths);
}
