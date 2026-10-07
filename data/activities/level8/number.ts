import {
  fraction,
  formula,
  random,
  rounded,
  table,
  type LessonFactory,
  type QuestionDraft,
} from "./shared";
// Each factory targets one lesson; the seed varies its values without changing the skill.
export const numberLessons: LessonFactory[] = [
  (seed) => {
    const r = random(seed),
      n = r(2, 15),
      square = seed % 2 === 0;
    return {
      prompt: `Is √${square ? n * n : n * n + 1} rational or irrational?`,
      answer: square ? "Rational" : "Irrational",
      steps: [
        square
          ? `${n * n} is a perfect square: its square root is ${n}.`
          : `${n * n + 1} lies between ${n * n} and ${(n + 1) ** 2}; it is not a perfect square.`,
        square
          ? "An integer can be written as a fraction."
          : "The square root of a positive integer that is not a perfect square is irrational.",
      ],
    };
  },
  (seed) => {
    const n = random(seed)(2, 14),
      a = n * n + 1;
    return {
      prompt: `√${a} lies between which two consecutive integers? Enter the smaller, then the larger.`,
      answer: `${n}, ${n + 1}`,
      input: "list",
      labels: ["Smaller integer", "Larger integer"],
      steps: [
        `${n}² = ${n * n}.`,
        `${n + 1}² = ${(n + 1) ** 2}.`,
        `So ${n} < √${a} < ${n + 1}.`,
      ],
      visual: table(
        "Neighbouring squares",
        ["Integer", "Square"],
        [
          [n, n * n],
          [n + 1, (n + 1) ** 2],
        ],
      ),
    };
  },
  (seed) => {
    const d = random(seed)(3, 24);
    return {
      prompt: `A circle has diameter ${d} cm. Its exact circumference is kπ cm. What is k?`,
      answer: d,
      steps: [
        "Circumference = π × diameter.",
        `The exact answer is ${d}π cm. A decimal approximation would lose accuracy.`,
      ],
      visual: formula("Circle", `diameter = ${d} cm`),
    };
  },
  (seed) => power(seed, "multiply"),
  (seed) => power(seed, "divide"),
  (seed) => {
    const n = random(seed)(2, 30);
    return {
      prompt: `Calculate ${n}⁰.`,
      answer: 1,
      steps: [
        `${n}³ ÷ ${n}³ = 1.`,
        `Subtracting exponents gives ${n}⁰, so ${n}⁰ = 1.`,
      ],
    };
  },
  (seed) => power(seed, "power"),
  (seed) => power(seed, "combined"),
  (seed) => {
    const n = random(seed)(2, 9),
      negative = seed % 2 === 0;
    return {
      prompt: `Calculate ${negative ? `(−${n})²` : `−${n}²`}.`,
      answer: negative ? n * n : -n * n,
      steps: [
        negative
          ? `The brackets make −${n} the base.`
          : `The power applies to ${n}; the minus sign stays outside.`,
        negative
          ? `(−${n}) × (−${n}) = ${n * n}.`
          : `−(${n} × ${n}) = ${-n * n}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      d = [8, 16, 20, 25, 40, 50, 80, 125][r(0, 7)],
      n = r(1, d - 1);
    return {
      prompt: `Write ${n}/${d} as a decimal.`,
      answer: rounded(n / d, 6),
      steps: [
        `Divide ${n} by ${d}.`,
        `${n}/${d} = ${n / d}; the decimal terminates.`,
      ],
    };
  },
  (seed) => {
    const n = random(seed)(1, 8);
    return {
      prompt: `Write 0.${String(n).repeat(6)}… as a fraction. The digit ${n} repeats forever.`,
      answer: `${n}/9`,
      steps: [
        `Let x = 0.${n}${n}${n}…`,
        `10x − x = ${n}, so 9x = ${n}.`,
        `x = ${n}/9.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      d = [6, 8, 12, 15, 20, 24, 25, 35, 40, 45, 50][r(0, 10)],
      g = d;
    return {
      prompt: `Does 1/${g} have a terminating or recurring decimal?`,
      answer: [8, 20, 25, 40, 50].includes(d) ? "Terminating" : "Recurring",
      steps: [
        "This fraction is already in simplest form.",
        "A denominator with only factors 2 and 5 gives a terminating decimal. Other prime factors give a recurring decimal.",
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(-30, -3),
      b = r(-20, 20),
      subtract = seed % 2 === 0;
    return {
      prompt: `Calculate ${a} ${subtract ? "−" : "+"} (${b}).`,
      answer: subtract ? a - b : a + b,
      steps: [
        subtract ? `Subtracting ${b} means adding ${-b}.` : `Add ${b} to ${a}.`,
        `The result is ${subtract ? a - b : a + b}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(-12, -2),
      b = r(2, 12),
      divide = seed % 2 === 0;
    return {
      prompt: `Calculate ${divide ? a * b : a} ${divide ? "÷" : "×"} ${b}.`,
      answer: divide ? a : a * b,
      steps: [
        "Different signs give a negative result.",
        `Calculate the magnitudes: ${divide ? `${-a * b} ÷ ${b} = ${-a}` : `${-a} × ${b} = ${-a * b}`}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(2, 12),
      b = r(-10, -1),
      c = r(2, 9);
    return {
      prompt: `Calculate ${a} × (${b} + ${c}).`,
      answer: a * (b + c),
      steps: [
        `Brackets first: ${b} + ${c} = ${b + c}.`,
        `Then ${a} × ${b + c} = ${a * (b + c)}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(1, 5),
      b = r(2, 7),
      d = r(2, 6),
      e = r(3, 8),
      minus = seed % 2 === 0;
    return {
      prompt: `Calculate ${a}/${d} ${minus ? "−" : "+"} ${b}/${e}.`,
      answer: fraction(a * e + (minus ? -1 : 1) * b * d, d * e),
      steps: [
        `Use denominator ${d * e}.`,
        `The numerators become ${a * e} and ${b * d}.`,
        `${minus ? "Subtract" : "Add"} the numerators and simplify.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(1, 8),
      b = r(2, 9),
      c = r(1, 7),
      d = r(2, 10),
      div = seed % 2 === 0;
    return {
      prompt: `Calculate ${a}/${b} ${div ? "÷" : "×"} ${c}/${d}.`,
      answer: div ? fraction(a * d, b * c) : fraction(a * c, b * d),
      steps: [
        div
          ? `Multiply by the reciprocal: ${a}/${b} × ${d}/${c}.`
          : "Multiply the numerators and multiply the denominators.",
        "Simplify the fraction.",
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(1, 6),
      d = r(3, 10);
    return {
      prompt: `Calculate ${a}/${d} + ${d - a}/${d} − 1/${d}.`,
      answer: fraction(d - 1, d),
      steps: [
        `The first two fractions total ${d}/${d} = 1.`,
        `Subtract 1/${d}: the result is ${fraction(d - 1, d)}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(-990, -100) / 100,
      b = r(100, 990) / 100;
    return {
      prompt: `Calculate ${a} + ${b}.`,
      answer: rounded(a + b),
      steps: [
        "Align the decimal points.",
        `Subtract the smaller magnitude from the larger; keep the larger magnitude’s sign. Result: ${rounded(a + b)}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(12, 99),
      b = r(2, 9);
    return {
      prompt: `Calculate ${(a * b) / 10} ÷ ${b / 10}.`,
      answer: a,
      steps: [
        `Multiply both numbers by 10: ${a * b} ÷ ${b}.`,
        `The quotient is ${a}.`,
      ],
    };
  },
  (seed) => {
    const n = random(seed)(2, 18) * 4;
    return {
      prompt: `Calculate 0.25 × ${n}.`,
      answer: n / 4,
      steps: ["0.25 = 1/4.", `One quarter of ${n} is ${n / 4}.`],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(20, 90),
      b = r(2, 9);
    return {
      prompt: `Calculate ${a} + ${b} + ${100 - a}.`,
      answer: 100 + b,
      steps: [`Regroup ${a} + ${100 - a} = 100.`, `Then add ${b}: ${100 + b}.`],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(11, 89),
      b = r(11, 89),
      x = a / 10,
      y = b / 10;
    return {
      prompt: `Estimate ${x} × ${y}. Round each number to the nearest whole number first.`,
      answer: Math.round(x) * Math.round(y),
      steps: [
        `${x} rounds to ${Math.round(x)}; ${y} rounds to ${Math.round(y)}.`,
        `Multiply: ${Math.round(x) * Math.round(y)}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(10, 50),
      b = r(2, 9),
      c = r(2, 8);
    return {
      prompt: `Calculate (${a} − ${b}) ÷ ${c}. Give a fraction or exact decimal.`,
      answer: fraction(a - b, c),
      steps: [
        `Subtract inside the brackets: ${a - b}.`,
        `Divide by ${c}: ${fraction(a - b, c)}.`,
      ],
    };
  },
  (seed) => percentage(seed, 1),
  (seed) => percentage(seed, -1),
  (seed) => {
    const r = random(seed),
      a = r(5, 30) * 10,
      p = r(1, 8) * 5,
      b = a * (1 + p / 100);
    return {
      prompt: `A quantity rises from ${a} to ${rounded(b)}. What is the percentage increase?`,
      answer: p,
      unit: "%",
      steps: [
        `Increase: ${rounded(b - a)}.`,
        `Divide by the original ${a}, then multiply by 100: ${p}%.`,
      ],
    };
  },
  (seed) => percentage(seed, seed % 2 ? 1 : -1, true),
  (seed) => {
    const r = random(seed),
      base = r(10, 80) * 10,
      add = seed % 2 === 0;
    return {
      prompt: add
        ? `A price is $${base} before 10% tax. What is the price including tax?`
        : `A price is $${rounded(base * 1.1)} including 10% tax. What was its price before tax?`,
      answer: add ? rounded(base * 1.1) : base,
      unit: "$",
      steps: [
        add
          ? "Multiply the original price by 1.10."
          : "Divide the tax-inclusive price by 1.10.",
        `The result is $${add ? rounded(base * 1.1) : base}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      n = r(10, 50) * 10,
      p = r(1, 5) * 5;
    return {
      prompt: `$${n} rises by ${p}%, then falls by ${p}%. What is the final amount?`,
      answer: rounded(n * (1 + p / 100) * (1 - p / 100)),
      unit: "$",
      steps: [
        `First multiply by ${1 + p / 100}.`,
        `Then multiply the new amount by ${1 - p / 100}.`,
        `The result is $${rounded(n * (1 + p / 100) * (1 - p / 100))}.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      h = r(5, 20),
      rate = r(15, 30),
      cost = r(2, 6) * 10;
    return {
      prompt: `You earn $${rate} an hour for ${h} hours and spend $${cost}. How much remains?`,
      answer: h * rate - cost,
      unit: "$",
      steps: [
        `Income: ${h} × ${rate} = $${h * rate}.`,
        `Subtract spending: $${h * rate - cost}.`,
      ],
      visual: table(
        "Weekly budget",
        ["Item", "Amount"],
        [
          ["Hours", h],
          ["Pay per hour", `$${rate}`],
          ["Spending", `$${cost}`],
        ],
      ),
    };
  },
  (seed) => {
    const income = random(seed)(21, 50) * 1000;
    return {
      prompt: `Use this fictional annual tax rule. What tax is due on $${income}?`,
      answer: (income - 20000) * 0.2,
      unit: "$",
      steps: [
        "The first $20,000 is not taxed.",
        `Tax the remaining $${income - 20000} at 20%: $${(income - 20000) * 0.2}.`,
      ],
      visual: table(
        "Fictional tax schedule",
        ["Income portion", "Rate"],
        [
          ["First $20,000", "0%"],
          ["Above $20,000", "20%"],
        ],
      ),
    };
  },
  (seed) => {
    const r = random(seed),
      n = r(4, 15),
      a = r(3, 8),
      fixed = r(2, 8) * 5;
    return {
      prompt: `Plan A costs $${a} per visit. Plan B costs $${fixed} plus $${a - 2} per visit. How much cheaper is the cheaper plan for ${n} visits?`,
      answer: Math.abs(a * n - (fixed + (a - 2) * n)),
      unit: "$",
      steps: [
        `Plan A: $${a * n}.`,
        `Plan B: $${fixed + (a - 2) * n}.`,
        `Compare costs: difference $${Math.abs(2 * n - fixed)}.`,
      ],
      visual: table(
        "Two plans",
        ["Plan", "Initial cost", "Per visit"],
        [
          ["A", "$0", `$${a}`],
          ["B", `$${fixed}`, `$${a - 2}`],
        ],
      ),
    };
  },
  (seed) => {
    const n = random(seed)(2, 20);
    return {
      prompt: `Round √${n * n + 1} to 2 decimal places.`,
      answer: rounded(Math.sqrt(n * n + 1)),
      steps: [
        `√${n * n + 1} = ${Math.sqrt(n * n + 1).toFixed(5)}…`,
        "Use the third decimal digit to round to two decimal places.",
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      total = r(3, 9),
      n = r(1, 4),
      d = r(5, 10);
    return {
      prompt: `A jug holds ${total} L. You pour out ${n}/${d} L. How many litres remain?`,
      answer: fraction(total * d - n, d),
      unit: "L",
      steps: [
        `Write ${total} as ${total * d}/${d}.`,
        `Subtract ${n}/${d}: ${fraction(total * d - n, d)} L.`,
      ],
    };
  },
  (seed) => percentage(seed, -1, true),
];
function power(
  seed: number,
  mode: "multiply" | "divide" | "power" | "combined",
): QuestionDraft {
  const r = random(seed),
    base = r(2, 9),
    a = r(2, 6),
    b = r(2, 5),
    c = r(1, 3);
  const expression =
    mode === "multiply"
      ? `${base}^${a} × ${base}^${b}`
      : mode === "divide"
        ? `${base}^${a + b} ÷ ${base}^${b}`
        : mode === "power"
          ? `(${base}^${a})^${b}`
          : `${base}^${a} × ${base}^${b} ÷ ${base}^${c}`;
  const n =
    mode === "multiply"
      ? a + b
      : mode === "divide"
        ? a
        : mode === "power"
          ? a * b
          : a + b - c;
  return {
    prompt: `Write ${expression} as ${base}^n. What is n?`,
    answer: n,
    steps: [
      mode === "power"
        ? "Multiply the exponents when raising a power to a power."
        : "For the same base, add exponents when multiplying and subtract when dividing.",
      `n = ${n}.`,
    ],
  };
}
function percentage(
  seed: number,
  direction: 1 | -1,
  money = false,
): QuestionDraft {
  const r = random(seed),
    a = r(5, 60) * 10,
    p = r(1, 9) * 5,
    n = rounded(a * (1 + (direction * p) / 100));
  return {
    prompt: money
      ? `A $${a} price ${direction === 1 ? "increases" : "decreases"} by ${p}%. What is the new price?`
      : `${direction === 1 ? "Increase" : "Decrease"} ${a} by ${p}%.`,
    answer: n,
    unit: money ? "$" : undefined,
    steps: [
      `${p}% of ${a} = ${(a * p) / 100}.`,
      `${direction === 1 ? "Add" : "Subtract"} this change: ${n}.`,
    ],
  };
}
