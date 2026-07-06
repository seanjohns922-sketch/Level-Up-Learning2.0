import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

// Measurelands Level 4 (Year 4) — Measurement.
//
// Level 4 identity: students move from using tools to solving real measurement
// problems. The program flow is Interpret -> Solve -> Apply.
//
// Core AC v9 alignment (indicative — finalised during curriculum planning):
// AC9M4M01 — measure and compare using scaled instruments and appropriate units.
// AC9M4M02 — units of time and conversions; solve problems involving duration.
// AC9M4M03 — length, area and perimeter of shapes using appropriate metric units.
const YEAR4_MEASURELANDS_CURRICULUM: CurriculumCode[] = [
  "AC9M4M01",
  "AC9M4M02",
  "AC9M4M03",
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
    id: `y4-measurement-w${week}-l${lesson}`,
    week,
    lesson,
    title,
    focus,
    activityIdeas,
    curriculum,
  };
}

const YEAR4_MEASURELANDS_RAW: WeekPlan[] = [
  {
    id: "y4-measurement-w1",
    week: 1,
    topic: "Precision Measuring",
    curriculum: ["AC9M4M01"],
    lessons: [
      buildLesson(1, 1, "Reading Between the Marks", "Length: interpret scaled length instruments and partial units.", ["Scaled rulers", "Partial units", "Read between marks"], ["AC9M4M01"]),
      buildLesson(1, 2, "Measure Precisely", "Length: measure objects precisely using scaled instruments.", ["Precise measuring", "Mark positions", "Record measurements"], ["AC9M4M01"]),
      buildLesson(1, 3, "Compare Precise Measurements", "Length: compare and reason with precise measurements.", ["Compare measurements", "Find differences", "Use precise units"], ["AC9M4M01"]),
    ],
  },
  {
    id: "y4-measurement-w2",
    week: 2,
    topic: "Scales & Jugs",
    curriculum: ["AC9M4M01"],
    lessons: [
      buildLesson(2, 1, "Read the Scale", "Mass: read scaled and digital mass instruments.", ["Read scales", "Scaled marks", "Digital readings"], ["AC9M4M01"]),
      buildLesson(2, 2, "Read the Measuring Jug", "Capacity: read measuring jugs using marked scales.", ["Measuring jugs", "Capacity scales", "Read liquid levels"], ["AC9M4M01"]),
      buildLesson(2, 3, "Compare Mass and Capacity", "Measurement: compare mass and capacity readings from instruments.", ["Compare readings", "Mass vs capacity", "Use units"], ["AC9M4M01"]),
    ],
  },
  {
    id: "y4-measurement-w3",
    week: 3,
    topic: "Temperature",
    curriculum: ["AC9M4M01"],
    lessons: [
      buildLesson(3, 1, "Meet the Thermometer", "Temperature: recognise thermometers and degrees Celsius.", ["Thermometers", "Degrees Celsius", "Temperature benchmarks"], ["AC9M4M01"]),
      buildLesson(3, 2, "Read the Temperature", "Temperature: read temperatures in degrees Celsius.", ["Read thermometers", "Marked scales", "Celsius readings"], ["AC9M4M01"]),
      buildLesson(3, 3, "Compare Temperatures", "Temperature: compare hotter and colder readings.", ["Compare temperatures", "Hotter or colder", "Temperature differences"], ["AC9M4M01"]),
    ],
  },
  {
    id: "y4-measurement-w4",
    week: 4,
    topic: "Perimeter",
    curriculum: ["AC9M4M03"],
    lessons: [
      buildLesson(4, 1, "Measure the Outside", "Perimeter: recognise perimeter as the distance around a boundary.", ["Outside boundary", "Trace around", "Perimeter meaning"], ["AC9M4M03"]),
      buildLesson(4, 2, "Find the Perimeter", "Perimeter: calculate the total distance around simple shapes.", ["Add side lengths", "Total boundary", "Perimeter count"], ["AC9M4M03"]),
      buildLesson(4, 3, "Perimeter Problems", "Perimeter: solve real-world boundary measurement problems.", ["Real spaces", "Perimeter reasoning", "Problem solving"], ["AC9M4M03"]),
    ],
  },
  {
    id: "y4-measurement-w5",
    week: 5,
    topic: "Area",
    curriculum: ["AC9M4M03"],
    lessons: [
      buildLesson(5, 1, "Measure Area", "Area: measure space covered using square units, including part units.", ["Square units", "Space covered", "Part units"], ["AC9M4M03"]),
      buildLesson(5, 2, "Compare Area", "Area: compare spaces using measured area.", ["Compare areas", "More space", "Less space"], ["AC9M4M03"]),
      buildLesson(5, 3, "Area Problems", "Area: solve real-world space-covering problems.", ["Area reasoning", "Covered space", "Problem solving"], ["AC9M4M03"]),
    ],
  },
  {
    id: "y4-measurement-w6",
    week: 6,
    topic: "Time Problems",
    curriculum: ["AC9M4M02"],
    lessons: [
      buildLesson(6, 1, "Convert Time Units", "Time: convert between common units of time.", ["Time units", "Conversions", "Equivalent durations"], ["AC9M4M02"]),
      buildLesson(6, 2, "Elapsed Time", "Time: work out how much time has passed.", ["Start time", "End time", "Elapsed duration"], ["AC9M4M02"]),
      buildLesson(6, 3, "Solve Time Problems", "Time: solve real-world duration and am/pm problems.", ["Duration problems", "am and pm", "Time reasoning"], ["AC9M4M02"]),
    ],
  },
  {
    id: "y4-measurement-w7",
    week: 7,
    topic: "Angles",
    curriculum: ["AC9M4M03"],
    lessons: [
      buildLesson(7, 1, "Meet Angles", "Angles: recognise angles as turns and corners.", ["Angles", "Turns", "Corners"], ["AC9M4M03"]),
      buildLesson(7, 2, "Compare Angles", "Angles: compare angles to right angles.", ["Right angle", "Smaller angles", "Larger angles"], ["AC9M4M03"]),
      buildLesson(7, 3, "Angle Explorer", "Angles: identify and reason about angles in familiar shapes and spaces.", ["Find angles", "Compare angles", "Angle reasoning"], ["AC9M4M03"]),
    ],
  },
  {
    id: "y4-measurement-w8",
    week: 8,
    topic: "Measurement Investigations",
    curriculum: YEAR4_MEASURELANDS_CURRICULUM,
    lessons: [
      buildLesson(8, 1, "Design a Playground", "Investigation: use perimeter, area and length in a playground design problem.", ["Design problem", "Perimeter", "Area and length"], YEAR4_MEASURELANDS_CURRICULUM),
      buildLesson(8, 2, "Science Lab", "Investigation: use temperature, capacity and mass in a science lab problem.", ["Temperature", "Capacity", "Mass"], YEAR4_MEASURELANDS_CURRICULUM),
      buildLesson(8, 3, "Measurement Mission", "Investigation: solve mixed real-world problems using all Level 4 measurement skills.", ["Mixed measurement", "Choose strategies", "Apply learning"], YEAR4_MEASURELANDS_CURRICULUM),
    ],
  },
];

export const YEAR4_MEASURELANDS_PROGRAM = normalizeWeekPlans(
  4,
  YEAR4_MEASURELANDS_RAW,
);

export const YEAR4_MEASURELANDS_META = {
  realm: "Measurelands",
  strand: "Measurement",
  levelLabel: "Level 4",
  legend: "Meazurex Tracker",
  legendLine: "Meazurex",
  curriculum: YEAR4_MEASURELANDS_CURRICULUM,
} as const;
