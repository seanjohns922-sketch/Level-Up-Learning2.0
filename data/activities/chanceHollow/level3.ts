import type { ChanceVisual, PracticeTask } from "@/data/activities/year1/practice-task";
import type { RealmLessonTaskSet } from "@/data/activities/realm-lesson-blueprint";

type Gen = (round: number, target: number) => PracticeTask;

const pick = <T,>(items: readonly T[], index: number) => items[((index % items.length) + items.length) % items.length]!;
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

// Turn a pool of cases into a generator. `round` walks the pool and also
// shuffles the option order so the same case does not always read identically.
const poolGen =
  (cases: readonly ChanceCase[], lead?: string): Gen =>
  (round) => {
    const c = pick(cases, round);
    return {
      kind: "mcq",
      prompt: lead ? `${lead} ${c.prompt}` : c.prompt,
      options: rotate([...c.options], round),
      answer: c.answer,
      feedback: { correct: c.correct, wrong: c.wrong },
      ...(c.visual ? { visual: c.visual } : {}),
    };
  };

const FOUR_SCALE = ["Certain", "Likely", "Unlikely", "Impossible"] as const;

// ─────────────────────────────── Week 1: Chance Words ───────────────────────
const w1l1 = poolGen([
  { prompt: "The sun will set this evening. Certain or impossible?", answer: "Certain", options: FOUR_SCALE, correct: "Yes. The sun sets every day, so it must happen.", wrong: "'Certain' means it must happen. The sun sets every single day.", visual: { type: "scale", highlight: "certain" } },
  { prompt: "A cat will read a newspaper out loud. Certain or impossible?", answer: "Impossible", options: FOUR_SCALE, correct: "Right. Cats cannot read, so it can never happen.", wrong: "'Impossible' means it can never happen. Cats cannot read aloud.", visual: { type: "scale", highlight: "impossible" } },
  { prompt: "You will get one year older on your next birthday. Certain or impossible?", answer: "Certain", options: FOUR_SCALE, correct: "Yes. Birthdays always add a year, so it must happen.", wrong: "This one must happen every birthday, so it is certain.", visual: { type: "scale", highlight: "certain" } },
  { prompt: "You will draw a red counter from a bag with only blue counters. Certain or impossible?", answer: "Impossible", options: FOUR_SCALE, correct: "Correct. There are no red counters, so it can never happen.", wrong: "There are no red counters in the bag, so drawing red is impossible.", visual: { type: "bag", counters: [BLUE, BLUE, BLUE, BLUE, BLUE, BLUE] } },
]);

const w1l2 = poolGen([
  { prompt: "The spinner lands on red. Likely or unlikely?", answer: "Likely", options: FOUR_SCALE, correct: "Yes. Most of the spinner is red, so red is likely.", wrong: "Three of the four parts are red, so landing on red is likely.", visual: { type: "spinner", wedges: [RED, RED, RED, BLUE] } },
  { prompt: "The spinner lands on blue. Likely or unlikely?", answer: "Unlikely", options: FOUR_SCALE, correct: "Right. Only a small part is blue, so blue is unlikely.", wrong: "Only one of the four parts is blue, so blue is unlikely.", visual: { type: "spinner", wedges: [RED, RED, RED, BLUE] } },
  { prompt: "You draw the one red counter from this bag. Likely or unlikely?", answer: "Unlikely", options: FOUR_SCALE, correct: "Yes. There is only one red among many, so it is unlikely.", wrong: "There is only one red counter and lots of blue, so red is unlikely.", visual: { type: "bag", counters: [BLUE, BLUE, BLUE, BLUE, BLUE, RED] } },
  { prompt: "You roll a number less than 6 on one die. Likely or unlikely?", answer: "Likely", options: FOUR_SCALE, correct: "Yes. Five of the six numbers are less than 6, so it is likely.", wrong: "The numbers 1, 2, 3, 4 and 5 all work — five out of six — so it is likely.", visual: { type: "die", face: 4 } },
]);

const w1l3 = poolGen([
  { prompt: "You roll a 7 on a normal die. Which chance word and why?", answer: "Impossible — a die only has 1 to 6", options: ["Impossible — a die only has 1 to 6", "Unlikely — 7 is a big number", "Likely — 7 is on most dice", "Certain — a 7 always comes up"], correct: "Correct. A die has no 7, so rolling one can never happen.", wrong: "Look at the die: the faces are 1 to 6. There is no 7, so it is impossible.", visual: { type: "die", face: 6 } },
  { prompt: "A tossed coin lands on heads. Which chance word and why?", answer: "50/50 — heads and tails are equally likely", options: ["50/50 — heads and tails are equally likely", "Certain — coins always land heads", "Impossible — coins have no heads", "Unlikely — heads hardly ever happens"], correct: "Yes. A coin has two equal sides, so heads and tails are equally likely.", wrong: "A coin has two equal sides, so heads is neither likely nor unlikely — it is 50/50.", visual: { type: "coin", face: "heads" } },
  { prompt: "You draw a counter from a bag that has counters in it. Which chance word and why?", answer: "Certain — there is always a counter to draw", options: ["Certain — there is always a counter to draw", "Unlikely — the bag might be empty", "Impossible — you cannot reach in", "Likely — but sometimes you draw nothing"], correct: "Right. The bag has counters, so you must draw one — it is certain.", wrong: "The bag is full of counters, so you will always draw one. That is certain.", visual: { type: "bag", counters: [RED, BLUE, YELLOW, GREEN, RED, BLUE] } },
  { prompt: "The spinner lands on green, but there is no green on it. Which chance word and why?", answer: "Impossible — there is no green section", options: ["Impossible — there is no green section", "Unlikely — green is a rare colour", "Certain — every spinner has green", "Likely — green is a common colour"], correct: "Correct. With no green section, landing on green can never happen.", wrong: "There is no green on the spinner, so landing on green is impossible.", visual: { type: "spinner", wedges: [RED, RED, BLUE, YELLOW] } },
]);

// ─────────────────────────── Week 2: Everyday Chance Events ──────────────────
const w2l1 = poolGen([
  { prompt: "It will be sunny at some point this week. Which chance word fits?", answer: "Likely", options: FOUR_SCALE, correct: "Reasonable. Sunny moments usually happen in a week, so it is likely.", wrong: "Sunshine usually happens across a whole week, so this is likely (not certain).", visual: { type: "scale", highlight: "likely" } },
  { prompt: "Everyone in your class is exactly the same height. Which chance word fits?", answer: "Unlikely", options: FOUR_SCALE, correct: "Yes. People are different heights, so this is very unlikely.", wrong: "People come in many heights, so everyone matching exactly is unlikely.", visual: { type: "scale", highlight: "unlikely" } },
  { prompt: "Your teacher will say at least one word today. Which chance word fits?", answer: "Certain", options: FOUR_SCALE, correct: "Right. Teachers always speak in class, so it is certain.", wrong: "A teacher always speaks during a school day, so this is certain.", visual: { type: "scale", highlight: "certain" } },
  { prompt: "You will see a real dinosaur walking to school. Which chance word fits?", answer: "Impossible", options: FOUR_SCALE, correct: "Correct. Dinosaurs are extinct, so this can never happen.", wrong: "Dinosaurs died out long ago, so seeing a real one is impossible.", visual: { type: "scale", highlight: "impossible" } },
]);

const w2l2 = poolGen([
  { prompt: "A dropped ball will fall down. Which pile?", answer: "Certain", options: FOUR_SCALE, correct: "Yes. Things always fall down, so it goes in the Certain pile.", wrong: "Gravity always pulls things down, so this card is certain.", visual: { type: "scale", highlight: "certain" } },
  { prompt: "You flip ten heads in a row. Which pile?", answer: "Unlikely", options: FOUR_SCALE, correct: "Right. It can happen, but almost never, so it is unlikely.", wrong: "Ten heads in a row can happen but almost never does — that is unlikely.", visual: { type: "coin", face: "heads" } },
  { prompt: "A pig will fly on its own. Which pile?", answer: "Impossible", options: FOUR_SCALE, correct: "Correct. Pigs cannot fly, so this goes in the Impossible pile.", wrong: "Pigs cannot fly by themselves, so this card is impossible.", visual: { type: "scale", highlight: "impossible" } },
  { prompt: "It will get dark tonight. Which pile?", answer: "Certain", options: FOUR_SCALE, correct: "Yes. Night comes every day, so it is certain.", wrong: "Night falls every single day, so this card is certain.", visual: { type: "scale", highlight: "certain" } },
]);

const w2l3 = poolGen([
  { prompt: "This bag has 9 blue and 1 red. Drawing blue is likely because…", answer: "almost all the counters are blue", options: ["almost all the counters are blue", "blue is a nice colour", "red counters are heavy", "there is one red counter"], correct: "Right. With 9 of 10 counters blue, blue is very likely.", wrong: "Give a reason about the counts: 9 of the 10 counters are blue.", visual: { type: "bag", counters: [BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, RED] } },
  { prompt: "Rolling a number from 1 to 6 on a die is certain because…", answer: "the die only has the numbers 1 to 6 on it", options: ["the die only has the numbers 1 to 6 on it", "6 is the biggest number", "dice are cubes", "you always roll it fast"], correct: "Yes. Every face is 1 to 6, so you must roll one of them.", wrong: "The reason is about the faces: a die only has 1 to 6, so it is certain.", visual: { type: "die", face: 5 } },
  { prompt: "This spinner landing on red is unlikely because…", answer: "only a small part of the spinner is red", options: ["only a small part of the spinner is red", "red is the fastest colour", "the spinner is round", "most of it is blue"], correct: "Correct. Only one of four parts is red, so red is unlikely.", wrong: "Look at the sizes: only a small part is red, so red is unlikely.", visual: { type: "spinner", wedges: [RED, BLUE, BLUE, BLUE] } },
  { prompt: "Drawing green from a red-and-blue bag is impossible because…", answer: "there are no green counters in the bag", options: ["there are no green counters in the bag", "green counters are hiding", "green is hard to see", "green counters are too small"], correct: "Right. With no green counters, green can never be drawn.", wrong: "The reason is the contents: there are no green counters, so it is impossible.", visual: { type: "bag", counters: [RED, RED, BLUE, BLUE, RED, BLUE] } },
]);

// ─────────────────────────── Week 3: Possible Outcomes ───────────────────────
const w3l1 = poolGen([
  { prompt: "What could this spinner land on?", answer: "Red, blue or yellow", options: ["Red, blue or yellow", "Only red", "Red, blue, yellow or green", "Purple or orange"], correct: "Yes. Those three colours are the only sections, so any of them could come up.", wrong: "List only the colours you can see: red, blue and yellow.", visual: { type: "spinner", wedges: [RED, BLUE, YELLOW] } },
  { prompt: "What could a tossed coin land on?", answer: "Heads or tails", options: ["Heads or tails", "Only heads", "Heads, tails or its edge", "A number from 1 to 6"], correct: "Right. A coin has two sides, so it is heads or tails.", wrong: "A coin has two faces, so the outcomes are heads or tails.", visual: { type: "coin", face: "heads" } },
  { prompt: "What could you roll on one die?", answer: "Any number from 1 to 6", options: ["Any number from 1 to 6", "Only a 6", "Any number from 1 to 10", "Heads or tails"], correct: "Yes. The faces are 1 to 6, so any of those could come up.", wrong: "A die has the faces 1 to 6, so any of those numbers could be rolled.", visual: { type: "die", face: 3 } },
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
const w4l1 = poolGen([
  { prompt: "Which colour should you predict this spinner lands on most?", answer: "Red", options: ["Red", "Blue", "They are equal", "Yellow"], correct: "Yes. Most of the spinner is red, so red is the best prediction.", wrong: "Predict the biggest section. Three parts are red, so predict red.", visual: { type: "spinner", wedges: [RED, RED, RED, BLUE] } },
  { prompt: "The bag has 5 yellow and 5 black. What is the best prediction for one draw?", answer: "Yellow and black are equally likely", options: ["Yellow and black are equally likely", "Yellow is certain", "Black is impossible", "Yellow is more likely"], correct: "Right. Equal counts means an even chance either way.", wrong: "The counts are equal (5 and 5), so neither colour is more likely.", visual: { type: "bag", counters: [YELLOW, YELLOW, YELLOW, YELLOW, YELLOW, "#111827", "#111827", "#111827", "#111827", "#111827"] } },
  { prompt: "Before rolling one die, what is a fair prediction?", answer: "Any number from 1 to 6 could come up", options: ["Any number from 1 to 6 could come up", "A 9 will come up", "Only a 6 can come up", "The same number every time"], correct: "Yes. Each of the six numbers has the same chance.", wrong: "Every face 1 to 6 is equally likely, so any of them could come up.", visual: { type: "die", face: 2 } },
  { prompt: "Which colour should you predict this spinner lands on most?", answer: "Blue", options: ["Blue", "Red", "Yellow", "Green"], correct: "Yes. Blue has the most sections, so predict blue.", wrong: "Predict the biggest share. Blue has the most parts here.", visual: { type: "spinner", wedges: [BLUE, BLUE, BLUE, RED, YELLOW] } },
]);

const w4l2 = poolGen([
  { prompt: "You predicted red on this spinner, but you spun blue. What does that show?", answer: "Blue was less likely but could still happen", options: ["Blue was less likely but could still happen", "Your prediction was cheating", "Blue is impossible", "The spinner is broken"], correct: "Right. A less likely outcome can still happen sometimes.", wrong: "Blue is unlikely here, but 'unlikely' does not mean impossible — it can still happen.", visual: { type: "spinner", wedges: [RED, RED, RED, BLUE] } },
  { prompt: "You predicted 'a number 1 to 6' and rolled a 4. What does the test show?", answer: "The prediction worked — 4 is one of the outcomes", options: ["The prediction worked — 4 is one of the outcomes", "The prediction failed", "4 is not on a die", "You need to roll again"], correct: "Yes. 4 is in 1 to 6, so the prediction held up.", wrong: "4 is one of the numbers 1 to 6, so the prediction was correct.", visual: { type: "die", face: 4 } },
  { prompt: "You predicted heads and tossed the coin once. It landed tails. What does the test show?", answer: "Tails was just as likely — one toss can go either way", options: ["Tails was just as likely — one toss can go either way", "The coin is broken", "Heads is impossible", "The toss does not count"], correct: "Right. Heads and tails are equally likely, so one toss can be either.", wrong: "A coin is 50/50, so a single toss can land tails even if you picked heads.", visual: { type: "coin", face: "tails" } },
]);

const w4l3 = poolGen([
  { prompt: "You predicted heads. The coin landed tails. Did it match?", answer: "No — but tails was still a fair result", options: ["No — but tails was still a fair result", "Yes — they matched", "No — tails is impossible", "Yes — tails counts as heads"], correct: "Right. It did not match, yet tails was always possible.", wrong: "Heads and tails differ, so it did not match — but tails could still happen.", visual: { type: "coin", face: "tails" } },
  { prompt: "You predicted 'a number 1 to 6'. You rolled a 3. Did it match?", answer: "Yes — 3 is in 1 to 6", options: ["Yes — 3 is in 1 to 6", "No — 3 is too small", "No — you needed a 6", "No — 3 is an unlucky number"], correct: "Yes. 3 is one of the numbers you predicted.", wrong: "Your prediction covered 1 to 6, and 3 is in that range, so it matched.", visual: { type: "die", face: 3 } },
  { prompt: "You predicted red (mostly-red spinner). It landed red. Did it match?", answer: "Yes — and red was the likely result", options: ["Yes — and red was the likely result", "No — red does not count", "Yes — but only by luck", "No — you must predict blue"], correct: "Right. It matched, and red was the most likely outcome anyway.", wrong: "You predicted red and got red, so it matched — and red was the likely result.", visual: { type: "spinner", wedges: [RED, RED, RED, BLUE] } },
]);

// ─────────────────────── Week 5: Repeated Experiments ────────────────────────
const w5l1 = poolGen([
  { prompt: "You will toss a coin 10 times. What is a fair way to record each toss?", answer: "Make a tally mark under heads or tails each time", options: ["Make a tally mark under heads or tails each time", "Only write down the heads", "Guess the total at the end", "Rub out results you do not like"], correct: "Yes. A tally mark for every toss keeps the record fair and complete.", wrong: "Record every toss with a tally mark so no results are missed.", visual: { type: "coin", face: "heads" } },
  { prompt: "You will spin this 4-colour spinner 20 times. What should you expect?", answer: "Each colour about 5 times", options: ["Each colour about 5 times", "All 20 the same colour", "Red exactly 20 times", "One colour on every spin"], correct: "Right. Equal sections should each come up roughly a quarter of the time.", wrong: "The sections are equal, so 20 spins should give each colour about 5.", visual: { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] } },
  { prompt: "Why do we repeat a chance experiment many times instead of once?", answer: "More trials give us a clearer picture of what usually happens", options: ["More trials give us a clearer picture of what usually happens", "One try is always enough", "To make the game last longer", "So the teacher stays busy"], correct: "Yes. Lots of trials show the pattern better than a single try.", wrong: "One trial can be luck; repeating many times shows what usually happens.", visual: { type: "die", face: 6 } },
]);

const w5l2 = poolGen([
  { prompt: "Toss a coin 10 times. Tally — Heads: 6, Tails: 4. Which happened more often?", answer: "Heads", options: ["Heads", "Tails", "They were equal", "You cannot tell"], correct: "Right. 6 is more than 4, so heads happened more.", wrong: "Compare the counts: 6 heads is more than 4 tails.", visual: { type: "coin", face: "heads" } },
  { prompt: "Roll a die 12 times. Tally — 1:1, 2:4, 3:2, 4:1, 5:3, 6:1. Which came up most?", answer: "2", options: ["2", "5", "6", "4"], correct: "Yes. The number 2 has the highest tally (4).", wrong: "Find the biggest count in the tally — 2 has 4, more than any other.", visual: { type: "die", face: 2 } },
  { prompt: "Draw and replace a counter 10 times. Tally — Red: 3, Blue: 7. Which happened more?", answer: "Blue", options: ["Blue", "Red", "They were equal", "You cannot tell"], correct: "Right. 7 blue is more than 3 red.", wrong: "Compare the tallies: 7 blue beats 3 red.", visual: { type: "bag", counters: [RED, RED, RED, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE] } },
  { prompt: "How many tally marks record seven spins?", answer: "Four crossed with three more", options: ["Four crossed with three more", "Seven separate circles", "One mark for all seven", "Two crossed groups of five"], correct: "Yes. A group of five (four crossed by one) plus two more makes seven.", wrong: "Tallies group in fives: a crossed group of five, then two more, is seven.", visual: { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] } },
]);

const w5l3 = poolGen([
  { prompt: "Spin a 4-colour spinner 16 times. Red:5, Blue:2, Green:5, Yellow:4. Which tied for most?", answer: "Red and green", options: ["Red and green", "Blue and yellow", "Only red", "Green and yellow"], correct: "Right. Red and green both have 5 — the highest count.", wrong: "Look for the two highest equal counts: red and green each have 5.", visual: { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] } },
  { prompt: "Toss two coins in two groups. Group A: 6 heads. Group B: 6 heads. What can you say?", answer: "Both groups got the same number of heads", options: ["Both groups got the same number of heads", "Group A cheated", "Coins never match", "Group B was luckier"], correct: "Yes. Equal tallies mean the two groups matched this time.", wrong: "Both tallies are 6, so the groups got the same result.", visual: { type: "coin", face: "heads" } },
  { prompt: "Roll a die 10 times. Tally — 6:0. What does a zero tally mean?", answer: "A 6 did not come up in these ten rolls", options: ["A 6 did not come up in these ten rolls", "A 6 is impossible", "The die is broken", "A 6 came up ten times"], correct: "Right. Zero means it just did not happen this time — not that it can't.", wrong: "A zero tally means it did not come up in these rolls, not that it is impossible.", visual: { type: "die", face: 6 } },
]);

// ─────────────────────── Week 6: Variation Investigation ─────────────────────
const w6l1 = poolGen([
  { prompt: "Group A gets 4 heads out of 10. Group B gets 7 heads out of 10. What does this show?", answer: "Results can vary between repeated trials", options: ["Results can vary between repeated trials", "One group did it wrong", "Coins never land tails", "Heads is impossible"], correct: "Right. The same experiment can give different results each time.", wrong: "Both groups did it properly — chance results simply vary from trial to trial.", visual: { type: "coin", face: "heads" } },
  { prompt: "You spin the same spinner twice: first red-heavy result, then blue-heavy. What is true?", answer: "The same experiment can turn out differently each time", options: ["The same experiment can turn out differently each time", "The spinner changed colours", "One result must be a mistake", "The spinner is broken"], correct: "Yes. Variation between trials is normal in chance.", wrong: "Nothing changed about the spinner — results just vary between trials.", visual: { type: "spinner", wedges: [RED, RED, BLUE, BLUE] } },
  { prompt: "Two groups roll the same die 12 times and get different totals. What should you conclude?", answer: "Different results are normal — that is variation", options: ["Different results are normal — that is variation", "The dice are unfair", "Only one group can be right", "Someone must have miscounted"], correct: "Right. Different totals across trials is exactly what variation means.", wrong: "The same fair die can give different totals — that difference is variation.", visual: { type: "die", face: 4 } },
]);

const w6l2 = poolGen([
  { prompt: "The whole class combines 100 tosses: Heads 52, Tails 48. What does this suggest?", answer: "Heads and tails are about equally likely", options: ["Heads and tails are about equally likely", "Heads always wins", "Tails is impossible", "The coin is unfair"], correct: "Yes. Over many tosses the counts get close to even — about 50/50.", wrong: "52 and 48 are very close, which suggests heads and tails are about equal.", visual: { type: "coin", face: "heads" } },
  { prompt: "Why do we combine everyone's results as a class?", answer: "More trials together give a clearer, fairer picture", options: ["More trials together give a clearer, fairer picture", "To make one group win", "So we can stop early", "To use up more paper"], correct: "Right. Pooling lots of trials smooths out the ups and downs.", wrong: "Combining results means many more trials, which shows the pattern more clearly.", visual: { type: "die", face: 5 } },
  { prompt: "The class spun an equal 4-colour spinner 40 times. Roughly what do you expect for each colour?", answer: "About 10 each", options: ["About 10 each", "All 40 red", "Exactly 7 each", "About 20 each"], correct: "Yes. Equal sections over 40 spins average about a quarter each — near 10.", wrong: "Equal sections share the 40 spins about evenly, so roughly 10 per colour.", visual: { type: "spinner", wedges: [RED, BLUE, GREEN, YELLOW] } },
]);

const w6l3 = poolGen([
  { prompt: "An equal red/blue spinner gave Red 6, Blue 4. Why did they not split evenly?", answer: "Chance results do not always split exactly evenly", options: ["Chance results do not always split exactly evenly", "Blue is impossible", "Red is certain", "The spinner is faulty"], correct: "Right. Even with equal chances, real trials wobble around the even split.", wrong: "Equal chances do not force an exact even split — real results vary a little.", visual: { type: "spinner", wedges: [RED, BLUE] } },
  { prompt: "You predicted blue but red came up. What is the best reflection?", answer: "A prediction can be sensible even when another outcome happens", options: ["A prediction can be sensible even when another outcome happens", "The prediction made red impossible", "Only wrong predictions have outcomes", "Red must have cheated"], correct: "Yes. A good prediction can still be beaten by a possible outcome.", wrong: "Your prediction was reasonable; another possible outcome just happened this time.", visual: { type: "spinner", wedges: [RED, RED, BLUE, BLUE] } },
  { prompt: "The class repeats a die experiment and gets different totals each time. What is worth discussing?", answer: "How and why the results varied across the trials", options: ["How and why the results varied across the trials", "Why dice have no outcomes", "Why the experiment was certain", "Which group is the best"], correct: "Right. Discussing the variation is the whole point of the investigation.", wrong: "The useful discussion is about the variation — how the results differed and why.", visual: { type: "die", face: 6 } },
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
  const seed = (week - 1) * 6 + lesson;
  // Teaching and the three activities all come from this lesson's own
  // generator (different rounds), so every card matches the lesson title while
  // still varying the question and shuffling the options.
  return {
    teaching: (ctx) => gen((ctx?.elapsedSeconds ?? 0) + seed, 0),
    activities: [
      (ctx) => gen((ctx?.elapsedSeconds ?? 0) + seed + 1, 0),
      (ctx) => gen((ctx?.elapsedSeconds ?? 0) + seed + 2, 0),
      (ctx) => gen((ctx?.elapsedSeconds ?? 0) + seed + 3, 0),
    ],
  };
}
