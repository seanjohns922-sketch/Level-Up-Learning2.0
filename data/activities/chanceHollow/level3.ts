import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

type Gen = (round: number, target: number) => PracticeTask;
type McqTask = Extract<PracticeTask, { kind: "mcq" }>;

const pick = <T,>(items: readonly T[], index: number) => items[((index % items.length) + items.length) % items.length]!;
const rotate = <T,>(items: readonly T[], amount: number) => {
  const offset = ((amount % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
};

const CHANCE_WORDS = [
  { event: "The sun will rise tomorrow.", answer: "Certain", reason: "It must happen in normal everyday life." },
  { event: "A fish will ride a bicycle to school.", answer: "Impossible", reason: "That cannot happen." },
  { event: "It will rain sometime this year.", answer: "Likely", reason: "Rain usually happens during a year." },
  { event: "You will roll a 6 on one die roll.", answer: "Unlikely", reason: "Only one of six outcomes is a 6." },
  { event: "A tossed coin will land heads.", answer: "Possible", reason: "Heads can happen, but tails can happen too." },
  { event: "You will draw a red counter from a bag with only blue counters.", answer: "Impossible", reason: "There are no red counters to draw." },
];

const OUTCOME_SETS = [
  { tool: "coin", outcomes: ["heads", "tails"], question: "Which list shows all possible outcomes for tossing one coin?", answer: "heads or tails" },
  { tool: "six-sided die", outcomes: ["1", "2", "3", "4", "5", "6"], question: "Which list shows all possible outcomes for rolling one die?", answer: "1, 2, 3, 4, 5 or 6" },
  { tool: "red-blue spinner", outcomes: ["red", "blue"], question: "Which list shows all possible outcomes for this spinner?", answer: "red or blue" },
  { tool: "bag with red, blue and yellow counters", outcomes: ["red", "blue", "yellow"], question: "Which list shows all possible outcomes for one draw?", answer: "red, blue or yellow" },
];

const TRIALS = [
  { experiment: "Toss a coin 10 times", result: "Heads: 6, Tails: 4", answer: "heads", prompt: "Which outcome happened more often?" },
  { experiment: "Roll a die 12 times", result: "1: 1, 2: 4, 3: 2, 4: 1, 5: 3, 6: 1", answer: "2", prompt: "Which outcome happened most often?" },
  { experiment: "Spin a 4-colour spinner 16 times", result: "Red: 5, Blue: 2, Green: 5, Yellow: 4", answer: "red and green", prompt: "Which outcomes tied for most often?" },
  { experiment: "Draw and replace a counter 10 times", result: "Red: 3, Blue: 7", answer: "blue", prompt: "Which outcome happened more often?" },
];

function mcq(prompt: string, answer: string, options: readonly string[], feedback?: McqTask["feedback"]): PracticeTask {
  return {
    kind: "mcq",
    prompt,
    options: [...options],
    answer,
    feedback: feedback ?? {
      correct: "Correct. You used the chance evidence.",
      wrong: "Check the possible outcomes and the chance words again.",
    },
  };
}

const chanceWordTask: Gen = (round) => {
  const item = pick(CHANCE_WORDS, round);
  return mcq(
    `Chance Hollow card: ${item.event} Which chance word fits best?`,
    item.answer,
    rotate(["Certain", "Impossible", "Likely", "Unlikely", "Possible"], round),
    {
      correct: `Yes. ${item.reason}`,
      wrong: "Choose the word that matches whether the event must happen, cannot happen, or may happen.",
    },
  );
};

const likelyCompareTask: Gen = (round) => {
  const cases = [
    { prompt: "Which event is more likely?", answer: "Rolling a number less than 5", options: ["Rolling a number less than 5", "Rolling a 6", "Rolling a 7"] },
    { prompt: "Which event is impossible?", answer: "Drawing green from a bag with only red and blue counters", options: ["Drawing red", "Drawing blue", "Drawing green from a bag with only red and blue counters"] },
    { prompt: "Which event is certain?", answer: "Drawing a counter from a bag that has counters in it", options: ["Drawing a counter from a bag that has counters in it", "Drawing a purple counter", "Drawing the same colour every time"] },
    { prompt: "Which event is unlikely?", answer: "Rolling a 1 on one die roll", options: ["Rolling a 1 on one die roll", "Rolling a number from 1 to 6", "The die landing on a number"] },
  ];
  const item = pick(cases, round);
  return mcq(`Chance Hollow comparison: ${item.prompt}`, item.answer, rotate(item.options, round));
};

const outcomeListTask: Gen = (round) => {
  const item = pick(OUTCOME_SETS, round);
  return mcq(
    `${item.question} Tool: ${item.tool}.`,
    item.answer,
    rotate([item.answer, item.outcomes[0]!, "certain or impossible"], round),
    {
      correct: "Correct. You listed every possible outcome.",
      wrong: "All possible outcomes means every result that could happen in one go.",
    },
  );
};

const predictionTask: Gen = (round) => {
  const cases = [
    { prompt: "A spinner has 3 red sections and 1 blue section. What is the better prediction?", answer: "Red is more likely than blue", options: ["Red is more likely than blue", "Blue is certain", "Red is impossible"] },
    { prompt: "A bag has 5 yellow counters and 5 black counters. What is the better prediction?", answer: "Yellow and black are equally possible", options: ["Yellow and black are equally possible", "Yellow is certain", "Black is impossible"] },
    { prompt: "A die has the numbers 1 to 6. What can happen next?", answer: "Any number from 1 to 6 could be rolled", options: ["Any number from 1 to 6 could be rolled", "A 9 is likely", "Only 6 can be rolled"] },
    { prompt: "A box has 10 names. One name is drawn, replaced, then drawn again. What can happen?", answer: "The same name could be drawn more than once", options: ["The same name could be drawn more than once", "Every name must be drawn once", "No name can repeat"] },
  ];
  const item = pick(cases, round);
  return mcq(`Make a prediction: ${item.prompt}`, item.answer, rotate(item.options, round));
};

const tallyReadTask: Gen = (round) => {
  const item = pick(TRIALS, round);
  return mcq(
    `${item.experiment}. Results: ${item.result}. ${item.prompt}`,
    item.answer,
    rotate([item.answer, "all outcomes were equal", "impossible to tell"], round),
    {
      correct: "Correct. You read the tally results.",
      wrong: "Compare the recorded counts in the result line.",
    },
  );
};

const variationTask: Gen = (round) => {
  const cases = [
    { prompt: "Two groups toss a coin 10 times. Group A gets 4 heads. Group B gets 7 heads. What does this show?", answer: "Results can vary between repeated trials", options: ["Results can vary between repeated trials", "One group did it wrong", "Coins never land tails"] },
    { prompt: "A spinner has equal red and blue sections, but red appears 6 times and blue 4 times. What is true?", answer: "Chance results do not always split exactly evenly", options: ["Chance results do not always split exactly evenly", "Blue is impossible", "Red is certain"] },
    { prompt: "The class repeats the same die experiment and gets different totals. What should we discuss?", answer: "How the results varied across trials", options: ["How the results varied across trials", "Why dice have no outcomes", "Why the experiment was certain"] },
    { prompt: "You predicted blue, but red happened. What is the best reflection?", answer: "A prediction can be reasonable even if another possible outcome happens", options: ["A prediction can be reasonable even if another possible outcome happens", "The prediction made red impossible", "Only wrong predictions have outcomes"] },
  ];
  const item = pick(cases, round);
  return mcq(`Variation vault: ${item.prompt}`, item.answer, rotate(item.options, round));
};

const WEEK_TASKS: Record<number, readonly [Gen, Gen, Gen]> = {
  1: [chanceWordTask, likelyCompareTask, chanceWordTask],
  2: [likelyCompareTask, chanceWordTask, predictionTask],
  3: [outcomeListTask, predictionTask, outcomeListTask],
  4: [predictionTask, outcomeListTask, tallyReadTask],
  5: [tallyReadTask, outcomeListTask, variationTask],
  6: [variationTask, tallyReadTask, predictionTask],
};

export function getChanceHollowLevel3TaskSet(lessonId: string): RealmLessonTaskSet | null {
  const match = /y3-chance-w(\d+)-l(\d+)/.exec(lessonId);
  if (!match) return null;
  const week = Number(match[1]);
  const lesson = Number(match[2]);
  const tasks = WEEK_TASKS[week];
  if (!tasks || lesson < 1 || lesson > 3) return null;
  const seed = (week - 1) * 6 + lesson;
  return {
    teaching: (ctx) => tasks[0]((ctx?.elapsedSeconds ?? 0) + seed, 0),
    activities: [
      (ctx) => tasks[(lesson - 1) % tasks.length]!((ctx?.elapsedSeconds ?? 0) + seed + 1, 0),
      (ctx) => tasks[lesson % tasks.length]!((ctx?.elapsedSeconds ?? 0) + seed + 2, 0),
      (ctx) => tasks[(lesson + 1) % tasks.length]!((ctx?.elapsedSeconds ?? 0) + seed + 3, 0),
    ],
  };
}
