import {
  fraction,
  formula,
  random,
  table,
  type LessonFactory,
  type QuestionDraft,
} from "./shared";
const expression = (
  prompt: string,
  answer: string,
  steps: string[],
): QuestionDraft => ({ prompt, answer, steps, input: "expression" });
const equation = (a: number, b: number, x: number): QuestionDraft => ({
  prompt: `Solve ${a}x + ${b} = ${a * x + b}.`,
  answer: x,
  steps: [
    `Subtract ${b} from both sides: ${a}x = ${a * x}.`,
    `Divide both sides by ${a}: x = ${x}.`,
  ],
  visual: {
    kind: "balance",
    title: "Keep both sides equal",
    left: `${a}x + ${b}`,
    right: String(a * x + b),
  },
});
export const patternLessons: LessonFactory[] = [
  (seed) => {
    const r = random(seed),
      a = r(2, 12),
      b = r(1, 20);
    return expression(
      `A club charges $${b} to join and $${a} per visit. Write the cost for x visits.`,
      `${a}x+${b}`,
      [`The visits cost ${a}x dollars.`, `Add the one-off cost: ${a}x + ${b}.`],
    );
  },
  (seed) => {
    const r = random(seed),
      a = r(-12, 12),
      b = r(2, 15);
    return expression(`Simplify ${a}x + ${b}x.`, `${a + b}x`, [
      `Add the coefficients: ${a} + ${b} = ${a + b}.`,
      `Keep x: ${a + b}x.`,
    ]);
  },
  (seed) => {
    const r = random(seed),
      a = r(2, 12),
      b = r(2, 9);
    return expression(
      `Simplify ${a}x + ${b} + ${b}x − 2.`,
      `${a + b}x+${b - 2}`,
      [`Group x terms: ${a + b}x.`, `Group constants: ${b - 2}.`],
    );
  },
  (seed) => expand(seed, 1, false),
  (seed) => expand(seed, -1, false),
  (seed) => expand(seed, 1, true),
  (seed) => {
    const r = random(seed),
      a = r(2, 9),
      b = r(2, 8);
    return {
      prompt: `What is the greatest whole-number factor common to ${a}x and ${a * b}?`,
      answer: a,
      steps: [
        `The coefficient of x is ${a}.`,
        `It divides both ${a} and ${a * b}, so the greatest common factor is ${a}.`,
      ],
    };
  },
  (seed) => factor(seed),
  (seed) => {
    const r = random(seed),
      a = r(2, 9),
      b = r(2, 10);
    return expression(
      `Expand ${a}(x + ${b}) to check the factorisation.`,
      `${a}x+${a * b}`,
      [`Multiply both terms inside by ${a}.`, `${a}x + ${a * b}.`],
    );
  },
  (seed) => {
    const r = random(seed);
    return equation(r(2, 9), r(1, 15), r(-9, 12));
  },
  (seed) => {
    const r = random(seed),
      a = r(2, 9),
      b = r(1, 12),
      total = r(1, 20);
    return {
      prompt: `Solve ${a}x + ${b} = ${total}.`,
      answer: fraction(total - b, a),
      steps: [
        `Subtract ${b}: ${a}x = ${total - b}.`,
        `Divide by ${a}: x = ${fraction(total - b, a)}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(2, 9),
      b = r(1, 12),
      x = r(-6, 10);
    return {
      prompt: `For ${a}x + ${b} = ${a * x + b}, substitute x = ${x}. What is the left-hand side?`,
      answer: a * x + b,
      steps: [
        `Replace x with ${x}: ${a} × (${x}) + ${b}.`,
        `The result is ${a * x + b}, matching the right side.`,
      ],
    };
  },
  (seed) => bothSides(seed, false),
  (seed) => bothSides(seed, true),
  (seed) => {
    const r = random(seed),
      a = r(2, 9),
      b = r(2, 12),
      x = r(2, 12);
    return {
      prompt: `${a}x + ${b} = ${a * x + b}. A student adds ${b} first. What should the right side be after correctly undoing +${b}?`,
      answer: a * x,
      steps: [
        `Undo addition by subtraction on both sides.`,
        `${a * x + b} − ${b} = ${a * x}.`,
      ],
    };
  },
  (seed) => {
    const n = random(seed)(-9, 15),
      strict = seed % 2 === 0;
    return {
      prompt: `What is the smallest integer satisfying x ${strict ? ">" : "≥"} ${n}?`,
      answer: strict ? n + 1 : n,
      steps: [
        strict ? "The endpoint is excluded." : "The endpoint is included.",
        `The smallest permitted integer is ${strict ? n + 1 : n}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(2, 8),
      b = r(1, 12),
      x = r(2, 15);
    return {
      prompt: `Solve ${a}x + ${b} ≤ ${a * x + b}. Enter the greatest allowed value of x.`,
      answer: x,
      steps: [
        `Subtract ${b}, then divide by positive ${a}.`,
        `The sign stays the same: x ≤ ${x}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      n = r(-10, 10),
      x = n + r(-3, 3);
    return {
      prompt: `Does x = ${x} satisfy x < ${n}? Type yes or no.`,
      answer: x < n ? "Yes" : "No",
      steps: [
        `Compare ${x} with ${n}.`,
        x < n
          ? `${x} is less than ${n}.`
          : `${x} is not less than ${n}; the endpoint is excluded.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      m = r(2, 8),
      b = r(1, 10);
    return {
      prompt: "What is the change in y each time x increases by 1?",
      answer: m,
      steps: [
        `Subtract consecutive outputs: ${b + m} − ${b} = ${m}.`,
        "The constant first difference is the rate.",
      ],
      visual: table(
        "Input/output",
        ["x", "y"],
        [0, 1, 2, 3].map((x) => [x, m * x + b]),
      ),
    };
  },
  (seed) => line(seed, "point"),
  (seed) => {
    const n = random(seed)(-10, 10);
    return {
      prompt: `Every point on a horizontal line has y = ${n}. What is y when x = 20?`,
      answer: n,
      steps: [
        "A horizontal line keeps the same y-coordinate.",
        `Therefore y = ${n}.`,
      ],
      visual: formula("Horizontal relation", `y = ${n}`),
    };
  },
  (seed) => line(seed, "intercept"),
  (seed) => line(seed, "rate"),
  (seed) => {
    const r = random(seed),
      m = r(2, 9),
      b = r(1, 12),
      x = r(2, 10);
    return {
      prompt: `Test y = ${m}x + ${b}. What is y when x increases from ${x} to ${x + 1}?`,
      answer: m * (x + 1) + b,
      steps: [
        `At x = ${x}, y = ${m * x + b}.`,
        `Increasing x by 1 increases y by ${m}, giving ${m * (x + 1) + b}.`,
      ],
      visual: {
        kind: "plot",
        title: "Recorded trials",
        xLabel: "x",
        yLabel: "y",
        points: [0, 1, 2].map((x) => [x, m * x + b] as [number, number]),
        connect: true,
      },
    };
  },
  (seed) => {
    const r = random(seed),
      m = r(2, 7),
      b = r(1, 8),
      x = r(2, 8);
    return {
      prompt: `On y = ${m}x + ${b}, find x when y = ${m * x + b}.`,
      answer: x,
      steps: [
        `Solve ${m}x + ${b} = ${m * x + b}.`,
        `Subtract ${b}, then divide by ${m}.`,
      ],
      visual: {
        kind: "plot",
        title: "Linear graph",
        xLabel: "x",
        yLabel: "y",
        points: [0, x, x + 2].map((x) => [x, m * x + b] as [number, number]),
        connect: true,
      },
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(3, 9),
      b = r(1, 2),
      x = r(2, 9);
    return {
      prompt: `At what x do y = ${a}x and y = ${b}x + ${(a - b) * x} meet?`,
      answer: x,
      steps: [
        `Set outputs equal: ${a}x = ${b}x + ${(a - b) * x}.`,
        `Subtract ${b}x and divide by ${a - b}: x = ${x}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      m = r(2, 8),
      b = r(1, 8),
      x = r(1, 8),
      y = m * x + b + r(-3, 3);
    return {
      prompt: `Is (${x}, ${y}) above the line y = ${m}x + ${b}? Type yes or no.`,
      answer: y > m * x + b ? "Yes" : "No",
      steps: [
        `On the line at x = ${x}, y = ${m * x + b}.`,
        `Compare the point's y-value ${y} with ${m * x + b}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(2, 12),
      b = r(10, 50);
    return expression(
      `A tank starts with ${b} L and gains ${a} L/min. Write the volume after x minutes.`,
      `${a}x+${b}`,
      [`New water: ${a}x litres.`, `Add the starting volume: ${a}x + ${b}.`],
    );
  },
  (seed) => {
    const r = random(seed),
      a = r(2, 12),
      b = r(10, 50),
      x = r(2, 10);
    return {
      prompt: `A tank's volume is V = ${a}x + ${b}. Find V after ${x} minutes.`,
      answer: a * x + b,
      unit: "L",
      steps: [`Substitute x = ${x}.`, `${a} × ${x} + ${b} = ${a * x + b} L.`],
    };
  },
  (seed) => {
    const r = random(seed),
      rate = r(2, 8),
      time = r(4, 15);
    return {
      prompt: `A tank contains ${rate * time} L and drains at ${rate} L/min. After how many minutes must V = ${rate * time} − ${rate}x stop predicting a positive volume?`,
      answer: time,
      unit: "min",
      steps: [
        "Set V = 0 for an empty tank.",
        `${rate * time} ÷ ${rate} = ${time} minutes. Negative water volumes are not practical.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(5, 12),
      b = r(1, 4),
      x = r(2, 12);
    return {
      prompt: `Plan A: $${a} per visit. Plan B: $${(a - b) * x} plus $${b} per visit. After how many visits do they cost the same?`,
      answer: x,
      steps: [
        `${a}x = ${(a - b) * x} + ${b}x.`,
        `Subtract ${b}x and divide by ${a - b}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(2, 10),
      b = r(5, 20),
      x = r(3, 15);
    return {
      prompt: `Hire costs $${b} plus $${a} per hour. With $${a * x + b}, what is the maximum number of hours?`,
      answer: x,
      unit: "h",
      steps: [
        `Remove the initial fee: ${a * x + b} − ${b} = ${a * x}.`,
        `Divide by ${a} dollars per hour: ${x} hours.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      rate = r(2, 12),
      hours = r(2, 10);
    return {
      prompt: `A worker earns $${rate} per hour. A model predicts $${rate * hours} for ${hours} hours. What rate does it assume stays constant?`,
      answer: rate,
      unit: "$/h",
      steps: [
        `Divide pay by hours: ${rate * hours} ÷ ${hours} = ${rate}.`,
        "The model assumes the same hourly pay for every hour.",
      ],
    };
  },
  (seed) => bothSides(seed, true),
  (seed) => line(seed, "point"),
  (seed) => line(seed, "rate"),
];
function expand(seed: number, sign: number, extra: boolean): QuestionDraft {
  const r = random(seed),
    a = sign * r(2, 9),
    b = r(2, 12),
    c = extra ? r(2, 8) : 0;
  return expression(
    `Expand and simplify ${a}(x + ${b})${extra ? ` + ${c}x` : ""}.`,
    `${a + c}x+${a * b}`,
    [
      `Multiply each bracketed term by ${a}: ${a}x + (${a * b}).`,
      extra
        ? `Collect the x terms: ${a + c}x + (${a * b}).`
        : "Both terms inside the bracket must be multiplied.",
    ],
  );
}
function factor(seed: number): QuestionDraft {
  const r = random(seed),
    a = r(2, 10),
    b = r(2, 12);
  return {
    prompt: `Factorise ${a}x + ${a * b} as a(x + b). Enter a, then b.`,
    answer: `${a}, ${b}`,
    input: "list",
    labels: ["Factor a", "Constant b"],
    steps: [
      `Both terms share factor ${a}.`,
      `Divide both terms by ${a}: ${a}(x + ${b}).`,
    ],
  };
}
function bothSides(seed: number, brackets: boolean): QuestionDraft {
  const r = random(seed),
    a = r(3, 9),
    c = r(1, 2),
    b = r(1, 9),
    x = r(2, 12),
    total = (a - c) * x + (brackets ? a * b : b);
  return {
    prompt: `Solve ${brackets ? `${a}(x + ${b})` : `${a}x + ${b}`} = ${c}x + ${total}.`,
    answer: x,
    steps: [
      brackets
        ? `Expand: ${a}x + ${a * b} = ${c}x + ${total}.`
        : `Subtract ${c}x from both sides.`,
      `Collect terms: ${a - c}x = ${(a - c) * x}.`,
      `Divide by ${a - c}: x = ${x}.`,
    ],
  };
}
function line(
  seed: number,
  mode: "point" | "intercept" | "rate",
): QuestionDraft {
  const r = random(seed),
    m = r(1, 9),
    b = r(1, 15),
    x = r(2, 12);
  return {
    prompt:
      mode === "point"
        ? `For y = ${m}x + ${b}, find y when x = ${x}.`
        : mode === "intercept"
          ? `For y = ${m}x + ${b}, what is y at x = 0?`
          : `For y = ${m}x + ${b}, how much does y increase when x increases by 1?`,
    answer: mode === "point" ? m * x + b : mode === "intercept" ? b : m,
    steps: [
      mode === "point"
        ? `Substitute x: ${m} × ${x} + ${b} = ${m * x + b}.`
        : mode === "intercept"
          ? `At x = 0, the ${m}x term is zero; y = ${b}.`
          : `The coefficient ${m} is the change in y for each increase of 1 in x.`,
    ],
    visual: table(
      "Linear relation",
      ["x", "y"],
      [0, 1, 2].map((x) => [x, m * x + b]),
    ),
  };
}
