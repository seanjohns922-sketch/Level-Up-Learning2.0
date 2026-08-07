export type Year1NumberNexusQuizQuestion = {
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
  visual?: {
    type: "dots";
    count: number;
    cols: number;
    rows: number;
    dotSize: number;
    gap: number;
  } | {
    type: "rows";
    rows: number[];
    dotSize: number;
    gap: number;
    rowGap: number;
  } | {
    type: "number_line";
    min: number;
    max: number;
    marker: number;
    ticks: number[];
  } | {
    type: "number_chart";
    values: Array<number | null>;
  } | {
    type: "place_value";
    tens: number;
    ones: number;
  } | {
    type: "part_whole";
    whole: number;
    knownPart: number;
  } | {
    type: "collection_change";
    start: number;
    change: number;
    action: "add" | "remove";
  } | {
    type: "money";
    items: Array<{ value: number; label: string; image: string; kind: "coin" | "note" }>;
  };
};

type Lesson = 1 | 2 | 3;
type DraftQuestion = Omit<Year1NumberNexusQuizQuestion, "descriptorCodes" | "skillId">;

const VALUES = [0, 1, 2, 3, 4] as const;

function choice(
  id: string,
  lessonTag: Lesson,
  prompt: string,
  answer: string | number,
  distractors: readonly (string | number)[],
  visual?: Year1NumberNexusQuizQuestion["visual"],
): DraftQuestion {
  const correct = String(answer);
  const unique = [...new Set([correct, ...distractors.map(String)])].slice(0, 4);
  if (unique.length < 3) throw new Error(`${id} requires at least three unique options.`);
  const rotation = Number(id.slice(-1)) % unique.length;
  const options = [...unique.slice(rotation), ...unique.slice(0, rotation)];
  return { id, lessonTag, kind: "mcq", prompt, options, correctIndex: options.indexOf(correct), ...(visual ? { visual } : {}) };
}

function typed(id: string, lessonTag: Lesson, prompt: string, answer: number, visual?: Year1NumberNexusQuizQuestion["visual"]): DraftQuestion {
  return { id, lessonTag, kind: "typed", prompt, correctValue: String(answer), responseType: "number", ...(visual ? { visual } : {}) };
}

function audio(id: string, lessonTag: Lesson, answer: number, distractors: number[]): DraftQuestion {
  const question = choice(id, lessonTag, "Listen. Which numeral did you hear?", answer, distractors);
  return { ...question, kind: "audio", audioText: String(answer) };
}

function dots(count: number): Year1NumberNexusQuizQuestion["visual"] {
  return { type: "dots", count, cols: count <= 10 ? 5 : 10, rows: Math.ceil(count / (count <= 10 ? 5 : 10)), dotSize: 22, gap: 8 };
}

function rows(groupCount: number, groupSize: number): Year1NumberNexusQuizQuestion["visual"] {
  return { type: "rows", rows: Array.from({ length: groupCount }, () => groupSize), dotSize: 20, gap: 7, rowGap: 10 };
}

function money(amount: number): Year1NumberNexusQuizQuestion["visual"] {
  const denominations = [20, 10, 5, 2, 1] as const;
  const items: Array<{ value: number; label: string; image: string; kind: "coin" | "note" }> = [];
  let remaining = amount;
  for (const value of denominations) {
    while (remaining >= value) {
      const kind = value >= 5 ? "note" : "coin";
      items.push({ value, label: `$${value}`, image: kind === "note" ? `/coins/note-${value}.png` : `/coins/coin-${value}.png`, kind });
      remaining -= value;
    }
  }
  return { type: "money", items };
}

function id(week: number, lesson: Lesson, index: number) {
  return `y1-number-w${String(week).padStart(2, "0")}-l${lesson}-q${index + 1}`;
}

function descriptorsFor(week: number, lesson: Lesson, index: number): string[] {
  if (week === 1 || week === 2) return ["AC9M1N01"];
  if (week === 3) return ["AC9M1N02"];
  if (week === 4) return lesson === 2 ? ["AC9M1N03", "AC9M1A01"] : ["AC9M1N03"];
  if (week === 5 || week === 6) return ["AC9M1N04"];
  if (week === 7) return lesson === 3 ? ["AC9M1N05"] : ["AC9M1N04", "AC9M1N05"];
  if (week === 8) return ["AC9M1N05"];
  if (week === 9) return ["AC9M1N06"];
  if (week === 10) return lesson === 1 ? ["AC9M1N03", "AC9M1N06", "AC9M1A01"] : ["AC9M1N06"];
  const reviewDescriptors: Record<Lesson, string[]> = {
    1: ["AC9M1N01", "AC9M1N02", "AC9M1A01", "AC9M1N01", "AC9M1N01"],
    2: ["AC9M1N04", "AC9M1N04", "AC9M1N06", "AC9M1N04", "AC9M1N06"],
    3: ["AC9M1N05", "AC9M1A02", "AC9M1N05", "AC9M1N06", "AC9M1N04"],
  };
  return [reviewDescriptors[lesson][index]!];
}

function buildLesson(week: number, lesson: Lesson): DraftQuestion[] {
  return VALUES.map((offset, index) => {
    const questionId = id(week, lesson, index);

    if (week === 1 && lesson === 1) {
      const target = [16, 23, 31, 44, 49][index]!;
      return audio(questionId, lesson, target, [target - 2, target + 1, target + 3]);
    }
    if (week === 1 && lesson === 2) {
      const count = [12, 17, 24, 33, 41][index]!;
      return choice(questionId, lesson, "How many counters are shown?", count, [count - 1, count + 1, count + 3], dots(count));
    }
    if (week === 1 && lesson === 3) {
      const a = 8 + offset * 7;
      return index < 3
        ? choice(questionId, lesson, "Which list is ordered from smallest to largest?", `${a}, ${a + 3}, ${a + 7}`, [`${a + 7}, ${a + 3}, ${a}`, `${a}, ${a + 7}, ${a + 3}`, `${a + 3}, ${a}, ${a + 7}`])
        : typed(questionId, lesson, `Write the numeral between ${a + 2} and ${a + 4}.`, a + 3);
    }

    if (week === 2 && lesson === 1) {
      const target = [58, 73, 86, 104, 117][index]!;
      return audio(questionId, lesson, target, [target - 10, target - 1, target + (target < 118 ? 2 : -2)]);
    }
    if (week === 2 && lesson === 2) {
      const values = [42 + offset * 11, 47 + offset * 11, 39 + offset * 11];
      const answer = Math.max(...values);
      return choice(questionId, lesson, `Which number is greatest: ${values.join(", ")}?`, answer, values.filter((value) => value !== answer));
    }
    if (week === 2 && lesson === 3) {
      const target = [36, 54, 68, 91, 108][index]!;
      if (index < 3) {
        const lower = Math.floor(target / 10) * 10;
        const upper = lower + 10;
        return choice(questionId, lesson, "Which number is marked on the number line?", target, [target - 1, target + 1, upper], { type: "number_line", min: lower, max: upper, marker: target, ticks: [lower, lower + 5, upper] });
      }
      return choice(questionId, lesson, "Which number belongs in the empty chart cell?", target, [target - 1, target + 1, target + 10], { type: "number_chart", values: [target - 10, target - 9, target - 8, target - 1, null, target + 1, target + 10, target + 11, target + 12] });
    }

    if (week === 3 && lesson === 1) {
      const target = [34, 52, 67, 81, 95][index]!;
      const tens = Math.floor(target / 10);
      const ones = target % 10;
      return choice(questionId, lesson, "How many tens and ones are shown?", `${tens} tens and ${ones} ones`, [`${ones} tens and ${tens} ones`, `${tens - 1} tens and ${ones} ones`, `${tens} tens and ${Math.min(9, ones + 1)} ones`], { type: "place_value", tens, ones });
    }
    if (week === 3 && lesson === 2) {
      const target = [24, 37, 46, 63, 78][index]!;
      const tens = Math.floor(target / 10) * 10;
      const ones = target - tens;
      if (index < 3) return choice(questionId, lesson, `Which partition makes ${target}?`, `${tens} + ${ones}`, [`${tens - 10} + ${ones}`, `${tens} + ${Math.min(9, ones + 1)}`, `${tens + 10} + ${ones}`]);
      const first = tens - 10;
      return typed(questionId, lesson, `${target} = ${first} + __. Enter the missing flexible part.`, target - first);
    }
    if (week === 3 && lesson === 3) {
      const tens = [2, 4, 5, 7, 8][index]!;
      const ones = [6, 3, 8, 1, 5][index]!;
      const target = tens * 10 + ones;
      return choice(questionId, lesson, "Which number is built with these materials?", target, [ones * 10 + tens, target - 10, target + 1], { type: "place_value", tens, ones });
    }

    if (week === 4 && lesson === 1) {
      const groupCount = 2 + (index % 3);
      const groupSize = 2 + ((index + 1) % 4);
      return choice(questionId, lesson, "How many equal groups are shown?", groupCount, [groupCount - 1, groupCount + 1, groupSize], rows(groupCount, groupSize));
    }
    if (week === 4 && lesson === 2) {
      const step = [2, 5, 10, 2, 5][index]!;
      const start = step * (index + 1);
      const answer = start + step * 3;
      return choice(questionId, lesson, `Continue the count: ${start}, ${start + step}, ${start + step * 2}, __`, answer, [answer - step, answer + step, answer + 1]);
    }
    if (week === 4 && lesson === 3) {
      const groupCount = [3, 4, 5, 3, 6][index]!;
      const groupSize = [4, 3, 2, 5, 3][index]!;
      const total = groupCount * groupSize;
      return choice(questionId, lesson, "How many counters are shown altogether?", total, [total - groupSize, total + groupSize, groupCount + groupSize], rows(groupCount, groupSize));
    }

    if (week === 5 && lesson === 1) {
      const left = 4 + offset;
      const right = 3 + (index % 3);
      return typed(questionId, lesson, "How many objects are there after the new group joins?", left + right, { type: "collection_change", start: left, change: right, action: "add" });
    }
    if (week === 5 && lesson === 2) {
      const whole = 11 + offset * 2;
      const part = 3 + offset;
      return typed(questionId, lesson, "What is the missing part?", whole - part, { type: "part_whole", whole, knownPart: part });
    }
    if (week === 5 && lesson === 3) {
      const base = 4 + offset;
      const near = base + (index % 2);
      return typed(questionId, lesson, `Find the total: ${base} + ${near}.`, base + near);
    }

    if (week === 6 && lesson === 1) {
      const start = 12 + offset * 2;
      const remove = 3 + (index % 4);
      return typed(questionId, lesson, "How many objects remain after the crossed group is removed?", start - remove, { type: "collection_change", start, change: remove, action: "remove" });
    }
    if (week === 6 && lesson === 2) {
      const whole = 13 + offset;
      const known = 5 + (index % 3);
      return typed(questionId, lesson, "Find the missing part in the model.", whole - known, { type: "part_whole", whole, knownPart: known });
    }
    if (week === 6 && lesson === 3) {
      const whole = 10 + offset * 2;
      const part = 4 + offset;
      return choice(questionId, lesson, `Which subtraction fact belongs with ${part} + ${whole - part} = ${whole}?`, `${whole} - ${part} = ${whole - part}`, [`${whole} - ${whole - part} = ${whole - part}`, `${whole - part} - ${part} = ${whole}`, `${whole} + ${part} = ${whole - part}`]);
    }

    if (week === 7 && lesson === 1) {
      const start = 8 + offset;
      const change = 2 + (index % 3);
      const adding = index % 2 === 0;
      return choice(questionId, lesson, `${start} astronauts are ready. ${change} ${adding ? "more arrive" : "leave"}. Which operation matches?`, adding ? "addition" : "subtraction", [adding ? "subtraction" : "addition", "equal sharing"]);
    }
    if (week === 7 && lesson === 2) {
      const start = 9 + offset * 2;
      const change = 2 + offset;
      return typed(questionId, lesson, `A game has ${start} tokens. ${change} are used. How many tokens remain?`, start - change);
    }
    if (week === 7 && lesson === 3) {
      const first = 4 + offset;
      const second = 2 + (index % 4);
      return typed(questionId, lesson, `A badge costs $${first} and a map costs $${second}. What is the total cost?`, first + second, money(first + second));
    }

    if (week === 8 && lesson === 1) {
      const first = 5 + offset;
      const second = 3 + (index % 3);
      const total = first + second;
      return choice(questionId, lesson, "Which equation models the two groups?", `${first} + ${second} = ${total}`, [`${total} - ${first} = ${total}`, `${first} - ${second} = ${total}`, `${first} + ${total} = ${second}`], { type: "collection_change", start: first, change: second, action: "add" });
    }
    if (week === 8 && lesson === 2) {
      const whole = 14 + offset;
      const known = 6 + (index % 3);
      return typed(questionId, lesson, "What is the missing part in the diagram?", whole - known, { type: "part_whole", whole, knownPart: known });
    }
    if (week === 8 && lesson === 3) {
      const paid = 12 + offset * 2;
      const cost = 5 + offset;
      return typed(questionId, lesson, `You have $${paid}. You spend $${cost}. How many dollars remain?`, paid - cost, money(paid));
    }

    if (week === 9 && lesson === 1) {
      const bins = 2 + (index % 3);
      const each = 2 + offset;
      return typed(questionId, lesson, `The model shares ${bins * each} counters into ${bins} equal groups. How many are in each group?`, each, rows(bins, each));
    }
    if (week === 9 && lesson === 2) {
      const bins = 2 + (index % 3);
      const each = 3 + (index % 4);
      return choice(questionId, lesson, "How many counters are in each equal group?", each, [each - 1, each + 1, bins], rows(bins, each));
    }
    if (week === 9 && lesson === 3) {
      const bins = 3 + (index % 3);
      const each = 2 + (index % 4);
      return choice(questionId, lesson, "Which total is shown by the equal-sharing model?", bins * each, [bins * each - 1, bins + each, bins * each + each], rows(bins, each));
    }

    if (week === 10 && lesson === 1) {
      const step = [2, 5, 10, 2, 5][index]!;
      const groups = 3 + offset;
      return typed(questionId, lesson, `${groups} groups are counted by ${step}s. How many altogether?`, groups * step, rows(groups, step));
    }
    if (week === 10 && lesson === 2) {
      const groupCount = 3 + (index % 3);
      const groupSize = 2 + offset;
      return choice(questionId, lesson, "How many equal groups does the diagram show?", groupCount, [groupCount - 1, groupCount + 1, groupSize], rows(groupCount, groupSize));
    }
    if (week === 10 && lesson === 3) {
      const each = 3 + (index % 3);
      const total = each * (2 + offset);
      return typed(questionId, lesson, `${total} supplies are packed with ${each} in each box. How many boxes are needed?`, total / each, rows(total / each, each));
    }

    if (week === 12 && lesson === 1) {
      const prompts = [
        () => choice(questionId, lesson, "Which number is greatest?", 87, [78, 69, 86]),
        () => choice(questionId, lesson, "How many tens and ones are in 64?", "6 tens and 4 ones", ["4 tens and 6 ones", "6 tens and 3 ones", "5 tens and 4 ones"]),
        () => choice(questionId, lesson, "Continue: 25, 30, 35, __", 40, [36, 45, 50]),
        () => choice(questionId, lesson, "Which list is ordered from smallest to largest?", "19, 41, 73", ["73, 41, 19", "19, 73, 41", "41, 19, 73"]),
        () => typed(questionId, lesson, "Enter the number after 109.", 110),
      ];
      return prompts[index]!();
    }
    if (week === 12 && lesson === 2) {
      const prompts = [
        () => typed(questionId, lesson, "There are 8 stars. 7 more arrive. How many stars are there now?", 15),
        () => typed(questionId, lesson, "The whole is 17. One part is 9. What is the missing part?", 8),
        () => typed(questionId, lesson, "Share 18 counters equally into 3 groups. How many are in each group?", 6),
        () => choice(questionId, lesson, "Which operation matches: 14 birds, 5 fly away?", "subtraction", ["addition", "equal sharing"]),
        () => typed(questionId, lesson, "Four groups have 5 counters each. How many counters altogether?", 20),
      ];
      return prompts[index]!();
    }
    if (week === 12 && lesson === 3) {
      const prompts = [
        () => typed(questionId, lesson, "A game costs $7 and a puzzle costs $6. What is the total cost?", 13),
        () => choice(questionId, lesson, "What comes next: star, gem, star, gem, __?", "star", ["gem", "robot"]),
        () => typed(questionId, lesson, "You have $18 and spend $9. How many dollars remain?", 9),
        () => choice(questionId, lesson, "Which total makes 4 equal groups of 3?", 12, [7, 9, 16]),
        () => typed(questionId, lesson, "There are 6 red tokens and 8 blue tokens. How many tokens altogether?", 14),
      ];
      return prompts[index]!();
    }

    throw new Error(`No independent Year 1 quiz bank for Week ${week}, Lesson ${lesson}.`);
  });
}

export function buildYear1NumberNexusWeeklyQuiz(week: number): Year1NumberNexusQuizQuestion[] {
  if (!Number.isInteger(week) || week < 1 || week > 12) throw new Error(`Unsupported Year 1 quiz week: ${week}`);
  if (week === 11) throw new Error("Week 11 uses the dedicated visual repeating-pattern bank.");
  return ([1, 2, 3] as const).flatMap((lesson) =>
    buildLesson(week, lesson).map((question, index) => ({
      ...question,
      descriptorCodes: descriptorsFor(week, lesson, index),
      skillId: `y1-number-w${week}-l${lesson}`,
    })),
  );
}
