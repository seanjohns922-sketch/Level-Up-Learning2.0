export type Year4NumberNexusQuizQuestion = {
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
type Draft = Omit<Year4NumberNexusQuizQuestion, "descriptorCodes" | "skillId">;

const itemId = (week: number, lesson: Lesson, index: number) =>
  `y4-number-w${String(week).padStart(2, "0")}-l${lesson}-q${index + 1}`;

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
  if (week <= 2) return ["AC9M4N01"];
  if (week === 3) return ["AC9M4N02"];
  if (week === 4) return ["AC9M4N05"];
  if (week === 5 || week === 6) return ["AC9M4N06"];
  if (week === 7) return ["AC9M4N07"];
  if (week === 8) return ["AC9M4N08"];
  if (week === 9) return ["AC9M4N03"];
  if (week === 10) return ["AC9M4N04"];
  if (week === 11) return ["AC9M4N09"];
  if (lesson === 1) return ["AC9M4N03", "AC9M4N04"];
  if (lesson === 2) return ["AC9M4N06", "AC9M4N07", "AC9M4N08"];
  return ["AC9M4N05", "AC9M4N09"];
}

function buildLesson(week: number, lesson: Lesson): Draft[] {
  return Array.from({ length: 5 }, (_, index) => {
    const id = itemId(week, lesson, index);

    if (week === 1) {
      if (lesson === 1) {
        const tenths = [0.3, 0.6, 1.2, 2.7, 4.5][index]!;
        return typed(id, lesson, `Write ${Math.round(tenths * 10)} tenths as a decimal.`, tenths);
      }
      if (lesson === 2) {
        const hundredths = [0.08, 0.24, 0.39, 0.56, 0.72][index]!;
        return typed(id, lesson, `Write ${Math.round(hundredths * 100)} hundredths as a decimal.`, hundredths);
      }
      const values = [1.34, 2.08, 3.62, 4.15, 5.47];
      const value = values[index]!;
      const hundredths = Math.round((value * 100) % 10);
      return choice(id, lesson, `In ${value}, what is the value of the hundredths digit?`, hundredths / 100, [hundredths / 10, hundredths, Math.floor(value)]);
    }

    if (week === 2) {
      const a = Number((1.15 + index * 0.73).toFixed(2));
      const b = Number((a + (index % 2 === 0 ? 0.09 : -0.06)).toFixed(2));
      if (lesson === 1) return choice(id, lesson, `Which symbol makes ${a} ___ ${b} true?`, a < b ? "<" : ">", [a < b ? ">" : "<", "="]);
      if (lesson === 2) {
        const c = Number((a + 0.4).toFixed(2));
        const ordered = [a, b, c].sort((x, y) => x - y).join(", ");
        return choice(id, lesson, "Which list is ordered from least to greatest?", ordered, [[a, c, b].join(", "), [c, b, a].join(", "), [b, c, a].join(", ")]);
      }
      const start = index + 1;
      const answer = Number((start + 0.4).toFixed(1));
      return typed(id, lesson, `A number line runs from ${start} to ${start + 1} in tenths. What value is four intervals after ${start}?`, answer);
    }

    if (week === 3) {
      const a = 24 + index * 7;
      const b = 13 + index * 6;
      if (lesson === 1) return choice(id, lesson, `Is ${a} odd or even?`, a % 2 === 0 ? "Even" : "Odd", [a % 2 === 0 ? "Odd" : "Even", "Both"]);
      if (lesson === 2) return choice(id, lesson, `Without calculating the total, is ${a} + ${b} odd or even?`, (a + b) % 2 === 0 ? "Even" : "Odd", [(a + b) % 2 === 0 ? "Odd" : "Even", "It cannot be known"]);
      return choice(id, lesson, `Without calculating the product, is ${a} × ${b} odd or even?`, (a * b) % 2 === 0 ? "Even" : "Odd", [(a * b) % 2 === 0 ? "Odd" : "Even", "It cannot be known"]);
    }

    if (week === 4) {
      const base = 3 + index * 4;
      const power = [10, 100, 1000][index % 3]!;
      if (lesson === 1) return typed(id, lesson, `${base} × ${power} =`, base * power);
      if (lesson === 2) return typed(id, lesson, `${base * power} ÷ ${power} =`, base);
      const product = base * power;
      return choice(id, lesson, `Which operation changes ${base} to ${product}?`, `× ${power}`, [`÷ ${power}`, `+ ${power}`, `× ${power / 10}`]);
    }

    if (week === 5) {
      const a = 1247 + index * 386;
      const b = 568 + index * 127;
      if (lesson === 1) return typed(id, lesson, lesson === 1 && index % 2 === 0 ? `${a} + ${b} =` : `${a + b + 500} - ${b} =`, index % 2 === 0 ? a + b : a + 500);
      if (lesson === 2) return typed(id, lesson, `${a + 99} + ${b} =`, a + b + 99);
      return choice(id, lesson, `Which is the most efficient first step for ${a} + 99?`, "Add 100, then subtract 1", ["Add 90, then add 90", "Subtract 100", "Count by ones"]);
    }

    if (week === 6) {
      const factorA = 23 + index * 4;
      const factorB = 4 + (index % 5);
      if (lesson === 1) return typed(id, lesson, `${factorA} × ${factorB} =`, factorA * factorB);
      if (lesson === 2) {
        const tensPart = Math.floor(factorA / 10) * 10 * factorB;
        return typed(id, lesson, `${factorA} × ${factorB}: what is the tens partial product?`, tensPart);
      }
      const quotient = 12 + index * 3;
      const divisor = 3 + (index % 4);
      return typed(id, lesson, `${quotient * divisor} ÷ ${divisor} =`, quotient);
    }

    if (week === 7) {
      if (lesson === 1) {
        const value = 146 + index * 237;
        return typed(id, lesson, `Round ${value} to the nearest hundred.`, Math.round(value / 100) * 100);
      }
      if (lesson === 2) {
        const a = 48 + index * 11;
        const b = 19 + index * 8;
        const estimate = Math.round(a / 10) * 10 * Math.round(b / 10) * 10;
        return choice(id, lesson, `Which estimate best checks ${a} × ${b}?`, estimate, [estimate + 500, Math.max(10, estimate - 500), a + b]);
      }
      const cost = 18 + index * 7;
      const quantity = 3 + (index % 3);
      const estimate = Math.round(cost / 10) * 10 * quantity;
      return choice(id, lesson, `${quantity} items cost $${cost} each. Is about $${estimate} a reasonable estimate?`, "Yes", ["No", "Not enough information"]);
    }

    if (week === 8) {
      const price = 12 + index * 4;
      const quantity = 2 + (index % 4);
      if (lesson === 1) {
        const budget = price * quantity + 25;
        return typed(id, lesson, `A $${budget} budget pays for ${quantity} items at $${price} each. How much remains?`, 25);
      }
      if (lesson === 2) return typed(id, lesson, `${quantity} items cost $${price} each. What is the total cost in dollars?`, price * quantity);
      const extra = 15 + index;
      return typed(id, lesson, `${quantity} tickets cost $${price} each. A fee of $${extra} is added. What is the total?`, price * quantity + extra);
    }

    if (week === 9) {
      const bases = [2, 3, 4, 5, 10];
      const denominator = bases[index]!;
      if (lesson === 1) return choice(id, lesson, `Which fraction is equivalent to 1/${denominator}?`, `2/${denominator * 2}`, [`1/${denominator + 1}`, `1/${denominator * 2}`, `3/${denominator * 2}`]);
      if (lesson === 2) {
        const decimalPairs = [[1, 2, 0.5], [1, 4, 0.25], [3, 4, 0.75], [1, 5, 0.2], [7, 10, 0.7]] as const;
        const [numerator, divisor, decimal] = decimalPairs[index]!;
        return typed(id, lesson, `Write ${numerator}/${divisor} as a decimal.`, decimal);
      }
      const numerator = index + 1;
      return choice(id, lesson, `Is ${numerator}/5 equivalent to ${numerator * 2}/10?`, "Yes", ["No", "Only when the numerator is 1"]);
    }

    if (week === 10) {
      const denominators = [2, 3, 4, 5, 8];
      const denominator = denominators[index]!;
      if (lesson === 1) return choice(id, lesson, `Continue: 0, 1/${denominator}, 2/${denominator}, 3/${denominator}, ...`, `4/${denominator}`, [`3/${denominator}`, `5/${denominator}`, `4/${denominator + 1}`]);
      if (lesson === 2) return choice(id, lesson, `Which mixed numeral equals ${denominator + 1}/${denominator}?`, `1 1/${denominator}`, [`2 1/${denominator}`, `1 ${denominator}/1`, `1/${denominator}`]);
      return choice(id, lesson, `Which fraction is halfway between 0 and 1 on a number line?`, "1/2", [`1/${denominator}`, "2/1", "1/4"]);
    }

    if (week === 11) {
      const start = 2 + index;
      if (lesson === 1) {
        const step = 5 + index;
        return typed(id, lesson, `Start at ${start}. Add ${step} three times. What is the fourth output?`, start + step * 3);
      }
      if (lesson === 2) {
        const factor = index % 2 === 0 ? 2 : 3;
        return typed(id, lesson, `Start at ${start}. Multiply by ${factor} three times. What is the fourth output?`, start * factor ** 3);
      }
      const step = 4 + index;
      return choice(id, lesson, `Which instruction generates ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}?`, `Start at ${start}; add ${step} each time.`, [`Start at ${step}; add ${start} each time.`, `Start at ${start}; multiply by ${step}.`, `Start at ${start}; subtract ${step}.`]);
    }

    if (lesson === 1) {
      const pairs = [[1, 2, 0.5], [1, 4, 0.25], [3, 4, 0.75], [2, 5, 0.4], [9, 10, 0.9]] as const;
      const [numerator, denominator, decimal] = pairs[index]!;
      return typed(id, lesson, `Write ${numerator}/${denominator} as a decimal.`, decimal);
    }
    if (lesson === 2) {
      const cost = 24 + index * 6;
      const quantity = 3 + (index % 3);
      return typed(id, lesson, `${quantity} packs cost $${cost} each. A $20 fee is added. What is the total?`, cost * quantity + 20);
    }
    const start = 3 + index;
    const factor = index % 2 === 0 ? 10 : 2;
    return typed(id, lesson, `Start at ${start}. Multiply by ${factor} twice. What is the third output?`, start * factor ** 2);
  });
}

export function buildYear4NumberNexusWeeklyQuiz(week: number): Year4NumberNexusQuizQuestion[] {
  if (!Number.isInteger(week) || week < 1 || week > 12) {
    throw new Error(`Year 4 Number Nexus weekly quiz requires a week from 1 to 12. Received ${week}.`);
  }
  return ([1, 2, 3] as const).flatMap((lesson) =>
    buildLesson(week, lesson).map((question, index) => ({
      ...question,
      descriptorCodes: descriptorFor(week, lesson),
      skillId: `y4-number-w${String(week).padStart(2, "0")}-l${lesson}-${index + 1}`,
    })),
  );
}
