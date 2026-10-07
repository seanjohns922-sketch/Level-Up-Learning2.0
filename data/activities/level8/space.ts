import {
  triangle8,
  type Polygon8,
} from "@/data/assessments/revisions/level8StarpathFiveForms";
import { random, type LessonFactory, type QuestionDraft } from "./shared";
const rectangle = (w: number, h: number, caption: string): Polygon8 => ({
  points: [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ],
  sideLabels: [String(w), String(h), String(w), String(h)],
  caption,
});
export const spaceLessons: LessonFactory[] = [
  (seed) => pair(seed, "length"),
  (seed) => pair(seed, "congruent"),
  (seed) => pair(seed, "overlay"),
  (seed) => pair(seed, "sss"),
  (seed) => {
    const n = random(seed)(30, 100);
    return {
      prompt: `Two triangles each have sides 5 cm and 8 cm with ${n}° between those sides. Which congruence test applies?`,
      answer: "SAS",
      steps: [
        "Two corresponding sides and their included angle match.",
        "This is side–angle–side (SAS).",
      ],
    };
  },
  (seed) => {
    const k = random(seed)(1, 8);
    return {
      prompt: `Two right triangles have hypotenuse ${5 * k} cm and one shorter side ${3 * k} cm. Which congruence test applies?`,
      answer: "RHS",
      steps: [
        "The right angle, hypotenuse and a corresponding shorter side match.",
        "This is RHS congruence.",
      ],
      spaceVisual: {
        polygons: [
          triangle8([3 * k, 4 * k, 5 * k], "Right triangle A"),
          triangle8([3 * k, 4 * k, 5 * k], "Right triangle B"),
        ],
      },
    };
  },
  (seed) => pair(seed, "similar"),
  (seed) => pair(seed, "scale"),
  (seed) => pair(seed, "missing"),
  (seed) => {
    const r = random(seed),
      a = r(30, 70),
      b = r(30, 70);
    return {
      prompt: `Both triangles have angles ${a}° and ${b}°. Are they necessarily similar? Type yes or no.`,
      answer: "Yes",
      steps: [
        "Two corresponding angles match.",
        "Their third angles also match, so AA similarity applies.",
      ],
    };
  },
  (seed) => pair(seed, "distinguish"),
  (seed) => {
    const r = random(seed),
      n = r(3, 15);
    return {
      prompt: `A ${n} cm segment is reflected. How long is its image?`,
      answer: n,
      unit: "cm",
      steps: [
        "Reflection preserves all lengths.",
        `The reflected segment is ${n} cm long.`,
      ],
    };
  },
  (seed) => {
    const n = random(seed)(3, 15);
    return {
      prompt: `A rhombus has one side ${n} cm long. What is its perimeter?`,
      answer: n * 4,
      unit: "cm",
      steps: [
        "All four sides of a rhombus are equal.",
        `4 × ${n} = ${4 * n} cm.`,
      ],
    };
  },
  (seed) => {
    const n = random(seed)(3, 20);
    return {
      prompt: `A rectangle’s diagonals meet at O. One vertex is ${n} cm from O. How long is a complete diagonal?`,
      answer: 2 * n,
      unit: "cm",
      steps: [
        "Rectangle diagonals are equal and bisect one another.",
        `A full diagonal is twice a half: ${2 * n} cm.`,
      ],
      spaceVisual: {
        polygons: [
          {
            ...rectangle(8, 5, "Rectangle ABCD; diagonals meet at O."),
            diagonals: true,
            centreLabel: "O",
          },
        ],
      },
    };
  },
  (seed) => {
    const n = random(seed)(3, 20);
    return {
      prompt: `A quadrilateral has four equal ${n} cm sides and four right angles. Name its most specific type.`,
      answer: "Square",
      steps: [
        "Four equal sides make it a rhombus.",
        "Four right angles also make it a rectangle. Together these define a square.",
      ],
      spaceVisual: {
        polygons: [rectangle(n, n, "All corners are right angles.")],
      },
    };
  },
  (seed) => {
    const k = random(seed)(2, 12);
    return {
      prompt: `A diagonal splits a parallelogram into two congruent triangles. One has area ${k * 5} cm². What is the parallelogram’s area?`,
      answer: k * 10,
      unit: "cm²",
      steps: [
        "Congruent triangles have equal areas.",
        `Add two copies: ${k * 5} × 2 = ${k * 10}.`,
      ],
    };
  },
  (seed) => {
    const n = random(seed)(40, 130);
    return {
      prompt: `One interior angle of a parallelogram is ${n}°. Find an adjacent angle.`,
      answer: 180 - n,
      unit: "°",
      steps: [
        "Adjacent angles in a parallelogram sum to 180°.",
        `180 − ${n} = ${180 - n}°.`,
      ],
    };
  },
  (seed) => {
    const r = random(seed),
      w = r(6, 15),
      h = r(2, 5);
    return {
      prompt: `This ${w} by ${h} rectangle has equal diagonals. Does that prove it is a square? Type yes or no.`,
      answer: "No",
      steps: [
        "A non-square rectangle also has equal diagonals.",
        `Its adjacent sides ${w} and ${h} are unequal; this is a counterexample.`,
      ],
      spaceVisual: {
        polygons: [
          { ...rectangle(w, h, "Non-square rectangle"), diagonals: true },
        ],
      },
    };
  },
  (seed) => point(seed, "read"),
  (seed) => point(seed, "coordinate"),
  (seed) => point(seed, "rotate"),
  (seed) => {
    const r = random(seed),
      x = r(0, 2),
      y = r(0, 2),
      z = r(0, 2);
    return {
      prompt: `Start at (${x}, ${y}, ${z}). Move +2 in x, +1 in y and +1 in z. Give the final coordinates in x, y, z order.`,
      answer: `${x + 2}, ${y + 1}, ${z + 1}`,
      input: "list",
      labels: ["x", "y", "z"],
      steps: [
        "Add each movement to its matching coordinate.",
        `Final point: (${x + 2}, ${y + 1}, ${z + 1}).`,
      ],
      spaceVisual: {
        space: {
          point: { x, y, z },
          caption: "Start point P; each grid interval is 1.",
        },
      },
    };
  },
  (seed) => {
    const r = random(seed),
      x = r(1, 4),
      y = r(1, 4),
      z = r(1, 3);
    return {
      prompt: `Point A is (${x}, ${y}, ${z}). Point B is directly above A at height 4. Give B in x, y, z order.`,
      answer: `${x}, ${y}, 4`,
      input: "list",
      labels: ["x", "y", "z"],
      steps: [
        "Directly above means x and y stay the same.",
        "Change only z to 4.",
      ],
      spaceVisual: {
        space: {
          point: { x, y, z },
          caption: "A vertical column keeps the same x and y.",
        },
      },
    };
  },
  (seed) => {
    const r = random(seed),
      x = r(1, 4),
      y = r(1, 4),
      z = r(1, 4);
    return {
      prompt: `A drone is ${x} units east, ${y} units north and ${z} units above the origin. East is x, north is y, up is z. Give its coordinates.`,
      answer: `${x}, ${y}, ${z}`,
      input: "list",
      labels: ["x", "y", "z"],
      steps: [
        "Write x, then y, then z.",
        `The position is (${x}, ${y}, ${z}).`,
      ],
    };
  },
  (seed) => pair(seed, "algorithm"),
  (seed) => {
    const n = random(seed)(2, 8);
    return {
      prompt: `An algorithm says “same angles ⇒ congruent”. Triangles have sides 3, 4, 5 and ${3 * n}, ${4 * n}, ${5 * n}. What should it return: congruent or similar?`,
      answer: "Similar",
      steps: [
        `The scale factor is ${n}, not 1.`,
        "Matching angles prove similarity, not necessarily congruence.",
      ],
      spaceVisual: {
        polygons: [
          triangle8([3, 4, 5], "A"),
          triangle8([3 * n, 4 * n, 5 * n], "B"),
        ],
      },
    };
  },
  (seed) => {
    const k = random(seed)(2, 9);
    return {
      prompt: `A sorting rule first checks matching side ratios. Which scale factor should its next test require for congruence: 1 or ${k}?`,
      answer: 1,
      steps: [
        "Similar figures are congruent when their sizes also match.",
        "That requires scale factor 1.",
      ],
    };
  },
  (seed) => pair(seed, "scale"),
  (seed) => point(seed, "read"),
  (seed) => pair(seed, "algorithm"),
];
function pair(seed: number, mode: string): QuestionDraft {
  const r = random(seed),
    a = r(3, 9),
    b = a + 1,
    c = a + 2,
    k =
      mode === "congruent" ||
      mode === "overlay" ||
      mode === "sss" ||
      mode === "length"
        ? 1
        : r(2, 5),
    polygons = [
      triangle8([a, b, c], "Triangle A"),
      triangle8([a * k, b * k, c * k], "Triangle B"),
    ];
  const common = { spaceVisual: { polygons } };
  if (mode === "length")
    return {
      ...common,
      prompt: `Triangle B is congruent to A. Which length corresponds to the ${b} cm side?`,
      answer: b,
      unit: "cm",
      steps: [
        "Corresponding sides of congruent triangles have equal lengths.",
        `The matching side is ${b} cm.`,
      ],
    };
  if (mode === "missing")
    return {
      spaceVisual: {
        polygons: [
          polygons[0],
          { ...polygons[1], sideLabels: [String(a * k), String(b * k), "x"] },
        ],
      },
      prompt:
        "The triangles are similar. Find side x in triangle B. All lengths are in centimetres.",
      answer: c * k,
      unit: "cm",
      steps: [
        `Scale factor: ${a * k} ÷ ${a} = ${k}.`,
        `Multiply the matching side: ${c} × ${k} = ${c * k} cm.`,
      ],
    };
  if (mode === "scale")
    return {
      ...common,
      prompt: "What is the scale factor from triangle A to triangle B?",
      answer: k,
      steps: [
        `Divide matching lengths: ${a * k} ÷ ${a} = ${k}.`,
        "Check that the same factor works for every side.",
      ],
    };
  if (mode === "sss")
    return {
      ...common,
      prompt:
        "Which congruence test is established by the three matching side lengths?",
      answer: "SSS",
      steps: [
        "All three corresponding side lengths are equal.",
        "This is side–side–side congruence.",
      ],
    };
  return {
    ...common,
    prompt:
      mode === "overlay"
        ? "Will these triangles overlap exactly after moving or turning one? Type yes or no."
        : mode === "algorithm"
          ? `Use this rule: matching ratios → similar; ratio 1 → congruent. Classify this pair as congruent or similar.`
          : "Classify this pair as congruent or similar.",
    answer: mode === "overlay" ? "Yes" : k === 1 ? "Congruent" : "Similar",
    steps: [
      `All corresponding sides have ratio ${k}.`,
      k === 1
        ? "Their shape and size match."
        : "Their shape matches but their sizes differ.",
    ],
  };
}
function point(seed: number, mode: string): QuestionDraft {
  const r = random(seed),
    x = r(0, 4),
    y = r(0, 4),
    z = r(1, 4);
  return {
    prompt:
      mode === "rotate"
        ? "Rotate the view. What is the point’s height?"
        : mode === "coordinate"
          ? "Give P’s coordinates in x, y, z order."
          : "Read P’s coordinates in x, y, z order.",
    answer: mode === "rotate" ? z : `${x}, ${y}, ${z}`,
    input: mode === "rotate" ? "number" : "list",
    labels: ["x", "y", "z"],
    steps:
      mode === "rotate"
        ? ["Turning the view does not move P.", `Its height stays ${z}.`]
        : [`Follow the projection lines: x = ${x}, y = ${y}, z = ${z}.`],
    spaceVisual: {
      space: {
        point: { x, y, z },
        caption: "Each axis runs from 0 to 4. Read x, then y, then height z.",
        readCoordinates: true,
      },
    },
  };
}
