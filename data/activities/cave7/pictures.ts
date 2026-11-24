/**
 * Pictures for Level 7 Pattern Peaks and Chance Hollow questions that are otherwise text only.
 * Built from the prompt's own numbers; an unknown is shown as "?" and never as its value.
 * Rendered by components/lesson/cave7/Cave7Visual.tsx in each realm's own colours.
 */
import type { Cave7Visual } from './shared';

const n = Number;
const table = (title: string, headers: string[], rows: string[][], caption?: string): Cave7Visual => ({ kind: 'table', title, headers, rows, ...(caption ? { caption } : {}) });
/** First rows of a linear story, then the general row with "?". */
const story = (title: string, xLabel: string, yLabel: string, start: number, step: number, letter: string, unit = ''): Cave7Visual =>
  table(title, [xLabel, yLabel], [...[1, 2, 3].map((x) => [String(x), `${unit}${start + step * x}`]), [letter, '?']]);

type Rule = [RegExp, (m: RegExpMatchArray) => Cave7Visual | undefined];
const PATTERN: Rule[] = [
  // Week 1 Lesson 1
  [/^Rides cost \$(\d+) each and entry costs \$(\d+)/, (m) => story('Cost of rides', 'Rides', 'Cost', n(m[2]), n(m[1]), 'n', '$')],
  // Week 2 Lesson 1: function machines and repeated n
  [/^Start with n, multiply by (\d+), then add (\d+)/, (m) => ({ kind: 'machine', title: 'Number machine', input: 'n', steps: [`× ${m[1]}`, `+ ${m[2]}`] })],
  [/^Add (\d+) to n, then multiply the whole result by (\d+)/, (m) => ({ kind: 'machine', title: 'Number machine', input: 'n', steps: [`+ ${m[1]}`, `× ${m[2]}`] })],
  [/^Write an expression for: (\d+) less than (\d+) times a number n/, (m) => ({ kind: 'machine', title: 'Number machine', input: 'n', steps: [`× ${m[2]}`, `− ${m[1]}`] })],
  [/^Think of a number n\. Double it, add (\d+), then multiply the result by (\d+)/, (m) => ({ kind: 'machine', title: 'Number machine', input: 'n', steps: ['× 2', `+ ${m[1]}`, `× ${m[2]}`] })],
  [/Write (n(?: \+ n)+) as a product/, (m) => ({ kind: 'groups', title: 'Equal groups of n', label: 'n', count: m[1].split('+').length })],
  [/baker makes n trays of (\d+) muffins and then gives away (\d+) muffins/, (m) => ({ kind: 'machine', title: 'Muffins', input: 'n trays', steps: [`× ${m[1]} muffins`, `− ${m[2]} given away`] })],
  [/Each of (\d+) teams has n players and (\d+) coaches/, (m) => ({ kind: 'groups', title: 'Teams', label: `n + ${m[2]}`, count: n(m[1]) })],
  // Week 2 Lesson 2: stories as tables
  [/^A trip costs \$(\d+) to book plus \$(\d+) per kilometre/, (m) => story('Trip cost', 'Kilometres', 'Cost', n(m[1]), n(m[2]), 'n', '$')],
  [/water tank holds (\d+) L and loses (\d+) L each hour/, (m) => story('Water in the tank', 'Hours', 'Litres left', n(m[1]), -n(m[2]), 'h')],
  [/gym charges a \$(\d+) joining fee plus \$(\d+) per week/, (m) => story('Gym cost', 'Weeks', 'Cost', n(m[1]), n(m[2]), 'w', '$')],
  // Week 2 Lesson 3 and Week 3: shapes with algebraic sides (the total stays unknown)
  [/rectangle has length n cm and width (\d+) cm/, (m) => ({ kind: 'perimeter', title: 'Rectangle', shape: 'rectangle', sideLabels: ['n cm', `${m[1]} cm`, 'n cm', `${m[1]} cm`], perimeter: null, unit: 'cm' })],
  [/square has sides of \(n \+ (\d+)\) cm/, (m) => ({ kind: 'perimeter', title: 'Square', shape: 'rectangle', sideLabels: Array(4).fill(`(n + ${m[1]}) cm`), perimeter: null, unit: 'cm' })],
  [/isosceles triangle has two equal sides of n cm and a base of (\d+) cm/, (m) => ({ kind: 'perimeter', title: 'Isosceles triangle', shape: 'triangle', sideLabels: ['n cm', 'n cm', `${m[1]} cm`], perimeter: null, unit: 'cm' })],
  [/rectangle has width (\d+) cm and length \(n \+ (\d+)\) cm\. Write an expression for its area/, (m) => ({ kind: 'perimeter', title: 'Rectangle', shape: 'rectangle', sideLabels: [`(n + ${m[2]}) cm`, `${m[1]} cm`, '', ''], perimeter: null, unit: 'cm²', measure: 'area' })],
  // Week 6 Lesson 2: equations from stories
  [/^(\d+) equally priced tickets(?: \(p dollars each\))? and a \$(\d+) booking fee cost \$(\d+)/, (m) => table('Ticket order', ['Item', 'Cost'], [[`${m[1]} tickets`, `${m[1]} × p`], ['Booking fee', `$${m[2]}`], ['Total', `$${m[3]}`]])],
  [/candle is (\d+) cm tall and burns down (\d+) cm each hour\. After how many hours is it (\d+) cm/, (m) => story('Candle height', 'Hours', 'Height (cm)', n(m[1]), -n(m[2]), '?')],
  [/^Sam has \$(\d+) and saves \$(\d+) each week\. After how many weeks will Sam have \$(\d+)/, (m) => story("Sam's savings", 'Weeks', 'Savings', n(m[1]), n(m[2]), '?', '$')],
];

const CHANCE: Rule[] = [
  [/(?:One tile is picked from |For )tiles numbered 1 to (\d+)/, (m) => (n(m[1]) <= 50 ? { kind: 'tiles', title: `Tiles 1 to ${m[1]}`, count: n(m[1]) } : undefined)],
  [/Raffle tickets are numbered 1 to (\d+)/, (m) => (n(m[1]) <= 100 ? { kind: 'tiles', title: `Raffle tickets 1 to ${m[1]}`, count: n(m[1]) } : undefined)],
];

export function cave7PromptVisual(realm: 'pattern' | 'statistics' | 'chance', prompt: string): Cave7Visual | undefined {
  const rules = realm === 'pattern' ? PATTERN : realm === 'chance' ? CHANCE : [];
  for (const [re, make] of rules) { const m = prompt.match(re); if (m) return make(m); }
  return undefined;
}
