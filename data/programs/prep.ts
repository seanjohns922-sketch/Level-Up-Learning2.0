import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

function buildLesson(
  week: number,
  lesson: number,
  title: string,
  focus: string,
  activityIdeas: string[],
  curriculum: CurriculumCode[]
): Lesson {
  return {
    id: `y0-w${week}-l${lesson}`,
    week,
    lesson,
    title,
    focus,
    activityIdeas,
    curriculum,
  };
}

const PREP_PROGRAM_RAW: WeekPlan[] = [
  {
    id: "y0-w1",
    week: 1,
    topic: "Recognising Numbers 1–5",
    curriculum: ["AC9MFN01"],
    lessons: [
      buildLesson(
        1,
        1,
        "Recognise Numbers 1–5",
        "Recognise numerals 1–5 and connect them to quantities.",
        ["Tap and count dots", "Match numerals to groups", "Quick recognition cards"],
        ["AC9MFN01"]
      ),
      buildLesson(
        1,
        2,
        "Count Collections to 5",
        "Count small collections using one-to-one correspondence.",
        ["Drag to count", "Count and choose", "Build the group"],
        ["AC9MFN01"]
      ),
      buildLesson(
        1,
        3,
        "Number Names & Numerals",
        "Connect spoken number names to written numerals 1–5.",
        ["Hear and match", "Number chant", "Mixed matching"],
        ["AC9MFN01"]
      ),
    ],
  },
  {
    id: "y0-w2",
    week: 2,
    topic: "Recognising Numbers 6–10",
    curriculum: ["AC9MFN01", "AC9MFN03"],
    lessons: [
      buildLesson(
        2,
        1,
        "Find Numbers 6–10",
        "Recognise numerals 6–10 and connect them to quantities.",
        ["Tap and count collections", "Numeral match", "Fast number recognition"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        2,
        2,
        "Count the Groups",
        "Count collections to 10 accurately and trust the count.",
        ["Count objects", "One-to-one counting", "Trust the count"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        2,
        3,
        "Match the Numbers",
        "Connect spoken number names, numerals, quantities, and written number words to 10.",
        ["Listen and tap", "Match the word", "Three-way number match"],
        ["AC9MFN01", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w3",
    week: 3,
    topic: "Counting Forward & Backward",
    curriculum: ["AC9MFN01", "AC9MFN03"],
    lessons: [
      buildLesson(
        3,
        1,
        "Rocket Count to 10",
        "Count forward fluently to 10 and complete number paths in order.",
        ["Count along the rocket path", "Find the missing number", "Tap numbers in order"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        3,
        2,
        "Blast Off Countdown",
        "Count backward from 10 to 1 and build reverse number order.",
        ["Countdown blastoff", "What comes before", "Backward number paths"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        3,
        3,
        "Number Match Mission",
        "Connect spoken number names, numerals, quantities, and counting order to 10.",
        ["Listen and tap", "Match the group", "Sequence builder"],
        ["AC9MFN01", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w4",
    week: 4,
    topic: "Subitising 1–5",
    curriculum: ["AC9MFN02"],
    lessons: [
      buildLesson(
        4,
        1,
        "Recognise Dot Patterns 1–5",
        "Instantly recognise dot patterns to 5 without counting.",
        ["Flash reveal", "Choose the quantity", "Dot pattern memory"],
        ["AC9MFN02"]
      ),
      buildLesson(
        4,
        2,
        "Recognise Object Groups",
        "Instantly recognise small object groups without counting.",
        ["Quick object reveal", "Select the quantity", "Group sorting"],
        ["AC9MFN02"]
      ),
      buildLesson(
        4,
        3,
        "Match Dots to Numerals",
        "Connect subitised dot patterns to matching numerals.",
        ["Dot to numeral match", "Dot pattern sorting", "Mixed quantity review"],
        ["AC9MFN02"]
      ),
    ],
  },
  {
    id: "y0-w5",
    week: 5,
    topic: "Subitising 6–10",
    curriculum: ["AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        5,
        1,
        "Recognise Dot Patterns 6–10",
        "Use structured subitising to recognise quantities within 10.",
        ["Flash ten-frame reveal", "Tap the amount", "Pattern sort"],
        ["AC9MFN02", "AC9MFN03"]
      ),
      buildLesson(
        5,
        2,
        "Recognise Structured Groups",
        "Notice smaller groups inside numbers to 10.",
        ["Ten-frame spots", "Group and say", "Fast compare"],
        ["AC9MFN02", "AC9MFN03"]
      ),
      buildLesson(
        5,
        3,
        "Match Quantities to Numerals",
        "Match structured quantities within 10 to the correct numeral.",
        ["Quantity reveal", "Drag to numeral", "Quick match challenge"],
        ["AC9MFN02", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w6",
    week: 6,
    topic: "Comparing Quantities",
    curriculum: ["AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        6,
        1,
        "More or Less",
        "Compare two groups and identify which has more or less.",
        ["Tap the larger group", "More or less sort", "Quick compare"],
        ["AC9MFN02", "AC9MFN03"]
      ),
      buildLesson(
        6,
        2,
        "Equal Groups",
        "Recognise when two collections are equal.",
        ["Balance the groups", "Match equal sets", "Equal or not"],
        ["AC9MFN02", "AC9MFN03"]
      ),
      buildLesson(
        6,
        3,
        "Order by Quantity",
        "Put small collections in order from least to most.",
        ["Drag to order", "Line up the groups", "Quantity ladder"],
        ["AC9MFN02", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w7",
    week: 7,
    topic: "Partitioning Numbers to 5",
    curriculum: ["AC9MFN02"],
    lessons: [
      buildLesson(
        7,
        1,
        "Break Apart Numbers",
        "Break numbers to 5 into two smaller parts.",
        ["Split the counters", "Part-part-whole bowls", "Make two parts"],
        ["AC9MFN02"]
      ),
      buildLesson(
        7,
        2,
        "Ways to Make 5",
        "Find different combinations that make 5.",
        ["Build 5", "Partner pairs", "Combination cards"],
        ["AC9MFN02"]
      ),
      buildLesson(
        7,
        3,
        "Build Number Groups",
        "Compose and decompose groups to 5 flexibly.",
        ["Build and break", "Show another way", "Group builder"],
        ["AC9MFN02"]
      ),
    ],
  },
  {
    id: "y0-w8",
    week: 8,
    topic: "Partitioning Numbers to 10",
    curriculum: ["AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        8,
        1,
        "Break Apart 6–10",
        "Break numbers 6–10 into smaller parts.",
        ["Split the ten-frame", "Move counters", "Part sorter"],
        ["AC9MFN02", "AC9MFN03"]
      ),
      buildLesson(
        8,
        2,
        "Ways to Make 10",
        "Find and recognise combinations that make 10.",
        ["Make 10 pairs", "Ten-frame partners", "Quick combo pick"],
        ["AC9MFN02", "AC9MFN03"]
      ),
      buildLesson(
        8,
        3,
        "Build Groups to 10",
        "Compose and decompose quantities to 10 in different ways.",
        ["Build the whole", "Two-part builder", "Show a new split"],
        ["AC9MFN02", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w9",
    week: 9,
    topic: "Counting to 20",
    curriculum: ["AC9MFN01", "AC9MFN03"],
    lessons: [
      buildLesson(
        9,
        1,
        "Count Forward to 20",
        "Count forward to 20 and notice teen-number patterns.",
        ["Path counting", "Teen number train", "Forward count race"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        9,
        2,
        "Count Back from 20",
        "Count backward from 20 with support from visuals and movement.",
        ["Backward steps", "Countdown tiles", "Blastoff path"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        9,
        3,
        "Number Order to 20",
        "Place numbers to 20 in the correct order.",
        ["Order cards", "Missing teen numbers", "Number line build"],
        ["AC9MFN01", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w10",
    week: 10,
    topic: "Ordinal Numbers",
    curriculum: ["AC9MFN01", "AC9MFN03"],
    lessons: [
      buildLesson(
        10,
        1,
        "Recognise Ordinal Numbers",
        "Use first, second, third and later ordinal positions in order.",
        ["Tap the runner", "Ordinal labels", "Position match"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        10,
        2,
        "Ordinals in Context",
        "Identify positions in short familiar contexts.",
        ["Queue positions", "Animal race", "Line-up game"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        10,
        3,
        "Ordinal Number Games",
        "Apply ordinal language in quick interactive games.",
        ["Treasure trail", "Place the sticker", "Who is third?"],
        ["AC9MFN01", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w11",
    week: 11,
    topic: "Mixed Number Fluency",
    curriculum: ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        11,
        1,
        "Mixed Counting Games",
        "Review counting, sequencing and numeral recognition in mixed games.",
        ["Counting spin", "Quick match", "Number path challenge"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        11,
        2,
        "Partitioning Numbers",
        "Review ways to make numbers within 10.",
        ["Make and break", "Part-part-whole review", "Find another way"],
        ["AC9MFN02", "AC9MFN03"]
      ),
      buildLesson(
        11,
        3,
        "Compare Quantities",
        "Compare, sort and justify simple quantity choices.",
        ["More or less mix", "Equal or not", "Order the groups"],
        ["AC9MFN02", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w12",
    week: 12,
    topic: "Review & Readiness",
    curriculum: ["ALL"],
    lessons: [
      buildLesson(
        12,
        1,
        "Counting & Subitising Review",
        "Review counting, numeral recognition and subitising foundations.",
        ["Fast flash review", "Tap and count mix", "Choose the numeral"],
        ["ALL"]
      ),
      buildLesson(
        12,
        2,
        "Partitioning & Comparing Review",
        "Review composing, decomposing and comparing quantities.",
        ["Build the whole review", "Compare and sort", "Make 10 recap"],
        ["ALL"]
      ),
      buildLesson(
        12,
        3,
        "Final Review Challenge",
        "Consolidate Ground Level number skills with confidence-building challenges.",
        ["Mixed mini games", "Readiness check", "Celebration challenge"],
        ["ALL"]
      ),
    ],
  },
];

export const PREP_PROGRAM: WeekPlan[] = normalizeWeekPlans(0, PREP_PROGRAM_RAW);

export function getPrepWeek(week: number): WeekPlan | undefined {
  return PREP_PROGRAM.find((plan) => plan.week === week);
}
