export type Year3NumberNexusQuizVisual =
  | { type: "dots"; count: number; cols: number; rows: number; dotSize: number; gap: number }
  | { type: "rows"; rows: number[]; dotSize: number; gap: number; rowGap: number }
  | { type: "money"; items: Array<{ value: number; label: string; image: string; kind: "coin" | "note" }> }
  | { type: "fraction"; parts: number; selected: number; label?: string };

export type Year3NumberNexusQuizQuestion = {
  id: string;
  lessonTag: 1 | 2 | 3;
  descriptorCodes: string[];
  skillId: string;
  kind: "mcq" | "typed";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctValue?: string;
  responseType?: "number";
  audioText?: string;
  visual?: Year3NumberNexusQuizVisual;
};

type Lesson = 1 | 2 | 3;
type Draft = Omit<Year3NumberNexusQuizQuestion, "descriptorCodes" | "skillId">;

const id = (week: number, lesson: Lesson, index: number) =>
  `y3-number-w${String(week).padStart(2, "0")}-l${lesson}-q${index + 1}`;

function typed(questionId: string, lessonTag: Lesson, prompt: string, answer: number, visual?: Year3NumberNexusQuizVisual): Draft {
  return { id: questionId, lessonTag, kind: "typed", prompt, correctValue: String(answer), responseType: "number", ...(visual ? { visual } : {}) };
}

function choice(questionId: string, lessonTag: Lesson, prompt: string, answer: string | number, distractors: Array<string | number>, visual?: Year3NumberNexusQuizVisual): Draft {
  const correct = String(answer);
  const values = [...new Set([correct, ...distractors.map(String)])];
  if (values.length < 3) throw new Error(`${questionId} requires at least 3 unique options.`);
  const rotation = Number(questionId.at(-1)) % Math.min(4, values.length);
  const base = values.slice(0, 4);
  const options = [...base.slice(rotation), ...base.slice(0, rotation)];
  return { id: questionId, lessonTag, kind: "mcq", prompt, options, correctIndex: options.indexOf(correct), ...(visual ? { visual } : {}) };
}

function rows(rowCount: number, rowSize: number): Year3NumberNexusQuizVisual {
  return { type: "rows", rows: Array.from({ length: rowCount }, () => rowSize), dotSize: 16, gap: 6, rowGap: 8 };
}

function dots(count: number): Year3NumberNexusQuizVisual {
  const cols = 10;
  return { type: "dots", count, cols, rows: Math.ceil(count / cols), dotSize: 14, gap: 7 };
}

function fraction(parts: number, selected: number): Year3NumberNexusQuizVisual {
  return { type: "fraction", parts, selected, label: `${selected} of ${parts} equal parts shaded` };
}

function money(amount: number): Year3NumberNexusQuizVisual {
  const denominations = [20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05] as const;
  const items: Array<{ value: number; label: string; image: string; kind: "coin" | "note" }> = [];
  let remaining = Number(amount.toFixed(2));
  for (const value of denominations) {
    while (remaining >= value - 0.001) {
      const kind = value >= 5 ? "note" : "coin";
      const cents = Math.round(value * 100);
      items.push({
        value,
        label: value < 1 ? `${cents}c` : `$${value}`,
        image: kind === "note" ? `/coins/note-${value}.png` : value < 1 ? `/coins/coin-${cents}c.png` : `/coins/coin-${value}.png`,
        kind,
      });
      remaining = Number((remaining - value).toFixed(2));
    }
  }
  return { type: "money", items };
}

function descriptorsFor(week: number, lesson: Lesson) {
  if (week === 1) return ["AC9M3N01"];
  if (week === 2) return ["AC9M3N05"];
  if (week >= 3 && week <= 5) return ["AC9M3N03"];
  if (week === 6) return lesson === 3 ? ["AC9M3N03", "AC9M3N05", "AC9M3N06"] : ["AC9M3N03", "AC9M3N06"];
  if (week === 7 || week === 8) return ["AC9M3N04"];
  if (week === 9) return lesson === 1 ? ["AC9M3M06"] : ["AC9M3N06", "AC9M3M06"];
  if (week === 10) return ["AC9M3N07"];
  return ["AC9M3N02"];
}

function buildLesson(week: number, lesson: Lesson): Draft[] {
  return Array.from({ length: 5 }, (_, index) => {
    const qid = id(week, lesson, index);

    if (week === 1) {
      if (lesson === 1) {
        const numberNames = [
          { value: 22_345, words: "twenty-two thousand three hundred and forty-five" },
          { value: 25_562, words: "twenty-five thousand five hundred and sixty-two" },
          { value: 28_779, words: "twenty-eight thousand seven hundred and seventy-nine" },
          { value: 31_996, words: "thirty-one thousand nine hundred and ninety-six" },
          { value: 35_213, words: "thirty-five thousand two hundred and thirteen" },
        ] as const;
        const item = numberNames[index]!;
        return typed(qid, lesson, `Write the numeral: ${item.words}.`, item.value);
      }
      const n = 12_345 + lesson * 10_000 + index * 3_217;
      if (lesson === 2) {
        const missing = Math.floor((n % 10_000) / 1000) * 1000;
        return typed(qid, lesson, `${n} = ${Math.floor(n / 10_000) * 10_000} + ___ + ${n % 1000}. Enter the missing part.`, missing);
      }
      const a = n;
      const b = n + 430;
      const c = n - 270;
      return choice(qid, lesson, "Which list is ordered from least to greatest?", `${c}, ${a}, ${b}`, [`${b}, ${a}, ${c}`, `${a}, ${c}, ${b}`, `${c}, ${b}, ${a}`]);
    }

    if (week === 2) {
      if (lesson === 1) {
        const count = [37, 44, 58, 63, 76][index]!;
        const estimate = Math.round(count / 10) * 10;
        return choice(qid, lesson, "About how many counters are shown? Choose the nearest 10.", estimate, [estimate - 10, estimate + 10, count], dots(count));
      }
      if (lesson === 2) {
        const n = [348, 762, 1_249, 2_651, 4_482][index]!;
        return typed(qid, lesson, `Estimate ${n} to the nearest hundred.`, Math.round(n / 100) * 100);
      }
      const a = [287, 462, 738, 1_146, 2_381][index]!;
      const b = [319, 251, 184, 827, 1_642][index]!;
      const estimate = Math.round(a / 100) * 100 + Math.round(b / 100) * 100;
      return choice(qid, lesson, `${a} + ${b} was reported as ${a + b + 1_000}. Which estimate best checks that result?`, estimate, [estimate - 200, estimate + 200, a + b + 1_000]);
    }

    if (week >= 3 && week <= 5) {
      const a = 146 + week * 37 + lesson * 28 + index * 19;
      const b = 58 + lesson * 13 + index * 7;
      if (week === 3) return typed(qid, lesson, `Calculate ${a} + ${b}.`, a + b);
      if (week === 4) return typed(qid, lesson, `Calculate ${a + b + 90} - ${b}.`, a + 90);
      return lesson === 1
        ? typed(qid, lesson, `Use regrouping to calculate ${a + 185} + ${b + 67}.`, a + b + 252)
        : typed(qid, lesson, `Use regrouping to calculate ${a + b + 300} - ${b + (lesson === 3 ? 100 : 0)}.`, a + 300 - (lesson === 3 ? 100 : 0));
    }

    if (week === 6) {
      const start = 185 + index * 37;
      const change = 48 + lesson * 11 + index * 5;
      if (lesson === 1) return typed(qid, lesson, `A library had ${start} books and received ${change} more. How many books are there now?`, start + change);
      if (lesson === 2) return typed(qid, lesson, `A hall had ${start + change} chairs. ${change} were moved. How many remain?`, start);
      const reported = start + change + 500;
      return choice(qid, lesson, `A calculation for ${start} + ${change} gives ${reported}. Is that result reasonable?`, "No, it is far too large.", ["Yes, it is close enough.", "No, it is too small.", "There is not enough information."]);
    }

    if (week === 7) {
      const r = lesson + 2;
      const c = index + 4;
      if (lesson === 1) return typed(qid, lesson, "How many counters are in the array?", r * c, rows(r, c));
      if (lesson === 2) return typed(qid, lesson, `${r} rows of ${c} counters make how many counters?`, r * c, rows(r, c));
      return choice(qid, lesson, `Which number sentence matches this array?`, `${r} × ${c} = ${r * c}`, [`${r} + ${c} = ${r + c}`, `${r * c} - ${r} = ${c}`, `${c} - ${r} = ${c - r}`], rows(r, c));
    }

    if (week === 8) {
      const groups = lesson + 2;
      const size = index + 3;
      const total = groups * size;
      if (lesson === 1) return typed(qid, lesson, `${total} counters are shared equally into ${groups} groups. How many are in each group?`, size, rows(groups, size));
      if (lesson === 2) return typed(qid, lesson, `${total} counters are arranged in groups of ${size}. How many groups are made?`, groups, rows(groups, size));
      return choice(qid, lesson, `Which multiplication fact checks ${total} ÷ ${groups} = ${size}?`, `${groups} × ${size} = ${total}`, [`${total} × ${groups} = ${size}`, `${groups} + ${size} = ${total}`, `${total} - ${groups} = ${size}`]);
    }

    if (week === 9) {
      if (lesson === 1) {
        const amount = [1.35, 1.85, 2.4, 2.75, 3.2][index]!;
        return typed(qid, lesson, "How many cents has the same value as the money shown?", Math.round(amount * 100), money(amount));
      }
      if (lesson === 2) {
        const first = 2 + index * 0.5;
        const second = 1.5 + index * 0.25;
        return typed(qid, lesson, `A notebook costs $${first.toFixed(2)} and a pen costs $${second.toFixed(2)}. Enter the total in cents.`, Math.round((first + second) * 100));
      }
      const price = 1 + index * 0.5;
      const quantity = 2 + (index % 3);
      return typed(qid, lesson, `${quantity} identical items cost $${price.toFixed(2)} each. Enter the total in cents.`, Math.round(quantity * price * 100), money(price));
    }

    if (week === 10) {
      const start = index + 2;
      if (lesson === 1) return typed(qid, lesson, `Start at ${start}. Add ${lesson + 2}, then add ${lesson + 2} again. What number is reached?`, start + 2 * (lesson + 2));
      if (lesson === 2) {
        const input = [8, 13, 20, 27, 34][index]!;
        const answer = input % 2 === 0 ? input / 2 : input + 1;
        return typed(qid, lesson, `If the input is even, halve it. Otherwise add 1. What is the output for ${input}?`, answer);
      }
      const step = [3, 4, 5, 6, 10][index]!;
      return choice(qid, lesson, `Which instructions create ${step}, ${step * 2}, ${step * 3}, ${step * 4}?`, `Start at ${step}; record; add ${step}; repeat.`, [`Start at 0; add 1; repeat.`, `Start at ${step}; double every term.`, `Start at ${step * 4}; subtract 1; repeat.`]);
    }

    if (week === 11) {
      const denominators = [2, 3, 4, 5, 10] as const;
      const parts = denominators[index]!;
      const selected = lesson === 1 ? 1 : Math.min(lesson, parts - 1);
      return choice(qid, lesson, "Which fraction of the whole is shaded?", `${selected}/${parts}`, [`${parts}/${selected}`, `${Math.max(1, selected - 1)}/${parts}`, `${Math.min(parts, selected + 1)}/${parts}`], fraction(parts, selected));
    }

    const denominators = [2, 3, 4, 5, 10] as const;
    const parts = denominators[index]!;
    const shown = Math.min(lesson, parts - 1);
    const missing = parts - shown;
    return typed(qid, lesson, `${shown}/${parts} of a whole is shown. How many ${parts}ths are needed to complete the whole?`, missing, fraction(parts, shown));
  });
}

export function buildYear3NumberNexusWeeklyQuiz(week: number): Year3NumberNexusQuizQuestion[] {
  if (!Number.isInteger(week) || week < 1 || week > 12) throw new Error(`Unsupported Year 3 Number Nexus week: ${week}`);
  return ([1, 2, 3] as const).flatMap((lesson) =>
    buildLesson(week, lesson).map((question, index) => ({
      ...question,
      descriptorCodes: descriptorsFor(week, lesson),
      skillId: `y3-number-w${week}-l${lesson}-skill-${index + 1}`,
    })),
  );
}
