/**
 * Final clean-up for generated question text that students read.
 * - Floating-point noise: "55.00000000000001%" → "55%", "28.000000000000004" → "28".
 * - Long repeating decimals in working are cut to four places with "…": "11.3333333" → "11.3333…".
 * - A count of exactly one takes the singular: "1 hours" → "1 hour".
 * Marking never uses this text, so answers are unaffected.
 */
const SINGULAR: Record<string, string> = {
  hours: "hour", minutes: "minute", seconds: "second", days: "day", weeks: "week",
  metres: "metre", litres: "litre", students: "student", people: "person", runners: "runner",
};
export function tidyDisplayText(text: string): string {
  return text
    .replace(/\d+\.\d*?(?:0{6,}|9{6,})\d*/g, (m) => String(Number(Number(m).toPrecision(12))))
    .replace(/(\d+\.\d{4})\d{3,}/g, "$1…")
    .replace(/(^|[^\d.,])1 (hours|minutes|seconds|days|weeks|metres|litres|students|people|runners)\b/g, (_m, lead: string, unit: string) => `${lead}1 ${SINGULAR[unit]}`);
}
/** True when a number needs no more than two decimal places, so it can be shown as an answer choice. */
export const isTidyNumber = (value: number) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;
