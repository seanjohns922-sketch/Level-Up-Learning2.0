import type { PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Level 5 · Week 6 — shared helpers (Time Travellers) ────────
// AC9M5M03: compare 12- and 24-hour time; interpret and use timetables. Times
// are MINUTES from midnight (0-1439); shown as 24-hour HH:MM or 12-hour h:mm am/pm.

export function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}
export function randRange(min: number, max: number): number {
  return min + randInt(max - min + 1);
}
export function choose<T>(items: T[]): T {
  return items[randInt(items.length)]!;
}
export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

export function fmt24(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}
export function fmt12(min: number): string {
  const h24 = Math.floor(min / 60), m = min % 60;
  const period = h24 < 12 ? "am" : "pm";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}
export function fmtDur(mins: number): string {
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
}

type Time24Task = Extract<PracticeTask, { kind: "time24" }>;
type TimetableTask = Extract<PracticeTask, { kind: "timetable" }>;

/** A realistic time (minutes), 5-minute resolution, biased across the day + traps. */
function pickTime(): number {
  const specials = [0, 720, 780, 60]; // 00:00, 12:00, 13:00, 01:00 — classic traps
  if (randInt(4) === 0) return choose(specials);
  const h = randInt(24);
  return h * 60 + randInt(12) * 5;
}

// ── Lesson 1: 24-hour conversions ─────────────────────────────────────────────
function to24Options(min: number): string[] {
  const correct = fmt24(min);
  const h24 = Math.floor(min / 60);
  const set = new Set<string>([correct]);
  if (h24 >= 12) set.add(fmt24(min - 720)); // forgot to add 12 (14:15 -> 02:15)
  else set.add(fmt24((min + 720) % 1440)); // added 12 wrongly
  set.add(fmt24((min + 60) % 1440)); // off by an hour
  const opts = shuffle([...set]).slice(0, 3);
  while (opts.length < 3) opts.push(fmt24((min + opts.length * 65) % 1440));
  return shuffle([...new Set([correct, ...opts])].slice(0, 3));
}

export function convertTask(): Time24Task {
  const min = pickTime();
  return {
    kind: "time24",
    scene: "convert",
    minutes: min,
    direction: "to24",
    showClock: true,
    prompt: `What is ${fmt12(min)} in 24-hour time?`,
    speakText: `What is ${fmt12(min)} written in 24-hour time?`,
    badgeLabel: "Convert the Time",
    options: to24Options(min),
    correctOption: fmt24(min),
    feedback: { correct: `Yes — ${fmt12(min)} is ${fmt24(min)}.`, wrong: `After midday, add 12 hours — ${fmt12(min)} is ${fmt24(min)}.` },
  };
}

export function matchTask(): Time24Task {
  const min = pickTime();
  return {
    kind: "time24",
    scene: "match",
    minutes: min,
    prompt: "Which 24-hour time matches the clock?",
    speakText: "Read the clock. Which 24-hour time matches it?",
    badgeLabel: "Match the Time",
    options: to24Options(min),
    correctOption: fmt24(min),
    feedback: { correct: `Yes — that's ${fmt24(min)}.`, wrong: `Read the clock and the am/pm — it's ${fmt24(min)}.` },
  };
}

export function mistakeTask(): Time24Task {
  // Choose a pm time so the "forgot to add 12" trap applies.
  const h = 12 + randInt(11); // 12..22
  const min = h * 60 + randInt(12) * 5;
  const wrong = fmt24(min - 720);
  return {
    kind: "time24",
    scene: "mistake",
    minutes: min,
    prompt: "What is the correct 24-hour time?",
    speakText: `Professor Gauge wrote ${fmt12(min)} as ${wrong}. That's not right. What is the correct 24-hour time?`,
    badgeLabel: "Professor Gauge's Mistake",
    statement: `Gauge says ${fmt12(min)} = ${wrong}`,
    options: to24Options(min),
    correctOption: fmt24(min),
    feedback: { correct: `Yes — it's a pm time, so add 12: ${fmt24(min)}.`, wrong: `It's after midday — add 12 hours to get ${fmt24(min)}.` },
  };
}

// ── Lessons 2-3: timetables ───────────────────────────────────────────────────
const DESTS = [
  { dest: "Beach", emoji: "🏖️" },
  { dest: "City", emoji: "🏙️" },
  { dest: "Airport", emoji: "✈️" },
  { dest: "Museum", emoji: "🏛️" },
  { dest: "Zoo", emoji: "🦁" },
  { dest: "Stadium", emoji: "🏟️" },
  { dest: "Camp", emoji: "⛺" },
  { dest: "Harbour", emoji: "⚓" },
  { dest: "Mountains", emoji: "⛰️" },
];
const CONTEXTS = [
  { label: "Bus Timetable", emoji: "🚌" },
  { label: "Train Timetable", emoji: "🚆" },
  { label: "Ferry Timetable", emoji: "⛴️" },
  { label: "Coach Timetable", emoji: "🚐" },
];
const NAMES = ["Coastal Express", "Metro Flyer", "Sunrise Line", "Harbour Hopper", "Valley Rider", "Sky Express", "River Runner", "Ranger Coach", "Summit Link"];

type Svc = { id: string; route: string; emoji: string; dest: string; departMin: number; arriveMin: number };

function makeServices(): { context: { label: string; emoji: string }; rows: Svc[]; filters: Array<{ id: string; label: string; dest: string }> } {
  const context = choose(CONTEXTS);
  const names = shuffle(NAMES);
  const four = shuffle(DESTS).slice(0, 4);
  const dup = choose(four);
  const destSeq = shuffle([...four, dup]); // 5 services, one dest appears twice
  let t = randRange(7 * 60, 9 * 60);
  const rows: Svc[] = destSeq.map((d, i) => {
    const departMin = t;
    const journey = choose([25, 30, 40, 45, 50, 60, 75, 90]);
    t += randRange(15, 40);
    return { id: `s${i}`, route: names[i]!, emoji: d.emoji, dest: d.dest, departMin, arriveMin: departMin + journey };
  });
  const used = [...new Set(rows.map((r) => r.dest))];
  const filters = used.map((dest) => ({ id: dest, label: `${DESTS.find((x) => x.dest === dest)!.emoji} ${dest}`, dest }));
  return { context, rows, filters };
}

export function findTask(): TimetableTask {
  const { context, rows, filters } = makeServices();
  const singles = [...new Set(rows.map((r) => r.dest))].filter((d) => rows.filter((r) => r.dest === d).length === 1);
  const target = choose(singles);
  const row = rows.find((r) => r.dest === target)!;
  return {
    kind: "timetable",
    scene: "find",
    context,
    prompt: `Which service goes to the ${target}?`,
    speakText: `Use the timetable. Which service goes to the ${target}? Tap its row.`,
    badgeLabel: "Find the Service",
    rows,
    filters,
    answerRowId: row.id,
    feedback: { correct: `Yes — the ${row.route} goes to the ${target}, leaving at ${fmt24(row.departMin)}.`, wrong: `Use the filter or the emoji to find the ${target} service.` },
  };
}

export function compareTask(): TimetableTask {
  const { context, rows, filters } = makeServices();
  const dupDest = [...new Set(rows.map((r) => r.dest))].find((d) => rows.filter((r) => r.dest === d).length === 2);
  const group = dupDest ? rows.filter((r) => r.dest === dupDest) : rows;
  const first = group.reduce((a, b) => (a.arriveMin <= b.arriveMin ? a : b));
  const dest = dupDest ?? "destination";
  return {
    kind: "timetable",
    scene: "compare",
    context,
    prompt: `Two services go to the ${dest}. Which arrives first?`,
    speakText: `Two services go to the ${dest}. Read the arrival times. Which one arrives first?`,
    badgeLabel: "Which Arrives First?",
    rows,
    filters,
    answerRowId: first.id,
    feedback: { correct: `Yes — the ${first.route} arrives first at ${fmt24(first.arriveMin)}.`, wrong: `Compare the Arrives column — the earlier time wins.` },
  };
}

export function detectiveTask(): TimetableTask {
  const { context, rows, filters } = makeServices();
  const row = choose(rows);
  const dur = row.arriveMin - row.departMin;
  const opts = shuffle([...new Set([fmtDur(dur), fmtDur(dur + 15), fmtDur(Math.max(5, dur - 15)), fmtDur(dur + 30)])]).slice(0, 3);
  if (!opts.includes(fmtDur(dur))) opts[0] = fmtDur(dur);
  return {
    kind: "timetable",
    scene: "mcq",
    context,
    prompt: `How long is the ${row.route} journey to the ${row.dest}?`,
    speakText: `The ${row.route} leaves at ${fmt24(row.departMin)} and arrives at ${fmt24(row.arriveMin)}. How long is the journey?`,
    badgeLabel: "Timetable Detective",
    rows,
    filters,
    options: shuffle(opts),
    correctOption: fmtDur(dur),
    feedback: { correct: `Yes — ${fmt24(row.departMin)} to ${fmt24(row.arriveMin)} is ${fmtDur(dur)}.`, wrong: `Count from ${fmt24(row.departMin)} to ${fmt24(row.arriveMin)} — ${fmtDur(dur)}.` },
  };
}

/** L3 — "arrive in time": exactly one service arrives before the deadline, and it
 *  is not necessarily the first-departing (best ≠ earliest). */
export function arriveInTimeTask(kind: "excursion" | "camp"): TimetableTask {
  const context = choose(CONTEXTS);
  const names = shuffle(NAMES);
  const d = choose(DESTS);
  // 3 services to the same place, journeys chosen so depart-order ≠ arrive-order.
  const start = randRange(7 * 60 + 30, 9 * 60);
  const legs = shuffle([
    { dep: start, jrn: 90 },
    { dep: start + 20, jrn: 45 },
    { dep: start + 40, jrn: 60 },
  ]);
  const rows: Svc[] = legs.map((l, i) => ({ id: `s${i}`, route: names[i]!, emoji: d.emoji, dest: d.dest, departMin: l.dep, arriveMin: l.dep + l.jrn }));
  const sortedArr = [...rows].sort((a, b) => a.arriveMin - b.arriveMin);
  const winner = sortedArr[0]!;
  const deadline = Math.floor((winner.arriveMin + sortedArr[1]!.arriveMin) / 2 / 5) * 5;
  const label = kind === "excursion" ? "excursion" : "camp";
  return {
    kind: "timetable",
    scene: "compare",
    context,
    prompt: `The ${label} at the ${d.dest} starts at ${fmt24(deadline)}. Which service gets you there in time?`,
    speakText: `The ${label} starts at ${fmt24(deadline)}. Check the arrival times — which service arrives before it starts? It may not be the first to leave.`,
    badgeLabel: kind === "excursion" ? "School Excursion" : "Adventure Camp",
    rows,
    filters: [{ id: d.dest, label: `${d.emoji} ${d.dest}`, dest: d.dest }],
    answerRowId: winner.id,
    feedback: { correct: `Yes — the ${winner.route} arrives at ${fmt24(winner.arriveMin)}, before ${fmt24(deadline)}.`, wrong: `Check the Arrives column — only one arrives before ${fmt24(deadline)}. The earliest to leave isn't always the one.` },
  };
}

/** L3 — mission: combine 24-hour + elapsed. "Leave at X, trip takes D — arrive?" */
export function missionTask(): TimetableTask {
  const { context, rows, filters } = makeServices();
  const row = choose(rows);
  const dur = row.arriveMin - row.departMin;
  const set = new Set<string>([fmt24(row.arriveMin), fmt24(row.arriveMin - 60), fmt24(row.arriveMin + dur), fmt24(row.departMin)]);
  const opts = shuffle([...set]).slice(0, 3);
  if (!opts.includes(fmt24(row.arriveMin))) opts[0] = fmt24(row.arriveMin);
  return {
    kind: "timetable",
    scene: "mcq",
    context,
    prompt: `The ${row.route} leaves at ${fmt24(row.departMin)} and takes ${fmtDur(dur)}. What time does it arrive?`,
    speakText: `The ${row.route} leaves at ${fmt24(row.departMin)} and the trip takes ${fmtDur(dur)}. What time does it arrive?`,
    badgeLabel: "Journey Mission",
    rows,
    filters,
    options: shuffle(opts),
    correctOption: fmt24(row.arriveMin),
    feedback: { correct: `Yes — ${fmt24(row.departMin)} plus ${fmtDur(dur)} is ${fmt24(row.arriveMin)}.`, wrong: `Add ${fmtDur(dur)} to ${fmt24(row.departMin)} — ${fmt24(row.arriveMin)}.` },
  };
}
