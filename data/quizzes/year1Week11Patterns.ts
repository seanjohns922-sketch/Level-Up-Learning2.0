import type { Year1PatternToken } from "@/data/activities/year1/practice-task";

export type Year1Week11PatternQuizItem = {
  id: string;
  lessonTag: 1 | 2 | 3;
  prompt: string;
  sequence: Year1PatternToken[];
  options: string[];
  answer: string;
};

const token = (value: Year1PatternToken) => value.replace("-", " ");
const row = (values: readonly Year1PatternToken[]) => values.map(token).join(" · ");

const ITEMS: readonly Year1Week11PatternQuizItem[] = [
  { id: "y1-w11-q01", lessonTag: 1, prompt: "Which complete unit repeats?", sequence: ["blue-circle", "green-square", "blue-circle", "green-square", "blue-circle", "green-square"], options: [row(["blue-circle"]), row(["blue-circle", "green-square"]), row(["green-square", "blue-circle", "green-square"])], answer: row(["blue-circle", "green-square"]) },
  { id: "y1-w11-q02", lessonTag: 1, prompt: "Find the smallest complete repeat.", sequence: ["amber-star", "amber-star", "cyan-gem", "amber-star", "amber-star", "cyan-gem"], options: [row(["amber-star", "cyan-gem"]), row(["amber-star", "amber-star", "cyan-gem"]), row(["amber-star"])], answer: row(["amber-star", "amber-star", "cyan-gem"]) },
  { id: "y1-w11-q03", lessonTag: 1, prompt: "Which unit makes this whole pattern?", sequence: ["rose-robot", "violet-triangle", "cyan-gem", "rose-robot", "violet-triangle", "cyan-gem"], options: [row(["rose-robot", "violet-triangle", "cyan-gem"]), row(["rose-robot", "violet-triangle"]), row(["violet-triangle", "cyan-gem", "rose-robot", "violet-triangle"])], answer: row(["rose-robot", "violet-triangle", "cyan-gem"]) },
  { id: "y1-w11-q04", lessonTag: 1, prompt: "Select one full repeating unit.", sequence: ["green-square", "blue-circle", "blue-circle", "green-square", "blue-circle", "blue-circle"], options: [row(["green-square", "blue-circle", "blue-circle"]), row(["green-square", "blue-circle"]), row(["blue-circle", "blue-circle", "green-square", "blue-circle"])], answer: row(["green-square", "blue-circle", "blue-circle"]) },
  { id: "y1-w11-q05", lessonTag: 1, prompt: "What is the repeating unit?", sequence: ["violet-triangle", "cyan-gem", "violet-triangle", "cyan-gem", "violet-triangle", "cyan-gem"], options: [row(["cyan-gem", "violet-triangle", "cyan-gem"]), row(["violet-triangle", "cyan-gem"]), row(["violet-triangle"])], answer: row(["violet-triangle", "cyan-gem"]) },

  { id: "y1-w11-q06", lessonTag: 2, prompt: "What comes next?", sequence: ["cyan-gem", "rose-robot", "cyan-gem", "rose-robot", "cyan-gem"], options: [token("amber-star"), token("cyan-gem"), token("rose-robot")], answer: token("rose-robot") },
  { id: "y1-w11-q07", lessonTag: 2, prompt: "Choose the next pattern part.", sequence: ["blue-circle", "blue-circle", "green-square", "blue-circle", "blue-circle"], options: [token("green-square"), token("blue-circle"), token("violet-triangle")], answer: token("green-square") },
  { id: "y1-w11-q08", lessonTag: 2, prompt: "Which part continues the rule?", sequence: ["amber-star", "cyan-gem", "rose-robot", "amber-star", "cyan-gem"], options: [token("cyan-gem"), token("rose-robot"), token("amber-star")], answer: token("rose-robot") },
  { id: "y1-w11-q09", lessonTag: 2, prompt: "Complete the next place.", sequence: ["green-square", "violet-triangle", "violet-triangle", "green-square", "violet-triangle"], options: [token("blue-circle"), token("green-square"), token("violet-triangle")], answer: token("violet-triangle") },
  { id: "y1-w11-q10", lessonTag: 2, prompt: "Keep the repeating pattern going.", sequence: ["rose-robot", "amber-star", "cyan-gem", "rose-robot", "amber-star"], options: [token("rose-robot"), token("cyan-gem"), token("amber-star")], answer: token("cyan-gem") },

  { id: "y1-w11-q11", lessonTag: 3, prompt: "Which row repeats the shown unit?", sequence: ["blue-circle", "amber-star"], options: [row(["blue-circle", "amber-star", "blue-circle", "amber-star"]), row(["blue-circle", "blue-circle", "amber-star", "amber-star"]), row(["amber-star", "blue-circle", "blue-circle", "amber-star"])], answer: row(["blue-circle", "amber-star", "blue-circle", "amber-star"]) },
  { id: "y1-w11-q12", lessonTag: 3, prompt: "Choose two correct repeats of this unit.", sequence: ["cyan-gem", "cyan-gem", "rose-robot"], options: [row(["cyan-gem", "rose-robot", "cyan-gem", "rose-robot"]), row(["cyan-gem", "cyan-gem", "rose-robot", "cyan-gem", "cyan-gem", "rose-robot"]), row(["cyan-gem", "cyan-gem", "rose-robot", "rose-robot", "cyan-gem", "cyan-gem"])], answer: row(["cyan-gem", "cyan-gem", "rose-robot", "cyan-gem", "cyan-gem", "rose-robot"]) },
  { id: "y1-w11-q13", lessonTag: 3, prompt: "Which built pattern keeps the rule?", sequence: ["violet-triangle", "green-square", "blue-circle"], options: [row(["violet-triangle", "green-square", "blue-circle", "violet-triangle", "green-square", "blue-circle"]), row(["violet-triangle", "green-square", "violet-triangle", "green-square", "blue-circle", "blue-circle"]), row(["blue-circle", "green-square", "violet-triangle", "blue-circle", "green-square", "violet-triangle"])], answer: row(["violet-triangle", "green-square", "blue-circle", "violet-triangle", "green-square", "blue-circle"]) },
  { id: "y1-w11-q14", lessonTag: 3, prompt: "Find the row with three unchanged repeats.", sequence: ["amber-star", "rose-robot"], options: [row(["amber-star", "rose-robot", "amber-star", "rose-robot", "amber-star", "rose-robot"]), row(["amber-star", "amber-star", "rose-robot", "amber-star", "rose-robot", "rose-robot"]), row(["rose-robot", "amber-star", "amber-star", "rose-robot", "amber-star", "rose-robot"])], answer: row(["amber-star", "rose-robot", "amber-star", "rose-robot", "amber-star", "rose-robot"]) },
  { id: "y1-w11-q15", lessonTag: 3, prompt: "Which row was created from this unit?", sequence: ["green-square", "violet-triangle", "violet-triangle"], options: [row(["green-square", "violet-triangle", "green-square", "violet-triangle", "violet-triangle", "violet-triangle"]), row(["green-square", "violet-triangle", "violet-triangle", "green-square", "violet-triangle", "violet-triangle"]), row(["violet-triangle", "green-square", "violet-triangle", "violet-triangle", "green-square", "violet-triangle"])], answer: row(["green-square", "violet-triangle", "violet-triangle", "green-square", "violet-triangle", "violet-triangle"]) },
];

export function buildYear1Week11PatternQuizItems(): Year1Week11PatternQuizItem[] {
  return ITEMS.map((item) => ({ ...item, sequence: [...item.sequence], options: [...item.options] }));
}

