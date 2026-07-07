import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

// Measurelands Level 5 (Year 5) — Measurement.
//
// Level 5 identity: students move from using measurement tools to choosing
// efficient metric units and solving practical measurement problems.
//
// Core flow: choose efficient units -> compare decimal measures -> solve
// perimeter/area/time/angle problems -> apply everything in a project.
const YEAR5_MEASURELANDS_CURRICULUM: CurriculumCode[] = [
  "AC9M5M01",
  "AC9M5M02",
  "AC9M5M03",
  "AC9M5M04",
];

function buildLesson(
  week: number,
  lesson: number,
  title: string,
  focus: string,
  activityIdeas: string[],
  curriculum: CurriculumCode[],
): Lesson {
  return {
    id: `y5-measurement-w${week}-l${lesson}`,
    week,
    lesson,
    title,
    focus,
    activityIdeas,
    curriculum,
  };
}

const YEAR5_MEASURELANDS_RAW: WeekPlan[] = [
  {
    id: "y5-measurement-w1",
    week: 1,
    topic: "Metric Mastery",
    curriculum: ["AC9M5M01"],
    lessons: [
      buildLesson(1, 1, "Choose the Best Unit", "Metric units: choose appropriate units for length, mass and capacity.", ["Choose units", "Length, mass and capacity", "Efficient measuring"], ["AC9M5M01"]),
      buildLesson(1, 2, "Smaller Units for Accuracy", "Metric units: use smaller units when a more accurate measurement is needed.", ["Smaller units", "Accuracy", "Metric decisions"], ["AC9M5M01"]),
      buildLesson(1, 3, "Mixed Metric Decisions", "Metric units: decide which metric unit best suits mixed real-world situations.", ["Mixed units", "Measurement context", "Unit reasoning"], ["AC9M5M01"]),
    ],
  },
  {
    id: "y5-measurement-w2",
    week: 2,
    topic: "Precision Measurement",
    curriculum: ["AC9M5M01"],
    lessons: [
      buildLesson(2, 1, "Measure More Accurately", "Precision: use a smaller unit as well when one unit isn't accurate enough.", ["Mixed units", "Read graduations", "Accurate measuring"], ["AC9M5M01"]),
      buildLesson(2, 2, "Mixed Metric Units", "Precision: read, compare and match mixed-unit measurements.", ["Read mixed units", "Compare measurements", "Match measurements"], ["AC9M5M01"]),
      buildLesson(2, 3, "Precision Challenges", "Precision: solve practical problems using accurate mixed-unit measurements.", ["Precise problems", "Compare accurately", "Justify choices"], ["AC9M5M01"]),
    ],
  },
  {
    id: "y5-measurement-w3",
    week: 3,
    topic: "Perimeter Pro",
    curriculum: ["AC9M5M02"],
    lessons: [
      buildLesson(3, 1, "Efficient Perimeter", "Perimeter: use efficient strategies — measure once, use twice.", ["Efficient strategies", "Equal opposite sides", "Regular shapes"], ["AC9M5M02"]),
      buildLesson(3, 2, "Irregular Perimeters", "Perimeter: find the distance around L and step shapes.", ["Irregular shapes", "Every outside side", "Accurate totals"], ["AC9M5M02"]),
      buildLesson(3, 3, "Perimeter Problems", "Perimeter: solve authentic fencing, path and survey problems.", ["Real-world perimeter", "Fences and tracks", "Survey missions"], ["AC9M5M02"]),
    ],
  },
  {
    id: "y5-measurement-w4",
    week: 4,
    topic: "Area Architects",
    curriculum: ["AC9M5M02"],
    lessons: [
      buildLesson(4, 1, "Rows and Columns", "Area: see a rectangle as equal rows and columns (the array model).", ["Rows and columns", "Arrays", "Square units"], ["AC9M5M02"]),
      buildLesson(4, 2, "Find the Area", "Area: calculate rectangle area efficiently as rows × columns.", ["Rows × columns", "Efficient area", "Explain thinking"], ["AC9M5M02"]),
      buildLesson(4, 3, "Area Problems", "Area: solve practical design problems using the array strategy.", ["Design problems", "Covered space", "Architect missions"], ["AC9M5M02"]),
    ],
  },
  {
    id: "y5-measurement-w5",
    week: 5,
    topic: "Area or Perimeter?",
    curriculum: ["AC9M5M02"],
    lessons: [
      buildLesson(5, 1, "Area or Perimeter?", "Measurement reasoning: decide whether a job needs area, perimeter, or both.", ["Area vs perimeter", "Choose the measurement", "Read the context"], ["AC9M5M02"]),
      buildLesson(5, 2, "Same Area, Different Perimeter", "Measurement reasoning: discover that shapes can share an area yet differ in perimeter.", ["Same area", "Different perimeter", "Investigate"], ["AC9M5M02"]),
      buildLesson(5, 3, "Design Challenge", "Measurement reasoning: choose the correct measurement, then solve the design problem.", ["Design decisions", "Area and perimeter", "Then solve"], ["AC9M5M02"]),
    ],
  },
  {
    id: "y5-measurement-w6",
    week: 6,
    topic: "Time Travellers",
    curriculum: ["AC9M5M03"],
    lessons: [
      buildLesson(6, 1, "24-Hour Time", "Time: read and convert between 12-hour and 24-hour time.", ["24-hour time", "Convert", "am and pm"], ["AC9M5M03"]),
      buildLesson(6, 2, "Read Timetables", "Time: interpret departures, arrivals and journeys in a timetable.", ["Timetables", "Departures", "Journey time"], ["AC9M5M03"]),
      buildLesson(6, 3, "Plan the Journey", "Time: plan journeys using timetables, 24-hour time and elapsed time.", ["Plan journeys", "Choose services", "Elapsed time"], ["AC9M5M03"]),
    ],
  },
  {
    id: "y5-measurement-w7",
    week: 7,
    topic: "Angle Masters",
    curriculum: ["AC9M5M04"],
    lessons: [
      buildLesson(7, 1, "Estimate Angles", "Angles: estimate angle sizes using benchmark angles.", ["Angle estimates", "Benchmark angles", "Degrees"], ["AC9M5M04"]),
      buildLesson(7, 2, "Measure Angles", "Angles: measure angles accurately with a dual-scale protractor.", ["Protractor", "Read the scale", "Degrees"], ["AC9M5M04"]),
      buildLesson(7, 3, "Construct Angles", "Angles: construct angles with a protractor by dragging to the degree.", ["Construct angles", "Use a protractor", "Engineering"], ["AC9M5M04"]),
    ],
  },
  {
    id: "y5-measurement-w8",
    week: 8,
    topic: "Measurement Project",
    curriculum: YEAR5_MEASURELANDS_CURRICULUM,
    lessons: [
      buildLesson(8, 1, "Plan a Sports Carnival", "Project: use time, length and area to plan a sports carnival.", ["Sports carnival", "Time and length", "Area planning"], YEAR5_MEASURELANDS_CURRICULUM),
      buildLesson(8, 2, "Design a Classroom", "Project: use area, perimeter and units to design a classroom.", ["Classroom design", "Area and perimeter", "Metric units"], YEAR5_MEASURELANDS_CURRICULUM),
      buildLesson(8, 3, "Measurement Master Project", "Project: solve a mixed practical challenge using all Level 5 skills.", ["Mixed measurement", "Practical challenge", "Master project"], YEAR5_MEASURELANDS_CURRICULUM),
    ],
  },
];

export const YEAR5_MEASURELANDS_PROGRAM = normalizeWeekPlans(
  5,
  YEAR5_MEASURELANDS_RAW,
);

export const YEAR5_MEASURELANDS_META = {
  realm: "Measurelands",
  strand: "Measurement",
  levelLabel: "Level 5",
  legend: "Meazurex Calibrator",
  legendLine: "Meazurex",
  curriculum: YEAR5_MEASURELANDS_CURRICULUM,
} as const;
