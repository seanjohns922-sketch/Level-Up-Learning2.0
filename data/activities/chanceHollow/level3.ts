import type { ChanceVisual, PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

type Gen = () => PracticeTask;

const rotate = <T,>(items: readonly T[], amount: number) => {
  const offset = ((amount % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
};

// Fisher–Yates shuffle of [0..n).
function shuffledIndices(n: number): number[] {
  const bag = Array.from({ length: n }, (_, index) => index);
  for (let index = bag.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [bag[index], bag[swap]] = [bag[swap]!, bag[index]!];
  }
  return bag;
}

// Counter / wedge colours reused across the apparatus visuals.
const RED = "#e5484d";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const YELLOW = "#eab308";

// A single question. Every case carries its own specific feedback (why the
// answer is right / what to look at) and, where useful, an apparatus visual so
// the question shows the real tool it is about.
type ChanceCase = {
  prompt: string;
  answer: string;
  options: readonly string[];
  correct: string;
  wrong: string;
  visual?: ChanceVisual;
};

const FOUR_SCALE = ["Certain", "Likely", "Unlikely", "Impossible"] as const;

function caseToTask(c: ChanceCase, optionSeed: number, lead?: string): PracticeTask {
  return {
    kind: "mcq",
    prompt: lead ? `${lead} ${c.prompt}` : c.prompt,
    options: rotate([...c.options], optionSeed),
    answer: c.answer,
    feedback: { correct: c.correct, wrong: c.wrong },
    ...(c.visual ? { visual: c.visual } : {}),
  };
}

// A curated BANK generator: walks a fixed set of hand-written cases WITHOUT
// repeating (every case shown once before any repeat, never twice in a row).
// Used for qualitative lessons — chance words, everyday events, reasons — where
// the answer depends on world knowledge and cannot be computed.
const poolGen = (cases: readonly ChanceCase[], lead?: string): Gen => {
  let queue: number[] = [];
  let last = -1;
  let optionSeed = 0;
  return () => {
    if (queue.length === 0) {
      queue = shuffledIndices(cases.length);
      if (cases.length > 1 && queue[queue.length - 1] === last) {
        [queue[queue.length - 1], queue[0]] = [queue[0]!, queue[queue.length - 1]!];
      }
    }
    const index = queue.pop()!;
    last = index;
    optionSeed += 1;
    return caseToTask(cases[index]!, optionSeed, lead);
  };
};

// A PARAMETRIC generator: builds a freshly randomised case every call from one
// or more maker functions, so an apparatus lesson (spinner, bag, die, tally)
// draws from effectively unlimited questions rather than a fixed pool. The
// maker computes the answer from the randomised numbers, so it is always
// correct. Avoids repeating the exact same prompt twice in a row.
const randGen = (makers: readonly (() => ChanceCase)[]): Gen => {
  let lastPrompt = "";
  let optionSeed = 0;
  return () => {
    let c = choice(makers)();
    for (let guard = 0; c.prompt === lastPrompt && guard < 6; guard += 1) c = choice(makers)();
    lastPrompt = c.prompt;
    optionSeed += 1;
    return caseToTask(c, optionSeed);
  };
};

// ── Random apparatus helpers ────────────────────────────────────────────────
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const choice = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!;
const shuffleArr = <T,>(items: readonly T[]): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
};

type Paint = { c: string; name: string };
const PAINTS: readonly Paint[] = [
  { c: RED, name: "red" },
  { c: BLUE, name: "blue" },
  { c: GREEN, name: "green" },
  { c: YELLOW, name: "yellow" },
];

// Build a flat list of `count` items per colour, in colour order given.
function paintList(entries: ReadonlyArray<[Paint, number]>): string[] {
  const out: string[] = [];
  for (const [paint, n] of entries) for (let i = 0; i < n; i += 1) out.push(paint.c);
  return out;
}

// Spinner or bag "likely / unlikely?" — the target colour is a clear majority
// (>half, so likely) or clear minority (<half, so unlikely); never exactly half.
function likelihoodMaker(kind: "spinner" | "bag"): () => ChanceCase {
  return () => {
    const total = kind === "spinner" ? randInt(4, 6) : randInt(5, 8);
    const wantLikely = Math.random() < 0.5;
    const half = total / 2;
    const targetCount = wantLikely
      ? randInt(Math.floor(half) + 1, total - 1)
      : randInt(1, Math.ceil(half) - 1);
    const paints = shuffleArr(PAINTS);
    const target = paints[0]!;
    const others = paints.slice(1);
    const entries: Array<[Paint, number]> = [[target, targetCount]];
    let remaining = total - targetCount;
    let oi = 0;
    const otherCounts = new Map<Paint, number>();
    while (remaining > 0) {
      const p = others[oi % Math.min(others.length, 2)]!;
      otherCounts.set(p, (otherCounts.get(p) ?? 0) + 1);
      remaining -= 1;
      oi += 1;
    }
    for (const [p, n] of otherCounts) entries.push([p, n]);
    const items = shuffleArr(paintList(entries));
    const answer = wantLikely ? "Likely" : "Unlikely";
    const noun = kind === "spinner" ? "parts" : "counters";
    return {
      prompt: kind === "spinner"
        ? `The spinner lands on ${target.name}. Likely or unlikely?`
        : `You draw a ${target.name} counter from this bag. Likely or unlikely?`,
      answer,
      options: FOUR_SCALE,
      correct: `Yes. ${targetCount} of the ${total} ${noun} are ${target.name}, ${wantLikely ? "more" : "less"} than half, so it is ${answer.toLowerCase()}.`,
      wrong: `Count them: ${targetCount} of ${total} ${noun} are ${target.name} — ${wantLikely ? "most of them" : "only a few"} — so ${target.name} is ${answer.toLowerCase()}.`,
      visual: kind === "spinner" ? { type: "spinner", wedges: items } : { type: "bag", counters: items },
    };
  };
}

// Die "roll a number less than N" — count of winning faces is 1,2 (unlikely) or
// 4,5 (likely); N is never 4, so it is never an even chance.
function dieLikelihoodMaker(): () => ChanceCase {
  return () => {
    const n = choice([2, 3, 5, 6]);
    const winning = n - 1; // faces 1..n-1
    const wantLikely = winning > 3;
    const answer = wantLikely ? "Likely" : "Unlikely";
    return {
      prompt: `You roll a number less than ${n} on one die. Likely or unlikely?`,
      answer,
      options: FOUR_SCALE,
      correct: `Yes. ${winning} of the 6 faces are less than ${n}, so it is ${answer.toLowerCase()}.`,
      wrong: `Count the faces under ${n}: there are ${winning} of 6, ${wantLikely ? "more" : "less"} than half, so it is ${answer.toLowerCase()}.`,
      visual: { type: "die", face: randInt(1, 6) },
    };
  };
}

// Predict the colour a spinner lands on most — one colour is a strict plurality.
function predictMostMaker(): () => ChanceCase {
  return () => {
    const paints = shuffleArr(PAINTS).slice(0, randInt(3, 4));
    const counts = paints.map(() => randInt(1, 3));
    // guarantee a unique maximum
    let maxIdx = 0;
    for (let i = 1; i < counts.length; i += 1) if (counts[i]! > counts[maxIdx]!) maxIdx = i;
    counts[maxIdx] = Math.max(...counts) + randInt(1, 2);
    const entries = paints.map((p, i) => [p, counts[i]!] as [Paint, number]);
    const wedges = shuffleArr(paintList(entries));
    const winner = paints[maxIdx]!;
    const options = shuffleArr(paints.map((p) => p.name));
    while (options.length < 4) {
      const extra = PAINTS.find((p) => !options.includes(p.name));
      if (!extra) break;
      options.push(extra.name);
    }
    return {
      prompt: "Which colour should you predict this spinner lands on most?",
      answer: winner.name,
      options: options.slice(0, 4),
      correct: `Yes. ${winner.name} has the most parts (${counts[maxIdx]}), so it is the best prediction.`,
      wrong: `Predict the biggest section — ${winner.name} has the most parts here.`,
      visual: { type: "spinner", wedges },
    };
  };
}

// Read a tally: which outcome came up most. Four-colour spinner so all four
// outcomes are the four options; the winning count is made strictly highest.
function tallyMostMaker(): () => ChanceCase {
  return () => {
    const paints = PAINTS;
    const counts = paints.map(() => randInt(1, 7));
    let maxIdx = 0;
    for (let i = 1; i < counts.length; i += 1) if (counts[i]! > counts[maxIdx]!) maxIdx = i;
    counts[maxIdx] = Math.max(...counts) + randInt(1, 2);
    const tally = paints.map((p, i) => `${p.name} ${counts[i]}`).join(", ");
    return {
      prompt: `Spin a 4-colour spinner and tally the results — ${tally}. Which came up most?`,
      answer: paints[maxIdx]!.name,
      options: paints.map((p) => p.name),
      correct: `Right. ${paints[maxIdx]!.name} has the highest tally (${counts[maxIdx]}).`,
      wrong: `Find the biggest count in the tally — ${paints[maxIdx]!.name} has ${counts[maxIdx]}.`,
      visual: { type: "spinner", wedges: paints.map((p) => p.c) },
    };
  };
}

// Test the prediction: you predicted an outcome, ran ONE trial, and interpret
// the result. Varies the object (spinner, bag, coin) and whether the result
// matched, so the teaching point — a less-likely outcome can still happen, and
// a fair coin can land either way — comes up in many guises.
function testPredictionMaker(): () => ChanceCase {
  return () => {
    const mode = choice(["spinner", "bag", "coin", "die"] as const);
    const matched = Math.random() < 0.5;

    if (mode === "die") {
      // Predict "a number less than N" (the likely result, N is 5 or 6), roll,
      // and interpret whether the likely prediction came true.
      const n = choice([5, 6] as const);
      const result = matched ? randInt(1, n - 1) : randInt(n, 6);
      const base = { visual: { type: "die", face: result } as ChanceVisual };
      if (matched) {
        const answer = `The prediction worked — ${result} is less than ${n}`;
        return {
          ...base,
          prompt: `You predicted a number less than ${n} (the likely result) and rolled a ${result}. What does the test show?`,
          answer,
          options: [answer, `${result} is bigger than ${n}`, `A ${result} is impossible`, "You must roll again"],
          correct: `Yes. ${result} is less than ${n}, so the likely prediction came true.`,
          wrong: `${result} is one of the numbers below ${n}, so the prediction matched.`,
        };
      }
      const answer = `A ${result} was less likely but could still happen`;
      return {
        ...base,
        prompt: `You predicted a number less than ${n} (the likely result) but rolled a ${result}. What does the test show?`,
        answer,
        options: [answer, "The die is broken", `A ${result} is impossible`, "Your prediction was cheating"],
        correct: `Right. Numbers ${n} and up were less likely, but they can still come up.`,
        wrong: `${result} is ${n} or more — less likely than a number below ${n} — but still possible.`,
      };
    }

    if (mode === "coin") {
      const predicted = choice(["heads", "tails"] as const);
      const other = predicted === "heads" ? "tails" : "heads";
      const result = matched ? predicted : other;
      const base = { visual: { type: "coin", face: result } as ChanceVisual };
      if (!matched) {
        const answer = `${cap(result)} was just as likely — one toss can go either way`;
        return {
          ...base,
          prompt: `You predicted ${predicted}. You tossed the coin once and it landed ${result}. What does the test show?`,
          answer,
          options: [answer, "The coin is broken", `${cap(predicted)} is impossible`, "The toss does not count"],
          correct: "Right. A coin is 50/50, so one toss can land either way.",
          wrong: `Heads and tails are equally likely, so landing ${result} is fair even after predicting ${predicted}.`,
        };
      }
      const answer = `It matched — but ${other} was just as likely`;
      return {
        ...base,
        prompt: `You predicted ${predicted}. You tossed the coin once and it landed ${result}. What does the test show?`,
        answer,
        options: [answer, `${cap(predicted)} was certain`, `${cap(other)} is impossible`, "The coin is loaded"],
        correct: "Right. It matched, though a coin is 50/50 so either side was fair.",
        wrong: `It landed ${result} as predicted, but ${other} was equally likely — a coin is 50/50.`,
      };
    }

    // Spinner or bag with a clear majority colour, plus 1-2 minority colours.
    const total = mode === "spinner" ? randInt(4, 6) : randInt(5, 8);
    const half = total / 2;
    const majCount = randInt(Math.floor(half) + 1, total - 1);
    const paints = shuffleArr(PAINTS);
    const maj = paints[0]!;
    const others = paints.slice(1, 3);
    const entries: Array<[Paint, number]> = [[maj, majCount]];
    const minCounts = new Map<Paint, number>();
    let remaining = total - majCount;
    let oi = 0;
    while (remaining > 0) {
      const p = others[oi % others.length]!;
      minCounts.set(p, (minCounts.get(p) ?? 0) + 1);
      remaining -= 1;
      oi += 1;
    }
    for (const [p, n] of minCounts) entries.push([p, n]);
    const items = shuffleArr(paintList(entries));
    const k = choice([...minCounts.keys()]);
    const drew = mode === "spinner" ? "spun" : "drew";
    const visual: ChanceVisual = mode === "spinner" ? { type: "spinner", wedges: items } : { type: "bag", counters: items };

    if (matched) {
      const answer = `The prediction worked — ${maj.name} was the likely result`;
      return {
        prompt: `You predicted ${maj.name} (the biggest share) and ${drew} ${maj.name}. What does the test show?`,
        answer,
        options: [answer, `${cap(maj.name)} only happened by luck`, `${cap(maj.name)} is now impossible`, `You must predict ${k.name} next`],
        correct: `Yes. ${maj.name} had the most, so predicting it paid off.`,
        wrong: `${cap(maj.name)} had the biggest share, so a ${maj.name} result matches the prediction.`,
        visual,
      };
    }
    const answer = `${cap(k.name)} was less likely but could still happen`;
    return {
      prompt: `You predicted ${maj.name} (the biggest share) but ${drew} ${k.name}. What does the test show?`,
      answer,
      options: [answer, mode === "spinner" ? "The spinner is broken" : "The bag is broken", `${cap(k.name)} is impossible`, "Your prediction was cheating"],
      correct: `Right. ${k.name} was less likely, but 'unlikely' does not mean impossible.`,
      wrong: `${cap(k.name)} has fewer, so it is less likely — but it can still come up sometimes.`,
      visual,
    };
  };
}

// Did it match? A yes/no read on prediction vs result, across all four objects
// (spinner, bag, coin, die), matching or not.
function didItMatchMaker(): () => ChanceCase {
  return () => {
    const mode = choice(["spinner", "bag", "coin", "die"] as const);
    const matched = Math.random() < 0.5;

    if (mode === "coin") {
      const predicted = choice(["heads", "tails"] as const);
      const other = predicted === "heads" ? "tails" : "heads";
      const result = matched ? predicted : other;
      const base = { visual: { type: "coin", face: result } as ChanceVisual };
      if (matched) {
        const answer = `Yes — you predicted ${predicted} and got ${predicted}`;
        return { ...base, prompt: `You predicted ${predicted}. The coin landed ${result}. Did it match?`, answer, options: [answer, `No — ${predicted} does not count`, `${cap(predicted)} was impossible`, "Only if it was likely"], correct: "Right. You predicted it and it came up, so it matched.", wrong: `You predicted ${predicted} and got ${predicted}, so yes — it matched.` };
      }
      const answer = `No — but ${result} was still a fair result`;
      return { ...base, prompt: `You predicted ${predicted}. The coin landed ${result}. Did it match?`, answer, options: [answer, "Yes — they matched", `${cap(result)} is impossible`, `Yes — ${result} counts as ${predicted}`], correct: "Right. It did not match, but a coin is 50/50 so it was still fair.", wrong: `You predicted ${predicted} but got ${result}, so it did not match — though ${result} was still possible.` };
    }

    if (mode === "die") {
      const n = choice([3, 4, 5] as const);
      const result = matched ? randInt(1, n - 1) : randInt(n, 6);
      const base = { visual: { type: "die", face: result } as ChanceVisual };
      if (matched) {
        const answer = `Yes — ${result} is less than ${n}`;
        return { ...base, prompt: `You predicted a number less than ${n}. You rolled ${result}. Did it match?`, answer, options: [answer, `No — ${result} is too small`, `No — you needed exactly ${n}`, "Only if it was likely"], correct: `Right. ${result} is below ${n}, so it matched.`, wrong: `${result} is less than ${n}, so your prediction matched.` };
      }
      const answer = `No — ${result} is not less than ${n}`;
      return { ...base, prompt: `You predicted a number less than ${n}. You rolled ${result}. Did it match?`, answer, options: [answer, "Yes — they matched", `A ${result} is impossible`, `Yes — ${result} counts as less`], correct: `Right. ${result} is ${n} or more, so it did not match.`, wrong: `${result} is not below ${n}, so the prediction did not match.` };
    }

    // Spinner or bag: predict a present colour; result is that colour or another.
    const paints = shuffleArr(PAINTS).slice(0, randInt(2, 3));
    const total = mode === "spinner" ? randInt(3, 5) : randInt(4, 7);
    const counts = paints.map(() => 1);
    let remaining = total - paints.length;
    let idx = 0;
    while (remaining > 0) {
      counts[idx % paints.length] += 1;
      remaining -= 1;
      idx += 1;
    }
    const entries: Array<[Paint, number]> = paints.map((p, i) => [p, counts[i]!]);
    const items = shuffleArr(paintList(entries));
    const predicted = choice(paints);
    const otherPaints = paints.filter((p) => p !== predicted);
    const result = matched ? predicted : choice(otherPaints);
    const drewVerb = mode === "spinner" ? "landed on" : "drew";
    const noun = mode === "spinner" ? "spinner" : "bag";
    const visual: ChanceVisual = mode === "spinner" ? { type: "spinner", wedges: items } : { type: "bag", counters: items };
    if (matched) {
      const answer = `Yes — you got ${predicted.name}`;
      return { prompt: `You predicted ${predicted.name}. The ${noun} ${drewVerb} ${result.name}. Did it match?`, answer, options: [answer, `No — ${predicted.name} does not count`, `${cap(predicted.name)} was impossible`, "Only if it was likely"], correct: `Right. You predicted ${predicted.name} and got ${predicted.name}.`, wrong: `You predicted ${predicted.name} and got ${predicted.name}, so it matched.`, visual };
    }
    const answer = `No — you got ${result.name}, not ${predicted.name}`;
    return { prompt: `You predicted ${predicted.name}. The ${noun} ${drewVerb} ${result.name}. Did it match?`, answer, options: [answer, "Yes — they matched", `${cap(result.name)} is impossible`, `Yes — ${result.name} counts as ${predicted.name}`], correct: `Right. You predicted ${predicted.name} but got ${result.name}.`, wrong: `You got ${result.name}, not ${predicted.name}, so it did not match.`, visual };
  };
}

// ─────────────────────────────── Week 1: Chance Words ───────────────────────
const w1l1 = poolGen([
  { prompt: "The sun will set this evening. Certain or impossible?", answer: "Certain", options: FOUR_SCALE, correct: "Yes. The sun sets every day, so it must happen.", wrong: "'Certain' means it must happen. The sun sets every single day.", visual: { type: "scale", highlight: "certain" } },
  { prompt: "A cat will read a newspaper out loud. Certain or impossible?", answer: "Impossible", options: FOUR_SCALE, correct: "Right. Cats cannot read, so it can never happen.", wrong: "'Impossible' means it can never happen. Cats cannot read aloud.", visual: { type: "scale", highlight: "impossible" } },
  { prompt: "You will get one year older on your next birthday. Certain or impossible?", answer: "Certain", options: FOUR_SCALE, correct: "Yes. Birthdays always add a year, so it must happen.", wrong: "This one must happen every birthday, so it is certain.", visual: { type: "scale", highlight: "certain" } },
  { prompt: "You will draw a red counter from a bag with only blue counters. Certain or impossible?", answer: "Impossible", options: FOUR_SCALE, correct: "Correct. There are no red counters, so it can never happen.", wrong: "There are no red counters in the bag, so drawing red is impossible.", visual: { type: "bag", counters: [BLUE, BLUE, BLUE, BLUE, BLUE, BLUE] } },
]);

// Parametric: fresh spinner / bag / die "likely or unlikely?" every time.
const w1l2 = randGen([likelihoodMaker("spinner"), likelihoodMaker("bag"), dieLikelihoodMaker()]);

const w1l3 = poolGen([
  { prompt: "You roll a 7 on a normal die. Which chance word and why?", answer: "Impossible — a die only has 1 to 6", options: ["Impossible — a die only has 1 to 6", "Unlikely — 7 is a big number", "Likely — 7 is on most dice", "Certain — a 7 always comes up"], correct: "Correct. A die has no 7, so rolling one can never happen.", wrong: "Look at the die: the faces are 1 to 6. There is no 7, so it is impossible.", visual: { type: "die", face: 6 } },
  { prompt: "A tossed coin lands on heads. Which chance word and why?", answer: "50/50 — heads and tails are equally likely", options: ["50/50 — heads and tails are equally likely", "Certain — coins always land heads", "Impossible — coins have no heads", "Unlikely — heads hardly ever happens"], correct: "Yes. A coin has two equal sides, so heads and tails are equally likely.", wrong: "A coin has two equal sides, so heads is neither likely nor unlikely — it is 50/50.", visual: { type: "coin", face: "heads" } },
  { prompt: "You draw a counter from a bag that has counters in it. Which chance word and why?", answer: "Certain — there is always a counter to draw", options: ["Certain — there is always a counter to draw", "Unlikely — the bag might be empty", "Impossible — you cannot reach in", "Likely — but sometimes you draw nothing"], correct: "Right. The bag has counters, so you must draw one — it is certain.", wrong: "The bag is full of counters, so you will always draw one. That is certain.", visual: { type: "bag", counters: [RED, BLUE, YELLOW, GREEN, RED, BLUE] } },
  { prompt: "The spinner lands on green, but there is no green on it. Which chance word and why?", answer: "Impossible — there is no green section", options: ["Impossible — there is no green section", "Unlikely — green is a rare colour", "Certain — every spinner has green", "Likely — green is a common colour"], correct: "Correct. With no green section, landing on green can never happen.", wrong: "There is no green on the spinner, so landing on green is impossible.", visual: { type: "spinner", wedges: [RED, RED, BLUE, YELLOW] } },
]);

// ─────────────────────────── Week 2: Everyday Chance Events ──────────────────
const w2l1 = poolGen([
  // Week 2 steps up from Week 1: instead of labelling one event, kids COMPARE
  // two-plus events, sort several cards into a named pile, and justify with
  // everyday reasons (no apparatus). L1 — compare and pick the most/least likely.
  { prompt: "Which of these is the MOST likely to happen?", answer: "You will eat some food today", options: ["You will eat some food today", "You will eat exactly seven peas today", "You will eat nothing for a whole week", "You will eat a bicycle today"], correct: "Right. Eating something today is the everyday one, so it is the most likely.", wrong: "Compare them: eating some food today is the one that usually happens.", visual: { type: "scale" } },
  { prompt: "Which of these is the LEAST likely to happen?", answer: "A real dragon will visit your class", options: ["A real dragon will visit your class", "You will get some homework this week", "The sun will come up tomorrow", "You will have a drink today"], correct: "Yes. Dragons are not real, so that is the least likely of the four.", wrong: "Find the one that almost never happens: a real dragon visiting is the least likely.", visual: { type: "scale" } },
  { prompt: "On a normal school day, which is MORE likely?", answer: "Your teacher takes the roll", options: ["Your teacher takes the roll", "It snows inside your classroom", "Everyone wears the exact same shoes", "A lion sits at your desk"], correct: "Right. Taking the roll happens most school days, so it is more likely.", wrong: "Think about a normal day: taking the roll is the one that usually happens.", visual: { type: "scale" } },
  { prompt: "Which of these is the MOST likely this weekend?", answer: "You will sleep at some point", options: ["You will sleep at some point", "You will grow 10 cm taller", "You will meet a talking fish", "You will visit the moon"], correct: "Yes. Everyone sleeps, so that is by far the most likely.", wrong: "Compare them: sleeping at some point is the everyday, most likely one.", visual: { type: "scale" } },
]);

const w2l2 = poolGen([
  // L2 — sort several event cards at once: which card belongs in the named pile.
  { prompt: "Sort the cards. Which one belongs in the CERTAIN pile?", answer: "Night will come tonight", options: ["Night will come tonight", "You roll a six next try", "A cat does your homework", "It rains indoors"], correct: "Right. Night always comes, so that card is certain.", wrong: "The certain pile is for things that must happen. Night always comes tonight.", visual: { type: "scale", highlight: "certain" } },
  { prompt: "Sort the cards. Which one belongs in the IMPOSSIBLE pile?", answer: "A pig flies by itself", options: ["A pig flies by itself", "You have lunch today", "It is sunny sometime", "You blink today"], correct: "Yes. Pigs cannot fly, so that card is impossible.", wrong: "The impossible pile is for things that can never happen — a pig flying by itself.", visual: { type: "scale", highlight: "impossible" } },
  { prompt: "Sort the cards. Which one belongs in the UNLIKELY pile?", answer: "You flip ten heads in a row", options: ["You flip ten heads in a row", "The sun rises", "You breathe today", "You get older this year"], correct: "Right. Ten heads in a row can happen but almost never — that is unlikely.", wrong: "The unlikely pile is for things that can happen but hardly ever — ten heads in a row.", visual: { type: "scale", highlight: "unlikely" } },
  { prompt: "Sort the cards. Which one belongs in the LIKELY pile?", answer: "It is sunny sometime this week", options: ["It is sunny sometime this week", "You meet a unicorn", "You turn into a frog", "You fly with no plane"], correct: "Yes. Some sun in a week usually happens, so that card is likely.", wrong: "The likely pile is for things that usually happen — some sun during the week.", visual: { type: "scale", highlight: "likely" } },
]);

const w2l3 = poolGen([
  // L3 — justify an everyday event (reasons, not apparatus).
  { prompt: "Rain falling at some point this week is likely because…", answer: "it usually rains at least once in a week", options: ["it usually rains at least once in a week", "rain likes the number seven", "the clouds look heavy today", "umbrellas make the rain come"], correct: "Right. Over a whole week rain usually happens at least once.", wrong: "Give a reason about how often it happens: rain usually comes at least once a week.", visual: { type: "scale", highlight: "likely" } },
  { prompt: "Seeing a real dinosaur on the way to school is impossible because…", answer: "dinosaurs died out long ago", options: ["dinosaurs died out long ago", "dinosaurs are too shy", "it is the wrong season", "dinosaurs sleep in the daytime"], correct: "Yes. Dinosaurs are extinct, so it can never happen.", wrong: "The reason is that dinosaurs no longer exist — they died out long ago.", visual: { type: "scale", highlight: "impossible" } },
  { prompt: "The bell ringing at home time is certain because…", answer: "it rings at the same time every school day", options: ["it rings at the same time every school day", "the bell likes ringing", "it is a lucky bell", "someone might forget it"], correct: "Right. It rings every school day, so it must happen.", wrong: "Give a reason it must happen: the bell rings at the same time every school day.", visual: { type: "scale", highlight: "certain" } },
  { prompt: "Winning a raffle when you hold 1 ticket out of 100 is unlikely because…", answer: "there are 99 other tickets that could win", options: ["there are 99 other tickets that could win", "raffles never have a winner", "your ticket is the wrong colour", "you bought it too late"], correct: "Yes. With 99 other tickets, your one ticket is unlikely to win.", wrong: "Think about the numbers: 99 other tickets could win, so yours is unlikely.", visual: { type: "scale", highlight: "unlikely" } },
]);

// ─────────────────────────── Week 3: Possible Outcomes ───────────────────────
const w3l1 = poolGen([
  { prompt: "What could this spinner land on?", answer: "Red, blue or yellow", options: ["Red, blue or yellow", "Only red", "Red, blue, yellow or green", "Purple or orange"], correct: "Yes. Those three colours are the only sections, so any of them could come up.", wrong: "List only the colours you can see: red, blue and yellow.", visual: { type: "spinner", wedges: [RED, BLUE, YELLOW] } },
  { prompt: "What could a tossed coin land on?", answer: "Heads or tails", options: ["Heads or tails", "Only heads", "Heads, tails or its edge", "A number from 1 to 6"], correct: "Right. A coin has two sides, so it is heads or tails.", wrong: "A coin has two faces, so the outcomes are heads or tails.", visual: { type: "coin", face: "heads" } },
  { prompt: "What could you roll on one die?", answer: "Any number from 1 to 6", options: ["Any number from 1 to 6", "Only a 6", "Any number from 1 to 10", "Heads or tails"], correct: "Yes. The faces are 1 to 6, so any of those could come up.", wrong: "A die has the faces 1 to 6, so any of those numbers could be rolled.", visual: { type: "die", face: 3 } },
  { prompt: "What could you draw from this bag?", answer: "Red or blue", options: ["Red or blue", "Only red", "Red, blue or green", "A number from 1 to 6"], correct: "Yes. The bag holds red and blue, so a draw is red or blue.", wrong: "Only red and blue are in the bag, so those are the outcomes.", visual: { type: "bag", counters: [RED, RED, BLUE, BLUE] } },
]);

const w3l2 = poolGen([
  { prompt: "Which list shows ALL the outcomes for one coin toss?", answer: "Heads or tails", options: ["Heads or tails", "Heads only", "Heads, tails or sideways", "Just tails"], correct: "Correct — every result that could happen in one toss.", wrong: "All outcomes means every result. For a coin that is heads or tails.", visual: { type: "coin", face: "tails" } },
  { prompt: "Which list shows ALL the outcomes for rolling one die?", answer: "1, 2, 3, 4, 5 or 6", options: ["1, 2, 3, 4, 5 or 6", "1, 2 or 3", "1 to 100", "Only the even numbers"], correct: "Yes — those six numbers are all the outcomes.", wrong: "All outcomes for a die are the six faces: 1, 2, 3, 4, 5 or 6.", visual: { type: "die", face: 6 } },
  { prompt: "Which list shows ALL the outcomes for this spinner?", answer: "Red, blue or yellow", options: ["Red, blue or yellow", "Red or blue", "Red, blue, yellow or green", "Red, blue, yellow or purple"], correct: "Right — every colour on the spinner, and only those.", wrong: "Count the colours on the spinner: red, blue and yellow — no more, no fewer.", visual: { type: "spinner", wedges: [RED, RED, BLUE, YELLOW] } },
  { prompt: "Which list shows ALL the outcomes for one draw from this bag?", answer: "Red or blue", options: ["Red or blue", "Red only", "Red, blue or green", "Blue, red or yellow"], correct: "Yes — the bag only holds red and blue counters.", wrong: "The bag has only red and blue, so those are all the outcomes.", visual: { type: "bag", counters: [RED, RED, BLUE, BLUE, RED, BLUE] } },
]);

const w3l3 = poolGen([
  { prompt: "You roll one die. Which result is NOT possible?", answer: "A 7", options: ["A 7", "A 4", "A 1", "A 6"], correct: "Right. A die has no 7, so that outcome is impossible.", wrong: "Check the faces 1 to 6. A 7 is not on the die, so it is not possible.", visual: { type: "die", face: 5 } },
  { prompt: "This bag holds red and blue only. Which draw is NOT possible?", answer: "Green", options: ["Green", "Red", "Blue", "A red or a blue"], correct: "Yes. There are no green counters, so green cannot be drawn.", wrong: "Only red and blue are in the bag, so green is not a possible outcome.", visual: { type: "bag", counters: [RED, RED, RED, BLUE, BLUE, BLUE] } },
  { prompt: "You toss a coin. Which is NOT a possible outcome?", answer: "It lands on 6", options: ["It lands on 6", "It lands on heads", "It lands on tails", "It shows heads facing up"], correct: "Correct. A coin has heads and tails, not numbers.", wrong: "A coin only shows heads or tails — it has no 6.", visual: { type: "coin", face: "heads" } },
  { prompt: "This spinner has red, blue and yellow. Which is NOT a possible outcome?", answer: "Purple", options: ["Purple", "Red", "Yellow", "Blue"], correct: "Right. There is no purple section, so purple is not possible.", wrong: "Only red, blue and yellow are on the spinner, so purple cannot happen.", visual: { type: "spinner", wedges: [RED, BLUE, YELLOW] } },
]);

// ─────────────────────────── Week 4: Predict and Test ────────────────────────
// Parametric: fresh "predict the colour it lands on most" spinner every time.
const w4l1 = randGen([predictMostMaker()]);

// Parametric: fresh "test the prediction" across spinner, bag and coin, with the
// result matching or not, so the object and scenario vary every time.
const w4l2 = randGen([testPredictionMaker()]);

// Parametric: fresh "did it match?" across spinner, bag, coin and die.
const w4l3 = randGen([didItMatchMaker()]);

// ─────────────────────── Week 5: Repeated Experiments ────────────────────────
const w5l1 = poolGen([
  { prompt: "You will toss a coin 10 times. What is a fair way to record each toss?", answer: "Make a tally mark under heads or tails each time", options: ["Make a tally mark under heads or tails each time", "Only write down the heads", "Guess the total at the end", "Rub out results you do not like"], correct: "Yes. A tally mark for every toss keeps the record fair and complete.", wrong: "Record every toss with a tally mark so no results are missed.", visual: { type: "coin", face: "heads" } },
  { prompt: "You will spin this 4-colour spinner 20 times. What should you expect?", answer: "Each colour about 5 times", options: ["Each colour about 5 times", "All 20 the same colour", "Red exactly 20 times", "One colour on every spin"], correct: "Right. Equal sections should each come up roughly a quarter of the time.", wrong: "The sections are equal, so 20 spins should give each colour about 5.", visual: { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] } },
  { prompt: "Why do we repeat a chance experiment many times instead of once?", answer: "More trials give us a clearer picture of what usually happens", options: ["More trials give us a clearer picture of what usually happens", "One try is always enough", "To make the game last longer", "So the teacher stays busy"], correct: "Yes. Lots of trials show the pattern better than a single try.", wrong: "One trial can be luck; repeating many times shows what usually happens.", visual: { type: "die", face: 6 } },
  { prompt: "You will roll one die 30 times. What should you expect?", answer: "Each number about 5 times", options: ["Each number about 5 times", "Always a six", "Never a one", "All thirty the same number"], correct: "Right. Six equal faces over 30 rolls average about 5 each.", wrong: "The faces are equally likely, so 30 rolls give each number about 5.", visual: { type: "die", face: 3 } },
]);

// Parametric: fresh randomised tally to read ("which came up most?") each time.
const w5l2 = randGen([tallyMostMaker()]);

const w5l3 = poolGen([
  { prompt: "Spin a 4-colour spinner 16 times. Red:5, Blue:2, Green:5, Yellow:4. Which tied for most?", answer: "Red and green", options: ["Red and green", "Blue and yellow", "Only red", "Green and yellow"], correct: "Right. Red and green both have 5 — the highest count.", wrong: "Look for the two highest equal counts: red and green each have 5.", visual: { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] } },
  { prompt: "Toss two coins in two groups. Group A: 6 heads. Group B: 6 heads. What can you say?", answer: "Both groups got the same number of heads", options: ["Both groups got the same number of heads", "Group A cheated", "Coins never match", "Group B was luckier"], correct: "Yes. Equal tallies mean the two groups matched this time.", wrong: "Both tallies are 6, so the groups got the same result.", visual: { type: "coin", face: "heads" } },
  { prompt: "Roll a die 10 times. Tally — 6:0. What does a zero tally mean?", answer: "A 6 did not come up in these ten rolls", options: ["A 6 did not come up in these ten rolls", "A 6 is impossible", "The die is broken", "A 6 came up ten times"], correct: "Right. Zero means it just did not happen this time — not that it can't.", wrong: "A zero tally means it did not come up in these rolls, not that it is impossible.", visual: { type: "die", face: 6 } },
  { prompt: "Roll a die 20 times. Tally — 3:7, and every other number fewer. Which came up most?", answer: "3", options: ["3", "6", "1", "They all tied"], correct: "Yes. 3 has the highest tally at 7.", wrong: "Find the biggest count: 3 has 7, more than any other number.", visual: { type: "die", face: 3 } },
]);

// ─────────────────────── Week 6: Variation Investigation ─────────────────────
const w6l1 = poolGen([
  { prompt: "Group A gets 4 heads out of 10. Group B gets 7 heads out of 10. What does this show?", answer: "Results can vary between repeated trials", options: ["Results can vary between repeated trials", "One group did it wrong", "Coins never land tails", "Heads is impossible"], correct: "Right. The same experiment can give different results each time.", wrong: "Both groups did it properly — chance results simply vary from trial to trial.", visual: { type: "coin", face: "heads" } },
  { prompt: "You spin the same spinner twice: first red-heavy result, then blue-heavy. What is true?", answer: "The same experiment can turn out differently each time", options: ["The same experiment can turn out differently each time", "The spinner changed colours", "One result must be a mistake", "The spinner is broken"], correct: "Yes. Variation between trials is normal in chance.", wrong: "Nothing changed about the spinner — results just vary between trials.", visual: { type: "spinner", wedges: [RED, RED, BLUE, BLUE] } },
  { prompt: "Two groups roll the same die 12 times and get different totals. What should you conclude?", answer: "Different results are normal — that is variation", options: ["Different results are normal — that is variation", "The dice are unfair", "Only one group can be right", "Someone must have miscounted"], correct: "Right. Different totals across trials is exactly what variation means.", wrong: "The same fair die can give different totals — that difference is variation.", visual: { type: "die", face: 4 } },
  { prompt: "You draw from the same bag twice and get a different colour each time. What does this show?", answer: "The same experiment can give different results", options: ["The same experiment can give different results", "The bag swapped its counters", "One draw must be a mistake", "Draws must always match"], correct: "Right. Repeating a draw can give a different colour — that is variation.", wrong: "Nothing changed in the bag; different draws are just normal variation.", visual: { type: "bag", counters: [RED, RED, BLUE, BLUE] } },
]);

const w6l2 = poolGen([
  { prompt: "The whole class combines 100 tosses: Heads 52, Tails 48. What does this suggest?", answer: "Heads and tails are about equally likely", options: ["Heads and tails are about equally likely", "Heads always wins", "Tails is impossible", "The coin is unfair"], correct: "Yes. Over many tosses the counts get close to even — about 50/50.", wrong: "52 and 48 are very close, which suggests heads and tails are about equal.", visual: { type: "coin", face: "heads" } },
  { prompt: "Why do we combine everyone's results as a class?", answer: "More trials together give a clearer, fairer picture", options: ["More trials together give a clearer, fairer picture", "To make one group win", "So we can stop early", "To use up more paper"], correct: "Right. Pooling lots of trials smooths out the ups and downs.", wrong: "Combining results means many more trials, which shows the pattern more clearly.", visual: { type: "die", face: 5 } },
  { prompt: "The class spun an equal 4-colour spinner 40 times. Roughly what do you expect for each colour?", answer: "About 10 each", options: ["About 10 each", "All 40 red", "Exactly 7 each", "About 20 each"], correct: "Yes. Equal sections over 40 spins average about a quarter each — near 10.", wrong: "Equal sections share the 40 spins about evenly, so roughly 10 per colour.", visual: { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] } },
  { prompt: "The class rolled a die 120 times and each number came up about 20 times. What does this suggest?", answer: "Each number is about equally likely", options: ["Each number is about equally likely", "Six is the best number", "One is impossible", "The die is loaded"], correct: "Right. Roughly equal counts suggest every face is equally likely.", wrong: "About 20 each means the six numbers are coming up about equally often.", visual: { type: "die", face: 4 } },
]);

const w6l3 = poolGen([
  { prompt: "An equal red/blue spinner gave Red 6, Blue 4. Why did they not split evenly?", answer: "Chance results do not always split exactly evenly", options: ["Chance results do not always split exactly evenly", "Blue is impossible", "Red is certain", "The spinner is faulty"], correct: "Right. Even with equal chances, real trials wobble around the even split.", wrong: "Equal chances do not force an exact even split — real results vary a little.", visual: { type: "spinner", wedges: [RED, BLUE] } },
  { prompt: "You predicted blue but red came up. What is the best reflection?", answer: "A prediction can be sensible even when another outcome happens", options: ["A prediction can be sensible even when another outcome happens", "The prediction made red impossible", "Only wrong predictions have outcomes", "Red must have cheated"], correct: "Yes. A good prediction can still be beaten by a possible outcome.", wrong: "Your prediction was reasonable; another possible outcome just happened this time.", visual: { type: "spinner", wedges: [RED, RED, BLUE, BLUE] } },
  { prompt: "The class repeats a die experiment and gets different totals each time. What is worth discussing?", answer: "How and why the results varied across the trials", options: ["How and why the results varied across the trials", "Why dice have no outcomes", "Why the experiment was certain", "Which group is the best"], correct: "Right. Discussing the variation is the whole point of the investigation.", wrong: "The useful discussion is about the variation — how the results differed and why.", visual: { type: "die", face: 6 } },
  { prompt: "Two groups spin the same fair spinner and get different results. The best explanation is…", answer: "chance naturally varies from trial to trial", options: ["chance naturally varies from trial to trial", "one spinner must be fake", "spinners have no colours", "the results were copied wrongly"], correct: "Right. A fair spinner still gives different results each time — that is variation.", wrong: "Nothing is wrong with the spinner; chance results simply vary between trials.", visual: { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] } },
]);

// Each of the 18 lessons runs the generator that matches its title.
const LESSON_GENERATORS: Record<string, Gen> = {
  "1-1": w1l1, "1-2": w1l2, "1-3": w1l3,
  "2-1": w2l1, "2-2": w2l2, "2-3": w2l3,
  "3-1": w3l1, "3-2": w3l2, "3-3": w3l3,
  "4-1": w4l1, "4-2": w4l2, "4-3": w4l3,
  "5-1": w5l1, "5-2": w5l2, "5-3": w5l3,
  "6-1": w6l1, "6-2": w6l2, "6-3": w6l3,
};

export function getChanceHollowLevel3TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const match = /y3-chance-w(\d+)-l(\d+)/.exec(lessonId);
  if (!match) return null;
  const week = Number(match[1]);
  const lesson = Number(match[2]);
  const gen = LESSON_GENERATORS[`${week}-${lesson}`];
  if (!gen) return null;
  // Teaching and the three activities all come from this lesson's own
  // generator, which walks its cases without repeating — so every card matches
  // the lesson title and no question recurs within the lesson.
  return {
    teaching: () => gen(),
    activities: [() => gen(), () => gen(), () => gen()],
  };
}
