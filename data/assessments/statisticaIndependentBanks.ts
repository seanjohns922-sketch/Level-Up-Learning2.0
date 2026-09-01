import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { Question } from "./posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "./assessmentItemStandard";
import {
  getStatisticaAssessmentBlueprint,
  type StatisticaAssessmentKind,
  type StatisticaCognitiveDemand,
  type StatisticaDifficulty,
  type StatisticaLevel,
} from "./statisticaAssessmentBlueprint";

type AssessmentQuestion = Question & IndependentAssessmentItem;
type FormKey = `${StatisticaLevel}-${StatisticaAssessmentKind}`;

const CORRECT_TOKEN = "__statistica_task_correct__";
const COLOURS = ["#20b486", "#f2bc45", "#ef6f6c", "#6c63d9"];
const CONTEXTS = [
  "community garden harvest",
  "school energy survey",
  "local transport count",
  "wildlife observation",
  "sports recovery study",
  "reading challenge log",
  "water quality project",
  "festival visitor survey",
] as const;

function feedback() {
  return { correct: "Answer recorded.", wrong: "Answer recorded." };
}

function options(labels: readonly string[]) {
  return labels.map((label, index) => ({ id: String(index), label }));
}

function rows(seed: number, scale = 1) {
  return ["North", "East", "South", "West"].map((label, index) => ({
    id: label.toLowerCase(),
    label,
    color: COLOURS[index]!,
    count: (3 + ((seed * 2 + index * 3) % 6)) * scale,
  }));
}

function assessmentPrompt(level: number, form: StatisticaAssessmentKind, index: number, action: string) {
  if (level <= 2) return action;
  const check = form === "pretest" ? "starting check" : "mastery check";
  return `Year ${level} ${check}, ${CONTEXTS[(index + level + (form === "posttest" ? 3 : 0)) % CONTEXTS.length]}, evidence file ${index + 1}: ${action}`;
}

function levelOneData(index: number) {
  const datasets = [
    { context: "Favourite fruit survey", labels: ["Apples", "Bananas", "Pears", "Oranges"], counts: [12, 7, 9, 5] },
    { context: "Playground games survey", labels: ["Skipping", "Soccer", "Chase", "Handball"], counts: [6, 13, 8, 10] },
    { context: "Library choices", labels: ["Stories", "Facts", "Comics", "Poems"], counts: [11, 8, 14, 6] },
    { context: "Garden observations", labels: ["Bees", "Ants", "Birds", "Butterflies"], counts: [9, 15, 7, 12] },
  ] as const;
  const selected = datasets[index % datasets.length]!;
  return {
    context: selected.context,
    rows: selected.labels.map((label, rowIndex) => ({
      id: label.toLowerCase(),
      label,
      color: COLOURS[rowIndex]!,
      count: selected.counts[rowIndex]!,
    })),
  };
}

function levelOneTask(index: number): PracticeTask {
  const dataset = levelOneData(index);
  const data = dataset.rows;
  const greatest = [...data].sort((a, b) => b.count - a.count)[0]!;
  const fewest = [...data].sort((a, b) => a.count - b.count)[0]!;

  switch (index) {
    case 0:
      return {
        kind: "statisticaTally", mode: "read",
        prompt: assessmentPrompt(1, "posttest", index, "How many votes are shown by these tally marks?"),
        speakText: "Count the group of five, then count two more marks.", target: 7, count: 7, label: "votes",
        options: options(["5", "7", "9"]), correctOptionIds: ["1"], feedback: feedback(),
      };
    case 1:
      return {
        kind: "statisticaTally", mode: "read",
        prompt: assessmentPrompt(1, "posttest", index, "A class recorded tally marks for storybooks. How many storybook votes were recorded?"),
        speakText: "Count two complete groups of five, then two extra marks.", target: 12, count: 12, label: "storybook votes",
        options: options(["10", "15", "12"]), correctOptionIds: ["2"], feedback: feedback(),
      };
    case 2:
      return {
        kind: "statisticaTable", mode: "count",
        prompt: assessmentPrompt(1, "posttest", index, `Use the ${dataset.context.toLowerCase()} table. How many responses were recorded for ${greatest.label}?`),
        speakText: `Find the ${greatest.label} row and read its frequency.`, target: greatest.count, rows: data, answerCount: greatest.count, feedback: feedback(),
      };
    case 3:
      return {
        kind: "statisticaTally", mode: "record",
        prompt: assessmentPrompt(1, "posttest", index, "Nine children chose the garden club. Record 9 using tally marks."),
        speakText: "Make one complete group of five and four more tally marks.", target: 9, count: 9, label: "garden club votes", feedback: feedback(),
      };
    case 4:
      return {
        kind: "statisticaTally", mode: "record",
        prompt: assessmentPrompt(1, "posttest", index, "Fourteen insects were observed. Record 14 using tally marks."),
        speakText: "Make two complete groups of five and four more tally marks.", target: 14, count: 14, label: "insects", feedback: feedback(),
      };
    case 5:
      return {
        kind: "statisticaClassify",
        prompt: assessmentPrompt(1, "posttest", index, "Which question would collect useful data from the whole class?"),
        speakText: "Choose a clear question that every child can answer and that may have different responses.", target: 1,
        variable: "Planning a class fruit survey", examples: "We need one response from every child.",
        options: options(["What fruit does each child prefer?", "Are apples yummy?", "What is our teacher's name?"]), correctOptionIds: ["0"], feedback: feedback(),
      };
    case 6:
      return {
        kind: "statisticaClassify",
        prompt: assessmentPrompt(1, "posttest", index, "Which set of categories would organise how children travelled to school?"),
        speakText: "Choose categories that describe different ways of travelling and do not overlap.", target: 1,
        variable: "How did you travel to school today?", examples: "Each response must fit one clear group.",
        options: options(["Fast, fun, red", "Walk, car, bus, bike", "Monday, Tuesday, Wednesday"]), correctOptionIds: ["1"], feedback: feedback(),
      };
    case 7: {
      const categories = [
        { id: "bird", label: "Birds", color: COLOURS[0]! },
        { id: "insect", label: "Insects", color: COLOURS[1]! },
        { id: "other", label: "Other animals", color: COLOURS[2]! },
      ];
      const observations = [
        ["sparrow-1", "sparrow", "bird"], ["bee-1", "bee", "insect"], ["ant-1", "ant", "insect"],
        ["butterfly-1", "butterfly", "insect"], ["robin-1", "robin", "bird"], ["snail-1", "snail", "other"],
        ["bee-2", "bee", "insect"], ["lizard-1", "lizard", "other"], ["ant-2", "ant", "insect"],
      ] as const;
      return {
        kind: "statisticaCollect",
        prompt: assessmentPrompt(1, "posttest", index, "Collect every garden observation, then choose the category recorded most often."),
        speakText: "Tap every observation to collect it. Compare the category totals before answering.", target: observations.length,
        items: observations.map(([id, label, category]) => ({ id, label, category })), categories,
        question: "Which category was observed most often?", correctOptionIds: ["insect"], feedback: feedback(),
      };
    }
    case 8:
      return {
        kind: "statisticaSort",
        prompt: assessmentPrompt(1, "posttest", index, "Sort each food into the correct category so the data can be counted."),
        speakText: "Place each item into fruit or vegetable. Each item belongs in one category.", target: 8,
        categories: [
          { id: "fruit", label: "Fruit", color: COLOURS[0]! },
          { id: "vegetable", label: "Vegetables", color: COLOURS[1]! },
        ],
        items: [
          { id: "apple", label: "apple", category: "fruit" }, { id: "carrot", label: "carrot", category: "vegetable" },
          { id: "pear", label: "pear", category: "fruit" }, { id: "peas", label: "peas", category: "vegetable" },
          { id: "banana", label: "banana", category: "fruit" }, { id: "corn", label: "corn", category: "vegetable" },
          { id: "orange", label: "orange", category: "fruit" }, { id: "potato", label: "potato", category: "vegetable" },
        ], feedback: feedback(),
      };
    case 9:
      return {
        kind: "statisticaTable", mode: "select",
        prompt: assessmentPrompt(1, "posttest", index, `Use the ${dataset.context.toLowerCase()} table. Which category has the greatest frequency?`),
        speakText: "Read all four frequencies before selecting the greatest.", target: greatest.count, rows: data, correctRowId: greatest.id, feedback: feedback(),
      };
    case 10: {
      const buildData = [
        { id: "stories", label: "Stories", color: COLOURS[0]!, count: 6 },
        { id: "facts", label: "Facts", color: COLOURS[1]!, count: 10 },
        { id: "comics", label: "Comics", color: COLOURS[2]!, count: 8 },
      ];
      return {
        kind: "statisticaGraph", mode: "build",
        prompt: assessmentPrompt(1, "posttest", index, "Build a one-to-one picture display for the library choices."),
        speakText: "Add one picture for every response in each category.", target: 10, display: "pictures", categories: buildData, feedback: feedback(),
      };
    }
    case 11:
      return {
        kind: "statisticaGraph", mode: "read",
        prompt: assessmentPrompt(1, "posttest", index, `Read the ${dataset.context.toLowerCase()} display. How many responses are shown for ${fewest.label}?`),
        speakText: `Count one response for each picture in the ${fewest.label} category.`, target: fewest.count, display: "pictures", categories: data,
        options: options([String(fewest.count + 2), String(fewest.count), String(fewest.count - 1)]), correctOptionIds: ["1"], feedback: feedback(),
      };
    case 12:
      return {
        kind: "statisticaGraph", mode: "compare",
        prompt: assessmentPrompt(1, "posttest", index, `Compare the categories in the ${dataset.context.toLowerCase()} display. Which statement is true?`),
        speakText: "Compare the exact number of pictures in the named categories.", target: greatest.count, display: "pictures", categories: data,
        options: options([`${fewest.label} has more responses than ${greatest.label}.`, `${greatest.label} has more responses than ${fewest.label}.`, `${greatest.label} and ${fewest.label} are equal.`]),
        correctOptionIds: ["1"], feedback: feedback(),
      };
    case 13:
      return {
        kind: "statisticaTapGraph",
        prompt: assessmentPrompt(1, "posttest", index, `Tap the category chosen most often in the ${dataset.context.toLowerCase()}.`),
        speakText: "Compare all four columns and tap the tallest category.", target: greatest.count, ask: "most", display: "pictures", categories: data,
        correctCategoryId: greatest.id, feedback: feedback(),
      };
    case 14:
      return {
        kind: "statisticaTapGraph",
        prompt: assessmentPrompt(1, "posttest", index, `Tap the category chosen least often in the ${dataset.context.toLowerCase()}.`),
        speakText: "Compare all four columns and tap the shortest category.", target: fewest.count, ask: "fewest", display: "pictures", categories: data,
        correctCategoryId: fewest.id, feedback: feedback(),
      };
    case 15: {
      const compared = [greatest, fewest];
      return {
        kind: "statisticaGap",
        prompt: assessmentPrompt(1, "posttest", index, `How many more responses did ${greatest.label} receive than ${fewest.label}?`),
        speakText: "Match the equal parts, then count the pictures left over in the larger category.", target: greatest.count - fewest.count,
        categories: compared, largerCategoryId: greatest.id, difference: greatest.count - fewest.count, feedback: feedback(),
      };
    }
    case 16: {
      const ranked = data.slice(0, 3);
      const correctOrderIds = [...ranked].sort((left, right) => right.count - left.count).map((row) => row.id);
      return {
        kind: "statisticaRank",
        prompt: assessmentPrompt(1, "posttest", index, `Order the first three ${dataset.context.toLowerCase()} categories from most responses to least.`),
        speakText: "Compare all three frequencies, then tap the categories from greatest to smallest.", target: ranked.length,
        direction: "most-to-least", categories: ranked, correctOrderIds, feedback: feedback(),
      };
    }
    case 17:
      return {
        kind: "statisticaInference",
        prompt: assessmentPrompt(1, "posttest", index, `Which conclusion is supported by the ${dataset.context.toLowerCase()} display?`),
        speakText: "Choose only a conclusion that the displayed frequencies prove.", target: greatest.count, display: "pictures", categories: data,
        options: options(["Every category received the same number of responses.", `${greatest.label} was recorded most often in this group.`, `${greatest.label} will always be most popular everywhere.`]),
        correctOptionIds: ["1"], feedback: feedback(),
      };
    case 18:
      return {
        kind: "statisticaInference",
        prompt: assessmentPrompt(1, "posttest", index, `A student says, "${greatest.label} received the most responses because it is the best." What does the display actually support?`),
        speakText: "The display shows what was recorded, but it cannot prove why people made their choice.", target: greatest.count, display: "pictures", categories: data,
        options: options([`The display proves ${greatest.label} is best.`, `The display shows ${greatest.label} was recorded most often, but not why.`, "The display contains no useful information."]),
        correctOptionIds: ["1"], feedback: feedback(),
      };
    default:
      return {
        kind: "statisticaInference",
        prompt: assessmentPrompt(1, "posttest", index, `Which report answers the ${dataset.context.toLowerCase()} question without claiming more than the data shows?`),
        speakText: "Use the complete display and keep the conclusion about this group only.", target: greatest.count, display: "pictures", categories: data,
        options: options([`${greatest.label} was most frequent in this group, while ${fewest.label} was least frequent.`, `${greatest.label} is everyone's favourite everywhere.`, `${fewest.label} caused the other results to change.`]),
        correctOptionIds: ["0"], feedback: feedback(),
      };
  }
}

function levelTwoData(form: StatisticaAssessmentKind, index: number) {
  const datasets = form === "pretest"
    ? [
        { context: "Travel to school", labels: ["Walk", "Car", "Bus", "Bike"], counts: [8, 13, 7, 10] },
        { context: "Lunch choices", labels: ["Fruit", "Sandwich", "Salad", "Pasta"], counts: [11, 14, 6, 9] },
        { context: "Playground games", labels: ["Soccer", "Handball", "Skipping", "Chase"], counts: [12, 9, 7, 10] },
        { context: "Library choices", labels: ["Stories", "Facts", "Comics", "Poems"], counts: [13, 8, 15, 6] },
      ]
    : [
        { context: "Habitat observations", labels: ["Garden", "Pond", "Trees", "Grass"], counts: [16, 9, 13, 11] },
        { context: "After-school clubs", labels: ["Art", "Sport", "Music", "Coding"], counts: [12, 18, 15, 9] },
        { context: "Waste audit", labels: ["Paper", "Plastic", "Food", "Other"], counts: [17, 11, 14, 8] },
        { context: "Community transport", labels: ["Walking", "Cycling", "Bus", "Car"], counts: [10, 14, 12, 17] },
      ];
  const selected = datasets[index % datasets.length]!;
  return {
    context: selected.context,
    rows: selected.labels.map((label, rowIndex) => ({
      id: label.toLowerCase().replaceAll(" ", "-"), label, color: COLOURS[rowIndex]!, count: selected.counts[rowIndex]!,
    })),
  };
}

function levelTwoTask(form: StatisticaAssessmentKind, index: number): PracticeTask {
  const dataset = levelTwoData(form, index);
  const data = dataset.rows;
  const ordered = [...data].sort((a, b) => b.count - a.count);
  const greatest = ordered[0]!;
  const fewest = ordered.at(-1)!;
  const action = (pretest: string, posttest: string) => assessmentPrompt(2, form, index, form === "pretest" ? pretest : posttest);

  switch (index) {
    case 0: {
      const count = form === "pretest" ? 14 : 17;
      return {
        kind: "statisticaTally", mode: "read",
        prompt: action("How many children are shown by these tally marks?", "The wildlife team used tally marks. How many observations did they record?"),
        speakText: "Count each complete group as five, then add the extra marks.", target: count, count, label: form === "pretest" ? "children" : "wildlife observations",
        options: options(form === "pretest" ? ["9", "14", "15"] : ["15", "18", "17"]), correctOptionIds: [form === "pretest" ? "1" : "2"], feedback: feedback(),
      };
    }
    case 1:
      return {
        kind: "statisticaTable", mode: "count",
        prompt: action(`Use the ${dataset.context.toLowerCase()} table. How many responses were recorded for ${greatest.label}?`, `Use the ${dataset.context.toLowerCase()} table. Enter the exact frequency for ${greatest.label}.`),
        speakText: `Find the ${greatest.label} row and read its frequency.`, target: greatest.count, rows: data, answerCount: greatest.count, feedback: feedback(),
      };
    case 2:
      return {
        kind: "statisticaClassify",
        prompt: action("Which question would collect useful data about how students travel to school?", "Which question would produce categorical data that could improve the school playground?"),
        speakText: "Choose a clear question that can receive different category answers from many students.", target: 1,
        variable: form === "pretest" ? "Planning a travel survey" : "Planning a playground survey",
        examples: "Every student should be able to give one useful response.",
        options: options(form === "pretest"
          ? ["Is travelling fun?", "How did each student travel to school today?", "What time does school begin?"]
          : ["Which playground activity should be added?", "Is our playground the best?", "How old is the playground?"]),
        correctOptionIds: [form === "pretest" ? "1" : "0"], feedback: feedback(),
      };
    case 3:
      return {
        kind: "statisticaClassify",
        prompt: action("Which categories would organise favourite book choices without overlapping?", "A pet survey uses Dog, Cat and Animal. What is the problem with these categories?"),
        speakText: form === "pretest" ? "Choose groups that are clear and separate." : "A response should fit one category, not two categories.", target: 1,
        variable: form === "pretest" ? "Favourite kind of book" : "Pet survey categories",
        examples: form === "pretest" ? "Each book choice needs one group." : "A dog and a cat are also animals.",
        options: options(form === "pretest"
          ? ["Funny, blue, long", "Story, information, comic, poetry", "Book, reading, library"]
          : ["There are too many responses.", "The categories overlap.", "The categories use short words."]),
        correctOptionIds: [form === "pretest" ? "1" : "1"], feedback: feedback(),
      };
    case 4: {
      const count = form === "pretest" ? 13 : 18;
      return {
        kind: "statisticaTally", mode: "record",
        prompt: action("Thirteen students chose the art club. Record 13 with tally marks.", "Eighteen students chose an active lunch club. Record 18 with tally marks."),
        speakText: "Record the total in groups of five with any extra marks at the end.", target: count, count, label: "student choices", feedback: feedback(),
      };
    }
    case 5:
      return {
        kind: "statisticaClassify",
        prompt: action("A survey has Walk, Car and Bus. A student rode a bike. What should the class do?", "A habitat survey has Water, Land and Frog. How should the categories be repaired?"),
        speakText: "Choose a plan that lets every response fit one clear category.", target: 1,
        variable: "Checking survey categories", examples: form === "pretest" ? "One response does not fit yet." : "Frog overlaps with the habitat groups.",
        options: options(form === "pretest"
          ? ["Ignore the bike response.", "Count bike as walking.", "Add Bike or Other transport."]
          : ["Use Pond, Grassland and Woodland.", "Keep Water, Land and Frog.", "Remove every frog observation."]),
        correctOptionIds: [form === "pretest" ? "2" : "0"], feedback: feedback(),
      };
    case 6: {
      const categories = [
        { id: "active", label: "Active games", color: COLOURS[0]! },
        { id: "quiet", label: "Quiet games", color: COLOURS[1]! },
        { id: "creative", label: "Creative play", color: COLOURS[2]! },
      ];
      const raw = form === "pretest"
        ? [["soccer-1", "soccer", "active"], ["reading-1", "reading", "quiet"], ["drawing-1", "drawing", "creative"], ["chase-1", "chase", "active"], ["blocks-1", "blocks", "creative"], ["cards-1", "cards", "quiet"], ["soccer-2", "soccer", "active"], ["drawing-2", "drawing", "creative"], ["chase-2", "chase", "active"], ["reading-2", "reading", "quiet"]]
        : [["run-1", "running", "active"], ["chess-1", "chess", "quiet"], ["paint-1", "painting", "creative"], ["soccer-1", "soccer", "active"], ["cards-1", "cards", "quiet"], ["blocks-1", "blocks", "creative"], ["run-2", "running", "active"], ["paint-2", "painting", "creative"], ["soccer-2", "soccer", "active"], ["chess-2", "chess", "quiet"], ["run-3", "running", "active"], ["soccer-3", "soccer", "active"]];
      return {
        kind: "statisticaCollect",
        prompt: action("Collect every playground response, then identify the group counted most often.", "Collect all twelve activity observations, then use the counters to identify the most frequent category."),
        speakText: "Tap every observation, watch the category counters, then answer from the completed data.", target: raw.length,
        items: raw.map(([id, label, category]) => ({ id: id!, label: label!, category: category! })), categories,
        question: "Which category was recorded most often?", correctOptionIds: ["active"], feedback: feedback(),
      };
    }
    case 7:
      return {
        kind: "statisticaSort",
        prompt: action("Sort the transport responses into four clear categories.", "Sort the waste-audit observations so every item is counted in exactly one category."),
        speakText: "Place every response into its matching category and check that none are left out.", target: form === "pretest" ? 8 : 12,
        categories: form === "pretest"
          ? [{ id: "walk", label: "Walk", color: COLOURS[0]! }, { id: "car", label: "Car", color: COLOURS[1]! }, { id: "bus", label: "Bus", color: COLOURS[2]! }, { id: "bike", label: "Bike", color: COLOURS[3]! }]
          : [{ id: "paper", label: "Paper", color: COLOURS[0]! }, { id: "plastic", label: "Plastic", color: COLOURS[1]! }, { id: "food", label: "Food scraps", color: COLOURS[2]! }],
        items: (form === "pretest"
          ? [["walk-1", "walk", "walk"], ["car-1", "car", "car"], ["bus-1", "bus", "bus"], ["bike-1", "bike", "bike"], ["walk-2", "walk", "walk"], ["car-2", "car", "car"], ["bike-2", "bike", "bike"], ["bus-2", "bus", "bus"]]
          : [["newspaper", "newspaper", "paper"], ["bottle", "drink bottle", "plastic"], ["banana", "banana peel", "food"], ["worksheet", "worksheet", "paper"], ["wrapper", "food wrapper", "plastic"], ["apple", "apple core", "food"], ["box", "cardboard box", "paper"], ["cup", "plastic cup", "plastic"], ["bread", "bread crust", "food"], ["note", "note paper", "paper"], ["lid", "bottle lid", "plastic"], ["orange", "orange peel", "food"]])
          .map(([id, label, category]) => ({ id: id!, label: label!, category: category! })), feedback: feedback(),
      };
    case 8:
      return {
        kind: "statisticaTable", mode: "select",
        prompt: action(`Read the ${dataset.context.toLowerCase()} table. Select the category with the smallest frequency.`, `Use all four rows in the ${dataset.context.toLowerCase()} table. Select the category with the greatest frequency.`),
        speakText: "Compare every frequency before selecting the matching row.", target: form === "pretest" ? fewest.count : greatest.count, rows: data,
        correctRowId: form === "pretest" ? fewest.id : greatest.id, feedback: feedback(),
      };
    case 9:
      return {
        kind: "statisticaClassify",
        prompt: action("Which plan will count every student's lunch choice once?", "Which collection plan will produce trustworthy club-choice frequencies?"),
        speakText: "Choose a method that asks the intended group and records one response from each person.", target: 1,
        variable: "Choosing a fair collection plan", examples: "The final table needs one category response per student.",
        options: options(form === "pretest"
          ? ["Ask every student once and tally each answer.", "Ask three friends several times.", "Guess from the lunches you notice."]
          : ["Let students vote as many times as they want.", "Ask every class member once using the same categories.", "Only ask students already in a club."]),
        correctOptionIds: [form === "pretest" ? "0" : "1"], feedback: feedback(),
      };
    case 10: {
      const buildData = form === "pretest"
        ? [{ id: "walk", label: "Walk", color: COLOURS[0]!, count: 7 }, { id: "car", label: "Car", color: COLOURS[1]!, count: 10 }, { id: "bus", label: "Bus", color: COLOURS[2]!, count: 8 }]
        : [{ id: "art", label: "Art", color: COLOURS[0]!, count: 8 }, { id: "sport", label: "Sport", color: COLOURS[1]!, count: 12 }, { id: "music", label: "Music", color: COLOURS[2]!, count: 10 }];
      return {
        kind: "statisticaGraph", mode: "build",
        prompt: action("Build a column graph to match the transport frequency table.", "Construct an accurate column graph for the club survey."),
        speakText: "Set each column to the exact frequency shown for its category.", target: 12, display: "columns", categories: buildData, feedback: feedback(),
      };
    }
    case 11:
      return {
        kind: "statisticaGraph", mode: "read",
        prompt: action(`Read the ${dataset.context.toLowerCase()} graph. What is the exact frequency for ${data[2]!.label}?`, `Read the completed ${dataset.context.toLowerCase()} display. How many observations are shown for ${data[2]!.label}?`),
        speakText: `Find the ${data[2]!.label} column and read its exact height.`, target: data[2]!.count, display: "columns", categories: data,
        options: options([String(data[2]!.count - 2), String(data[2]!.count), String(data[2]!.count + 3)]), correctOptionIds: ["1"], feedback: feedback(),
      };
    case 12:
      return {
        kind: "statisticaGraph", mode: "compare",
        prompt: action(`Compare ${greatest.label} and ${fewest.label}. Which statement matches the graph?`, `Compare the exact frequencies in the ${dataset.context.toLowerCase()} graph. Which statement is accurate?`),
        speakText: "Read the named column heights, then choose the statement supported by those values.", target: greatest.count, display: "columns", categories: data,
        options: options([`${fewest.label} has ${greatest.count - fewest.count} more than ${greatest.label}.`, `${greatest.label} has ${greatest.count - fewest.count} more than ${fewest.label}.`, `${greatest.label} and ${fewest.label} have equal frequencies.`]),
        correctOptionIds: ["1"], feedback: feedback(),
      };
    case 13:
      return {
        kind: "statisticaTapGraph",
        prompt: action(`Tap the category chosen most often in the ${dataset.context.toLowerCase()} survey.`, `Tap the least frequent category in the ${dataset.context.toLowerCase()} data.`),
        speakText: form === "pretest" ? "Compare all four columns and tap the tallest." : "Compare all four columns and tap the shortest.",
        target: form === "pretest" ? greatest.count : fewest.count, ask: form === "pretest" ? "most" : "fewest", display: "pictures", categories: data,
        correctCategoryId: form === "pretest" ? greatest.id : fewest.id, feedback: feedback(),
      };
    case 14:
      return {
        kind: "statisticaGap",
        prompt: action(`How many more responses did ${greatest.label} receive than ${fewest.label}?`, `Find the difference between ${greatest.label} and ${fewest.label} in the ${dataset.context.toLowerCase()} data.`),
        speakText: "Compare the two frequencies and count the amount left after matching equal parts.", target: greatest.count - fewest.count,
        categories: [greatest, fewest], largerCategoryId: greatest.id, difference: greatest.count - fewest.count, feedback: feedback(),
      };
    case 15: {
      const ranked = data.slice(0, 3);
      const direction = form === "pretest" ? "most-to-least" as const : "least-to-most" as const;
      return {
        kind: "statisticaRank",
        prompt: action(`Order the first three ${dataset.context.toLowerCase()} categories from most frequent to least frequent.`, `Rank the first three ${dataset.context.toLowerCase()} categories from least frequent to most frequent.`),
        speakText: "Compare the exact frequencies before placing all three categories in order.", target: ranked.length, direction, categories: ranked,
        correctOrderIds: [...ranked].sort((a, b) => direction === "most-to-least" ? b.count - a.count : a.count - b.count).map((row) => row.id), feedback: feedback(),
      };
    }
    case 16:
      return {
        kind: "statisticaDisplayStudio", mode: "compare",
        prompt: action("Choose the display that makes the most and least popular lunch choices quickest to compare.", "Choose the display that makes every exact waste-audit frequency easiest to report."),
        speakText: form === "pretest" ? "Choose the display that makes column heights easy to compare." : "Choose the display that shows every exact number directly.", target: 1,
        question: form === "pretest" ? "Which choices were most and least popular?" : "What exact frequency was recorded for every waste category?",
        purpose: form === "pretest" ? "Make differences between category frequencies easy to see." : "Make every exact category frequency easy to read.",
        data: { labels: data.map((row) => row.label), values: data.map((row) => row.count), unit: "responses" },
        displayOptions: ["table", "column"], correctDisplay: form === "pretest" ? "column" : "table", feedback: feedback(),
      };
    case 17:
      return {
        kind: "statisticaInference",
        prompt: action(`Which conclusion is supported by the ${dataset.context.toLowerCase()} display?`, `Which report is fully supported by the ${dataset.context.toLowerCase()} display?`),
        speakText: "Use all four category frequencies and keep the conclusion about this recorded group.", target: greatest.count, display: "columns", categories: data,
        options: options([`${greatest.label} was most frequent in this group.`, `${greatest.label} will always be most popular.`, `The graph proves why people chose ${greatest.label}.`]),
        correctOptionIds: ["0"], feedback: feedback(),
      };
    case 18:
      return {
        kind: "statisticaInference",
        prompt: action(`A student says, "Everyone prefers ${greatest.label}." What does the display actually show?`, `A report says, "Choosing ${greatest.label} causes better results." What can the display justify?`),
        speakText: "Separate what the frequencies show from claims about everyone or about causes.", target: greatest.count, display: "columns", categories: data,
        options: options(form === "pretest"
          ? [`Everyone prefers ${greatest.label}.`, `${greatest.label} was recorded most often in this surveyed group.`, "No categories were recorded."]
          : [`The data proves ${greatest.label} causes better results.`, `${greatest.label} was most frequent, but the display cannot prove a cause.`, "The smallest category caused the largest category."]),
        correctOptionIds: ["1"], feedback: feedback(),
      };
    default:
      return {
        kind: "statisticaInference",
        prompt: action(`Which summary accurately reports both the greatest and smallest frequencies in the ${dataset.context.toLowerCase()} data?`, `Which final statement accurately compares the ${dataset.context.toLowerCase()} categories without exaggerating?`),
        speakText: "Check the complete display and choose the statement that matches the exact evidence.", target: greatest.count, display: "columns", categories: data,
        options: options([`${fewest.label} was most frequent and ${greatest.label} was least frequent.`, `${greatest.label} was most frequent and ${fewest.label} was least frequent in this group.`, `${greatest.label} is best everywhere because it has the tallest column.`]),
        correctOptionIds: ["1"], feedback: feedback(),
      };
  }
}

function levelThreeTask(form: StatisticaAssessmentKind, index: number): PracticeTask {
  const data = rows(index);
  const greatest = [...data].sort((a, b) => b.count - a.count)[0]!;
  if (index % 3 === 0) {
    const numerical = index % 2 === 0;
    return {
      kind: "statisticaClassify",
      prompt: assessmentPrompt(3, form, index, "classify the variable and identify the data needed."),
      speakText: "Decide whether each response is a category label or a whole-number count.", target: 1,
      variable: numerical ? "Number of seedlings that survived" : "Type of habitat observed",
      examples: numerical ? "7, 4, 9, 6" : "pond, tree, grassland, pond",
      supportingDetails: [{ label: "Investigation", value: "Use the variable that directly answers the stated question." }],
      options: options(["Categorical", "Discrete numerical"]), correctOptionIds: [numerical ? "1" : "0"], feedback: feedback(),
    };
  }
  if (index % 3 === 1) {
    const countMode = index % 2 === 1;
    return {
      kind: "statisticaTable", mode: countMode ? "count" : "select",
      prompt: assessmentPrompt(3, form, index, "complete the frequency-table reading."),
      speakText: "Match the named category with its exact frequency.", target: greatest.count, rows: data,
      answerCount: countMode ? greatest.count : undefined,
      correctRowId: countMode ? undefined : greatest.id,
      feedback: feedback(),
    };
  }
  return {
    kind: "statisticaInference",
    prompt: assessmentPrompt(3, form, index, "select the conclusion that answers the investigation question."),
    speakText: "A valid inference must be supported by the displayed data.", target: greatest.count, display: "columns", categories: data,
    options: options([`${greatest.label} occurred most often in this dataset.`, `${greatest.label} will always occur most often everywhere.`, "The data proves what caused the result."]), correctOptionIds: ["0"], feedback: feedback(),
  };
}

function levelFourTask(form: StatisticaAssessmentKind, index: number): PracticeTask {
  const scale = index % 2 === 0 ? 2 : 5;
  const data = rows(index, scale);
  const greatest = [...data].sort((a, b) => b.count - a.count)[0]!;
  if (index % 3 === 0) {
    return {
      kind: "statisticaPictograph", mode: index % 2 === 0 ? "build" : "read",
      prompt: assessmentPrompt(4, form, index, "apply the key to construct or read the many-to-one display."),
      speakText: `One symbol represents ${scale} observations.`, target: greatest.count, keyUnits: scale, unitNoun: "observations", symbolLabel: "marker", categories: data,
      options: index % 2 === 0 ? undefined : options([String(greatest.count - scale), String(greatest.count), String(greatest.count + scale)]),
      correctOptionIds: index % 2 === 0 ? undefined : ["1"], feedback: feedback(),
    };
  }
  if (index % 3 === 1) {
    return {
      kind: "statisticaGraph", mode: "build",
      prompt: assessmentPrompt(4, form, index, "construct the scaled column graph."),
      speakText: `The scale increases by ${scale}.`, target: greatest.count, display: "columns", categories: data, buildStep: scale, feedback: feedback(),
    };
  }
  const comparison = data.map((row, rowIndex) => ({ ...row, count: row.count + (rowIndex % 2 === 0 ? scale * 2 : -scale) }));
  return {
    kind: "statisticaShape", mode: "compare",
    prompt: assessmentPrompt(4, form, index, "compare concentration and variation across both distributions."),
    speakText: "Describe the complete pattern, not only the tallest column.", target: 1, display: "columns", categories: data, categoriesB: comparison,
    setLabelA: "Site A", setLabelB: "Site B", options: options(["Site B is more spread across categories.", "The distributions are identical.", "Colour determines variation."]), correctOptionIds: ["0"], feedback: feedback(),
  };
}

function levelFiveTask(form: StatisticaAssessmentKind, index: number): PracticeTask {
  if (index % 3 === 0) {
    const numerical = index % 2 === 0;
    return {
      kind: "statisticaClassify",
      prompt: assessmentPrompt(5, form, index, "classify and validate the dataset before analysis."),
      speakText: "Use the meaning of the field, then identify any missing or invalid record.", target: 1,
      variable: numerical ? "Number of visits per week" : "Satisfaction rating",
      examples: numerical ? "3, 5, missing, 4" : "low, medium, high, medium",
      supportingDetails: [{ label: "Quality check", value: "Do not silently treat missing data as zero." }],
      options: options(["Ordinal categorical", "Discrete numerical", "Continuous numerical"]), correctOptionIds: [numerical ? "1" : "0"], feedback: feedback(),
    };
  }
  const points = [10 + index, 13 + index, 17 + index, 15 + index, 20 + index].map((value, pointIndex) => ({ label: `T${pointIndex + 1}`, value }));
  if (index % 3 === 1) {
    return {
      kind: "statisticaLineGraph", mode: index % 2 === 0 ? "trend" : "infer",
      prompt: assessmentPrompt(5, form, index, "analyse the change over ordered time points."),
      speakText: "Read the exact values in time order before describing the pattern.", target: points[4]!.value, unit: "units", yLabel: "Recorded value", color: "#20b486", points,
      options: options(["The value rose, dipped, then reached its peak.", "The value stayed constant.", "The first point is the peak."]), correctOptionIds: ["0"], feedback: feedback(),
    };
  }
  return {
    kind: "statisticaDisplayStudio", mode: "design",
    prompt: assessmentPrompt(5, form, index, "choose and justify the display that best answers the brief."),
    speakText: "Select a display based on the question and ordered nature of the data.", target: 1,
    question: "How did the recorded value change over five ordered times?", purpose: "Reveal rises, falls and the overall trend.",
    data: { labels: points.map((point) => point.label), values: points.map((point) => point.value), unit: "units" }, displayOptions: ["line", "column", "table"], correctDisplay: "line", feedback: feedback(),
  };
}

function levelSixTask(form: StatisticaAssessmentKind, index: number): PracticeTask {
  if (index % 4 === 0) {
    const continuous = index % 2 === 0;
    return {
      kind: "statisticaClassify",
      prompt: assessmentPrompt(6, form, index, "classify the data and test whether the comparison method is fair."),
      speakText: "Distinguish a measurement from a count, then check that both groups used the same collection rule.", target: 1,
      variable: continuous ? "Recovery time in seconds" : "Number of completed circuits", examples: continuous ? "42.6, 39.8, 45.1" : "6, 8, 7",
      supportingDetails: [{ label: "Method", value: "Both groups were observed for the same period under the same conditions." }],
      options: options(["Continuous measurement", "Discrete count", "Categorical label"]), correctOptionIds: [continuous ? "0" : "1"], feedback: feedback(),
    };
  }
  if (index % 4 === 1) {
    const a = rows(index);
    const b = a.map((row, rowIndex) => ({ ...row, count: row.count + (rowIndex % 2 === 0 ? 3 : -1) }));
    return {
      kind: "statisticaShape", mode: "compare",
      prompt: assessmentPrompt(6, form, index, "compare mode, range and shape before judging the groups."),
      speakText: "Use several distribution features, not a single tallest bar.", target: 1, display: "columns", categories: a, categoriesB: b, setLabelA: "Group A", setLabelB: "Group B",
      options: options(["Group B is more variable and the groups have different shapes.", "The colours prove Group A is stronger.", "One peak is enough to describe both groups."]), correctOptionIds: ["0"], feedback: feedback(),
    };
  }
  const before = 70 + index;
  const after = 67 + index;
  const mediaMode = (["method", "conclusion", "distortion", "repair"] as const)[index % 4]!;
  return {
    kind: "statisticaMediaAnalysis", mode: mediaMode,
    prompt: assessmentPrompt(6, form, index, "audit the claim using the sample, exact values and representation."),
    speakText: "Analyse the evidence before deciding whether the claim is defensible.", target: 1,
    claim: "The new approach produced a dramatic improvement for everyone.",
    data: { title: "Reported result", labels: ["Before", "After"], values: [before, after], unit: "points" }, display: "columns", axisMin: index % 2 === 0 ? 65 : undefined,
    sample: "Fourteen volunteers from one participating group.", method: "Voluntary response, one collection day", evidenceNote: `The measured difference is ${before - after} points.`,
    options: options([`The broad claim is not justified; the sample is narrow and the ${before - after}-point change may be visually exaggerated.`, "Two bars prove the result applies to everyone.", "Matching colours make the method unbiased."]), correctOptionIds: ["0"], feedback: feedback(),
  };
}

function investigationTask(level: StatisticaLevel, form: StatisticaAssessmentKind, index: number): PracticeTask {
  return {
    kind: "statisticaClassify",
    prompt: assessmentPrompt(level, form, index, "choose the plan that can produce a defensible answer to the investigation question."),
    speakText: "Check the question, sample, variable, collection method and proposed conclusion together.",
    target: 1,
    variable: "Investigation plan",
    examples: "Question: How does travel time vary for students in our year level?",
    supportingDetails: [
      { label: "Evidence needed", value: "A defined sample, the same measurement rule and records from every participant." },
      { label: "Reporting rule", value: "The conclusion must stay within the group and conditions actually studied." },
    ],
    options: options([
      "Measure a defined sample using one rule, display all results, then qualify the conclusion.",
      "Ask only the fastest traveller and apply the result to everyone.",
      "Remove inconvenient results without recording why.",
    ]),
    correctOptionIds: ["0"],
    feedback: feedback(),
  };
}

function modeAndShapeTask(level: 5 | 6, form: StatisticaAssessmentKind, index: number): PracticeTask {
  const data = rows(index);
  const greatest = [...data].sort((a, b) => b.count - a.count)[0]!;
  return {
    kind: "statisticaShape",
    mode: "concentrated",
    prompt: assessmentPrompt(level, form, index, "identify the mode and select the description supported by the complete distribution."),
    speakText: "Find the greatest frequency, then inspect how the remaining values are distributed.",
    target: greatest.count,
    display: "columns",
    categories: data,
    options: options([
      `${greatest.label} is the mode, but the other frequencies still show variation.`,
      "The mode means every observation has that value.",
      "A distribution has no variation whenever it has a mode.",
    ]),
    correctOptionIds: ["0"],
    feedback: feedback(),
  };
}

function taskFor(level: StatisticaLevel, form: StatisticaAssessmentKind, index: number, descriptorCode: string) {
  if (level === 1) return levelOneTask(index);
  if (level === 2) return levelTwoTask(form, index);
  if (level === 3) {
    if (descriptorCode === "AC9M3ST03") return investigationTask(level, form, index);
    return levelThreeTask(form, descriptorCode === "AC9M3ST01" ? index * 3 + (index % 2) : index * 3 + 2);
  }
  if (level === 4) {
    if (descriptorCode === "AC9M4ST03") return investigationTask(level, form, index);
    return levelFourTask(form, descriptorCode === "AC9M4ST01" ? index * 3 + (index % 2) : index * 3 + 2);
  }
  if (level === 5) {
    if (descriptorCode === "AC9M5ST03") return investigationTask(level, form, index);
    if (descriptorCode === "AC9M5ST01") return index % 2 === 0 ? levelFiveTask(form, index * 3) : modeAndShapeTask(level, form, index);
    return levelFiveTask(form, index * 3 + 1);
  }
  if (descriptorCode === "AC9M6ST03") return investigationTask(level, form, index);
  if (descriptorCode === "AC9M6ST01") return index % 2 === 0 ? levelSixTask(form, index * 4) : modeAndShapeTask(level, form, index);
  return levelSixTask(form, index * 4 + 2);
}

function expandMix<T extends string>(mix: Record<T, number>): T[] {
  return Object.entries(mix).flatMap(([value, count]) => Array.from({ length: count as number }, () => value as T));
}

function difficulty(value: StatisticaDifficulty): AssessmentItemDifficulty {
  return value === "accessible" ? "easy" : value === "moderate" ? "moderate" : "challenging";
}

function cognition(value: StatisticaCognitiveDemand): AssessmentCognitiveCategory {
  return value;
}

function descriptorSlots(level: StatisticaLevel, form: StatisticaAssessmentKind) {
  const blueprint = getStatisticaAssessmentBlueprint(level)!;
  return blueprint.descriptors.flatMap((descriptor) =>
    Array.from({ length: descriptor.allocation[form] }, () => descriptor),
  );
}

function buildForm(level: StatisticaLevel, form: StatisticaAssessmentKind): AssessmentQuestion[] {
  const blueprint = getStatisticaAssessmentBlueprint(level)!;
  const formBlueprint = blueprint.forms.find((candidate) => candidate.kind === form);
  if (!formBlueprint) return [];
  const descriptors = descriptorSlots(level, form);
  const difficulties = expandMix(formBlueprint.difficultyMix);
  const cognitive = expandMix(formBlueprint.cognitiveMix);
  return Array.from({ length: 20 }, (_, index) => {
    const descriptor = descriptors[index]!;
    const task = taskFor(level, form, index, descriptor.code);
    const responseMode: AssessmentResponseMode = index < formBlueprint.selectedResponseMaximum ? "selected_response" : "manipulated_response";
    const cognitiveCategory = cognition(cognitive[index]!);
    const itemDifficulty = difficulty(difficulties[index]!);
    const week = descriptor.weeks[index % descriptor.weeks.length] ?? descriptor.weeks[0] ?? 1;
    const misconception = descriptor.misconceptionIds[index % Math.max(1, descriptor.misconceptionIds.length)];
    const shortForm = form === "pretest" ? "pre" : "post";
    const id = `statistica-y${level}-${shortForm}-q${String(index + 1).padStart(2, "0")}-v1`;
    return {
      schemaVersion: 1,
      id,
      version: "1.0.0",
      realm: "statistics",
      level,
      form,
      origin: "assessment_authored",
      sourcePool: form,
      bankId: `statistica-year-${level}-${form}-v1`,
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
      contextKey: `statistica-y${level}-${form}-${CONTEXTS[(index + level) % CONTEXTS.length].replaceAll(" ", "-")}-${index + 1}`,
      structureKey: `statistica-y${level}-${form}-${task.kind}-${"mode" in task ? String(task.mode) : "interaction"}-${index + 1}`,
      prompt: "prompt" in task ? task.prompt : `Statistica evidence task ${index + 1}`,
      renderer: { type: "statistica_assessment_task", payload: task },
      scoring: { kind: "interaction", correctResponse: CORRECT_TOKEN },
      statistics: createUncalibratedItemStatistics(itemDifficulty),
      type: "statisticaTask",
      correctAnswer: CORRECT_TOKEN,
      answer: CORRECT_TOKEN,
      skillId: descriptor.code.toLowerCase(),
      skillLabel: descriptor.description,
      linkedWeeks: [week],
      linkedLessons: [(index % 3) + 1],
      strand: "Statistics",
      curriculumCodes: [descriptor.code],
      difficultyBand: `year-${level}-statistica`,
      visual: { type: "statistica_assessment", taskKind: task.kind },
      practiceTask: task,
    };
  });
}

export const STATISTICA_INDEPENDENT_ASSESSMENT_FORMS: Record<FormKey, AssessmentQuestion[]> = Object.fromEntries(
  ([1, 2, 3, 4, 5, 6] as const).flatMap((level) =>
    (["pretest", "posttest"] as const)
      .filter((form) => !(level === 1 && form === "pretest"))
      .map((form) => [`${level}-${form}` as FormKey, buildForm(level, form)]),
  ),
) as Record<FormKey, AssessmentQuestion[]>;

export function getStatisticaIndependentAssessment(level: number, form: StatisticaAssessmentKind) {
  if (!Number.isInteger(level) || level < 1 || level > 6 || (level === 1 && form === "pretest")) return [];
  return STATISTICA_INDEPENDENT_ASSESSMENT_FORMS[`${level as StatisticaLevel}-${form}`] ?? [];
}
