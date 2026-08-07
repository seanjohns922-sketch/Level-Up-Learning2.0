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

function typed(questionId: string, lessonTag: Lesson, prompt: string, answer: number): DraftQuestion {
  return { id: questionId, lessonTag, kind: "typed", prompt, correctValue: String(answer), responseType: "number" };
}

function audio(questionId: string, lessonTag: Lesson, answer: number, distractors: number[]): DraftQuestion {
  return { ...choice(questionId, lessonTag, "Listen. Which numeral did you hear?", answer, distractors), kind: "audio", audioText: String(answer) };
}

function rows(groupCount: number, groupSize: number): Year2NumberNexusQuizQuestion["visual"] {
  return { type: "rows", rows: Array.from({ length: groupCount }, () => groupSize), dotSize: 18, gap: 6, rowGap: 9 };
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
      const lower = [100, 250, 400, 600, 800][index]!;
      const target = lower + [40, 75, 120, 165, 90][index]!;
      return choice(questionId, lesson, `A number line runs from ${lower} to ${lower + 200}. Which number is ${target - lower} after ${lower}?`, target, [target - 10, target + 10, lower + 200]);
    }
    if (week === 3 && lesson === 2) {
      const target = [134, 267, 482, 715, 946][index]!;
      const nearest = Math.round(target / 10) * 10;
      return choice(questionId, lesson, `Which multiple of 10 is nearest to ${target}?`, nearest, [nearest - 10, nearest + 10, target]);
    }
    if (week === 3 && lesson === 3) {
      const lower = [0, 200, 400, 600, 800][index]!;
      const estimate = lower + [60, 130, 80, 150, 40][index]!;
      return choice(questionId, lesson, `A mark is about ${estimate - lower} past ${lower} on a line ending at ${lower + 200}. What is the best estimate?`, estimate, [estimate - 30, estimate + 30, lower + 200]);
    }

    if (week === 4 && lesson === 1) {
      const value = [37, 52, 69, 84, 115][index]!;
      return choice(questionId, lesson, `Is ${value} odd or even?`, value % 2 === 0 ? "even" : "odd", [value % 2 === 0 ? "odd" : "even", "both"]);
    }
    if (week === 4 && lesson === 2) {
      const value = [46, 73, 98, 121, 154][index]!;
      const answer = value % 2 === 0 ? "It can be paired with none left over." : "One is left after making pairs.";
      return choice(questionId, lesson, `Which statement explains whether ${value} is odd or even?`, answer, [value % 2 === 0 ? "One is left after making pairs." : "It can be paired with none left over.", "Its tens digit decides."]);
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
      return typed(questionId, lesson, `Start at ${a}. Jump forward ${b}. Where do you land?`, a + b);
    }
    if (week === 5 && lesson === 2) {
      const a = [32, 45, 56, 63, 74][index]!;
      const b = [24, 33, 27, 36, 18][index]!;
      return typed(questionId, lesson, `Add the tens and ones: ${a} + ${b}.`, a + b);
    }
    if (week === 5 && lesson === 3) {
      const a = [38, 49, 57, 68, 76][index]!;
      const b = [22, 31, 23, 32, 24][index]!;
      return typed(questionId, lesson, `Use a friendly number to solve ${a} + ${b}.`, a + b);
    }

    if (week === 6 && lesson === 1) {
      const a = [64, 73, 85, 92, 108][index]!;
      const b = [18, 26, 37, 45, 29][index]!;
      return typed(questionId, lesson, `Start at ${a}. Jump back ${b}. Where do you land?`, a - b);
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
      return typed(questionId, lesson, `${total} game pieces include ${known} blue pieces. How many are another colour?`, total - known);
    }

    if (week === 8 && lesson === 1) {
      const factor = [3, 5, 7, 9, 10][index]!;
      const total = factor * 2;
      return choice(questionId, lesson, `Double ${factor} is ${total}. Which related division fact is true?`, `${total} ÷ 2 = ${factor}`, [`${total} ÷ ${factor} = ${factor}`, `${total} ÷ 2 = ${factor + 1}`, `${factor} ÷ 2 = ${total}`]);
    }
    if (week === 8 && lesson === 2) {
      const start = [10, 20, 35, 45, 60][index]!;
      return index % 2 === 0
        ? typed(questionId, lesson, `Count forward three steps by 5 from ${start}.`, start + 15)
        : typed(questionId, lesson, `Count back three steps by 5 from ${start}.`, start - 15);
    }
    if (week === 8 && lesson === 3) {
      const step = [2, 5, 10, 5, 10][index]!;
      const start = [4, 35, 20, 45, 30][index]!;
      const direction = index % 2 === 0 ? 1 : -1;
      const thirdNewTerm = start + direction * step * 3;
      if (index < 3) {
        return typed(
          questionId,
          lesson,
          `A pattern starts at ${start} and ${direction === 1 ? "adds" : "subtracts"} ${step} each time. What is the third new term?`,
          thirdNewTerm,
        );
      }
      const answer = `${start}, ${start + direction * step}, ${start + direction * step * 2}, ${thirdNewTerm}`;
      return choice(
        questionId,
        lesson,
        `Which pattern follows the rule: start at ${start} and ${direction === 1 ? "add" : "subtract"} ${step}?`,
        answer,
        [
          `${start}, ${start + direction * (step + 1)}, ${start + direction * (step + 1) * 2}, ${start + direction * (step + 1) * 3}`,
          `${start}, ${start - direction * step}, ${start - direction * step * 2}, ${start - direction * step * 3}`,
          `${start}, ${start + direction * step}, ${start + direction * step * 3}, ${start + direction * step * 4}`,
        ],
      );
    }

    if (week === 9 && lesson === 1) {
      const groups = [2, 3, 4, 5, 6][index]!;
      const each = [5, 4, 3, 2, 5][index]!;
      return typed(questionId, lesson, `${groups} equal groups have ${each} counters in each group. How many counters altogether?`, groups * each);
    }
    if (week === 9 && lesson === 2) {
      const groupCount = [2, 3, 4, 5, 3][index]!;
      const groupSize = [6, 5, 4, 3, 8][index]!;
      return choice(questionId, lesson, "Which multiplication sentence matches the array?", `${groupCount} × ${groupSize} = ${groupCount * groupSize}`, [`${groupCount} + ${groupSize} = ${groupCount * groupSize}`, `${groupCount * groupSize} ÷ ${groupSize} = ${groupSize}`, `${groupCount} × ${groupCount} = ${groupCount * groupSize}`], rows(groupCount, groupSize));
    }
    if (week === 9 && lesson === 3) {
      const groups = [3, 4, 5, 6, 4][index]!;
      const each = [4, 5, 3, 2, 7][index]!;
      const repeated = Array.from({ length: groups }, () => each).join(" + ");
      return choice(questionId, lesson, `Which multiplication sentence has the same value as ${repeated}?`, `${groups} × ${each} = ${groups * each}`, [`${groups} + ${each} = ${groups * each}`, `${each} × ${each} = ${groups * each}`, `${groups * each} ÷ ${groups} = ${groups}`]);
    }

    if (week === 10 && lesson === 1) {
      const groups = [2, 3, 4, 5, 6][index]!;
      const each = [6, 5, 4, 3, 5][index]!;
      return typed(questionId, lesson, `Share ${groups * each} counters equally among ${groups} students. How many does each student get?`, each);
    }
    if (week === 10 && lesson === 2) {
      const groupSize = [2, 5, 10, 2, 5][index]!;
      const groupCount = [7, 4, 3, 9, 6][index]!;
      return typed(questionId, lesson, `Put ${groupSize * groupCount} counters into groups of ${groupSize}. How many groups are made?`, groupCount);
    }
    if (week === 10 && lesson === 3) {
      const factor = [4, 6, 7, 8, 9][index]!;
      const total = factor * 2;
      return choice(questionId, lesson, `Use 2 × ${factor} = ${total}. Which division fact checks it?`, `${total} ÷ 2 = ${factor}`, [`${total} ÷ ${factor} = ${factor}`, `${total} ÷ 2 = ${factor - 1}`, `${factor} ÷ 2 = ${total}`]);
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
      return choice(questionId, lesson, `Which fraction names ${numerator} of ${denominator} equal parts?`, `${numerator}/${denominator}`, [`${denominator}/${numerator}`, `${numerator}/${denominator + 1}`, `${Math.min(denominator, numerator + 1)}/${denominator}`]);
    }
    if (week === 12 && lesson === 2) {
      if (index === 0) {
        return typed(questionId, lesson, "Halve one whole once. How many equal parts are made?", 2);
      }
      if (index === 1) {
        return typed(questionId, lesson, "Halve both halves. How many equal parts are made now?", 4);
      }
      if (index === 2) {
        return typed(questionId, lesson, "Halve all 4 quarters. How many equal parts are made now?", 8);
      }
      if (index === 3) {
        return choice(questionId, lesson, "Which statement is true after quarters are halved?", "One eighth is half of one quarter.", ["One eighth is twice one quarter.", "One quarter is half of one eighth."]);
      }
      return typed(questionId, lesson, "A whole is halved 3 times. How many equal parts are made?", 8);
    }
    if (week === 12 && lesson === 3) {
      const pair = [[1, 2, 4, 8], [1, 4, 2, 8], [2, 4, 4, 8], [3, 4, 6, 8], [1, 2, 2, 4]][index]!;
      return choice(questionId, lesson, "Which two fractions represent the same amount?", `${pair[0]}/${pair[1]} and ${pair[2]}/${pair[3]}`, [`${pair[0]}/${pair[1]} and ${pair[2] - 1}/${pair[3]}`, `${pair[0]}/${pair[1]} and ${pair[2] + 1}/${pair[3]}`, `${pair[1]}/${pair[0]} and ${pair[2]}/${pair[3]}`]);
    }

    throw new Error(`No independent Year 2 quiz bank for Week ${week}, Lesson ${lesson}.`);
  });
}

export function buildYear2NumberNexusWeeklyQuiz(week: number): Year2NumberNexusQuizQuestion[] {
  if (!Number.isInteger(week) || week < 1 || week > 12) throw new Error(`Unsupported Year 2 quiz week: ${week}`);
  return ([1, 2, 3] as const).flatMap((lesson) =>
    buildLesson(week, lesson).map((question) => ({
      ...question,
      descriptorCodes: descriptorsFor(week, lesson),
      skillId: `y2-number-w${week}-l${lesson}`,
    })),
  );
}
