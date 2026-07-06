// Shared helpers for Measurelands Level 4 · Week 6 (Time Quest). 12-hour am/pm
// only (no 24-hour), no midday crossing, friendly conversions and durations.

export function randInt(maxExclusive: number) { return Math.floor(Math.random() * maxExclusive); }
export function randRange(min: number, max: number) { return min + randInt(max - min + 1); }
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [next[i], next[j]] = [next[j]!, next[i]!]; }
  return next;
}
export function choose<T>(items: T[]): T { return items[randInt(items.length)]!; }
export function roundTo(n: number, step: number) { return Math.round(n / step) * step; }

export function fmtDur(min: number): string {
  const h = Math.floor(Math.abs(min) / 60), m = Math.abs(min) % 60;
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}

// L1 A — equivalent-unit pairs.
export const UNIT_PAIRS: Array<{ id: string; small: string; big: string }> = [
  { id: "sec", small: "60 seconds", big: "1 minute" },
  { id: "min", small: "60 minutes", big: "1 hour" },
  { id: "hr", small: "24 hours", big: "1 day" },
  { id: "day", small: "7 days", big: "1 week" },
  { id: "min2", small: "120 minutes", big: "2 hours" },
  { id: "hr2", small: "48 hours", big: "2 days" },
];

// L1 B — "which conversion is correct?" (prompt + options + correct).
export const CONVERT_MCQ: Array<{ prompt: string; correct: string; distractors: string[] }> = [
  { prompt: "120 minutes = ?", correct: "2 hours", distractors: ["12 hours", "20 minutes", "1 hour 20 min"] },
  { prompt: "48 hours = ?", correct: "2 days", distractors: ["4 days", "24 days", "12 hours"] },
  { prompt: "1 minute = ?", correct: "60 seconds", distractors: ["100 seconds", "6 seconds", "1 hour"] },
  { prompt: "2 hours = ?", correct: "120 minutes", distractors: ["20 minutes", "200 minutes", "60 minutes"] },
  { prompt: "1 day = ?", correct: "24 hours", distractors: ["12 hours", "10 hours", "60 hours"] },
  { prompt: "14 days = ?", correct: "2 weeks", distractors: ["1 week", "4 weeks", "7 weeks"] },
  { prompt: "90 minutes = ?", correct: "1 hour 30 min", distractors: ["1 hour 90 min", "9 hours", "1.3 hours"] },
];

// L1 C — "time builder" set-a-number conversions (friendly steps).
export const CONVERT_BUILD: Array<{ prompt: string; ans: number; unit: string; step: number; max: number }> = [
  { prompt: "1 minute = ? seconds", ans: 60, unit: "seconds", step: 10, max: 100 },
  { prompt: "1 hour = ? minutes", ans: 60, unit: "minutes", step: 10, max: 100 },
  { prompt: "2 hours = ? minutes", ans: 120, unit: "minutes", step: 20, max: 200 },
  { prompt: "1 day = ? hours", ans: 24, unit: "hours", step: 4, max: 40 },
  { prompt: "1 week = ? days", ans: 7, unit: "days", step: 1, max: 12 },
  { prompt: "half an hour = ? minutes", ans: 30, unit: "minutes", step: 5, max: 60 },
];

export const FRIENDLY_DURS = [15, 20, 30, 40, 45, 60, 75, 90, 120];

/** Start + duration + finish, all within one am/pm period (no midday crossing). */
export function pickElapsed(maxDur = 120): { start: number; dur: number; finish: number } {
  const morning = randInt(2) === 0;
  const [lo, hi] = morning ? [420, 600] : [780, 960]; // 7–10 am or 1–4 pm
  const periodEnd = morning ? 715 : 1135; // stay before noon / before midnight-ish
  const start = roundTo(randRange(lo, hi), 5);
  let dur = choose(FRIENDLY_DURS.filter((d) => d <= maxDur));
  if (start + dur > periodEnd) dur = roundTo(periodEnd - start, 5);
  if (dur < 10) dur = 15;
  return { start, dur, finish: start + dur };
}

export const PLANNER_EVENTS: Array<{ id: string; label: string; emoji: string }> = [
  { id: "swim", label: "Swimming", emoji: "🏊" },
  { id: "lunch", label: "Lunch", emoji: "🥪" },
  { id: "movie", label: "Movie", emoji: "🎬" },
  { id: "park", label: "Park", emoji: "🛝" },
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "library", label: "Library", emoji: "📚" },
];

export const CARNIVAL_EVENTS: Array<{ id: string; label: string; emoji: string }> = [
  { id: "race", label: "Sprint", emoji: "🏃" },
  { id: "jump", label: "Long Jump", emoji: "🤸" },
  { id: "relay", label: "Relay", emoji: "🏅" },
  { id: "throw", label: "Discus", emoji: "🥏" },
];
