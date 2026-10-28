import type { StudentActivityDailyRow } from "@/lib/student-activity";

/** Chronorok, the games realm. Kids earn Chrono Crystals for learning:
 *  one crystal per learning day (a day with a finished lesson or quiz), counted
 *  over the school year (Australian school years run January to December).
 *  The world opens after CHRONOROK_OPEN_DAYS learning days; 100 crystals in a
 *  school year awakens that grade's Chronorok. */

export const CHRONOROK_OPEN_DAYS = 5;
export const CRYSTALS_TO_AWAKEN = 100;

export const CHRONOROKS = [
  { grade: "Prep", name: "Chronorok Spark" },
  { grade: "Year 1", name: "Chronorok Ember" },
  { grade: "Year 2", name: "Chronorok Pulse" },
  { grade: "Year 3", name: "Chronorok Current" },
  { grade: "Year 4", name: "Chronorok Rift" },
  { grade: "Year 5", name: "Chronorok Blaze" },
  { grade: "Year 6", name: "Chronorok Eternal" },
] as const;

export function isLearningDay(row: StudentActivityDailyRow) {
  return (row.lessons_completed ?? 0) > 0 || (row.quizzes_completed ?? 0) > 0;
}

export function chronorokProgress(rows: StudentActivityDailyRow[], now = new Date()) {
  const learningDays = rows.filter(isLearningDay);
  const year = String(now.getFullYear());
  const crystals = Math.min(CRYSTALS_TO_AWAKEN, learningDays.filter((row) => row.activity_date.startsWith(year)).length);
  return {
    learningDays: learningDays.length,
    open: learningDays.length >= CHRONOROK_OPEN_DAYS,
    crystals,
  };
}

/** The Chronorok a student awakens this year: their grade's (Grade 6 and above get Eternal). */
export function chronorokForGrade(schoolYear: string | null | undefined) {
  const found = CHRONOROKS.find((entry) => entry.grade === schoolYear);
  if (found) return found;
  const n = Number(String(schoolYear ?? "").replace(/\D/g, ""));
  return n >= 6 ? CHRONOROKS[6] : CHRONOROKS[0];
}

export function gradeName(schoolYear: string | null | undefined) {
  if (!schoolYear) return "";
  return schoolYear === "Prep" ? "Foundation" : schoolYear.replace("Year", "Grade");
}
