import { normalizeWeekPlans } from "./buildProgram";
import type { LessonActivity } from "./types";

export type CurriculumCode =
  | "AC9MFN01"
  | "AC9MFN02"
  | "AC9MFN03"
  | "AC9MFSP02"
  | "AC9MFM01"
  | "AC9MFM02"
  | "AC9M1M01"
  | "AC9M1M02"
  | "AC9M1M03"
  | "AC9M2M01"
  | "AC9M2M02"
  | "AC9M2M03"
  | "AC9M1N01"
  | "AC9M1N02"
  | "AC9M1N03"
  | "AC9M1N04"
  | "AC9M1N05"
  | "AC9M1N06"
  | "AC9M2N01"
  | "AC9M2N02"
  | "AC9M2N03"
  | "AC9M2N04"
  | "AC9M2N05"
  | "AC9M2N06"
  | "AC9M4N01"
  | "AC9M4N02"
  | "AC9M4N03"
  | "AC9M4N04"
  | "AC9M4N05"
  | "AC9M4N06"
  | "AC9M4N07"
  | "AC9M4N08"
  | "AC9M4N09"
  | "AC9M5N01"
  | "AC9M5N02"
  | "AC9M5N03"
  | "AC9M5N04"
  | "AC9M5N05"
  | "AC9M5N06"
  | "AC9M5N07"
  | "AC9M5N08"
  | "AC9M5N09"
  | "AC9M5N10"
  | "AC9M6N01"
  | "AC9M6N02"
  | "AC9M6N03"
  | "AC9M6N04"
  | "AC9M6N05"
  | "AC9M6N06"
  | "AC9M6N07"
  | "AC9M6N08"
  | "AC9M6N09"
  | "AC9M6N10"
  | "ALL";

export type Lesson = {
  id: string;
  week: number;
  lesson: number;
  title: string;
  displayTitle?: string;
  focus: string;
  quizSafe?: boolean;
  activityIdeas: string[];
  curriculum: CurriculumCode[];
  activityType?: string;
  config?: Record<string, unknown>;
  activities?: LessonActivity[];
};

export type WeekPlan = {
  id: string;
  week: number;
  topic: string;
  lessons: Lesson[];
  curriculum: CurriculumCode[];
};

function mc(config: Record<string, unknown>): LessonActivity {
  return { activityType: "multiple_choice", weight: 1, config };
}
function tr(config: Record<string, unknown>): LessonActivity {
  return { activityType: "typed_response", weight: 1, config };
}
function no(min: number, max: number, count: number, ascending: boolean): LessonActivity {
  return { activityType: "number_order", weight: 2, config: { min, max, count, ascending } };
}
function nl(min: number, max: number, step: number): LessonActivity {
  return { activityType: "number_line", weight: 2, config: { min, max, step, mode: "placement" } };
}
function pvb(min: number, max: number): LessonActivity {
  return { activityType: "place_value_builder", weight: 2, config: { min, max, placeValues: ["tens", "ones"], visualMode: "mab", mode: "identify_number" } };
}
function pe(min: number, max: number): LessonActivity {
  return { activityType: "partition_expand", weight: 2, config: { min, max, mode: "partition" } };
}
function eg(maxGroups: number, maxItems: number): LessonActivity {
  return { activityType: "equal_groups", weight: 2, config: { minGroups: 2, maxGroups, minItemsPerGroup: 2, maxItemsPerGroup: maxItems, mode: "equal_groups" } };
}
function sc(step: number, max: number): LessonActivity {
  return { activityType: "skip_count", weight: 2, config: { min: step, max, step } };
}
function add(min: number, max: number, mode: string): LessonActivity {
  return { activityType: "addition_strategy", weight: 2, config: { min, max, mode } };
}
function sub(min: number, max: number, mode: string): LessonActivity {
  return { activityType: "subtraction_strategy", weight: 2, config: { min, max, mode } };
}
function wp(mode: string): LessonActivity {
  return { activityType: "mixed_word_problem", weight: 2, config: { min: 1, max: 20, mode } };
}
function dg(mode: string): LessonActivity {
  return { activityType: "division_groups", weight: 2, config: { mode, maxGroups: 5, maxItemsPerGroup: 5 } };
}
function ff(): LessonActivity {
  return { activityType: "fact_family", weight: 2, config: { min: 1, max: 20 } };
}

const YEAR1_PROGRAM_RAW: WeekPlan[] = [
  {
    id: "y1-w1",
    week: 1,
    topic: "Counting & Recognising Numbers to 50",
    curriculum: ["AC9M1N01"],
    lessons: [
      {
        id: "y1-w1-l1",
        week: 1, lesson: 1,
        title: "Recognise and read numbers to 50",
        focus: "Recognise and read numbers to 50",
        activityIdeas: ["Number flashcards", "Number hunts", "Classroom walk-around"],
        curriculum: ["AC9M1N01"],
        activities: [no(1, 50, 4, true), mc({ min: 1, max: 50, mode: "identify_number" }), tr({ min: 1, max: 50 })],
      },
      {
        id: "y1-w1-l2",
        week: 1, lesson: 2,
        title: "Count objects to 50",
        focus: "Count objects to 50",
        activityIdeas: ["Tally counting jars", "Group counting games", "Unifix cubes"],
        curriculum: ["AC9M1N01"],
        activities: [mc({ min: 10, max: 50, mode: "count_objects" }), tr({ min: 10, max: 50 }), no(1, 50, 4, true)],
      },
      {
        id: "y1-w1-l3",
        week: 1, lesson: 3,
        title: "Order and write numbers to 50",
        focus: "Order and write numbers to 50",
        activityIdeas: ["Cut and paste sequences", "Number ladder races"],
        curriculum: ["AC9M1N01"],
        activities: [no(1, 50, 5, true), no(1, 50, 5, false), tr({ min: 1, max: 50 })],
      },
    ],
  },
  {
    id: "y1-w2",
    week: 2,
    topic: "Numbers to 120",
    curriculum: ["AC9M1N01"],
    lessons: [
      {
        id: "y1-w2-l1",
        week: 2, lesson: 1,
        title: "Recognise and read numbers to 120",
        focus: "Recognise and read numbers to 120",
        activityIdeas: ["100s charts", "Number flip cards", "Find and circle"],
        curriculum: ["AC9M1N01"],
        activities: [mc({ min: 1, max: 120, mode: "identify_number" }), no(1, 120, 4, true), tr({ min: 50, max: 120 })],
      },
      {
        id: "y1-w2-l2",
        week: 2, lesson: 2,
        title: "Order and compare numbers to 120",
        focus: "Order and compare numbers to 120",
        activityIdeas: ["Greater/less than games", "Cards and clotheslines"],
        curriculum: ["AC9M1N01"],
        activities: [no(1, 120, 5, true), no(1, 120, 5, false), mc({ min: 1, max: 120, mode: "greater_less" })],
      },
      {
        id: "y1-w2-l3",
        week: 2, lesson: 3,
        title: "Use number lines and charts",
        focus: "Use number lines and charts",
        activityIdeas: ["Number line jumps", "Partner place point"],
        curriculum: ["AC9M1N01"],
        activities: [nl(0, 100, 10), mc({ min: 1, max: 100, mode: "number_line" }), tr({ min: 1, max: 100 })],
      },
    ],
  },
  {
    id: "y1-w3",
    week: 3,
    topic: "Place Value & Partitioning",
    curriculum: ["AC9M1N02"],
    lessons: [
      {
        id: "y1-w3-l1",
        week: 3, lesson: 1,
        title: "Identify tens and ones in 2-digit numbers",
        focus: "Identify tens and ones in 2-digit numbers",
        activityIdeas: ["Base-ten blocks", "Tens and ones games"],
        curriculum: ["AC9M1N02"],
        activities: [pvb(10, 99), mc({ min: 10, max: 99, mode: "identify_place" }), tr({ min: 10, max: 99, mode: "identify_number" })],
      },
      {
        id: "y1-w3-l2",
        week: 3, lesson: 2,
        title: "Partition numbers in different ways",
        focus: "Partition numbers in different ways",
        activityIdeas: ["Dice rolls with place value mats", "Bundle and break"],
        curriculum: ["AC9M1N02"],
        activities: [pe(10, 99), mc({ min: 10, max: 99, mode: "partition" }), tr({ min: 10, max: 99, mode: "flexible_partition" })],
      },
      {
        id: "y1-w3-l3",
        week: 3, lesson: 3,
        title: "Model numbers using materials",
        focus: "Model numbers using materials",
        activityIdeas: ["Straws", "MAB", "Craft sticks"],
        curriculum: ["AC9M1N02"],
        activities: [pvb(10, 99), mc({ min: 10, max: 99, mode: "build_number" }), tr({ min: 10, max: 99 })],
      },
    ],
  },
  {
    id: "y1-w4",
    week: 4,
    topic: "Grouping & Skip Counting",
    curriculum: ["AC9M1N03"],
    lessons: [
      {
        id: "y1-w4-l1",
        week: 4, lesson: 1,
        title: "Group objects into equal sets",
        focus: "Group objects into equal sets",
        activityIdeas: ["Group and count", "Circle sets", "Group grab bags"],
        curriculum: ["AC9M1N03"],
        activities: [eg(5, 5), mc({ min: 2, max: 25, mode: "equal_groups" }), tr({ min: 2, max: 25 })],
      },
      {
        id: "y1-w4-l2",
        week: 4, lesson: 2,
        title: "Skip count by 2s, 5s and 10s",
        focus: "Skip count by 2s, 5s and 10s",
        activityIdeas: ["Skip count jump mats", "Singing games"],
        curriculum: ["AC9M1N03"],
        activities: [sc(2, 20), sc(5, 50), sc(10, 100)],
      },
      {
        id: "y1-w4-l3",
        week: 4, lesson: 3,
        title: "Quantify collections by grouping",
        focus: "Quantify collections by grouping",
        activityIdeas: ["Sorting races", "Collection building"],
        curriculum: ["AC9M1N03"],
        activities: [eg(6, 6), mc({ min: 4, max: 36, mode: "count_groups" }), tr({ min: 4, max: 36 })],
      },
    ],
  },
  {
    id: "y1-w5",
    week: 5,
    topic: "Addition to 20",
    curriculum: ["AC9M1N04"],
    lessons: [
      {
        id: "y1-w5-l1",
        week: 5, lesson: 1,
        title: "Use objects to add",
        focus: "Use objects to add",
        activityIdeas: ["Counters", "Number stories", "Match and solve"],
        curriculum: ["AC9M1N04"],
        activities: [add(1, 20, "count_on"), mc({ min: 1, max: 20, mode: "add_objects" }), tr({ min: 1, max: 20 })],
      },
      {
        id: "y1-w5-l2",
        week: 5, lesson: 2,
        title: "Use part-part-whole to add",
        focus: "Use part-part-whole to add",
        activityIdeas: ["PPP mats", "Story problems", "Rainbow facts"],
        curriculum: ["AC9M1N04"],
        activities: [pe(1, 20), add(1, 20, "part_part_whole"), mc({ min: 1, max: 20, mode: "missing_part" })],
      },
      {
        id: "y1-w5-l3",
        week: 5, lesson: 3,
        title: "Use mental strategies to add",
        focus: "Use mental strategies to add",
        activityIdeas: ["Near doubles", "Number fact flash cards"],
        curriculum: ["AC9M1N04"],
        activities: [add(5, 20, "near_doubles"), add(5, 20, "doubles"), mc({ min: 1, max: 20, mode: "mental_add" })],
      },
    ],
  },
  {
    id: "y1-w6",
    week: 6,
    topic: "Subtraction to 20",
    curriculum: ["AC9M1N04"],
    lessons: [
      {
        id: "y1-w6-l1",
        week: 6, lesson: 1,
        title: "Use objects to subtract",
        focus: "Concrete subtraction (take away)",
        activityIdeas: ["Take away dots", "Cross out mode", "Start with..."],
        curriculum: ["AC9M1N04"],
        activities: [sub(1, 20, "jump"), mc({ min: 1, max: 20, mode: "subtract_objects" }), tr({ min: 1, max: 20 })],
      },
      {
        id: "y1-w6-l2",
        week: 6, lesson: 2,
        title: "Part–part–whole for subtraction",
        focus: "Missing part & subtraction structure",
        activityIdeas: ["Missing part", "Build it with dots", "Bar model"],
        curriculum: ["AC9M1N04"],
        activities: [sub(1, 20, "fact_strategy"), pe(1, 20), mc({ min: 1, max: 20, mode: "missing_part" })],
      },
      {
        id: "y1-w6-l3",
        week: 6, lesson: 3,
        title: "Mental strategies to subtract",
        focus: "Make 10, fact families, count up",
        activityIdeas: ["Make 10 backwards", "Fact families", "Count up"],
        curriculum: ["AC9M1N04"],
        activities: [sub(1, 20, "fact_strategy"), ff(), mc({ min: 1, max: 20, mode: "count_up" })],
      },
    ],
  },
  {
    id: "y1-w7",
    week: 7,
    topic: "Mixed Addition & Subtraction",
    curriculum: ["AC9M1N04", "AC9M1N05"],
    lessons: [
      {
        id: "y1-w7-l1",
        week: 7, lesson: 1,
        title: "Choose operation for story problems",
        focus: "Choose operation for story problems",
        activityIdeas: ["Sorting equations", "Story match cards"],
        curriculum: ["AC9M1N04", "AC9M1N05"],
        activities: [wp("two_step_problem"), mc({ min: 1, max: 20, mode: "operation_choice" }), tr({ min: 1, max: 20 })],
      },
      {
        id: "y1-w7-l2",
        week: 7, lesson: 2,
        title: "Apply addition and subtraction to real-life",
        focus: "Apply addition and subtraction to real-life",
        activityIdeas: ["Play shops", "Roleplay money exchange"],
        curriculum: ["AC9M1N04", "AC9M1N05"],
        activities: [wp("shop_transactions"), mc({ min: 1, max: 20, mode: "word_problem" }), tr({ min: 1, max: 20 })],
      },
      {
        id: "y1-w7-l3",
        week: 7, lesson: 3,
        title: "Solve simple money problems",
        focus: "Solve simple money problems",
        activityIdeas: ["Play coins", "Count and compare"],
        curriculum: ["AC9M1N04", "AC9M1N05"],
        activities: [wp("budgeting"), mc({ min: 1, max: 20, mode: "money" }), tr({ min: 1, max: 20 })],
      },
    ],
  },
  {
    id: "y1-w8",
    week: 8,
    topic: "Problem Solving with Addition",
    curriculum: ["AC9M1N05"],
    lessons: [
      {
        id: "y1-w8-l1",
        week: 8, lesson: 1,
        title: "Model additive situations",
        focus: "Model additive situations",
        activityIdeas: ["Diagramming problems", "Draw and solve"],
        curriculum: ["AC9M1N05"],
        activities: [wp("two_step_problem"), add(1, 20, "split"), mc({ min: 1, max: 20, mode: "additive_model" })],
      },
      {
        id: "y1-w8-l2",
        week: 8, lesson: 2,
        title: "Use diagrams to represent problems",
        focus: "Use diagrams to represent problems",
        activityIdeas: ["Picture story math", "Link cubes"],
        curriculum: ["AC9M1N05"],
        activities: [wp("two_step_problem"), mc({ min: 1, max: 20, mode: "diagram_problem" }), tr({ min: 1, max: 20 })],
      },
      {
        id: "y1-w8-l3",
        week: 8, lesson: 3,
        title: "Use strategies to solve money problems",
        focus: "Use strategies to solve money problems",
        activityIdeas: ["Simple receipt games", "Add the bill"],
        curriculum: ["AC9M1N05"],
        activities: [wp("budgeting"), mc({ min: 1, max: 20, mode: "money_strategy" }), tr({ min: 1, max: 20 })],
      },
    ],
  },
  {
    id: "y1-w9",
    week: 9,
    topic: "Equal Sharing",
    curriculum: ["AC9M1N06"],
    lessons: [
      {
        id: "y1-w9-l1",
        week: 9, lesson: 1,
        title: "Share objects into equal groups",
        focus: "Share objects into equal groups",
        activityIdeas: ["Divide playdough", "Counters", "Mini-erasers"],
        curriculum: ["AC9M1N06"],
        activities: [dg("sharing"), mc({ min: 2, max: 20, mode: "share_equally" }), tr({ min: 2, max: 20 })],
      },
      {
        id: "y1-w9-l2",
        week: 9, lesson: 2,
        title: "Solve sharing problems using diagrams",
        focus: "Solve sharing problems using diagrams",
        activityIdeas: ["Draw circles and share in groups"],
        curriculum: ["AC9M1N06"],
        activities: [dg("sharing"), mc({ min: 2, max: 20, mode: "sharing_diagram" }), tr({ min: 2, max: 20 })],
      },
      {
        id: "y1-w9-l3",
        week: 9, lesson: 3,
        title: "Model sharing using materials",
        focus: "Model sharing using materials",
        activityIdeas: ["Give and take game", "Grouping with friends"],
        curriculum: ["AC9M1N06"],
        activities: [dg("sharing"), eg(5, 5), tr({ min: 2, max: 25 })],
      },
    ],
  },
  {
    id: "y1-w10",
    week: 10,
    topic: "Grouping Strategies",
    curriculum: ["AC9M1N03", "AC9M1N06"],
    lessons: [
      {
        id: "y1-w10-l1",
        week: 10, lesson: 1,
        title: "Group using skip counting",
        focus: "Group using skip counting",
        activityIdeas: ["Skip count puzzles", "Group jumping game"],
        curriculum: ["AC9M1N03", "AC9M1N06"],
        activities: [sc(2, 20), eg(5, 5), tr({ min: 4, max: 25 })],
      },
      {
        id: "y1-w10-l2",
        week: 10, lesson: 2,
        title: "Use diagrams to model grouping",
        focus: "Use diagrams to model grouping",
        activityIdeas: ["Draw-it-out challenges", "Fill and match"],
        curriculum: ["AC9M1N06"],
        activities: [eg(6, 6), mc({ min: 4, max: 36, mode: "grouping_diagram" }), tr({ min: 4, max: 36 })],
      },
      {
        id: "y1-w10-l3",
        week: 10, lesson: 3,
        title: "Solve problems involving equal grouping",
        focus: "Solve problems involving equal grouping",
        activityIdeas: ["Mini-missions: packing", "Sharing games"],
        curriculum: ["AC9M1N06"],
        activities: [eg(5, 6), sc(5, 50), tr({ min: 5, max: 30 })],
      },
    ],
  },
  {
    id: "y1-w11",
    week: 11,
    topic: "Fluency Practice",
    curriculum: ["AC9M1N04"],
    lessons: [
      {
        id: "y1-w11-l1",
        week: 11, lesson: 1,
        title: "Recall facts to 10 and 20",
        focus: "Recall facts to 10 and 20",
        activityIdeas: ["Bingo", "Flash facts", "Partner grid race"],
        curriculum: ["AC9M1N04"],
        activities: [add(1, 20, "doubles"), ff(), mc({ min: 1, max: 20, mode: "fact_recall" })],
      },
      {
        id: "y1-w11-l2",
        week: 11, lesson: 2,
        title: "Use doubles and near doubles",
        focus: "Use doubles and near doubles",
        activityIdeas: ["Doubles match", "Flip-and-add cards"],
        curriculum: ["AC9M1N04"],
        activities: [add(5, 20, "doubles"), add(5, 20, "near_doubles"), tr({ min: 1, max: 20 })],
      },
      {
        id: "y1-w11-l3",
        week: 11, lesson: 3,
        title: "Apply number facts in games",
        focus: "Apply number facts in games",
        activityIdeas: ["Math fact board games"],
        curriculum: ["AC9M1N04"],
        activities: [add(1, 20, "friendly_numbers"), sub(1, 20, "fact_strategy"), mc({ min: 1, max: 20, mode: "apply_facts" })],
      },
    ],
  },
  {
    id: "y1-w12",
    week: 12,
    topic: "Assessment & Review",
    curriculum: ["ALL"],
    lessons: [
      {
        id: "y1-w12-l1",
        week: 12, lesson: 1,
        title: "Check understanding across all topics",
        focus: "Check understanding across all topics",
        activityIdeas: ["One-on-one check-ins", "Visual prompts"],
        curriculum: ["ALL"],
        activities: [no(1, 100, 4, true), mc({ min: 1, max: 100, mode: "mixed_review" }), tr({ min: 1, max: 100 })],
      },
      {
        id: "y1-w12-l2",
        week: 12, lesson: 2,
        title: "Targeted revision activities",
        focus: "Targeted revision activities",
        activityIdeas: ["Small group games", "Target station activities"],
        curriculum: ["ALL"],
        activities: [pvb(10, 99), add(1, 20, "split"), mc({ min: 1, max: 99, mode: "targeted_revision" })],
      },
      {
        id: "y1-w12-l3",
        week: 12, lesson: 3,
        title: "Fun games and consolidation",
        focus: "Fun games and consolidation",
        activityIdeas: ["Quiz games", "Rotations", "Treasure map tasks"],
        curriculum: ["ALL"],
        activities: [no(1, 120, 5, true), add(1, 20, "near_doubles"), tr({ min: 1, max: 100 })],
      },
    ],
  },
];

export const YEAR1_PROGRAM: WeekPlan[] = normalizeWeekPlans(1, YEAR1_PROGRAM_RAW);

export function getYear1Week(week: number): WeekPlan | undefined {
  return YEAR1_PROGRAM.find((w) => w.week === week);
}
