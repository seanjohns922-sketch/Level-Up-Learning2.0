import {
  random,
  rounded,
  table,
  type LessonFactory,
  type QuestionDraft,
} from "./shared";
import type { Measurement8Visual } from "@/data/assessments/revisions/year8MeasurementFiveForms";
const diagram = (
  task: Measurement8Visual["task"],
  values: number[],
  extra: Partial<Measurement8Visual> = {},
): Measurement8Visual => ({
  type: "measurement_year8_panel",
  task,
  values,
  description: "Use the labelled dimensions. Diagram not to scale.",
  unit: "cm",
  ...extra,
});
const answer = (
  prompt: string,
  value: number,
  unit: string,
  steps: string[],
  measurementVisual?: Measurement8Visual,
): QuestionDraft => ({
  prompt,
  answer: rounded(value),
  unit,
  steps,
  measurementVisual,
});
export const measurementLessons: LessonFactory[] = [
  (seed) => {
    const r = random(seed),
      w = r(12, 24),
      cut = r(3, 8);
    return answer(
      `The full width is ${w} m and the notch is ${cut} m wide. How long is the remaining top edge?`,
      w - cut,
      "m",
      [`Subtract the notch width: ${w} − ${cut} = ${w - cut}.`],
      diagram("composite", [w, 12, cut, 4]),
    );
  },
  (seed) => composite(seed, false),
  (seed) => composite(seed, true),
  (seed) => grid(seed, 1),
  (seed) => grid(seed, 0.25),
  (seed) => {
    const r = random(seed),
      w = r(8, 20),
      h = r(5, 12);
    return answer(
      `A rectangular garden is ${w} m by ${h} m. How much fencing encloses it?`,
      2 * (w + h),
      "m",
      [
        "Fencing measures the boundary, so use perimeter.",
        `2 × (${w} + ${h}) = ${2 * (w + h)} m.`,
      ],
    );
  },
  (seed) => {
    const n = random(seed)(2, 30) * 250;
    return answer(`Convert ${n} cm³ to litres.`, n / 1000, "L", [
      "1000 cm³ = 1 litre.",
      `${n} ÷ 1000 = ${n / 1000} L.`,
    ]);
  },
  (seed) => prism(seed, false),
  (seed) => prism(seed, true),
  (seed) => {
    const r = random(seed),
      a = r(3, 12),
      b = r(3, 9),
      h = r(4, 15);
    return answer(
      `A prism has cross-sectional area ${a * b} cm² and volume ${a * b * h} cm³. Find its length.`,
      h,
      "cm",
      [
        `Length = volume ÷ cross-sectional area.`,
        `${a * b * h} ÷ ${a * b} = ${h}.`,
      ],
    );
  },
  (seed) => {
    const r = random(seed),
      a = r(2, 6),
      b = r(2, 5),
      c = r(2, 4);
    return answer(
      "How many 10 cm cubes fit in this box? Keep their edges parallel to the box.",
      a * b * c,
      "cubes",
      [
        `${a} cubes fit along the length, ${b} along the width and ${c} along the height.`,
        `Multiply: ${a} × ${b} × ${c} = ${a * b * c}.`,
      ],
      diagram("packing", [a * 10, b * 10, c * 10, 10, 10, 10]),
    );
  },
  (seed) => {
    const r = random(seed),
      rate = r(2, 12),
      time = r(3, 20);
    return answer(
      `An empty ${rate * time} L tank fills at ${rate} L/min. How many minutes does it take?`,
      time,
      "min",
      [
        `Time = capacity ÷ rate.`,
        `${rate * time} ÷ ${rate} = ${time} minutes.`,
      ],
      diagram("rate", [rate * time, rate], {
        labels: [`Capacity: ${rate * time} L`, `Rate: ${rate} L/min`],
      }),
    );
  },
  (seed) => {
    const r = random(seed)(3, 18);
    return answer(
      "Find the diameter.",
      2 * r,
      "cm",
      [`Diameter is twice the radius: 2 × ${r} = ${2 * r}.`],
      diagram("circle", [r], { variant: "radius" }),
    );
  },
  (seed) => circle(seed, "circumference"),
  (seed) => circle(seed, "area"),
  (seed) => {
    const r = random(seed)(2, 18),
      a = rounded(3.14 * r * r);
    return answer(
      `A circle has area ${a} cm². Use π = 3.14. Find its radius.`,
      r,
      "cm",
      [
        `Radius squared = ${a} ÷ 3.14 = ${r * r}.`,
        `Take the positive square root: ${r} cm.`,
      ],
    );
  },
  (seed) => {
    const r = random(seed)(3, 15);
    return answer(
      "Find the complete perimeter of this semicircle. Use π = 3.14.",
      3.14 * r + 2 * r,
      "cm",
      [
        `Curved edge = πr = ${rounded(3.14 * r)} cm.`,
        `Add the diameter ${2 * r} cm.`,
      ],
      diagram("circle", [2 * r], { variant: "semicircle" }),
    );
  },
  (seed) => {
    const r = random(seed),
      outer = r(8, 16),
      inner = r(2, 6);
    return answer(
      "Find the area of the ring. Use π = 3.14.",
      3.14 * (outer * outer - inner * inner),
      "m²",
      [
        `Outer area: 3.14 × ${outer}².`,
        `Subtract inner area: 3.14 × ${inner}².`,
        `Ring area = ${rounded(3.14 * (outer * outer - inner * inner))} m².`,
      ],
      diagram("circle", [outer, inner], { variant: "ring" }),
    );
  },
  (seed) => {
    const k = random(seed)(1, 8);
    return answer(
      "What is the length of the hypotenuse?",
      5 * k,
      "cm",
      [
        "The hypotenuse is opposite the right angle.",
        "It is the longest side.",
      ],
      diagram("rightTriangle", [3 * k, 4 * k, 5 * k], { unknown: "height" }),
    );
  },
  (seed) => {
    const k = random(seed)(1, 8);
    return answer(
      `A right triangle has shorter sides ${3 * k} cm and ${4 * k} cm. What is the area of the square on its hypotenuse?`,
      25 * k * k,
      "cm²",
      [`Add the two smaller squares: ${3 * k}² + ${4 * k}² = ${25 * k * k}.`],
      diagram("rightTriangle", [3 * k, 4 * k, 5 * k], {
        unknown: "hypotenuse",
      }),
    );
  },
  (seed) => triangle(seed, false),
  (seed) => triangle(seed, true),
  (seed) => {
    const k = random(seed)(1, 5);
    return answer(
      `A ladder reaches ${4 * k} m up a wall; its foot is ${3 * k} m from the wall. How long is it?`,
      5 * k,
      "m",
      [
        `Ladder² = ${3 * k}² + ${4 * k}² = ${25 * k * k}.`,
        `Take the square root: ${5 * k} m.`,
      ],
      diagram("rightTriangle", [3 * k, 4 * k, 5 * k], {
        unknown: "hypotenuse",
        unit: "m",
        variant: "ladder",
      }),
    );
  },
  (seed) => {
    const r = random(seed),
      k = r(1, 8),
      valid = seed % 2 === 0,
      c = 5 * k + (valid ? 0 : 1);
    return {
      prompt: `Can ${3 * k}, ${4 * k} and ${c} be the sides of a right triangle? Type yes or no.`,
      answer: valid ? "Yes" : "No",
      steps: [
        `Compare ${3 * k}² + ${4 * k}² = ${25 * k * k} with ${c}² = ${c * c}.`,
        valid
          ? "They match, so these form a right triangle."
          : "They differ, so these do not form a right triangle.",
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      a = r(-8, 5),
      b = a + r(1, 6),
      time = r(5, 15);
    return answer(
      `It is ${time}:00 in zone A (UTC${a >= 0 ? "+" : ""}${a}). What hour is it in zone B (UTC${b >= 0 ? "+" : ""}${b})? Use 24-hour time; enter the hour only.`,
      time + b - a,
      "h",
      [
        `Zone B is ${b - a} hours ahead.`,
        `Add ${b - a} hours: ${time + b - a}:00.`,
      ],
    );
  },
  (seed) => {
    const r = random(seed),
      depart = r(4, 10),
      duration = r(2, 6),
      offset = r(1, 5),
      arrive = depart + duration + offset;
    return answer(
      `Depart at ${depart}:00 in A. Arrive at ${arrive}:00 in B, ${offset} hours ahead. Same date. How long was the flight?`,
      duration,
      "h",
      [
        `Convert arrival to A time: ${arrive - offset}:00.`,
        `Subtract departure: ${duration} hours.`,
      ],
    );
  },
  (seed) => {
    const r = random(seed),
      hour = r(18, 23),
      offset = r(3, 8),
      total = hour + offset;
    return answer(
      `At Monday ${hour}:00 in A, B is ${offset} hours ahead. How many hours after midnight is it in B?`,
      total % 24,
      "h",
      [
        `Add the offset: ${hour} + ${offset} = ${total}.`,
        total >= 24
          ? `Subtract 24: Tuesday ${total % 24}:00.`
          : `It is still Monday, ${total}:00.`,
      ],
    );
  },
  (seed) => {
    const r = random(seed),
      n = r(3, 15),
      t = r(2, 8);
    return answer(
      `A tap supplies ${n * t} L in ${t} minutes. What is its flow rate?`,
      n,
      "L/min",
      [`Divide volume by time: ${n * t} ÷ ${t} = ${n} L/min.`],
    );
  },
  (seed) => {
    const r = random(seed),
      speed = r(4, 12) * 10,
      time = r(2, 6);
    return answer(
      `Travel at ${speed} km/h for ${time} hours. How far do you travel?`,
      speed * time,
      "km",
      [`Distance = speed × time.`, `${speed} × ${time} = ${speed * time} km.`],
    );
  },
  (seed) => {
    const r = random(seed),
      fuel = r(4, 12),
      distance = r(2, 8) * 100;
    return answer(
      `A vehicle uses ${(fuel * distance) / 100} L over ${distance} km. What is its consumption in L per 100 km?`,
      fuel,
      "L/100 km",
      [
        `Divide by ${distance / 100}, the number of 100 km blocks.`,
        `Consumption = ${fuel} L/100 km.`,
      ],
    );
  },
  (seed) => {
    const r = random(seed),
      scale = r(2, 8) * 10000,
      length = r(2, 12);
    return answer(
      `A map uses scale 1:${scale}. A route is ${length} cm on the map. What is its real length in km?`,
      (scale * length) / 100000,
      "km",
      [
        `Real centimetres: ${length} × ${scale}.`,
        "Divide by 100,000 to convert cm to km.",
      ],
      diagram("model", [scale, length], {
        variant: "map",
        labels: [`Scale 1:${scale}`, `Map route ${length} cm`],
      }),
    );
  },
  (seed) => {
    const r = random(seed),
      a = r(1, 5),
      b = r(2, 7),
      k = r(2, 8);
    return answer(
      `Mix A and B in ratio ${a}:${b}. You use ${a * k} L of A. How much B is needed?`,
      b * k,
      "L",
      [`Scale factor: ${a * k} ÷ ${a} = ${k}.`, `B: ${b} × ${k} = ${b * k} L.`],
    );
  },
  (seed) => {
    const r = random(seed),
      rate = r(2, 8),
      target = r(10, 50);
    return answer(
      `One tile covers ${rate} m². How many whole tiles cover at least ${target} m²? Ignore cutting waste.`,
      Math.ceil(target / rate),
      "tiles",
      [
        `Divide: ${target} ÷ ${rate} = ${rounded(target / rate)}.`,
        `Round up to ${Math.ceil(target / rate)} whole tiles so coverage is sufficient.`,
      ],
    );
  },
  (seed) => composite(seed, true),
  (seed) => {
    const r = random(seed),
      speed = r(3, 10) * 10,
      time = r(2, 8) * 15;
    return answer(
      `Travel for ${time} minutes at ${speed} km/h. How far do you travel?`,
      (speed * time) / 60,
      "km",
      [
        `Convert time: ${time}/60 hours.`,
        `Distance = ${speed} × ${time}/60 = ${(speed * time) / 60} km.`,
      ],
    );
  },
  (seed) => triangle(seed, true),
];
function composite(seed: number, area: boolean): QuestionDraft {
  const r = random(seed),
    w = r(12, 24),
    h = r(9, 16),
    a = r(3, 7),
    b = r(2, 6);
  return answer(
    area
      ? "Find the area of this L-shaped garden."
      : "Find its perimeter; include every outside edge.",
    area ? w * h - a * b : 2 * (w + h),
    area ? "m²" : "m",
    area
      ? [
          `Start with ${w} × ${h} = ${w * h}.`,
          `Remove the missing rectangle ${a} × ${b} = ${a * b}.`,
        ]
      : [
          "The horizontal edges total twice the full width.",
          "The vertical edges total twice the full height.",
          `Perimeter = 2 × (${w} + ${h}) = ${2 * (w + h)}.`,
        ],
    diagram("composite", [w, h, a, b]),
  );
}
function grid(seed: number, cell: number): QuestionDraft {
  const r = random(seed),
    full = r(15, 40),
    partial = r(4, 16) * 2;
  return {
    prompt: `An outline covers ${full} full grid squares and ${partial} partial squares. Count each partial square as half. Each square is ${cell} m². Estimate the area.`,
    answer: (full + partial / 2) * cell,
    unit: "m²",
    steps: [
      `Equivalent full squares: ${full} + ${partial} ÷ 2 = ${full + partial / 2}.`,
      `Multiply by ${cell} m² per square.`,
    ],
    visual: table(
      "Grid count",
      ["Squares", "Count", "Area each"],
      [
        ["Full", full, `${cell} m²`],
        ["Partial", partial, `estimate ${cell / 2} m²`],
      ],
    ),
  };
}
function prism(seed: number, litres: boolean): QuestionDraft {
  const r = random(seed),
    a = r(2, 8) * 10,
    b = r(2, 6) * 10,
    c = r(2, 8) * 10;
  return answer(
    litres
      ? "Find the capacity of this rectangular tank in litres."
      : "Find the volume of this rectangular prism.",
    (a * b * c) / (litres ? 1000 : 1),
    litres ? "L" : "cm³",
    [
      `Volume = ${a} × ${b} × ${c} = ${a * b * c} cm³.`,
      litres
        ? "Divide by 1000 to find litres."
        : "Write the volume in cubic centimetres.",
    ],
    diagram("prism", [a, b, c]),
  );
}
function circle(seed: number, mode: "area" | "circumference"): QuestionDraft {
  const r = random(seed)(2, 20),
    n = mode === "area" ? 3.14 * r * r : 2 * 3.14 * r;
  return answer(
    `Find the ${mode}. Use π = 3.14.`,
    n,
    mode === "area" ? "cm²" : "cm",
    [
      mode === "area"
        ? `Area = πr² = 3.14 × ${r}².`
        : `Circumference = 2πr = 2 × 3.14 × ${r}.`,
    ],
    diagram("circle", [r], { variant: "radius" }),
  );
}
function triangle(seed: number, short: boolean): QuestionDraft {
  const k = random(seed)(1, 9);
  return answer(
    short ? "Find the missing shorter side." : "Find the hypotenuse.",
    (short ? 4 : 5) * k,
    "cm",
    short
      ? [
          `Missing side² = ${5 * k}² − ${3 * k}² = ${16 * k * k}.`,
          `Take its square root: ${4 * k} cm.`,
        ]
      : [
          `Hypotenuse² = ${3 * k}² + ${4 * k}² = ${25 * k * k}.`,
          `Take its square root: ${5 * k} cm.`,
        ],
    diagram("rightTriangle", [3 * k, 4 * k, 5 * k], {
      unknown: short ? "height" : "hypotenuse",
    }),
  );
}
