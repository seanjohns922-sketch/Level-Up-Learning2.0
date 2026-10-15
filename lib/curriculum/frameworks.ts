import { AC9_MATHS } from "@/data/curriculum/ac9-maths";
import { NSW_FOCUS_AREAS, type NswFocusArea } from "@/data/curriculum/nsw-maths";
import { VIC_FROM_AC9, VIC_MATHS_CODES } from "@/data/curriculum/vic-maths";

/**
 * Curriculum frameworks a scope and sequence can be printed against. Lessons are
 * tagged with Australian Curriculum v9 codes only; Victorian and NSW codes are
 * derived from those tags through the official-source tables in data/curriculum.
 */

export type CurriculumFramework = "aus" | "vic" | "nsw";

export const FRAMEWORKS: Record<CurriculumFramework, { label: string; meta: string }> = {
  aus: { label: "Australian Curriculum v9", meta: "Australian Curriculum v9 · Mathematics" },
  vic: { label: "Victorian Curriculum 2.0", meta: "Victorian Curriculum 2.0 · Mathematics" },
  nsw: { label: "NSW Syllabus (2022)", meta: "NSW Mathematics K–10 Syllabus (2022)" },
};

/** AC9 strand prefixes each maths realm is responsible for. */
const REALM_STRANDS: Record<string, string[]> = {
  number: ["N"],
  measurement: ["M"],
  space: ["SP"],
  statistics: ["ST"],
  algebra: ["A"],
  pattern: ["A"],
  probability: ["P"],
  chance: ["P"],
};

const LEVEL_KEYS = ["F", "1", "2", "3", "4", "5", "6", "7", "8"];

function levelKey(yearLabel: string): string | null {
  if (yearLabel === "Prep" || yearLabel === "Foundation") return "F";
  const match = /^Year (\d+)$/.exec(yearLabel);
  return match && LEVEL_KEYS.includes(match[1]!) ? match[1]! : null;
}

const NSW_STAGE: Record<string, NswFocusArea["stage"]> = { F: "ES1", "1": "S1", "2": "S1", "3": "S2", "4": "S2", "5": "S3", "6": "S3" };

export function isAc9Code(code: string): boolean {
  return code in AC9_MATHS;
}

/** Whether a framework view exists for this realm and level (NSW is mapped to Stage 3 only). */
export function frameworkAvailable(framework: CurriculumFramework, yearLabel: string, genreId: string): boolean {
  const level = levelKey(yearLabel);
  if (!level || !REALM_STRANDS[genreId]) return false;
  return framework !== "nsw" || level in NSW_STAGE;
}

function nswAreasForLevel(level: string): NswFocusArea[] {
  const stage = NSW_STAGE[level];
  return stage ? NSW_FOCUS_AREAS.filter((area) => area.stage === stage) : [];
}

/** A lesson's AC9 tags expressed in the chosen framework (unique, in order). */
export function frameworkCodes(framework: CurriculumFramework, ac9Codes: string[], yearLabel: string): string[] {
  const tags = [...new Set(ac9Codes.map((code) => code.trim()).filter(isAc9Code))];
  if (framework === "aus") return tags;
  if (framework === "vic") return [...new Set(tags.map((code) => VIC_FROM_AC9[code]).filter((code): code is string => Boolean(code)))];
  const level = levelKey(yearLabel);
  const areas = level ? nswAreasForLevel(level) : [];
  return [...new Set(areas.filter((area) => area.ac9.some((code) => tags.includes(code))).flatMap((area) => area.outcomes))];
}

export type CoverageLesson = { week: number; lesson: number; title: string; ac9: string[] };

export type CoverageRow = {
  /** Code(s) shown in the badge: AC9 or VC2 code, or NSW outcome codes. */
  codes: string[];
  /** Description (AC9), equivalent AC9 code (Victoria) or focus area (NSW). */
  label: string;
  weeks: number[];
  lessons: string[];
  /** Set when nothing at this level teaches the code. */
  uncovered?: boolean;
};

function lessonRef(lesson: CoverageLesson) {
  return `${lesson.week}.${lesson.lesson} ${lesson.title}`;
}

function rowFrom(codes: string[], label: string, taught: CoverageLesson[]): CoverageRow {
  return {
    codes,
    label,
    weeks: [...new Set(taught.map((lesson) => lesson.week))].sort((a, b) => a - b),
    lessons: taught.map(lessonRef),
    uncovered: taught.length === 0,
  };
}

/**
 * Code-by-code coverage for one realm and level: every code the realm is responsible
 * for at this level (so gaps show), plus any other codes its lessons teach.
 */
export function coverageRows(framework: CurriculumFramework, yearLabel: string, genreId: string, lessons: CoverageLesson[]): CoverageRow[] {
  const level = levelKey(yearLabel);
  const strands = REALM_STRANDS[genreId] ?? [];
  if (!level) return [];
  const clean = lessons.map((lesson) => ({ ...lesson, ac9: lesson.ac9.map((code) => code.trim()).filter(isAc9Code) }));
  const levelCodes = Object.keys(AC9_MATHS).filter((code) => strands.some((strand) => new RegExp(`^AC9M${level}${strand}\\d`).test(code)));
  const taughtCodes = [...new Set(clean.flatMap((lesson) => lesson.ac9))];
  // The realm's own codes first, then anything else its lessons also teach.
  const ac9Universe = [...levelCodes.sort(), ...taughtCodes.filter((code) => !levelCodes.includes(code)).sort()];

  if (framework === "aus") {
    return ac9Universe.map((code) => rowFrom([code], AC9_MATHS[code] ?? "", clean.filter((lesson) => lesson.ac9.includes(code))));
  }

  if (framework === "vic") {
    const vicStrandCodes = VIC_MATHS_CODES.filter((code) => strands.some((strand) => new RegExp(`^VC2M${level}${strand}\\d`).test(code)));
    const fromAc9 = new Map<string, string[]>();
    for (const code of ac9Universe) {
      const vic = VIC_FROM_AC9[code];
      if (vic) fromAc9.set(vic, [...(fromAc9.get(vic) ?? []), code]);
    }
    const universe = [...vicStrandCodes.sort(), ...[...fromAc9.keys()].filter((code) => !vicStrandCodes.includes(code)).sort()];
    return universe.map((vic) => {
      const ac9 = fromAc9.get(vic) ?? Object.entries(VIC_FROM_AC9).filter(([, value]) => value === vic).map(([key]) => key);
      const label = ac9.length ? `Equivalent to ${ac9.join(", ")}` : "Victorian-only content (no AC9 equivalent)";
      return rowFrom([vic], label, clean.filter((lesson) => lesson.ac9.some((code) => ac9.includes(code))));
    });
  }

  const areas = nswAreasForLevel(level).filter((area) => area.ac9.some((code) => ac9Universe.includes(code)));
  return areas.map((area) =>
    rowFrom(area.outcomes, `${area.name}${area.part ? ` ${area.part}` : ""}`, clean.filter((lesson) => lesson.ac9.some((code) => area.ac9.includes(code)))),
  );
}
