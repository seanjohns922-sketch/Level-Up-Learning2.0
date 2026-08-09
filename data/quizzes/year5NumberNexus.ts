export type Year5NumberNexusQuizQuestion = {
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
};

type Lesson = 1 | 2 | 3;
type Draft = Omit<Year5NumberNexusQuizQuestion, "descriptorCodes" | "skillId">;

const itemId = (week: number, lesson: Lesson, index: number) =>
  `y5-number-w${String(week).padStart(2, "0")}-l${lesson}-q${index + 1}`;

function typed(id: string, lessonTag: Lesson, prompt: string, answer: number): Draft {
  return { id, lessonTag, kind: "typed", prompt, correctValue: String(answer), responseType: "number" };
}

function choice(
  id: string,
  lessonTag: Lesson,
  prompt: string,
  answer: string | number,
  distractors: Array<string | number>,
): Draft {
  const correct = String(answer);
  const values = [...new Set([correct, ...distractors.map(String)])].slice(0, 4);
  if (values.length < 3) throw new Error(`${id} requires at least three unique options.`);
  const rotation = Number(id.at(-1)) % values.length;
  const options = [...values.slice(rotation), ...values.slice(0, rotation)];
  return { id, lessonTag, kind: "mcq", prompt, options, correctIndex: options.indexOf(correct) };
}

function descriptorFor(week: number, lesson: Lesson): string[] {
  if (week === 1) return lesson === 2 ? ["AC9M5N08", "AC9M5N09"] : ["AC9M5N01"];
  if (week === 2) return lesson === 1 ? ["AC9M5N01"] : lesson === 2 ? ["AC9M5N08"] : ["AC9M5N08", "AC9M5N09"];
  if (week === 3) return lesson === 3 ? ["AC9M5N02", "AC9M5N10"] : ["AC9M5N02"];
  if (week === 4) return ["AC9M5N02", "AC9M5N10"];
  if (week === 5) return lesson === 3 ? ["AC9M5N06", "AC9M5N08"] : ["AC9M5N06"];
  if (week === 6) return lesson === 3 ? ["AC9M5N08"] : ["AC9M5N07"];
  if (week === 7) return ["AC9M5N03"];
  if (week === 8) return ["AC9M5N05"];
  if (week === 9 || week === 10) return ["AC9M5N04"];
  if (week === 11) return lesson === 3 ? ["AC9M5N08"] : lesson === 1 ? ["AC9M5N09"] : ["AC9M5N08", "AC9M5N09"];
  if (lesson === 1) return ["AC9M5N01", "AC9M5N03", "AC9M5N04", "AC9M5N05"];
  if (lesson === 2) return ["AC9M5N06", "AC9M5N07", "AC9M5N08", "AC9M5N09"];
  return ["AC9M5N02", "AC9M5N10"];
}

function buildLesson(week: number, lesson: Lesson): Draft[] {
  return Array.from({ length: 5 }, (_, index) => {
    const id = itemId(week, lesson, index);

    if (week === 1) {
      if (lesson === 1) {
        const values = [3.407, 6.025, 8.316, 12.509, 24.083];
        const value = values[index]!;
        const whole = Math.floor(value);
        const thousandths = Math.round((value - whole) * 1000);
        return typed(id, lesson, `Write ${whole} and ${thousandths} thousandths as a decimal.`, value);
      }
      if (lesson === 2) {
        const packs = 3 + index;
        const each = 18 + index * 4;
        return typed(id, lesson, `${packs} packs cost $${each} each. What is the total cost?`, packs * each);
      }
      const starts = [0.2, 1.1, 2.3, 3.4, 4.05];
      const start = starts[index]!;
      const step = index === 4 ? 0.01 : 0.1;
      return typed(id, lesson, `A number line starts at ${start}. What is 4 equal intervals of ${step} after it?`, Number((start + 4 * step).toFixed(3)));
    }

    if (week === 2) {
      if (lesson === 1) {
        const a = Number((2.35 + index * 0.61).toFixed(2));
        const b = Number((1.4 + index * 0.27).toFixed(2));
        return typed(id, lesson, `$${a.toFixed(2)} + $${b.toFixed(2)} =`, Number((a + b).toFixed(2)));
      }
      if (lesson === 2) {
        const values = [4.376, 8.941, 2.685, 13.149, 6.555];
        const value = values[index]!;
        return typed(id, lesson, `Round ${value} to the nearest hundredth.`, Math.round((value + Number.EPSILON) * 100) / 100);
      }
      const exact = [198, 407, 612, 795, 1002][index]!;
      const estimate = Math.round(exact / 100) * 100;
      return choice(id, lesson, `Which estimate is closest to ${exact}?`, estimate, [estimate - 100, estimate + 100, estimate + 200]);
    }

    if (week === 3) {
      const number = [24, 36, 42, 54, 72][index]!;
      if (lesson === 1) return choice(id, lesson, `Which number is a factor of ${number}?`, 6, [5, 7, 11]);
      if (lesson === 2) return choice(id, lesson, `Is ${number * 7} divisible by 7?`, "Yes", ["No", "Only if it is even"]);
      const candidate = number + index;
      return choice(id, lesson, `Test ${candidate}: is it divisible by 3?`, candidate % 3 === 0 ? "Yes" : "No", [candidate % 3 === 0 ? "No" : "Yes", "Cannot be decided"]);
    }

    if (week === 4) {
      const base = 4 + index;
      if (lesson === 1) return typed(id, lesson, `Continue the multiples of ${base}: ${base}, ${base * 2}, ${base * 3}, __.`, base * 4);
      if (lesson === 2) {
        const value = 120 + index * 15;
        return choice(id, lesson, `Which test proves ${value} is divisible by 5?`, "It ends in 0 or 5", ["Its digits add to 5", "It is even", "It has two digits"]);
      }
      const step = 6 + index;
      return typed(id, lesson, `The first output is ${step}. Add ${step} each time. What is the fifth output?`, step * 5);
    }

    if (week === 5) {
      const a = 126 + index * 37;
      if (lesson === 1) return typed(id, lesson, `${a} × ${3 + index} =`, a * (3 + index));
      if (lesson === 2) {
        const b = 12 + index * 3;
        return typed(id, lesson, `${a} × ${b} =`, a * b);
      }
      const factor = 18 + index * 7;
      const multiplier = 21 + index;
      const estimate = Math.round(factor / 10) * 10 * Math.round(multiplier / 10) * 10;
      return choice(id, lesson, `Which estimate best checks ${factor} × ${multiplier}?`, estimate, [estimate + 1000, Math.max(100, estimate - 1000), factor + multiplier]);
    }

    if (week === 6) {
      const divisor = 4 + index;
      const quotient = 17 + index * 3;
      const remainder = (index + 1) % divisor;
      const dividend = divisor * quotient + remainder;
      if (lesson === 1) return choice(id, lesson, `${dividend} ÷ ${divisor} =`, `${quotient} r ${remainder}`, [`${quotient + 1} r ${remainder}`, `${quotient} r ${remainder + 1}`, `${quotient - 1} r ${remainder}`]);
      if (lesson === 2) {
        const seats = divisor * quotient + 1;
        return typed(id, lesson, `${seats} people travel in cars holding ${divisor}. How many cars are needed?`, quotient + 1);
      }
      return typed(id, lesson, `${divisor * quotient} ÷ ${divisor} =`, quotient);
    }

    if (week === 7) {
      const pairs = [[1, 2, 4, 8], [2, 3, 6, 9], [3, 4, 6, 8], [4, 5, 8, 10], [5, 6, 10, 12]] as const;
      const [a, b, c, d] = pairs[index]!;
      if (lesson === 1) return choice(id, lesson, `Which fraction is equivalent to ${a}/${b}?`, `${c}/${d}`, [`${a}/${d}`, `${c}/${b}`, `${a + 1}/${b + 1}`]);
      if (lesson === 2) return choice(id, lesson, `Which fraction is greater: ${a}/${b} or ${c - 1}/${d}?`, a / b > (c - 1) / d ? `${a}/${b}` : `${c - 1}/${d}`, [a / b > (c - 1) / d ? `${c - 1}/${d}` : `${a}/${b}`, "They are equal"]);
      return choice(id, lesson, `Which value lies halfway between 0 and 1?`, "1/2", ["1/4", "3/2", "2/1"]);
    }

    if (week === 8) {
      const denominator = [6, 8, 10, 12, 14][index]!;
      if (lesson === 1) return typed(id, lesson, `Enter the numerator: 2/${denominator} + 3/${denominator} = ?/${denominator}.`, 5);
      if (lesson === 2) return typed(id, lesson, `Enter the numerator: 1/2 + 1/${denominator} = ?/${denominator}.`, denominator / 2 + 1);
      return typed(id, lesson, `A trail is 1/2 km, then 2/${denominator} km. Enter the numerator of the total in ${denominator}ths.`, denominator / 2 + 2);
    }

    if (week === 9 || week === 10) {
      const sets = [
        ["1/4", "0.25", 25],
        ["1/2", "0.5", 50],
        ["3/4", "0.75", 75],
        ["1/10", "0.1", 10],
        ["1", "1.0", 100],
      ] as const;
      const [fraction, decimal, percent] = sets[index]!;
      if (lesson === 1) return typed(id, lesson, `${fraction} is what percentage? Enter the number only.`, percent);
      if (lesson === 2) return choice(id, lesson, `Which decimal is equal to ${percent}%?`, decimal, [String(Number(decimal) + 0.1), String(Number(decimal) / 10), String(percent)]);
      return choice(id, lesson, `Which pair has the same value?`, `${fraction} and ${percent}%`, [`${fraction} and ${percent / 10}%`, `${decimal} and ${percent / 10}%`, `${percent}% and ${percent}`]);
    }

    if (week === 11) {
      const quantity = 3 + index;
      const price = 14 + index * 6;
      if (lesson === 1) return typed(id, lesson, `${quantity} tickets cost $${price} each. A $12 fee is added. What is the total?`, quantity * price + 12);
      if (lesson === 2) {
        const budget = quantity * price + 30;
        return typed(id, lesson, `A $${budget} budget pays for ${quantity} items at $${price} each. How much remains?`, 30);
      }
      const total = quantity * price;
      const estimate = Math.round(price / 10) * 10 * quantity;
      return choice(id, lesson, `Is $${estimate} a reasonable estimate for ${quantity} × $${price}?`, Math.abs(total - estimate) <= quantity * 5 ? "Yes" : "No", [Math.abs(total - estimate) <= quantity * 5 ? "No" : "Yes", "Cannot be decided"]);
    }

    if (lesson === 1) {
      const sets = [[0.375, 3, 8], [0.625, 5, 8], [0.45, 9, 20], [0.2, 1, 5], [0.75, 3, 4]] as const;
      const [decimal, numerator, denominator] = sets[index]!;
      return choice(id, lesson, `Which fraction is equal to ${decimal}?`, `${numerator}/${denominator}`, [`${numerator}/${denominator + 1}`, `${numerator + 1}/${denominator}`, `${denominator}/${numerator}`]);
    }
    if (lesson === 2) {
      const factor = 125 + index * 25;
      const multiplier = 12 + index;
      return typed(id, lesson, `${factor} × ${multiplier} =`, factor * multiplier);
    }
    const candidate = 132 + index * 9;
    return choice(id, lesson, `Run the divisibility-by-3 test on ${candidate}. What is the result?`, candidate % 3 === 0 ? "Divisible" : "Not divisible", [candidate % 3 === 0 ? "Not divisible" : "Divisible", "The test cannot decide"]);
  });
}

export function buildYear5NumberNexusWeeklyQuiz(week: number): Year5NumberNexusQuizQuestion[] {
  if (!Number.isInteger(week) || week < 1 || week > 12) {
    throw new Error(`Year 5 Number Nexus weekly quiz requires a week from 1 to 12. Received ${week}.`);
  }

  return ([1, 2, 3] as const).flatMap((lesson) =>
    buildLesson(week, lesson).map((question, index) => ({
      ...question,
      descriptorCodes: descriptorFor(week, lesson),
      skillId: `y5-number-w${String(week).padStart(2, "0")}-l${lesson}-${index + 1}`,
    })),
  );
}
