// Level 8 Probability diagram data. Rendered by components/lesson/level8/ChanceVisual.tsx.
export type VennRegion = "a" | "both" | "b" | "neither";
export type Chance8Visual =
  | {kind:"branchTree";title:string;stages:{label:string;outcomes:string[]}[];withoutReplacement?:boolean}
  /** Equal sectors, drawn in order clockwise from the pointer. */
  | { kind: "spinner"; title: string; sectors: { label: string; color: string }[] }
  | { kind: "bag"; title: string; groups: { label: string; color: string; count: number }[] }
  /** A 0–1 bar split into an event and its complement. */
  | { kind: "bar"; title: string; event: string; p: number; pText: string; notText: string; hideNot?: boolean }
  /** Equally likely two-stage tree; pairs are listed at the end of each path. */
  | { kind: "tree"; title: string; firstLabel: string; secondLabel: string; first: string[]; second: string[]; highlight?: string[] }
  | { kind: "venn"; title: string; labels: [string, string]; counts: [number | string, number | string, number | string, number | string]; shade?: VennRegion[] }
  /** Outcome array for two events. Cells show the pair, sum, difference or product. */
  | {
      kind: "grid";
      title: string;
      rowLabel: string;
      colLabel: string;
      rows: string[];
      cols: string[];
      cell: "pair" | "sum" | "difference" | "product";
      highlight?: [number, number][];
      crossed?: [number, number][];
      hidden?: boolean;
    };

export function gridCell(v: Extract<Chance8Visual, { kind: "grid" }>, r: number, c: number): string {
  const a = v.rows[r], b = v.cols[c], x = Number(a), y = Number(b);
  if (v.cell === "pair") return `${a}, ${b}`;
  if (v.cell === "sum") return String(x + y);
  if (v.cell === "difference") return String(Math.abs(x - y));
  return String(x * y);
}
const regionNames = (labels: [string, string]): Record<VennRegion, string> => ({
  a: `${labels[0]} only`,
  both: `both ${labels[0]} and ${labels[1]}`,
  b: `${labels[1]} only`,
  neither: "neither",
});

/** Narrates only what the diagram shows. */
export function chance8VisualSpeech(v: Chance8Visual): string {
  switch (v.kind) {
    case "branchTree": return `${v.title}. ${v.stages.map(s=>`${s.label}: ${s.outcomes.join(", ")}`).join(". ")}. ${v.withoutReplacement?"A previously selected outcome is omitted from the next stage.":"Every branch continues to each outcome of the next stage."}`;
    case "spinner": {
      const counts = new Map<string, number>();
      for (const s of v.sectors) counts.set(s.label, (counts.get(s.label) ?? 0) + 1);
      return `${v.title}. A spinner with ${v.sectors.length} equal sections: ${[...counts].map(([l, n]) => `${n} ${l}`).join(", ")}.`;
    }
    case "bag":
      return `${v.title}. ${v.groups.map((g) => `${g.count} ${g.label}`).join(", ")}.`;
    case "bar":
      return `${v.title}. A bar from 0 to 1. ${v.event}: ${v.pText}.${v.hideNot ? " The rest of the bar is not labelled." : ` Not ${v.event}: ${v.notText}.`}`;
    case "tree":
      return `${v.title}. ${v.firstLabel}: ${v.first.join(", ")}. Each splits into ${v.secondLabel}: ${v.second.join(", ")}.${v.highlight?.length ? ` Highlighted paths: ${v.highlight.join("; ")}.` : ""}`;
    case "venn": {
      const names = regionNames(v.labels);
      const order: VennRegion[] = ["a", "both", "b", "neither"];
      return `${v.title}. ${order.map((r, i) => `${names[r]}: ${v.counts[i]}`).join(". ")}.${v.shade?.length ? ` Shaded: ${v.shade.map((r) => names[r]).join(", ")}.` : ""}`;
    }
    case "grid": {
      const marked=(cells:[number,number][]|undefined)=>cells?.map(([r,c])=>`row ${v.rows[r]}, column ${v.cols[c]}`).join("; ");
      return `${v.title}. Rows: ${v.rowLabel} ${v.rows.join(", ")}. Columns: ${v.colLabel} ${v.cols.join(", ")}. ${v.hidden?"Cells are blank.":v.rows.map((r,i)=>`Row ${r}: ${v.cols.map((_,j)=>v.crossed?.some(([a,b])=>a===i&&b===j)?"crossed out":gridCell(v,i,j)).join("; ")}.`).join(" ")}${v.crossed?.length?` Crossed cells: ${marked(v.crossed)}.`:""}${v.highlight?.length?` Highlighted cells: ${marked(v.highlight)}.`:""}`;
    }
  }
}
