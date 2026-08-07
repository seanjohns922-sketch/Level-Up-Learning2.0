export type PrepNumberNexusQuizVisual =
  | { type: "ground_quiz_collection"; groups: number[]; labels?: string[]; structured?: boolean }
  | { type: "ground_quiz_sequence"; values: Array<number | null>; direction?: "forward" | "backward" }
  | { type: "ground_quiz_part_whole"; whole: number; parts: Array<number | null> }
  | { type: "ground_quiz_change"; start: number; change: number; action: "add" | "remove" }
  | { type: "ground_quiz_share"; total: number; groups?: number; groupSize?: number }
  | { type: "ground_quiz_pattern"; sequence: string[]; choices?: string[][] };

export type PrepNumberNexusQuizQuestion = {
  id: string;
  lessonTag: 1 | 2 | 3;
  descriptorCodes: string[];
  skillId: string;
  kind: "mcq" | "typed" | "audio";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctValue?: string;
  responseType?: "number";
  audioText?: string;
  visual?: PrepNumberNexusQuizVisual;
};

type Lesson = 1 | 2 | 3;
type Draft = Omit<PrepNumberNexusQuizQuestion, "descriptorCodes" | "skillId">;

function id(week: number, lesson: Lesson, index: number) {
  return `ground-number-w${String(week).padStart(2, "0")}-l${lesson}-q${index + 1}`;
}

function choice(questionId: string, lessonTag: Lesson, prompt: string, answer: string | number, distractors: readonly (string | number)[], visual?: PrepNumberNexusQuizVisual): Draft {
  const correct = String(answer);
  const unique = [...new Set([correct, ...distractors.map(String)])].slice(0, 4);
  if (unique.length < 2) throw new Error(`${questionId} requires at least two options.`);
  const rotation = Number(questionId.slice(-1)) % unique.length;
  const options = [...unique.slice(rotation), ...unique.slice(0, rotation)];
  return { id: questionId, lessonTag, kind: "mcq", prompt, options, correctIndex: options.indexOf(correct), ...(visual ? { visual } : {}) };
}

function typed(questionId: string, lessonTag: Lesson, prompt: string, answer: number, visual?: PrepNumberNexusQuizVisual): Draft {
  return { id: questionId, lessonTag, kind: "typed", prompt, correctValue: String(answer), responseType: "number", ...(visual ? { visual } : {}) };
}

function audio(questionId: string, lessonTag: Lesson, answer: number, pool: readonly number[]): Draft {
  return { ...choice(questionId, lessonTag, "Listen. Tap the numeral.", answer, pool.filter((value) => value !== answer).slice(0, 3)), kind: "audio", audioText: String(answer) };
}

const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const word = (value: number) => words[value] ?? String(value);

function descriptorsFor(week: number, lesson: Lesson): string[] {
  if (week === 1) return ["AC9MFN01"];
  if (week === 2) return ["AC9MFN01", "AC9MFN03"];
  if (week === 3) return ["AC9MFN01"];
  if (week === 4) return ["AC9MFN02", "AC9MFN03"];
  if (week === 5) return ["AC9MFN03"];
  if (week === 6) return ["AC9MFN04"];
  if (week === 7) return ["AC9MFN01", "AC9MFN03"];
  if (week === 8) return ["AC9MFN01"];
  if (week === 9) return ["AC9MFN05"];
  if (week === 10) return ["AC9MFN06"];
  if (week === 11) return ["AC9MFA01"];
  if (lesson === 1) return ["AC9MFN01", "AC9MFN03"];
  if (lesson === 2) return ["AC9MFN04"];
  return ["AC9MFN05", "AC9MFN06", "AC9MFA01"];
}

function buildLesson(week: number, lesson: Lesson): Draft[] {
  return Array.from({ length: 5 }, (_, index) => {
    const questionId = id(week, lesson, index);

    if (week === 1 && lesson === 1) return audio(questionId, lesson, [1, 3, 5, 2, 4][index]!, [1, 2, 3, 4, 5]);
    if (week === 1 && lesson === 2) {
      const target = [3, 5, 2, 4, 1][index]!;
      return choice(questionId, lesson, "How many objects are shown?", target, [Math.max(1, target - 1), Math.min(5, target + 1), target === 5 ? 2 : 5], { type: "ground_quiz_collection", groups: [target], structured: false });
    }
    if (week === 1 && lesson === 3) {
      const target = [2, 4, 1, 5, 3][index]!;
      return choice(questionId, lesson, `Which numeral matches the word ${word(target)}?`, target, [target === 1 ? 2 : target - 1, target === 5 ? 4 : target + 1]);
    }

    if (week === 2 && lesson === 1) return audio(questionId, lesson, [6, 8, 10, 7, 9][index]!, [6, 7, 8, 9, 10]);
    if (week === 2 && lesson === 2) {
      const target = [7, 9, 6, 10, 8][index]!;
      return typed(questionId, lesson, "Count the collection.", target, { type: "ground_quiz_collection", groups: [target], structured: index % 2 === 0 });
    }
    if (week === 2 && lesson === 3) {
      const target = [8, 6, 9, 7, 10][index]!;
      return choice(questionId, lesson, `Which number word matches ${target}?`, word(target), [word(target === 6 ? 7 : target - 1), word(target === 10 ? 9 : target + 1)]);
    }

    if (week === 3 && lesson === 1) {
      const start = [1, 3, 5, 6, 8][index]!;
      return typed(questionId, lesson, "Count forward. Fill the gap.", start + 2, { type: "ground_quiz_sequence", values: [start, start + 1, null, start + 3], direction: "forward" });
    }
    if (week === 3 && lesson === 2) {
      const start = [10, 9, 8, 7, 6][index]!;
      return typed(questionId, lesson, "Count backward. Fill the gap.", start - 2, { type: "ground_quiz_sequence", values: [start, start - 1, null, start - 3], direction: "backward" });
    }
    if (week === 3 && lesson === 3) {
      const start = [2, 4, 6, 1, 5][index]!;
      return choice(questionId, lesson, "Which number comes next?", start + 3, [start + 2, start + 4], { type: "ground_quiz_sequence", values: [start, start + 1, start + 2, null] });
    }

    if (week === 4 && lesson === 1) {
      const target = [4, 2, 5, 3, 1][index]!;
      return choice(questionId, lesson, "Look quickly. How many dots?", target, [target === 1 ? 2 : target - 1, target === 5 ? 4 : target + 1], { type: "ground_quiz_collection", groups: [target], structured: true });
    }
    if (week === 4 && lesson === 2) {
      const target = [3, 5, 2, 4, 1][index]!;
      return choice(questionId, lesson, "How many objects did you see?", target, [target === 1 ? 2 : target - 1, target === 5 ? 4 : target + 1], { type: "ground_quiz_collection", groups: [target], structured: true });
    }
    if (week === 4 && lesson === 3) {
      const target = [5, 1, 4, 2, 3][index]!;
      return choice(questionId, lesson, "Which numeral matches this pattern?", target, [target === 1 ? 2 : target - 1, target === 5 ? 4 : target + 1], { type: "ground_quiz_collection", groups: [target], structured: true });
    }

    if (week === 5 && lesson === 1) {
      const left = [4, 7, 5, 9, 6][index]!;
      const right = [6, 3, 8, 5, 6][index]!;
      const answer = left === right ? "equal" : left > right ? "Group A" : "Group B";
      return choice(questionId, lesson, "Which group has more, or are they equal?", answer, ["Group A", "Group B", "equal"].filter((value) => value !== answer), { type: "ground_quiz_collection", groups: [left, right], labels: ["Group A", "Group B"] });
    }
    if (week === 5 && lesson === 2) {
      const target = [6, 8, 5, 9, 7][index]!;
      const same = index % 2 === 0;
      return choice(questionId, lesson, "Do both groups show the same amount?", same ? "Yes" : "No", [same ? "No" : "Yes"], { type: "ground_quiz_collection", groups: [target, same ? target : target - 1], labels: ["Group A", "Group B"], structured: index % 2 === 0 });
    }
    if (week === 5 && lesson === 3) {
      const values = [[2, 6, 4], [7, 3, 5], [1, 8, 4], [9, 2, 6], [3, 10, 7]][index]!;
      return choice(questionId, lesson, "Which list is ordered from least to most?", [...values].sort((a, b) => a - b).join(", "), [[...values].sort((a, b) => b - a).join(", "), `${values[1]}, ${values[0]}, ${values[2]}`]);
    }

    if (week === 6 && lesson === 1) {
      const whole = [6, 8, 7, 9, 5][index]!;
      const part = [2, 3, 4, 5, 1][index]!;
      return typed(questionId, lesson, "Find the missing part.", whole - part, { type: "ground_quiz_part_whole", whole, parts: [part, null] });
    }
    if (week === 6 && lesson === 2) {
      const part = [4, 7, 3, 6, 2][index]!;
      return typed(questionId, lesson, "What part joins this part to make 10?", 10 - part, { type: "ground_quiz_part_whole", whole: 10, parts: [part, null] });
    }
    if (week === 6 && lesson === 3) {
      const whole = [8, 10, 7, 9, 6][index]!;
      const part = [5, 4, 2, 6, 1][index]!;
      return choice(questionId, lesson, "Which pair makes the whole?", `${part} and ${whole - part}`, [`${part} and ${whole - part + 1}`, `${Math.max(0, part - 1)} and ${whole - part}`], { type: "ground_quiz_part_whole", whole, parts: [null, null] });
    }

    if (week === 7 && lesson === 1) {
      const target = [12, 15, 18, 14, 20][index]!;
      return typed(questionId, lesson, "Count the organised collection.", target, { type: "ground_quiz_collection", groups: [10, target - 10], structured: true });
    }
    if (week === 7 && lesson === 2) {
      const target = [13, 17, 11, 19, 16][index]!;
      return choice(questionId, lesson, "Ten and how many more make this teen number?", target - 10, [Math.max(1, target - 11), Math.min(9, target - 9)], { type: "ground_quiz_collection", groups: [10, target - 10], labels: ["Ten", "More"], structured: true });
    }
    if (week === 7 && lesson === 3) {
      const target = [14, 18, 12, 16, 19][index]!;
      return choice(questionId, lesson, "Which numeral matches the collection?", target, [target - 1, target === 20 ? 18 : target + 1], { type: "ground_quiz_collection", groups: [10, target - 10], structured: index % 2 === 0 });
    }

    if (week === 8 && lesson === 1) {
      const start = [11, 14, 16, 8, 17][index]!;
      return typed(questionId, lesson, "Fill the missing number.", start + 1, { type: "ground_quiz_sequence", values: [start - 1, start, null, start + 2] });
    }
    if (week === 8 && lesson === 2) {
      const start = [5, 9, 12, 16, 19][index]!;
      const backward = index % 2 === 1;
      return typed(questionId, lesson, backward ? "Move back one step." : "Move forward one step.", backward ? start - 1 : start + 1, { type: "ground_quiz_sequence", values: backward ? [start - 2, start - 1, start] : [start, start + 1, start + 2], direction: backward ? "backward" : "forward" });
    }
    if (week === 8 && lesson === 3) {
      const values = [[12, 18, 15], [20, 11, 16], [14, 19, 13], [17, 10, 15], [16, 12, 20]][index]!;
      return choice(questionId, lesson, "Which list is ordered from greatest to least?", [...values].sort((a, b) => b - a).join(", "), [[...values].sort((a, b) => a - b).join(", "), `${values[1]}, ${values[0]}, ${values[2]}`]);
    }

    if (week === 9 && lesson === 1) {
      const start = [2, 4, 3, 5, 1][index]!;
      const change = [3, 2, 4, 1, 5][index]!;
      return typed(questionId, lesson, "More objects arrive. How many are there now?", start + change, { type: "ground_quiz_change", start, change, action: "add" });
    }
    if (week === 9 && lesson === 2) {
      const total = [8, 7, 10, 9, 6][index]!;
      const change = [3, 2, 4, 5, 1][index]!;
      return typed(questionId, lesson, "Some objects leave. How many remain?", total - change, { type: "ground_quiz_change", start: total, change, action: "remove" });
    }
    if (week === 9 && lesson === 3) {
      const start = [3, 8, 4, 9, 5][index]!;
      const change = [2, 3, 4, 2, 1][index]!;
      const action = index % 2 === 0 ? "add" : "remove";
      return typed(questionId, lesson, action === "add" ? "Objects join the group. Find the new total." : "Objects leave the group. Find what remains.", action === "add" ? start + change : start - change, { type: "ground_quiz_change", start, change, action });
    }

    if (week === 10 && lesson === 1) {
      const groups = [2, 3, 2, 3, 2][index]!;
      const each = [3, 2, 4, 3, 5][index]!;
      return typed(questionId, lesson, "Share fairly. How many go in each group?", each, { type: "ground_quiz_share", total: groups * each, groups });
    }
    if (week === 10 && lesson === 2) {
      const groupSize = [2, 3, 2, 4, 3][index]!;
      const groupCount = [4, 3, 5, 2, 4][index]!;
      return typed(questionId, lesson, "Make equal groups. How many groups are made?", groupCount, { type: "ground_quiz_share", total: groupSize * groupCount, groupSize });
    }
    if (week === 10 && lesson === 3) {
      const groups = [2, 3, 2, 4, 3][index]!;
      const each = [4, 2, 5, 2, 3][index]!;
      const sharing = index % 2 === 0;
      return typed(questionId, lesson, sharing ? "Share between the shown teams. How many does each get?" : "Use the shown group size. How many groups are made?", sharing ? each : groups, { type: "ground_quiz_share", total: groups * each, ...(sharing ? { groups } : { groupSize: each }) });
    }

    const units = [["star", "crystal"], ["robot", "star"], ["star", "star", "crystal"], ["robot", "crystal", "crystal"], ["star", "robot", "crystal"]];
    if (week === 11 && lesson === 1) {
      const unit = units[index]!;
      return choice(questionId, lesson, "Which group is the repeating unit?", unit.join(" then "), [unit.slice(0, -1).join(" then "), [...unit].reverse().join(" then ")], { type: "ground_quiz_pattern", sequence: [...unit, ...unit] });
    }
    if (week === 11 && lesson === 2) {
      const unit = units[index]!;
      const sequence = [...unit, ...unit, "?"];
      return choice(questionId, lesson, "What comes next?", unit[0]!, unit.slice(1).concat(["planet"]), { type: "ground_quiz_pattern", sequence });
    }
    if (week === 11 && lesson === 3) {
      const unit = units[index]!;
      const correct = [...unit, ...unit];
      const wrongA = [...unit, ...unit.slice(1), unit[0]!];
      const wrongB = [...unit, ...unit].reverse();
      return choice(questionId, lesson, "Which choice repeats the unit correctly?", "Pattern A", ["Pattern B", "Pattern C"], { type: "ground_quiz_pattern", sequence: unit, choices: [correct, wrongA, wrongB] });
    }

    if (week === 12 && lesson === 1) {
      const target = [4, 7, 12, 16, 19][index]!;
      return typed(questionId, lesson, "Write the number shown.", target, { type: "ground_quiz_collection", groups: target > 10 ? [10, target - 10] : [target], structured: true });
    }
    if (week === 12 && lesson === 2) {
      const whole = [10, 8, 9, 7, 6][index]!;
      const part = [6, 3, 5, 2, 4][index]!;
      return typed(questionId, lesson, "Find the missing part.", whole - part, { type: "ground_quiz_part_whole", whole, parts: [part, null] });
    }
    if (week === 12 && lesson === 3) {
      if (index < 2) {
        const start = 3 + index;
        const change = 2 + index;
        return typed(questionId, lesson, "Find the new total after more arrive.", start + change, { type: "ground_quiz_change", start, change, action: "add" });
      }
      if (index < 4) {
        const groups = index;
        const each = 3;
        return typed(questionId, lesson, "Share fairly. How many in each group?", each, { type: "ground_quiz_share", total: groups * each, groups });
      }
      return choice(questionId, lesson, "What comes next in the repeating pattern?", "star", ["robot", "crystal"], { type: "ground_quiz_pattern", sequence: ["star", "robot", "star", "robot", "?"] });
    }

    throw new Error(`No Ground Number Nexus quiz content for Week ${week}, Lesson ${lesson}.`);
  });
}

export function buildPrepNumberNexusWeeklyQuiz(week: number): PrepNumberNexusQuizQuestion[] {
  if (!Number.isInteger(week) || week < 1 || week > 12) throw new Error(`Unsupported Ground quiz week: ${week}`);
  return ([1, 2, 3] as const).flatMap((lesson) => buildLesson(week, lesson).map((question) => ({ ...question, descriptorCodes: descriptorsFor(week, lesson), skillId: `ground-number-w${week}-l${lesson}` })));
}
