import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

type Gen = () => PracticeTask;
type LessonSpec = { teaching: Gen; activities: readonly [Gen, Gen, Gen, ...Gen[]] };

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!;
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

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

function estimate(prompt: string): Gen {
  return fresh(() => {
    const f = pick(FRACTIONS);
    const detail = pick([
      `${f.winning} of ${f.total} equal spinner sectors glow`,
      `${f.winning} of ${f.total} counters are crystal`,
      `${f.winning} of ${f.total} equally likely cards are shields`,
    ]);
    return { kind: "chanceScalePortal", prompt: `${prompt} ${detail}.`, sourceLabel: "Estimate", targetValue: f.winning / f.total, scaleStep: 0.05, displayMode: "mixed" };
  });
}

function forge(prompt: string, targetLabel = "Match the target"): Gen {
  return fresh(() => {
    const tool = pick(["spinner", "bag", "die"] as const);
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

function debuggerTask(prompt: string, purpose: "choose" | "debug" | "audit"): Gen {
  return fresh(() => {
    const target = pick(["a 1 in 2 event", "a 1 in 4 event", "a 3 in 5 event", "a 20% event"] as const);
    const answerId = `machine-${randInt(1000, 9999)}`;
    const wrongA = `machine-${randInt(1000, 9999)}`;
    const wrongB = `machine-${randInt(1000, 9999)}`;
    const correct = purpose === "audit" ? "All outcomes are included and their probabilities total 100%." : purpose === "debug" ? "Outcomes are mapped once and the tool resets after every trial." : `The outcomes have the same proportions as ${target}.`;
    return {
      kind: "chanceModelDebugger",
      prompt,
      scenario: `Model ${target}.`,
      machines: [
        { id: wrongA, title: "Machine A", detail: purpose === "audit" ? "One possible outcome is missing." : "A winning outcome is mapped twice.", fair: false },
        { id: answerId, title: "Machine B", detail: correct, fair: true },
        { id: wrongB, title: "Machine C", detail: purpose === "debug" ? "Used outcomes stay removed after each trial." : "Its winning share does not match the event.", fair: false },
      ].sort(() => Math.random() - 0.5),
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

const placeScale = scale("Open the portal at the matching probability.", "mixed");
const matchForms = scale("Match the probability to its place on the scale.", "mixed");
const percentScale = scale("Calibrate the percentage portal.", "percent");
const decimalScale = scale("Calibrate the decimal portal.", "decimal");
const estimateEvent = estimate("Estimate the chance and open the closest portal.");

const calculate = forge("Forge the tool so winning outcomes match the target.", "Build the shown probability");
const completeWhole = complement("Complete the other side so both probabilities total one whole.");
const buildSpinner = forge("Build a spinner with the target probability.", "Spinner target");
const buildBag = forge("Load the bag with the target probability.", "Bag target");
const buildDie = forge("Mark the faces to create the target probability.", "Die target");

const predictFrequency = simulation("Predict the count, then launch the experiment.", "predict");
const compareFrequency = simulation("Run two trial sizes and compare the evidence.", "compare");
const explainVariation = simulation("Test whether different results can still fit the same model.", "compare");
const trialLadder = simulation("Climb the trial ladder and track the relative frequency.", "convergence", [10, 50, 200]);
const convergence = simulation("Chase the expected probability through three trial stages.", "convergence", [20, 100, 500]);
const variationStorm = simulation("Run through the variation storm and choose the careful conclusion.", "convergence", [10, 50, 300]);

const chooseSimulator = debuggerTask("Choose the simulator that matches the event.", "choose");
const debugMachine = debuggerTask("Find the fault in Chanzia's simulation machine.", "debug");
const auditMachine = debuggerTask("Audit the machine before it launches.", "audit");

const planInvestigation = debuggerTask("Lock in a fair investigation plan.", "debug");
const runInvestigation = simulation("Run the full investigation and track its evidence.", "convergence", [20, 100, 500]);

const LESSONS: Record<string, LessonSpec> = {
  "1-1": { teaching: placeScale, activities: [placeScale, percentScale, decimalScale] },
  "1-2": { teaching: matchForms, activities: [matchForms, percentScale, decimalScale] },
  "1-3": { teaching: estimateEvent, activities: [estimateEvent, placeScale, percentScale] },
  "2-1": { teaching: calculate, activities: [calculate, buildBag, buildDie] },
  "2-2": { teaching: completeWhole, activities: [completeWhole, calculate, buildSpinner] },
  "2-3": { teaching: buildSpinner, activities: [buildSpinner, buildBag, buildDie] },
  "3-1": { teaching: predictFrequency, activities: [predictFrequency, calculate, buildBag] },
  "3-2": { teaching: compareFrequency, activities: [compareFrequency, predictFrequency, explainVariation] },
  "3-3": { teaching: explainVariation, activities: [explainVariation, compareFrequency, auditMachine] },
  "4-1": { teaching: trialLadder, activities: [trialLadder, convergence, compareFrequency] },
  "4-2": { teaching: convergence, activities: [convergence, trialLadder, variationStorm] },
  "4-3": { teaching: variationStorm, activities: [variationStorm, convergence, explainVariation] },
  "5-1": { teaching: chooseSimulator, activities: [chooseSimulator, buildSpinner, buildBag] },
  "5-2": { teaching: debugMachine, activities: [debugMachine, chooseSimulator, auditMachine] },
  "5-3": { teaching: auditMachine, activities: [auditMachine, debugMachine, completeWhole] },
  "6-1": { teaching: planInvestigation, activities: [planInvestigation, chooseSimulator, predictFrequency] },
  "6-2": { teaching: runInvestigation, activities: [runInvestigation, trialLadder, auditMachine] },
  "6-3": { teaching: masterTrial, activities: [masterTrial, masterTrial, masterTrial] },
};

export function getChanceHollowLevel6TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const match = /y6-chance-w(\d+)-l(\d+)/.exec(lessonId);
  if (!match) return null;
  const spec = LESSONS[`${Number(match[1])}-${Number(match[2])}`];
  if (!spec) return null;
  return { teaching: () => spec.teaching(), activities: spec.activities };
}
