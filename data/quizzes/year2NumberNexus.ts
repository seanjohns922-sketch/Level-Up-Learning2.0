export type Year2NumberNexusQuizQuestion = {
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
    type: "money";
    items: Array<{
      value: number;
      label: string;
      image: string;
      kind: "coin" | "note";
    }>;
  } | {
    type: "number_line";
    min: number;
    max: number;
    marker: number;
    ticks: number[];
  } | {
    type: "additive_pattern";
    terms: number[];
    token: "shape" | "object";
  } | {
    type: "jump_line";
    start: number;
    jumps: number[];
  } | {
    type: "fraction";
    parts: number;
    selected: number;
    label?: string;
  };
};

type Lesson = 1 | 2 | 3;
type DraftQuestion = Omit<Year2NumberNexusQuizQuestion, "descriptorCodes" | "skillId">;

function id(week: number, lesson: Lesson, index: number) {
  return `y2-number-w${String(week).padStart(2, "0")}-l${lesson}-q${index + 1}`;
}

function choice(
  questionId: string,
  lessonTag: Lesson,
  prompt: string,
  answer: string | number,
  distractors: readonly (string | number)[],
  visual?: Year2NumberNexusQuizQuestion["visual"],
): DraftQuestion {
  const correct = String(answer);
  const unique = [...new Set([correct, ...distractors.map(String)])].slice(0, 4);
  if (unique.length < 3) throw new Error(`${questionId} requires at least three unique options.`);
  const rotation = Number(questionId.slice(-1)) % unique.length;
  const options = [...unique.slice(rotation), ...unique.slice(0, rotation)];
  return {
    id: questionId,
    lessonTag,
    kind: "mcq",
    prompt,
    options,
    correctIndex: options.indexOf(correct),
    ...(visual ? { visual } : {}),
  };
}

function typed(questionId: string, lessonTag: Lesson, prompt: string, answer: number, visual?: Year2NumberNexusQuizQuestion["visual"]): DraftQuestion {
  return { id: questionId, lessonTag, kind: "typed", prompt, correctValue: String(answer), responseType: "number", ...(visual ? { visual } : {}) };
}

function audio(questionId: string, lessonTag: Lesson, answer: number, distractors: number[]): DraftQuestion {
  return { ...choice(questionId, lessonTag, "Listen. Which numeral did you hear?", answer, distractors), kind: "audio", audioText: String(answer) };
}

function rows(groupCount: number, groupSize: number): Year2NumberNexusQuizQuestion["visual"] {
  return { type: "rows", rows: Array.from({ length: groupCount }, () => groupSize), dotSize: 18, gap: 6, rowGap: 9 };
}

function numberLine(min: number, max: number, marker: number, ticks: number[]): Year2NumberNexusQuizQuestion["visual"] {
  return { type: "number_line", min, max, marker, ticks };
}

function money(amount: number): Year2NumberNexusQuizQuestion["visual"] {
  const denominations = [20, 10, 5, 2, 1] as const;
  const items: Array<{ value: number; label: string; image: string; kind: "coin" | "note" }> = [];
  let remaining = amount;
  for (const value of denominations) {
    while (remaining >= value) {
      const kind = value >= 5 ? "note" : "coin";
      items.push({
        value,
        label: `$${value}`,
        image: kind === "note" ? `/coins/note-${value}.png` : `/coins/coin-${value}.png`,
        kind,
      });
      remaining -= value;
    }
  }
  return { type: "money", items };
}

function descriptorsFor(week: number, lesson: Lesson): string[] {
  if (week === 1) return ["AC9M2N01"];
  if (week === 2) return ["AC9M2N02"];
  if (week === 3) return ["AC9M2N01", "AC9M2N02"];
  if (week === 4) return ["AC9M2A02"];
  if (week === 5 || week === 6) return ["AC9M2N04"];
  if (week === 7) return ["AC9M2N04", "AC9M2A02"];
  if (week === 8) return lesson === 1 ? ["AC9M2A01", "AC9M2A03", "AC9M2N05"] : ["AC9M2A01", "AC9M2N05"];
  if (week === 9) return ["AC9M2N05"];
  if (week === 10) return lesson === 3 ? ["AC9M2N05", "AC9M2A03"] : ["AC9M2N05"];
  if (week === 11) return ["AC9M2N06"];
  return ["AC9M2N03"];
}

function buildLesson(week: number, lesson: Lesson): DraftQuestion[] {
  return Array.from({ length: 5 }, (_, index) => {
    const questionId = id(week, lesson, index);

    if (week === 1 && lesson === 1) {
      const target = [126, 308, 475, 692, 841][index]!;
      return audio(questionId, lesson, target, [target - 100, target - 10, target + 1]);
    }
    if (week === 1 && lesson === 2) {
      const target = [243, 507, 681, 794, 930][index]!;
      const hundreds = Math.floor(target / 100);
      const tens = Math.floor((target % 100) / 10);
      const ones = target % 10;
      return choice(questionId, lesson, `${hundreds} hundreds, ${tens} tens and ${ones} ones show which number?`, target, [hundreds * 100 + ones * 10 + tens, target - 100, target + 10]);
    }
    if (week === 1 && lesson === 3) {
      const start = [104, 237, 415, 608, 752][index]!;
      return choice(questionId, lesson, "Which list is ordered from least to greatest?", `${start}, ${start + 19}, ${start + 64}`, [`${start + 64}, ${start + 19}, ${start}`, `${start}, ${start + 64}, ${start + 19}`, `${start + 19}, ${start}, ${start + 64}`]);
    }

    if (week === 2 && lesson === 1) {
      const target = [354, 602, 478, 905, 731][index]!;
      const h = Math.floor(target / 100);
      const t = Math.floor((target % 100) / 10);
      const o = target % 10;
      return choice(questionId, lesson, `How is ${target} partitioned into place-value parts?`, `${h} hundreds, ${t} tens, ${o} ones`, [`${t} hundreds, ${h} tens, ${o} ones`, `${h} hundreds, ${o} tens, ${t} ones`, `${h - 1} hundreds, ${t} tens, ${o} ones`]);
    }
    if (week === 2 && lesson === 2) {
      const target = [426, 709, 581, 340, 968][index]!;
      const expanded = `${Math.floor(target / 100) * 100} + ${Math.floor((target % 100) / 10) * 10} + ${target % 10}`;
      return choice(questionId, lesson, `Which expanded form has the same value as ${target}?`, expanded, [`${Math.floor(target / 100) * 100} + ${target % 100 + 10}`, `${Math.floor(target / 10) * 10} + ${Math.floor(target / 100)}`, `${target + 100} + 0 + 0`]);
    }
    if (week === 2 && lesson === 3) {
      const target = [346, 520, 684, 731, 895][index]!;
      const first = [200, 400, 500, 600, 700][index]!;
      return typed(questionId, lesson, `${target} is renamed as ${first} + __. Enter the missing part.`, target - first);
    }

    if (week === 3 && lesson === 1) {
      const lower = [100, 200, 400, 600, 800][index]!;
      const target = lower + [40, 70, 120, 160, 90][index]!;
      const upper = lower + 200;
      return choice(
        questionId,
        lesson,
        "Which number is marked on the number line?",
        target,
        [target - 20, target + 20, upper],
        numberLine(lower, upper, target, [lower, lower + 50, lower + 100, lower + 150, upper]),
      );
    }
    if (week === 3 && lesson === 2) {
      const target = [134, 267, 482, 715, 946][index]!;
      const nearest = Math.round(target / 10) * 10;
      const lower = Math.floor(target / 10) * 10;
      const upper = lower + 10;
      return choice(
        questionId,
        lesson,
        "Which multiple of 10 is the marker closest to?",
        nearest,
        [nearest === lower ? upper : lower, target, nearest + (nearest === lower ? -10 : 10)],
        numberLine(lower, upper, target, [lower, lower + 5, upper]),
      );
    }
    if (week === 3 && lesson === 3) {
      const lower = [0, 200, 400, 600, 800][index]!;
      const estimate = lower + [60, 130, 80, 150, 40][index]!;
      const upper = lower + 200;
      return choice(
        questionId,
        lesson,
        "What is the best estimate for the marker?",
        estimate,
        [estimate - 30, estimate + 30, upper],
        numberLine(lower, upper, estimate, [lower, lower + 50, lower + 100, lower + 150, upper]),
      );
    }

    if (week === 4 && lesson === 1) {
      const value = [37, 52, 69, 84, 115][index]!;
      return choice(questionId, lesson, `Is ${value} odd or even?`, value % 2 === 0 ? "even" : "odd", [value % 2 === 0 ? "odd" : "even", "both"]);
    }
    if (week === 4 && lesson === 2) {
      const starts = [3, 8, 15, 22, 31][index]!;
      const answer = starts + 6;
      return choice(
        questionId,
        lesson,
        `The pattern keeps the same parity: ${starts}, ${starts + 2}, ${starts + 4}, __. Which number comes next?`,
        answer,
        [answer - 1, answer + 1, answer + 2],
      );
    }
    if (week === 4 && lesson === 3) {
      const a = [13, 18, 27, 32, 45][index]!;
      const b = [9, 15, 24, 31, 38][index]!;
      const sum = a + b;
      return choice(questionId, lesson, `${a} + ${b} = ${sum}. Is the sum odd or even?`, sum % 2 === 0 ? "even" : "odd", [sum % 2 === 0 ? "odd" : "even", "cannot tell"]);
    }

    if (week === 5 && lesson === 1) {
      const a = [26, 34, 47, 58, 63][index]!;
      const b = [18, 27, 35, 24, 29][index]!;
      const tens = Math.floor(b / 10) * 10;
      const ones = b - tens;
      return typed(questionId, lesson, "Where does the open number-line path finish?", a + b, { type: "jump_line", start: a, jumps: [tens, ones] });
    }
    if (week === 5 && lesson === 2) {
      const a = [32, 45, 56, 63, 74][index]!;
      const b = [24, 33, 27, 36, 18][index]!;
      return typed(questionId, lesson, `Add: ${a} + ${b}.`, a + b);
    }
    if (week === 5 && lesson === 3) {
      const a = [38, 49, 57, 68, 76][index]!;
      const b = [22, 31, 23, 32, 24][index]!;
      return typed(questionId, lesson, `Use a friendly number to solve ${a} + ${b}.`, a + b);
    }

    if (week === 6 && lesson === 1) {
      const a = [64, 73, 85, 92, 108][index]!;
      const b = [18, 26, 37, 45, 29][index]!;
      const tens = Math.floor(b / 10) * -10;
      const ones = -(b % 10);
      return typed(questionId, lesson, "Where does the open number-line path finish?", a - b, { type: "jump_line", start: a, jumps: [tens, ones] });
    }
    if (week === 6 && lesson === 2) {
      const a = [76, 84, 93, 105, 117][index]!;
      const b = [24, 32, 41, 53, 68][index]!;
      return typed(questionId, lesson, `Subtract by splitting tens and ones: ${a} - ${b}.`, a - b);
    }
    if (week === 6 && lesson === 3) {
      const a = [51, 62, 74, 83, 96][index]!;
      const b = [19, 28, 39, 47, 58][index]!;
      return typed(questionId, lesson, `Use a known fact to solve ${a} - ${b}.`, a - b);
    }

    if (week === 7 && lesson === 1) {
      const a = [7, 9, 12, 14, 16][index]!;
      const b = [5, 8, 6, 9, 7][index]!;
      const total = a + b;
      return choice(questionId, lesson, `Which subtraction fact belongs to ${a} + ${b} = ${total}?`, `${total} - ${a} = ${b}`, [`${total} - ${b} = ${b}`, `${a} - ${b} = ${total}`, `${total} + ${a} = ${b}`]);
    }
    if (week === 7 && lesson === 2) {
      const a = [8, 11, 13, 15, 17][index]!;
      const b = [6, 7, 9, 8, 5][index]!;
      return choice(questionId, lesson, `Which set is the complete fact family for ${a}, ${b} and ${a + b}?`, `${a}+${b}=${a + b}; ${b}+${a}=${a + b}; ${a + b}-${a}=${b}; ${a + b}-${b}=${a}`, [`${a}+${b}=${a + b}; ${a + b}-${a}=${a}`, `${a}-${b}=${a + b}; ${b}-${a}=${a + b}`, `${a}+${a}=${a + b}; ${b}+${b}=${a + b}`]);
    }
    if (week === 7 && lesson === 3) {
      const total = [24, 31, 38, 42, 49][index]!;
      const known = [9, 14, 16, 18, 21][index]!;
      const answer = total - known;
      return index < 3
        ? typed(questionId, lesson, `${total} game pieces include ${known} blue pieces. How many are another colour?`, answer)
        : choice(questionId, lesson, `${total} game pieces include ${known} blue pieces and ${answer} another colour. Which inverse fact checks the missing part?`, `${known} + ${answer} = ${total}`, [`${total} + ${known} = ${answer}`, `${known} - ${answer} = ${total}`, `${total} - ${answer} = ${answer}`]);
    }

    if (week === 8 && lesson === 1) {
      if (index < 2) {
        const start = [8, 22][index]!;
        return typed(questionId, lesson, `Count forward 4 steps by 2 from ${start}.`, start + 8);
      }
      if (index === 2) {
        return typed(questionId, lesson, "Enter the missing number: 34, 36, __, 40, 42.", 38);
      }
      if (index === 3) {
        const factor = 9;
        return typed(questionId, lesson, `What is double ${factor}?`, factor * 2, rows(2, factor));
      }
      const factor = 7;
      const total = factor * 2;
      return choice(
        questionId,
        lesson,
        `The model shows double ${factor}. Which division fact reverses the double?`,
        `${total} ÷ 2 = ${factor}`,
        [`${total} ÷ ${factor} = ${factor}`, `${total} ÷ 2 = ${factor + 1}`, `${factor} ÷ 2 = ${total}`],
        rows(2, factor),
      );
    }
    if (week === 8 && lesson === 2) {
      if (index < 2) {
        const start = [10, 35][index]!;
        return typed(questionId, lesson, `Count forward 3 steps by 5 from ${start}.`, start + 15);
      }
      if (index < 4) {
        const start = [60, 85][index - 2]!;
        return typed(questionId, lesson, `Count back 3 steps by 5 from ${start}.`, start - 15);
      }
      return typed(questionId, lesson, "Enter the missing number: 70, 65, __, 55, 50.", 60);
    }
    if (week === 8 && lesson === 3) {
      if (index === 0) return typed(questionId, lesson, "Create the next term: 6, 8, 10, 12, __.", 14);
      if (index === 1) return typed(questionId, lesson, "Create the next term: 25, 20, 15, 10, __.", 5);
      if (index === 2) {
        return typed(questionId, lesson, "A shape pattern has 2, then 4, then 6 shapes. How many shapes belong in the next term?", 8, { type: "additive_pattern", terms: [2, 4, 6], token: "shape" });
      }
      if (index === 3) {
        return typed(questionId, lesson, "An object pattern has 8, then 6, then 4 objects. How many objects belong in the next term?", 2, { type: "additive_pattern", terms: [8, 6, 4], token: "object" });
      }
      return choice(
        questionId,
        lesson,
        "Which rule creates the object pattern shown?",
        "Add 2 each time.",
        ["Subtract 2 each time.", "Add 1 each time.", "Double each time."],
        { type: "additive_pattern", terms: [3, 5, 7], token: "object" },
      );
    }

    if (week === 9 && lesson === 1) {
      const groups = [2, 3, 4, 5, 6][index]!;
      const each = [2, 5, 10, 2, 5][index]!;
      return typed(questionId, lesson, "How many counters are shown in the equal groups?", groups * each, rows(groups, each));
    }
    if (week === 9 && lesson === 2) {
      const groupCount = [2, 3, 4, 5, 3][index]!;
      const groupSize = [2, 5, 10, 2, 5][index]!;
      return choice(questionId, lesson, "Which multiplication sentence matches the array?", `${groupCount} × ${groupSize} = ${groupCount * groupSize}`, [`${groupCount} + ${groupSize} = ${groupCount * groupSize}`, `${groupCount * groupSize} ÷ ${groupSize} = ${groupSize}`, `${groupCount} × ${groupCount} = ${groupCount * groupSize}`], rows(groupCount, groupSize));
    }
    if (week === 9 && lesson === 3) {
      const groups = [3, 4, 5, 6, 4][index]!;
      const each = [2, 5, 10, 2, 5][index]!;
      const repeated = Array.from({ length: groups }, () => each).join(" + ");
      return choice(questionId, lesson, `Which multiplication sentence matches ${repeated}?`, `${groups} × ${each} = ${groups * each}`, [`${groups} + ${each} = ${groups * each}`, `${each} × ${each} = ${groups * each}`, `${groups * each} ÷ ${groups} = ${groups}`], rows(groups, each));
    }

    if (week === 10 && lesson === 1) {
      const groups = [2, 5, 10, 2, 5][index]!;
      const each = [6, 4, 3, 8, 6][index]!;
      return typed(questionId, lesson, `The model shares ${groups * each} counters equally into ${groups} rows. How many are in each row?`, each, rows(groups, each));
    }
    if (week === 10 && lesson === 2) {
      const groupSize = [2, 5, 10, 2, 5][index]!;
      const groupCount = [7, 4, 3, 9, 6][index]!;
      return typed(questionId, lesson, `The model has groups of ${groupSize}. How many groups are shown?`, groupCount, rows(groupCount, groupSize));
    }
    if (week === 10 && lesson === 3) {
      const factor = [4, 6, 7, 8, 9][index]!;
      const total = factor * 2;
      return choice(questionId, lesson, `The model shows 2 × ${factor} = ${total}. Which division fact checks it?`, `${total} ÷ 2 = ${factor}`, [`${total} ÷ ${factor} = ${factor}`, `${total} ÷ 2 = ${factor - 1}`, `${factor} ÷ 2 = ${total}`], rows(2, factor));
    }

    if (week === 11 && lesson === 1) {
      const amount = [6, 8, 12, 17, 24][index]!;
      return { ...typed(questionId, lesson, "How much money is shown? Enter the amount in dollars.", amount), visual: money(amount) };
    }
    if (week === 11 && lesson === 2) {
      if (index >= 3) {
        const price = [2, 3][index - 3]!;
        const quantity = [4, 5][index - 3]!;
        return { ...typed(questionId, lesson, `One item costs $${price}. You buy ${quantity}. What is the total cost in dollars?`, price * quantity), visual: money(price) };
      }
      const first = [3, 5, 7][index]!;
      const second = [4, 6, 8][index]!;
      return { ...typed(questionId, lesson, `One item costs $${first} and another costs $${second}. What is the total in dollars?`, first + second), visual: money(first + second) };
    }
    if (week === 11 && lesson === 3) {
      const paid = [5, 10, 10, 20, 20][index]!;
      const cost = [3, 6, 7, 13, 15][index]!;
      return { ...typed(questionId, lesson, `You pay $${paid} for an item costing $${cost}. How many dollars change should you receive?`, paid - cost), visual: money(paid) };
    }

    if (week === 12 && lesson === 1) {
      const numerator = [1, 2, 1, 3, 2][index]!;
      const denominator = [2, 4, 2, 4, 4][index]!;
      return choice(questionId, lesson, "Which fraction names the shaded part of the whole?", `${numerator}/${denominator}`, [`${denominator}/${numerator}`, `${numerator}/${denominator + 1}`, `${Math.min(denominator, numerator + 1)}/${denominator}`], { type: "fraction", parts: denominator, selected: numerator });
    }
    if (week === 12 && lesson === 2) {
      if (index === 0) {
        return typed(questionId, lesson, "Halve this whole once. How many equal parts will there be?", 2, { type: "fraction", parts: 1, selected: 1 });
      }
      if (index === 1) {
        return typed(questionId, lesson, "Halve both halves. How many equal parts will there be?", 4, { type: "fraction", parts: 2, selected: 1 });
      }
      if (index === 2) {
        return typed(questionId, lesson, "Halve all 4 quarters. How many equal parts will there be?", 8, { type: "fraction", parts: 4, selected: 1 });
      }
      if (index === 3) {
        return choice(questionId, lesson, "This whole is split into quarters. Which statement is true after every quarter is halved?", "One eighth is half of one quarter.", ["One eighth is twice one quarter.", "One quarter is half of one eighth."], { type: "fraction", parts: 4, selected: 1 });
      }
      return typed(questionId, lesson, "A whole is halved 3 times. How many equal parts are made?", 8, { type: "fraction", parts: 2, selected: 1 });
    }
    if (week === 12 && lesson === 3) {
      const denominator = [2, 4, 8, 4, 8][index]!;
      return choice(questionId, lesson, "Which fraction matches the shaded picture?", `1/${denominator}`, [`${denominator}/1`, `1/${denominator === 2 ? 4 : 2}`, `${Math.min(denominator, 2)}/${denominator}`], { type: "fraction", parts: denominator, selected: 1 });
    }

    throw new Error(`No independent Year 2 quiz bank for Week ${week}, Lesson ${lesson}.`);
  });
}

export function buildYear2NumberNexusWeeklyQuiz(week: number): Year2NumberNexusQuizQuestion[] {
  if (!Number.isInteger(week) || week < 1 || week > 12) throw new Error(`Unsupported Year 2 quiz week: ${week}`);
  return ([1, 2, 3] as const).flatMap((lesson) =>
    buildLesson(week, lesson).map((question, index) => ({
      ...question,
      descriptorCodes: descriptorsFor(week, lesson),
      skillId: week === 8
        ? [
            ["skip-by-2", "skip-by-2", "missing-by-2", "double", "inverse-double"],
            ["forward-by-5", "forward-by-5", "backward-by-5", "backward-by-5", "missing-by-5"],
            ["create-number-increase", "create-number-decrease", "create-shape-increase", "create-object-decrease", "identify-object-rule"],
          ][lesson - 1]![index]!
        : `y2-number-w${week}-l${lesson}`,
    })),
  );
}
