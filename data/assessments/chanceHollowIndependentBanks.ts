import type { ChanceVisual, PracticeTask } from "@/data/activities/year1/practice-task";
import type { Question } from "./posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "./assessmentItemStandard";
import {
  getChanceHollowAssessmentBlueprint,
  type ChanceHollowAssessmentKind,
  type ChanceHollowCognitiveDemand,
  type ChanceHollowDifficulty,
  type ChanceHollowLevel,
} from "./chanceHollowAssessmentBlueprint";

type AssessmentQuestion = Question & IndependentAssessmentItem;
type FormKey = `${ChanceHollowLevel}-${ChanceHollowAssessmentKind}`;

type ItemCore = {
  prompt: string;
  structure: string;
  review: string;
  answer?: string;
  options?: string[];
  visual?: ChanceVisual;
  task?: PracticeTask;
};

const CORRECT_TOKEN = "__chance_hollow_task_correct__";
const PINK = "#d946ef";
const BLUE = "#22d3ee";
const AMBER = "#fbbf24";
const GREEN = "#34d399";

function mcq(
  prompt: string,
  answer: string,
  distractors: string[],
  visual: ChanceVisual,
  structure: string,
  review: string,
): ItemCore {
  return { prompt, answer, options: [answer, ...distractors], visual, structure, review };
}

function interaction(task: PracticeTask, structure: string, review: string): ItemCore {
  const prompt = "prompt" in task && typeof task.prompt === "string"
    ? task.prompt
    : "Complete the Chance Hollow assessment activity.";
  return { prompt, task, structure, review };
}

function spinner(winning: number, total: number, win = PINK, lose = BLUE): ChanceVisual {
  return { type: "spinner", wedges: Array.from({ length: total }, (_, index) => index < winning ? win : lose) };
}

function bag(...groups: Array<[string, number]>): ChanceVisual {
  return { type: "bag", counters: groups.flatMap(([colour, count]) => Array(count).fill(colour)) };
}

function rotateOptions(options: string[], amount: number) {
  const shift = amount % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
}

function levelThree(form: ChanceHollowAssessmentKind, index: number): ItemCore {
  const post = form === "posttest";
  switch (index) {
    case 0:
      return mcq(
        post ? "A standard die is rolled. Which event is certain?" : "A coin is tossed. Which event is certain?",
        post ? "The result is a number from 1 to 6" : "The result is heads or tails",
        post ? ["The result is 6", "The result is even", "The result is greater than 6"] : ["The result is heads", "The result is tails", "The coin lands on 3"],
        post ? { type: "die", face: 4 } : { type: "coin" },
        "chance-word-certain",
        "Certain means the event must happen every time the stated tool is used.",
      );
    case 1:
      return mcq(
        post ? "Which event is impossible on this spinner?" : "Which event is impossible on a normal die?",
        post ? "Landing on green" : "Rolling an 8",
        post ? ["Landing on pink", "Landing on blue", "Landing on either shown colour"] : ["Rolling a 2", "Rolling an even number", "Rolling less than 6"],
        post ? spinner(3, 6) : { type: "die", face: 5 },
        "chance-word-impossible",
        "Impossible means the result is not included among the possible outcomes.",
      );
    case 2:
      return mcq(
        post ? "Five of these six counters are blue. Which word best describes drawing blue?" : "Seven of these eight sectors are pink. Which word best describes landing on pink?",
        "Likely",
        ["Impossible", "Unlikely", "Certain"],
        post ? bag([BLUE, 5], [PINK, 1]) : spinner(7, 8),
        "chance-word-likely",
        "Likely events have a strong chance but are not guaranteed.",
      );
    case 3:
      return mcq(
        post ? "One of these eight counters is amber. Which word best describes drawing amber?" : "One of these six sectors is blue. Which word best describes landing on blue?",
        "Unlikely",
        ["Certain", "Impossible", "Likely"],
        post ? bag([AMBER, 1], [PINK, 7]) : spinner(1, 6, BLUE, PINK),
        "chance-word-unlikely",
        "Unlikely events can happen, but have fewer chances than the other outcomes.",
      );
    case 4:
      return mcq(
        post ? "Which list contains every possible result of tossing this coin once?" : "What could happen when this coin is tossed once?",
        "Heads or tails",
        ["Heads only", "Tails only", "Heads, tails or six"],
        { type: "coin" },
        "complete-coin-outcomes",
        "A coin toss has two possible face outcomes: heads and tails.",
      );
    case 5:
      return mcq(
        post ? "Which list contains all possible even results on a normal die?" : "Which list contains every possible result on a normal die?",
        post ? "2, 4, 6" : "1, 2, 3, 4, 5, 6",
        post ? ["1, 3, 5", "2, 4", "2, 4, 6, 8"] : ["1, 2, 3", "0, 1, 2, 3, 4, 5", "2, 4, 6"],
        { type: "die", face: post ? 6 : 3 },
        "complete-die-outcomes",
        "List only outcomes shown by the tool and include every matching outcome once.",
      );
    case 6: {
      const task: PracticeTask = {
        kind: "chanceCompare",
        prompt: post ? "Which tool can produce exactly three different colour outcomes?" : "Which tool can produce both pink and blue?",
        tools: post
          ? [
              { label: "Spinner A", visual: spinner(2, 4) },
              { label: "Bag B", visual: bag([PINK, 2], [BLUE, 2], [AMBER, 2]) },
              { label: "Spinner C", visual: spinner(1, 5, GREEN, GREEN) },
            ]
          : [
              { label: "Bag A", visual: bag([PINK, 3], [BLUE, 2]) },
              { label: "Bag B", visual: bag([AMBER, 4]) },
            ],
        options: post ? ["Spinner A", "Bag B", "Spinner C"] : ["Bag A", "Bag B"],
        answer: post ? "Bag B" : "Bag A",
        feedback: { correct: "Response recorded.", wrong: "Response recorded." },
      };
      return interaction(task, "outcome-set-apparatus", "Inspect every distinct outcome shown by the tool.");
    }
    case 7:
      return mcq(
        post ? "A bag contains red, blue and green counters. Which result is possible?" : "A spinner has pink and blue sectors. Which result is possible?",
        post ? "Drawing green" : "Landing on blue",
        post ? ["Drawing orange", "Rolling a six", "Drawing a square"] : ["Landing on amber", "Rolling a four", "Drawing a card"],
        post ? bag([PINK, 2], [BLUE, 2], [GREEN, 1]) : spinner(2, 5),
        "possible-outcome-match",
        "A possible outcome must appear on the chance tool.",
      );
    case 8: {
      const task: PracticeTask = {
        kind: "chanceCompare",
        prompt: post ? "Which event is more likely?" : "Which event is less likely?",
        tools: [
          { label: "Pink", visual: post ? spinner(5, 6) : spinner(4, 6) },
          { label: "Blue", visual: post ? spinner(1, 6, BLUE, PINK) : spinner(2, 6, BLUE, PINK) },
        ],
        options: ["Pink", "Blue", "They have the same chance"],
        answer: post ? "Pink" : "Blue",
        feedback: { correct: "Response recorded.", wrong: "Response recorded." },
      };
      return interaction(task, "compare-likelihood-apparatus", "Compare how much of the spinner belongs to each event.");
    }
    case 9:
      return mcq(
        post ? "Before ten spins, which is the most sensible prediction?" : "Before six coin tosses, which is a sensible prediction?",
        post ? "Pink will probably appear more often, but blue can still occur" : "Heads and tails could both occur",
        post ? ["Pink must appear exactly eight times", "Blue cannot occur", "The results must alternate"] : ["Every toss will be heads", "Heads and tails must alternate", "The result will be a six"],
        post ? spinner(4, 5) : { type: "coin" },
        "sensible-prediction",
        "A prediction should use the tool's likelihood without claiming an exact result is guaranteed.",
      );
    case 10: {
      const task: PracticeTask = {
        kind: "chanceCompare",
        prompt: post ? "Which tool makes amber most likely?" : "Which tool gives pink the greatest chance?",
        tools: post
          ? [
              { label: "Tool A", visual: spinner(2, 6, AMBER, BLUE) },
              { label: "Tool B", visual: bag([AMBER, 5], [BLUE, 1]) },
            ]
          : [
              { label: "Tool A", visual: spinner(2, 6) },
              { label: "Tool B", visual: spinner(5, 6) },
            ],
        options: ["Tool A", "Tool B", "They are equal"],
        answer: "Tool B",
        feedback: { correct: "Response recorded.", wrong: "Response recorded." },
      };
      return interaction(task, "prediction-from-tool", "The event with more winning parts has the greater chance.");
    }
    case 11:
      return mcq(
        post ? "Pink occurred 9 times and blue 6 times. Which result occurred most often?" : "Heads occurred 7 times and tails 5 times. Which result occurred most often?",
        post ? "Pink" : "Heads",
        post ? ["Blue", "They were equal", "It cannot be known"] : ["Tails", "They were equal", "The next toss"],
        post ? { type: "frequency", labels: ["Pink", "Blue"], counts: [9, 6], total: 15 } : { type: "frequency", labels: ["Heads", "Tails"], counts: [7, 5], total: 12 },
        "read-experiment-frequency",
        "The outcome with the larger recorded frequency occurred most often in that trial.",
      );
    case 12:
      return mcq(
        post ? "Two trials gave pink counts of 8 and 11. What do the results show?" : "Two coin trials gave 6 heads and 9 heads. What do the results show?",
        "The same experiment can give different results",
        ["One trial must be wrong", "The next trial is certain", "Chance experiments always match"],
        post ? { type: "frequency", labels: ["Trial 1", "Trial 2"], counts: [8, 11], total: 20 } : { type: "frequency", labels: ["Trial 1", "Trial 2"], counts: [6, 9], total: 15 },
        "recognise-variation",
        "Chance variation means repeated trials do not need identical frequencies.",
      );
    case 13:
      return mcq(
        post ? "A prediction was 10 pink results, but the trial produced 8. Which statement is correct?" : "A prediction was 5 heads, but the trial produced 7. What should we conclude?",
        "The prediction and result differed, which can happen by chance",
        ["The experiment failed", "The tool is definitely unfair", "The result must be changed"],
        post ? { type: "expectedObserved", expected: 10, observed: 8, total: 16, eventLabel: "Pink" } : { type: "expectedObserved", expected: 5, observed: 7, total: 10, eventLabel: "Heads" },
        "prediction-versus-result",
        "A prediction is reasonable evidence to compare with results, not a guaranteed count.",
      );
    case 14:
      return mcq(
        post ? "Three groups repeat the same spinner trial and get different totals. Why?" : "Two students toss identical coins ten times and get different totals. Why?",
        "Chance results naturally vary from trial to trial",
        ["Only one student counted correctly", "The tool remembers earlier results", "All results should be identical"],
        post ? { type: "frequency", labels: ["A", "B", "C"], counts: [7, 10, 8], total: 12 } : { type: "frequency", labels: ["A", "B"], counts: [4, 7], total: 10 },
        "explain-variation",
        "Repeated chance experiments can produce different frequencies even when the method is unchanged.",
      );
    case 15:
      return mcq(
        post ? "Which statement compares these trial results accurately?" : "Which statement compares these two trials accurately?",
        post ? "Trial 2 had 3 more pink results than Trial 1" : "Trial 1 had 2 more heads than Trial 2",
        post ? ["Both trials matched", "Trial 1 had more pink", "Pink was impossible"] : ["Both trials matched", "Trial 2 had 2 more heads", "Heads was certain"],
        post ? { type: "frequency", labels: ["Trial 1", "Trial 2"], counts: [7, 10], total: 12 } : { type: "frequency", labels: ["Trial 1", "Trial 2"], counts: [8, 6], total: 10 },
        "compare-trial-results",
        "Compare recorded frequencies using the exact difference between the trials.",
      );
    case 16:
      return interaction({
        kind: "chanceAutoTally",
        prompt: post ? "Predict the most likely colour, run 16 spins, then check the tally." : "Run 12 spins and identify the outcome recorded most often.",
        tool: "spinner",
        draw: post ? ["pink", "pink", "pink", "blue"] : ["pink", "pink", "blue"],
        spins: post ? 16 : 12,
        labels: [{ key: "pink", name: "Pink", colour: PINK }, { key: "blue", name: "Blue", colour: BLUE }],
        mode: post ? "predictMost" : "most",
      }, "run-and-read-trial", "Run every trial and use the completed tally as evidence.");
    case 17:
      return interaction({
        kind: "chanceSpinTally",
        prompt: post ? "Spin eight times and record every result in the correct tally row." : "Toss the coin six times and record every result.",
        tool: post ? "spinner" : "coin",
        draw: post ? ["pink", "pink", "blue", "amber"] : ["heads", "tails"],
        spins: post ? 8 : 6,
        labels: post
          ? [{ key: "pink", name: "Pink", colour: PINK }, { key: "blue", name: "Blue", colour: BLUE }, { key: "amber", name: "Amber", colour: AMBER }]
          : [{ key: "heads", name: "Heads" }, { key: "tails", name: "Tails" }],
      }, "record-repeated-trial", "Record each observed result once in its matching tally row.");
    case 18:
      return interaction({
        kind: "chanceAutoTally",
        prompt: post ? "Run two identical 20-spin trials and compare their frequencies." : "Run two identical 12-toss trials and decide whether the totals match.",
        tool: post ? "spinner" : "coin",
        draw: post ? ["pink", "pink", "blue", "blue"] : ["heads", "tails"],
        spins: post ? 20 : 12,
        labels: post
          ? [{ key: "pink", name: "Pink", colour: PINK }, { key: "blue", name: "Blue", colour: BLUE }]
          : [{ key: "heads", name: "Heads" }, { key: "tails", name: "Tails" }],
        mode: "compareTrials",
      }, "compare-repeated-trials", "Identical chance methods can still produce different observed frequencies.");
    default:
      return mcq(
        post ? "A class repeats a fair coin trial. Which conclusion is best supported?" : "A spinner landed on blue only twice in one short trial. What is the safest conclusion?",
        post ? "Different groups may record different totals even with the same method" : "Blue was uncommon in this trial, but another trial may differ",
        post ? ["Every group must get equal totals", "The first group controls later results", "Any difference proves cheating"] : ["Blue is impossible", "The spinner is definitely broken", "Blue can never occur again"],
        post ? { type: "coin" } : spinner(2, 5, BLUE, PINK),
        "variation-transfer",
        "Conclusions from chance data should describe the evidence without claiming future certainty.",
      );
  }
}

function levelFour(form: ChanceHollowAssessmentKind, index: number): ItemCore {
  const post = form === "posttest";
  const base = post ? 1 : 0;
  switch (index) {
    case 0:
      return mcq(post ? "Why are the six numbers equally likely on a fair die?" : "Why are heads and tails equally likely on a fair coin?", post ? "Each number has one equal face" : "Each outcome has one equal face", post ? ["The die follows a pattern", "Six is heavier", "The first roll decides"] : ["The coin alternates", "Heads is lighter", "The first toss decides"], post ? { type: "die", face: 4 } : { type: "coin" }, "equal-coin-outcomes", "Equal outcome shares create equal chances.");
    case 1:
      return mcq(post ? "Which spinner gives pink and blue equal chances?" : "Are pink and blue equally likely on this spinner?", post ? "Spinner with 3 pink and 3 blue equal sectors" : "Yes, each colour has 2 equal sectors", post ? ["Spinner with 4 pink and 2 blue", "Spinner with 5 pink and 1 blue", "Any two-colour spinner"] : ["No, pink is brighter", "No, blue was drawn last", "It cannot be known"], spinner(post ? 3 : 2, post ? 6 : 4), "equal-spinner-outcomes", "Count equal-sized sectors for each event.");
    case 2:
      return mcq(post ? "Which colour has the greater chance of being drawn?" : "Are these two colours equally likely to be drawn?", post ? "Pink" : "No, pink has more counters", post ? ["Blue", "They are equal", "Neither"] : ["Yes, both colours are possible", "Yes, because the bag is closed", "No, blue has more counters"], bag([PINK, 5 + base], [BLUE, 2]), "unequal-bag-outcomes", "Possible outcomes are not equally likely when their counts differ.");
    case 3:
      return mcq(post ? "How many possible number outcomes are on a normal die?" : "How many colour outcomes are possible in this bag?", post ? "6" : "3", post ? ["1", "3", "12"] : ["2", "6", "8"], post ? { type: "die", face: 2 } : bag([PINK, 2], [BLUE, 3], [AMBER, 1]), "count-possible-outcomes", "Count each distinct outcome once.");
    case 4:
      return mcq(post ? "Which event is least likely?" : "Which event is most likely?", post ? "Amber" : "Pink", post ? ["Pink", "Blue", "All are equal"] : ["Blue", "Amber", "All are equal"], bag([PINK, 4], [BLUE, 2], [AMBER, 1]), "compare-unequal-outcomes", "Compare the number of counters belonging to each event.");
    case 5:
      return interaction({ kind: "chanceCompare", prompt: post ? "Which tool gives blue the greater chance?" : "Which tool gives pink an equal chance with blue?", tools: post ? [{ label: "Tool A", visual: spinner(1, 4, BLUE, PINK) }, { label: "Tool B", visual: spinner(3, 5, BLUE, PINK) }] : [{ label: "Tool A", visual: spinner(2, 4) }, { label: "Tool B", visual: spinner(3, 4) }], options: ["Tool A", "Tool B"], answer: post ? "Tool B" : "Tool A", feedback: { correct: "Response recorded.", wrong: "Response recorded." } }, "compare-chance-tools", "Compare winning parts with all equal parts in each tool.");
    case 6:
      return mcq(post ? "A game pays pink on 4 sectors and blue on 2. Is it fair?" : "A game awards one player heads and the other tails. Is it fair?", post ? "No, pink has more winning sectors" : "Yes, both players have one equally likely outcome", post ? ["Yes, both colours can occur", "Yes, because there are two players", "No, blue is impossible"] : ["No, heads always wins", "No, tails is rarer", "Only if heads wins first"], post ? spinner(4, 6) : { type: "coin" }, "judge-game-fairness", "A fair game gives players equal total chances, not merely possible outcomes.");
    case 7:
      return interaction({ kind: "chanceBuildFair", prompt: post ? "Repair the spinner so both players have equal winning parts." : "Build a fair two-colour spinner.", colours: [{ key: "pink", name: "Pink", colour: PINK }, { key: "blue", name: "Blue", colour: BLUE }], maxParts: post ? 8 : 6 }, "construct-fair-spinner", "Give both players the same number of equal sectors.");
    case 8:
      return mcq(post ? "Which change makes this 5-to-3 spinner fair?" : "Which change makes a bag with 4 pink and 2 blue counters fair?", post ? "Change one pink sector to blue" : "Add 2 blue counters", post ? ["Add another pink sector", "Remove one blue sector", "Make the pointer longer"] : ["Add 2 pink counters", "Remove both blue counters", "Shake the bag longer"], post ? spinner(5, 8) : bag([PINK, 4], [BLUE, 2]), "repair-fair-game", "Adjust outcome counts until both players have equal shares.");
    case 9:
      return interaction({ kind: "chanceCompare", prompt: post ? "Which game is fair?" : "Which tool gives both colours the same chance?", tools: [{ label: "Game A", visual: spinner(4, 6) }, { label: "Game B", visual: spinner(3, 6) }], options: ["Game A", "Game B"], answer: "Game B", feedback: { correct: "Response recorded.", wrong: "Response recorded." } }, "select-fair-game", "A fair two-player game splits all equal outcomes evenly.");
    case 10:
      return mcq(post ? "Pink and blue each cover 4 of 8 sectors. What is true?" : "Red has 3 counters and blue has 3 counters. What is true?", "The outcomes have the same chance", ["The first colour is more likely", "The brighter colour is more likely", "Neither outcome is possible"], post ? spinner(4, 8) : bag([PINK, 3], [BLUE, 3]), "same-chance-different-tool", "Equal counts of equally likely parts produce the same chance.");
    case 11:
      return interaction({ kind: "chanceAutoTally", prompt: post ? "Run the fair spinner twice and compare the two trial results." : "Run the fair coin experiment and compare the recorded frequencies.", tool: post ? "spinner" : "coin", draw: post ? ["pink", "blue"] : ["heads", "tails"], spins: post ? 16 : 12, labels: post ? [{ key: "pink", name: "Pink", colour: PINK }, { key: "blue", name: "Blue", colour: BLUE }] : [{ key: "heads", name: "Heads" }, { key: "tails", name: "Tails" }], mode: post ? "compareTrials" : "compareFrequencies" }, "fair-tool-experiment", "Fair outcomes can have different short-run frequencies.");
    case 12:
      return interaction({ kind: "chanceBuildFair", prompt: post ? "Fix Chanzia's eight-part spinner before the game begins." : "Give both players equal chances on this spinner.", colours: [{ key: "amber", name: "Amber", colour: AMBER }, { key: "green", name: "Green", colour: GREEN }], maxParts: 8 }, "fair-game-repair", "Balance the equal sectors between both players.");
    case 13:
      return interaction({ kind: "chanceCompare", prompt: post ? "Which chance tool is more favourable to Player 1?" : "Which chance tool gives Player 1 the smaller chance?", tools: [{ label: "Tool A", visual: spinner(2, 6) }, { label: "Tool B", visual: spinner(4, 6) }], options: ["Tool A", "Tool B", "They are equal"], answer: post ? "Tool B" : "Tool A", feedback: { correct: "Response recorded.", wrong: "Response recorded." } }, "compare-player-advantage", "Compare the player's winning share across both tools.");
    case 14:
      return mcq(post ? "A fair game is played 20 times and one player wins 12. What is the best conclusion?" : "A fair coin gives 7 heads in 10 tosses. Is the coin proven unfair?", post ? "A fair game can still have unequal short-run results" : "No, short trials can vary", post ? ["The game cannot be fair", "The player must win the next game", "Fair means exactly 10 wins each"] : ["Yes, fair coins always split exactly", "Yes, heads will now always win", "No, because heads is impossible"], post ? { type: "frequency", labels: ["Player 1", "Player 2"], counts: [12, 8], total: 20 } : { type: "frequency", labels: ["Heads", "Tails"], counts: [7, 3], total: 10 }, "fairness-versus-results", "Judge fairness from the tool's chance structure, while recognising short-run variation.");
    case 15:
      return interaction({ kind: "chanceDependentDraw", prompt: post ? "Replace the drawn pink counter, then decide what happens to the next pink chance." : "Draw and replace the blue counter. Decide whether the next draw's chances change.", bag: [{ key: "pink", name: "Pink", colour: PINK, count: 3 }, { key: "blue", name: "Blue", colour: BLUE, count: 2 }], drawKey: post ? "pink" : "blue", action: "replace", askKey: post ? "pink" : "blue", question: "How does replacing the counter affect the next draw?", options: ["The chance stays the same", "The chance increases", "The chance decreases"], answer: "The chance stays the same", feedback: { correct: "Response recorded.", wrong: "Response recorded." } }, "replacement-independent", "Replacing the counter restores the original bag before the next draw.");
    case 16:
      return interaction({ kind: "chanceDependentDraw", prompt: post ? "Keep the drawn blue counter out, then decide what happens to blue's next chance." : "Keep the drawn pink counter out. Decide how the next pink chance changes.", bag: [{ key: "pink", name: "Pink", colour: PINK, count: 4 }, { key: "blue", name: "Blue", colour: BLUE, count: 3 }], drawKey: post ? "blue" : "pink", action: "keep", askKey: post ? "blue" : "pink", question: "How does keeping the counter out affect the next draw?", options: ["The chance decreases", "The chance stays the same", "The chance becomes certain"], answer: "The chance decreases", feedback: { correct: "Response recorded.", wrong: "Response recorded." } }, "removal-dependent", "Removing a matching counter leaves fewer matching outcomes for the next draw.");
    case 17:
      return interaction({ kind: "chanceDependentDraw", prompt: post ? "Keep a pink counter out and decide what happens to blue's chance." : "Keep a blue counter out and decide what happens to pink's chance.", bag: [{ key: "pink", name: "Pink", colour: PINK, count: 3 }, { key: "blue", name: "Blue", colour: BLUE, count: 3 }], drawKey: post ? "pink" : "blue", action: "keep", askKey: post ? "blue" : "pink", question: "How does the other colour's chance change?", options: ["The chance increases", "The chance decreases", "The chance stays the same"], answer: "The chance increases", feedback: { correct: "Response recorded.", wrong: "Response recorded." } }, "other-outcome-after-removal", "Removing one colour makes the other colour a larger share of what remains.");
    case 18:
      return interaction({ kind: "chanceDependentDraw", prompt: post ? "Replace after every draw and identify the relationship between draws." : "Keep each drawn counter out and identify the relationship between draws.", bag: [{ key: "amber", name: "Amber", colour: AMBER, count: 2 }, { key: "green", name: "Green", colour: GREEN, count: 2 }], drawKey: "amber", action: post ? "replace" : "keep", askKey: "green", question: "Does the first draw change the chance on the next draw?", options: post ? ["No, replacement restores the bag", "Yes, the bag loses a counter", "Yes, green becomes impossible"] : ["Yes, the contents have changed", "No, every draw is identical", "No, colours never affect chance"], answer: post ? "No, replacement restores the bag" : "Yes, the contents have changed", feedback: { correct: "Response recorded.", wrong: "Response recorded." } }, "dependent-independent-classification", "Check whether the chance tool is restored before the next event.");
    default:
      return interaction({ kind: "chanceDependentDraw", prompt: post ? "A game removes each winning counter. Work out whether later turns keep the same chance." : "A game replaces every counter after drawing. Work out whether later turns keep the same chance.", bag: [{ key: "pink", name: "Pink", colour: PINK, count: 2 }, { key: "blue", name: "Blue", colour: BLUE, count: 4 }], drawKey: "pink", action: post ? "keep" : "replace", askKey: "pink", question: "What happens to the chance on the following turn?", options: post ? ["It changes because the bag has changed", "It stays the same", "It becomes certain"] : ["It stays the same because the bag is restored", "It decreases every turn", "It becomes impossible"], answer: post ? "It changes because the bag has changed" : "It stays the same because the bag is restored", feedback: { correct: "Response recorded.", wrong: "Response recorded." } }, "event-relationship-transfer", "Decide whether the first event changes the outcome set for the next event.");
  }
}

function levelFive(form: ChanceHollowAssessmentKind, index: number): ItemCore {
  const post = form === "posttest";
  switch (index) {
    case 0:
      return mcq(post ? "Two coins are tossed. Which is the complete ordered outcome set?" : "A coin and a die are used. Which list describes the outcome types?", post ? "HH, HT, TH, TT" : "A coin face paired with a die number", post ? ["HH, TT", "H, T", "HH, HT, TT"] : ["Only heads", "Only numbers", "One colour only"], post ? { type: "diceGrid", mode: "sum", highlight: 2 } : { type: "dicePair", left: 1, right: 6 }, "complete-compound-outcomes", "A complete outcome set includes every possible paired result once.");
    case 1:
      return mcq(post ? "Which statement about this spinner is correct?" : "Which colour outcomes are possible from this bag?", post ? "Pink is more likely because it has 5 of 8 sectors" : "Pink, blue and amber", post ? ["Both colours are equally likely", "Blue is impossible", "Pink is certain"] : ["Pink only", "Six different outcomes", "Green and orange"], post ? spinner(5, 8) : bag([PINK, 3], [BLUE, 2], [AMBER, 1]), "outcome-set-and-likelihood", "List distinct outcomes, then compare how many equally likely parts belong to each.");
    case 2:
      return interaction({ kind: "chanceCompare", prompt: post ? "Which tool has unequally likely colour outcomes?" : "Which tool has equally likely colour outcomes?", tools: [{ label: "Tool A", visual: spinner(3, 6) }, { label: "Tool B", visual: spinner(4, 6) }], options: ["Tool A", "Tool B"], answer: post ? "Tool B" : "Tool A", feedback: { correct: "Response recorded.", wrong: "Response recorded." } }, "equal-versus-unequal-tools", "Compare the number of equal parts assigned to each outcome.");
    case 3:
      return mcq(post ? "Pink covers 6 of 10 equal sectors. What is its probability?" : "Blue covers 3 of 8 equal sectors. What is its probability?", post ? "6/10" : "3/8", post ? ["10/6", "4/10", "6/4"] : ["8/3", "5/8", "3/5"], post ? spinner(6, 10) : spinner(3, 8, BLUE, PINK), "probability-as-fraction", "The numerator counts winning outcomes and the denominator counts all equally likely outcomes.");
    case 4:
      return mcq(post ? "A bag has 4 winning counters and 6 others. What is the winning probability?" : "A bag has 3 amber counters and 5 other counters. What is P(amber)?", post ? "4/10" : "3/8", post ? ["6/10", "4/6", "10/4"] : ["5/8", "3/5", "8/3"], post ? bag([PINK, 4], [BLUE, 6]) : bag([AMBER, 3], [BLUE, 5]), "bag-probability-fraction", "Compare the target count with the total number of counters.");
    case 5:
      return mcq(post ? "On two dice, why is a sum of 7 more likely than a sum of 2?" : "On two dice, why are grouped sums not all equally likely?", post ? "Six ordered pairs make 7, but only one makes 2" : "Different sums contain different numbers of ordered pairs", post ? ["Seven is a larger number", "The dice prefer middle numbers", "A sum of 2 is impossible"] : ["Large sums are always certain", "Each sum has one pair", "The second die copies the first"], { type: "diceGrid", mode: "sum", highlight: post ? 7 : 6 }, "two-dice-grouped-outcomes", "Count ordered pairs in the 6 by 6 outcome grid.");
    case 6:
      return interaction({ kind: "chanceDiceRace", prompt: post ? "Repair the difference race so both players cover equal numbers of ordered pairs." : "Choose the fair grouping for the two-dice difference race.", choices: [{ id: "fair", label: "Balanced rules", playerDifferences: [0, 1, 5], chanziaDifferences: [2, 3, 4] }, { id: "biased-a", label: "Wide versus narrow", playerDifferences: [0, 1, 2], chanziaDifferences: [5] }, { id: "biased-b", label: "One-sided rules", playerDifferences: [0, 1], chanziaDifferences: [2, 3, 4, 5] }], answerId: "fair", opponentName: "Chanzia", opponentImage: "/images/chanzia-roller-cutout.png", winningScore: 3 }, "repair-two-dice-race", "Use the full outcome grid to balance the total number of ordered pairs.");
    case 7:
      return mcq(post ? "Which fraction describes the chance of rolling an even number?" : "Which fraction describes rolling a number greater than 4?", post ? "3/6" : "2/6", post ? ["2/6", "3/3", "6/3"] : ["4/6", "2/4", "6/2"], { type: "die", face: post ? 4 : 5 }, "die-event-fraction", "Count all die faces satisfying the event over all six equally likely faces.");
    case 8:
      return interaction({ kind: "chanceCompare", prompt: post ? "Which spinner gives the target the larger probability?" : "Which bag gives amber the smaller probability?", tools: post ? [{ label: "Tool A", visual: spinner(3, 8) }, { label: "Tool B", visual: spinner(5, 8) }] : [{ label: "Bag A", visual: bag([AMBER, 3], [BLUE, 3]) }, { label: "Bag B", visual: bag([AMBER, 1], [BLUE, 5]) }], options: post ? ["Tool A", "Tool B", "They are equal"] : ["Bag A", "Bag B", "They are equal"], answer: post ? "Tool B" : "Bag B", feedback: { correct: "Response recorded.", wrong: "Response recorded." } }, "compare-fraction-chances", "Compare winning outcomes as a share of each tool's total outcomes.");
    case 9:
      return mcq(post ? "A race gives Player A sums 6, 7 and 8, and Player B sum 2 only. What is wrong?" : "A game says every possible sum on two dice has the same chance. What is the error?", post ? "Player A has many more winning ordered pairs" : "Different sums contain different numbers of ordered pairs", post ? ["The players have the same chance", "Sum 2 is impossible", "The dice need more faces"] : ["Every sum has exactly one pair", "Sums cannot be outcomes", "Two dice always match"], { type: "diceGrid", mode: "sum", highlight: 7 }, "detect-grouped-outcome-bias", "Fairness depends on the number of equally likely ordered pairs, not the number of labels.");
    case 10:
      return interaction({ kind: "chanceAutoTally", prompt: post ? "Run 30 spins and identify the most frequent outcome." : "Run 20 spins and compare the outcome frequencies.", tool: "spinner", draw: ["pink", "pink", "pink", "blue", "blue"], spins: post ? 30 : 20, labels: [{ key: "pink", name: "Pink", colour: PINK }, { key: "blue", name: "Blue", colour: BLUE }], mode: post ? "most" : "compareFrequencies" }, "run-frequency-experiment", "Use the completed trial record, not a prediction, to answer.");
    case 11:
      return mcq(post ? "Blue occurred 18 times in 30 trials. What is its relative frequency?" : "Pink occurred 12 times in 20 trials. What is its relative frequency?", post ? "18/30" : "12/20", post ? ["30/18", "12/30", "18/12"] : ["20/12", "8/20", "12/8"], post ? { type: "frequency", labels: ["Blue", "Other"], counts: [18, 12], total: 30 } : { type: "frequency", labels: ["Pink", "Other"], counts: [12, 8], total: 20 }, "relative-frequency-fraction", "Relative frequency is target occurrences over all completed trials.");
    case 12:
      return interaction({ kind: "chancePredictCount", prompt: post ? "Predict pink results from the spinner, then run 30 spins against Chanzia." : "Predict blue results, then run 20 spins and compare.", wedges: post ? [PINK, PINK, PINK, BLUE, BLUE] : [BLUE, BLUE, PINK, PINK], targetKey: post ? PINK : BLUE, targetName: post ? "Pink" : "Blue", spins: post ? 30 : 20 }, "predict-and-test-frequency", "Use the target's share to predict, then compare the prediction with observed results.");
    case 13:
      return mcq(post ? "Trial A produced 14/20 pink and Trial B produced 11/20. Which had the greater pink frequency?" : "Trial A produced 7/10 blue and Trial B produced 12/20. Which had the greater blue frequency?", "Trial A", ["Trial B", "They were equal", "The denominators make comparison impossible"], post ? { type: "frequency", labels: ["Trial A", "Trial B"], counts: [14, 11], total: 20 } : { type: "frequency", labels: ["Trial A", "Trial B"], counts: [7, 6], total: 10 }, "compare-relative-frequencies", "Compare relative frequencies using equivalent denominators or decimal size.");
    case 14:
      return interaction({ kind: "chanceAutoTally", prompt: post ? "Run two 25-spin trials and compare how much their frequencies vary." : "Run two 20-toss trials and inspect the variation.", tool: post ? "spinner" : "coin", draw: post ? ["pink", "blue"] : ["heads", "tails"], spins: post ? 25 : 20, labels: post ? [{ key: "pink", name: "Pink", colour: PINK }, { key: "blue", name: "Blue", colour: BLUE }] : [{ key: "heads", name: "Heads" }, { key: "tails", name: "Tails" }], mode: "compareTrials" }, "compare-frequency-variation", "Repeated experiments can vary even when the chance model is unchanged.");
    case 15:
      return interaction({ kind: "chanceCompare", prompt: post ? "Which tool's design best explains a pink frequency near 75%?" : "Which tool's design best explains blue appearing about half the time?", tools: post ? [{ label: "Tool A", visual: spinner(3, 4) }, { label: "Tool B", visual: spinner(1, 4) }] : [{ label: "Tool A", visual: spinner(2, 4, BLUE, PINK) }, { label: "Tool B", visual: spinner(1, 4, BLUE, PINK) }], options: ["Tool A", "Tool B"], answer: "Tool A", feedback: { correct: "Response recorded.", wrong: "Response recorded." } }, "frequency-to-design", "Match the observed long-run share to the tool's winning share.");
    case 16:
      return mcq(post ? "A die shows six 16 times in 24 rolls. What is the most careful next step?" : "A spinner gives 9 pink in 10 spins. Is that enough to prove it is loaded?", post ? "Repeat many more rolls using the same method" : "No, repeat more trials and compare the evidence", post ? ["Declare the die loaded immediately", "Remove the six face", "Assume every future roll is six"] : ["Yes, one short trial proves it", "Yes, pink is now certain", "No, because results never matter"], post ? { type: "frequency", labels: ["Six", "Other"], counts: [16, 8], total: 24 } : { type: "frequency", labels: ["Pink", "Other"], counts: [9, 1], total: 10 }, "evaluate-bias-evidence", "Unusual short-run evidence should be checked with more repeated trials.");
    case 17:
      return interaction({ kind: "chanceAutoTally", prompt: post ? "Run a larger trial and decide whether the evidence fits the tool's design." : "Run the experiment twice before judging whether the tool may be biased.", tool: "spinner", draw: post ? ["pink", "pink", "blue"] : ["pink", "blue"], spins: post ? 40 : 24, labels: [{ key: "pink", name: "Pink", colour: PINK }, { key: "blue", name: "Blue", colour: BLUE }], mode: "compareFrequencies" }, "test-bias-claim", "Compare observed frequencies with the tool's expected likelihood across enough trials.");
    case 18:
      return interaction({ kind: "chancePredictCount", prompt: post ? "Use the 2-in-5 design to predict the target count, then test 50 spins." : "Use the 1-in-4 design to predict the target count, then test 40 spins.", wedges: post ? [PINK, PINK, BLUE, BLUE, BLUE] : [PINK, BLUE, BLUE, BLUE], targetKey: PINK, targetName: "Pink", spins: post ? 50 : 40 }, "investigation-predict-run", "Multiply the event's share by the trial count for an expected frequency, then compare observations.");
    default:
      return mcq(post ? "A 3/5 event occurred 28 times in 50 trials. Which verdict is justified?" : "A fair coin produced 23 heads in 40 tosses. Which conclusion is justified?", post ? "The observed 28/50 is reasonably close to the expected 30/50" : "The result differs from half but can occur through variation", post ? ["The event is definitely unfair", "Exactly 30 wins were required", "The next 22 trials must win"] : ["The coin is definitely loaded", "The next toss must be tails", "A fair coin always gives exactly half"], post ? { type: "expectedObserved", expected: 30, observed: 28, total: 50 } : { type: "expectedObserved", expected: 20, observed: 23, total: 40 }, "defend-frequency-verdict", "Use expected and observed evidence while allowing for chance variation.");
  }
}

function levelSix(form: ChanceHollowAssessmentKind, index: number): ItemCore {
  const post = form === "posttest";
  switch (index) {
    case 0:
      return mcq(post ? "Which three values name the same probability?" : "Which value marks an impossible event?", post ? "3/4, 0.75 and 75%" : "0", post ? ["3/4, 0.34 and 34%", "1/4, 0.75 and 25%", "3/5, 0.5 and 50%"] : ["0.25", "0.5", "1"], { type: "scale", highlight: post ? "likely" : "impossible" }, "probability-scale-equivalence", "Probabilities range from zero to one; fractions, decimals and percentages can name the same point.");
    case 1:
      return interaction({ kind: "chanceScalePortal", prompt: post ? "Place 65% at the matching point on the probability scale." : "Place 0.4 at the matching point on the probability scale.", sourceLabel: post ? "65%" : "0.4", targetValue: post ? 0.65 : 0.4, scaleStep: 0.05, displayMode: post ? "percent" : "decimal" }, "place-probability-scale", "Convert the stated probability to a point between zero and one.");
    case 2:
      return interaction({ kind: "chanceFormMatch", prompt: post ? "Tap the decimal and percentage equal to 3/5." : "Tap the decimal and percentage equal to 1/4.", anchorLabel: post ? "3/5" : "1/4", options: post ? [{ label: "0.6", correct: true }, { label: "60%", correct: true }, { label: "0.3", correct: false }, { label: "35%", correct: false }] : [{ label: "0.25", correct: true }, { label: "25%", correct: true }, { label: "0.4", correct: false }, { label: "40%", correct: false }] }, "match-probability-forms", "Convert the fraction to both a decimal and a percentage.");
    case 3:
      return mcq(post ? "A bag has 7 winning counters out of 20. What is the probability?" : "A spinner has 3 winning sectors out of 10. What is the probability?", post ? "7/20" : "3/10", post ? ["13/20", "20/7", "7/13"] : ["7/10", "10/3", "3/7"], post ? bag([PINK, 7], [BLUE, 13]) : spinner(3, 10), "calculate-probability", "Probability equals favourable equally likely outcomes divided by all outcomes.");
    case 4:
      return interaction({ kind: "chanceProbabilityForge", prompt: post ? "Build a 5/8 winning spinner." : "Build a 2/5 winning bag.", tool: post ? "spinner" : "bag", targetWinning: post ? 5 : 2, total: post ? 8 : 5, initialWinning: post ? 2 : 4, targetLabel: post ? "5/8 target" : "2/5 target" }, "construct-target-probability", "Set favourable outcomes so their count over the total matches the target fraction.");
    case 5:
      return interaction({ kind: "chanceProbabilityForge", prompt: post ? "Complete the complement of 7/10 so the two probabilities total one." : "Complete the complement of 3/8 so the two probabilities total one.", tool: "spinner", targetWinning: post ? 3 : 5, total: post ? 10 : 8, initialWinning: 1, targetLabel: "Complete one whole", sourceWinning: post ? 7 : 3 }, "probability-complement", "Complementary probabilities add to one whole.");
    case 6:
      return mcq(post ? "A spinner has unequal sectors. Can probability be found by counting sectors alone?" : "Why must outcomes be equally likely before using winning outcomes over total outcomes?", post ? "No, sector areas must be considered" : "Each counted outcome must represent the same chance", post ? ["Yes, all sectors count equally", "Yes, colour controls probability", "No probability can ever be found"] : ["Larger numbers are always more likely", "Every experiment must give exact results", "The numerator must exceed the denominator"], spinner(2, 5), "equally-likely-condition", "Counting outcomes works only when each counted outcome has equal chance.");
    case 7:
      return interaction({ kind: "chanceCompare", prompt: post ? "Which simulator correctly models a 30% event?" : "Which simulator correctly models a 50% event?", tools: post ? [{ label: "Model A", visual: spinner(3, 10) }, { label: "Model B", visual: spinner(4, 10) }, { label: "Model C", visual: spinner(2, 10) }] : [{ label: "Model A", visual: spinner(2, 6) }, { label: "Model B", visual: spinner(3, 6) }, { label: "Model C", visual: spinner(5, 6) }], options: ["Model A", "Model B", "Model C"], answer: post ? "Model A" : "Model B", feedback: { correct: "Response recorded.", wrong: "Response recorded." } }, "select-valid-simulator", "The simulator's winning proportion must equal the target probability.");
    case 8:
      return interaction({ kind: "chanceProbabilityForge", prompt: post ? "Repair the die model so it represents a probability of 2/3." : "Repair the spinner so it represents a probability of 75%.", tool: post ? "die" : "spinner", targetWinning: post ? 4 : 3, total: post ? 6 : 4, initialWinning: post ? 2 : 1, targetLabel: post ? "2/3 model" : "75% model", battle: true }, "repair-probability-model", "Match the winning share exactly before testing the repaired model.");
    case 9:
      return mcq(post ? "What is the complement of 35%?" : "What is the complement of 0.45?", post ? "65%" : "0.55", post ? ["35%", "75%", "135%"] : ["0.45", "0.65", "1.45"], { type: "scale", highlight: "likely" }, "calculate-complement", "Subtract the event probability from one whole or 100 percent.");
    case 10:
      return mcq(post ? "A 40% event is simulated 80 times. What is its expected frequency?" : "A 25% event is simulated 40 times. What is its expected frequency?", post ? "32" : "10", post ? ["20", "40", "48"] : ["4", "16", "25"], { type: "expectedObserved", expected: post ? 32 : 10, observed: post ? 29 : 12, total: post ? 80 : 40 }, "expected-frequency", "Multiply the probability by the number of trials.");
    case 11:
      return interaction({ kind: "chanceSimulationLab", prompt: post ? "Predict the expected wins for a 3-in-5 event, then run 100 trials." : "Predict the expected wins for a 1-in-4 event, then run 40 trials.", tool: "spinner", winning: post ? 3 : 1, total: post ? 5 : 4, stages: [post ? 100 : 40], targetName: "glow", challenge: "predict" }, "predict-expected-frequency", "Use probability times trials, then compare the simulation result.");
    case 12:
      return mcq(post ? "Expected frequency was 45, but observed frequency was 48. What does this show?" : "Expected frequency was 20, but observed frequency was 17. Is the simulation necessarily wrong?", post ? "Observed results can vary around the expectation" : "No, chance variation can produce a nearby count", post ? ["The model is definitely biased", "Expected frequency was calculated incorrectly", "The next three trials must lose"] : ["Yes, observed must equal expected", "Yes, three results are missing", "No, expected results never matter"], { type: "expectedObserved", expected: post ? 45 : 20, observed: post ? 48 : 17, total: post ? 75 : 40 }, "expected-versus-observed", "Expected frequency is a prediction, while observed frequency records one variable trial.");
    case 13:
      return interaction({ kind: "chanceSimulationLab", prompt: post ? "Run 30 and 150 trials, then compare expected and observed frequencies." : "Run 20 and 100 trials, then compare the evidence.", tool: post ? "die" : "coin", winning: post ? 2 : 1, total: post ? 6 : 2, stages: post ? [30, 150] : [20, 100], targetName: "portal", challenge: "compare" }, "simulate-and-compare", "Compare observed frequency with the expected count at each trial size.");
    case 14:
      return interaction({ kind: "chanceSimulationLab", prompt: post ? "Climb from 20 to 500 trials and identify the relative frequency closest to expectation." : "Climb from 10 to 200 trials and track how relative frequency changes.", tool: "spinner", winning: post ? 2 : 1, total: post ? 5 : 4, stages: post ? [20, 100, 500] : [10, 50, 200], targetName: "crystal", challenge: "convergence", analysis: "closest" }, "trial-size-convergence", "Larger samples often settle closer to the model probability, though variation remains.");
    case 15:
      return mcq(post ? "Which claim about larger samples is accurate?" : "Why are 500 trials usually stronger evidence than 10 trials?", post ? "They usually reduce relative variation but do not guarantee an exact match" : "A larger sample is less affected by a few unusual results", post ? ["They remove all randomness", "They must match expectation exactly", "They make every event equally likely"] : ["They guarantee the expected count", "They change the model probability", "They make outcomes alternate"], { type: "convergence", expected: 0.5, samples: post ? [{ trials: 20, value: 0.65 }, { trials: 100, value: 0.54 }, { trials: 500, value: 0.49 }] : [{ trials: 10, value: 0.7 }, { trials: 100, value: 0.53 }, { trials: 500, value: 0.51 }] }, "interpret-trial-size", "More trials strengthen long-run evidence without eliminating chance variation.");
    case 16:
      return interaction({ kind: "chanceModelDebugger", prompt: post ? "Choose the valid machine for a 3-in-5 event." : "Choose the valid machine for a 1-in-4 event.", scenario: post ? "Model a 3 in 5 event and reset after every trial." : "Model a 1 in 4 event and reset after every trial.", machines: post ? [{ id: "post-a", title: "Machine A", detail: "Three winning outcomes and two losing outcomes; reset every trial.", fair: true }, { id: "post-b", title: "Machine B", detail: "Three winning outcomes and one losing outcome.", fair: false }, { id: "post-c", title: "Machine C", detail: "Used outcomes stay removed.", fair: false }] : [{ id: "pre-a", title: "Machine A", detail: "One winning sector and three losing sectors; reset every trial.", fair: true }, { id: "pre-b", title: "Machine B", detail: "One winning sector and four losing sectors.", fair: false }, { id: "pre-c", title: "Machine C", detail: "The winning sector is counted twice.", fair: false }], answerId: post ? "post-a" : "pre-a", reason: "The winning share matches the event and the tool resets after each trial." }, "validate-simulation-model", "A valid simulation preserves the event probability and repeats the same conditions each trial.");
    case 17:
      return interaction({ kind: "chanceModelDebugger", prompt: post ? "Find the fault in Chanzia's probability machine." : "Audit the simulation and select the correctly designed machine.", scenario: post ? "Simulate a fair independent event." : "Every outcome must be mapped once and probabilities must total one.", machines: post ? [{ id: "fault-a", title: "Machine A", detail: "Each outcome is mapped once and reset.", fair: true }, { id: "fault-b", title: "Machine B", detail: "A winning outcome is mapped twice.", fair: false }, { id: "fault-c", title: "Machine C", detail: "Used outcomes remain removed.", fair: false }] : [{ id: "audit-a", title: "Machine A", detail: "All outcomes are included once and total 100%.", fair: true }, { id: "audit-b", title: "Machine B", detail: "One outcome is missing.", fair: false }, { id: "audit-c", title: "Machine C", detail: "The probabilities total 120%.", fair: false }], answerId: post ? "fault-a" : "audit-a", reason: "The valid machine maps each outcome once and restores the same conditions." }, "debug-simulation", "Check outcome mapping, total probability and reset rules.");
    case 18:
      return interaction({ kind: "chanceSimulationLab", prompt: post ? "Run the full investigation across three sample sizes and measure the largest gap." : "Run three sample sizes and identify the trial furthest from expectation.", tool: post ? "die" : "spinner", winning: post ? 1 : 2, total: post ? 6 : 5, stages: post ? [60, 180, 600] : [20, 100, 400], targetName: "shield", challenge: "convergence", analysis: post ? "gap" : "furthest" }, "investigation-evidence", "Use all simulation stages to evaluate variation and long-run evidence.");
    default:
      return interaction({ kind: "chanceMasterTrial", prompt: post ? "Complete Chanzia's final probability audit and defend the verdict." : "Complete the investigation challenge and choose the evidence-based verdict.", targetWinning: post ? 3 : 2, total: post ? 5 : 5, trials: post ? 100 : 50, observed: post ? 57 : 18, opponentName: "Master Chanzia", opponentImage: "/images/chanzia-master-cutout.png" }, "master-investigation-verdict", "Connect theoretical probability, expected frequency and observed evidence without claiming certainty.");
  }
}

function coreFor(level: ChanceHollowLevel, form: ChanceHollowAssessmentKind, index: number) {
  if (level === 3) return levelThree(form, index);
  if (level === 4) return levelFour(form, index);
  if (level === 5) return levelFive(form, index);
  return levelSix(form, index);
}

function expandMix<T extends string>(mix: Record<T, number>): T[] {
  return Object.entries(mix).flatMap(([value, count]) => Array.from({ length: count as number }, () => value as T));
}

function difficulty(value: ChanceHollowDifficulty): AssessmentItemDifficulty {
  return value === "accessible" ? "easy" : value === "moderate" ? "moderate" : "challenging";
}

function cognition(value: ChanceHollowCognitiveDemand): AssessmentCognitiveCategory {
  return value;
}

function descriptorSlots(level: ChanceHollowLevel, form: ChanceHollowAssessmentKind) {
  const blueprint = getChanceHollowAssessmentBlueprint(level)!;
  return blueprint.descriptors.flatMap((descriptor) =>
    Array.from({ length: descriptor.allocation[form] }, () => descriptor),
  );
}

function buildForm(level: ChanceHollowLevel, form: ChanceHollowAssessmentKind): AssessmentQuestion[] {
  const blueprint = getChanceHollowAssessmentBlueprint(level)!;
  const formBlueprint = blueprint.forms.find((candidate) => candidate.kind === form)!;
  const descriptors = descriptorSlots(level, form);
  const difficulties = expandMix(formBlueprint.difficultyMix);
  const cognitiveDemands = expandMix(formBlueprint.cognitiveMix);

  return Array.from({ length: formBlueprint.questionCount }, (_, index) => {
    const descriptor = descriptors[index]!;
    const core = coreFor(level, form, index);
    const cognitiveCategory = cognition(cognitiveDemands[index]!);
    const itemDifficulty = difficulty(difficulties[index]!);
    const misconception = descriptor.misconceptionIds[index % Math.max(1, descriptor.misconceptionIds.length)];
    const week = descriptor.weeks[index % descriptor.weeks.length] ?? descriptor.weeks[0] ?? 1;
    const shortForm = form === "pretest" ? "pre" : "post";
    const id = `chance-hollow-y${level}-${shortForm}-q${String(index + 1).padStart(2, "0")}-v1`;
    const isInteractive = Boolean(core.task);
    const responseMode: AssessmentResponseMode = isInteractive ? "manipulated_response" : "selected_response";
    const rotatedOptions = core.options ? rotateOptions(core.options, index + (form === "posttest" ? 1 : 0)) : undefined;
    const common = {
      schemaVersion: 1 as const,
      id,
      version: "1.0.0",
      realm: "chance" as const,
      level,
      form,
      origin: "assessment_authored" as const,
      sourcePool: form,
      bankId: `chance-hollow-year-${level}-${form}-v1`,
      primaryDescriptorCode: descriptor.code,
      descriptorCodes: [descriptor.code],
      curriculumLessonMapping: [{ week, lesson: (index % 3) + 1 }],
      cognitiveCategory,
      difficulty: itemDifficulty,
      isTransfer: cognitiveCategory === "transfer",
      requiresReasoning: cognitiveCategory === "reasoning" || cognitiveCategory === "transfer",
      misconceptionDiagnosis: Boolean(misconception),
      responseMode,
      misconceptionTags: misconception ? [misconception] : [],
      contextKey: `chance-hollow-y${level}-${form}-evidence-${index + 1}`,
      structureKey: `chance-hollow-y${level}-${form}-${core.structure}-${index + 1}`,
      prompt: core.prompt,
      statistics: createUncalibratedItemStatistics(itemDifficulty),
      skillId: descriptor.code.toLowerCase(),
      skillLabel: descriptor.description,
      linkedWeeks: [week],
      linkedLessons: [(index % 3) + 1],
      strand: "Probability",
      curriculumCodes: [descriptor.code],
      difficultyBand: `year-${level}-chance-hollow`,
      reviewFeedback: core.review,
    };

    if (core.task) {
      return {
        ...common,
        renderer: { type: "chance_hollow_assessment_task", payload: core.task },
        scoring: { kind: "interaction" as const, correctResponse: CORRECT_TOKEN },
        type: "chanceHollowTask",
        correctAnswer: CORRECT_TOKEN,
        answer: CORRECT_TOKEN,
        visual: { type: "chance_hollow_assessment", taskKind: core.task.kind },
        practiceTask: core.task,
      } as AssessmentQuestion;
    }

    const selectedAnswerPosition = rotatedOptions?.indexOf(core.answer!) ?? -1;
    return {
      ...common,
      selectedAnswerPosition,
      renderer: { type: "chance_hollow_visual_question", payload: core.visual },
      scoring: { kind: "exact" as const, correctResponse: core.answer },
      type: "mcq",
      correctAnswer: core.answer!,
      answer: core.answer!,
      options: rotatedOptions,
      visual: core.visual,
    } as AssessmentQuestion;
  });
}

export const CHANCE_HOLLOW_INDEPENDENT_ASSESSMENT_FORMS: Record<FormKey, AssessmentQuestion[]> = Object.fromEntries(
  ([3, 4, 5, 6] as const).flatMap((level) =>
    (["pretest", "posttest"] as const).map((form) => [
      `${level}-${form}` as FormKey,
      buildForm(level, form),
    ]),
  ),
) as Record<FormKey, AssessmentQuestion[]>;

export function getChanceHollowIndependentAssessment(level: number, form: ChanceHollowAssessmentKind) {
  if (!Number.isInteger(level) || level < 3 || level > 6) return [];
  return CHANCE_HOLLOW_INDEPENDENT_ASSESSMENT_FORMS[`${level as ChanceHollowLevel}-${form}`] ?? [];
}
