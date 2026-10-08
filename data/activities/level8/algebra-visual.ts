// Level 8 Algebra diagram data. Rendered by components/lesson/level8/AlgebraVisual.tsx.
export type GraphLine = { m: number; c: number; label: string } | { x: number; label: string };
export type Algebra8Visual =
  | {
      kind: "graph";
      title: string;
      xMin: number;
      xMax: number;
      yMin: number;
      yMax: number;
      yStep?: number;
      xLabel?: string;
      yLabel?: string;
      lines: GraphLine[];
      points?: { x: number; y: number; label?: string; guide?: boolean }[];
      /** Shade one side of lines[line]; dashed when the boundary is excluded. */
      shade?: { line: number; side: "above" | "below" | "left" | "right"; strict?: boolean };
    }
  | {
      kind: "inequality";
      title: string;
      min: number;
      max: number;
      from?: { value: number; closed: boolean };
      to?: { value: number; closed: boolean };
    }
  | { kind: "tiles"; title: string; groups: { x: number; units: number }[]; joiner?: "+" | "×" }
  | { kind: "area"; title: string; outer: string; parts: string[]; cells: string[] }
  | { kind: "steps"; title: string; rows: { left: string; right: string; note?: string }[] };

const said = (n: number) => (n < 0 ? `negative ${-n}` : String(n));
const lineSaid = (l: GraphLine) => ("x" in l ? `the vertical line ${l.label}` : `the line ${l.label}`);
const tileSaid = (g: { x: number; units: number }) =>
  [g.x && `${Math.abs(g.x)} ${g.x < 0 ? "negative " : ""}x tile${Math.abs(g.x) === 1 ? "" : "s"}`, g.units && `${Math.abs(g.units)} ${g.units < 0 ? "negative " : ""}unit tile${Math.abs(g.units) === 1 ? "" : "s"}`]
    .filter(Boolean)
    .join(" and ");

/** Narrates only what the diagram shows. */
export function algebra8VisualSpeech(v: Algebra8Visual): string {
  switch (v.kind) {
    case "graph": {
      const pts = v.points?.length ? ` Marked points: ${v.points.map((p) => p.label ?? `(${said(p.x)}, ${said(p.y)})`).join(", ")}.` : "";
      const shade = v.shade ? ` The region ${v.shade.side} ${lineSaid(v.lines[v.shade.line])} is shaded${v.shade.strict ? ", and the boundary is dashed" : ""}.` : "";
      return `${v.title}. Axes from x ${said(v.xMin)} to ${said(v.xMax)} and y ${said(v.yMin)} to ${said(v.yMax)}. Shows ${v.lines.map(lineSaid).join(" and ")}.${pts}${shade}`;
    }
    case "inequality": {
      const end = (e: { value: number; closed: boolean }) => `${e.closed ? "a closed dot" : "an open circle"} at ${said(e.value)}`;
      if (v.from && v.to) return `${v.title}. A number line shaded from ${end(v.from)} to ${end(v.to)}.`;
      if (v.from) return `${v.title}. A number line with ${end(v.from)} and an arrow shaded to the right.`;
      return `${v.title}. A number line with ${end(v.to!)} and an arrow shaded to the left.`;
    }
    case "tiles":
      return `${v.title}. ${v.groups.map(tileSaid).join(v.joiner === "×" ? ", repeated in groups: " : ", plus ")}.`;
    case "area":
      return `${v.title}. A rectangle with side ${v.outer} along the left and ${v.parts.join(" and ")} along the top. Parts inside: ${v.cells.map((c) => (c === "?" ? "unknown" : c)).join(", ")}.`;
    case "steps":
      return `${v.title}. ${v.rows.map((r, i) => `Line ${i + 1}: ${r.left} equals ${r.right}${r.note ? `, ${r.note}` : ""}.`).join(" ")}`;
  }
}
