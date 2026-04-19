import type { WeekPlan, Lesson } from "./year1";
import { programs } from "./index";

export type Genre = {
  id: string;
  strand: string;        // e.g. "Number"
  realm: string;         // e.g. "Number Nexus"
  available: boolean;    // true = real curriculum, false = placeholder
};

/** Genre catalogue per year level. Only "Number" has real curriculum today. */
export const GENRES_BY_YEAR: Record<string, Genre[]> = {
  "Prep":   defaultGenres(false),
  "Year 1": defaultGenres(true),
  "Year 2": defaultGenres(true),
  "Year 3": defaultGenres(true),
  "Year 4": defaultGenres(true),
  "Year 5": defaultGenres(true),
  "Year 6": defaultGenres(true), // Number gets a placeholder scaffold
};

function defaultGenres(numberAvailable: boolean): Genre[] {
  return [
    { id: "number",      strand: "Number",      realm: "Number Nexus",     available: numberAvailable },
    { id: "measurement", strand: "Measurement", realm: "Measurelands",     available: false },
    { id: "space",       strand: "Space",       realm: "Geospin",          available: false },
    { id: "reading",     strand: "Reading",     realm: "Reading Ridge",    available: false },
    { id: "writing",     strand: "Writing",     realm: "Inkwell Wilds",    available: false },
    { id: "grammar",     strand: "Grammar",     realm: "Runehaven Peaks",  available: false },
  ];
}

export function getGenresForYear(yearLabel: string): Genre[] {
  return GENRES_BY_YEAR[yearLabel] ?? defaultGenres(false);
}

/** Year label → numeric key for the `programs` map (1..6). */
function yearKey(yearLabel: string): 1 | 2 | 3 | 4 | 5 | 6 | null {
  const map: Record<string, 1 | 2 | 3 | 4 | 5 | 6> = {
    "Year 1": 1, "Year 2": 2, "Year 3": 3,
    "Year 4": 4, "Year 5": 5, "Year 6": 6,
  };
  return map[yearLabel] ?? null;
}

/** Year label → lesson-id prefix used in `progress.completed_lesson_ids`. */
export function lessonIdPrefix(yearLabel: string): string {
  const k = yearKey(yearLabel);
  return k ? `y${k}-` : "y0-";
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

  if (genre.available && genreId === "number" && k && (programs as any)[k]) {
    return (programs as any)[k] as WeekPlan[];
  }

  return placeholderWeeks(yearLabel, genre);
}

/** Default XP per lesson (placeholder until lesson XP is data-driven). */
export const DEFAULT_LESSON_XP = 10;
