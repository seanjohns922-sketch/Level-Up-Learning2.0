/**
 * Diagrams for Level 7 Measurement questions that state their measurements only in words.
 * Built from the prompt's own numbers; an unknown is shown as "?" and never drawn as a value.
 */
import type { Measurement7Visual } from '@/data/assessments/revisions/year7MeasurementFiveForms';

const NOTE = 'Use the labelled measurements. Diagrams are not for measuring by eye.';
const v = (task: Measurement7Visual['task'], values: number[], extra: Partial<Measurement7Visual> = {}): Measurement7Visual =>
  ({ type: 'measurement_year7_panel', task, values, description: NOTE, ...extra });
const n = Number;

type Rule = [RegExp, (m: RegExpMatchArray) => Measurement7Visual | undefined];
const RULES: Rule[] = [
  // Triangles and parallelograms
  [/triang\w*(?: garden bed| panel| sail)? (?:with|has) base (\d+) (m|cm) and perpendicular height (\d+) \2\b/, (m) => v('triangle', [n(m[1]), n(m[3])], { unit: m[2] })],
  [/triangle has base (\d+) (m|cm), perpendicular height (\d+) \2 and sloping side/, (m) => v('triangle', [n(m[1]), n(m[3])], { unit: m[2] })],
  [/triang\w*(?: sail)? has area (\d+) (m|cm)² and base (\d+) \2\b/, (m) => v('triangle', [n(m[3]), (2 * n(m[1])) / n(m[3])], { unit: m[2], unknown: 'height' })],
  [/parallelogram(?: garden)? has area (\d+) (m|cm)² and base (\d+) \2\b/, (m) => v('parallelogram', [n(m[3]), n(m[1]) / n(m[3])], { unit: m[2], unknown: 'height' })],
  [/parallelogram has base (\d+) (m|cm), sloping side \d+ \2 and perpendicular height (\d+) \2/, (m) => v('parallelogram', [n(m[1]), n(m[3])], { unit: m[2] })],
  [/Two separate triangular sails have bases (\d+) m and (\d+) m and perpendicular height (\d+) m/, (m) => v('pairTriangles', [n(m[1]), n(m[3]), n(m[2]), n(m[3])], { unit: 'm' })],
  // Prisms
  [/^A (\d+) cm by (\d+) cm by (\d+) cm box/, (m) => v('rectPrism', [n(m[1]), n(m[2]), n(m[3])], { unit: 'cm' })],
  [/rectangular tank is (\d+) cm by (\d+) cm by (\d+) cm/, (m) => v('rectPrism', [n(m[1]), n(m[2]), n(m[3])], { unit: 'cm', water: true })],
  [/triangular prism has end base (\d+) cm, perpendicular end height (\d+) cm and length (\d+) cm/, (m) => v('triPrism', [n(m[1]), n(m[2]), n(m[3])], { unit: 'cm' })],
  // Circles and wheels
  [/circle with diameter (\d+) cm has radius/, (m) => v('circle', [n(m[1])], { unit: 'cm', circleMeasure: 'diameter' })],
  [/wheel (?:of |has )radius (\d+) cm/, (m) => v('circle', [n(m[1])], { unit: 'cm', circleMeasure: 'radius', wheel: true })],
  [/wheel (?:of |has )diameter (\d+) cm/, (m) => v('circle', [n(m[1])], { unit: 'cm', circleMeasure: 'diameter', wheel: true })],
  [/circle has diameter (\d+) cm\. Which expression gives its exact circumference/, (m) => v('circle', [n(m[1])], { unit: 'cm', circleMeasure: 'diameter' })],
  // Parallel shelves (the question says the shelves are parallel)
  [/Two shelves are parallel\. A brace makes an angle of (\d+)° with the top shelf\. What is the co-interior angle/, (m) => v('parallel', [n(m[1])], { relation: 'cointerior', angleLabels: [`${m[1]}°`, 'x'], description: 'A diagonal brace crosses two parallel shelves. The matching arrows mark the parallel shelves.', rails: true })],
  // Angles in triangles and quadrilaterals
  [/triangle has interior angles of (\d+)° and (\d+)°\. Which calculation finds the third/, (m) => v('triangleAngles', [n(m[1]), n(m[2])])],
  [/isosceles triangle has apex angle (\d+)°/, (m) => { const apex = n(m[1]), base = (180 - apex) / 2; return v('triangleAngles', [base, base, apex], { labels: ['isosceles'] }); }],
  [/quadrilateral has interior angles of (\d+)°, (\d+)° and (\d+)°/, (m) => v('quadAngles', [n(m[1]), n(m[2]), n(m[3])])],
  [/quadrilateral has angles of (\d+)°, (\d+)°, (\d+)° and x°/, (m) => v('quadAngles', [n(m[1]), n(m[2]), n(m[3])])],
  // Polygons split into triangles from one vertex
  [/simple polygon has (\d+) sides\. What is its interior angle sum/, (m) => (n(m[1]) <= 12 ? v('polygonSplit', [n(m[1])], { description: 'Diagonals from one corner split the polygon into triangles.' }) : undefined)],
  [/(\d+)-sided convex polygon is split into triangles from one vertex/, (m) => (n(m[1]) <= 12 ? v('polygonSplit', [n(m[1])], { description: 'Diagonals from one corner split the polygon into triangles.' }) : undefined)],
  // Drink and paint recipes
  [/Concentrate : water = (\d+) : (\d+)\. You want (\d+) mL of drink/, (m) => v('ratio', [], { labels: [`Concentrate : water = ${m[1]} : ${m[2]}`, `Drink wanted: ${m[3]} mL`] })],
  [/recipe uses concentrate : water = (\d+) : (\d+)/, (m) => v('ratio', [], { labels: [`Concentrate : water = ${m[1]} : ${m[2]}`] })],
  [/Blue : yellow paint = (\d+) : (\d+)\. You have (\d+) mL of yellow/, (m) => v('ratio', [], { labels: [`Blue : yellow = ${m[1]} : ${m[2]}`, `Yellow: ${m[3]} mL`] })],
  [/Blue : yellow = (\d+) : (\d+), with (\d+) mL blue and (\d+) mL yellow/, (m) => v('ratio', [], { labels: [`Blue : yellow = ${m[1]} : ${m[2]}`, `Blue: ${m[3]} mL`, `Yellow: ${m[4]} mL`] })],
  [/Blue : yellow = (\d+) : (\d+)\. You have (\d+) mL of blue/, (m) => v('ratio', [], { labels: [`Blue : yellow = ${m[1]} : ${m[2]}`, `Blue: ${m[3]} mL`] })],
  [/(\d+) : (\d+) concentrate-to-water drink contains (\d+) mL concentrate and (\d+) mL water\. Someone adds (\d+) mL (concentrate|water)/, (m) => v('ratio', [], { labels: [`Concentrate : water = ${m[1]} : ${m[2]}`, `Concentrate: ${m[3]} mL`, `Water: ${m[4]} mL`, `Added: ${m[5]} mL ${m[6]}`] })],
];

export function measurement7PromptVisual(prompt: string): Measurement7Visual | undefined {
  for (const [re, make] of RULES) { const m = prompt.match(re); if (m) return make(m); }
  return undefined;
}
