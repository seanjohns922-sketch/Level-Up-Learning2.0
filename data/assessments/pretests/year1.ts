import type { Question } from "./prep";

export type { Question };

const strand = "Number";
const difficultyBand = "year1";

function mcqQuestion(
  id: string,
  prompt: string,
  options: Question["options"],
  answer: Question["answer"],
  skillId: string,
  skillLabel: string,
  linkedWeeks: number[],
  linkedLessons: number[] = [1, 2, 3]
): Question {
  return {
    type: "mcq",
    id,
    prompt,
    options,
    answer,
    skillId,
    skillLabel,
    linkedWeeks,
    linkedLessons,
    strand,
    difficultyBand,
  };
}

export const YEAR1_PRETEST: Question[] = [
  mcqQuestion("y1-q1", "Circle the number 36 from this group: 17, 29, 36, 42", ["17", "29", "36", "42"], "36", "number_identification", "Recognise Numbers", [1]),
  mcqQuestion("y1-q2", "What number comes after 49?", ["48", "49", "50", "51"], "50", "number_identification", "Recognise Numbers", [1]),
  mcqQuestion("y1-q3", "Put these numbers in order (smallest to largest): 14, 8, 27", ["14, 8, 27", "8, 14, 27", "27, 14, 8", "8, 27, 14"], "8, 14, 27", "ordering_numbers", "Order Numbers", [1]),
  {
    id: "y1-q4",
    type: "numberLine",
    prompt: "Choose the correct spot 65 would be on this 0–100 number line.",
    min: 0,
    max: 100,
    options: [20, 37, 65, 88],
    answer: 65,
    skillId: "number_line_position",
    skillLabel: "Place Numbers on a Number Line",
    linkedWeeks: [1],
    linkedLessons: [1, 2],
    strand,
    difficultyBand,
  },
  mcqQuestion("y1-q5", "Which is the largest? 75, 67, 82", ["75", "67", "82", "They are the same"], "82", "compare_numbers", "Compare Numbers", [1]),
  mcqQuestion("y1-q6", "How many tens and ones are in 42?", ["2 tens, 4 ones", "4 tens, 2 ones", "42 tens, 0 ones", "0 tens, 42 ones"], "4 tens, 2 ones", "place_value", "Tens and Ones", [1, 2]),
  mcqQuestion("y1-q7", "Partition 56 in a different way.", ["50 + 6", "40 + 16", "Both A and B are correct", "60 - 6"], "Both A and B are correct", "place_value", "Tens and Ones", [1, 2]),
  {
    type: "mab",
    id: "y1-q8",
    prompt: "Show 37 using tens and ones blocks.",
    target: 37,
    maxTens: 10,
    maxOnes: 10,
    skillId: "place_value_blocks",
    skillLabel: "Build Numbers with Blocks",
    linkedWeeks: [1, 2],
    linkedLessons: [1, 2],
    strand,
    difficultyBand,
  },
  mcqQuestion("y1-q9", "Skip count by 5s: 5, 10, __, 20", ["11", "12", "15", "25"], "15", "skip_counting", "Skip Counting", [2]),
  mcqQuestion("y1-q10", "How many groups of 10 are in 60?", ["5", "6", "7", "10"], "6", "skip_counting", "Skip Counting", [2]),
  {
    id: "y1-q11",
    type: "groups",
    prompt: "Which option shows equal groups?",
    options: [
      { id: "A", label: "3 groups of 4", groups: [4, 4, 4] },
      { id: "B", label: "2 groups of 5 and 1 group of 4", groups: [5, 5, 4] },
      { id: "C", label: "Groups of 3, 4, and 5", groups: [3, 4, 5] },
      { id: "D", label: "1 group of 12", groups: [12] },
    ],
    answerOptionId: "A",
    skillId: "equal_groups",
    skillLabel: "Equal Groups",
    linkedWeeks: [6],
    linkedLessons: [1, 2],
    strand,
    difficultyBand,
  },
  mcqQuestion("y1-q12", "What is 9 + 7?", ["14", "15", "16", "17"], "16", "addition_subtraction", "Addition and Subtraction", [3]),
  mcqQuestion("y1-q13", "What is 15 - 6?", ["7", "8", "9", "10"], "9", "addition_subtraction", "Addition and Subtraction", [3]),
  mcqQuestion("y1-q14", "What number makes this true: 8 + __ = 12?", ["3", "4", "5", "6"], "4", "addition_subtraction", "Addition and Subtraction", [3]),
  mcqQuestion("y1-q15", "You have $2. You buy a toy for $1. How much change do you get?", ["$0", "$1", "$2", "$3"], "$1", "money", "Money and Change", [4]),
  mcqQuestion("y1-q16", "Which set of coins makes $1.00?", ["50c + 20c + 20c + 10c", "50c + 20c + 20c + 5c", "20c + 20c + 20c + 20c", "50c + 50c + 10c"], "50c + 20c + 20c + 10c", "money", "Money and Change", [4]),
  {
    ...mcqQuestion("y1-q17", "Draw a picture to show 2 + 3 = ? (Choose the answer.)", ["4", "5", "6", "7"], "5", "addition_visual", "Visual Addition", [3]),
    visual: { type: "dot_add", leftTarget: 2, rightTarget: 3, maxDots: 10 },
  },
  mcqQuestion("y1-q18", "Share 12 lollies between 4 friends. How many does each friend get?", ["2", "3", "4", "6"], "3", "sharing_division", "Sharing Equally", [6]),
  {
    ...mcqQuestion("y1-q19", "Group 18 counters into sets of 3. How many groups?", ["5", "6", "7", "8"], "6", "sharing_division", "Sharing Equally", [6]),
    visual: {
      type: "group_counters",
      totalCounters: 36,
      groups: 0,
      groupSize: 3,
      selectTarget: 18,
    },
  },
  {
    ...mcqQuestion(
      "y1-q20",
      "Which grouping shows sharing is equal?",
      [
        { label: "12 shared into 3 groups of 4", groups: [4, 4, 4] },
        { label: "12 shared into 6, 6, and 0", groups: [6, 6, 0] },
        { label: "12 shared into 5, 5, and 2", groups: [5, 5, 2] },
        { label: "12 shared into 1 group of 12", groups: [12] },
      ],
      "12 shared into 3 groups of 4",
      "sharing_division",
      "Sharing Equally",
      [6]
    ),
    answerIndex: 0,
    visual: {
      type: "group_counters",
      totalCounters: 12,
      groups: 3,
    },
  },
];
