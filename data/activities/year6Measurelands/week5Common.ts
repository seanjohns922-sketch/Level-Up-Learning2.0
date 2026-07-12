import type { PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 6 · Week 5 — "Time Master" (AC9M6M04) ────────────────
// Combine 24-hour time, elapsed time and timetables in multi-step investigations.
// Reuses the timetable, timeQuest and time24 mechanics. No new mechanic (itinerary
// is a small extension of timeQuest).

type TimetableTask = Extract<PracticeTask, { kind: "timetable" }>;
type TimeTask = Extract<PracticeTask, { kind: "timeQuest" }>;
type Time24Task = Extract<PracticeTask, { kind: "time24" }>;

export function randInt(n: number): number { return Math.floor(Math.random() * n); }
export function choose<T>(items: T[]): T { return items[randInt(items.length)]!; }
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) { const j = randInt(i + 1); [next[i], next[j]] = [next[j]!, next[i]!]; }
  return next;
}
function fmt24(min: number): string { const h = Math.floor(min / 60) % 24, m = ((min % 60) + 60) % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; }
function fmt12(min: number): string { const h24 = Math.floor(min / 60) % 24, m = ((min % 60) + 60) % 60, ap = h24 < 12 ? "am" : "pm"; let h = h24 % 12; if (h === 0) h = 12; return `${h}:${String(m).padStart(2, "0")} ${ap}`; }
function fmtDur(min: number): string { const d = Math.abs(min), h = Math.floor(d / 60), m = d % 60; if (h && m) return `${h} h ${m} min`; if (h) return `${h} h`; return `${m} min`; }
function opts3(answer: string, cands: string[]): string[] {
  const out = [answer];
  for (const c of shuffle(cands)) { if (out.length < 3 && !out.includes(c)) out.push(c); }
  let k = 1; while (out.length < 3) { out.push(`${answer} (${k++})`); }
  return shuffle(out);
}

// ── Timetables (L1) — 24-hour, pick the best by an explicit requirement ──
const ROUTES = [
  { route: "Coastliner", dest: "Seaside", emoji: "🚆" },
  { route: "Ranger", dest: "Mountains", emoji: "🚌" },
  { route: "Harbour Ferry", dest: "Docklands", emoji: "⛴️" },
  { route: "Sky Express", dest: "Airport", emoji: "✈️" },
];
type Row = { id: string; route: string; emoji?: string; dest: string; departMin: number; arriveMin: number };
function makeServices(): { rows: Row[]; dest: string; emoji: string } {
  const r = choose(ROUTES);
  const durs = shuffle([35, 45, 60, 75, 90]).slice(0, 4);
  let depart = 8 * 60 + choose([0, 10, 15, 20, 30]);
  const rows: Row[] = [];
  for (let i = 0; i < 4; i++) {
    depart += choose([25, 30, 40, 50, 60]);
    rows.push({ id: `s${i}`, route: `${r.route} ${i + 1}`, emoji: r.emoji, dest: r.dest, departMin: depart, arriveMin: depart + durs[i]! });
  }
  return { rows, dest: r.dest, emoji: r.emoji };
}

// Latest service that still arrives by the deadline (not the earliest departure!).
export function latestTask(): TimetableTask {
  const { rows, dest, emoji } = makeServices();
  const arrives = rows.map((r) => r.arriveMin).sort((a, b) => a - b);
  const T = arrives[2]!; // 3 services arrive by T, 1 after
  const eligible = rows.filter((r) => r.arriveMin <= T);
  const correct = eligible.reduce((a, b) => (a.departMin >= b.departMin ? a : b));
  return {
    kind: "timetable", scene: "compare", context: { label: dest, emoji },
    rows,
    answerRowId: correct.id,
    prompt: `You must arrive by ${fmt24(T)}. Which is the LATEST service you can catch?`,
    speakText: `Travellers don't just take the first train. You must arrive by ${fmt24(T)}. Which is the latest service you can catch and still make it?`,
    badgeLabel: "Best Journey",
    feedback: { correct: "Yes — the latest one that still arrives in time.", wrong: "Check the arrival times — pick the latest that still arrives by the deadline." },
  };
}

// Next departure at/after you reach the platform.
export function firstAfterTask(): TimetableTask {
  const { rows, dest, emoji } = makeServices();
  const T = Math.round((rows[0]!.departMin + rows[1]!.departMin) / 2 / 5) * 5;
  const correct = rows.filter((r) => r.departMin >= T).sort((a, b) => a.departMin - b.departMin)[0]!;
  return {
    kind: "timetable", scene: "find", context: { label: dest, emoji },
    rows,
    answerRowId: correct.id,
    prompt: `You reach the platform at ${fmt24(T)}. Which is the next departure?`,
    speakText: `You reach the platform at ${fmt24(T)}. Which is the next service you can catch?`,
    badgeLabel: "Which Service?",
    feedback: { correct: "Yes — the next departure after you arrive.", wrong: "You've missed the earlier one — find the next departure." },
  };
}

// How long does a named service take?
export function durationTask(): TimetableTask {
  const { rows, dest, emoji } = makeServices();
  const row = choose(rows);
  const dur = row.arriveMin - row.departMin;
  return {
    kind: "timetable", scene: "mcq", context: { label: dest, emoji },
    rows,
    options: opts3(fmtDur(dur), [fmtDur(dur + 15), fmtDur(dur - 15), fmtDur(dur + 30), fmtDur(dur + 60)]),
    correctOption: fmtDur(dur),
    prompt: `How long does the ${row.route} take?`,
    speakText: `Look at the ${row.route}. How long does that journey take?`,
    badgeLabel: "Journey Length",
    feedback: { correct: `Yes — ${fmtDur(dur)}.`, wrong: `Departs ${fmt24(row.departMin)}, arrives ${fmt24(row.arriveMin)} — that's ${fmtDur(dur)}.` },
  };
}

// ── Itinerary (L2/L3) — multi-leg plan, step by step ──
type Leg = { type: "travel" | "wait" | "activity"; label: string; emoji: string; minutes: number };
function itinerary(badge: string, prompt: string, startMin: number, legs: Leg[]): TimeTask {
  let t = startMin;
  const arriveFirst = startMin + legs[0]!.minutes;
  for (const leg of legs) t += leg.minutes;
  const finish = t, total = finish - startMin;
  const timeCands = (ans: number) => [fmt12(ans + 30), fmt12(ans - 30), fmt12(ans + 60), fmt12(ans + 15)];
  const durCands = (ans: number) => [fmtDur(ans + 30), fmtDur(Math.max(5, ans - 30)), fmtDur(ans + 60), fmtDur(ans + 15)];
  const steps = [
    { q: `What time do you finish "${legs[0]!.label}"?`, options: opts3(fmt12(arriveFirst), timeCands(arriveFirst)), answer: fmt12(arriveFirst) },
    { q: "What time does the whole trip finish?", options: opts3(fmt12(finish), timeCands(finish)), answer: fmt12(finish) },
    { q: "How long is the whole trip?", options: opts3(fmtDur(total), durCands(total)), answer: fmtDur(total) },
  ];
  return {
    kind: "timeQuest", scene: "itinerary", itinerary: { startMin, legs }, steps,
    prompt, speakText: `${prompt} Work out each stage, then the total.`,
    badgeLabel: badge,
    feedback: { correct: "Every stage checks out!", wrong: "Work through the plan one leg at a time." },
  };
}

export function excursionItinerary(): TimeTask {
  const start = 9 * 60 + choose([0, 15, 30]);
  const bus = choose([40, 45, 50]);
  return itinerary("Excursion Planner", "Plan the museum excursion.", start, [
    { type: "travel", label: "Bus to the museum", emoji: "🚌", minutes: bus },
    { type: "activity", label: "Museum tour", emoji: "🏛️", minutes: choose([60, 75, 90]) },
    { type: "wait", label: "Lunch break", emoji: "🥪", minutes: choose([30, 40]) },
    { type: "travel", label: "Bus back to school", emoji: "🏫", minutes: bus },
  ]);
}
export function carnivalItinerary(): TimeTask {
  const start = 8 * 60 + choose([30, 45]);
  return itinerary("Sports Carnival", "Plan the sports carnival.", start, [
    { type: "travel", label: "Travel to the oval", emoji: "🚌", minutes: choose([25, 30, 40]) },
    { type: "activity", label: "Warm-up & march-past", emoji: "🏃", minutes: choose([30, 45]) },
    { type: "activity", label: "Track & field events", emoji: "🏅", minutes: choose([120, 150]) },
    { type: "wait", label: "Presentation & pack-up", emoji: "🏆", minutes: choose([30, 45]) },
  ]);
}
export function airportItinerary(): TimeTask {
  const start = 6 * 60 + choose([0, 15, 30, 45]);
  return itinerary("Airport Challenge", "Plan the trip to catch the flight.", start, [
    { type: "travel", label: "Taxi to the airport", emoji: "🚕", minutes: choose([35, 45, 55]) },
    { type: "wait", label: "Check-in & security", emoji: "🛃", minutes: choose([60, 75, 90]) },
    { type: "travel", label: "Flight", emoji: "✈️", minutes: choose([90, 120, 150]) },
    { type: "wait", label: "Transfer to hotel", emoji: "🏨", minutes: choose([40, 50]) },
  ]);
}

// ── Elapsed time (timeQuest) ──
export function howLongTask(): TimeTask {
  const start = choose([8, 9, 10, 13, 14]) * 60 + choose([0, 15, 30, 45]);
  const dur = choose([45, 60, 75, 90, 105, 120]);
  const finish = start + dur;
  return {
    kind: "timeQuest", scene: "howLong", startMin: start, finishMin: finish, durationMin: dur,
    prompt: "How long does the session last?",
    speakText: `The session starts at ${fmt12(start)} and finishes at ${fmt12(finish)}. How long is that?`,
    badgeLabel: "How Long?",
    feedback: { correct: `Yes — ${fmtDur(dur)}.`, wrong: "Count on from the start time to the finish." },
  };
}
export function finishTask(): TimeTask {
  const start = choose([9, 10, 11, 13, 14]) * 60 + choose([0, 15, 30]);
  const dur = choose([45, 60, 90, 105]);
  return {
    kind: "timeQuest", scene: "finishTime", startMin: start, durationMin: dur, answerMin: start + dur,
    prompt: "What time does it finish?",
    speakText: `It starts at ${fmt12(start)} and lasts ${fmtDur(dur)}. What time does it finish?`,
    badgeLabel: "Finish Time",
    feedback: { correct: `Yes — ${fmt12(start + dur)}.`, wrong: "Add the duration to the start time." },
  };
}

// ── 12 ↔ 24 conversion (time24) ──
export function convert24Task(): Time24Task {
  const h = choose([13, 14, 15, 16, 17, 18, 19, 20]);
  const m = choose([0, 15, 30, 45]);
  const min = h * 60 + m;
  return {
    kind: "time24", scene: "convert", minutes: min, direction: "to24",
    options: shuffle([fmt24(min), fmt24(min - 12 * 60), fmt24(min + 60)]),
    correctOption: fmt24(min),
    prompt: `Write ${fmt12(min)} in 24-hour time.`,
    speakText: `Write ${fmt12(min)} in 24-hour time.`,
    badgeLabel: "12 → 24 Hour",
    feedback: { correct: `Yes — ${fmt24(min)}.`, wrong: `Afternoon: add 12 hours. It's ${fmt24(min)}.` },
  };
}

export function anyItinerary(): TimeTask { return choose([excursionItinerary, carnivalItinerary, airportItinerary])(); }
