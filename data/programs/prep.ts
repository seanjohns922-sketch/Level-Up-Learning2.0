import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

function buildLesson(
  week: number,
  lesson: number,
  title: string,
  focus: string,
  activityIdeas: string[],
  curriculum: CurriculumCode[],
  displayTitle?: string
): Lesson {
  return {
    id: `y0-w${week}-l${lesson}`,
    week,
    lesson,
    title,
    displayTitle,
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
    topic: "Subitising 1–10",
    curriculum: ["AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        4,
        1,
        "Recognise Dot Patterns 1–10",
        "Instantly recognise structured quantities to 10 without counting one-by-one.",
        ["Flash reveal", "Ten-frame quick look", "Pattern memory sprint"],
        ["AC9MFN02", "AC9MFN03"],
        "Quick Number Eyes"
      ),
      buildLesson(
        4,
        2,
        "Recognise Object Groups",
        "Instantly recognise structured object groups to 10 without counting one-by-one.",
        ["Quick group flash", "Object-frame match", "Real-world memory groups"],
        ["AC9MFN02", "AC9MFN03"],
        "Quick Group Spotter"
      ),
      buildLesson(
        4,
        3,
        "Match Dots to Numerals",
        "Connect structured quantity patterns to numerals, matching quantities, and visual groups without counting one-by-one.",
        ["Pattern to numeral match", "Match all three", "Fast pattern memory"],
        ["AC9MFN02", "AC9MFN03"],
        "Pattern Match Mission"
      ),
    ],
  },
  {
    id: "y0-w5",
    week: 5,
    topic: "Comparing & Sorting Quantities",
    curriculum: ["AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        5,
        1,
        "More or Less",
        "Compare quantities and identify more, less, and equal using visual reasoning and structured groups.",
        ["Which group has more", "Equal group checks", "Quick comparison games"],
        ["AC9MFN03"],
        "More or Less Mission"
      ),
      buildLesson(
        5,
        2,
        "Equal Groups",
        "Recognise when two collections have the same amount.",
        ["Match equal sets", "Balance the groups", "Same amount game"],
        ["AC9MFN02", "AC9MFN03"]
      ),
      buildLesson(
        5,
        3,
        "Sort from Least to Most",
        "Order small collections from least to most.",
        ["Drag to order", "Least to most ladder", "Group sorting race"],
        ["AC9MFN02", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w6",
    week: 6,
    topic: "Building Numbers to 10",
    curriculum: ["AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        6,
        1,
        "Make Numbers in Different Ways",
        "Build the same number using different groups.",
        ["Make it another way", "Build and swap", "Show the same number"],
        ["AC9MFN02", "AC9MFN03"]
      ),
      buildLesson(
        6,
        2,
        "Build Number Pairs",
        "Find two parts that make a whole number to 10.",
        ["Partner pairs", "Two-part builder", "Make the whole"],
        ["AC9MFN02", "AC9MFN03"]
      ),
      buildLesson(
        6,
        3,
        "Part-Part-Whole to 10",
        "Connect parts and wholes using visual groups.",
        ["Part-part-whole mats", "Fill the whole", "Split and join groups"],
        ["AC9MFN02", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w7",
    week: 7,
    topic: "Teen Numbers & Collections to 20",
    curriculum: ["AC9MFN01", "AC9MFN03"],
    lessons: [
      buildLesson(
        7,
        1,
        "Count Collections to 20",
        "Count larger collections accurately using one-to-one correspondence.",
        ["Count bigger groups", "Touch and count to 20", "Collection count challenge"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        7,
        2,
        "Teen Numbers 11–20",
        "Recognise and match teen numerals to quantities.",
        ["Teen number match", "Quantity to numeral", "Quick teen spotting"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        7,
        3,
        "Build Groups to 20",
        "Build and organise collections up to 20.",
        ["Build the collection", "Group to 20", "Organise and count"],
        ["AC9MFN01", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w8",
    week: 8,
    topic: "Number Patterns & Ordering",
    curriculum: ["AC9MFN01", "AC9MFN03"],
    lessons: [
      buildLesson(
        8,
        1,
        "Missing Numbers",
        "Find missing numbers in simple number sequences to 20.",
        ["Missing number trail", "Fill the gap", "Pattern path"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        8,
        2,
        "Number Paths",
        "Follow number paths forward and backward to 20.",
        ["Forward path", "Backward path", "Path challenge"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        8,
        3,
        "Order Numbers to 20",
        "Place numbers to 20 in the correct order.",
        ["Order cards", "Number line build", "Line up to 20"],
        ["AC9MFN01", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w9",
    week: 9,
    topic: "Ordinal Numbers & Position",
    curriculum: ["AC9MFN01", "AC9MFN03"],
    lessons: [
      buildLesson(
        9,
        1,
        "First, Second, Third",
        "Recognise ordinal positions in simple sequences.",
        ["Who is first?", "Ordinal line-up", "Tap the position"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        9,
        2,
        "Ordinals in Games",
        "Use ordinal language in familiar game contexts.",
        ["Race positions", "Game line-up", "Ordinal goal"],
        ["AC9MFN01", "AC9MFN03"]
      ),
      buildLesson(
        9,
        3,
        "Position Challenges",
        "Identify positions such as first, last, before and after.",
        ["Before and after", "Last one challenge", "Position puzzle"],
        ["AC9MFN01", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w10",
    week: 10,
    topic: "Mixed Number Fluency",
    curriculum: ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        10,
        1,
        "Number Arcade",
        "Review counting, matching and numeral recognition in quick games.",
        ["Arcade count", "Quick match", "Fast number rounds"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03"]
      ),
      buildLesson(
        10,
        2,
        "Quick Count Challenge",
        "Practise subitising and counting small groups quickly.",
        ["Quick count flash", "Fast spotting", "Tap the amount"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03"]
      ),
      buildLesson(
        10,
        3,
        "Build & Compare",
        "Build, compare and match quantities in mixed challenges.",
        ["Build the group", "Compare and choose", "Match and sort"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03"]
      ),
    ],
  },
  {
    id: "y0-w11",
    week: 11,
    topic: "Review & Readiness",
    curriculum: ["ALL"],
    lessons: [
      buildLesson(
        11,
        1,
        "Counting Review",
        "Review counting, sequencing and number order to 20.",
        ["Counting mix", "Sequence review", "Number order games"],
        ["ALL"]
      ),
      buildLesson(
        11,
        2,
        "Subitising & Number Building",
        "Review quick recognition and building numbers to 10.",
        ["Flash review", "Build the number", "Quick pattern match"],
        ["ALL"]
      ),
      buildLesson(
        11,
        3,
        "Ground Level Challenge Tower",
        "Complete mixed Number Nexus challenges before final mastery week.",
        ["Challenge tower", "Mixed mini-games", "Readiness missions"],
        ["ALL"]
      ),
    ],
  },
  {
    id: "y0-w12",
    week: 12,
    topic: "Final Mastery Week",
    curriculum: ["ALL"],
    lessons: [
      buildLesson(
        12,
        1,
        "Legend Training",
        "Practise key Ground Level number skills in mixed mini-games.",
        ["Legend warm-up", "Mixed skill arcade", "Number practice rounds"],
        ["ALL"]
      ),
      buildLesson(
        12,
        2,
        "Mastery Games",
        "Apply counting, comparing, subitising and building skills.",
        ["Mastery challenge", "Build and compare", "Quick skill mix"],
        ["ALL"]
      ),
      buildLesson(
        12,
        3,
        "Final Readiness Mission",
        "Complete final review challenges before the post-test.",
        ["Final mission", "Readiness check", "Celebrate and review"],
        ["ALL"]
      ),
    ],
  },
];

export const PREP_PROGRAM: WeekPlan[] = normalizeWeekPlans(0, PREP_PROGRAM_RAW);

export function getPrepWeek(week: number): WeekPlan | undefined {
  return PREP_PROGRAM.find((plan) => plan.week === week);
}
