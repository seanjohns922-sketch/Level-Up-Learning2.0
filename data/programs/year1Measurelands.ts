import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";

const YEAR1_MEASURELANDS_CURRICULUM: CurriculumCode[] = [
  "AC9M1M01",
  "AC9M1M02",
  "AC9M1M03",
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
    id: `y1-measurement-w${week}-l${lesson}`,
    week,
    lesson,
    title,
    focus,
    activityIdeas,
    curriculum,
  };
}

const YEAR1_MEASURELANDS_RAW: WeekPlan[] = [
  {
    id: "y1-measurement-w1",
    week: 1,
    topic: "Length Trail",
    curriculum: ["AC9M1M01", "AC9M1M02"],
    lessons: [
      buildLesson(1, 1, "Measure with Blocks", "Length: measure and compare the length of objects using equal informal units such as blocks.", ["Measure with blocks", "Line up equal units", "Count how many blocks long"], ["AC9M1M01"]),
      buildLesson(1, 2, "Compare Measured Lengths", "Length: compare measured lengths after using the same informal unit.", ["Compare measured lengths", "Which measured object is longer?", "Same-unit comparison cards"], ["AC9M1M01"]),
      buildLesson(1, 3, "No Gaps, No Overlaps", "Length: measure carefully by placing informal units end to end with no gaps and no overlaps.", ["No gaps, no overlaps", "Fix the measure", "Careful measuring practice"], ["AC9M1M02"]),
    ],
  },
  {
    id: "y1-measurement-w2",
    week: 2,
    topic: "Balance Basin",
    curriculum: ["AC9M1M01"],
    lessons: [
      buildLesson(2, 1, "Measuring Mass", "Mass: measure and compare mass using equal informal units (balance cubes) on a balance scale.", ["Measure with balance cubes", "Count the balance cubes", "Compare measured mass"], ["AC9M1M01"]),
      buildLesson(2, 2, "Compare Measured Mass", "Mass: compare and order objects by their measured mass in balance cubes.", ["Compare measured mass", "Order by mass", "Find equal mass"], ["AC9M1M01"]),
      buildLesson(2, 3, "Fair or Unfair Measure?", "Mass: decide whether a measuring method is fair and consistent.", ["Fair or unfair measure?", "Use the same unit", "Spot the measuring mistake"], ["AC9M1M01"]),
    ],
  },
  {
    id: "y1-measurement-w3",
    week: 3,
    topic: "Capacity Springs",
    curriculum: ["AC9M1M01"],
    lessons: [
      buildLesson(3, 1, "Fill with Cups", "Capacity: measure how much a container holds using equal informal units such as cups.", ["Fill with cups", "How many cups?", "Measure container capacity"], ["AC9M1M01"]),
      buildLesson(3, 2, "Compare Measured Capacity", "Capacity: compare measured capacity after using the same cup or scoop as the unit.", ["Compare measured capacity", "Which holds more cups?", "Same-unit capacity comparisons"], ["AC9M1M01"]),
      buildLesson(3, 3, "Better Measuring Units", "Capacity: recognise why equal measuring units give a fairer comparison.", ["Better measuring units", "Same cup or different cup?", "Fair capacity measure"], ["AC9M1M01"]),
    ],
  },
  {
    id: "y1-measurement-w4",
    week: 4,
    topic: "Duration Dunes",
    curriculum: ["AC9M1M01", "AC9M1M03"],
    lessons: [
      buildLesson(4, 1, "Hour, Day, Week", "Time: connect familiar durations to the words hour, day, and week.", ["Hour, day, week", "Match the time word", "How long does it take?"], ["AC9M1M03"]),
      buildLesson(4, 2, "Compare Durations", "Duration: compare how long activities take using more formal time words.", ["Compare durations", "Longer or shorter time?", "Sort by time taken"], ["AC9M1M01", "AC9M1M03"]),
      buildLesson(4, 3, "Sort by Duration", "Duration: sort activities by how long they usually take.", ["Sort by duration", "Quickest to longest", "Duration groups"], ["AC9M1M01", "AC9M1M03"]),
    ],
  },
  {
    id: "y1-measurement-w5",
    week: 5,
    topic: "Calendar Grove",
    curriculum: ["AC9M1M03"],
    lessons: [
      buildLesson(5, 1, "Days Make a Week", "Calendar: use the seven days of the week as a repeating sequence.", ["Days make a week", "Build the week", "Seven-day cycle"], ["AC9M1M03"]),
      buildLesson(5, 2, "Weeks and Months", "Calendar: recognise that weeks make up months and months repeat through the year.", ["Weeks and months", "How weeks fit in months", "Calendar grouping"], ["AC9M1M03"]),
      buildLesson(5, 3, "Month Explorer", "Calendar: identify and explore the names and order of the months in a year.", ["Month explorer", "Name the months", "Months in order"], ["AC9M1M03"]),
    ],
  },
  {
    id: "y1-measurement-w6",
    week: 6,
    topic: "Calendar Quest",
    curriculum: ["AC9M1M03"],
    lessons: [
      buildLesson(6, 1, "Find the Date", "Calendar: locate the day and date on a simple monthly calendar.", ["Find the date", "Point to the number", "Calendar search"], ["AC9M1M03"]),
      buildLesson(6, 2, "Calendar Navigation", "Calendar: move through a calendar using before, after, next week, and last week ideas.", ["Calendar navigation", "Move across the month", "Before and after dates"], ["AC9M1M03"]),
      buildLesson(6, 3, "Event Planner", "Calendar: place familiar events on a calendar and talk about when they happen.", ["Event planner", "Mark the calendar", "When is the event?"], ["AC9M1M03"]),
    ],
  },
  {
    id: "y1-measurement-w7",
    week: 7,
    topic: "Time Journey",
    curriculum: ["AC9M1M03"],
    lessons: [
      buildLesson(7, 1, "Yesterday", "Time language: use yesterday to talk about events that already happened.", ["Yesterday", "What happened yesterday?", "Time talk"], ["AC9M1M03"]),
      buildLesson(7, 2, "Today", "Time language: use today to describe what is happening now or on the current day.", ["Today", "What is today?", "Today on the calendar"], ["AC9M1M03"]),
      buildLesson(7, 3, "Tomorrow", "Time language: use tomorrow to talk about upcoming events and plans.", ["Tomorrow", "What happens tomorrow?", "Plan ahead"], ["AC9M1M03"]),
    ],
  },
  {
    id: "y1-measurement-w8",
    week: 8,
    topic: "Time Builder",
    curriculum: ["AC9M1M03"],
    lessons: [
      buildLesson(8, 1, "First, Next, Last", "Sequencing: order familiar events using first, next, and last.", ["First, next, last", "Order the routine", "Sequence cards"], ["AC9M1M03"]),
      buildLesson(8, 2, "Build My Day Timeline", "Sequencing: build a simple personal timeline for a day.", ["Build my day timeline", "Morning to night", "My day in order"], ["AC9M1M03"]),
      buildLesson(8, 3, "Sequence Events", "Sequencing: place everyday events in a logical order and explain the sequence.", ["Sequence events", "Put the story in order", "What comes next?"], ["AC9M1M03"]),
    ],
  },
];

export const YEAR1_MEASURELANDS_PROGRAM = normalizeWeekPlans(
  1,
  YEAR1_MEASURELANDS_RAW,
);

export const YEAR1_MEASURELANDS_META = {
  realm: "Measurelands",
  strand: "Measurement",
  levelLabel: "Level 1",
  legend: "Meazurex Ticklet",
  legendLine: "Meazurex",
  curriculum: YEAR1_MEASURELANDS_CURRICULUM,
} as const;
