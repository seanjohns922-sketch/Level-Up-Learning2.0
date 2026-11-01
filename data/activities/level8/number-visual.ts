// Level 8 Number diagram data. Rendered by components/lesson/level8/NumberVisual.tsx.
export type Number8Visual =
  | {kind:"tally";title:string;groups:number;singles:number}
  | {kind:"lengths";title:string;object:"timber"|"fence"|"pipe";lengths:number[];labels:string[];caption:string}
  | { kind: "numberline"; title: string; min: number; max: number; step: number; labelTicks?: boolean; interval?: [number, number]; points: { value: number; label: string; colour?: string }[] }
  | { kind: "squares"; title: string; squares: { area: number; label: string; sideLabel?: string; highlight?: boolean }[] }
  | { kind: "factors"; title: string; groups: { base: string; count: number; operator?: string }[] }
  | { kind: "division"; title: string; numerator: number; denominator: number; places: number }
  | { kind: "percentbar"; title: string; base: number; hideBase?: boolean; percent: number; direction: 1 | -1; unit?: string; caption: string };

const said = (n: number) => (n < 0 ? `negative ${-n}` : String(n));

/** Narrates only what the diagram shows. */
export function number8VisualSpeech(v: Number8Visual): string {
  switch (v.kind) {
    case "tally": return `${v.title}. ${v.groups} crossed groups of five marks, followed by ${v.singles} single marks.`;
    case "lengths": return `${v.title}. Labels from left to right: ${v.labels.join(", ")}. ${v.caption}`;
    case "numberline":
      return `${v.title}. A number line from ${said(v.min)} to ${said(v.max)}${v.labelTicks === false ? "" : `, marked every ${v.step}`}. ${v.points.map((p) => `Point ${p.label}`).join(", ")} ${v.points.length === 1 ? "is" : "are"} marked.${v.interval ? ` The section from ${said(v.interval[0])} to ${said(v.interval[1])} is shaded.` : ""}`;
    case "squares":
      return `${v.title}. ${v.squares.map((s) => `A square labelled ${s.label.replace("cm²", "square centimetres")}${s.sideLabel?`, side labelled ${s.sideLabel}`:""}`).join(". ")}.`;
    case "factors":
      return `${v.title}. ${v.groups.map((g) => `${g.operator === "÷" ? "divided by " : g.operator === "×" ? "times " : ""}${g.count} factor${g.count === 1 ? "" : "s"} of ${g.base}`).join(", ")}.`;
    case "division": {
      let remainder=v.numerator%v.denominator;
      const rows=Array.from({length:v.places},(_,i)=>{const value=remainder*10,digit=Math.floor(value/v.denominator);remainder=value%v.denominator;return `Step ${i+1}: ${value} divided by ${v.denominator} gives ${digit}, remainder ${remainder}; digit ${digit}.`;});
      return `${v.title}. A division table for ${v.numerator} divided by ${v.denominator}. ${rows.join(' ')} When a remainder repeats, the digits repeat.`;
    }
    case "percentbar":
      return `${v.title}. A bar shows 100 percent as ${v.hideBase?"an unknown amount":v.unit === "$" ? `${v.base} dollars` : `${v.base}${v.unit ? ` ${v.unit}` : ""}`}. A ${v.percent} percent ${v.direction > 0 ? "increase is added to the end" : "decrease is marked off the end"}. ${v.caption}`;
  }
}
