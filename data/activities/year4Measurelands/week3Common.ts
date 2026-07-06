// Shared helpers + pools for Measurelands Level 4 · Week 3 (Temperature).
// Realistic Australian temperatures, whole numbers, 0–40 °C, no negatives, no
// decimals. The thermometer reads to the nearest degree.

export const TEMP_MAX = 50; // thermometer scale top (labels every 10)

export function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}
export function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}

/** A believable temperature in [min, max] (whole degrees). */
export function pickTemp(min = 3, max = 38): number {
  return min + randInt(max - min + 1);
}

/** A weather emoji that matches the temperature band. */
export function weatherEmoji(t: number): string {
  if (t <= 8) return "❄️";
  if (t <= 15) return "🌧️";
  if (t <= 22) return "⛅";
  if (t <= 29) return "🌤️";
  return "☀️";
}

export const CITIES = ["Sydney", "Perth", "Hobart", "Darwin", "Melbourne", "Cairns", "Adelaide", "Brisbane"];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/** Three reading options bracketing the true temperature (varied, readable). */
export function readOptions(v: number): { options: number[]; correct: number } {
  const opts = new Set<number>([v]);
  for (const d of shuffle([2, -2, 3, -3, 4, -4, 1, -1])) {
    if (opts.size >= 3) break;
    const c = v + d;
    if (c >= 0 && c <= 45) opts.add(c);
  }
  return { options: shuffle([...opts]), correct: v };
}

/** Three thermometers (one at the target); returns them + the correct id. */
export function matchSet(v: number): { thermometers: Array<{ id: string; value: number; display: "analog" }>; correctId: string } {
  const set = new Set<number>([v]);
  for (const d of shuffle([3, -3, 5, -5, 4, -4])) {
    if (set.size >= 3) break;
    const c = v + d;
    if (c >= 0 && c <= 45) set.add(c);
  }
  const thermometers = shuffle([...set]).map((val, i) => ({ id: `t${i}`, value: val, display: "analog" as const }));
  const correctId = thermometers.find((t) => t.value === v)!.id;
  return { thermometers, correctId };
}

/** Pick n distinct temperatures within [min, max]. */
export function pickDistinctTemps(n: number, min = 5, max = 38): number[] {
  const set = new Set<number>();
  let guard = 0;
  while (set.size < n && guard < 200) {
    set.add(pickTemp(min, max));
    guard += 1;
  }
  return [...set];
}
