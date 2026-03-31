import type { Question as PretestQuestion } from "./pretests";
import type { PostTest, Question as PosttestQuestion } from "./posttests";

export type AssessmentForm = "A" | "B";

export type Level3AssessmentBlueprintItem = {
  skillId: string;
  title: string;
  linkedWeeks: number[];
  questionTypes: string[];
  difficultyBand: "core" | "mixed" | "stretch";
  targetCountInTest: number;
  allowedInPre: boolean;
  allowedInPost: boolean;
};

type AssessmentQuestionOption =
  | string
  | {
      id: string;
      label: string;
      numerator?: number;
      denominator?: number;
      parts?: number;
    };

type Level3GeneratedQuestion = {
  id: string;
  type: string;
  prompt: string;
  options: AssessmentQuestionOption[];
  correctAnswer: string;
  skillId: string;
  linkedWeeks: number[];
  questionType: string;
  difficultyBand: Level3AssessmentBlueprintItem["difficultyBand"];
  instanceKey: string;
  visual?: Record<string, unknown>;
};

type QuestionFactory = () => Omit<Level3GeneratedQuestion, "id">;

const QUESTIONS_PER_TEST = 20;

export const LEVEL3_ASSESSMENT_BLUEPRINT: Level3AssessmentBlueprintItem[] = [
  {
    skillId: "place_value_number_knowledge",
    title: "Place Value and Number Knowledge",
    linkedWeeks: [1, 10],
    questionTypes: ["mcq_place_value", "number_order"],
    difficultyBand: "core",
    targetCountInTest: 2,
    allowedInPre: true,
    allowedInPost: true,
  },
  {
    skillId: "rounding_estimation",
    title: "Rounding and Estimation",
    linkedWeeks: [2, 9],
    questionTypes: ["mcq_rounding", "mcq_estimation"],
    difficultyBand: "mixed",
    targetCountInTest: 2,
    allowedInPre: true,
    allowedInPost: true,
  },
  {
    skillId: "addition_fluency",
    title: "Addition Fluency",
    linkedWeeks: [3],
    questionTypes: ["mcq_addition"],
    difficultyBand: "mixed",
    targetCountInTest: 2,
    allowedInPre: true,
    allowedInPost: true,
  },
  {
    skillId: "subtraction_fluency",
    title: "Subtraction Fluency",
    linkedWeeks: [4],
    questionTypes: ["mcq_subtraction"],
    difficultyBand: "mixed",
    targetCountInTest: 2,
    allowedInPre: true,
    allowedInPost: true,
  },
  {
    skillId: "written_algorithms",
    title: "Written Addition and Subtraction",
    linkedWeeks: [5],
    questionTypes: ["mcq_written_method"],
    difficultyBand: "stretch",
    targetCountInTest: 2,
    allowedInPre: true,
    allowedInPost: true,
  },
  {
    skillId: "two_step_word_problems",
    title: "Two-Step Word Problems",
    linkedWeeks: [6],
    questionTypes: ["mcq_word_problem"],
    difficultyBand: "stretch",
    targetCountInTest: 2,
    allowedInPre: true,
    allowedInPost: true,
  },
  {
    skillId: "multiplication_models",
    title: "Multiplication Models",
    linkedWeeks: [7],
    questionTypes: ["mcq_equal_groups", "mcq_arrays"],
    difficultyBand: "core",
    targetCountInTest: 2,
    allowedInPre: true,
    allowedInPost: true,
  },
  {
    skillId: "division_and_fact_families",
    title: "Division and Fact Families",
    linkedWeeks: [8, 10],
    questionTypes: ["mcq_division", "mcq_fact_family"],
    difficultyBand: "mixed",
    targetCountInTest: 1,
    allowedInPre: true,
    allowedInPost: true,
  },
  {
    skillId: "patterns_sequences",
    title: "Patterns and Sequences",
    linkedWeeks: [9],
    questionTypes: ["mcq_skip_count", "mcq_pattern"],
    difficultyBand: "core",
    targetCountInTest: 1,
    allowedInPre: true,
    allowedInPost: true,
  },
  {
    skillId: "fractions_foundations",
    title: "Fraction Foundations",
    linkedWeeks: [11],
    questionTypes: ["fraction_model_select", "build_whole"],
    difficultyBand: "mixed",
    targetCountInTest: 2,
    allowedInPre: true,
    allowedInPost: true,
  },
  {
    skillId: "fractions_reasoning",
    title: "Fraction Reasoning",
    linkedWeeks: [12],
    questionTypes: ["fraction_order", "fraction_number_line", "fraction_model_select"],
    difficultyBand: "mixed",
    targetCountInTest: 2,
    allowedInPre: true,
    allowedInPost: true,
  },
];

const LEVEL3_SKILL_FACTORIES: Record<string, Record<AssessmentForm, QuestionFactory[]>> = {
  place_value_number_knowledge: {
    A: [
      () => ({
        type: "mcq",
        prompt: "What is 4,000 + 300 + 20 + 5?",
        options: ["4,325", "4,235", "4,352", "4,305"],
        correctAnswer: "4,325",
        skillId: "place_value_number_knowledge",
        linkedWeeks: [1, 10],
        questionType: "mcq_place_value",
        difficultyBand: "core",
        instanceKey: "pv-a-1",
      }),
      () => ({
        type: "number_order",
        prompt: "Put these numbers in order from smallest to largest.",
        options: ["5,409", "5,490", "5,094", "5,940"],
        correctAnswer: "5,094,5,409,5,490,5,940",
        skillId: "place_value_number_knowledge",
        linkedWeeks: [1, 10],
        questionType: "number_order",
        difficultyBand: "core",
        instanceKey: "pv-a-2",
      }),
    ],
    B: [
      () => ({
        type: "mcq",
        prompt: "What is the value of the 7 in 6,742?",
        options: ["7", "70", "700", "7,000"],
        correctAnswer: "700",
        skillId: "place_value_number_knowledge",
        linkedWeeks: [1, 10],
        questionType: "mcq_place_value",
        difficultyBand: "core",
        instanceKey: "pv-b-1",
      }),
      () => ({
        type: "number_order",
        prompt: "Put these numbers in order from smallest to largest: 4,508, 4,805, 4,580",
        options: ["4,508", "4,805", "4,580"],
        correctAnswer: "4,508,4,580,4,805",
        skillId: "place_value_number_knowledge",
        linkedWeeks: [1, 10],
        questionType: "number_order",
        difficultyBand: "core",
        instanceKey: "pv-b-2",
      }),
    ],
  },
  rounding_estimation: {
    A: [
      () => ({
        type: "mcq",
        prompt: "Round 4,368 to the nearest 100.",
        options: ["4,300", "4,400", "4,360", "4,500"],
        correctAnswer: "4,400",
        skillId: "rounding_estimation",
        linkedWeeks: [2, 9],
        questionType: "mcq_rounding",
        difficultyBand: "mixed",
        instanceKey: "re-a-1",
      }),
      () => ({
        type: "mcq",
        prompt: "A class collected 248 stickers and then 173 more. About how many stickers is that?",
        options: ["300", "400", "500", "600"],
        correctAnswer: "400",
        skillId: "rounding_estimation",
        linkedWeeks: [2, 9],
        questionType: "mcq_estimation",
        difficultyBand: "mixed",
        instanceKey: "re-a-2",
      }),
    ],
    B: [
      () => ({
        type: "mcq",
        prompt: "Round 6,742 to the nearest 10.",
        options: ["6,740", "6,700", "6,750", "6,742"],
        correctAnswer: "6,740",
        skillId: "rounding_estimation",
        linkedWeeks: [2, 9],
        questionType: "mcq_rounding",
        difficultyBand: "mixed",
        instanceKey: "re-b-1",
      }),
      () => ({
        type: "mcq",
        prompt: "A stadium had 3,482 people on Friday and 2,615 on Saturday. About how many people attended?",
        options: ["5,000", "6,000", "7,000", "8,000"],
        correctAnswer: "6,000",
        skillId: "rounding_estimation",
        linkedWeeks: [2, 9],
        questionType: "mcq_estimation",
        difficultyBand: "mixed",
        instanceKey: "re-b-2",
      }),
    ],
  },
  addition_fluency: {
    A: [
      () => ({
        type: "mcq",
        prompt: "What is 49 + 32?",
        options: ["71", "81", "91", "92"],
        correctAnswer: "81",
        skillId: "addition_fluency",
        linkedWeeks: [3],
        questionType: "mcq_addition",
        difficultyBand: "mixed",
        instanceKey: "add-a-1",
      }),
      () => ({
        type: "mcq",
        prompt: "What is 38 + 27?",
        options: ["55", "65", "75", "66"],
        correctAnswer: "65",
        skillId: "addition_fluency",
        linkedWeeks: [3],
        questionType: "mcq_addition",
        difficultyBand: "mixed",
        instanceKey: "add-a-2",
      }),
    ],
    B: [
      () => ({
        type: "mcq",
        prompt: "What is 57 + 19?",
        options: ["66", "76", "86", "96"],
        correctAnswer: "76",
        skillId: "addition_fluency",
        linkedWeeks: [3],
        questionType: "mcq_addition",
        difficultyBand: "mixed",
        instanceKey: "add-b-1",
      }),
      () => ({
        type: "mcq",
        prompt: "What is 46 + 47?",
        options: ["83", "92", "93", "94"],
        correctAnswer: "93",
        skillId: "addition_fluency",
        linkedWeeks: [3],
        questionType: "mcq_addition",
        difficultyBand: "mixed",
        instanceKey: "add-b-2",
      }),
    ],
  },
  subtraction_fluency: {
    A: [
      () => ({
        type: "mcq",
        prompt: "What is 102 − 98?",
        options: ["2", "3", "4", "5"],
        correctAnswer: "4",
        skillId: "subtraction_fluency",
        linkedWeeks: [4],
        questionType: "mcq_subtraction",
        difficultyBand: "mixed",
        instanceKey: "sub-a-1",
      }),
      () => ({
        type: "mcq",
        prompt: "What is the difference between 87 and 124?",
        options: ["27", "37", "47", "57"],
        correctAnswer: "37",
        skillId: "subtraction_fluency",
        linkedWeeks: [4],
        questionType: "mcq_subtraction",
        difficultyBand: "mixed",
        instanceKey: "sub-a-2",
      }),
    ],
    B: [
      () => ({
        type: "mcq",
        prompt: "What is 146 − 98?",
        options: ["38", "48", "58", "68"],
        correctAnswer: "48",
        skillId: "subtraction_fluency",
        linkedWeeks: [4],
        questionType: "mcq_subtraction",
        difficultyBand: "mixed",
        instanceKey: "sub-b-1",
      }),
      () => ({
        type: "mcq",
        prompt: "What is 156 − 32?",
        options: ["114", "124", "134", "144"],
        correctAnswer: "124",
        skillId: "subtraction_fluency",
        linkedWeeks: [4],
        questionType: "mcq_subtraction",
        difficultyBand: "mixed",
        instanceKey: "sub-b-2",
      }),
    ],
  },
  written_algorithms: {
    A: [
      () => ({
        type: "mcq",
        prompt: "Work out 384 + 267.",
        options: ["541", "651", "641", "671"],
        correctAnswer: "651",
        skillId: "written_algorithms",
        linkedWeeks: [5],
        questionType: "mcq_written_method",
        difficultyBand: "stretch",
        instanceKey: "alg-a-1",
      }),
      () => ({
        type: "mcq",
        prompt: "Work out 402 − 187.",
        options: ["205", "215", "225", "235"],
        correctAnswer: "215",
        skillId: "written_algorithms",
        linkedWeeks: [5],
        questionType: "mcq_written_method",
        difficultyBand: "stretch",
        instanceKey: "alg-a-2",
      }),
    ],
    B: [
      () => ({
        type: "mcq",
        prompt: "Work out 146 + 278.",
        options: ["414", "424", "434", "444"],
        correctAnswer: "424",
        skillId: "written_algorithms",
        linkedWeeks: [5],
        questionType: "mcq_written_method",
        difficultyBand: "stretch",
        instanceKey: "alg-b-1",
      }),
      () => ({
        type: "mcq",
        prompt: "Work out 631 − 248.",
        options: ["373", "383", "393", "403"],
        correctAnswer: "383",
        skillId: "written_algorithms",
        linkedWeeks: [5],
        questionType: "mcq_written_method",
        difficultyBand: "stretch",
        instanceKey: "alg-b-2",
      }),
    ],
  },
  two_step_word_problems: {
    A: [
      () => ({
        type: "mcq",
        prompt: "A shop had 186 apples. They received 48 more, then sold 36. How many apples do they have now?",
        options: ["188", "198", "208", "218"],
        correctAnswer: "198",
        skillId: "two_step_word_problems",
        linkedWeeks: [6],
        questionType: "mcq_word_problem",
        difficultyBand: "stretch",
        instanceKey: "word-a-1",
      }),
      () => ({
        type: "mcq",
        prompt: "There were 320 tickets. 185 were sold in the morning and 74 in the afternoon. How many tickets are left?",
        options: ["51", "61", "71", "81"],
        correctAnswer: "61",
        skillId: "two_step_word_problems",
        linkedWeeks: [6],
        questionType: "mcq_word_problem",
        difficultyBand: "stretch",
        instanceKey: "word-a-2",
      }),
    ],
    B: [
      () => ({
        type: "mcq",
        prompt: "A school collected 245 cans. They collected 67 more, but 29 were damaged. How many are left?",
        options: ["273", "283", "293", "303"],
        correctAnswer: "283",
        skillId: "two_step_word_problems",
        linkedWeeks: [6],
        questionType: "mcq_word_problem",
        difficultyBand: "stretch",
        instanceKey: "word-b-1",
      }),
      () => ({
        type: "mcq",
        prompt: "A farmer had 450 apples. He sold 186, then picked 95 more. How many apples does he have now?",
        options: ["349", "359", "369", "379"],
        correctAnswer: "359",
        skillId: "two_step_word_problems",
        linkedWeeks: [6],
        questionType: "mcq_word_problem",
        difficultyBand: "stretch",
        instanceKey: "word-b-2",
      }),
    ],
  },
  multiplication_models: {
    A: [
      () => ({
        type: "mcq",
        prompt: "There are 4 bags with 6 apples in each bag. How many apples are there altogether?",
        options: ["10", "20", "24", "26"],
        correctAnswer: "24",
        skillId: "multiplication_models",
        linkedWeeks: [7],
        questionType: "mcq_equal_groups",
        difficultyBand: "core",
        instanceKey: "mult-a-1",
      }),
      () => ({
        type: "mcq",
        prompt: "Which multiplication sentence matches an array with 3 rows of 4?",
        options: ["3 × 4 = 12", "3 + 4 = 7", "12 ÷ 4 = 4", "4 + 4 + 4 + 4 = 16"],
        correctAnswer: "3 × 4 = 12",
        skillId: "multiplication_models",
        linkedWeeks: [7],
        questionType: "mcq_arrays",
        difficultyBand: "core",
        instanceKey: "mult-a-2",
      }),
    ],
    B: [
      () => ({
        type: "mcq",
        prompt: "5 groups of 4 is the same as:",
        options: ["5 + 4", "4 + 4 + 4 + 4 + 4", "5 + 5 + 5 + 5", "20 ÷ 5"],
        correctAnswer: "4 + 4 + 4 + 4 + 4",
        skillId: "multiplication_models",
        linkedWeeks: [7],
        questionType: "mcq_equal_groups",
        difficultyBand: "core",
        instanceKey: "mult-b-1",
      }),
      () => ({
        type: "mcq",
        prompt: "An array has 2 rows of 10. How many counters are there?",
        options: ["12", "20", "22", "30"],
        correctAnswer: "20",
        skillId: "multiplication_models",
        linkedWeeks: [7],
        questionType: "mcq_arrays",
        difficultyBand: "core",
        instanceKey: "mult-b-2",
      }),
    ],
  },
  division_and_fact_families: {
    A: [
      () => ({
        type: "mcq",
        prompt: "What number makes this true: 4 × ? = 28",
        options: ["6", "7", "8", "9"],
        correctAnswer: "7",
        skillId: "division_and_fact_families",
        linkedWeeks: [8, 10],
        questionType: "mcq_fact_family",
        difficultyBand: "mixed",
        instanceKey: "div-a-1",
      }),
    ],
    B: [
      () => ({
        type: "mcq",
        prompt: "Which sentence belongs to the fact family for 3, 4 and 12?",
        options: ["12 ÷ 3 = 4", "12 + 3 = 15", "4 + 3 = 12", "3 × 12 = 15"],
        correctAnswer: "12 ÷ 3 = 4",
        skillId: "division_and_fact_families",
        linkedWeeks: [8, 10],
        questionType: "mcq_fact_family",
        difficultyBand: "mixed",
        instanceKey: "div-b-1",
      }),
    ],
  },
  patterns_sequences: {
    A: [
      () => ({
        type: "mcq",
        prompt: "What number comes next? 1,250, 1,350, 1,450, __",
        options: ["1,500", "1,550", "1,650", "2,450"],
        correctAnswer: "1,550",
        skillId: "patterns_sequences",
        linkedWeeks: [9],
        questionType: "mcq_skip_count",
        difficultyBand: "core",
        instanceKey: "pat-a-1",
      }),
    ],
    B: [
      () => ({
        type: "mcq",
        prompt: "What number comes next? 23,670, 24,670, 25,670, __",
        options: ["25,770", "26,670", "26,770", "27,670"],
        correctAnswer: "26,670",
        skillId: "patterns_sequences",
        linkedWeeks: [9],
        questionType: "mcq_skip_count",
        difficultyBand: "core",
        instanceKey: "pat-b-1",
      }),
    ],
  },
  fractions_foundations: {
    A: [
      () => ({
        type: "fraction_model_select",
        prompt: "Tap the model that shows one-quarter.",
        options: [
          { id: "a", label: "1/4", numerator: 1, denominator: 4 },
          { id: "b", label: "2/4", numerator: 2, denominator: 4 },
          { id: "c", label: "1/5", numerator: 1, denominator: 5 },
          { id: "d", label: "3/4", numerator: 3, denominator: 4 },
        ],
        correctAnswer: "a",
        skillId: "fractions_foundations",
        linkedWeeks: [11],
        questionType: "fraction_model_select",
        difficultyBand: "mixed",
        instanceKey: "ff-a-1",
      }),
      () => ({
        type: "build_whole",
        prompt: "If this one part is one-third, which picture shows the whole?",
        options: [
          { id: "a", label: "2 parts", parts: 2 },
          { id: "b", label: "3 parts", parts: 3 },
          { id: "c", label: "4 parts", parts: 4 },
        ],
        correctAnswer: "b",
        skillId: "fractions_foundations",
        linkedWeeks: [11],
        questionType: "build_whole",
        difficultyBand: "mixed",
        instanceKey: "ff-a-2",
        visual: {
          fractionLabel: "1/3",
          denominator: 3,
        },
      }),
    ],
    B: [
      () => ({
        type: "fraction_model_select",
        prompt: "Tap the model that shows one-fifth.",
        options: [
          { id: "a", label: "1/5", numerator: 1, denominator: 5 },
          { id: "b", label: "2/5", numerator: 2, denominator: 5 },
          { id: "c", label: "1/4", numerator: 1, denominator: 4 },
          { id: "d", label: "3/5", numerator: 3, denominator: 5 },
        ],
        correctAnswer: "a",
        skillId: "fractions_foundations",
        linkedWeeks: [11],
        questionType: "fraction_model_select",
        difficultyBand: "mixed",
        instanceKey: "ff-b-1",
      }),
      () => ({
        type: "build_whole",
        prompt: "If this one part is one-quarter, which picture shows the whole?",
        options: [
          { id: "a", label: "3 parts", parts: 3 },
          { id: "b", label: "4 parts", parts: 4 },
          { id: "c", label: "5 parts", parts: 5 },
        ],
        correctAnswer: "b",
        skillId: "fractions_foundations",
        linkedWeeks: [11],
        questionType: "build_whole",
        difficultyBand: "mixed",
        instanceKey: "ff-b-2",
        visual: {
          fractionLabel: "1/4",
          denominator: 4,
        },
      }),
    ],
  },
  fractions_reasoning: {
    A: [
      () => ({
        type: "fraction_order",
        prompt: "Put the fractions in order from smallest to largest.",
        options: ["1/5", "1/2", "4/5"],
        correctAnswer: "1/5,1/2,4/5",
        skillId: "fractions_reasoning",
        linkedWeeks: [12],
        questionType: "fraction_order",
        difficultyBand: "mixed",
        instanceKey: "fr-a-1",
      }),
      () => ({
        type: "fraction_number_line",
        prompt: "Place 2/5 on the number line using the model.",
        options: [],
        correctAnswer: "2/5",
        skillId: "fractions_reasoning",
        linkedWeeks: [12],
        questionType: "fraction_number_line",
        difficultyBand: "mixed",
        instanceKey: "fr-a-2",
        visual: {
          targetFraction: "2/5",
        },
      }),
    ],
    B: [
      () => ({
        type: "fraction_model_select",
        prompt: "Tap the model that is equivalent to 1/2.",
        options: [
          { id: "a", label: "2/4", numerator: 2, denominator: 4 },
          { id: "b", label: "3/4", numerator: 3, denominator: 4 },
          { id: "c", label: "2/5", numerator: 2, denominator: 5 },
          { id: "d", label: "4/5", numerator: 4, denominator: 5 },
        ],
        correctAnswer: "a",
        skillId: "fractions_reasoning",
        linkedWeeks: [12],
        questionType: "fraction_model_select",
        difficultyBand: "mixed",
        instanceKey: "fr-b-1",
      }),
      () => ({
        type: "fraction_number_line",
        prompt: "Place 3/4 on the number line using the model.",
        options: [],
        correctAnswer: "3/4",
        skillId: "fractions_reasoning",
        linkedWeeks: [12],
        questionType: "fraction_number_line",
        difficultyBand: "mixed",
        instanceKey: "fr-b-2",
        visual: {
          targetFraction: "3/4",
        },
      }),
    ],
  },
};

function buildGeneratedQuestion(form: AssessmentForm, index: number, factory: QuestionFactory): Level3GeneratedQuestion {
  const question = factory();
  return {
    ...question,
    id: `y3-${form.toLowerCase()}-${String(index + 1).padStart(2, "0")}-${question.skillId}`,
  };
}

export function buildLevel3AssessmentQuestions(form: AssessmentForm): Level3GeneratedQuestion[] {
  const questions: Level3GeneratedQuestion[] = [];

  for (const blueprintItem of LEVEL3_ASSESSMENT_BLUEPRINT) {
    const factories = LEVEL3_SKILL_FACTORIES[blueprintItem.skillId]?.[form] ?? [];
    for (let index = 0; index < blueprintItem.targetCountInTest; index += 1) {
      const factory = factories[index];
      if (!factory) {
        throw new Error(`Missing ${form} generator for skill ${blueprintItem.skillId} item ${index + 1}.`);
      }
      questions.push(buildGeneratedQuestion(form, questions.length, factory));
    }
  }

  return questions;
}

export function buildLevel3PretestFormA(): PretestQuestion[] {
  return buildLevel3AssessmentQuestions("A").map((question) => ({
    type: question.type,
    id: question.id,
    prompt: question.prompt,
    options: question.options,
    answer: question.correctAnswer,
    correctAnswer: question.correctAnswer,
    visual: question.visual,
  }));
}

export function buildLevel3PosttestFormB(): PostTest {
  const questions: PosttestQuestion[] = buildLevel3AssessmentQuestions("B").map((question) => ({
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    options: question.options,
    correctAnswer: question.correctAnswer,
    answer: question.correctAnswer,
    visual: question.visual,
  }));

  return {
    yearLabel: "Year 3",
    questions,
  };
}

export function validateLevel3AssessmentBlueprint(): string[] {
  const issues: string[] = [];
  const total = LEVEL3_ASSESSMENT_BLUEPRINT.reduce((sum, item) => sum + item.targetCountInTest, 0);
  if (total !== QUESTIONS_PER_TEST) {
    issues.push(`Blueprint target count is ${total}, expected ${QUESTIONS_PER_TEST}.`);
  }

  for (const item of LEVEL3_ASSESSMENT_BLUEPRINT) {
    if (!item.allowedInPre && !item.allowedInPost) {
      issues.push(`Blueprint item ${item.skillId} is disabled for both pre and post.`);
    }
    if (item.targetCountInTest <= 0) {
      issues.push(`Blueprint item ${item.skillId} has non-positive target count.`);
    }
  }

  return issues;
}

export function validateLevel3AssessmentForms(): string[] {
  const issues = validateLevel3AssessmentBlueprint();
  const formA = buildLevel3AssessmentQuestions("A");
  const formB = buildLevel3AssessmentQuestions("B");

  if (formA.length !== QUESTIONS_PER_TEST) {
    issues.push(`Form A has ${formA.length} questions, expected ${QUESTIONS_PER_TEST}.`);
  }
  if (formB.length !== QUESTIONS_PER_TEST) {
    issues.push(`Form B has ${formB.length} questions, expected ${QUESTIONS_PER_TEST}.`);
  }

  for (const item of LEVEL3_ASSESSMENT_BLUEPRINT) {
    const formACount = formA.filter((question) => question.skillId === item.skillId).length;
    const formBCount = formB.filter((question) => question.skillId === item.skillId).length;
    if (formACount !== item.targetCountInTest) {
      issues.push(`Form A skill ${item.skillId} count ${formACount} does not match target ${item.targetCountInTest}.`);
    }
    if (formBCount !== item.targetCountInTest) {
      issues.push(`Form B skill ${item.skillId} count ${formBCount} does not match target ${item.targetCountInTest}.`);
    }
  }

  for (const question of [...formA, ...formB]) {
    if (/strategy/i.test(question.prompt)) {
      issues.push(`Assessment prompt still contains strategy language: ${question.prompt}`);
    }
  }

  const formAKeys = new Set(formA.map((question) => question.instanceKey));
  const duplicateAcrossForms = formB
    .map((question) => question.instanceKey)
    .filter((key) => formAKeys.has(key));
  if (duplicateAcrossForms.length > 0) {
    issues.push(`Forms A and B reused the same question instances: ${duplicateAcrossForms.join(", ")}.`);
  }

  return issues;
}
