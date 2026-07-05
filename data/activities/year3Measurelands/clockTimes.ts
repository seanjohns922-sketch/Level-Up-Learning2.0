// Shared helpers for Week 6 (Minute Clockworks) — analog/digital time to the minute.

export function normHour(h: number) { return ((((h - 1) % 12) + 12) % 12) + 1; }
export function normMin(m: number) { return ((m % 60) + 60) % 60; }
export function digital(h: number, m: number) { return `${normHour(h)}:${String(normMin(m)).padStart(2, "0")}`; }
export function randInt(n: number) { return Math.floor(Math.random() * n); }
export function shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; }

/** A random time; minute is a multiple of `step` (5 = five-minute, 1 = any minute). */
export function pickTime(step: number): { hour: number; minute: number } {
  return { hour: 1 + randInt(12), minute: randInt(60 / step) * step };
}

// Distractors are kept ≥5 minutes apart (or an hour off) so every option is
// visibly different on an analog face — you can't tell 9:14 from 9:15 by eye.
function candidates(h: number, m: number, _step: number): Array<[number, number]> {
  return [[h, m + 5], [h, m - 5], [h, m + 10], [h, m - 10], [h + 1, m], [h - 1, m]].map(([hh, mm]) => [normHour(hh), normMin(mm)] as [number, number]);
}

/** 4 digital options (correct + 3 plausible near-misses), shuffled. */
export function readOptions(h: number, m: number, step: number): string[] {
  const correct = digital(h, m);
  const set = new Set([correct]);
  const opts = [correct];
  for (const [hh, mm] of shuffle(candidates(h, m, step))) {
    const d = digital(hh, mm);
    if (!set.has(d)) { set.add(d); opts.push(d); }
    if (opts.length === 4) break;
  }
  return shuffle(opts);
}

/** 3 analog clock options (correct + 2 distractors) with stable ids, shuffled. */
export function clockOptions(h: number, m: number, step: number): { options: Array<{ id: string; hour: number; minute: number }>; correctId: string } {
  const used = new Set([digital(h, m)]);
  const distractors: Array<{ id: string; hour: number; minute: number }> = [];
  for (const [hh, mm] of shuffle(candidates(h, m, step))) {
    const d = digital(hh, mm);
    if (!used.has(d)) { used.add(d); distractors.push({ id: `d${distractors.length}`, hour: hh, minute: mm }); }
    if (distractors.length === 2) break;
  }
  return { options: shuffle([{ id: "ok", hour: h, minute: m }, ...distractors]), correctId: "ok" };
}

/** A claimed time for "spot the mistake": either correct or a clearly-spottable
 *  error — an hour-hand misread (the classic Year-3 mistake) or a ≥15-min slip. */
export function claimedTime(h: number, m: number): { claim: string; correct: boolean } {
  if (randInt(2) === 0) return { claim: digital(h, m), correct: true };
  const kind = randInt(3);
  let vh = h;
  let vm = m;
  if (kind === 0) vh = h + 1; // read the hour hand as the next hour
  else if (kind === 1) vh = h - 1;
  else vm = m + (15 + randInt(21)); // a big, visible minute error
  vh = normHour(vh);
  vm = normMin(vm);
  if (vh === h && vm === m) vm = normMin(m + 15);
  return { claim: digital(vh, vm), correct: false };
}
