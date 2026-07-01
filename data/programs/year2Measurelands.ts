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
      buildLesson(1, 3, "Measuring Detective", "Length: choose the best measuring tool for an object and explain why.", ["Choose the best tool", "Why this tool", "Best tool for the job"], ["AC9M2M01"]),
    ],
  },
  {
    id: "y2-measurement-w2",
    week: 2,
    topic: "Balance Basin",
    curriculum: ["AC9M2M01"],
    lessons: [
      buildLesson(2, 1, "Count the Weights", "Mass: balance an object against uniform mass units and count how many units it takes.", ["Count the weights", "Balance with units", "How many units"], ["AC9M2M01"]),
      buildLesson(2, 2, "By How Many?", "Mass: compare and order objects by unit count, and find how many units heavier.", ["By how many", "Compare by count", "Order by mass"], ["AC9M2M01"]),
      buildLesson(2, 3, "Predict and Prove", "Mass: predict which is heavier, justify, and fix an unfair balance.", ["Predict and prove", "Justify heavier", "Fix the balance"], ["AC9M2M01"]),
    ],
  },
  {
    id: "y2-measurement-w3",
    week: 3,
    topic: "Capacity Springs",
    curriculum: ["AC9M2M01"],
    lessons: [
      buildLesson(3, 1, "Count the Cups", "Capacity: fill a container with uniform cups and count how many it holds.", ["Count the cups", "Fill with units", "How many it holds"], ["AC9M2M01"]),
      buildLesson(3, 2, "Order by Capacity", "Capacity: compare and order containers by their measured cup counts.", ["Order measured capacities", "Which holds most", "Same capacity"], ["AC9M2M01"]),
      buildLesson(3, 3, "Better Measuring Units", "Capacity: choose sensible informal units and explain why they make measuring easier.", ["Choose the unit", "Too big or too small", "Measure like a pro"], ["AC9M2M01"]),
    ],
  },
  {
    id: "y2-measurement-w4",
    week: 4,
    topic: "Closer Count",
    curriculum: ["AC9M2M01"],
    lessons: [
      buildLesson(4, 1, "Measure It Your Way", "Accuracy: measure objects with big and small blocks — big units are quick but leave a bit over, small units fit exactly (smaller units = bigger, closer count). Open-ended: the child decides how to measure.", ["Measure your way", "Big and small blocks", "Smaller units are closer"], ["AC9M2M01"]),
      buildLesson(4, 2, "Estimate It", "Estimation: guess an object's length by eye before measuring — best guess, guess & check, and which looks longer. Real objects, endless variety.", ["Estimate it", "Best guess", "Guess and check"], ["AC9M2M01"]),
      buildLesson(4, 3, "Different Units, Different Counts", "Application: measure the same object with different informal units and explain why the counts change.", ["Same object", "Different unit counts", "Complete the measure"], ["AC9M2M01"]),
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
