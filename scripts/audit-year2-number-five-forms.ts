import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { getPosttestForYearLabel, getPretestForYearLabel } from "../data/assessments/api";
import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../data/assessments/numberNexusAssessmentBlueprint";
import {
  NUMBER_LEVEL2_FIVE_FORMS as forms,
  NUMBER_LEVEL2_FORMS as formNames,
  type NumberLevel2Form,
} from "../data/assessments/revisions/year2NumberFiveForms";
import {
  YEAR2_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS as v2Post,
  YEAR2_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS as v2Pre,
} from "../data/assessments/year2NumberNexusIndependentBanks";
import { buildYear2NumberNexusWeeklyQuiz } from "../data/quizzes/year2NumberNexus";

// Independently worked keys, kept separate from the form generator.
const keys: Record<NumberLevel2Form, readonly string[]> = {
  pretest: ["326", "907||970||1000", "504", "600 + 30", "one-eighth", "8", "63", "45", "50 + 25", "24", "6", "There are 5 groups.", "13", "6", "20 − 18", "27", "67", "7", "8", "7"],
  posttest: ["542", "909||990||1000", "708", "400 + 50", "one-quarter", "8", "83", "36", "60 + 24", "24", "7", "There are 6 groups.", "15", "8", "20 − 16", "33", "74", "8", "7", "9"],
  start: ["435", "806||860||1000", "609", "700 + 20", "one-eighth", "8", "72", "25", "40 + 45", "21", "7", "There are 6 groups.", "13", "9", "20 − 14", "24", "56", "5", "9", "6"],
  mid: ["263", "708||780||1000", "403", "800 + 90", "one-quarter", "8", "85", "37", "70 + 25", "28", "6", "There are 7 groups.", "12", "4", "20 − 12", "41", "45", "6", "8", "8"],
  end: ["617", "605||650||1000", "806", "500 + 60", "one-eighth", "8", "56", "46", "30 + 56", "18", "8", "There are 7 groups.", "12", "3", "20 − 19", "36", "78", "9", "9", "10"],
};

type Visual = Record<string, unknown> & { type: string };
const nums = (text: string) => (text.match(/\d+/g) ?? []).map(Number);
const within = (value: number, min: number, max: number, label: string) => assert.ok(value >= min && value <= max, `${label}: ${value} outside ${min}–${max}`);
const sortedDigits = (value: number) => String(value).split("").sort().join("");
const valueOf = (expression: string) => {
  const match = expression.match(/^(\d+) ([+−]) (\d+)$/);
  assert.ok(match, `Unparseable expression ${expression}`);
  return match![2] === "+" ? Number(match![1]) + Number(match![3]) : Number(match![1]) - Number(match![3]);
};

// Exact examples practised in weekly quizzes (weeks 5, 7, 10, 11) that assessments must not reuse.
const QUIZ_FACTS = ["7+5", "9+8", "12+6", "14+9", "16+7", "8+6", "11+7", "13+9", "15+8", "17+5"];
const QUIZ_PRICE_PAIRS = ["3+4", "5+6", "7+8"];
const QUIZ_CHANGE_PRICES = [13, 15];
const quizPrompts = new Set<string>();
for (let week = 1; week <= 12; week += 1) buildYear2NumberNexusWeeklyQuiz(week).forEach((question) => quizPrompts.add(question.prompt.trim().toLowerCase()));

const blueprint = NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS.find((entry) => entry.level === 2)!;
const expectedDifficulty = { easy: 8, moderate: 9, challenging: 3 };
const expectedCognitive = { recall: 3, understanding: 6, application: 7, reasoning: 4, transfer: 0 };
const ids = new Set<string>();
let halveSixteen = 0;
let checks = 0;

for (const form of formNames) {
  const items = forms[form];
  assert.equal(items.length, 20, `${form} has 20 items`);
  const difficulty: Record<string, number> = {};
  const cognitive: Record<string, number> = {};
  let selected = 0;
  items.forEach((item, index) => {
    const label = `${form} Q${index + 1}`;
    const key = keys[form][index]!;
    const v = item.visual as Visual;
    const reference = forms.posttest[index]!;
    assert.ok(!ids.has(item.id), `${label} duplicate id`); ids.add(item.id);
    // One blueprint per slot across all five forms.
    assert.equal(item.primaryDescriptorCode, v2Pre[index]!.primaryDescriptorCode, `${label} descriptor`);
    assert.deepEqual(item.curriculumCodes, reference.curriculumCodes, `${label} codes`);
    for (const field of ["type", "responseMode", "difficulty", "cognitiveCategory", "skillLabel", "skillId"] as const) assert.equal(item[field], reference[field], `${label} ${field}`);
    assert.equal(item.scoring.kind, reference.scoring.kind, `${label} scoring kind`);
    assert.equal(v.type, (reference.visual as Visual).type, `${label} visual type`);
    assert.deepEqual(item.linkedWeeks, reference.linkedWeeks, `${label} weeks`);
    assert.equal((item.options ?? []).length, (reference.options ?? []).length, `${label} option count`);
    assert.ok(item.misconceptionTags.length > 0, `${label} misconception tags`);
    // Keys and scoring.
    assert.equal(item.correctAnswer, key, `${label} key`);
    assert.equal(item.scoring.correctResponse, key, `${label} scoring key`);
    assert.equal((item.renderer.payload as { correctAnswer?: string }).correctAnswer, key, `${label} renderer key`);
    assert.equal(isAssessmentAnswerCorrect(item, key), true, `${label} accepts key`);
    assert.equal(isAssessmentAnswerCorrect(item, ""), false, `${label} rejects empty`);
    assert.equal(isAssessmentAnswerCorrect(item, "__wrong__"), false, `${label} rejects nonsense`);
    if (item.type === "mcq") {
      const options = (item.options ?? []).map(String);
      assert.equal(new Set(options).size, options.length, `${label} unique options`);
      for (const option of options) assert.equal(isAssessmentAnswerCorrect(item, option), option === key, `${label} option ${option}`);
      assert.equal(options[(item.selectedAnswerPosition ?? 0) - 1], key, `${label} answer position`);
      selected += 1;
    } else if (item.type === "numeric") {
      assert.equal(isAssessmentAnswerCorrect(item, String(Number(key) + 1)), false, `${label} rejects key + 1`);
      assert.equal(item.selectedAnswerPosition, undefined, `${label} no answer position`);
    } else {
      assert.equal(isAssessmentAnswerCorrect(item, key.split("||").reverse().join("||")), false, `${label} rejects reversed order`);
    }
    // Wording.
    assert.ok(item.prompt.trim().split(/\s+/).length <= 18, `${label} exceeds the Year 2 reading ceiling`);
    assert.ok(!quizPrompts.has(item.prompt.trim().toLowerCase()), `${label} duplicates a weekly quiz prompt`);
    assert.doesNotMatch(item.prompt, /numerator|denominator/i, `${label} uses Year 3+ fraction terms`);
    difficulty[item.difficulty] = (difficulty[item.difficulty] ?? 0) + 1;
    cognitive[item.cognitiveCategory] = (cognitive[item.cognitiveCategory] ?? 0) + 1;

    // The visual (and prompt) independently solve to the key; demand constraints per slot.
    let solved: string;
    switch (index) {
      case 0: { const h = Number(v.hundreds), t = Number(v.tens), o = Number(v.ones); within(h, 2, 7, label); within(t, 1, 9, label); within(o, 1, 9, label); solved = String(h * 100 + t * 10 + o); break; }
      case 1: { const values = v.values as number[]; assert.equal(values.length, 3); assert.ok(values.includes(1000)); const others = values.filter((n) => n !== 1000); assert.equal(sortedDigits(others[0]!), sortedDigits(others[1]!), `${label} look-alike numbers`); assert.deepEqual(item.options, values.map(String)); solved = [...values].sort((x, y) => x - y).join("||"); break; }
      case 2: { assert.equal(v.tens, 0); assert.deepEqual(nums(item.prompt), [Number(v.hundreds), 0, Number(v.ones)]); solved = String(Number(v.hundreds) * 100 + Number(v.ones)); break; }
      case 3: { const whole = Number(v.whole); assert.equal(Math.floor(whole / 10) % 10, 0, `${label} zero tens`); const choices = v.choices as [number, number][]; const wrong = choices.filter(([x, y]) => x + y !== whole); assert.equal(wrong.length, 1, `${label} exactly one invalid partition`); solved = `${wrong[0]![0]} + ${wrong[0]![1]}`; assert.deepEqual(item.options, choices.map(([x, y]) => `${x} + ${y}`)); break; }
      case 4: { assert.equal(v.selected, 1); assert.ok(v.parts === 4 || v.parts === 8); assert.deepEqual([...(item.options ?? [])].sort(), ["one-eighth", "one-half", "one-quarter"]); solved = v.parts === 8 ? "one-eighth" : "one-quarter"; break; }
      case 5: { assert.equal(v.before, 4); assert.equal(v.after, null, `${label} must not show the finished parts`); assert.equal(typeof v.whole, "string"); solved = String(Number(v.before) * 2); break; }
      case 6: { const [x, y] = nums(String(v.expression)); assert.ok((x! % 10) + (y! % 10) >= 10, `${label} regroups ones`); assert.ok(x! + y! < 100); solved = String(valueOf(`${x} + ${y}`)); break; }
      case 7: { const [x, y] = nums(String(v.expression)); assert.ok(x! % 10 < y! % 10, `${label} regroups`); assert.ok(x! < 100 && y! >= 10); solved = String(x! - y!); break; }
      case 8: { const [x, y] = nums(String(v.expression)); const options = (item.options ?? []).map(String); const matches = options.filter((option) => valueOf(option) === x! + y!); assert.equal(matches.length, 1, `${label} exactly one equivalent strategy`); assert.equal(nums(matches[0]!)[0]! % 10, 0, `${label} compensates to a decade`); solved = matches[0]!; break; }
      case 9: { within(Number(v.rows), 3, 4, label); within(Number(v.columns), 6, 8, label); solved = String(Number(v.rows) * Number(v.columns)); break; }
      case 10: { const total = Number(v.total), groups = Number(v.groups); within(groups, 3, 4, label); assert.equal(total % groups, 0); assert.deepEqual(nums(item.prompt), [total, groups]); solved = String(total / groups); within(total / groups, 5, 8, label); break; }
      case 11: { assert.equal(v.loose, true, `${label} must not pre-draw the groups`); const total = Number(v.total), size = Number(v.groupSize); within(size, 3, 4, label); assert.equal(total % size, 0); assert.notEqual(total / size, size, `${label} groups must differ from group size`); solved = `There are ${total / size} groups.`; break; }
      case 12: { const [x, y] = v.amounts as number[]; within(x!, 1, 9, label); within(y!, 1, 9, label); assert.ok(x! + y! > 10, `${label} bridges ten`); assert.ok(!QUIZ_PRICE_PAIRS.includes([x!, y!].sort((m, n) => m - n).join("+")), `${label} quiz price pair`); solved = String(x! + y!); break; }
      case 13: { const [paid, cost] = v.amounts as number[]; assert.equal(paid, 20); within(cost!, 11, 19, label); assert.ok(!QUIZ_CHANGE_PRICES.includes(cost!), `${label} quiz change example`); solved = String(20 - cost!); break; }
      case 14: { const [paid, cost] = v.amounts as number[]; assert.equal(paid, 20); assert.deepEqual([...(item.options ?? [])].sort(), [`${cost} − 20`, `20 + ${cost}`, `20 − ${cost}`].sort()); assert.notEqual(cost, (items[13]!.visual as Visual & { amounts: number[] }).amounts[1], `${label} reuses slot 14 price`); solved = `20 − ${cost}`; break; }
      case 15: { const values = v.values as (number | null)[]; assert.equal(values.length, 5); assert.equal(values[4], null); assert.notEqual(values[0]! % 5, 0, `${label} not a Year 1 skip count`); for (let i = 1; i < 4; i += 1) assert.equal(values[i]! - values[i - 1]!, 5); solved = String(values[3]! + 5); break; }
      case 16: { const values = v.values as (number | null)[]; assert.equal(values.length, 5); assert.equal(values[2], null, `${label} interior gap`); assert.notEqual(values[0]! % 10, 0); assert.equal(values[0]! - values[1]!, 10); assert.equal(values[3]! - values[4]!, 10); assert.equal(values[1]! - values[3]!, 20); assert.doesNotMatch(item.prompt, /rule|subtract|minus|less/i, `${label} states the rule`); solved = String(values[1]! - 10); break; }
      case 17: { const [x, y, z] = v.family as number[]; assert.equal(x! + y!, z); assert.ok(z! <= 20); assert.ok(!QUIZ_FACTS.includes(`${x}+${y}`)); assert.deepEqual(nums(item.prompt), [x!, y!, z!, z!, x!]); solved = String(z! - x!); break; }
      case 18: { const [x, y, z] = v.family as number[]; assert.equal(x! + y!, z); assert.ok(z! <= 20 && z! > 10, `${label} bridges ten within 20`); assert.ok(!QUIZ_FACTS.includes(`${x}+${y}`)); solved = String(z! - y!); break; }
      case 19: { const total = Number(v.total); assert.equal(v.split, false, `${label} must not split the collection`); assert.equal(total % 2, 0); within(total, 12, 20, label); if (total === 16) halveSixteen += 1; solved = String(total / 2); break; }
      default: throw new Error(`Unreviewed slot ${index + 1}`);
    }
    assert.equal(solved, key, `${label} visual independently solves to the key`);
    checks += 1;
  });
  assert.deepEqual(difficulty, expectedDifficulty, `${form} difficulty mix`);
  assert.deepEqual({ ...expectedCognitive, ...cognitive }, expectedCognitive, `${form} cognitive mix`);
  const formBlueprint = blueprint.forms.find((entry) => entry.kind === "pretest")!;
  assert.ok(selected <= formBlueprint.responseMix.selectedResponseMaximum, `${form} selected responses ${selected}`);
  assert.ok(20 - selected >= formBlueprint.responseMix.constructedOrManipulatedMinimum, `${form} constructed responses`);
}
assert.equal(ids.size, 100);
assert.ok(halveSixteen <= 1, "The week 10 quiz double (16) may appear in one form only");

// Five different examples per slot.
for (let index = 0; index < 20; index += 1) {
  const fingerprints = formNames.map((form) => JSON.stringify({ prompt: forms[form][index]!.prompt, visual: forms[form][index]!.visual, options: forms[form][index]!.options }));
  assert.equal(new Set(fingerprints).size, 5, `Slot ${index + 1} requires five different examples`);
}

// Pre and Start are not easier than Post and End on the slots where magnitude carries demand.
const magnitude = (form: NumberLevel2Form, index: number) => Number(keys[form][index]);
for (const index of [9, 10, 13]) {
  const later = Math.max(magnitude("posttest", index), magnitude("end", index));
  for (const early of ["pretest", "start"] as const) assert.ok(magnitude(early, index) >= later * 0.75, `${early} Q${index + 1} is markedly easier than Post/End`);
}

// Released v2 banks stay exactly as they were.
assert.ok([...v2Pre, ...v2Post].every((item) => item.id.endsWith("-v2") && item.version === "2.0.0"), "v2 identities changed");
assert.equal(v2Pre[4]!.prompt, "One of 4 equal parts is selected. Write the numerator.", "v2 pre Q5 changed");
assert.equal(v2Post[10]!.prompt, "Put 30 counters into groups of 5. How many groups?", "v2 post Q11 changed");
assert.deepEqual(v2Pre[5]!.visual, { type: "number_y2_fraction_halving", before: 4, after: 8 }, "v2 pre Q6 visual changed");

// Student routing stays on the released v2 pair until owner approval and versioned activation.
assert.ok(getPretestForYearLabel("Year 2", "number").every((item) => item.id.endsWith("-v2")), "Year 2 pre-test routing changed before release");
assert.ok(getPosttestForYearLabel("Year 2", "number")!.questions.every((item) => item.id.endsWith("-v2")), "Year 2 post-test routing changed before release");

// Protected review is isolated: the real question card and shell, free navigation, no learner writes.
const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8");
const reviewComponent = read("../components/demo/FiveFormAssessmentReview.tsx");
const reviewWrapper = read("../components/demo/NumberLevel2FiveFormReview.tsx");
const reviewRoute = read("../app/demo-review/number-level-2/page.tsx");
const demoPanel = read("../components/demo/DemoReviewPanel.tsx");
assert.ok(reviewComponent.includes("AssessmentQuestionCard") && reviewComponent.includes("AssessmentShell") && reviewComponent.includes("reviewNavigation"), "Review must use the real card, shell and free review navigation");
for (const source of [reviewComponent, reviewWrapper]) assert.doesNotMatch(source, /localStorage|sessionStorage|supabase|saveRealmAssessment|saveDiagnosticProgress|fetch\(/, "Review must not write learner data");
assert.ok(reviewWrapper.includes("NUMBER_LEVEL2_FIVE_FORMS") && reviewWrapper.includes('exitHref="/demo-review?realm=number&year=Year%202"'), "Exit must return to Demo Review on Number Level 2");
assert.ok(reviewRoute.includes("getServerStarpathAccess") && reviewRoute.includes('if (!access.allowed) redirect("/login")'), "Review route must require demo access");
assert.ok(demoPanel.includes('router.push("/demo-review/number-level-2")'), "Demo Review must link to the Level 2 five-form review");

console.log(`Number Level 2 five forms: ${checks} independently solved items, five different examples per slot, matched blueprint (8/9/3, 3/6/7/4), selected responses within limit, no weekly-quiz reuse, v2 banks and student routing unchanged, protected review isolated.`);
