import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

type Gen = () => PracticeTask;
type LessonSpec = { teaching: Gen; activities: readonly [Gen, Gen, Gen, ...Gen[]] };

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!;
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j]!, out[i]!]; }
  return out;
}

function fresh(build: () => PracticeTask): Gen {
  const recent: string[] = [];
  return () => {
    let task = build();
    let key = JSON.stringify(task);
    for (let guard = 0; recent.includes(key) && guard < 30; guard += 1) {
      task = build();
      key = JSON.stringify(task);
    }
    recent.push(key);
    if (recent.length > 10) recent.shift();
    return task;
  };
}

const FRACTIONS = [
  { winning: 1, total: 10 }, { winning: 1, total: 5 }, { winning: 1, total: 4 },
  { winning: 2, total: 5 }, { winning: 1, total: 2 }, { winning: 3, total: 5 },
  { winning: 3, total: 4 }, { winning: 4, total: 5 }, { winning: 9, total: 10 },
] as const;

function scale(prompt: string, displayMode: "decimal" | "percent" | "mixed" = "mixed"): Gen {
  return fresh(() => {
    const f = pick(FRACTIONS);
    const value = f.winning / f.total;
    const label = displayMode === "percent" ? `${Math.round(value * 100)}%` : displayMode === "decimal" ? String(value) : pick([`${f.winning}/${f.total}`, `${Math.round(value * 100)}%`, String(value)]);
    return { kind: "chanceScalePortal", prompt, sourceLabel: label, targetValue: value, scaleStep: 0.05, displayMode };
  });
}

// L3 "Estimate the Event": show the real tool with its winning outcomes and let
// the child estimate the probability from the picture.
function estimate(prompt: string): Gen {
  return fresh(() => {
    const f = pick(FRACTIONS);
    const tool = pick(["spinner", "bag"] as const);
    return { kind: "chanceScalePortal", prompt, sourceLabel: "Estimate", targetValue: f.winning / f.total, scaleStep: 0.05, displayMode: "mixed", scene: { tool, winning: f.winning, total: f.total } };
  });
}

// L2 "Three Forms, One Chance": tap the decimal and percentage that equal the
// shown fraction (a matching game, not a slider).
function makeFormMatch(): Gen {
  return fresh(() => {
    const f = pick(FRACTIONS);
    const value = f.winning / f.total;
    const others = FRACTIONS.filter((g) => g.winning / g.total !== value);
    const d1 = pick(others);
    const d2 = pick(others.filter((g) => g.winning / g.total !== d1.winning / d1.total));
    const options = shuffle([
      { label: `${Math.round(value * 100)}%`, correct: true },
      { label: String(value), correct: true },
      { label: `${Math.round((d1.winning / d1.total) * 100)}%`, correct: false },
      { label: String(d2.winning / d2.total), correct: false },
    ]);
    return { kind: "chanceFormMatch", prompt: "Tap the two cards that show the same chance as this fraction.", anchorLabel: `${f.winning}/${f.total}`, options };
  });
}

function forge(prompt: string, targetLabel = "Match the target", fixedTool?: "spinner" | "bag" | "die"): Gen {
  return fresh(() => {
    const tool = fixedTool ?? pick(["spinner", "bag", "die"] as const);
    const total = tool === "die" ? 6 : tool === "bag" ? pick([5, 6, 8, 10, 12] as const) : pick([4, 5, 6, 8, 10, 12] as const);
    const targetWinning = randInt(1, total - 1);
    let initialWinning = randInt(0, total);
    if (initialWinning === targetWinning) initialWinning = (initialWinning + 1) % (total + 1);
    return { kind: "chanceProbabilityForge", prompt, tool, targetWinning, total, initialWinning, targetLabel };
  });
}

function complement(prompt: string): Gen {
  return fresh(() => {
    const tool = pick(["spinner", "bag", "die"] as const);
    const total = tool === "die" ? 6 : pick([5, 8, 10, 12, 20] as const);
    const sourceWinning = randInt(1, total - 1);
    const targetWinning = total - sourceWinning;
    let initialWinning = randInt(0, total);
    if (initialWinning === targetWinning) initialWinning = (initialWinning + 1) % (total + 1);
    return { kind: "chanceProbabilityForge", prompt, tool, targetWinning, total, initialWinning, targetLabel: "Complete one whole", sourceWinning };
  });
}

function simulation(prompt: string, challenge: "predict" | "compare" | "convergence", stages?: number[]): Gen {
  return fresh(() => {
    const f = pick(FRACTIONS.filter((item) => item.total <= 10));
    const trialStages = stages ?? (challenge === "predict" ? [pick([20, 30, 40, 50])] : challenge === "compare" ? [pick([20, 30]), pick([80, 100, 120])] : [10, 50, pick([200, 300, 500])]);
    return { kind: "chanceSimulationLab", prompt, tool: pick(["spinner", "coin", "die"] as const), winning: f.winning, total: f.total, stages: trialStages, targetName: pick(["glow", "shield", "portal", "crystal"]), challenge };
  });
}

const DEBUG_TARGETS = [
  "a 1 in 2 event", "a 1 in 4 event", "a 1 in 5 event", "a 2 in 5 event",
  "a 3 in 5 event", "a 3 in 4 event", "a 20% event", "a 40% event", "a 75% event",
] as const;
const DEBUG_POOLS: Record<"choose" | "debug" | "audit", { correct: string[]; wrong: string[] }> = {
  choose: {
    correct: ["Its winning share matches {t} exactly.", "The outcomes have the same proportions as {t}.", "Every outcome is mapped so the chance equals {t}."],
    wrong: ["A winning outcome is mapped twice.", "Its winning share does not match the event.", "It uses more winning outcomes than the event.", "One losing outcome is treated as a win."],
  },
  debug: {
    correct: ["Outcomes are mapped once and the tool resets after every trial.", "Each outcome is used once and nothing carries over between trials.", "The mapping is one-to-one and the tool is reset before each trial."],
    wrong: ["A winning outcome is mapped twice.", "Used outcomes stay removed after each trial.", "The tool is not reset between trials.", "Two different outcomes share the same result."],
  },
  audit: {
    correct: ["All outcomes are included and their probabilities total 100%.", "Every outcome is listed and the shares add to one whole.", "Nothing is missing and the probabilities total 100%."],
    wrong: ["One possible outcome is missing.", "The probabilities add up to more than 100%.", "An outcome is listed twice.", "Its winning share does not match the event."],
  },
};
function debuggerTask(prompt: string, purpose: "choose" | "debug" | "audit"): Gen {
  return fresh(() => {
    const target = pick(DEBUG_TARGETS);
    const answerId = `machine-${randInt(1000, 9999)}`;
    const wrongA = `machine-${randInt(1000, 9999)}`;
    const wrongB = `machine-${randInt(1000, 9999)}`;
    const pool = DEBUG_POOLS[purpose];
    const correct = pick(pool.correct).replace("{t}", target);
    const [w1, w2] = shuffle(pool.wrong).slice(0, 2);
    return {
      kind: "chanceModelDebugger",
      prompt,
      scenario: `Model ${target}.`,
      // Shuffle first, THEN label A/B/C by position, so the correct machine's
      // label is not always the same (otherwise kids just learn to pick it).
      machines: [
        { id: wrongA, detail: w1!, fair: false },
        { id: answerId, detail: correct, fair: true },
        { id: wrongB, detail: w2!, fair: false },
      ].sort(() => Math.random() - 0.5).map((machine, index) => ({ ...machine, title: `Machine ${String.fromCharCode(65 + index)}` })),
      answerId,
      reason: correct,
    };
  });
}

const masterTrial = fresh(() => {
  const f = pick(FRACTIONS.filter((item) => item.total <= 10));
  const trials = pick([40, 50, 80, 100] as const);
  const expected = Math.round(trials * f.winning / f.total);
  const observed = Math.max(0, Math.min(trials, expected + randInt(-Math.max(2, Math.round(trials * 0.08)), Math.max(2, Math.round(trials * 0.08)))));
  return { kind: "chanceMasterTrial", prompt: "Break Chanzia's probability shield in three moves.", targetWinning: f.winning, total: f.total, trials, observed, opponentName: "Master Chanzia", opponentImage: "/images/chanzia-master-cutout.png" };
});

// Each lesson gets its OWN generators with unique prompts, so lessons do not
// borrow each other's questions.
// W1 Probability Scales
const placeScale = scale("Open the portal at the matching probability.", "mixed");
const percentScale = scale("Calibrate the percentage portal.", "percent");
const decimalScale = scale("Calibrate the decimal portal.", "decimal");
const formMatch = makeFormMatch();
const estimateEvent = estimate("Estimate the chance shown on the tool, then open the closest portal.");
// W2 Calculate Probability
const countSpinner = forge("Set the winning sectors so the spinner shows the target probability.", "Spinner target", "spinner");
const countBag = forge("Set the winning counters so the bag shows the target probability.", "Bag target", "bag");
const countDie = forge("Choose the winning faces so the die shows the target probability.", "Die target", "die");
const completeWhole = complement("Complete the other side so both probabilities total one whole.");
const buildSpinner = forge("Build a spinner with the target probability.", "Spinner target", "spinner");
const buildBag = forge("Load the bag with the target probability.", "Bag target", "bag");
const buildDie = forge("Mark the faces to create the target probability.", "Die target", "die");
// W3 Expected and Observed
const predictFrequency = simulation("Predict the count, then launch the experiment.", "predict");
const expectedObserved = simulation("Run the experiment and compare expected with observed.", "compare");
const explainVariation = simulation("Explain how different results can still fit the same model.", "compare");
// W4 Trial-Size Effect
const trialLadder = simulation("Climb the trial ladder and track the relative frequency.", "convergence", [10, 50, 200]);
const convergence = simulation("Chase the expected probability through three trial stages.", "convergence", [20, 100, 500]);
const variationStorm = simulation("Ride the variation storm and choose the careful conclusion.", "convergence", [10, 50, 300]);
// W5 Simulation Engineering
const chooseSimulator = debuggerTask("Choose the simulator that matches the event.", "choose");
const debugMachine = debuggerTask("Find the fault in Chanzia's simulation machine.", "debug");
const auditMachine = debuggerTask("Audit the machine before it launches.", "audit");
// W6 Master's Grand Trial
const planInvestigation = debuggerTask("Lock in a fair investigation plan.", "choose");
const runInvestigation = simulation("Run the full investigation and track its evidence.", "convergence", [20, 100, 500]);
const masterVerdict = simulation("Read the shield's trials and lock the careful verdict.", "convergence", [30, 120, 400]);

const LESSONS: Record<string, LessonSpec> = {
  "1-1": { teaching: placeScale, activities: [placeScale, percentScale, decimalScale] },
  "1-2": { teaching: formMatch, activities: [formMatch, formMatch, formMatch] },
  "1-3": { teaching: estimateEvent, activities: [estimateEvent, estimateEvent, estimateEvent] },
  "2-1": { teaching: countSpinner, activities: [countSpinner, countBag, countDie] },
  "2-2": { teaching: completeWhole, activities: [completeWhole, completeWhole, completeWhole] },
  "2-3": { teaching: buildSpinner, activities: [buildSpinner, buildBag, buildDie] },
  "3-1": { teaching: predictFrequency, activities: [predictFrequency, predictFrequency, predictFrequency] },
  "3-2": { teaching: expectedObserved, activities: [expectedObserved, expectedObserved, expectedObserved] },
  "3-3": { teaching: explainVariation, activities: [explainVariation, explainVariation, explainVariation] },
  "4-1": { teaching: trialLadder, activities: [trialLadder, trialLadder, trialLadder] },
  "4-2": { teaching: convergence, activities: [convergence, convergence, convergence] },
  "4-3": { teaching: variationStorm, activities: [variationStorm, variationStorm, variationStorm] },
  "5-1": { teaching: chooseSimulator, activities: [chooseSimulator, chooseSimulator, chooseSimulator] },
  "5-2": { teaching: debugMachine, activities: [debugMachine, debugMachine, debugMachine] },
  "5-3": { teaching: auditMachine, activities: [auditMachine, auditMachine, auditMachine] },
  "6-1": { teaching: planInvestigation, activities: [planInvestigation, planInvestigation, planInvestigation] },
  "6-2": { teaching: runInvestigation, activities: [runInvestigation, runInvestigation, runInvestigation] },
  "6-3": { teaching: masterTrial, activities: [masterTrial, masterVerdict, masterVerdict] },
};

export function getChanceHollowLevel6TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const match = /y6-chance-w(\d+)-l(\d+)/.exec(lessonId);
  if (!match) return null;
  const spec = LESSONS[`${Number(match[1])}-${Number(match[2])}`];
  if (!spec) return null;
  return { teaching: () => spec.teaching(), activities: spec.activities };
}
