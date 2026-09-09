import type { ChanceVisual, PracticeTask } from "@/data/activities/year1/practice-task";
import { assertWeeklyQuizQuestionCount } from "@/lib/weekly-quiz-contract";

type ChanceLevel = 3 | 4 | 5 | 6;
type QuizTask = Extract<PracticeTask, { kind: "chanceQuizQuestion" }>;

const RED = "#e5484d";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const YELLOW = "#eab308";
const PURPLE = "#a855f7";
const COLOURS = [RED, BLUE, GREEN, YELLOW, PURPLE] as const;

function rotate<T>(items: readonly T[], amount: number) {
  const offset = amount % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function question(input: {
  prompt: string;
  answer: string;
  options: readonly string[];
  correct: string;
  wrong: string;
  visual?: ChanceVisual;
}, variant: number, withLocation = true): QuizTask {
  const locations = ["Moon Gate", "Crystal Bridge", "Fortune Wheel", "Dice Grove", "Shadow Vault"];
  const prompt = withLocation
    ? `At the ${locations[variant]}, ${input.prompt.charAt(0).toLowerCase()}${input.prompt.slice(1)}`
    : input.prompt;
  const options = [...new Set(input.options)];
  for (const fallback of ["There is not enough information", "The result is certain", "The tool cannot be used"]) {
    if (options.length >= 4) break;
    if (!options.includes(fallback)) options.push(fallback);
  }
  return {
    kind: "chanceQuizQuestion",
    prompt,
    speakText: `${prompt} Options: ${options.join(", ")}.`,
    options: rotate(options, variant),
    answer: input.answer,
    visual: input.visual,
    feedback: { correct: input.correct, wrong: input.wrong },
  };
}

function countVisual(target: number, total: number): ChanceVisual {
  return { type: "spinner", wedges: [...Array(target).fill(PURPLE), ...Array(total - target).fill(BLUE)] };
}

function level3(week: number, lesson: number, variant: number): QuizTask {
  const n = variant + 1;
  if (week === 1) {
    if (lesson === 1) {
      const certain = variant % 2 === 0;
      const prompt = certain ? `A normal die is rolled. Will the result be less than ${7 + variant}?` : `A normal die is rolled. Will the result be ${7 + variant}?`;
      const answer = certain ? "Certain" : "Impossible";
      return question({ prompt, answer, options: ["Certain", "Likely", "Unlikely", "Impossible"], correct: `A die only shows 1 to 6, so this event is ${answer.toLowerCase()}.`, wrong: "Check every face from 1 to 6 before choosing the chance word.", visual: { type: "die", face: n } }, variant);
    }
    const target = lesson === 2 ? n + 3 : n;
    const total = 8;
    const answer = target > 4 ? "Likely" : "Unlikely";
    return question({ prompt: `${target} of 8 equal spinner parts are purple. Which word fits landing on purple${lesson === 3 ? ", and why" : ""}?`, answer, options: ["Likely", "Unlikely", "Certain", "Impossible"], correct: `${target} of 8 is ${target > 4 ? "more" : "less"} than half, so purple is ${answer.toLowerCase()}.`, wrong: "Compare the purple parts with half of all eight parts.", visual: countVisual(target, total) }, variant);
  }
  if (week === 2) {
    const events = [
      ["The sun rises tomorrow", "Certain"],
      ["A student rolls a 6 on one die", "Unlikely"],
      ["A shuffled card is red", "Possible"],
      ["It rains during the next school week", "Possible"],
      ["A coin lands heads", "Possible"],
    ] as const;
    const [event, baseAnswer] = events[variant]!;
    const answer = lesson === 1 ? baseAnswer : lesson === 2 ? (baseAnswer === "Certain" ? "Certain group" : "Could happen group") : `${baseAnswer}, because the event ${baseAnswer === "Certain" ? "must happen" : "can happen but is not guaranteed"}`;
    const options = lesson === 1 ? ["Certain", "Possible", "Impossible", "Unlikely"] : lesson === 2 ? ["Certain group", "Could happen group", "Impossible group", "No chance group"] : [answer, "Certain, because I want it", "Impossible, because it may not happen", "Likely, because every event is likely"];
    return question({ prompt: `${lesson === 2 ? "Where should this event be sorted" : lesson === 3 ? "Which classification includes a valid reason" : "Which chance word best describes this event"}: ${event}?`, answer, options, correct: `The event is ${baseAnswer.toLowerCase()}; the reason must describe what can actually happen.`, wrong: "Use real-world evidence, not what you hope will happen." }, variant);
  }
  if (week === 3) {
    const tool = variant % 2 === 0 ? "coin" : "die";
    const outcomes = tool === "coin" ? "heads and tails" : "1, 2, 3, 4, 5 and 6";
    const visual: ChanceVisual = tool === "coin" ? { type: "coin", face: "heads" } : { type: "die", face: n };
    const answer = lesson === 1 ? outcomes : lesson === 2 ? `All outcomes: ${outcomes}` : tool === "coin" ? "A number is not a possible coin outcome" : "A 7 is not a possible die outcome";
    const options = lesson < 3 ? [answer, "Only the result shown", "Any number at all", "There are no possible outcomes"] : [answer, "Every listed result is possible", "Only the shown result can occur", "The tool has infinitely many outcomes"];
    return question({ prompt: lesson === 1 ? `What could happen when this ${tool} is used?` : lesson === 2 ? `Which list includes every possible ${tool} outcome?` : `Which statement correctly matches the event to its outcomes?`, answer, options, correct: `A normal ${tool} has the complete outcome set: ${outcomes}.`, wrong: `List every face of the ${tool}, once each.`, visual }, variant);
  }
  if (week === 4) {
    const purple = 4 + (variant % 2);
    const total = 6;
    const observedPurple = [4, 2, 5, 3, 4][variant]!;
    const answer = lesson === 1 ? "Predict purple because it has the most equal parts" : lesson === 2 ? `The prediction was ${observedPurple >= 4 ? "supported" : "not supported"} by this trial` : "A prediction can miss even when it is sensible";
    const options = lesson === 1 ? [answer, "Predict blue because it has fewer parts", "Purple is certain", "No prediction can be made"] : lesson === 2 ? [answer, "The result proves every future spin", "The spinner must be broken", "The prediction was certain"] : [answer, "A sensible prediction must always happen", "One result proves the spinner is unfair", "Predictions are the same as guesses without evidence"];
    return question({ prompt: lesson === 1 ? "What is the best prediction before spinning?" : lesson === 2 ? `Purple appeared ${observedPurple} times in 6 spins. What does the test show?` : "The most likely colour did not appear on one spin. What should you conclude?", answer, options, correct: "Predictions use the tool design, while trial results can still vary.", wrong: "Separate a sensible prediction from a guaranteed result.", visual: countVisual(purple, total) }, variant);
  }
  if (week === 5) {
    const heads = 4 + variant;
    const tails = 10 - heads;
    const answer = lesson === 1 ? "Repeat the same toss and record every result" : lesson === 2 ? `${heads} heads and ${tails} tails` : heads > tails ? "Heads occurred more often in this trial" : heads < tails ? "Tails occurred more often in this trial" : "Both outcomes occurred equally often";
    const options = lesson === 1 ? [answer, "Record only heads", "Change coins after each toss", "Stop when your prediction wins"] : lesson === 2 ? [answer, `${tails} heads and ${heads} tails`, "10 heads and 10 tails", "The tallies cannot be read"] : [answer, "The coin is definitely unfair", "The next toss is now certain", "Both outcomes must always match"];
    return question({ prompt: lesson === 1 ? "Which plan makes a fair repeated coin experiment?" : lesson === 2 ? `A tally shows ${heads} heads and ${tails} tails. Which record is correct?` : `Compare ${heads} heads with ${tails} tails. What happened in this trial?`, answer, options, correct: "A repeated experiment records every trial and compares the observed counts.", wrong: "Read the two frequencies without claiming that one short run proves the coin is unfair.", visual: { type: "frequency", labels: ["Heads", "Tails"], counts: [heads, tails], total: 10 } }, variant);
  }
  const first = 4 + variant;
  const second = 9 - variant;
  const answer = lesson === 1 ? "The same fair experiment can produce different results" : lesson === 2 ? `Trial A had ${first} heads; Trial B had ${second} heads` : "Short-run variation is expected in chance experiments";
  const options = [answer, "One trial must be erased", "Both trials must always match", "Different results prove the coin is broken"];
  return question({ prompt: lesson === 1 ? `Two fair-coin trials produced ${first} and ${second} heads. What does this show?` : lesson === 2 ? "Which comparison reports both class results accurately?" : "Why can two groups using the same fair coin get different totals?", answer, options, correct: "Chance causes natural variation between repeated short trials.", wrong: "Fair tools do not guarantee identical short-run totals.", visual: { type: "frequency", labels: ["Trial A heads", "Trial B heads"], counts: [first, second], total: 10 } }, variant);
}

function level4(week: number, lesson: number, variant: number): QuizTask {
  const total = 6 + (variant % 3) * 2;
  const half = total / 2;
  if (week === 1) {
    const equal = lesson !== 1 || variant % 2 === 0;
    const target = equal ? half : half + 1;
    const answer = lesson === 1 ? (equal ? "Fair" : "Not fair") : lesson === 2 ? (equal ? "Red and blue are equally likely" : "Red is more likely") : (equal ? "Equal numbers of equal parts give equal chances" : "Different numbers of equal parts give different chances");
    return question({ prompt: lesson === 1 ? "Is this two-colour spinner fair?" : lesson === 2 ? "Which statement compares the outcomes?" : "Which explanation matches this spinner?", answer, options: [answer, "Every spinner is fair", "The pointer chooses its favourite", "Colour names decide the chance"], correct: `${target} of ${total} parts are red, so compare that count with ${total - target} blue parts.`, wrong: "Count the equal parts for each outcome.", visual: countVisual(target, total) }, variant);
  }
  if (week === 2) {
    const colours = 2 + (variant % 3);
    const wedges = COLOURS.slice(0, colours);
    const answer = lesson === 1 ? wedges.map((_, i) => ["Red", "Blue", "Green", "Yellow"][i]).join(", ") : lesson === 2 ? `${colours} possible colour outcomes` : `${1}/${colours}`;
    return question({ prompt: lesson === 1 ? "Which list names the visible outcomes?" : lesson === 2 ? "How many possible colour outcomes are shown?" : "Which chance matches one named colour when all colours have one equal part?", answer, options: [answer, `${colours + 1} outcomes`, "Only one outcome", "The outcomes cannot be counted"], correct: `There are ${colours} visible, equally sized colour outcomes.`, wrong: "Count distinct visible colours, not the number of spins.", visual: { type: "spinner", wedges: [...wedges] } }, variant);
  }
  if (week === 3) {
    const replace = variant % 2 === 0;
    const answer = lesson === 1 ? (replace ? "The next chances stay the same" : "The next chances change") : lesson === 2 ? (replace ? "Independent" : "Dependent") : (replace ? "Red remains 3/5" : "Red becomes 2/4 after a red counter is kept out");
    return question({ prompt: `${replace ? "A red counter is replaced" : "A red counter is kept out"} after the first draw. ${lesson === 1 ? "Does the next chance change?" : lesson === 2 ? "Are the two draws independent or dependent?" : "What is the next chance of red?"}`, answer, options: [answer, replace ? "The next chances change" : "The next chances stay the same", "The next draw is certain", "There are no counters left"], correct: replace ? "Replacing restores the original bag, so the next probabilities stay the same." : "Keeping a counter changes the bag, so the next draw depends on the first.", wrong: "Check whether the bag has the same contents before the next draw.", visual: { type: "bag", counters: [RED, RED, RED, BLUE, BLUE] } }, variant);
  }
  if (week === 4) {
    const red = lesson === 2 ? half : half + (variant % 2);
    const fair = red === half;
    const answer = lesson === 1 ? (fair ? "The game is fair" : "The game is not fair") : lesson === 2 ? `Use ${half} red and ${half} blue parts` : "Give both players the same number of equal parts";
    return question({ prompt: lesson === 1 ? "Player Red wins on red and Chanzia wins on blue. Is the game fair?" : lesson === 2 ? "Which repair gives both players an equal chance?" : "Which design rule creates a fair two-player game?", answer, options: [answer, "Give one player more parts", "Let one player spin twice", "Hide the outcome counts"], correct: "A fair game gives both players the same number of equally likely winning outcomes.", wrong: "Compare each player's winning outcomes before playing.", visual: countVisual(red, total) }, variant);
  }
  if (week === 5) {
    const a = 2 + variant;
    const b = 8 - a;
    const answer = lesson === 1 ? (a > b ? "Purple has more chance" : "Blue has more chance") : lesson === 2 ? (a === b ? "They have the same chance" : "They do not have the same chance") : (a > b ? "Predict purple" : "Predict blue");
    return question({ prompt: lesson === 1 ? "Which colour has more chance?" : lesson === 2 ? "Do the two colours have the same chance?" : "Which colour is the best prediction?", answer, options: [answer, a > b ? "Blue has more chance" : "Purple has more chance", "Both are certain", "Neither can occur"], correct: `Compare ${a} purple parts with ${b} blue parts.`, wrong: "The colour with more equal parts has more chance.", visual: countVisual(a, 8) }, variant);
  }
  const expected = 10;
  const observed = 7 + variant;
  const answer = lesson === 1 ? "Predict about 10 purple results" : lesson === 2 ? `${observed} purple results were recorded` : `The observed ${observed} is ${observed === expected ? "the same as" : "different from"} the expected ${expected}`;
  return question({ prompt: lesson === 1 ? "A half-purple spinner is used 20 times. What is a sensible prediction?" : lesson === 2 ? "What frequency did the repeated trial record?" : "Which comparison of expected and actual results is correct?", answer, options: [answer, "Purple must occur 20 times", "The next spin is guaranteed", "A fair tool cannot vary"], correct: "Expected and observed frequencies can be compared without expecting an exact match every time.", wrong: "Use half of 20 as the expectation, then compare it with the recorded result.", visual: { type: "expectedObserved", expected, observed, total: 20, eventLabel: "Purple" } }, variant);
}

function level5(week: number, lesson: number, variant: number): QuizTask {
  const total = 6 + variant;
  const target = 1 + (variant % Math.max(2, total - 2));
  if (week === 1) {
    const exact = lesson === 1 && variant % 2 === 0;
    const answer = lesson === 1 ? (exact ? `${total} exact-counter outcomes` : "2 colour outcomes") : lesson === 2 ? "Red, blue and green" : "Exact counters are equally likely; colours may not be";
    const counters = lesson === 1
      ? Array.from({ length: total }, (_, i) => i < target ? RED : BLUE)
      : Array.from({ length: total }, (_, i) => i < target ? RED : i < total - 1 ? BLUE : GREEN);
    const prompt = lesson === 1
      ? exact
        ? `Each of the ${total} counters is recorded separately. How many outcomes are possible?`
        : `Only the colour is recorded from this two-colour bag. How many outcomes are possible?`
      : lesson === 2
        ? "Which list gives every colour outcome once?"
        : "Are the exact counters and the three colours both equally likely?";
    return question({ prompt, answer, options: [answer, "Only the outcome drawn first", "Every colour is automatically equal", "The outcome set has no effect"], correct: "Define what is recorded, list each outcome once, then compare the elementary outcomes.", wrong: "Separate individual counters from grouped colour outcomes.", visual: { type: "bag", counters } }, variant, false);
  }
  if (week === 2) {
    const equal = lesson === 1;
    const regionTotal = 4 + variant * 2;
    const purple = regionTotal / 2 + (equal ? 0 : 1);
    const answer = lesson === 1 ? "Equal regions give equal chances" : lesson === 2 ? "Purple is more likely because it has more equal regions" : "The spinner is biased toward purple";
    return question({ prompt: lesson === 1 ? "Why are the colour outcomes equally likely?" : lesson === 2 ? "How do unequal region counts change the chance?" : "What hidden bias does the design create?", answer, options: [answer, "Colour brightness controls probability", "All visible outcomes are always equal", "The pointer avoids large regions"], correct: "Probability follows the share of equal regions assigned to each outcome.", wrong: "Count equal regions for each colour.", visual: countVisual(purple, regionTotal) }, variant, false);
  }
  if (week === 3) {
    const difference = variant;
    const ways = difference === 0 ? 6 : 2 * (6 - difference);
    const other = difference === 0 ? 5 : difference - 1;
    const otherWays = other === 0 ? 6 : 2 * (6 - other);
    const repairs = [
      "Racer A: difference 0; Racer B: difference 3",
      "Racer A: differences 0 or 5; Racer B: difference 2",
      "Racer A: differences 4 or 5; Racer B: difference 3",
      "Racer A: difference 2; Racer B: differences 0 or 5",
      "Racer A: difference 3; Racer B: differences 4 or 5",
    ];
    const answer = lesson === 1 ? "36 ordered pairs" : lesson === 2 ? `Difference ${difference} has ${ways} ordered pairs` : repairs[variant]!;
    const prompt = lesson === 1
      ? "How many ordered outcomes are possible when two dice are rolled?"
      : lesson === 2
        ? `How many ordered pairs have a difference of ${difference}?`
        : `The current rules give the racers ${ways} and ${otherWays} winning pairs. Which replacement is fair?`;
    return question({ prompt, answer, options: [answer, "Keep the current rules", "Give one racer an extra roll", "Let the dice colours decide"], correct: "Count all ordered pairs. A fair repair gives both racers the same number.", wrong: "Compare ordered pairs, not just difference labels.", visual: { type: "diceGrid", mode: "difference", highlight: difference } }, variant, false);
  }
  if (week === 4) {
    const observed = 5 + variant;
    const trials = 20;
    const answer = lesson === 1 ? `${observed} target results in ${trials} trials` : lesson === 2 ? `${observed}/${trials}` : `Run A: ${observed}/${trials}; Run B: ${observed + 2}/${trials}`;
    const visual: ChanceVisual = lesson === 3
      ? { type: "frequency", labels: ["Run A", "Run B"], counts: [observed, observed + 2], total: trials, totalLabel: `${trials} trials per run` }
      : { type: "frequency", labels: ["Target", "Other"], counts: [observed, trials - observed], total: trials };
    return question({ prompt: lesson === 1 ? "Which statement records the experiment completely?" : lesson === 2 ? "Write the target outcome's relative frequency." : "Which comparison preserves both run sizes?", answer, options: [answer, `${trials}/${observed}`, `${observed}/${trials - observed}`, "The next outcome is certain"], correct: "Relative frequency is the target count over all completed trials.", wrong: "Put the target count over the total number of trials.", visual }, variant, false);
  }
  if (week === 5) {
    const expected = 8;
    const observed = 5 + 2 * variant;
    const answer = lesson === 1 ? "The design suggests about 8 target results" : lesson === 2 ? `${observed}/${20} estimates the target likelihood` : Math.abs(observed - expected) >= 5 ? "The result is unusual; repeat more trials before deciding it is loaded" : "The result is reasonably close; there is not strong evidence of loading";
    return question({ prompt: lesson === 1 ? "What frequency should the chance-tool design predict?" : lesson === 2 ? "Which estimate uses the recorded results?" : "What is the most careful verdict about fairness?", answer, options: [answer, "One run proves the tool is loaded", "Observed frequency guarantees the next result", "Ignore the design and trial count"], correct: "Compare design probability with observed frequency and use cautious evidence language.", wrong: "One run provides evidence, not absolute proof.", visual: { type: "expectedObserved", expected, observed, total: 20, eventLabel: "Target" } }, variant, false);
  }
  const trials = 30 + variant * 10;
  const expected = Math.round(trials / 3);
  const observed = expected + variant - 2;
  const answer = lesson === 1 ? "Keep the tool and method the same and record every trial" : lesson === 2 ? `${observed}/${trials} was observed` : "The evidence is close to one third, with normal chance variation";
  return question({ prompt: lesson === 1 ? "Which plan makes the investigation repeatable and fair?" : lesson === 2 ? "Which relative frequency records the investigation?" : "Which verdict is supported by expected and observed evidence?", answer, options: [answer, "Change the method halfway", "Remove surprising outcomes", "Claim the next result is certain"], correct: "A strong investigation uses one method, complete records and an evidence-based conclusion.", wrong: "Connect the design, trial count and observed frequency.", visual: { type: "expectedObserved", expected, observed, total: trials, eventLabel: "Winning outcome" } }, variant, false);
}

function level6(week: number, lesson: number, variant: number): QuizTask {
  const fractions = [[1, 4], [1, 2], [3, 4], [1, 5], [3, 5]] as const;
  const [winning, total] = fractions[variant]!;
  const decimal = winning / total;
  const percent = decimal * 100;
  if (week === 1) {
    const answer = lesson === 1 ? `${decimal}` : lesson === 2 ? `${winning}/${total} = ${decimal} = ${percent}%` : percent < 50 ? "Unlikely" : percent === 50 ? "Even chance" : "Likely";
    const highlight = percent < 50 ? "unlikely" : percent === 50 ? "even" : "likely";
    return question({ prompt: lesson === 1 ? `Where does ${winning}/${total} sit on a 0 to 1 probability scale?` : lesson === 2 ? "Which three forms name the same probability?" : `Which chance description best matches ${percent}%?`, answer, options: [answer, `${total}/${winning}`, `${100 - percent}%`, percent === 50 ? "Certain" : "Impossible"], correct: "Fractions, decimals and percentages can name the same point from impossible to certain.", wrong: "Divide the fraction, then multiply the decimal by 100 for percent.", visual: { type: "scale", highlight, value: decimal } }, variant, false);
  }
  if (week === 2) {
    const answer = lesson === 1 ? `${winning}/${total}` : lesson === 2 ? `${total - winning} non-winning outcomes` : `${winning} winning parts out of ${total}`;
    return question({ prompt: lesson === 1 ? "Calculate the probability of the purple outcome." : lesson === 2 ? `${winning} of ${total} outcomes win. How many do not win?` : `Which tool design has probability ${winning}/${total}?`, answer, options: [answer, `${total}/${winning}`, `${winning}/${total - winning}`, `${total - winning}/${total}`], correct: "Probability compares favourable outcomes with all equally likely outcomes.", wrong: "Put winning outcomes over all outcomes.", visual: countVisual(winning, total) }, variant, false);
  }
  if (week === 3) {
    const trials = total * 20;
    const expected = winning * 20;
    const observed = expected + variant - 2;
    const answer = lesson === 1 ? `${expected} expected wins` : lesson === 2 ? `Expected ${expected}; observed ${observed}` : "Chance variation can make observed frequency differ from expected frequency";
    return question({ prompt: lesson === 1 ? `With probability ${winning}/${total} across ${trials} trials, what is the expected frequency?` : lesson === 2 ? "Which statement compares the two frequencies accurately?" : "Why are the expected and observed counts not identical?", answer, options: [answer, "Observed results must equal expected results", "The simulation is automatically invalid", "Expected frequency is the next guaranteed result"], correct: "Expected frequency is probability multiplied by trials; observed results may vary.", wrong: "Calculate the expectation, then allow for chance variation.", visual: { type: "expectedObserved", expected, observed, total: trials } }, variant, false);
  }
  if (week === 4) {
    const small = [0.2, 0.7, 0.3, 0.8, 0.4][variant]!;
    const large = [0.48, 0.53, 0.49, 0.51, 0.5][variant]!;
    const answer = lesson === 1 ? "Compare relative frequencies at each trial size" : lesson === 2 ? "The larger trial is closer to 0.5" : "Larger samples usually reduce relative variation but do not guarantee an exact result";
    return question({ prompt: lesson === 1 ? "How should the trial-size effect be investigated?" : lesson === 2 ? "Which run is closer to the expected probability of 0.5?" : "What conclusion is supported by both runs?", answer, options: [answer, "Ten trials always give the best estimate", "More trials guarantee exactly 0.5", "Ignore relative frequency"], correct: "Larger samples usually steady relative frequency near the expected probability.", wrong: "Compare proportions without claiming an exact result is guaranteed.", visual: { type: "convergence", expected: 0.5, samples: [{ trials: 10, value: small }, { trials: 200, value: large }] } }, variant, false);
  }
  if (week === 5) {
    const valid = `An equal ${total}-part spinner with ${winning} winning parts`;
    const answer = lesson === 1 ? valid : lesson === 2 ? "Restore every spinner part before the next trial" : "The outcomes, winning share and reset rule match the event";
    const prompt = lesson === 1
      ? `Which simulator models a ${winning}/${total} event?`
      : lesson === 2
        ? "Chanzia removes a winning part after each win. What fixes the simulation?"
        : "Which audit statement validates the simulation?";
    return question({ prompt, answer, options: [answer, "Keep removing winning parts", "Change the winning rule after each trial", "Choose whichever model wins most often"], correct: "A valid simulation keeps the same probabilities for every independent trial.", wrong: "Check the outcomes, winning share and reset rule.", visual: countVisual(winning, total) }, variant, false);
  }
  const trials = total * 25;
  const expected = winning * 25;
  const observed = expected + variant - 2;
  const answer = lesson === 1 ? "State the event, model, prediction, trial count and recording method" : lesson === 2 ? `Record ${observed} wins from ${trials} trials` : `The observed frequency ${observed}/${trials} is close to the expected probability ${winning}/${total}, allowing for variation`;
  return question({ prompt: lesson === 1 ? "Which plan could another student repeat?" : lesson === 2 ? "Which record keeps all the investigation evidence?" : "Which conclusion is supported by the investigation?", answer, options: [answer, "Report only successful trials", "Claim certainty from one run", "Ignore expected probability"], correct: "A strong investigation links its model, prediction, complete data and conclusion.", wrong: "Include the method and compare observed results with theoretical probability.", visual: { type: "expectedObserved", expected, observed, total: trials } }, variant, false);
}

function buildTask(level: ChanceLevel, week: number, lesson: number, variant: number) {
  if (level === 3) return level3(week, lesson, variant);
  if (level === 4) return level4(week, lesson, variant);
  if (level === 5) return level5(week, lesson, variant);
  return level6(week, lesson, variant);
}

export function getChanceHollowWeeklyQuizTasks(level: number, week: number): PracticeTask[] | null {
  if (!Number.isInteger(level) || level < 3 || level > 6 || !Number.isInteger(week) || week < 1 || week > 5) return null;
  const tasks = [1, 2, 3].flatMap((lesson) =>
    Array.from({ length: 5 }, (_, variant) => buildTask(level as ChanceLevel, week, lesson, variant)),
  );
  return assertWeeklyQuizQuestionCount(tasks, `Chance Hollow Level ${level} Week ${week}`);
}

export const CHANCE_HOLLOW_WEEKLY_QUIZ_FORMS = ([3, 4, 5, 6] as const).flatMap((level) =>
  [1, 2, 3, 4, 5].map((week) => ({ level, week, tasks: getChanceHollowWeeklyQuizTasks(level, week)! })),
);
