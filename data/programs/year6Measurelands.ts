import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

// Measurelands Level 6 (Year 6) — program plan shell only.
//
// This stores the 8-week "Master Measurement" flow without implementing lesson
// generators yet. Placeholder lessons still resolve safely inside
// realm_id=measurement and record no progress until real generators replace them.
const YEAR6_MEASURELANDS_CURRICULUM: CurriculumCode[] = ["ALL"];

const WEEK_PLANS = [
  {
    topic: "Area Formula",
    focus: "Discover and use Area = Length × Width.",
    lessons: [
      ["Discover the Formula", "Rows and columns become length × width."],
      ["Calculate Area", "Use the rectangle area formula."],
      ["Area Investigations", "Solve practical rectangle area problems."],
    ],
  },
  {
    topic: "Composite Area",
    focus: "Split composite rectangles, calculate each part, then combine.",
    lessons: [
      ["Split the Shape", "Break composite rectangles into simpler parts."],
      ["Find Composite Area", "Calculate and combine rectangle areas."],
      ["Design Problems", "Use composite area in gardens, buildings and playgrounds."],
    ],
  },
  {
    topic: "Volume",
    focus: "Understand volume using cubic units and cube arrays.",
    lessons: [
      ["Meet Volume", "Introduce cubic units as 3D measurement."],
      ["Build Volume", "Build and count cube arrays."],
      ["Volume Problems", "Solve box, storage and container problems."],
    ],
  },
  {
    topic: "Metric Conversions",
    focus: "Convert between metric units using the metric ladder (powers of 10).",
    lessons: [
      ["The Metric Ladder", "Convert length units with the powers-of-10 ladder."],
      ["Mass & Capacity", "Convert mass and capacity units both ways."],
      ["Convert & Solve", "Use decimals to solve real conversion problems."],
    ],
  },
  {
    topic: "Advanced Time",
    focus: "Solve timetable, elapsed time and travel planning problems.",
    lessons: [
      ["Complex Timetables", "Read and reason with detailed schedules."],
      ["Multi-Step Elapsed Time", "Solve elapsed time problems with more than one step."],
      ["Travel Planner", "Plan journeys using flights, connections and decisions."],
    ],
  },
  {
    topic: "Angle Reasoning",
    focus: "Use angle facts to solve missing-angle problems.",
    lessons: [
      ["Missing Angles", "Find simple adjacent missing angles."],
      ["Angles on a Straight Line", "Use straight-line angle reasoning."],
      ["Angle Investigations", "Apply angle reasoning to real-world contexts."],
    ],
  },
  {
    topic: "Measurement Optimisation",
    focus: "Choose the best tool, unit and strategy for professional problems.",
    lessons: [
      ["Best Tool", "Choose efficient tools for measurement jobs."],
      ["Best Strategy", "Choose the strategy that fits the problem."],
      ["Professional Decisions", "Justify measurement decisions as builders, surveyors and scientists."],
    ],
  },
  {
    topic: "Master Engineer Project",
    focus: "Complete authentic multi-skill engineering investigations.",
    lessons: [
      ["Design a Community Park", "Use length, area, perimeter, volume, angles and time."],
      ["Engineer Challenge", "Solve a large connected design project."],
      ["Master Measurelands Mission", "Complete the final Level 6 engineering challenge."],
    ],
  },
] as const;

function buildLesson(week: number, lesson: number): Lesson {
  const weekPlan = WEEK_PLANS[week - 1];
  const lessonPlan = weekPlan.lessons[lesson - 1];
  return {
    id: `y6-measurement-w${week}-l${lesson}`,
    week,
    lesson,
    title: lessonPlan[0],
    focus: lessonPlan[1],
    activityIdeas: [
      "Reason about the problem.",
      "Choose an efficient strategy.",
      "Solve and justify the measurement decision.",
    ],
    curriculum: YEAR6_MEASURELANDS_CURRICULUM,
  };
}

const YEAR6_MEASURELANDS_RAW: WeekPlan[] = Array.from({ length: 8 }, (_, index) => {
  const week = index + 1;
  const weekPlan = WEEK_PLANS[index];
  return {
    id: `y6-measurement-w${week}`,
    week,
    topic: weekPlan.topic,
    focus: weekPlan.focus,
    curriculum: YEAR6_MEASURELANDS_CURRICULUM,
    lessons: [1, 2, 3].map((lesson) => buildLesson(week, lesson)),
  };
});

export const YEAR6_MEASURELANDS_PROGRAM = normalizeWeekPlans(
  6,
  YEAR6_MEASURELANDS_RAW,
);

export const YEAR6_MEASURELANDS_META = {
  realm: "Measurelands",
  strand: "Measurement",
  levelLabel: "Level 6",
  legend: "Meazurex Timewielder",
  legendLine: "Meazurex",
  curriculum: YEAR6_MEASURELANDS_CURRICULUM,
} as const;
