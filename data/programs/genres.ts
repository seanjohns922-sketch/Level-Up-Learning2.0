import type { WeekPlan, Lesson } from "./year1";
import { programs } from "./index";

export type Genre = {
  id: string;
  strand: string;        // e.g. "Number"
  realm: string;         // e.g. "Number Nexus"
  available: boolean;    // true = real curriculum, false = placeholder
  unlocksFromLevel: number; // 0 = Prep, 1..6 = Year 1..6. Hidden below this.
};

/** Year label → numeric key (Prep = 0, Year 1..6 = 1..6). */
function yearOrdinal(yearLabel: string): number {
  if (yearLabel === "Prep") return 0;
  const m = /Year\s+(\d)/.exec(yearLabel);
  return m ? Number(m[1]) : 0;
}

/** Master genre catalogue. Future strands unlock from Year 3+. */
const ALL_GENRES: Genre[] = [
  { id: "number",      strand: "Number",      realm: "Number Nexus",    available: true,  unlocksFromLevel: 0 },
  { id: "measurement", strand: "Measurement", realm: "Measurelands",    available: false, unlocksFromLevel: 0 },
  { id: "space",       strand: "Space",       realm: "Geospin",         available: false, unlocksFromLevel: 0 },
  { id: "reading",     strand: "Reading",     realm: "Reading Ridge",   available: false, unlocksFromLevel: 0 },
  { id: "writing",     strand: "Writing",     realm: "Inkwell Wilds",   available: false, unlocksFromLevel: 0 },
  { id: "grammar",     strand: "Grammar",     realm: "Runehaven Peaks", available: false, unlocksFromLevel: 0 },
  // Future strands — appear from Year 3+, always placeholder for now.
  { id: "statistics",  strand: "Statistics",  realm: "Datara",          available: false, unlocksFromLevel: 3 },
  { id: "algebra",     strand: "Algebra",     realm: "Patternox",       available: false, unlocksFromLevel: 3 },
  { id: "probability", strand: "Probability", realm: "Chanzia",         available: false, unlocksFromLevel: 3 },
];

/** Genres visible for a given year. Number has real curriculum from Prep upward. */
export function getGenresForYear(yearLabel: string): Genre[] {
  const ord = yearOrdinal(yearLabel);
  return ALL_GENRES
    .filter((g) => ord >= g.unlocksFromLevel)
    .map((g) => g);
}

/** Year label → numeric key for the `programs` map (Prep = 0, Year 1..6 = 1..6). */
function yearKey(yearLabel: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 | null {
  const map: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
    Prep: 0,
    "Year 1": 1, "Year 2": 2, "Year 3": 3,
    "Year 4": 4, "Year 5": 5, "Year 6": 6,
  };
  return map[yearLabel] ?? null;
}

/** Year label → lesson-id prefix used in `progress.completed_lesson_ids`. */
export function lessonIdPrefix(yearLabel: string): string {
  const k = yearKey(yearLabel);
  return k !== null ? `y${k}-` : "y0-";
}

/** Build a 12-week placeholder scaffold (used when no real program exists). */
function placeholderWeeks(yearLabel: string, genre: Genre): WeekPlan[] {
  const prefix = lessonIdPrefix(yearLabel);
  return Array.from({ length: 12 }, (_, i): WeekPlan => {
    const w = i + 1;
    return {
      id: `${prefix}${genre.id}-w${w}`,
      week: w,
      topic: `${genre.strand} — Week ${w}`,
      curriculum: ["ALL"],
      lessons: Array.from({ length: 3 }, (_, j): Lesson => {
        const l = j + 1;
        return {
          id: `${prefix}${genre.id}-w${w}-l${l}`,
          week: w,
          lesson: l,
          title: `Lesson ${l}`,
          focus: "Curriculum coming soon. Lesson details will appear here once this strand is built.",
          activityIdeas: [],
          curriculum: ["ALL"],
        };
      }),
    };
  });
}

/**
 * Returns the 12-week curriculum plan for a (year, genre) combination.
 * Falls back to a 12-week placeholder scaffold when no real program exists.
 */
export function getCurriculumPlan(yearLabel: string, genreId: string): WeekPlan[] {
  const k = yearKey(yearLabel);
  const genre = getGenresForYear(yearLabel).find((g) => g.id === genreId);
  if (!genre) return [];

  if (genre.available && genreId === "number" && k !== null) {
    const program = programs[k];
    if (program) {
      return program;
    }
  }

  return placeholderWeeks(yearLabel, genre);
}

/** Default XP per lesson (placeholder until lesson XP is data-driven). */
export const DEFAULT_LESSON_XP = 10;
