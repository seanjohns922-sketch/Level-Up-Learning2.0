// Static diagrams for Learn the Skill worked examples. Each one is drawn from the guide's own
// numbers, so the picture always matches the steps. Rendered by components/lesson/GuideVisual.tsx.
export type ShapeName = "circle" | "oval" | "triangle" | "square" | "rectangle" | "pentagon" | "hexagon" | "octagon" | "rhombus" | "kite" | "trapezium" | "parallelogram";
export type GuideVisual =
  | { kind: "thermometer"; min: number; max: number; step: number; value: number; labelEvery?: number }
  | { kind: "clock"; hour: number; minute: number }
  | { kind: "ruler"; length: number; end: number; start?: number; label?: string }
  | { kind: "gauge"; tool: "scale" | "jug"; max: number; step: number; value: number; unit: string }
  | { kind: "angle"; degrees: number; protractor?: boolean; label?: string }
  | { kind: "grid"; min: number; max: number; points?: { x: number; y: number; label?: string }[]; shapes?: { points: [number, number][]; dashed?: boolean; label?: string }[]; mirror?: { axis: "x" | "y"; at: number } }
  | { kind: "gridRef"; cols: number; rows: number; marks: { ref: string; label?: string }[]; path?: string[] }
  | { kind: "shapes"; items: { shape: ShapeName; label?: string; color?: string; scale?: number }[] }
  | { kind: "net"; cells: [number, number][]; labels?: string[]; marked?: number[] }
  | { kind: "spinner"; sectors: string[]; highlight?: string }
  | { kind: "diceGrid"; highlight: [number, number][] }
  | { kind: "blocks"; count: number; object: string; extra?: number }
  | { kind: "areaGrid"; rows: number; cols: number; unit?: string }
  | { kind: "perimeter"; sides: number[]; unit: string; shape?: "rectangle" | "triangle" }
  | { kind: "calendar"; days: number; startDay: number; highlight: number[]; label?: string }
  | { kind: "numberLine"; min: number; max: number; step: number; marks: { value: number; label: string }[]; labelEvery?: number }
  | { kind: "bars"; title: string; categories: string[]; values: number[] }
  | { kind: "dots"; title: string; min: number; max: number; values: number[] };

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const said = (n: number) => (n < 0 ? `negative ${-n}` : String(n));
const timeSaid = (h: number, m: number) => (m === 0 ? `${h} o'clock` : `${h}:${String(m).padStart(2, "0")}`);

/** Narrates only what the diagram shows. */
export function guideVisualSpeech(v: GuideVisual): string {
  switch (v.kind) {
    case "thermometer": return `A thermometer from ${said(v.min)} to ${said(v.max)} degrees Celsius, marked every ${v.step} degrees. The liquid reaches ${said(v.value)} degrees.`;
    case "clock": return `A clock showing ${timeSaid(v.hour, v.minute)}.`;
    case "ruler": return `A ruler in centimetres. ${v.label ?? "The object"} starts at ${v.start ?? 0} and ends at ${v.end}.`;
    case "gauge": return v.tool === "scale" ? `A scale up to ${v.max} ${v.unit}, marked every ${v.step}. The needle points to ${v.value} ${v.unit}.` : `A measuring jug up to ${v.max} ${v.unit}, marked every ${v.step}. The water reaches ${v.value} ${v.unit}.`;
    case "angle": return `${v.protractor ? "A protractor measuring an angle" : "An angle"} of ${v.degrees} degrees${v.label ? `, labelled ${v.label}` : ""}.`;
    case "grid": return `A coordinate grid from ${said(v.min)} to ${said(v.max)}. ${(v.points ?? []).map((p) => `${p.label ?? "A point"} at ${said(p.x)}, ${said(p.y)}`).join(". ")}${v.shapes?.length ? `. ${v.shapes.map((s) => `${s.label ?? (s.dashed ? "The image" : "A shape")} with corners ${s.points.map(([x, y]) => `${said(x)}, ${said(y)}`).join("; ")}`).join(". ")}` : ""}${v.mirror ? `. A mirror line on ${v.mirror.axis} = ${v.mirror.at}` : ""}.`;
    case "gridRef": return `A grid with columns A to ${String.fromCharCode(64 + v.cols)} and rows 1 to ${v.rows}. ${v.marks.map((m) => `${m.label ?? "A mark"} in ${m.ref}`).join(". ")}${v.path ? `. A route through ${v.path.join(", ")}` : ""}.`;
    case "shapes": return `${v.items.length === 1 ? "Shape shown" : "Shapes shown"}: ${v.items.map((s) => (s.label ? `${s.shape}, ${s.label}` : s.shape)).join("; ")}.`;
    case "net": return `A net of ${plural(v.cells.length, "square")}${v.marked?.length ? `, with ${v.marked.map((i) => v.labels?.[i] ?? `square ${i + 1}`).join(" and ")} marked` : ""}.`;
    case "spinner": return `A spinner with ${plural(v.sectors.length, "equal section")}: ${countWords(v.sectors)}.`;
    case "diceGrid": return `A 6 by 6 grid of two-dice pairs, with ${plural(v.highlight.length, "pair")} highlighted.`;
    case "blocks": return `${v.object} measured with blocks: ${plural(v.count, "block")}${v.extra ? ` and ${v.extra} small blocks` : ""}.`;
    case "areaGrid": return `A rectangle made of ${v.rows} rows of ${v.cols} squares.`;
    case "perimeter": return `A ${v.shape ?? "rectangle"} with sides ${v.sides.join(", ")} ${v.unit}.`;
    case "calendar": return `A calendar month with ${v.days} days. ${v.label ?? "Highlighted dates"}: ${v.highlight.join(", ")}.`;
    case "numberLine": return `A number line from ${said(v.min)} to ${said(v.max)}. ${v.marks.map((m) => `${m.label} at ${said(m.value)}`).join(". ")}.`;
    case "bars": return `${v.title}. ${v.categories.map((c, i) => `${c}: ${v.values[i]}`).join(", ")}.`;
    case "dots": return `${v.title}. A dot plot from ${v.min} to ${v.max} with ${plural(v.values.length, "dot")}.`;
  }
}
function countWords(xs: string[]) {
  const c = new Map<string, number>();
  for (const x of xs) c.set(x, (c.get(x) ?? 0) + 1);
  return [...c].map(([k, n]) => `${n} ${k}`).join(", ");
}
