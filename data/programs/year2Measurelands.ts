import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

// Measurelands Level 2 (Year 2) — Measurement. See MEASURELANDS_LEVEL2_PLAN.md.
// AC9M2M01 (length/mass/capacity, uniform units + smaller units for accuracy),
// AC9M2M02 (read analog clock to hour/half/quarter), AC9M2M03 (date + days between).
const YEAR2_MEASURELANDS_CURRICULUM: CurriculumCode[] = [
  "AC9M2M01",
  "AC9M2M02",
  "AC9M2M03",
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
    id: `y2-measurement-w${week}-l${lesson}`,
    week,
    lesson,
    title,
    focus,
    activityIdeas,
    curriculum,
  };
}

const YEAR2_MEASURELANDS_RAW: WeekPlan[] = [
  {
    id: "y2-measurement-w1",
    week: 1,
    topic: "Unit Count Canyon",
    curriculum: ["AC9M2M01"],
    lessons: [
      buildLesson(1, 1, "How Many More?", "Length: measure two objects in uniform units and find how many more units one is than the other.", ["How many more", "Measurement difference", "Quantify the gap"], ["AC9M2M01"]),
      buildLesson(1, 2, "Order by Count", "Length: measure and order three objects from shortest to longest by unit count.", ["Order by count", "Shortest to longest", "Three objects"], ["AC9M2M01"]),
      buildLesson(1, 3, "Fair Units", "Length: measure one object with two unit sizes and reason why the count changes.", ["Fair units", "Unit size vs count", "Same object different units"], ["AC9M2M01"]),
    ],
  },
  {
    id: "y2-measurement-w2",
    week: 2,
    topic: "Measuring Masters",
    curriculum: ["AC9M2M01"],
    lessons: [
      buildLesson(2, 1, "Compare Lengths", "Length: compare measured lengths and reason about which is longer or shorter.", ["Compare lengths", "Longer or shorter", "Reason with measurements"], ["AC9M2M01"]),
      buildLesson(2, 2, "Estimate and Reason", "Length: estimate a length, then check by measuring with units.", ["Estimate and reason", "Estimate then check", "Close to the count"], ["AC9M2M01"]),
      buildLesson(2, 3, "Measuring Detective", "Length: choose the best measuring tool for an object and explain why.", ["Choose the best tool", "Why this tool", "Best tool for the job"], ["AC9M2M01"]),
    ],
  },
  {
    id: "y2-measurement-w3",
    week: 3,
    topic: "Capacity Springs",
    curriculum: ["AC9M2M01"],
    lessons: [
      buildLesson(3, 1, "Count the Cups", "Capacity: fill a container with uniform cups and count how many it holds.", ["Count the cups", "Fill with units", "How many it holds"], ["AC9M2M01"]),
      buildLesson(3, 2, "Holds More by How Many", "Capacity: compare and order containers by how many cups they hold.", ["Holds more", "Order by capacity", "How many more cups"], ["AC9M2M01"]),
      buildLesson(3, 3, "Choose and Reason", "Capacity: decide which container holds most, justify, and fix a wrong fill.", ["Choose and reason", "Which holds most", "Fix the fill"], ["AC9M2M01"]),
    ],
  },
  {
    id: "y2-measurement-w4",
    week: 4,
    topic: "Closer Count",
    curriculum: ["AC9M2M01"],
    lessons: [
      buildLesson(4, 1, "In Between", "Accuracy: recognise a measure that falls between two whole units.", ["In between", "Not a whole number", "Between 4 and 5"], ["AC9M2M01"]),
      buildLesson(4, 2, "Re-measure Smaller", "Accuracy: re-measure with smaller units for a closer count and compare accuracy.", ["Re-measure smaller", "Smaller units", "Closer count"], ["AC9M2M01"]),
      buildLesson(4, 3, "Right Tool, Right Unit", "Accuracy: choose the best unit for the job and justify the choice.", ["Right unit", "Choose the unit", "Big or small unit"], ["AC9M2M01"]),
    ],
  },
  {
    id: "y2-measurement-w5",
    week: 5,
    topic: "Clock Tower I",
    curriculum: ["AC9M2M02"],
    lessons: [
      buildLesson(5, 1, "Read O'Clock", "Time: read o'clock on an analog clock using the hour hand.", ["Read o'clock", "Hour hand", "On the hour"], ["AC9M2M02"]),
      buildLesson(5, 2, "Half Past", "Time: read half past, with the minute hand at 6 and the hour hand between numbers.", ["Half past", "Minute hand at 6", "Hour hand drifts"], ["AC9M2M02"]),
      buildLesson(5, 3, "Match and Set", "Time: match analog to digital/words and set the hands to a given time.", ["Match and set", "Analog to digital", "Set the hands"], ["AC9M2M02"]),
    ],
  },
  {
    id: "y2-measurement-w6",
    week: 6,
    topic: "Clock Tower II",
    curriculum: ["AC9M2M02"],
    lessons: [
      buildLesson(6, 1, "Quarter Past", "Time: read quarter past, with the minute hand at 3.", ["Quarter past", "Minute hand at 3", "Fifteen minutes past"], ["AC9M2M02"]),
      buildLesson(6, 2, "Quarter To", "Time: read quarter to, with the minute hand at 9 and the hour hand nearly at the next number.", ["Quarter to", "Minute hand at 9", "Names the next hour"], ["AC9M2M02"]),
      buildLesson(6, 3, "Time Master", "Time: mix o'clock, half and quarter times; match, set and sequence.", ["Time master", "Mixed times", "Match set sequence"], ["AC9M2M02"]),
    ],
  },
  {
    id: "y2-measurement-w7",
    week: 7,
    topic: "Calendar Keep",
    curriculum: ["AC9M2M03"],
    lessons: [
      buildLesson(7, 1, "Count Days Between", "Calendar: determine the number of days between two events on a calendar.", ["Count days between", "Days between events", "Interval on a calendar"], ["AC9M2M03"]),
      buildLesson(7, 2, "How Many Days Until?", "Calendar: work out how many days until an event, including weeks to days and across months.", ["Days until", "Weeks to days", "Across the month"], ["AC9M2M03"]),
      buildLesson(7, 3, "Calendar Problem Solving", "Calendar: solve multi-step day problems and explain the reasoning.", ["Calendar problems", "Multi-step days", "Explain the days"], ["AC9M2M03"]),
    ],
  },
  {
    id: "y2-measurement-w8",
    week: 8,
    topic: "Measurement Challenge",
    curriculum: ["AC9M2M01", "AC9M2M02", "AC9M2M03"],
    lessons: [
      buildLesson(8, 1, "Which Attribute?", "Challenge: choose the right attribute (length, mass, capacity, time, calendar) for a task.", ["Which attribute", "Choose the skill", "Length mass capacity time"], ["AC9M2M01", "AC9M2M02", "AC9M2M03"]),
      buildLesson(8, 2, "Which Unit?", "Challenge: pick the right unit for the job, and when to go smaller.", ["Which unit", "Right unit", "When to go smaller"], ["AC9M2M01"]),
      buildLesson(8, 3, "Mixed Measurement Problems", "Challenge: solve real-world problems spanning all measurement strands.", ["Mixed problems", "Real-world measurement", "All strands"], ["AC9M2M01", "AC9M2M02", "AC9M2M03"]),
    ],
  },
];

export const YEAR2_MEASURELANDS_PROGRAM = normalizeWeekPlans(
  2,
  YEAR2_MEASURELANDS_RAW,
);

export const YEAR2_MEASURELANDS_META = {
  realm: "Measurelands",
  strand: "Measurement",
  levelLabel: "Level 2",
  legend: "Meazurex Ticklet",
  legendLine: "Meazurex",
  curriculum: YEAR2_MEASURELANDS_CURRICULUM,
} as const;
