import { ArrowUp, ArrowRight, ArrowDown, Check, RotateCw, Star, Triangle } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { getL4Figure, figureSvg, type CompositeFigure } from "@/data/activities/starpath/level4/composite-figures";
import { getL4Object } from "@/data/activities/starpath/level4/composite-objects";

// The eight Level 4 teaching layouts — one per week. Each shows two concept
// cards that actually illustrate the lesson family, replacing the old map cards.
export type L4TeachVariant =
  | "l4Composite"
  | "l4Solids"
  | "l4Model"
  | "l4GridRef"
  | "l4GridRoute"
  | "l4LineSym"
  | "l4RotSym"
  | "l4Integrate";

export const L4_TEACH_HEADING: Record<L4TeachVariant, string> = {
  l4Composite: "Shapes make bigger shapes",
  l4Solids: "Solids make objects",
  l4Model: "Modelling the real thing",
  l4GridRef: "Naming a place with a grid",
  l4GridRoute: "Routes across a grid",
  l4LineSym: "Line symmetry",
  l4RotSym: "Turning symmetry",
  l4Integrate: "Put every skill together",
};

function Card({ readAloud, title, tip, children }: { readAloud: string; title: string; tip: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
      <OptionReadAloudButton text={readAloud} className="absolute right-2 top-2" />
      <div className="flex flex-1 items-center justify-center">{children}</div>
      <div className="mt-2 text-base font-black text-indigo-950">{title}</div>
      <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">{tip}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}

// A composite figure/object drawn from its parts. `built` controls which parts
// are solid vs. glowing socket, so we can show a finished form or one mid-build.
function FigureArt({ figure, built }: { figure: CompositeFigure; built: (index: number) => boolean }) {
  const placed = (id: string) => built(figure.parts.findIndex((part) => part.id === id));
  return (
    <span
      className="flex h-28 w-28 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: figureSvg(figure, placed) }}
    />
  );
}

// A small dark-console grid with lettered columns and numbered rows — the shared
// visual language of the Level 4 grid, symmetry and route stages.
function MiniGrid({
  cols,
  rows,
  children,
}: {
  cols: string[];
  rows: string[];
  children: (r: number, c: number) => React.ReactNode;
}) {
  return (
    <div
      className="grid gap-1 rounded-xl border border-cyan-300/30 bg-slate-950 p-2 shadow-[0_10px_26px_-14px_rgba(8,145,178,0.5)]"
      style={{ gridTemplateColumns: `1rem repeat(${cols.length}, 1.6rem)` }}
    >
      <span />
      {cols.map((label) => (
        <span key={`c${label}`} className="flex items-center justify-center text-[10px] font-black text-cyan-200">{label}</span>
      ))}
      {rows.map((rowLabel, r) => (
        <span key={`row${rowLabel}`} className="contents">
          <span className="flex items-center justify-center text-[10px] font-black text-cyan-200">{rowLabel}</span>
          {cols.map((_, c) => (
            <span key={`cell${r}-${c}`} className="relative flex aspect-square items-center justify-center rounded-[5px] border border-white/10 bg-white/[0.03]">
              {children(r, c)}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}

export default function L4TeachGrid({ variant }: { variant: L4TeachVariant }) {
  if (variant === "l4Composite") {
    return (
      <Grid>
        <Card readAloud="A picture is made of simple shapes joined together. This rocket is a triangle, a rectangle and circles." title="Small shapes, big picture" tip="A composite shape is simple shapes joined together.">
          <FigureArt figure={getL4Figure(1)} built={() => true} />
        </Card>
        <Card readAloud="Choose shapes and place them to cover the whole outline. The glowing sockets show where a shape still needs to go." title="Build to fill the outline" tip="Place shapes until the whole outline is covered.">
          <FigureArt figure={getL4Figure(1)} built={(index) => index === 0} />
        </Card>
      </Grid>
    );
  }
  if (variant === "l4Solids") {
    return (
      <Grid>
        <Card readAloud="Objects are built from solids. Boxes, cylinders and cones join together to make equipment." title="Objects are built from solids" tip="Boxes, cylinders and cones join to make an object.">
          <FigureArt figure={getL4Object(0)} built={() => true} />
        </Card>
        <Card readAloud="Add one solid at a time, and keep every raised part supported by the solids underneath it." title="Build it, keep it standing" tip="Add solids in order and support every raised part.">
          <FigureArt figure={getL4Object(0)} built={(index) => index < 2} />
        </Card>
      </Grid>
    );
  }
  if (variant === "l4Model") {
    return (
      <Grid>
        <Card readAloud="A good model keeps the parts that tell you what it is, and drops the extra detail." title="Keep the parts that matter" tip="A model keeps the shape that tells you what it is.">
          <FigureArt figure={getL4Figure(0)} built={() => true} />
        </Card>
        <Card readAloud="A model can be simple. Ask: could someone still tell what it is from just a few shapes?" title="Simple can still say it" tip="A few shapes can still tell you what it is.">
          <FigureArt figure={getL4Figure(3)} built={() => true} />
        </Card>
      </Grid>
    );
  }
  if (variant === "l4GridRef") {
    return (
      <Grid>
        <Card readAloud="A grid reference names one cell. Read the column letter first, then the row number. B2 means column B and row 2." title="A reference names one cell" tip="Column letter first, then row number: this is B2.">
          <MiniGrid cols={["A", "B", "C"]} rows={["1", "2", "3"]}>
            {(r, c) => (r === 1 && c === 1 ? <span className="absolute inset-[18%] rounded bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]" /> : null)}
          </MiniGrid>
        </Card>
        <Card readAloud="Use a reference to find a place, or give the reference for a place you can see." title="Find it by its reference" tip="Landmarks sit in exact cells — like the star at C1.">
          <MiniGrid cols={["A", "B", "C"]} rows={["1", "2", "3"]}>
            {(r, c) => (r === 0 && c === 2 ? <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> : null)}
          </MiniGrid>
        </Card>
      </Grid>
    );
  }
  if (variant === "l4GridRoute") {
    const path: Record<string, "up" | "right"> = { "2:0": "right", "2:1": "right", "1:2": "up" };
    const move = (dir: "up" | "right") => (dir === "up" ? <ArrowUp className="h-3.5 w-3.5 text-cyan-200" strokeWidth={3} /> : <ArrowRight className="h-3.5 w-3.5 text-cyan-200" strokeWidth={3} />);
    return (
      <Grid>
        <Card readAloud="A route links cell to cell. Each move goes one cell. Follow them from the start reference to the goal." title="A route links cell to cell" tip="Each move goes one cell, from the start to the goal.">
          <MiniGrid cols={["A", "B", "C"]} rows={["1", "2", "3"]}>
            {(r, c) => {
              if (r === 2 && c === 0) return <Triangle className="h-3 w-3 fill-rose-300 text-rose-300" />;
              if (r === 0 && c === 2) return <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />;
              const dir = path[`${r}:${c}`];
              return dir ? move(dir) : null;
            }}
          </MiniGrid>
        </Card>
        <Card readAloud="Run your path on a clean grid. If it misses the goal, find the first move that goes wrong and fix it." title="Run it, then fix it" tip="Replay the route and repair the first move that misses.">
          <MiniGrid cols={["A", "B", "C"]} rows={["1", "2", "3"]}>
            {(r, c) => {
              if (r === 2 && c === 0) return <Triangle className="h-3 w-3 fill-rose-300 text-rose-300" />;
              if (r === 0 && c === 2) return <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />;
              if (r === 2 && c === 1) return <ArrowDown className="h-3.5 w-3.5 text-rose-400" strokeWidth={3} />;
              return null;
            }}
          </MiniGrid>
        </Card>
      </Grid>
    );
  }
  if (variant === "l4LineSym") {
    return (
      <Grid>
        <Card readAloud="A mirror line matches both sides. Each tile has a matching tile the same distance across the line." title="Both sides match across the line" tip="Every tile has a partner the same distance across.">
          <div className="relative">
            <MiniGrid cols={["A", "B", "C", "D"]} rows={["1", "2", "3"]}>
              {(r, c) => {
                if ((r === 0 && c === 0) || (r === 0 && c === 3)) return <span className="absolute inset-[16%] rounded bg-violet-500" />;
                if ((r === 2 && c === 1) || (r === 2 && c === 2)) return <span className="absolute inset-[16%] rounded bg-cyan-500" />;
                return null;
              }}
            </MiniGrid>
            <span className="pointer-events-none absolute inset-y-2 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
          </div>
        </Card>
        <Card readAloud="Complete the reflection. Place every tile at its mirror position, the same distance on the other side." title="Complete the reflection" tip="Place each tile at its mirror position.">
          <div className="relative">
            <MiniGrid cols={["A", "B", "C", "D"]} rows={["1", "2", "3"]}>
              {(r, c) => {
                if (r === 0 && c === 0) return <span className="absolute inset-[16%] rounded bg-violet-500" />;
                if (r === 0 && c === 3) return <span className="absolute inset-[16%] rounded border-2 border-dashed border-violet-400 bg-violet-500/20" />;
                return null;
              }}
            </MiniGrid>
            <span className="pointer-events-none absolute inset-y-2 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
          </div>
        </Card>
      </Grid>
    );
  }
  if (variant === "l4RotSym") {
    return (
      <Grid>
        <Card readAloud="Turning symmetry turns a shape around a centre point. It has rotational symmetry if it matches itself as it turns." title="Turn around the centre" tip="A shape matches itself as it turns around the centre.">
          <MiniGrid cols={["A", "B", "C"]} rows={["1", "2", "3"]}>
            {(r, c) => {
              if ((r === 0 && c === 1) || (r === 1 && c === 0) || (r === 1 && c === 2) || (r === 2 && c === 1)) return <span className="absolute inset-[18%] rounded bg-violet-500" />;
              if (r === 1 && c === 1) return <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_7px_rgba(252,211,77,0.9)]" />;
              return null;
            }}
          </MiniGrid>
        </Card>
        <Card readAloud="Test a quarter turn or a half turn around the fixed centre, and record where each part lands." title="Quarter and half turns" tip="Keep the centre fixed and test each turn.">
          <div className="flex items-center gap-3">
            <RotateCw className="h-14 w-14 text-cyan-500" strokeWidth={2.5} />
            <div className="text-left text-xs font-black text-indigo-950">
              <div>Quarter turn</div>
              <div>Half turn</div>
              <div className="font-bold text-slate-500">around one centre</div>
            </div>
          </div>
        </Card>
      </Grid>
    );
  }
  // l4Integrate
  return (
    <Grid>
      <Card readAloud="One brief joins many rules. A mission can ask you to build an object, follow a route and make a symmetric design." title="One brief, many rules" tip="A mission joins building, routes and symmetry.">
        <FigureArt figure={getL4Object(0)} built={() => true} />
      </Card>
      <Card readAloud="Solve each part, then check they all still pass together before you submit the finished design." title="Make every rule pass" tip="Solve each part, then check they all still hold.">
        <div className="space-y-1.5 text-left text-xs font-black text-indigo-950">
          {["Build the object", "Connect the route", "Add the symmetry"].map((label) => (
            <div key={label} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="h-3 w-3" strokeWidth={3.5} /></span>
              {label}
            </div>
          ))}
        </div>
      </Card>
    </Grid>
  );
}
