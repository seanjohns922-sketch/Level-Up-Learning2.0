import { AC_STRANDS, type AcStrand } from "@/lib/curriculum/ac-standards";
import { STANDING_META, standingForGap } from "@/lib/proficiency";
import { getCurriculumPlan } from "@/data/programs/genres";
import { COLORS, documentHtml, escapeHtml, footer, generatedOn, letterhead } from "@/lib/documents/reliq-document";
import type { SchoolBrand } from "@/lib/documents/school-reports";

/** Maths diagnostic report for one student. Page 1: Start, Mid and End
 * results, where they are against their school year, and the six-strand
 * profile. Page 2: each strand's two strongest and two weakest skills from
 * the latest whole-maths diagnostic.
 *
 * Each strand's checkpoints use the whole-maths diagnostic when it was sat,
 * otherwise the realm tests: the pre-test counts as Start, a post-test from
 * May to July as Mid, and a post-test from November to December as End.
 * Realm tests are scored on the shared scale (85%+ = the level; 40-84%
 * between the level below and the level; under 40% below it), and a pre-test
 * never pulls a student below their best result so far.
 *
 * The diagnostic records each level probe (score, total and the curriculum
 * codes it covered), not which individual questions were right, so page 2
 * ranks skills by the level probe they belong to. */

type ProbeScore = { level: string; score: number; total: number; percent: number; curriculumCodes?: string[] };
export type DiagnosticReportSitting = {
  checkpoint: "start" | "mid" | "end" | "ad_hoc";
  status: string;
  overall_level: number | null;
  completed_at: string | null;
  created_at: string;
  strand_results: Array<{ strand: AcStrand; status: string; measured_level: number | null; probe_scores: ProbeScore[] }>;
};

/** A realm pre-test or post-test, as stored in student_realm_assessments. */
export type RealmTestRow = { realm_id: string; assessment_type: string; working_level: string; score_percent: number | null; completed_at: string };

const CHECKPOINTS = ["start", "mid", "end"] as const;
type Checkpoint = (typeof CHECKPOINTS)[number];
const CHECKPOINT_LABEL: Record<Checkpoint, string> = { start: "Start", mid: "Mid year", end: "End of year" };
const STRANDS: AcStrand[] = ["number", "measurement", "space", "statistics", "algebra", "probability"];
const TOTAL_WEIGHT = STRANDS.reduce((sum, strand) => sum + AC_STRANDS[strand].weight, 0);
const STRONG_PERCENT = 60;
const WEIGHT_COLORS = [COLORS.carbon, "#2F4F0D", "#649A1E", "#A9DB57", COLORS.lime, "#DDF2B5"];
const YEARS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8"];

let codeTopicCache: Map<string, string> | null = null;
/** A plain-English name for each AC9 code: the week topic that teaches it. */
export function curriculumCodeTopics(): Map<string, string> {
  if (codeTopicCache) return codeTopicCache;
  const topics = new Map<string, string>();
  for (const year of YEARS) {
    for (const strand of STRANDS) {
      for (const week of getCurriculumPlan(year, strand)) {
        for (const lesson of week.lessons) {
          for (const code of lesson.curriculum ?? []) if (!topics.has(code)) topics.set(code, week.topic);
        }
      }
    }
  }
  codeTopicCache = topics;
  return topics;
}

function expectedAt(yearIndex: number, checkpoint: Checkpoint): number {
  if (yearIndex <= 0) return 0;
  return checkpoint === "start" ? yearIndex - 1 : checkpoint === "mid" ? yearIndex - 0.5 : yearIndex;
}

function expectationSentence(yearLevel: string, yearIndex: number, checkpoint: Checkpoint, expected: number): string {
  if (yearIndex <= 0) return "Prep students are expected to be at Ground (0) all year";
  const when = checkpoint === "end" ? `By the end of ${yearLevel}` : checkpoint === "mid" ? `Midway through ${yearLevel}` : `At the start of ${yearLevel}`;
  return `${when}, students are expected to be at ${checkpoint === "mid" ? "about " : ""}${expected.toFixed(1)}`;
}

const HATCH = `repeating-linear-gradient(45deg, ${COLORS.carbon} 0 1.5px, #FFFFFF 1.5px 4px)`;
const fmt = (value: number | null | undefined) => (value === null || value === undefined ? "—" : value.toFixed(1));
const signed = (value: number) => `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(1)}`;
const pctOfScale = (value: number) => `${((Math.max(0, Math.min(6, value)) / 6) * 100).toFixed(2)}%`;

const REALM_STRAND: Record<string, AcStrand> = { number: "number", measurement: "measurement", space: "space", statistics: "statistics", pattern: "algebra", chance: "probability" };
const PLACEMENT_DAYS = 21;
const DAY = 86400000;

function levelNumber(workingLevel: string): number | null {
  if (workingLevel === "Prep" || workingLevel === "Ground") return 0;
  const match = /^Year (\d)$/.exec(workingLevel);
  return match ? Number(match[1]) : null;
}

/** A realm test on the shared mastery scale (the diagnostic's own formula). */
export function realmTestLevel(workingLevel: string, percent: number): number | null {
  const level = levelNumber(workingLevel);
  if (level === null) return null;
  if (percent >= 85) return level;
  if (percent >= 40) return level - 1 + (percent - 40) / 45;
  return Math.max(0, level - 1 - Math.min(0.9, (40 - percent) / 40));
}

type CheckpointValue = { level: number; at: string; source: "diagnostic" | "pretest" | "posttest" };

/** Start / Mid / End per strand from this year's realm tests. */
function realmTestCheckpoints(rows: RealmTestRow[], year: number): Map<AcStrand, Partial<Record<Checkpoint, CheckpointValue>>> {
  const out = new Map<AcStrand, Partial<Record<Checkpoint, CheckpointValue>>>();
  const byStrand = new Map<AcStrand, Array<{ type: "pretest" | "posttest"; raw: number; at: string }>>();
  const seen = new Set<string>();
  for (const row of rows) {
    const strand = REALM_STRAND[row.realm_id];
    const type = /post/i.test(row.assessment_type) ? "posttest" : /pre/i.test(row.assessment_type) ? "pretest" : null;
    if (!strand || !type || row.score_percent === null || new Date(row.completed_at).getFullYear() !== year) continue;
    const raw = realmTestLevel(row.working_level, row.score_percent);
    // The same test saved more than once counts once.
    const key = `${strand}|${type}|${row.working_level}|${row.score_percent}|${row.completed_at.slice(0, 10)}`;
    if (raw === null || seen.has(key)) continue;
    seen.add(key);
    byStrand.set(strand, [...(byStrand.get(strand) ?? []), { type, raw, at: row.completed_at }]);
  }
  for (const [strand, tests] of byStrand) {
    tests.sort((a, b) => a.at.localeCompare(b.at));
    // A pre-test never pulls a student below their best since the last post-test.
    let floor = 0;
    const scored = tests.map((test) => {
      const level = test.type === "pretest" ? Math.max(test.raw, floor) : test.raw;
      floor = test.type === "pretest" ? Math.max(floor, level) : level;
      return { ...test, level };
    });
    const points: Partial<Record<Checkpoint, CheckpointValue>> = {};
    const pretests = scored.filter((test) => test.type === "pretest");
    if (pretests.length) {
      // The placement chain: pre-tests in the first three weeks; the last one is where they start.
      const first = Date.parse(pretests[0].at);
      const chain = pretests.filter((test) => Date.parse(test.at) - first <= PLACEMENT_DAYS * DAY);
      const start = chain[chain.length - 1];
      points.start = { level: start.level, at: start.at, source: "pretest" };
    }
    for (const test of scored.filter((item) => item.type === "posttest")) {
      const month = new Date(test.at).getMonth();
      if (month >= 4 && month <= 6) points.mid = { level: test.level, at: test.at, source: "posttest" };
      if (month >= 10) points.end = { level: test.level, at: test.at, source: "posttest" };
    }
    out.set(strand, points);
  }
  return out;
}

export function diagnosticReportHtml({ brand, student, sittings, realmTests = [], codeTopics = curriculumCodeTopics(), year = new Date().getFullYear() }: {
  brand: SchoolBrand;
  student: { name: string; yearLevel: string | null; className: string | null };
  sittings: DiagnosticReportSitting[];
  realmTests?: RealmTestRow[];
  codeTopics?: Map<string, string>;
  year?: number;
}): string {
  // The latest completed whole-maths sitting at each checkpoint.
  const byCheckpoint = new Map<Checkpoint, DiagnosticReportSitting>();
  const completed = [...sittings]
    .filter((sitting) => sitting.status === "completed" && sitting.checkpoint !== "ad_hoc")
    .sort((a, b) => (a.completed_at ?? a.created_at).localeCompare(b.completed_at ?? b.created_at));
  for (const sitting of completed) byCheckpoint.set(sitting.checkpoint as Checkpoint, sitting);
  const fromTests = realmTestCheckpoints(realmTests, year);

  // Each strand's value at each checkpoint: the diagnostic first, then realm tests.
  const values = new Map<Checkpoint, Map<AcStrand, CheckpointValue>>();
  for (const checkpoint of CHECKPOINTS) {
    const row = new Map<AcStrand, CheckpointValue>();
    for (const strand of STRANDS) {
      const sitting = byCheckpoint.get(checkpoint);
      const result = sitting?.strand_results.find((item) => item.strand === strand && item.status === "completed" && item.measured_level !== null);
      if (result && sitting) row.set(strand, { level: result.measured_level!, at: sitting.completed_at ?? sitting.created_at, source: "diagnostic" });
      else if (fromTests.get(strand)?.[checkpoint]) row.set(strand, fromTests.get(strand)![checkpoint]!);
    }
    values.set(checkpoint, row);
  }
  const sat = CHECKPOINTS.filter((checkpoint) => values.get(checkpoint)!.size > 0);
  const latest = sat.at(-1) ?? null;
  const first = sat[0] ?? null;
  const yearLevel = student.yearLevel ?? "Year not recorded";
  const yearIndex = YEARS.indexOf(student.yearLevel ?? "");

  const strandLevel = (checkpoint: Checkpoint, strand: AcStrand) => values.get(checkpoint)?.get(strand)?.level ?? null;
  // A strand's result stands until a later checkpoint replaces it.
  const carried = (checkpoint: Checkpoint, strand: AcStrand) => {
    let level: number | null = null;
    for (const item of CHECKPOINTS.slice(0, CHECKPOINTS.indexOf(checkpoint) + 1)) level = strandLevel(item, strand) ?? level;
    return level;
  };
  // Curriculum-weighted across the given strands' carried results.
  const weighted = (checkpoint: Checkpoint, strands: AcStrand[]) => {
    const rows = strands.map((strand) => [strand, carried(checkpoint, strand)] as const).filter(([, level]) => level !== null) as Array<readonly [AcStrand, number]>;
    if (!rows.length) return null;
    const weight = rows.reduce((sum, [strand]) => sum + AC_STRANDS[strand].weight, 0);
    return rows.reduce((sum, [strand, level]) => sum + level * AC_STRANDS[strand].weight, 0) / weight;
  };
  const overall = (checkpoint: Checkpoint) => {
    const row = values.get(checkpoint)!;
    if (!row.size) return null;
    const sitting = byCheckpoint.get(checkpoint);
    const allDiagnostic = row.size === STRANDS.length && [...row.values()].every((value) => value.source === "diagnostic");
    if (sitting && allDiagnostic && sitting.overall_level !== null) return sitting.overall_level;
    return weighted(checkpoint, STRANDS);
  };
  const sourceNote = (checkpoint: Checkpoint) => {
    const sources = new Set([...(values.get(checkpoint)?.values() ?? [])].map((value) => value.source));
    const words = [...sources].map((source) => (source === "diagnostic" ? "diagnostic" : source === "pretest" ? "pre-tests" : "post-tests"));
    return words.join(" + ");
  };
  const checkpointDate = (checkpoint: Checkpoint) => {
    const dates = [...(values.get(checkpoint)?.values() ?? [])].map((value) => value.at).sort();
    return dates.at(-1) ?? null;
  };

  const latestOverall = latest ? overall(latest) : null;
  const expected = latest && yearIndex >= 0 ? expectedAt(yearIndex, latest) : null;
  const standing = latestOverall !== null && expected !== null ? standingForGap(latestOverall - expected) : null;
  const meta = standing ? STANDING_META[standing] : null;
  const firstOverall = first ? overall(first) : null;
  // Growth compares the same strands at both ends: those with a first result.
  const firstStrands = first ? STRANDS.filter((strand) => strandLevel(first, strand) !== null) : [];
  const growthFrom = first ? weighted(first, firstStrands) : null;
  const growthTo = latest ? weighted(latest, firstStrands) : null;
  const growth = growthFrom !== null && growthTo !== null && first !== latest && firstOverall !== null ? growthTo - growthFrom : null;
  const strandGrowth = STRANDS.map((strand) => {
    const start = first ? strandLevel(first, strand) : null;
    const end = latest ? strandLevel(latest, strand) : null;
    return { strand, growth: start !== null && end !== null && first !== latest ? end - start : null };
  }).filter((row) => row.growth !== null).sort((a, b) => b.growth! - a.growth!);

  const hasSkills = completed.length > 0;
  const name = escapeHtml(student.name);
  const firstName = escapeHtml(student.name.split(" ")[0] || student.name);
  const metaLine = [brand.schoolName, student.className, String(new Date().getFullYear())].filter(Boolean).join(" · ");
  const head = letterhead({ audience: "school", label: "Maths diagnostic report", meta: metaLine, schoolLogo: brand.schoolLogo });

  const boxes = CHECKPOINTS.map((checkpoint) => {
    const value = overall(checkpoint);
    const date = checkpointDate(checkpoint);
    const isLatest = checkpoint === latest;
    const count = STRANDS.filter((strand) => carried(checkpoint, strand) !== null).length;
    const when = date
      ? `${new Intl.DateTimeFormat("en-AU", { month: "long", timeZone: "Australia/Melbourne" }).format(new Date(date))} · ${sourceNote(checkpoint)}${count < STRANDS.length ? ` · ${count} of 6 strands` : ""}`
      : "Not sat yet";
    const extra = isLatest && growth !== null ? ` · ${signed(growth)}` : "";
    const style = isLatest ? `background:${COLORS.carbon};color:#FFFFFF;border-color:${COLORS.carbon}` : checkpoint === "mid" ? `background:${COLORS.paper};border-color:#C9CDC5` : "background:#FFFFFF;border-color:#C9CDC5";
    return `<span class="cp" style="${style}"><span class="cp-l">${CHECKPOINT_LABEL[checkpoint]}</span><span class="h cp-v">${fmt(value)}</span><span class="cp-w">${escapeHtml(when + extra)}</span></span>`;
  }).join("");

  const summary = latest && latestOverall !== null && meta && expected !== null
    ? `<span class="chip" style="font-size:14px;padding:4px 12px;background:${meta.bg};color:${meta.fg};align-self:flex-start">${meta.label}</span>
       <span class="sum">${firstName} ${latest === "end" ? "finished on" : "is on"} <b>${fmt(latestOverall)}</b>. ${escapeHtml(expectationSentence(yearLevel, yearIndex, latest, expected))}, so ${firstName} is ${escapeHtml(meta.meaning)}.</span>
       ${growth !== null ? `<span class="sum">Growth since ${first === "start" ? "the start of the year" : "the first diagnostic"}: <b style="color:${COLORS.green}">${signed(growth)} level${Math.abs(growth) === 1 ? "" : "s"}</b>${strandGrowth[0] ? `. Strongest growth in ${escapeHtml(AC_STRANDS[strandGrowth[0].strand].label)} (${signed(strandGrowth[0].growth!)})` : ""}.</span>` : ""}`
    : `<span class="sum">The overall result appears once all six strands of a diagnostic are complete.</span>`;

  const profileRows = STRANDS.map((strand) => {
    const points = CHECKPOINTS.map((checkpoint) => [checkpoint, strandLevel(checkpoint, strand)] as const).filter(([, level]) => level !== null) as Array<[Checkpoint, number]>;
    const latestPoint = points.at(-1);
    const firstPoint = points[0];
    const strandStanding = latestPoint && yearIndex >= 0 ? STANDING_META[standingForGap(latestPoint[1] - expectedAt(yearIndex, latestPoint[0]))] : null;
    const dot = ([checkpoint, level]: [Checkpoint, number]) => {
      const style = checkpoint === "start" ? `background:#FFFFFF;border:2px solid ${COLORS.carbon};width:12px;height:12px;margin-left:-6px;top:10px`
        : checkpoint === "mid" ? `background:${HATCH};border:2px solid ${COLORS.carbon};width:14px;height:14px;margin-left:-7px;top:9px`
          : `background:${COLORS.carbon};width:16px;height:16px;margin-left:-8px;top:8px;box-shadow:0 0 0 2px #FFFFFF`;
      return `<span class="dot" style="left:${pctOfScale(level)};${style}"></span>`;
    };
    const span = firstPoint && latestPoint ? `<span class="span" style="left:${pctOfScale(Math.min(firstPoint[1], latestPoint[1]))};width:${pctOfScale(Math.abs(latestPoint[1] - firstPoint[1]))};background:${strandStanding?.bg ?? "#C9CDC5"}"></span>` : "";
    const strandGrowthValue = firstPoint && latestPoint && firstPoint[0] !== latestPoint[0] ? signed(latestPoint[1] - firstPoint[1]) : "";
    return `<div class="prow"><span class="pl"><b style="font-size:14px">${AC_STRANDS[strand].label}</b><span style="font-size:10.5px;color:${COLORS.faint};font-weight:700">Weight ${Math.round((AC_STRANDS[strand].weight / TOTAL_WEIGHT) * 100)}%</span></span>
      <span class="track"><span class="rail"></span>${span}${points.map(dot).join("")}</span>
      <span class="pv"><span class="h" style="font-size:18px">${fmt(latestPoint?.[1])}</span><span style="font-size:10.5px;font-weight:800;color:${COLORS.green}">${strandGrowthValue}</span></span>
      <span class="ps">${strandStanding ? `<span class="chip" style="background:${strandStanding.bg};color:${strandStanding.fg}">${strandStanding.label}</span>` : `<span class="chip" style="background:#E3E5E0;color:${COLORS.muted}">Not sat</span>`}</span></div>`;
  }).join("");

  const page1 = `${head}
    <section style="display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:stretch">
      <div style="display:flex;flex-direction:column;gap:6px">
        <span class="h" style="font-size:34px;line-height:1">${name}</span>
        <span style="font-size:14px;color:${COLORS.muted}">${escapeHtml([yearLevel, student.className, "Six-strand diagnostic", "Australian Curriculum v9"].filter(Boolean).join(" · "))}</span>
        <div style="display:flex;gap:8px;margin-top:10px">${boxes}</div>
      </div>
      <div style="border-radius:14px;background:${COLORS.paper};padding:14px 16px;display:flex;flex-direction:column;gap:8px">
        <span class="label">${latest === "end" ? `Where ${firstName} finished the year` : `Where ${firstName} is now`}</span>
        ${summary}
      </div>
    </section>
    <section class="card" style="padding:14px 18px 10px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px">
        <span class="h" style="font-size:16px">Maths profile · all six strands</span>
        <span style="display:flex;gap:14px;font-size:11px;color:${COLORS.muted};align-items:center">
          <span class="lg"><span style="width:9px;height:9px;border-radius:50%;border:2px solid ${COLORS.carbon}"></span>Start</span>
          <span class="lg"><span style="width:11px;height:11px;border-radius:50%;background:${HATCH};border:2px solid ${COLORS.carbon}"></span>Mid</span>
          <span class="lg"><span style="width:11px;height:11px;border-radius:50%;background:${COLORS.carbon}"></span>End</span>
        </span>
      </div>
      <div class="pgrid"><div class="prow head"><span></span><span class="scale"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></span><span></span><span></span></div>${profileRows}</div>
    </section>
    <section style="border-radius:16px;background:${COLORS.carbon};color:#FFFFFF;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;gap:16px">
      ${hasSkills
        ? `<span style="display:flex;flex-direction:column;gap:3px"><span class="h" style="font-size:15px">Strand by strand, on page 2</span><span style="font-size:12.5px;color:#E3E5E0">The two skills ${firstName} answered best in each strand, and the two to work on next.</span></span>
      <span class="chip" style="font-size:12px;padding:5px 12px;background:${COLORS.lime};color:${COLORS.carbon}">Turn over</span>`
        : `<span style="display:flex;flex-direction:column;gap:3px"><span class="h" style="font-size:15px">Skills strand by strand</span><span style="font-size:12.5px;color:#E3E5E0">The two skills ${firstName} does best in each strand, and the two to work on next, appear once ${firstName} sits a whole-maths diagnostic.</span></span>`}
    </section>
    <section style="border-radius:16px;background:${COLORS.paper};padding:14px 16px;display:grid;grid-template-columns:1fr 260px;gap:18px;align-items:center">
      <div style="display:flex;flex-direction:column;gap:8px"><span class="h" style="font-size:14px">How the overall level is worked out</span>
        <span style="font-size:12px;line-height:1.45;color:#3A3D40">Each strand counts in proportion to how much of the F–6 curriculum it covers (its number of AC v9 content descriptors). Number, the biggest strand, counts most.</span>
        <span style="display:flex;height:16px;border-radius:999px;overflow:hidden">${STRANDS.map((strand, index) => `<span style="width:${(AC_STRANDS[strand].weight / TOTAL_WEIGHT) * 100}%;background:${WEIGHT_COLORS[index]}"></span>`).join("")}</span></div>
      <div style="display:grid;grid-template-columns:1fr auto;gap:2px 10px;font-size:11.5px">${STRANDS.map((strand, index) => `<span style="display:inline-flex;align-items:center;gap:6px"><span style="width:9px;height:9px;border-radius:2px;background:${WEIGHT_COLORS[index]};border:1px solid #D5D8D1"></span>${AC_STRANDS[strand].label}</span><b style="text-align:right">${Math.round((AC_STRANDS[strand].weight / TOTAL_WEIGHT) * 100)}%</b>`).join("")}</div>
    </section>
    <p style="margin:0;font-size:11px;line-height:1.5;color:${COLORS.faint}">Each strand uses the whole-maths diagnostic when it was sat. Otherwise the pre-test counts as Start, a post-test from May to July as Mid, and a post-test from November to December as End.</p>
    ${footer("RELIQ · BrightUp Education · Levels on the Australian Curriculum scale (Level 4 complete = 4.0)", `${generatedOn()} · Page 1 of ${hasSkills ? 2 : 1}`)}`;

  // Page 2: per strand, the two codes from the strongest level probes and the
  // two from the weakest, from the latest diagnostic.
  const latestSitting = completed.at(-1) ?? null;
  const latestSittingCheckpoint = (latestSitting?.checkpoint ?? null) as Checkpoint | null;
  const skillCards = STRANDS.map((strand) => {
    const result = latestSitting?.strand_results.find((row) => row.strand === strand && row.status === "completed");
    const probes = (result?.probe_scores ?? []).filter((probe) => probe.total > 0 && (probe.curriculumCodes ?? []).length > 0);
    const ranked = [...probes].sort((a, b) => b.percent - a.percent);
    const pick = (list: ProbeScore[], exclude: Set<string>) => {
      const items: Array<{ code: string; topic: string; percent: number }> = [];
      for (const probe of list) {
        for (const code of probe.curriculumCodes ?? []) {
          if (items.length >= 2 || exclude.has(code) || items.some((item) => item.code === code)) continue;
          items.push({ code, topic: codeTopics.get(code) ?? AC_STRANDS[strand].label, percent: Math.round(probe.percent) });
        }
        if (items.length >= 2) break;
      }
      return items;
    };
    // Skills from levels answered at 60%+ are strengths; below 60% are next steps.
    const strong = ranked.filter((probe) => probe.percent >= STRONG_PERCENT);
    const weak = [...ranked].reverse().filter((probe) => probe.percent < STRONG_PERCENT);
    const well = pick(strong, new Set());
    const next = pick(weak, new Set(well.map((item) => item.code)));
    const points = CHECKPOINTS.map((checkpoint) => strandLevel(checkpoint, strand)).filter((level) => level !== null) as number[];
    const journey = points.length ? `${points.map((level) => level.toFixed(1)).join(" → ")}${points.length > 1 ? ` · ${signed(points[points.length - 1] - points[0])}` : ""}` : "Not sat yet";
    const latestLevel = latest ? strandLevel(latest, strand) : null;
    const strandStanding = latestLevel !== null && latest && yearIndex >= 0 ? STANDING_META[standingForGap(latestLevel - expectedAt(yearIndex, latest))] : null;
    const list = (items: typeof well, bg: string, fg: string, empty: string) => items.length
      ? items.map((item) => `<span class="sk" style="background:${bg}"><span style="font-size:12px;line-height:1.3"><b style="display:block;font-size:10px;color:${fg}">${escapeHtml(item.code)}</b>${escapeHtml(item.topic)}</span><b style="font-size:12px;text-align:right">${item.percent}%</b></span>`).join("")
      : `<span style="font-size:12px;color:${COLORS.muted}">${empty}</span>`;
    return `<article class="card" style="padding:12px 14px;display:flex;flex-direction:column;gap:9px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span style="display:flex;flex-direction:column"><span class="h" style="font-size:17px">${AC_STRANDS[strand].label}</span><span style="font-size:11px;color:${COLORS.muted}">${escapeHtml(journey)}</span></span>${strandStanding ? `<span class="chip" style="background:${strandStanding.bg};color:${strandStanding.fg}">${strandStanding.label}</span>` : ""}</div>
      <div style="display:flex;flex-direction:column;gap:5px"><span class="label" style="color:${COLORS.green}">Doing well</span>${list(well, COLORS.limeTint, COLORS.green, probes.length ? "No skill above 60% yet." : "Not enough questions to tell yet.")}</div>
      <div style="display:flex;flex-direction:column;gap:5px"><span class="label" style="color:#8A1C14">Work on next</span>${list(next, "#FFE3DF", "#8A1C14", probes.length ? "Nothing below 60%: ready to extend at the next level." : "Not enough questions to tell yet.")}</div>
    </article>`;
  }).join("");
  const latestWhen = latestSitting ? new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "Australia/Melbourne" }).format(new Date(latestSitting.completed_at ?? latestSitting.created_at)) : "";
  const page2 = `${head}
    <section style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px">
      <div><span class="h" style="font-size:26px;line-height:1">Strand by strand</span><div style="font-size:13px;color:${COLORS.muted};margin-top:4px">${escapeHtml([student.name, yearLevel, latestSittingCheckpoint ? `${CHECKPOINT_LABEL[latestSittingCheckpoint].toLowerCase()} diagnostic, ${latestWhen}` : ""].filter(Boolean).join(" · "))}</div></div>
      <span style="font-size:11.5px;color:${COLORS.muted};text-align:right;max-width:290px;line-height:1.4">For each strand: the two skills ${firstName} answered best and the two to work on next.</span>
    </section>
    <section style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-content:start">${skillCards}</section>
    <p style="margin:0;font-size:11px;color:${COLORS.faint}">Percentages are the share of questions answered correctly at the diagnostic level that covers each skill.</p>
    ${footer("RELIQ · BrightUp Education", `${generatedOn()} · Page 2 of 2`)}`;

  const css = `.cp{flex:1;border-radius:12px;padding:10px 12px;border:1.5px solid}
.cp-l{display:block;font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;opacity:.75}
.cp-v{display:block;font-size:26px;line-height:1.1}
.cp-w{display:block;font-size:11.5px;opacity:.8}
.sum{font-size:13px;line-height:1.45;color:#3A3D40}
.lg{display:inline-flex;align-items:center;gap:5px}
.lg span{display:inline-block;box-sizing:border-box}
.pgrid{display:flex;flex-direction:column;margin-top:8px}
.prow{display:grid;grid-template-columns:112px 1fr 44px 96px;gap:0 12px;align-items:center;padding:6px 0;border-top:1px solid #C9CDC5}
.prow.head{border-top:0;padding:0 0 2px}
.scale{display:flex;justify-content:space-between;font-size:10px;color:${COLORS.faint};font-weight:700}
.pl{display:flex;flex-direction:column}
.track{position:relative;height:32px}
.rail{position:absolute;left:0;right:0;top:13px;height:6px;border-radius:999px;background:#DADDD6}
.span{position:absolute;top:13px;height:6px;border-radius:999px}
.dot{position:absolute;border-radius:50%;box-sizing:border-box}
.pv{text-align:right;display:flex;flex-direction:column;line-height:1.1}
.ps{}
.sk{display:grid;grid-template-columns:1fr 42px;gap:8px;align-items:center;border-radius:9px;padding:6px 9px}`;
  return documentHtml({ title: `RELIQ maths diagnostic report — ${student.name}`, pages: hasSkills ? [page1, page2] : [page1], css });
}

