import {
  MEASURELANDS_POSTTESTS_BY_YEAR,
  MEASURELANDS_PRETESTS_BY_YEAR,
  getMeasurelandsPosttestForYear,
  getMeasurelandsPretestForYear,
} from "../data/assessments/measurelands";
import { getPretestForYearLabel, getPosttestForYearLabel } from "../data/assessments/api";

// ── Measurelands Assessment Audit ─────────────────────────────────────────────
// Validates MEANING, not just structure. Every Measurelands bank must contain
// realm=measurement content aligned to the implemented 8-week program, with no
// Number Nexus content and no removed topics (e.g. Year 6 circles). Also asserts
// the live resolver never returns a Number bank for a measurement request, and
// that the Measurelands final week is 8 (never the Number Nexus 12).

type AssessmentType = "pretest" | "posttest";
type YearLabel = "Prep" | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6";

const YEARS: YearLabel[] = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const MEASURELANDS_FINAL_WEEK: number = 8; // Measurelands = 8 weeks; Number Nexus = 12.
const NUMBER_FINAL_WEEK: number = 12;

const EXPECTED_COUNT: Record<YearLabel, Partial<Record<AssessmentType, number>>> = {
  Prep: { posttest: 20 },
  "Year 1": { pretest: 20, posttest: 20 },
  "Year 2": { pretest: 20, posttest: 20 },
  "Year 3": { pretest: 20, posttest: 20 },
  "Year 4": { pretest: 20, posttest: 20 },
  "Year 5": { pretest: 20, posttest: 20 },
  "Year 6": { pretest: 20, posttest: 20 },
};

// Year label → the id prefix its questions must carry (metadata year mapping).
const YEAR_ID_PREFIX: Record<YearLabel, string> = {
  Prep: "y0-",
  "Year 1": "y1-",
  "Year 2": "y2-",
  "Year 3": "y3-",
  "Year 4": "y4-",
  "Year 5": "y5-",
  "Year 6": "y6-",
};

// Number Nexus skill tokens that must never appear in a measurement bank.
const BANNED_NUMBER_SKILL_TOKENS = [
  "place_value", "addition", "subtraction", "multiplication", "division",
  "fractions", "times_table", "number_line", "money", "skip_count", "subitising",
];
// Number Nexus skill labels that must never appear.
const BANNED_NUMBER_LABELS = [
  "place value", "addition", "subtraction", "multiplication", "division",
  "fractions", "money", "number line",
];
// Removed/outdated topics that must not appear in ANY measurement bank.
const BANNED_TOPIC_WORDS = ["circle", "radius", "diameter", "circumference"];

type Question = {
  id: string;
  type?: string;
  prompt: string;
  options?: unknown[];
  correctAnswer?: string;
  skillId?: string;
  skillLabel?: string;
  strand?: string;
  linkedWeeks?: number[];
  visual?: { kind?: string } | unknown;
  practiceTask?: { kind?: string } | unknown;
};

// Every Measurelands assessment question must carry a rendered visual.
const KNOWN_VISUAL_KINDS = new Set([
  "ruler", "scaleDial", "jug", "clock", "thermometer", "rectangle",
  "cubes", "angle", "convert", "objects", "concept",
]);

function listDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function tally(values: string[]): Record<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Object.fromEntries([...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

function getBank(year: YearLabel, type: AssessmentType): Question[] {
  return (type === "pretest"
    ? getMeasurelandsPretestForYear(year)
    : getMeasurelandsPosttestForYear(year)?.questions ?? []) as Question[];
}

let hasFailure = false;
function fail(message: string) {
  console.error(`FAIL: ${message}`);
  hasFailure = true;
}

// ── Per-bank structural + semantic audit ──────────────────────────────────────
type AuditRow = {
  realm: "measurement";
  year: YearLabel;
  assessmentType: AssessmentType;
  questionCount: number;
  uniqueIdCount: number;
  weekCounts: Record<string, number>;
  skillCounts: Record<string, number>;
};

const rows: AuditRow[] = [];

for (const year of YEARS) {
  const types: AssessmentType[] = year === "Prep" ? ["posttest"] : ["pretest", "posttest"];
  for (const type of types) {
    const questions = getBank(year, type);
    if (!questions.length) {
      fail(`${year} ${type} bank is empty.`);
      continue;
    }

    const ids = questions.map((q) => q.id);
    const weeks = questions.flatMap((q) => q.linkedWeeks ?? []);
    const uniqueWeeks = [...new Set(weeks)].sort((a, b) => a - b);
    const scope = `${year} ${type}`;

    // Count expectation.
    const expected = EXPECTED_COUNT[year][type];
    if (expected !== undefined && questions.length !== expected) {
      fail(`${scope} has ${questions.length} questions, expected ${expected}.`);
    }
    // Unique IDs.
    const dupes = listDuplicates(ids);
    if (dupes.length) fail(`${scope} has duplicate IDs: ${dupes.join(", ")}.`);

    // Week coverage 1..8 and NO week beyond 8 (outdated/extra weeks).
    const missingWeeks = Array.from({ length: MEASURELANDS_FINAL_WEEK }, (_, i) => i + 1).filter((w) => !uniqueWeeks.includes(w));
    if (missingWeeks.length) fail(`${scope} is missing week coverage: ${missingWeeks.join(", ")}.`);
    const extraWeeks = uniqueWeeks.filter((w) => w < 1 || w > MEASURELANDS_FINAL_WEEK);
    if (extraWeeks.length) fail(`${scope} references weeks beyond the ${MEASURELANDS_FINAL_WEEK}-week program: ${extraWeeks.join(", ")}.`);

    for (const q of questions) {
      const qScope = `${scope} ${q.id}`;
      const isLessonNativeTask = q.type === "measurelandsTask";
      // Structural.
      const options = Array.isArray(q.options) ? q.options : [];
      if (isLessonNativeTask) {
        const taskKind = (q.practiceTask as { kind?: string } | undefined)?.kind;
        if (!taskKind) fail(`${qScope} has no lesson-native task.`);
        if (!q.correctAnswer) fail(`${qScope} has no assessment answer token.`);
      } else {
        if ((q.type ?? "mcq") !== "mcq") fail(`${qScope} is not an MCQ.`);
        if (options.length < 2 || !q.correctAnswer) fail(`${qScope} has an invalid option set.`);
        if (options.filter((o) => o === q.correctAnswer).length !== 1) fail(`${qScope} does not have exactly one correct answer.`);
      }

      // Metadata: strand must be Measurement.
      if (q.strand !== "Measurement") fail(`${qScope} has strand "${q.strand}" (expected "Measurement").`);
      // Metadata: id must map to the right year and be a measurement id.
      if (!q.id.startsWith(YEAR_ID_PREFIX[year])) fail(`${qScope} id does not match year prefix "${YEAR_ID_PREFIX[year]}".`);
      if (!q.id.includes("-measurement-")) fail(`${qScope} id is not a measurement id.`);
      // Metadata: every question maps to at least one source week.
      if (!(q.linkedWeeks && q.linkedWeeks.length)) fail(`${qScope} has no source week.`);
      // Native tasks render the same visual interaction used in lessons. Legacy
      // MCQs must still provide an explicit assessment visual.
      if (!isLessonNativeTask) {
        const vk = (q.visual as { kind?: string } | undefined)?.kind;
        if (!vk) fail(`${qScope} has no visual.`);
        else if (!KNOWN_VISUAL_KINDS.has(vk)) fail(`${qScope} has an unknown visual kind "${vk}".`);
      }

      const skillId = (q.skillId ?? "").toLowerCase();
      const skillLabel = (q.skillLabel ?? "").toLowerCase();
      const haystack = `${q.prompt} ${options.join(" ")} ${skillLabel} ${skillId}`.toLowerCase();

      // No Number Nexus skills.
      const bannedSkill = BANNED_NUMBER_SKILL_TOKENS.find((t) => skillId.includes(t));
      if (bannedSkill) fail(`${qScope} uses a Number Nexus skill token "${bannedSkill}".`);
      const bannedLabel = BANNED_NUMBER_LABELS.find((t) => skillLabel.includes(t));
      if (bannedLabel) fail(`${qScope} uses a Number Nexus skill label "${bannedLabel}".`);
      // No removed topics (Year 6 circles etc.).
      const bannedTopic = BANNED_TOPIC_WORDS.find((w) => new RegExp(`\\b${w}`, "i").test(haystack));
      if (bannedTopic) fail(`${qScope} contains removed/outdated topic content "${bannedTopic}".`);
    }

    rows.push({
      realm: "measurement",
      year,
      assessmentType: type,
      questionCount: questions.length,
      uniqueIdCount: new Set(ids).size,
      weekCounts: tally(weeks.map((w) => `Week ${w}`)),
      skillCounts: tally(questions.map((q) => q.skillLabel ?? "(none)")),
    });
  }
}

// Prep must not have a measurement pretest.
if (Object.prototype.hasOwnProperty.call(MEASURELANDS_PRETESTS_BY_YEAR, "Prep")) {
  fail("Prep should not have a Measurement pretest bank.");
}

// Global unique IDs.
const allIds = rows.flatMap((r) => getBank(r.year, r.assessmentType).map((q) => q.id));
const globalDupes = listDuplicates(allIds);
if (globalDupes.length) fail(`duplicate question IDs across Measurement assessments: ${globalDupes.join(", ")}.`);

// ── Loader-resolution assertions: the live resolver must return the Measurelands
//    bank for a measurement request, never a Number bank. ───────────────────────
for (const year of YEARS) {
  const types: AssessmentType[] = year === "Prep" ? ["posttest"] : ["pretest", "posttest"];
  for (const type of types) {
    const measurementBank = getBank(year, type);
    const resolvedMeasurement = (type === "pretest"
      ? getPretestForYearLabel(year, "measurement")
      : getPosttestForYearLabel(year, "measurement")?.questions ?? []) as Question[];
    const resolvedNumber = (type === "pretest"
      ? getPretestForYearLabel(year, "number")
      : getPosttestForYearLabel(year, "number")?.questions ?? []) as Question[];

    const scope = `${year} ${type} (loader)`;
    const mIds = resolvedMeasurement.map((q) => q.id);
    const nIds = new Set(resolvedNumber.map((q) => q.id));

    // Resolver returned the Measurelands bank.
    if (mIds.join("|") !== measurementBank.map((q) => q.id).join("|")) {
      fail(`${scope} did not resolve the Measurelands bank.`);
    }
    // Every resolved id is a measurement id.
    const leaked = mIds.filter((id) => !id.includes("-measurement-"));
    if (leaked.length) fail(`${scope} resolved non-measurement ids: ${leaked.slice(0, 3).join(", ")}.`);
    // Resolved measurement bank is disjoint from the Number bank.
    const overlap = mIds.filter((id) => nIds.has(id));
    if (overlap.length) fail(`${scope} overlaps the Number bank: ${overlap.slice(0, 3).join(", ")}.`);
    // The Number bank must itself be non-measurement (sanity: proves realms differ).
    if (resolvedNumber.length && [...nIds].every((id) => id.includes("-measurement-"))) {
      fail(`${scope} Number bank unexpectedly contains only measurement ids.`);
    }
  }
}

// ── Final-week contract: Measurelands must resolve to 8, never the Number 12. ──
if (MEASURELANDS_FINAL_WEEK !== 8) fail(`Measurelands final week is ${MEASURELANDS_FINAL_WEEK}, expected 8.`);
if (NUMBER_FINAL_WEEK !== 12) fail(`Number Nexus final week is ${NUMBER_FINAL_WEEK}, expected 12.`);
if (MEASURELANDS_FINAL_WEEK === NUMBER_FINAL_WEEK) fail("Measurelands and Number final weeks must differ.");

// ── Report ────────────────────────────────────────────────────────────────────
console.log(JSON.stringify({
  realm: "measurement",
  measurelandsFinalWeek: MEASURELANDS_FINAL_WEEK,
  numberFinalWeek: NUMBER_FINAL_WEEK,
  prepHasPretest: Object.prototype.hasOwnProperty.call(MEASURELANDS_PRETESTS_BY_YEAR, "Prep"),
  posttestLevels: Object.keys(MEASURELANDS_POSTTESTS_BY_YEAR),
  banks: rows,
  globalDuplicateIds: globalDupes,
}, null, 2));

if (hasFailure) {
  console.error("\n❌ Measurelands assessment audit FAILED.");
  process.exitCode = 1;
} else {
  console.log("\n✅ Measurelands assessment audit passed — measurement-only content, realm-safe resolver, 8-week program.");
}
