import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

// Measurelands Level 3 (Year 3) — Measurement.
// See MEASURELANDS_LEVEL3_PLAN.md.
//
// Core AC v9 alignment:
// AC9M3M01 — choose metric units and use benchmarks/estimates.
// AC9M3M02 — measure and compare length, mass and capacity with marked instruments.
// AC9M3M03 — estimate and compare duration using days, hours, minutes and seconds.
// AC9M3M04 — connect analog/digital time and read to the nearest minute.
//
// Week 7/8 are intentionally light perimeter/area exposure weeks to prepare for
// Year 4, not mastery units. No formulas or multiplication expectations.
const YEAR3_MEASURELANDS_CURRICULUM: CurriculumCode[] = [
  "AC9M3M01",
  "AC9M3M02",
  "AC9M3M03",
  "AC9M3M04",
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
    id: `y3-measurement-w${week}-l${lesson}`,
    week,
    lesson,
    title,
    focus,
    activityIdeas,
    curriculum,
  };
}

const YEAR3_MEASURELANDS_RAW: WeekPlan[] = [
  {
    id: "y3-measurement-w1",
    week: 1,
    topic: "Ruler Ridge",
    curriculum: ["AC9M3M01", "AC9M3M02"],
    lessons: [
      buildLesson(1, 1, "Meet the Ruler", "Length: learn how a ruler works, including zero, centimetre spaces and labelled markings.", ["Ruler parts", "Start at zero", "Centimetre spaces"], ["AC9M3M01", "AC9M3M02"]),
      buildLesson(1, 2, "Measure in Centimetres", "Length: measure objects in centimetres using a marked ruler.", ["Measure with a ruler", "Read centimetres", "Line up the object"], ["AC9M3M01"]),
      buildLesson(1, 3, "Measurement Detective", "Length: use ruler measurements to compare, find differences and check mistakes.", ["Find the difference", "Choose the correct measurement", "Check the ruler"], ["AC9M3M01"]),
    ],
  },
  {
    id: "y3-measurement-w2",
    week: 2,
    topic: "Metre Mountain",
    curriculum: ["AC9M3M01", "AC9M3M02"],
    lessons: [
      buildLesson(2, 1, "Meet the Metre", "Length: use metres as a benchmark for larger objects and spaces.", ["One metre", "Metre benchmarks", "Large lengths"], ["AC9M3M01", "AC9M3M02"]),
      buildLesson(2, 2, "Choose cm or m", "Length: choose whether centimetres or metres are the better unit for a measurement.", ["Choose the unit", "Small or large length", "cm vs m"], ["AC9M3M01"]),
      buildLesson(2, 3, "Estimate then Measure", "Length: make a sensible estimate, then measure with the right metric unit.", ["Estimate first", "Measure to check", "Reasonable estimates"], ["AC9M3M01", "AC9M3M02"]),
    ],
  },
  {
    id: "y3-measurement-w3",
    week: 3,
    topic: "Mass Works",
    curriculum: ["AC9M3M01", "AC9M3M02"],
    lessons: [
      buildLesson(3, 1, "Meet g and kg", "Mass: recognise grams and kilograms and use familiar benchmarks.", ["Grams", "Kilograms", "Mass benchmarks"], ["AC9M3M01"]),
      buildLesson(3, 2, "Compare Mass", "Mass: compare measured masses using grams and kilograms.", ["Compare mass", "Read the unit", "Greater mass"], ["AC9M3M02"]),
      buildLesson(3, 3, "Choose g or kg", "Mass: choose the sensible metric unit for measuring an object's mass.", ["Choose grams", "Choose kilograms", "Best mass unit"], ["AC9M3M01", "AC9M3M02"]),
    ],
  },
  {
    id: "y3-measurement-w4",
    week: 4,
    topic: "Capacity Lab",
    curriculum: ["AC9M3M01", "AC9M3M02"],
    lessons: [
      buildLesson(4, 1, "Meet mL and L", "Capacity: recognise millilitres and litres and use familiar benchmarks.", ["Millilitres", "Litres", "Capacity benchmarks"], ["AC9M3M01"]),
      buildLesson(4, 2, "Compare Capacity", "Capacity: compare measured capacities using millilitres and litres.", ["Compare capacity", "Read the unit", "Marked measuring jugs"], ["AC9M3M02"]),
      buildLesson(4, 3, "Choose mL or L", "Capacity: choose the sensible metric unit for measuring containers and liquids.", ["Choose millilitres", "Choose litres", "Best capacity unit"], ["AC9M3M01", "AC9M3M02"]),
    ],
  },
  {
    id: "y3-measurement-w5",
    week: 5,
    topic: "Duration Lab",
    curriculum: ["AC9M3M03"],
    lessons: [
      buildLesson(5, 1, "Minutes and Seconds", "Time: recognise seconds, minutes, hours and days as formal duration units.", ["Seconds", "Minutes", "Duration units"], ["AC9M3M03"]),
      buildLesson(5, 2, "Estimate a Duration", "Time: estimate how long familiar activities take using sensible duration units.", ["Estimate duration", "Choose seconds or minutes", "Reasonable time"], ["AC9M3M03"]),
      buildLesson(5, 3, "Compare Durations", "Time: compare durations using days, hours, minutes and seconds.", ["Compare durations", "Longer or shorter time", "Time unit relationships"], ["AC9M3M03"]),
    ],
  },
  {
    id: "y3-measurement-w6",
    week: 6,
    topic: "Minute Clockworks",
    curriculum: ["AC9M3M04"],
    lessons: [
      buildLesson(6, 1, "Five-Minute Time", "Time: read analog clocks using five-minute intervals.", ["Count by fives", "Minute hand", "Analog time"], ["AC9M3M04"]),
      buildLesson(6, 2, "Digital and Analog Time", "Time: connect digital times with analog clock faces.", ["Match digital time", "Match analog time", "Time language"], ["AC9M3M04"]),
      buildLesson(6, 3, "Read to the Minute", "Time: read clocks more precisely using minute markings.", ["Nearest minute", "Minute marks", "Precise time"], ["AC9M3M04"]),
    ],
  },
  {
    id: "y3-measurement-w7",
    week: 7,
    topic: "Perimeter Preview",
    curriculum: ["AC9M3M01", "AC9M3M02"],
    lessons: [
      buildLesson(7, 1, "Around the Edge", "Preview: recognise that some measurements go around the outside edge of a shape or space.", ["Around the edge", "Boundary", "Measure around"], ["AC9M3M01", "AC9M3M02"]),
      buildLesson(7, 2, "Trace the Boundary", "Preview: follow and count simple boundary lengths using familiar units.", ["Trace the outside", "Boundary count", "No formulas"], ["AC9M3M02"]),
      buildLesson(7, 3, "Perimeter Explorer", "Preview: solve simple edge-measuring challenges to prepare for Level 4 perimeter.", ["Edge challenge", "Measure around", "Prepare for Level 4"], ["AC9M3M02"]),
    ],
  },
  {
    id: "y3-measurement-w8",
    week: 8,
    topic: "Area Preview",
    curriculum: ["AC9M3M01", "AC9M3M02"],
    lessons: [
      buildLesson(8, 1, "Cover the Space", "Preview: recognise that area is about covering a space with equal squares.", ["Cover a space", "Equal squares", "No gaps"], ["AC9M3M01", "AC9M3M02"]),
      buildLesson(8, 2, "Count the Squares", "Preview: compare simple covered spaces by counting equal square units.", ["Count squares", "Compare covered spaces", "No formulas"], ["AC9M3M02"]),
      buildLesson(8, 3, "Area Explorer", "Preview: build and compare simple square-tile shapes to prepare for Level 4 area.", ["Build with squares", "Compare area", "Prepare for Level 4"], ["AC9M3M02"]),
    ],
  },
];

export const YEAR3_MEASURELANDS_PROGRAM = normalizeWeekPlans(
  3,
  YEAR3_MEASURELANDS_RAW,
);

export const YEAR3_MEASURELANDS_META = {
  realm: "Measurelands",
  strand: "Measurement",
  levelLabel: "Level 3",
  legend: "Meazurex Tracker",
  legendLine: "Meazurex",
  curriculum: YEAR3_MEASURELANDS_CURRICULUM,
} as const;
