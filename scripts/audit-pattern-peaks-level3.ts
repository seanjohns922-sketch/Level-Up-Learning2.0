import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  PATTERN_PEAKS_PROGRAMS,
  PATTERN_PEAKS_SPINES,
  getPatternPeaksLessonConceptIntro,
  type PatternPeaksYearLabel,
} from "@/data/programs/patternPeaks";
import {
  generatePatternPeaksQuestion,
  isPatternPeaksQuestion,
  PATTERN_YEAR3_DOUBLE_STARTS,
  PATTERN_YEAR3_HALVING_FINAL_TERMS,
  PATTERN_YEAR3_WEEK3_RULE_LABELS,
  PATTERN_YEAR3_WEEK5_RECENT_WINDOW,
  PATTERN_YEAR3_WEEK7_FACTORS,
  PATTERN_YEAR3_WEEK7_LESSON3_TARGET_FACTORS,
  PATTERN_YEAR3_WEEK8_LESSON1_RULE_LABELS,
} from "@/data/activities/patternPeaks/generator";
import { buildLessonActivityPool, getLevelForLesson } from "@/data/activities/year2/lessonEngine";
import { REALM_REGISTRY } from "@/lib/realms/realm-registry";
import { isLessonQuestionSafe } from "@/lib/task-safety";
import { countInlineMathAnswerSlots } from "@/lib/inline-math-answer";
import { getPatternQuestionReadAloudText } from "@/lib/pattern-question-read-aloud";
import { getAllLegends } from "@/data/legends";

const root = process.cwd();
const descriptorSets: Record<PatternPeaksYearLabel, Set<string>> = {
  "Year 3": new Set(["AC9M3A01", "AC9M3A02", "AC9M3A03"]),
  "Year 4": new Set(["AC9M4A01", "AC9M4A02"]),
  "Year 5": new Set(["AC9M5A01", "AC9M5A02"]),
  "Year 6": new Set(["AC9M6A01", "AC9M6A02", "AC9M6A03"]),
};

const inlineTypedVisualTypes = new Set<string>();

for (const level of Object.keys(PATTERN_PEAKS_PROGRAMS) as PatternPeaksYearLabel[]) {
  const program = PATTERN_PEAKS_PROGRAMS[level];
  const levelNumber = Number(level.replace("Year ", ""));
  const allowedDescriptors = descriptorSets[level];
  const usedDescriptors = new Set<string>();
  const mechanics = new Set<string>();

  assert.equal(program.length, 8, `${level} must contain eight weeks.`);
  assert.equal(PATTERN_PEAKS_SPINES[level].length, 8, `${level} must contain eight week purposes.`);
  assert.equal(new Set(program.map((week) => week.topic)).size, 8, `${level} needs eight distinct topics.`);

  for (const [weekIndex, week] of program.entries()) {
    assert.equal(week.week, weekIndex + 1, `${level} week ${weekIndex + 1} is out of sequence.`);
    assert.equal(week.lessons.length, 3, `${level} week ${week.week} must contain three lessons.`);
    assert(PATTERN_PEAKS_SPINES[level][weekIndex]!.purpose.length >= 55, `${level} week ${week.week} needs a specific purpose.`);
    for (const [lessonIndex, currentLesson] of week.lessons.entries()) {
      assert.equal(currentLesson.id, `y${levelNumber}-algebra-w${week.week}-l${lessonIndex + 1}`, `${currentLesson.title} has a non-canonical id.`);
      assert(currentLesson.focus.length >= 55, `${level} ${currentLesson.title} needs a specific learning focus.`);
      assert.equal(currentLesson.activityIdeas.length, 3, `${level} ${currentLesson.title} needs three child-facing activity descriptions.`);
      assert.equal(currentLesson.config?.implementationStatus, "implemented", `${level} ${currentLesson.title} must be implemented.`);
      assert.equal(currentLesson.activityType, "pattern-peaks", `${level} ${currentLesson.title} must use the Pattern Peaks engine.`);
      assert(currentLesson.curriculum.every((code) => allowedDescriptors.has(code)), `${level} ${currentLesson.title} leaks outside ACARA Algebra ownership.`);
      const activities = currentLesson.activities ?? [];
      assert.equal(activities.length, 3, `${level} ${currentLesson.title} must have exactly three rotations.`);
      assert.deepEqual(
        new Set(activities.map((activity) => activity.config.rotationRole)),
        new Set(["fast_thinking", "reasoning", "apply_create"]),
        `${level} ${currentLesson.title} must include fast, reasoning and apply/create rotations.`,
      );
      const pool = buildLessonActivityPool(getLevelForLesson(currentLesson), currentLesson);
      assert.equal(pool.violations.length, 0, `${level} ${currentLesson.title} has rotation policy violations.`);
      assert.equal(pool.activities.length, 3, `${level} ${currentLesson.title} has an empty production activity pool.`);
      for (const activity of activities) {
        for (let sample = 0; sample < 25; sample += 1) {
          const question = generatePatternPeaksQuestion(getLevelForLesson(currentLesson), currentLesson, activity);
          assert(isPatternPeaksQuestion(question), `${level} ${currentLesson.title} leaked a non-Pattern question.`);
          assert.notEqual((question as { visual?: { type?: string } }).visual?.type, "mab", `${level} ${currentLesson.title} leaked a Number Nexus MAB visual.`);
          assert(isLessonQuestionSafe(activity, question), `${level} ${currentLesson.title} generated an unsafe ${String(activity.config.rotationRole)} question.`);
          assert("visual" in question && question.visual, `${level} ${currentLesson.title} generated a question without an algebra visual.`);
          assert("helper" in question && question.helper, `${level} ${currentLesson.title} generated a question without guided feedback.`);
          const completeSpeech = getPatternQuestionReadAloudText(question);
          assert(completeSpeech.includes(question.prompt), `${level} ${currentLesson.title} read-aloud omitted the prompt.`);
          assert(completeSpeech.includes(question.helper), `${level} ${currentLesson.title} read-aloud omitted the helper text.`);
          assert(
            completeSpeech.length > question.prompt.length + question.helper.length + 5,
            `${level} ${currentLesson.title} read-aloud omitted the visual information.`,
          );
          if (question.kind === "typed_response") {
            const slotCount = countInlineMathAnswerSlots(question.visual);
            assert(slotCount <= 1, `${level} ${currentLesson.title} generated ${slotCount} competing inline answer fields.`);
            if (slotCount === 1 && question.visual) inlineTypedVisualTypes.add(question.visual.type);
          }
        }
      }
      currentLesson.curriculum.forEach((code) => usedDescriptors.add(code));
      mechanics.add(String(currentLesson.config?.mechanic));
    }
  }
  assert.deepEqual(usedDescriptors, allowedDescriptors, `${level} does not cover its complete ACARA Algebra descriptor set.`);
  assert.equal(mechanics.size, 24, `${level} needs a distinct mechanic for every lesson blueprint.`);
}

for (const visualType of [
  "pattern_sequence_strip",
  "function_machine_card",
  "input_output_table",
  "expression_flow",
  "unknown_tile_equation",
  "bracket_equation_card",
  "inverse_step_card",
]) {
  assert(inlineTypedVisualTypes.has(visualType), `Pattern Peaks never generated an inline ${visualType} typed response.`);
}

const levelThreeDoubleOrHalve = PATTERN_PEAKS_PROGRAMS["Year 3"][0]!.lessons[1]!;
const doubleOrHalveQuestions = (levelThreeDoubleOrHalve.activities ?? []).flatMap((activity) =>
  Array.from({ length: 30 }, () => generatePatternPeaksQuestion(3, levelThreeDoubleOrHalve, activity)),
);
assert(
  doubleOrHalveQuestions.every((question) => question.kind === "typed_response"),
  "Year 3 Week 1 Lesson 2 must require students to type each numeric answer.",
);
assert(
  doubleOrHalveQuestions.every((question) => /^\d+$/.test(question.answer)),
  "Year 3 Week 1 Lesson 2 must produce whole-number answers.",
);
const doubleOrHalveRules = new Set(
  doubleOrHalveQuestions.flatMap((question) =>
    question.visual?.type === "pattern_sequence_strip"
      ? (question.visual.arrowLabels ?? []).filter((label): label is string => Boolean(label))
      : [],
  ),
);
assert(doubleOrHalveRules.has("Double"), "Year 3 Week 1 Lesson 2 must include doubling.");
assert(doubleOrHalveRules.has("Halve"), "Year 3 Week 1 Lesson 2 must include halving.");
assert(new Set(PATTERN_YEAR3_DOUBLE_STARTS).size >= 12, "Year 3 doubling needs a broad starting-number pool.");
assert(new Set(PATTERN_YEAR3_HALVING_FINAL_TERMS).size >= 8, "Year 3 halving needs a broad number pool.");

assert.equal(new Set(PATTERN_YEAR3_WEEK3_RULE_LABELS).size, 3, "Every Year 3 Week 3 lesson needs three distinct rules.");
for (const currentLesson of PATTERN_PEAKS_PROGRAMS["Year 3"][2]!.lessons) {
  const weekThreeQuestions = (currentLesson.activities ?? []).flatMap((activity) =>
    Array.from({ length: 100 }, () => generatePatternPeaksQuestion(3, currentLesson, activity)),
  );
  const generatedRules = new Set(
    weekThreeQuestions.flatMap((question) => {
      if (!("visual" in question)) return [];
      if (question.visual?.type === "function_machine_card") return [question.visual.rule];
      if (question.kind === "multiple_choice" && question.prompt === "Which rule matches every input-output pair?") {
        return [question.answer];
      }
      return [];
    }),
  );
  assert.deepEqual(
    generatedRules,
    new Set(PATTERN_YEAR3_WEEK3_RULE_LABELS),
    `Year 3 Week 3 ${currentLesson.title} must rotate through all three rules.`,
  );
  for (const question of weekThreeQuestions) {
    if ("visual" in question && question.visual?.type === "input_output_table") {
      assert(
        question.visual.pairs.every((pair) => Number(pair.input) >= 0 && Number(pair.output) >= 0),
        `Year 3 Week 3 ${currentLesson.title} generated a negative table value.`,
      );
    }
    if ("answer" in question && typeof question.answer === "string" && /^-?\d+$/.test(question.answer)) {
      assert(Number(question.answer) >= 0, `Year 3 Week 3 ${currentLesson.title} generated a negative answer.`);
    }
  }
}

const levelThreeInverseLesson = PATTERN_PEAKS_PROGRAMS["Year 3"][3]!.lessons[0]!;
for (const activity of levelThreeInverseLesson.activities ?? []) {
  for (let sample = 0; sample < 50; sample += 1) {
    const question = generatePatternPeaksQuestion(3, levelThreeInverseLesson, activity);
    assert("visual" in question && question.visual?.type === "inverse_step_card", "Year 3 Week 4 Lesson 1 needs its inverse visual.");
    if (question.kind === "multiple_choice") {
      assert(!question.visual.inverseOperation.includes("="), "The multiple-choice visual reveals the equation structure.");
      assert.notEqual(question.visual.inverseOperation, question.answer, "The inverse visual duplicates the correct multiple-choice option.");
    } else if (question.kind === "typed_response") {
      assert(question.visual.inverseOperation.includes("?"), "The typed inverse question needs its inline answer field.");
    }
  }
}

for (const currentLesson of PATTERN_PEAKS_PROGRAMS["Year 3"][4]!.lessons) {
  const typedActivity = (currentLesson.activities ?? []).find((activity) => activity.config.rotationRole === "apply_create")!;
  const consecutiveNumberSentences = Array.from(
    { length: PATTERN_YEAR3_WEEK5_RECENT_WINDOW },
    () => generatePatternPeaksQuestion(3, currentLesson, typedActivity),
  );
  const numberSignatures = consecutiveNumberSentences.map((question) => {
    assert("visual" in question && question.visual?.type === "unknown_tile_equation", "Week 5 typed work needs an equation visual.");
    return `${question.visual.left}=${question.visual.right}`;
  });
  assert.equal(
    new Set(numberSignatures).size,
    PATTERN_YEAR3_WEEK5_RECENT_WINDOW,
    `Year 3 Week 5 ${currentLesson.title} repeated a recent number sentence.`,
  );
}

const levelThreeMissingAddends = PATTERN_PEAKS_PROGRAMS["Year 3"][5]!.lessons[0]!;
for (const activity of levelThreeMissingAddends.activities ?? []) {
  for (let sample = 0; sample < 50; sample += 1) {
    const question = generatePatternPeaksQuestion(3, levelThreeMissingAddends, activity);
    assert.equal(question.kind, "typed_response", "Year 3 Week 6 Lesson 1 must use typed answers, not multiple choice.");
    assert("visual" in question && question.visual?.type === "unknown_tile_equation", "Missing Addends needs its inline equation visual.");
    assert.equal(countInlineMathAnswerSlots(question.visual), 1, "Missing Addends needs exactly one inline answer field.");
  }
}

const levelThreeMultiplicationPatterns = PATTERN_PEAKS_PROGRAMS["Year 3"][6]!.lessons[1]!;
const multiplicationPatternFactors = new Set<number>();
for (const activity of levelThreeMultiplicationPatterns.activities ?? []) {
  for (let sample = 0; sample < 40; sample += 1) {
    const question = generatePatternPeaksQuestion(3, levelThreeMultiplicationPatterns, activity);
    assert("visual" in question && question.visual, "Multiplication Fact Patterns needs a relationship visual.");
    assert.notEqual(question.visual.type, "array", "Multiplication Fact Patterns must not fall back to isolated arrays.");
    if (activity.config.rotationRole === "reasoning") {
      assert.equal(question.visual.type, "input_output_table", "The reasoning rotation must compare several multiplication facts.");
      const firstPair = question.visual.pairs[0]!;
      multiplicationPatternFactors.add(Number(firstPair.output) / Number(firstPair.input));
    } else {
      assert.equal(question.visual.type, "pattern_sequence_strip", "The fact-pattern rotation needs a product ladder.");
      const factorLabel = question.visual.arrowLabels?.[0];
      assert(typeof factorLabel === "string" && factorLabel.startsWith("+"), "The product ladder must show its constant increase.");
      multiplicationPatternFactors.add(Number(factorLabel.slice(1)));
      if (question.kind === "typed_response") {
        assert.equal(countInlineMathAnswerSlots(question.visual), 1, "The missing product must use one inline answer field.");
      }
    }
  }
}
assert.deepEqual(
  multiplicationPatternFactors,
  new Set(PATTERN_YEAR3_WEEK7_FACTORS),
  "Multiplication Fact Patterns must rotate the 3, 4, 5 and 10 fact families.",
);

const levelThreeNextFacts = PATTERN_PEAKS_PROGRAMS["Year 3"][6]!.lessons[2]!;
assert.equal(levelThreeNextFacts.title, "Use the Next Fact");
const nextFactFactors = new Set<number>();
for (const activity of levelThreeNextFacts.activities ?? []) {
  for (let sample = 0; sample < 40; sample += 1) {
    const question = generatePatternPeaksQuestion(3, levelThreeNextFacts, activity);
    assert.equal(question.kind, "typed_response", "Use the Next Fact must keep every response direct and typed.");
    assert("visual" in question && question.visual?.type === "expression_flow", "Use the Next Fact needs a clear one-step fact pathway.");
    const factorMatches = [...question.prompt.matchAll(/(\d+) ×/g)];
    const targetFactor = factorMatches.at(-1)?.[1];
    assert(targetFactor, "Use the Next Fact must name its target multiplication fact.");
    nextFactFactors.add(Number(targetFactor));
    assert.equal(countInlineMathAnswerSlots(question.visual), 1, "Use the Next Fact needs one inline answer field.");
    assert(!/halve|double|easiest/i.test(`${question.prompt} ${question.helper ?? ""}`), "Use the Next Fact must teach one consistent add-a-group strategy.");
  }
}
assert.deepEqual(
  nextFactFactors,
  new Set(PATTERN_YEAR3_WEEK7_LESSON3_TARGET_FACTORS),
  "Use the Next Fact must rotate the 2, 3, 4 and 5 fact families.",
);

const levelThreeInvestigation = PATTERN_PEAKS_PROGRAMS["Year 3"][7]!.lessons[0]!;
const investigationRules = new Set<string>();
for (const activity of levelThreeInvestigation.activities ?? []) {
  for (let sample = 0; sample < 24; sample += 1) {
    const question = generatePatternPeaksQuestion(3, levelThreeInvestigation, activity);
    assert("visual" in question && "answer" in question);
    assert.equal(question.visual?.type, "pattern_sequence_strip", "Plan and Test needs a number-pattern investigation.");
    assert.notEqual(question.visual?.type, "array", "Plan and Test must not fall back to an array.");
    if (activity.config.rotationRole === "fast_thinking") investigationRules.add(String(question.answer));
    if (question.kind === "typed_response") {
      assert.equal(countInlineMathAnswerSlots(question.visual), 1, "Plan and Test needs one inline missing term.");
    }
  }
}
assert.deepEqual(
  investigationRules,
  new Set(PATTERN_YEAR3_WEEK8_LESSON1_RULE_LABELS),
  "Plan and Test must rotate all eight Level 3 rules without getting stuck on the Week 3 set.",
);

const levelThreeCompareRules = PATTERN_PEAKS_PROGRAMS["Year 3"][7]!.lessons[1]!;
for (const activity of levelThreeCompareRules.activities ?? []) {
  for (let sample = 0; sample < 24; sample += 1) {
    const question = generatePatternPeaksQuestion(3, levelThreeCompareRules, activity);
    assert("visual" in question);
    assert.equal(question.visual?.type, "expression_flow", "Compare Two Rules needs a side-by-side rule comparison.");
    assert.equal(question.visual.cards.length, 2, "Compare Two Rules must show both rules together.");
    assert(!question.prompt.toLowerCase().includes("array"), "Compare Two Rules must not fall back to array work.");
    if (question.kind === "typed_response") {
      assert.equal(countInlineMathAnswerSlots(question.visual), 1, "Compare Two Rules needs one inline final value.");
    }
  }
}

for (const levelFourEqualityLesson of PATTERN_PEAKS_PROGRAMS["Year 4"][0]!.lessons.slice(0, 2)) {
  assert(
    (levelFourEqualityLesson.activities ?? []).every((activity) => activity.activityType === "typed_response"),
    `Year 4 ${levelFourEqualityLesson.title} must use typed unknown-number responses in every rotation.`,
  );
  for (const activity of levelFourEqualityLesson.activities ?? []) {
    for (let sample = 0; sample < 30; sample += 1) {
      const question = generatePatternPeaksQuestion(4, levelFourEqualityLesson, activity);
      assert.equal(question.kind, "typed_response", `Year 4 ${levelFourEqualityLesson.title} must ask for the unknown value directly.`);
      assert.equal(question.visual?.type, "unknown_tile_equation", `Year 4 ${levelFourEqualityLesson.title} needs an unknown-number equation.`);
      assert.equal(countInlineMathAnswerSlots(question.visual), 1, `Year 4 ${levelFourEqualityLesson.title} needs one inline answer field.`);
      assert(!/what must the equals sign|which equation proves/i.test(question.prompt), `Year 4 ${levelFourEqualityLesson.title} retained a conceptual multiple-choice prompt.`);
      assert(Number.isInteger(Number(question.answer)) && Number(question.answer) > 0, `Year 4 ${levelFourEqualityLesson.title} generated an invalid unknown.`);
      if (levelFourEqualityLesson.lesson === 2) {
        assert(question.visual.left.includes("+") && question.visual.right.includes("+"), "Balance Both Sides must present a number sentence on each side.");
      }
    }
  }
}

const levelFourAdditionUnknowns = PATTERN_PEAKS_PROGRAMS["Year 4"][1]!;
const movingUnknownForms = new Set<string>();
for (const currentLesson of levelFourAdditionUnknowns.lessons) {
  assert(
    (currentLesson.activities ?? []).every((activity) => activity.activityType === "typed_response"),
    `Year 4 Week 2 ${currentLesson.title} must use typed unknown-number responses in every rotation.`,
  );
  for (const activity of currentLesson.activities ?? []) {
    for (let sample = 0; sample < 30; sample += 1) {
      const question = generatePatternPeaksQuestion(4, currentLesson, activity);
      assert.equal(question.kind, "typed_response", `Year 4 Week 2 ${currentLesson.title} must ask for a number, not a conceptual choice.`);
      assert("visual" in question && question.visual);
      assert.equal(countInlineMathAnswerSlots(question.visual), 1, `Year 4 Week 2 ${currentLesson.title} needs one inline answer field.`);
      assert(Number.isInteger(Number(question.answer)) && Number(question.answer) > 0, `Year 4 Week 2 ${currentLesson.title} generated an invalid unknown.`);

      if (currentLesson.lesson === 1) {
        assert.equal(question.visual.type, "unknown_tile_equation", "Find the Missing Addend needs an equation model.");
        assert.equal(question.visual.left.split("+").length - 1, 2, "Find the Missing Addend must combine two known parts before the unknown.");
      } else if (currentLesson.lesson === 2) {
        assert.equal(question.visual.type, "unknown_tile_equation", "Unknowns Move Around needs an equation model.");
        const { left, right } = question.visual;
        const form = left.startsWith("□")
          ? "unknown-first-left"
          : /^\d+ \+ □$/.test(left) && /^\d+$/.test(right)
            ? "unknown-second-left"
            : /^\d+$/.test(left) && right.startsWith("□")
              ? "unknown-on-right"
              : right === "□"
                ? "unknown-whole"
                : "unknown-in-balanced-sentence";
        movingUnknownForms.add(form);
      } else {
        assert.equal(question.visual.type, "inverse_step_card", "Prove the Missing Value needs a visible inverse check.");
        assert(question.visual.equation.includes("□"), "Prove the Missing Value must retain the original unknown equation.");
        assert(question.visual.inverseOperation.includes("?"), "Prove the Missing Value must place the typed answer in the inverse check.");
      }
    }
  }
}
assert.deepEqual(
  movingUnknownForms,
  new Set(["unknown-first-left", "unknown-second-left", "unknown-on-right", "unknown-whole", "unknown-in-balanced-sentence"]),
  "Unknowns Move Around must rotate five genuinely different equation forms.",
);

const levelFourEquivalentEquations = PATTERN_PEAKS_PROGRAMS["Year 4"][3]!;
for (const currentLesson of levelFourEquivalentEquations.lessons) {
  assert(
    (currentLesson.activities ?? []).every((activity) => activity.activityType === "typed_response"),
    `Year 4 Week 4 ${currentLesson.title} must assess a numeric response after teaching the vocabulary.`,
  );
  for (const activity of currentLesson.activities ?? []) {
    for (let sample = 0; sample < 30; sample += 1) {
      const question = generatePatternPeaksQuestion(4, currentLesson, activity);
      assert.equal(question.kind, "typed_response", `Year 4 Week 4 ${currentLesson.title} must not quiz unexplained property names.`);
      assert.equal(question.visual?.type, "unknown_tile_equation", `Year 4 Week 4 ${currentLesson.title} needs a visible equivalent equation.`);
      assert.equal(countInlineMathAnswerSlots(question.visual), 1, `Year 4 Week 4 ${currentLesson.title} needs one inline numeric answer.`);
      assert(!/which property|why can the addends/i.test(question.prompt), `Year 4 Week 4 ${currentLesson.title} retained the vocabulary-first question.`);
      assert(Number.isInteger(Number(question.answer)) && Number(question.answer) > 0, `Year 4 Week 4 ${currentLesson.title} generated an invalid answer.`);
      const readAloudText = getPatternQuestionReadAloudText(question);
      assert(readAloudText.includes(question.prompt), `Year 4 Week 4 ${currentLesson.title} read-aloud omitted the prompt.`);
      assert(question.helper && readAloudText.includes(question.helper), `Year 4 Week 4 ${currentLesson.title} read-aloud omitted the property explanation.`);
      assert(readAloudText.includes("blank"), `Year 4 Week 4 ${currentLesson.title} read-aloud omitted the unknown position.`);
      const expectedTeachingWord = currentLesson.lesson === 1
        ? "commutative"
        : currentLesson.lesson === 2
          ? "associative"
          : "equivalent";
      assert(question.helper?.toLowerCase().includes(expectedTeachingWord), `Year 4 Week 4 ${currentLesson.title} must explain ${expectedTeachingWord} before expecting its use.`);
    }
  }
}

const levelFourWeekFourConcepts = levelFourEquivalentEquations.lessons.map((currentLesson) =>
  getPatternPeaksLessonConceptIntro("Year 4", 4, currentLesson.lesson),
);
assert.deepEqual(
  levelFourWeekFourConcepts.map((intro) => intro?.term),
  ["Commutative", "Associative", "Equivalent"],
  "Each Year 4 Week 4 lesson needs its own property introduction.",
);
for (const intro of levelFourWeekFourConcepts) {
  assert(intro?.meaning && intro.example && intro.exampleExplanation, "Every property introduction needs a meaning, example and explanation.");
  assert(intro.exampleExplanation.toLowerCase().includes("both sides equal"), "Each property example must make equality explicit.");
}
assert.equal(getPatternPeaksLessonConceptIntro("Year 4", 3, 1), undefined, "Property introductions must not leak into other weeks.");

const levelFiveFactorIntro = getPatternPeaksLessonConceptIntro("Year 5", 7, 1);
assert.equal(levelFiveFactorIntro?.term, "Factor", "Use Factor Clues must introduce the word factor before questioning begins.");
assert(levelFiveFactorIntro?.meaning.includes("Factors are numbers you multiply together to get a product"), "The factor introduction must begin with a child-friendly multiplication definition.");
assert(levelFiveFactorIntro?.meaning.toLowerCase().includes("no remainder"), "The factor introduction must explain exact division.");
assert.deepEqual(levelFiveFactorIntro?.factorModel?.pairs, [[1, 12], [2, 6], [3, 4]], "The factor introduction must show multiple factor-pair arrays.");
assert.equal(levelFiveFactorIntro?.factorModel?.nonFactor, 5, "The factor introduction must contrast a non-factor.");
const levelFiveMultipleIntro = getPatternPeaksLessonConceptIntro("Year 5", 7, 2);
assert.equal(levelFiveMultipleIntro?.term, "Multiple", "Use Multiple Clues must introduce the word multiple before questioning begins.");
assert(levelFiveMultipleIntro?.meaning.includes("product you get when you multiply"), "The multiple introduction must use a child-friendly multiplication definition.");
assert(levelFiveMultipleIntro?.meaning.includes("continue forever"), "The multiple introduction must explain that multiples do not stop.");
assert.deepEqual(levelFiveMultipleIntro?.multipleModel?.multipliers, [0, 1, 2, 3, 4, 5], "The multiple introduction must show repeated equal jumps from zero.");
assert.equal(levelFiveMultipleIntro?.multipleModel?.nonMultiple, 25, "The multiple introduction must contrast a non-multiple.");
assert.equal(getPatternPeaksLessonConceptIntro("Year 5", 7, 3), undefined, "Week 7 vocabulary introductions must not leak into Find All Solutions.");
const lessonConceptIntroSource = fs.readFileSync(path.join(root, "components/lesson/RealmLessonHome.tsx"), "utf8");
assert(lessonConceptIntroSource.includes("Factor pairs make exact arrays"), "The factor introduction is missing its visual factor-pair model.");
assert(lessonConceptIntroSource.includes("factorModelText"), "The factor-pair model must be included in read-aloud text.");
assert(lessonConceptIntroSource.includes("Multiples form equal jumps"), "The multiple introduction is missing its equal-jump model.");
assert(lessonConceptIntroSource.includes("multipleModelText"), "The multiple model must be included in read-aloud text.");

const levelFiveFactorClues = PATTERN_PEAKS_PROGRAMS["Year 5"][6]!.lessons[0]!;
assert(
  (levelFiveFactorClues.activities ?? []).every((activity) => activity.activityType === "typed_response"),
  "Use Factor Clues must use typed calculations in every rotation.",
);
for (const activity of levelFiveFactorClues.activities ?? []) {
  for (let sample = 0; sample < 40; sample += 1) {
    const question = generatePatternPeaksQuestion(5, levelFiveFactorClues, activity);
    assert.equal(question.kind, "typed_response", "Use Factor Clues retained a multiple-choice recognition task.");
    assert(Number.isInteger(Number(question.answer)) && Number(question.answer) > 0, "Use Factor Clues generated an invalid numeric answer.");
    assert(!/which number|not a factor|type a factor/i.test(question.prompt), "Use Factor Clues retained a bland factor-selection prompt.");
    assert.equal(countInlineMathAnswerSlots(question.visual), 1, "Use Factor Clues needs one inline numeric answer field.");
    if (activity.config.rotationRole === "apply_create") {
      assert.equal(question.visual?.type, "factor_pair_tree", "The apply/create rotation must use the factor-pair tree.");
      if (question.visual?.type === "factor_pair_tree") {
        assert(question.visual.pairs.length >= 4, "The factor-pair tree must show the complete set of branches.");
        assert.equal(
          question.visual.pairs.filter((pair) => pair.left === "?" || pair.right === "?").length,
          1,
          "The factor-pair tree must contain exactly one incomplete branch.",
        );
      }
    } else if (activity.config.rotationRole === "reasoning") {
      assert.equal(question.visual?.type, "unknown_tile_equation", "Missing factor partners need a visible multiplication equation.");
    } else {
      assert.equal(question.visual?.type, "expression_flow", "The factor scanner needs a visible exact-division check.");
    }
    const speech = getPatternQuestionReadAloudText(question);
    assert(speech.includes(question.prompt) && speech.includes("blank"), "Use Factor Clues read-aloud must include the question and missing value.");
  }
}
const factorPairTreeSource = fs.readFileSync(path.join(root, "components/activities/FactorPairTreeVisual.tsx"), "utf8");
assert(factorPairTreeSource.includes("Factor pairs"), "The factor-pair tree renderer is missing its branch label.");
assert(factorPairTreeSource.includes("InlineMathAnswerInput"), "The factor-pair tree must accept the answer inside the missing branch.");

const levelFiveFindAllSolutions = PATTERN_PEAKS_PROGRAMS["Year 5"][6]!.lessons[2]!;
assert(
  (levelFiveFindAllSolutions.activities ?? []).every((activity) => activity.activityType === "typed_response"),
  "Find All Solutions must use typed factor-tree tasks in every rotation.",
);
for (const activity of levelFiveFindAllSolutions.activities ?? []) {
  for (let sample = 0; sample < 40; sample += 1) {
    const question = generatePatternPeaksQuestion(5, levelFiveFindAllSolutions, activity);
    assert.equal(question.kind, "typed_response", "Find All Solutions retained a multiple-choice list task.");
    assert.equal(question.visual?.type, "factor_pair_tree", "Find All Solutions must always show the complete factor-pair structure.");
    assert(!/which lists|which is a factor pair/i.test(question.prompt), "Find All Solutions retained a bland selection prompt.");
    assert(!question.helper?.startsWith("List them:"), "Find All Solutions must not reveal every answer in its helper.");
    if (question.visual?.type === "factor_pair_tree") {
      for (const pair of question.visual.pairs) {
        if (pair.left !== "?" && pair.right !== "?") {
          assert.equal(Number(pair.left) * Number(pair.right), question.visual.product, "The factor-pair tree contains a false branch.");
        }
      }
    }
    const slotCount = countInlineMathAnswerSlots(question.visual);
    assert.equal(slotCount, activity.config.rotationRole === "apply_create" ? 0 : 1, "Find All Solutions generated the wrong number of inline fields.");
    const speech = getPatternQuestionReadAloudText(question);
    assert(speech.includes(question.prompt) && speech.includes("Factor pairs"), "Find All Solutions read-aloud omitted the visual tree.");
  }
}

const levelFiveConstructEquivalent = PATTERN_PEAKS_PROGRAMS["Year 5"][3]!.lessons[2]!;
for (const activity of levelFiveConstructEquivalent.activities ?? []) {
  for (let sample = 0; sample < 30; sample += 1) {
    const question = generatePatternPeaksQuestion(5, levelFiveConstructEquivalent, activity);
    assert(!/must ___|\bhalve\b.*\bdouble\b.*\bkeep\b/i.test(question.prompt), "Construct an Equivalent retained a vocabulary-choice blank.");
    if (activity.config.rotationRole === "fast_thinking") {
      assert.equal(question.kind, "typed_response", "Construct an Equivalent fast thinking must require a numeric answer.");
      assert.equal(question.visual?.type, "expression_flow", "Construct an Equivalent needs the original and equivalent expressions together.");
      assert.equal(countInlineMathAnswerSlots(question.visual), 1, "Construct an Equivalent needs one inline missing-factor field.");
      assert(Number.isInteger(Number(question.answer)) && Number(question.answer) > 0, "Construct an Equivalent generated an invalid missing factor.");
    }
  }
}

const levelFiveMultiplicationProperties = PATTERN_PEAKS_PROGRAMS["Year 5"][4]!;
for (const currentLesson of levelFiveMultiplicationProperties.lessons) {
  assert(
    (currentLesson.activities ?? []).every((activity) => activity.activityType === "typed_response"),
    `Year 5 Week 5 ${currentLesson.title} must assess calculations instead of opinion or yes/no choices.`,
  );
  for (const activity of currentLesson.activities ?? []) {
    for (let sample = 0; sample < 30; sample += 1) {
      const question = generatePatternPeaksQuestion(5, currentLesson, activity);
      assert.equal(question.kind, "typed_response", `Year 5 Week 5 ${currentLesson.title} must require a numeric response.`);
      assert(Number.isInteger(Number(question.answer)) && Number(question.answer) > 0, `Year 5 Week 5 ${currentLesson.title} generated an invalid numeric answer.`);
      assert(!/which pair is easiest|does regrouping|can you regroup|are .* equal|why is/i.test(question.prompt), `Year 5 Week 5 ${currentLesson.title} retained a subjective or recall-only prompt.`);
      if (currentLesson.lesson === 1) {
        assert.equal(question.visual?.type, "array", "Turn the Array must show an array model.");
        if (question.visual?.type === "array") {
          assert.equal(question.visual.rotatable, true, "Turn the Array must let the student physically turn the model.");
        }
      } else {
        assert.equal(question.visual?.type, "expression_flow", `${currentLesson.title} needs a visible calculation.`);
        assert.equal(countInlineMathAnswerSlots(question.visual), 1, `${currentLesson.title} needs one inline numeric answer.`);
      }
    }
  }
}

const arrayVisualSource = fs.readFileSync(path.join(root, "components/activities/ArrayVisual.tsx"), "utf8");
assert(arrayVisualSource.includes("↻ Turn array"), "The array visual is missing its student-controlled turn action.");
assert(arrayVisualSource.includes("displayRows = turned ? cols : rows"), "Turning the array must swap its rows and columns.");
assert(arrayVisualSource.includes("Tap either coloured section"), "The split array must let students isolate each partial product.");

const levelFiveDistributiveReasoning = PATTERN_PEAKS_PROGRAMS["Year 5"][5]!.lessons.slice(0, 2);
for (const currentLesson of levelFiveDistributiveReasoning) {
  assert(
    (currentLesson.activities ?? []).every((activity) => activity.activityType === "typed_response"),
    `Year 5 Week 6 ${currentLesson.title} must use objective numeric responses.`,
  );
  for (const activity of currentLesson.activities ?? []) {
    for (let sample = 0; sample < 30; sample += 1) {
      const question = generatePatternPeaksQuestion(5, currentLesson, activity);
      assert.equal(question.kind, "typed_response", `Year 5 Week 6 ${currentLesson.title} retained a multiple-choice shortcut.`);
      assert(Number.isInteger(Number(question.answer)) && Number(question.answer) > 0, `Year 5 Week 6 ${currentLesson.title} generated an invalid answer.`);
      assert(!/which friendly fact|which shows/i.test(question.prompt), `Year 5 Week 6 ${currentLesson.title} retained a recognition-only prompt.`);
      if (currentLesson.lesson === 1) {
        assert.equal(question.visual?.type, "array", "Split an Array must show a real array instead of only a bracketed expression.");
        if (question.visual?.type === "array") {
          assert.equal(question.visual.splitAfterColumns, 10, "Split an Array must visibly partition the ten fact from the extra columns.");
          assert(question.visual.columns > question.visual.splitAfterColumns, "Split an Array must show both coloured sections.");
        }
      } else {
        assert.equal(question.visual?.type, "expression_flow", "Build from Friendly Numbers needs a visible calculation.");
        assert.equal(countInlineMathAnswerSlots(question.visual), 1, "Build from Friendly Numbers needs one inline numeric answer.");
      }
    }
  }
}

assert.equal(REALM_REGISTRY.pattern.status, "coming_soon", "Pattern Peaks must remain review-only.");
assert.equal(REALM_REGISTRY.pattern.isSelectable, false, "Pattern Peaks must not be selectable by students yet.");
assert.equal(REALM_REGISTRY.pattern.totalWeeks, 8, "Pattern Peaks needs the agreed eight-week contract.");
assert.deepEqual(REALM_REGISTRY.pattern.levelLabels, ["Year 3", "Year 4", "Year 5", "Year 6"]);

for (const asset of [
  "public/images/patternpeaks-home-bg-y3.jpeg",
  "public/images/patternpeaks-home-bg-y4.jpeg",
  "public/images/patternpeaks-home-bg-y5.jpeg",
  "public/images/patternpeaks-home-bg-y6.jpeg",
  "public/cards/patternox-wigglecode-y3-front.png",
  "public/cards/patternox-wigglecode-y3-back.png",
  "public/cards/patternox-sequencer-y4-front.png",
  "public/cards/patternox-sequencer-y4-back.png",
  "public/cards/patternox-solver-y5-front.png",
  "public/cards/patternox-solver-y5-back.png",
  "public/cards/patternox-codemaster-y6-front.png",
  "public/cards/patternox-codemaster-y6-back.png",
  "public/videos/legends/patternox-wigglecode.mp4",
  "public/videos/legends/patternox-sequencer.mp4",
  "public/videos/legends/patternox-solver.mp4",
  "public/videos/legends/patternox-codemaster.mp4",
]) {
  assert(fs.existsSync(path.join(root, asset)), `${asset} is missing.`);
}

const demoPanel = fs.readFileSync(path.join(root, "components/demo/DemoReviewPanel.tsx"), "utf8");
assert(demoPanel.includes('{ id: "pattern", label: "Pattern Peaks"'), "Demo Review does not expose Pattern Peaks.");
assert(demoPanel.includes("/pattern-peaks/program?teacher_preview=1"), "Demo Review does not expose Pattern Peaks program previews.");
assert(demoPanel.includes("? levelNumber >= 3"), "Demo Review does not expose the Level 4-6 program blueprints.");
assert(demoPanel.includes("/pattern-peaks/lesson/"), "Demo Review does not expose Pattern Peaks lessons.");
assert(demoPanel.includes('"/legends/pattern-peaks"'), "Demo Review does not expose all Patternox videos.");

const programPreview = fs.readFileSync(path.join(root, "components/pattern-peaks/PatternPeaksProgramPreview.tsx"), "utf8");
assert(programPreview.includes("/pattern-peaks/lesson/"), "Pattern Peaks week cards do not link to implemented lessons.");
assert(programPreview.includes("PATTERNOX_VIDEOS"), "Patternox cards do not expose their showcase videos.");

const patternoxLegends = getAllLegends("pattern-peaks");
assert.equal(patternoxLegends.length, 4, "Pattern Peaks must expose four Level 3-6 Patternox cards.");
assert.deepEqual(
  patternoxLegends.map((legend) => legend.yearLabel),
  ["Year 3", "Year 4", "Year 5", "Year 6"],
  "Patternox cards must cover Levels 3-6 in order.",
);
for (const legend of patternoxLegends) {
  assert(legend.showcaseVideoUrl, `${legend.name} is missing its showcase video.`);
  assert(legend.unlockVideoUrl, `${legend.name} is missing its unlock video.`);
  assert.equal(legend.showcaseVideoUrl, legend.unlockVideoUrl, `${legend.name} must use the same canonical video in both card flows.`);
}

const legendsHall = fs.readFileSync(path.join(root, "app/legends/page.tsx"), "utf8");
assert(legendsHall.includes('route: "/legends/pattern-peaks"'), "The Hall of Legends does not link to the Patternox collection.");
assert(legendsHall.includes('realm.id === "pattern-peaks"'), "Patternox cards are not unlocked in Demo Mode.");
const patternoxCollection = fs.readFileSync(path.join(root, "app/legends/pattern-peaks/page.tsx"), "utf8");
assert(patternoxCollection.includes("isDemoPreviewMode"), "The Patternox collection is not demo-gated.");
assert(patternoxCollection.includes("LegendDetailModal"), "Patternox cards do not use the standard video-enabled card detail.");
const lessonShell = fs.readFileSync(path.join(root, "components/pattern-peaks/PatternPeaksLessonShell.tsx"), "utf8");
assert(lessonShell.includes("Year2LessonEngine"), "Pattern Peaks lessons do not use the shared reviewed lesson engine.");
assert(lessonShell.includes("generatePatternPeaksQuestion"), "Pattern Peaks lessons do not use their curriculum generator.");
assert(lessonShell.includes("isQuestionCompatible={isPatternPeaksQuestion}"), "Pattern Peaks does not reject incompatible saved or generated questions.");
const typedResponseActivity = fs.readFileSync(path.join(root, "components/activities/TypedResponseActivity.tsx"), "utf8");
assert(typedResponseActivity.includes("hasInlineVisualInput"), "Typed Pattern Peaks questions do not place the answer field in the visual's missing value.");
const multipleChoiceActivity = fs.readFileSync(path.join(root, "components/activities/MultipleChoiceActivity.tsx"), "utf8");
assert(multipleChoiceActivity.includes("compactPatternOptions"), "Short Pattern Peaks answers do not use the compact responsive grid.");
assert(multipleChoiceActivity.includes('longestOptionLength <= 44'), "Long Pattern Peaks answers are not protected from cramped columns.");
const patternSequenceVisual = fs.readFileSync(path.join(root, "components/activities/PatternSequenceStripVisual.tsx"), "utf8");
assert(patternSequenceVisual.includes('ariaLabel="Missing term"'), "The inline missing-term field is not accessible.");
for (const visualFile of ["FunctionMachineCardVisual.tsx", "InputOutputTableVisual.tsx", "ExpressionFlowVisual.tsx", "EquationVisualCards.tsx"]) {
  const source = fs.readFileSync(path.join(root, "components/activities", visualFile), "utf8");
  assert(source.includes("InlineMathAnswerInput"), `${visualFile} does not support inline Pattern Peaks answers.`);
}

const towerPortalConfig = fs.readFileSync(path.join(root, "lib/world3d/tower-realm-chamber-config.ts"), "utf8");
assert(towerPortalConfig.includes('posterAsset: "/images/patternpeaks-home-bg-y6.jpeg"'), "Pattern Peaks tower portal must use the Level 6 realm background, not a card asset.");
const towerChamber = fs.readFileSync(path.join(root, "components/world3d/TowerRealmChamber.tsx"), "utf8");
assert(towerChamber.includes('return "LEVEL 6 PREVIEW"'), "Pattern Peaks tower portal must identify the Level 6 preview.");
const towerEntry = fs.readFileSync(path.join(root, "lib/world3d/tower-realm-entry.ts"), "utf8");
assert(towerEntry.includes('level=Year%206'), "Pattern Peaks tower preview must open Level 6.");

const patternMap = fs.readFileSync(path.join(root, "components/world/PatternPeaksMap.tsx"), "utf8");
assert.equal((patternMap.match(/left: "4%"/g) ?? []).length, 2, "The two left Pattern Peaks districts must align.");
assert.equal((patternMap.match(/left: "67%"/g) ?? []).length, 2, "The two right Pattern Peaks districts must align.");
assert.equal((patternMap.match(/top: "18%"/g) ?? []).length, 2, "The top Pattern Peaks districts must align.");
assert.equal((patternMap.match(/top: "57%"/g) ?? []).length, 2, "The lower Pattern Peaks districts must align.");
assert(patternMap.includes("districtMinHeight: 124"), "Pattern Peaks district cards need a shared minimum height.");

for (const page of ["app/pattern-peaks/page.tsx", "app/pattern-peaks/program/page.tsx", "app/pattern-peaks/lesson/[level]/[week]/[lesson]/page.tsx"]) {
  const source = fs.readFileSync(path.join(root, page), "utf8");
  assert(source.includes("getServerStarpathAccess"), `${page} is not server-gated.`);
}

console.log("Pattern Peaks curriculum audit passed: 4 levels, 32 weeks, 96 lessons, 288 rotations, ACARA ownership, lesson review, gated previews, and assets verified.");
