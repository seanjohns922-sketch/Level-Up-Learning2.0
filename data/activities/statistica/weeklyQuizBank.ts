import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { STATISTICA_PROGRAMS } from "@/data/programs/statistica";

export type StatisticaQuizLevel = 1 | 2 | 3 | 4 | 5 | 6;

const CONTEXTS = [
  "class pets",
  "lunch choices",
  "playground games",
  "library books",
  "garden insects",
] as const;

const COLOURS = ["#20b486", "#f2bc45", "#ef6f6c", "#6c63d9"];

function feedback(correct: string, wrong: string) {
  return { correct, wrong };
}

function options(values: readonly string[]) {
  return values.map((label, index) => ({ id: String(index), label }));
}

function categories(variant: number, step = 1) {
  const base = [3, 5, 2, 4].map((value, index) => (value + ((variant + index) % 3)) * step);
  return ["A", "B", "C", "D"].map((label, index) => ({
    id: label.toLowerCase(),
    label: `${CONTEXTS[variant % CONTEXTS.length].split(" ")[0]} ${label}`,
    color: COLOURS[index]!,
    count: base[index]!,
  }));
}

function yearOneOrTwoTask(level: 1 | 2, week: number, lesson: number, variant: number): PracticeTask {
  const context = CONTEXTS[variant];
  const rows = categories(variant);
  const largest = [...rows].sort((a, b) => b.count - a.count)[0]!;
  const smallest = [...rows].sort((a, b) => a.count - b.count)[0]!;
  const title = STATISTICA_PROGRAMS[level][week - 1]!.lessons[lesson - 1]!.title;
  const stem = `Year ${level} ${title}: ${context}, set ${variant + 1}.`;

  if (week === 1) {
    const validQuestion = variant % 2 === 0
      ? `Which ${context} choice should we record?`
      : `Which question would collect useful ${context} data?`;
    return {
      kind: "statisticaClassify",
      prompt: `${stem} ${validQuestion}`,
      speakText: `Look at the examples and choose the useful category or question.`,
      target: 1,
      variable: level === 1 ? `A clear group for ${context}` : `A statistical question about ${context}`,
      examples: level === 1 ? "same kind, different kind, not sure" : "answers should vary across the class",
      options: options(level === 1 ? ["A clear category", "A person's name", "A random number"] : ["Which do you prefer?", "Is lunch good?", "What is my name?"]),
      correctOptionIds: ["0"],
      feedback: feedback("That choice can produce useful data.", "Choose the option that gives clear, variable responses."),
    };
  }

  if (week === 2) {
    if ((lesson + variant) % 2 === 0) {
      const count = 3 + variant + lesson;
      return {
        kind: "statisticaTally",
        mode: "read",
        prompt: `${stem} Read the tally for ${context}.`,
        speakText: `Count groups of five first, then any extra tally marks.`,
        target: count,
        count,
        label: context,
        options: options([String(count - 1), String(count), String(count + 2)]),
        correctOptionIds: ["1"],
        feedback: feedback("You read the tally accurately.", "Bundle the tally marks into fives, then count the extras."),
      };
    }
    return {
      kind: "statisticaTable",
      mode: "select",
      prompt: `${stem} Which row has the greatest frequency?`,
      speakText: `Compare the frequencies in every row before choosing.`,
      target: largest.count,
      rows,
      correctRowId: largest.id,
      feedback: feedback("You found the greatest frequency.", "Read every row and compare the numbers."),
    };
  }

  if (week === 3) {
    return {
      kind: "statisticaGraph",
      mode: lesson === 1 ? "build" : "read",
      prompt: `${stem} ${lesson === 1 ? "Build the display to match the data." : `How many are in ${largest.label}?`}`,
      speakText: `Each symbol represents one response.`,
      target: largest.count,
      display: level === 1 ? "pictures" : lesson === 2 ? "columns" : "pictures",
      categories: rows,
      options: lesson === 1 ? undefined : options([String(largest.count - 1), String(largest.count), String(largest.count + 1)]),
      correctOptionIds: lesson === 1 ? undefined : ["1"],
      feedback: feedback("The display matches the data.", "Use the scale and compare the category height with the axis."),
    };
  }

  if (week === 4) {
    if (lesson === 1) {
      return {
        kind: "statisticaTapGraph",
        prompt: `${stem} Tap the category with the most responses.`,
        speakText: `Compare the height of each category.`,
        target: largest.count,
        ask: "most",
        display: "pictures",
        categories: rows,
        correctCategoryId: largest.id,
        feedback: feedback("You identified the most common category.", "The tallest category has the most responses."),
      };
    }
    return {
      kind: "statisticaGap",
      prompt: `${stem} Find the difference between ${largest.label} and ${smallest.label}.`,
      speakText: `Count the unmatched part of the taller display.`,
      target: largest.count - smallest.count,
      categories: [largest, smallest],
      largerCategoryId: largest.id,
      difference: largest.count - smallest.count,
      feedback: feedback("You compared the two frequencies.", "Match equal parts first, then count what remains."),
    };
  }

  const trueClaim = `${largest.label} was chosen more often than ${smallest.label}.`;
  return {
    kind: "statisticaInference",
    prompt: `${stem} Which conclusion is supported by the display?`,
    speakText: `Use only the evidence shown in the graph.`,
    target: largest.count,
    display: level === 1 ? "pictures" : "columns",
    categories: rows,
    options: options([trueClaim, `${smallest.label} was most popular.`, "Everyone made the same choice."]),
    correctOptionIds: ["0"],
    feedback: feedback("That conclusion is supported by the frequencies.", "Compare the statement with the exact frequencies shown."),
  };
}

function yearThreeTask(week: number, lesson: number, variant: number): PracticeTask {
  const context = CONTEXTS[variant];
  const rows = categories(variant);
  const largest = [...rows].sort((a, b) => b.count - a.count)[0]!;
  const title = STATISTICA_PROGRAMS[3][week - 1]!.lessons[lesson - 1]!.title;
  if (week <= 2 || (week === 3 && lesson === 1)) {
    const numerical = (variant + lesson + week) % 2 === 0;
    return {
      kind: "statisticaClassify",
      prompt: `${title}: classify the ${context} data in case ${variant + 1}.`,
      speakText: `Decide whether the responses are names or labels, or numbers that count something.`,
      target: 1,
      variable: numerical ? `Number of ${context} choices per student` : `Favourite ${context} choice`,
      examples: numerical ? "2, 5, 3, 4" : "A, C, B, A",
      supportingDetails: [{ label: "Purpose", value: week === 2 ? "Answer a question where responses can vary." : "Choose the correct data type." }],
      options: options(["Categorical", "Discrete numerical"]),
      correctOptionIds: [numerical ? "1" : "0"],
      feedback: feedback("You used what the values mean, not just how they look.", "Ask whether each response is a label or a count."),
    };
  }
  if (week === 3) {
    return {
      kind: "statisticaTable",
      mode: lesson === 2 ? "count" : "select",
      prompt: `${title}: read the ${context} frequency table, case ${variant + 1}.`,
      speakText: `Use the row labels and frequencies together.`,
      target: largest.count,
      rows,
      answerCount: lesson === 2 ? largest.count : undefined,
      correctRowId: lesson === 2 ? undefined : largest.id,
      feedback: feedback("You read the table correctly.", "Trace across the named row to its frequency."),
    };
  }
  return {
    kind: "statisticaInference",
    prompt: `${title}: which conclusion answers the ${context} question in case ${variant + 1}?`,
    speakText: `Compare the complete display before selecting a conclusion.`,
    target: largest.count,
    display: lesson === 1 ? "pictures" : "columns",
    categories: rows,
    options: options([`${largest.label} is the modal category.`, "The display proves why students chose it.", "Every student agrees."]),
    correctOptionIds: ["0"],
    feedback: feedback("That conclusion follows from the displayed frequencies.", "A graph shows what happened, but it does not automatically explain why."),
  };
}

function yearFourTask(week: number, lesson: number, variant: number): PracticeTask {
  const context = CONTEXTS[variant];
  const step = week <= 2 ? 2 : 5;
  const rows = categories(variant, step);
  const largest = [...rows].sort((a, b) => b.count - a.count)[0]!;
  const title = STATISTICA_PROGRAMS[4][week - 1]!.lessons[lesson - 1]!.title;
  if (week <= 2) {
    const mode = lesson === 2 ? "build" : lesson === 3 ? "compare" : "read";
    return {
      kind: "statisticaPictograph",
      mode,
      prompt: `${title}: ${mode === "build" ? "build the pictograph from the frequencies" : `use the key to find the frequency for ${largest.label}`}, ${context} case ${variant + 1}.`,
      speakText: `One symbol represents ${step} responses. Use the key before answering.`,
      target: largest.count,
      keyUnits: step,
      unitNoun: "responses",
      symbolLabel: "star",
      categories: rows,
      options: lesson === 2 ? undefined : options([String(largest.count - step), String(largest.count), String(largest.count + step)]),
      correctOptionIds: lesson === 2 ? undefined : ["1"],
      feedback: feedback("You applied the many-to-one key.", `Count symbols and multiply by ${step}.`),
    };
  }
  if (week === 3) {
    return {
      kind: "statisticaGraph",
      mode: lesson === 2 ? "build" : "read",
      prompt: `${title}: analyse the scaled column graph for ${context}, case ${variant + 1}.`,
      speakText: `The vertical scale counts in fives.`,
      target: largest.count,
      display: "columns",
      categories: rows,
      buildStep: lesson === 2 ? step : undefined,
      options: lesson === 2 ? undefined : options([String(largest.count - step), String(largest.count), String(largest.count + step)]),
      correctOptionIds: lesson === 2 ? undefined : ["1"],
      feedback: feedback("You interpreted the scale accurately.", "Read the axis interval before comparing column heights."),
    };
  }
  const second = rows.map((row, index) => ({ ...row, count: row.count + (index % 2 === 0 ? step * 2 : -step) }));
  return {
    kind: "statisticaShape",
    mode: week === 5 ? "variation" : "compare",
    prompt: `${title}: compare the shape and variation of ${context}, case ${variant + 1}.`,
    speakText: `Look across the whole distribution, not only the tallest column.`,
    target: 1,
    display: "columns",
    categories: rows,
    categoriesB: second,
    setLabelA: "Group A",
    setLabelB: "Group B",
    options: options(["Group B has more variation.", "The groups are identical.", "Only the colours differ."]),
    correctOptionIds: ["0"],
    feedback: feedback("You compared the overall distributions.", "Variation describes how spread out the values are."),
  };
}

function yearFiveTask(week: number, lesson: number, variant: number): PracticeTask {
  const context = CONTEXTS[variant];
  const title = STATISTICA_PROGRAMS[5][week - 1]!.lessons[lesson - 1]!.title;
  if (week <= 2) {
    const discrete = (variant + lesson) % 2 === 0;
    return {
      kind: "statisticaClassify",
      prompt: `${title}: audit the ${context} field in dataset ${variant + 1}.`,
      speakText: `Classify what the values mean and check whether every entry is valid.`,
      target: 1,
      variable: discrete ? `Number of ${context} selections` : `Ranked ${context} preference`,
      examples: discrete ? "3, 2, missing, 4" : "first, second, fourth, third",
      supportingDetails: [{ label: "Data check", value: week === 2 ? "One record is missing or outside the agreed format." : "Use the meaning and order of the values." }],
      options: options(week === 2 ? ["Clean before analysing", "Treat missing as zero", "Ignore the issue"] : ["Ordinal categorical", "Discrete numerical", "Continuous numerical"]),
      correctOptionIds: [week === 2 ? "0" : discrete ? "1" : "0"],
      feedback: feedback("You checked the data before drawing a conclusion.", "Classify the variable and resolve invalid or missing entries first."),
    };
  }
  if (week === 3) {
    const rows = categories(variant);
    const largest = [...rows].sort((a, b) => b.count - a.count)[0]!;
    return {
      kind: "statisticaShape",
      mode: lesson === 3 ? "concentrated" : "compare",
      prompt: `${title}: identify the mode and describe the ${context} distribution, case ${variant + 1}.`,
      speakText: `Find the most frequent value, then inspect the distribution as a whole.`,
      target: largest.count,
      display: "columns",
      categories: rows,
      options: options([`${largest.label} is the mode.`, "There is no variation.", "Every category is equally frequent."]),
      correctOptionIds: ["0"],
      feedback: feedback("You identified the mode from the frequencies.", "The mode is the value or category with the greatest frequency."),
    };
  }
  const points = [
    { label: "Mon", value: 12 + variant },
    { label: "Tue", value: 15 + variant },
    { label: "Wed", value: 19 + variant },
    { label: "Thu", value: 17 + variant },
    { label: "Fri", value: 21 + variant },
  ];
  if (week === 4) {
    const mode = lesson === 1 ? "read" : lesson === 2 ? "trend" : "infer";
    return {
      kind: "statisticaLineGraph",
      mode,
      prompt: `${title}: ${mode === "read" ? "what value was recorded on Friday" : mode === "trend" ? "which statement describes the full trend" : "when did the series reach its peak"}? ${context}, series ${variant + 1}.`,
      speakText: `Follow the ordered points from left to right and use their exact values.`,
      target: points[4]!.value,
      unit: "responses",
      yLabel: "Frequency",
      color: "#20b486",
      points,
      options: options(lesson === 1 ? [String(points[2]!.value), String(points[3]!.value), String(points[4]!.value)] : lesson === 2 ? ["It rose, fell, then rose.", "It stayed constant.", "It only fell."] : ["Friday has the peak value.", "Monday has the peak value.", "No comparison is possible."]),
      correctOptionIds: [lesson === 1 ? "2" : "0"],
      feedback: feedback("You used the ordered values to analyse change.", "Read each point in time before describing the trend."),
    };
  }
  return {
    kind: "statisticaDisplayStudio",
    mode: lesson === 1 ? "match" : lesson === 2 ? "compare" : "design",
    prompt: `${title}: choose a display for ${context}, brief ${variant + 1}.`,
    speakText: `Choose the display that best answers the stated question.`,
    target: 1,
    question: "How did the total change across five ordered days?",
    purpose: "Make the direction and size of change easy to see.",
    data: { labels: points.map((point) => point.label), values: points.map((point) => point.value), unit: "responses" },
    displayOptions: ["line", "column", "table"],
    correctDisplay: "line",
    feedback: feedback("A line graph makes change across ordered time clear.", "Match the display to the purpose, not merely to data that it can technically show."),
  };
}

function yearSixTask(week: number, lesson: number, variant: number): PracticeTask {
  const context = CONTEXTS[variant];
  const title = STATISTICA_PROGRAMS[6][week - 1]!.lessons[lesson - 1]!.title;
  if (week === 1) {
    const continuous = (variant + lesson) % 2 === 0;
    return {
      kind: "statisticaClassify",
      prompt: `${title}: decide how to collect and compare ${context}, case ${variant + 1}.`,
      speakText: `Distinguish measurements from counts and check that the comparison is fair.`,
      target: 1,
      variable: continuous ? `Time spent on ${context}` : `Number of ${context} events`,
      examples: continuous ? "12.4, 15.8, 9.6 minutes" : "4, 7, 5 events",
      supportingDetails: [{ label: "Comparison rule", value: "Both groups must use the same definition and collection period." }],
      options: options(["Continuous measurement", "Discrete count", "Categorical label"]),
      correctOptionIds: [continuous ? "0" : "1"],
      feedback: feedback("You classified the data and protected the fairness of the comparison.", "Measurements can take values between whole numbers; counts cannot."),
    };
  }
  if (week <= 3) {
    const a = [2, 3, 3, 4, 8].map((value) => value + variant);
    const b = [1, 3, 4, 5, 7].map((value) => value + variant);
    const catsA = a.map((value, index) => ({ id: `a${index}`, label: String(index + 1), color: "#20b486", count: value }));
    const catsB = b.map((value, index) => ({ id: `b${index}`, label: String(index + 1), color: "#6c63d9", count: value }));
    return {
      kind: "statisticaShape",
      mode: week === 2 ? "variation" : "compare",
      prompt: `${title}: compare both ${context} distributions, case ${variant + 1}.`,
      speakText: `Use mode, range and shape together before selecting a conclusion.`,
      target: 1,
      display: "columns",
      categories: catsA,
      categoriesB: catsB,
      setLabelA: "Group A",
      setLabelB: "Group B",
      options: options(["Group A has a clearer peak while both groups vary.", "The colours prove Group B is better.", "One tallest bar describes the entire distribution."]),
      correctOptionIds: ["0"],
      feedback: feedback("You compared more than one feature of the distributions.", "Use mode, range and overall shape, not a single bar."),
    };
  }
  const earlier = 64 + variant;
  const current = 61 + variant;
  const axisMin = week === 5 ? 60 : undefined;
  return {
    kind: "statisticaMediaAnalysis",
    mode: week === 4 ? (lesson === 1 ? "method" : lesson === 2 ? "conclusion" : "defend") : lesson === 1 ? "distortion" : lesson === 2 ? "quantify" : "repair",
    prompt: `${title}: evaluate the ${context} report, case ${variant + 1}.`,
    speakText: `Compare the claim, collection method, exact values and visual scale.`,
    target: 1,
    claim: `The current result is unbelievably better than before.`,
    data: { title: `${context} result`, labels: ["Earlier", "Current"], values: [earlier, current], unit: "points" },
    display: "columns",
    axisMin,
    sample: week === 4 ? "The organiser asked 12 volunteers from its own club." : undefined,
    method: week === 4 ? "Voluntary response survey" : "Same measure on both dates",
    evidenceNote: `The exact difference is ${earlier - current} points.`,
    options: options(week === 4 ? ["The sample and method are too narrow for the broad claim.", "The claim is proven because two values are shown.", "The graph colour guarantees accuracy."] : [`The truncated axis exaggerates a ${earlier - current}-point difference.`, "Horizontal labels make the graph misleading.", "Different values are never allowed in a graph."]),
    correctOptionIds: ["0"],
    feedback: feedback("You tested the claim against the method, values and representation.", "Identify the precise source of distortion or weakness and quantify its effect."),
  };
}

function buildTask(level: StatisticaQuizLevel, week: number, lesson: number, variant: number): PracticeTask {
  if (level === 1 || level === 2) return yearOneOrTwoTask(level, week, lesson, variant);
  if (level === 3) return yearThreeTask(week, lesson, variant);
  if (level === 4) return yearFourTask(week, lesson, variant);
  if (level === 5) return yearFiveTask(week, lesson, variant);
  return yearSixTask(week, lesson, variant);
}

export function getStatisticaWeeklyQuizTasks(level: number, week: number): PracticeTask[] | null {
  if (!Number.isInteger(level) || level < 1 || level > 6 || !Number.isInteger(week) || week < 1 || week > 5) return null;
  const typedLevel = level as StatisticaQuizLevel;
  return [1, 2, 3].flatMap((lesson) =>
    Array.from({ length: 5 }, (_, variant) => buildTask(typedLevel, week, lesson, variant)),
  );
}

export const STATISTICA_WEEKLY_QUIZ_FORMS = ([1, 2, 3, 4, 5, 6] as const).flatMap((level) =>
  [1, 2, 3, 4, 5].map((week) => ({ level, week, tasks: getStatisticaWeeklyQuizTasks(level, week)! })),
);
