import type { ChanceVisual, PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

type Gen = () => PracticeTask;
type ChanceMaker = () => ChanceCase;

const rotate = <T,>(items: readonly T[], amount: number) => {
  const offset = ((amount % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
};

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

// Every lesson question is generated from an activity/object maker. Makers
// contain reusable context data, never complete question pools, and compute the
// answer from their selected object or randomised values on every call.
const randGen = (makers: readonly ChanceMaker[]): Gen => {
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
const CERTAIN_EVENTS = [
  ["The sun will set this evening", "the sun sets every day"],
  ["You will get one year older on your next birthday", "a birthday adds one year to your age"],
  ["A week will have seven days", "every week has seven days"],
  ["A normal die will show a number from 1 to 6", "those are its six faces"],
] as const;
const IMPOSSIBLE_EVENTS = [
  ["A cat will read a newspaper aloud", "cats cannot read aloud"],
  ["A fish will ride a bicycle to school", "fish cannot ride bicycles"],
  ["A normal die will roll a 9", "a normal die has no 9"],
  ["You will draw purple from a bag containing only orange counters", "there are no purple counters in the bag"],
] as const;

function certainOrImpossibleMaker(): ChanceCase {
  const isCertain = Math.random() < 0.5;
  const events: ReadonlyArray<readonly [string, string]> = isCertain ? CERTAIN_EVENTS : IMPOSSIBLE_EVENTS;
  const [event, reason] = choice(events);
  const answer = isCertain ? "Certain" : "Impossible";
  return {
    prompt: `${event}. Certain or impossible?`,
    answer,
    options: FOUR_SCALE,
    correct: `Yes. It is ${answer.toLowerCase()} because ${reason}.`,
    wrong: `${cap(answer)} means it ${isCertain ? "must happen" : "cannot happen"}; ${reason}.`,
    visual: { type: "scale", highlight: answer.toLowerCase() as "certain" | "impossible" },
  };
}
const w1l1 = randGen([certainOrImpossibleMaker]);

// Parametric: fresh spinner / bag / die "likely or unlikely?" every time.
const w1l2 = randGen([likelihoodMaker("spinner"), likelihoodMaker("bag"), dieLikelihoodMaker()]);

function explainChanceWordMaker(): ChanceCase {
  const mode = choice(["die", "coin", "bag", "spinner"] as const);
  if (mode === "die") {
    const impossible = randInt(7, 12);
    const answer = "Impossible — a die only has 1 to 6";
    return { prompt: `You roll a ${impossible} on a normal die. Which chance word and why?`, answer, options: [answer, `Unlikely — ${impossible} is a big number`, `Likely — ${impossible} is on most dice`, `Certain — ${impossible} always comes up`], correct: `Correct. A die has no ${impossible}, so it can never happen.`, wrong: `The die faces are 1 to 6. There is no ${impossible}, so it is impossible.`, visual: { type: "die", face: randInt(1, 6) } };
  }
  if (mode === "coin") {
    const face = choice(["heads", "tails"] as const);
    const other = face === "heads" ? "tails" : "heads";
    const answer = `50/50 — ${face} and ${other} are equally likely`;
    return { prompt: `A fair coin lands on ${face}. Which chance description and why?`, answer, options: [answer, `Certain — coins always land ${face}`, `Impossible — coins have no ${face}`, `Unlikely — ${face} hardly ever happens`], correct: "Yes. A fair coin has two equal sides.", wrong: `${cap(face)} and ${other} have the same chance, so it is 50/50.`, visual: { type: "coin", face } };
  }
  const paints = shuffleArr(PAINTS);
  const present = paints.slice(0, randInt(2, 3));
  const missing = paints.find((paint) => !present.includes(paint))!;
  const items = present.flatMap((paint) => Array(randInt(1, 3)).fill(paint.c)) as string[];
  const answer = `Impossible — there is no ${missing.name}`;
  const visual: ChanceVisual = mode === "spinner" ? { type: "spinner", wedges: shuffleArr(items) } : { type: "bag", counters: shuffleArr(items) };
  return { prompt: `The ${mode} gives ${missing.name}. Which chance word and why?`, answer, options: [answer, `Unlikely — ${missing.name} is rare`, `Certain — every ${mode} has ${missing.name}`, `Likely — ${missing.name} is common`], correct: `Correct. There is no ${missing.name}, so it cannot happen.`, wrong: `Only visible outcomes can happen; ${missing.name} is absent.`, visual };
}
const w1l3 = randGen([explainChanceWordMaker]);

// ─────────────────────────── Week 2: Everyday Chance Events ──────────────────
const LIKELY_DAILY_EVENTS = ["You will eat some food today", "You will sleep tonight", "Your teacher will take the roll", "You will have a drink today"] as const;
const UNUSUAL_EVENTS = ["You will grow 10 cm taller today", "Everyone will wear identical shoes", "It will snow inside the classroom", "You will visit the moon this afternoon"] as const;
const IMPOSSIBLE_DAILY_EVENTS = ["You will eat a bicycle", "A real dragon will visit class", "A fish will do your homework", "You will fly home without a machine"] as const;

function compareEverydayChanceMaker(): ChanceCase {
  const askLeast = Math.random() < 0.5;
  const likely = choice(LIKELY_DAILY_EVENTS);
  const impossible = choice(IMPOSSIBLE_DAILY_EVENTS);
  const unusual = shuffleArr(UNUSUAL_EVENTS).slice(0, 2);
  const options = shuffleArr([likely, ...unusual, impossible]);
  const answer = askLeast ? impossible : likely;
  return { prompt: `Which event is ${askLeast ? "LEAST" : "MOST"} likely to happen?`, answer, options, correct: `Right. ${answer} is the ${askLeast ? "least" : "most"} likely event here.`, wrong: `Compare what usually happens with what cannot happen. Choose ${answer}.`, visual: { type: "scale" } };
}
const w2l1 = randGen([compareEverydayChanceMaker]);

function sortChanceEventMaker(): ChanceCase {
  const category = choice(["certain", "likely", "unlikely", "impossible"] as const);
  const examples = {
    certain: choice(CERTAIN_EVENTS)[0],
    likely: choice(LIKELY_DAILY_EVENTS),
    unlikely: choice(UNUSUAL_EVENTS),
    impossible: choice(IMPOSSIBLE_DAILY_EVENTS),
  };
  return { prompt: `Sort the cards. Which one belongs in the ${category.toUpperCase()} pile?`, answer: examples[category], options: shuffleArr(Object.values(examples)), correct: `Right. That event is ${category}.`, wrong: `The ${category} pile needs an event that ${category === "certain" ? "must happen" : category === "impossible" ? "cannot happen" : category === "likely" ? "usually happens" : "can happen but rarely does"}.`, visual: { type: "scale", highlight: category } };
}
const w2l2 = randGen([sortChanceEventMaker]);

const REASONED_EVENTS = [
  { event: "The school bell will ring at home time", word: "certain", reason: "it is scheduled every school day" },
  { event: "Seeing a living dinosaur on the way to school", word: "impossible", reason: "dinosaurs died out long ago" },
  { event: "Winning with one raffle ticket among many", word: "unlikely", reason: "many other tickets could win" },
  { event: "Having a drink today", word: "likely", reason: "people usually drink every day" },
] as const;
function justifyChanceMaker(): ChanceCase {
  const picked = choice(REASONED_EVENTS);
  const distractors = shuffleArr(REASONED_EVENTS.filter((item) => item !== picked).map((item) => item.reason));
  return { prompt: `${picked.event} is ${picked.word} because…`, answer: picked.reason, options: shuffleArr([picked.reason, ...distractors]), correct: `Yes. ${cap(picked.reason)}.`, wrong: `Choose evidence about what can happen and how often: ${picked.reason}.`, visual: { type: "scale", highlight: picked.word } };
}
const w2l3 = randGen([justifyChanceMaker]);

// ─────────────────────────── Week 3: Possible Outcomes ───────────────────────
function possibleOutcomesMaker(): ChanceCase {
  const mode = choice(["coin", "die", "spinner", "bag"] as const);
  if (mode === "coin") return { prompt: "What could a tossed coin land on?", answer: "Heads or tails", options: ["Heads or tails", "Only heads", "A number from 1 to 6", "Red or blue"], correct: "Right. A coin has two sides: heads and tails.", wrong: "List both coin faces: heads or tails.", visual: { type: "coin", face: choice(["heads", "tails"] as const) } };
  if (mode === "die") return { prompt: "What could you roll on one normal die?", answer: "Any number from 1 to 6", options: ["Any number from 1 to 6", "Only a 6", "Any number from 1 to 10", "Heads or tails"], correct: "Yes. All six die faces are possible.", wrong: "A normal die has the faces 1 to 6.", visual: { type: "die", face: randInt(1, 6) } };
  const selected = shuffleArr(PAINTS).slice(0, randInt(2, 3));
  const names = selected.map((paint) => paint.name);
  const answer = names.map(cap).join(", ").replace(/, ([^,]*)$/, " or $1");
  const missing = PAINTS.find((paint) => !selected.includes(paint))!;
  const items = shuffleArr(selected.flatMap((paint) => Array(randInt(1, 3)).fill(paint.c)) as string[]);
  return { prompt: `What could this ${mode} give?`, answer, options: [answer, `Only ${names[0]}`, `${answer} or ${missing.name}`, "Any number from 1 to 6"], correct: `Yes. ${answer} are the visible outcomes.`, wrong: `List each visible colour and no others: ${answer}.`, visual: mode === "spinner" ? { type: "spinner", wedges: items } : { type: "bag", counters: items } };
}
const w3l1 = randGen([possibleOutcomesMaker]);

function allOutcomesMaker(): ChanceCase {
  const generated = possibleOutcomesMaker();
  return { ...generated, prompt: "Which answer lists ALL the possible outcomes for this chance tool?" };
}
const w3l2 = randGen([allOutcomesMaker]);

function impossibleOutcomeMaker(): ChanceCase {
  const mode = choice(["die", "coin", "spinner", "bag"] as const);
  if (mode === "die") {
    const impossible = randInt(7, 12);
    return { prompt: "You roll one die. Which result is NOT possible?", answer: `A ${impossible}`, options: shuffleArr([`A ${impossible}`, `A ${randInt(1, 2)}`, `A ${randInt(3, 4)}`, `A ${randInt(5, 6)}`]), correct: `Right. A die has no ${impossible}.`, wrong: `A normal die only has 1 to 6, so ${impossible} is not possible.`, visual: { type: "die", face: randInt(1, 6) } };
  }
  if (mode === "coin") return { prompt: "You toss a coin. Which result is NOT possible?", answer: "It lands on a number", options: ["It lands on a number", "It lands on heads", "It lands on tails", "It shows tails facing up"], correct: "Correct. A coin has heads and tails, not numbers.", wrong: "A coin can show heads or tails; it has no numbered face.", visual: { type: "coin", face: choice(["heads", "tails"] as const) } };
  const selected = shuffleArr(PAINTS).slice(0, 3);
  const missing = PAINTS.find((paint) => !selected.includes(paint))!;
  const items = shuffleArr(selected.flatMap((paint) => Array(randInt(1, 2)).fill(paint.c)) as string[]);
  return { prompt: `Which ${mode} outcome is NOT possible?`, answer: cap(missing.name), options: shuffleArr([cap(missing.name), ...selected.map((paint) => cap(paint.name))]), correct: `Right. There is no ${missing.name} outcome.`, wrong: `Only the visible colours can happen; ${missing.name} is absent.`, visual: mode === "spinner" ? { type: "spinner", wedges: items } : { type: "bag", counters: items } };
}
const w3l3 = randGen([impossibleOutcomeMaker]);

// ─────────────────────────── Week 4: Predict and Test ────────────────────────
// Parametric: fresh "predict the colour it lands on most" spinner every time.
const w4l1 = randGen([predictMostMaker()]);

// Parametric: fresh "test the prediction" across spinner, bag and coin, with the
// result matching or not, so the object and scenario vary every time.
const w4l2 = randGen([testPredictionMaker()]);

// Parametric: fresh "did it match?" across spinner, bag, coin and die.
const w4l3 = randGen([didItMatchMaker()]);

// ─────────────────────── Week 5: Repeated Experiments ────────────────────────
function planRepeatedExperimentMaker(): ChanceCase {
  const mode = choice(["coin", "spinner", "die"] as const);
  const outcomes = mode === "coin" ? 2 : mode === "spinner" ? 4 : 6;
  const repetitions = outcomes * choice([3, 4, 5, 6]);
  const action = mode === "coin" ? "toss" : mode === "spinner" ? "spin" : "roll";
  const answer = `Record every ${action} and expect about ${repetitions / outcomes} of each outcome`;
  const visual: ChanceVisual = mode === "coin" ? { type: "coin", face: choice(["heads", "tails"] as const) } : mode === "spinner" ? { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] } : { type: "die", face: randInt(1, 6) };
  return { prompt: `You will ${action} a fair ${mode} ${repetitions} times. What is a sensible plan?`, answer, options: [answer, "Only record the result you wanted", "Guess the totals at the end", "Rub out surprising results"], correct: "Yes. Record every trial, then compare the counts with a roughly even result.", wrong: "A fair investigation records every trial and uses the number of outcomes to form an expectation.", visual };
}
const w5l1 = randGen([planRepeatedExperimentMaker]);

// Parametric: fresh randomised tally to read ("which came up most?") each time.
// Interactive: actually run a chance tool 10 times and record each result as a
// tally. The tool varies each round — spinner, coin or die — to keep it fresh.
function makeSpinTallyTask(): PracticeTask {
  const tool = choice(["spinner", "coin", "die"] as const);
  if (tool === "coin") {
    return {
      kind: "chanceSpinTally",
      tool,
      prompt: "Flip the coin 10 times. After each flip, tap the side it landed on to record a tally.",
      draw: ["heads", "tails"],
      spins: 10,
      labels: [{ key: "heads", name: "Heads" }, { key: "tails", name: "Tails" }],
    };
  }
  if (tool === "die") {
    return {
      kind: "chanceSpinTally",
      tool,
      prompt: "Roll the die 10 times. After each roll, tap the number it landed on to record a tally.",
      draw: ["1", "2", "3", "4", "5", "6"],
      spins: 10,
      labels: [1, 2, 3, 4, 5, 6].map((face) => ({ key: String(face), name: String(face) })),
    };
  }
  const chosen = shuffleArr(PAINTS).slice(0, randInt(3, 4));
  const draw: string[] = [];
  for (const p of chosen) for (let i = 0, w = randInt(1, 2); i < w; i += 1) draw.push(p.c);
  return {
    kind: "chanceSpinTally",
    tool: "spinner",
    prompt: "Spin the spinner 10 times. After each spin, tap the colour it landed on to record a tally.",
    draw: shuffleArr(draw),
    spins: 10,
    labels: chosen.map((p) => ({ key: p.c, name: p.name, colour: p.c })),
  };
}
const w5l2: Gen = makeSpinTallyTask;

// Interactive: auto-run a chance tool, watch it tally itself, then interpret the
// results. Tool varies each round. `compareTrials` runs the experiment twice to
// show variation between trials.
function makeAutoTallyTask(mode: "most" | "least" | "compareTrials" | "predictMatch", spins: number): PracticeTask {
  const tool = choice(["spinner", "coin", "die"] as const);
  let draw: string[];
  let labels: { key: string; name: string; colour?: string }[];
  if (tool === "coin") {
    draw = ["heads", "tails"];
    labels = [{ key: "heads", name: "Heads" }, { key: "tails", name: "Tails" }];
  } else if (tool === "die") {
    draw = ["1", "2", "3", "4", "5", "6"];
    labels = [1, 2, 3, 4, 5, 6].map((face) => ({ key: String(face), name: String(face) }));
  } else {
    const chosen = shuffleArr(PAINTS).slice(0, randInt(3, 4));
    const wedges: string[] = [];
    for (const p of chosen) for (let i = 0, w = randInt(1, 2); i < w; i += 1) wedges.push(p.c);
    draw = shuffleArr(wedges);
    labels = chosen.map((p) => ({ key: p.c, name: p.name, colour: p.c }));
  }
  const action = tool === "coin" ? "flip" : tool === "die" ? "roll" : "spin";
  const prompt = mode === "compareTrials"
    ? `Run the same experiment twice: auto-${action} the ${tool} ${spins} times, twice. Then compare the two trials.`
    : mode === "predictMatch"
      ? `Predict, then test: will two trials of ${spins} ${action}s come out exactly the same? Make your prediction, then run both.`
      : `Auto-${action} the ${tool} ${spins} times, then read the tally to answer.`;
  return { kind: "chanceAutoTally", tool, draw, spins, labels, mode, prompt };
}
const w5l3: Gen = () => makeAutoTallyTask("most", 16);

// ─────────────────────── Week 6: Variation Investigation ─────────────────────
// Hands-on variation, two ways: (a) run the same experiment twice and compare
// the trials, or (b) predict whether the two trials will match, then run and see
// if you were right. The lesson rotates between them to stay engaging.
const w6l1: Gen = () => choice([
  () => makeAutoTallyTask("compareTrials", 10),
  () => makeAutoTallyTask("predictMatch", 10),
])();

function combineClassResultsMaker(): ChanceCase {
  const mode = choice(["coin", "spinner", "die"] as const);
  const outcomes = mode === "coin" ? 2 : mode === "spinner" ? 4 : 6;
  const expectedEach = choice([8, 10, 15, 20]);
  const trials = outcomes * expectedEach;
  const answer = mode === "coin" ? "Heads and tails are about equally likely" : `Each ${mode === "spinner" ? "colour" : "number"} is about equally likely`;
  const visual: ChanceVisual = mode === "coin" ? { type: "coin", face: choice(["heads", "tails"] as const) } : mode === "spinner" ? { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] } : { type: "die", face: randInt(1, 6) };
  return { prompt: `The class combined ${trials} fair-${mode} results and each outcome appeared about ${expectedEach} times. What does this suggest?`, answer, options: [answer, "One outcome is certain", "One outcome is impossible", `The ${mode} must be unfair`], correct: "Right. Similar counts over many trials support equal chances.", wrong: "When the outcome counts are close over many trials, the outcomes are about equally likely.", visual };
}
const w6l2 = randGen([combineClassResultsMaker]);

function explainVariationMaker(): ChanceCase {
  const mode = choice(["coin", "spinner", "die"] as const);
  const first = randInt(3, 8);
  let second = randInt(3, 8);
  while (second === first) second = randInt(3, 8);
  const answer = "Chance results can vary from trial to trial";
  const visual: ChanceVisual = mode === "coin" ? { type: "coin", face: choice(["heads", "tails"] as const) } : mode === "spinner" ? { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] } : { type: "die", face: randInt(1, 6) };
  return { prompt: `Two groups used the same fair ${mode}. One outcome appeared ${first} times for Group A and ${second} times for Group B. What explains the difference?`, answer, options: [answer, `The ${mode} must be broken`, "One result is impossible", "Both groups must get identical totals"], correct: "Right. Fair chance tools can still produce different short-run results.", wrong: "Fair does not mean every small trial is identical; natural variation is expected.", visual };
}
const w6l3 = randGen([explainVariationMaker]);

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
