export type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
};

export type PostTest = {
  yearLabel: string;
  questions: Question[];
};

export const POSTTESTS: Record<string, PostTest> = {
  "Year 2": {
    yearLabel: "Year 2",
    questions: [
      { id: "y2-pt-01", prompt: "What is 34 + 25?", options: ["49", "59", "69", "58"], correctAnswer: "59" },
      { id: "y2-pt-02", prompt: "What is 63 − 28?", options: ["35", "45", "25", "55"], correctAnswer: "35" },
      { id: "y2-pt-03", prompt: "Which number is the largest: 482, 428, 824?", options: ["482", "428", "824"], correctAnswer: "824" },
      { id: "y2-pt-04", prompt: "How many tens are in 370?", options: ["3", "7", "37", "70"], correctAnswer: "37" },
      { id: "y2-pt-05", prompt: "Skip count by 5s: 15, 20, 25, __?", options: ["35", "30", "26", "40"], correctAnswer: "30" },
      { id: "y2-pt-06", prompt: "3 groups of 10 = ?", options: ["13", "30", "31", "10"], correctAnswer: "30" },
      { id: "y2-pt-07", prompt: "Share 20 equally between 5. Each gets?", options: ["5", "4", "10", "3"], correctAnswer: "4" },
      { id: "y2-pt-08", prompt: "What is 47 + 36?", options: ["73", "83", "82", "93"], correctAnswer: "83" },
      { id: "y2-pt-09", prompt: "What is 91 − 45?", options: ["56", "46", "36", "54"], correctAnswer: "46" },
      { id: "y2-pt-10", prompt: "Is 37 odd or even?", options: ["Odd", "Even"], correctAnswer: "Odd" },
      { id: "y2-pt-11", prompt: "Skip count by 2s: 14, 16, 18, __?", options: ["19", "20", "22", "21"], correctAnswer: "20" },
      { id: "y2-pt-12", prompt: "4 groups of 3 = ?", options: ["7", "12", "15", "9"], correctAnswer: "12" },
      { id: "y2-pt-13", prompt: "What is 250 in expanded form?", options: ["200 + 50", "200 + 5", "25 + 0", "250 + 0"], correctAnswer: "200 + 50" },
      { id: "y2-pt-14", prompt: "Sam has 15 stickers. He gives away 7. How many left?", options: ["7", "8", "9", "22"], correctAnswer: "8" },
      { id: "y2-pt-15", prompt: "A baker makes 5 trays with 2 muffins each. How many muffins?", options: ["7", "10", "12", "15"], correctAnswer: "10" },
    ],
  },
  "Year 3": {
    yearLabel: "Year 3",
    questions: [
      {
        id: "y3-pt-01",
        prompt: "What is 400 + 300?",
        options: ["500", "600", "700", "800"],
        correctAnswer: "700",
      },
      {
        id: "y3-pt-02",
        prompt: "What is 12 × 3?",
        options: ["24", "36", "48", "60"],
        correctAnswer: "36",
      },
    ],
  },
};
