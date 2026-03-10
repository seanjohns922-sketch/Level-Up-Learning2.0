export type CurriculumCode =
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
  | "ALL";

export type Lesson = {
  id: string;
  week: number;
  lesson: number;
  title: string;
  focus: string;
  activityIdeas: string[];
  curriculum: CurriculumCode[];
  activityType?: string;
  config?: Record<string, unknown>;
};

export type WeekPlan = {
  id: string;
  week: number;
  topic: string;
  lessons: Lesson[];
  curriculum: CurriculumCode[];
};

export const YEAR1_PROGRAM: WeekPlan[] = [
  {
    id: "y1-w1",
    week: 1,
    topic: "Counting & Recognising Numbers to 50",
    curriculum: ["AC9M1N01"],
    lessons: [
      {
        id: "y1-w1-l1",
        week: 1,
        lesson: 1,
        title: "Recognise and read numbers to 50",
        focus: "Recognise and read numbers to 50",
        activityIdeas: ["Number flashcards", "Number hunts", "Classroom walk-around"],
        curriculum: ["AC9M1N01"],
      },
      {
        id: "y1-w1-l2",
        week: 1,
        lesson: 2,
        title: "Count objects to 50",
        focus: "Count objects to 50",
        activityIdeas: ["Tally counting jars", "Group counting games", "Unifix cubes"],
        curriculum: ["AC9M1N01"],
      },
      {
        id: "y1-w1-l3",
        week: 1,
        lesson: 3,
        title: "Order and write numbers to 50",
        focus: "Order and write numbers to 50",
        activityIdeas: ["Cut and paste sequences", "Number ladder races"],
        curriculum: ["AC9M1N01"],
      },
    ],
  },
  {
    id: "y1-w2",
    week: 2,
    topic: "Counting & Recognising Numbers to 120",
    curriculum: ["AC9M1N01"],
    lessons: [
      {
        id: "y1-w2-l1",
        week: 2,
        lesson: 1,
        title: "Recognise and read numbers to 120",
        focus: "Recognise and read numbers to 120",
        activityIdeas: ["100s charts", "Number flip cards", "Find and circle"],
        curriculum: ["AC9M1N01"],
      },
      {
        id: "y1-w2-l2",
        week: 2,
        lesson: 2,
        title: "Order and compare numbers to 120",
        focus: "Order and compare numbers to 120",
        activityIdeas: ["Greater/less than games", "Cards and clotheslines"],
        curriculum: ["AC9M1N01"],
      },
      {
        id: "y1-w2-l3",
        week: 2,
        lesson: 3,
        title: "Use number lines and charts",
        focus: "Use number lines and charts",
        activityIdeas: ["Number line jumps", "Partner place point"],
        curriculum: ["AC9M1N01"],
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
        week: 3,
        lesson: 1,
        title: "Identify tens and ones in 2-digit numbers",
        focus: "Identify tens and ones in 2-digit numbers",
        activityIdeas: ["Base-ten blocks", "Tens and ones games"],
        curriculum: ["AC9M1N02"],
      },
      {
        id: "y1-w3-l2",
        week: 3,
        lesson: 2,
        title: "Partition numbers in different ways",
        focus: "Partition numbers in different ways",
        activityIdeas: ["Dice rolls with place value mats", "Bundle and break"],
        curriculum: ["AC9M1N02"],
      },
      {
        id: "y1-w3-l3",
        week: 3,
        lesson: 3,
        title: "Model numbers using materials",
        focus: "Model numbers using materials",
        activityIdeas: ["Straws", "MAB", "Craft sticks"],
        curriculum: ["AC9M1N02"],
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
        week: 4,
        lesson: 1,
        title: "Group objects into equal sets",
        focus: "Group objects into equal sets",
        activityIdeas: ["Group and count", "Circle sets", "Group grab bags"],
        curriculum: ["AC9M1N03"],
      },
      {
        id: "y1-w4-l2",
        week: 4,
        lesson: 2,
        title: "Skip count by 2s, 5s and 10s",
        focus: "Skip count by 2s, 5s and 10s",
        activityIdeas: ["Skip count jump mats", "Singing games"],
        curriculum: ["AC9M1N03"],
      },
      {
        id: "y1-w4-l3",
        week: 4,
        lesson: 3,
        title: "Quantify collections by grouping",
        focus: "Quantify collections by grouping",
        activityIdeas: ["Sorting races", "Collection building"],
        curriculum: ["AC9M1N03"],
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
        week: 5,
        lesson: 1,
        title: "Use objects to add",
        focus: "Use objects to add",
        activityIdeas: ["Counters", "Number stories", "Match and solve"],
        curriculum: ["AC9M1N04"],
      },
      {
        id: "y1-w5-l2",
        week: 5,
        lesson: 2,
        title: "Use part-part-whole to add",
        focus: "Use part-part-whole to add",
        activityIdeas: ["PPP mats", "Story problems", "Rainbow facts"],
        curriculum: ["AC9M1N04"],
      },
      {
        id: "y1-w5-l3",
        week: 5,
        lesson: 3,
        title: "Use mental strategies to add",
        focus: "Use mental strategies to add",
        activityIdeas: ["Near doubles", "Number fact flash cards"],
        curriculum: ["AC9M1N04"],
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
        week: 6,
        lesson: 1,
        title: "Use objects to subtract",
        focus: "Concrete subtraction (take away)",
        activityIdeas: ["Take away dots", "Cross out mode", "Start with..."],
        curriculum: ["AC9M1N04"],
      },
      {
        id: "y1-w6-l2",
        week: 6,
        lesson: 2,
        title: "Part–part–whole for subtraction",
        focus: "Missing part & subtraction structure",
        activityIdeas: ["Missing part", "Build it with dots", "Bar model"],
        curriculum: ["AC9M1N04"],
      },
      {
        id: "y1-w6-l3",
        week: 6,
        lesson: 3,
        title: "Mental strategies to subtract",
        focus: "Make 10, fact families, count up",
        activityIdeas: ["Make 10 backwards", "Fact families", "Count up"],
        curriculum: ["AC9M1N04"],
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
        week: 7,
        lesson: 1,
        title: "Choose operation for story problems",
        focus: "Choose operation for story problems",
        activityIdeas: ["Sorting equations", "Story match cards"],
        curriculum: ["AC9M1N04", "AC9M1N05"],
      },
      {
        id: "y1-w7-l2",
        week: 7,
        lesson: 2,
        title: "Apply addition and subtraction to real-life",
        focus: "Apply addition and subtraction to real-life",
        activityIdeas: ["Play shops", "Roleplay money exchange"],
        curriculum: ["AC9M1N04", "AC9M1N05"],
      },
      {
        id: "y1-w7-l3",
        week: 7,
        lesson: 3,
        title: "Solve simple money problems",
        focus: "Solve simple money problems",
        activityIdeas: ["Play coins", "Count and compare"],
        curriculum: ["AC9M1N04", "AC9M1N05"],
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
        week: 8,
        lesson: 1,
        title: "Model additive situations",
        focus: "Model additive situations",
        activityIdeas: ["Diagramming problems", "Draw and solve"],
        curriculum: ["AC9M1N05"],
      },
      {
        id: "y1-w8-l2",
        week: 8,
        lesson: 2,
        title: "Use diagrams to represent problems",
        focus: "Use diagrams to represent problems",
        activityIdeas: ["Picture story math", "Link cubes"],
        curriculum: ["AC9M1N05"],
      },
      {
        id: "y1-w8-l3",
        week: 8,
        lesson: 3,
        title: "Use strategies to solve money problems",
        focus: "Use strategies to solve money problems",
        activityIdeas: ["Simple receipt games", "Add the bill"],
        curriculum: ["AC9M1N05"],
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
        week: 9,
        lesson: 1,
        title: "Share objects into equal groups",
        focus: "Share objects into equal groups",
        activityIdeas: ["Divide playdough", "Counters", "Mini-erasers"],
        curriculum: ["AC9M1N06"],
      },
      {
        id: "y1-w9-l2",
        week: 9,
        lesson: 2,
        title: "Solve sharing problems using diagrams",
        focus: "Solve sharing problems using diagrams",
        activityIdeas: ["Draw circles and share in groups"],
        curriculum: ["AC9M1N06"],
      },
      {
        id: "y1-w9-l3",
        week: 9,
        lesson: 3,
        title: "Model sharing using materials",
        focus: "Model sharing using materials",
        activityIdeas: ["Give and take game", "Grouping with friends"],
        curriculum: ["AC9M1N06"],
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
        week: 10,
        lesson: 1,
        title: "Group using skip counting",
        focus: "Group using skip counting",
        activityIdeas: ["Skip count puzzles", "Group jumping game"],
        curriculum: ["AC9M1N03", "AC9M1N06"],
      },
      {
        id: "y1-w10-l2",
        week: 10,
        lesson: 2,
        title: "Use diagrams to model grouping",
        focus: "Use diagrams to model grouping",
        activityIdeas: ["Draw-it-out challenges", "Fill and match"],
        curriculum: ["AC9M1N06"],
      },
      {
        id: "y1-w10-l3",
        week: 10,
        lesson: 3,
        title: "Solve problems involving equal grouping",
        focus: "Solve problems involving equal grouping",
        activityIdeas: ["Mini-missions: packing", "Sharing games"],
        curriculum: ["AC9M1N06"],
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
        week: 11,
        lesson: 1,
        title: "Recall facts to 10 and 20",
        focus: "Recall facts to 10 and 20",
        activityIdeas: ["Bingo", "Flash facts", "Partner grid race"],
        curriculum: ["AC9M1N04"],
      },
      {
        id: "y1-w11-l2",
        week: 11,
        lesson: 2,
        title: "Use doubles and near doubles",
        focus: "Use doubles and near doubles",
        activityIdeas: ["Doubles match", "Flip-and-add cards"],
        curriculum: ["AC9M1N04"],
      },
      {
        id: "y1-w11-l3",
        week: 11,
        lesson: 3,
        title: "Apply number facts in games",
        focus: "Apply number facts in games",
        activityIdeas: ["Math fact board games"],
        curriculum: ["AC9M1N04"],
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
        week: 12,
        lesson: 1,
        title: "Check understanding across all topics",
        focus: "Check understanding across all topics",
        activityIdeas: ["One-on-one check-ins", "Visual prompts"],
        curriculum: ["ALL"],
      },
      {
        id: "y1-w12-l2",
        week: 12,
        lesson: 2,
        title: "Targeted revision activities",
        focus: "Targeted revision activities",
        activityIdeas: ["Small group games", "Target station activities"],
        curriculum: ["ALL"],
      },
      {
        id: "y1-w12-l3",
        week: 12,
        lesson: 3,
        title: "Fun games and consolidation",
        focus: "Fun games and consolidation",
        activityIdeas: ["Quiz games", "Rotations", "Treasure map tasks"],
        curriculum: ["ALL"],
      },
    ],
  },
];

export function getYear1Week(week: number): WeekPlan | undefined {
  return YEAR1_PROGRAM.find((w) => w.week === week);
}
