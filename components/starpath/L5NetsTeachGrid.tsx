import OptionReadAloudButton from "@/components/OptionReadAloudButton";

// The six cube-face colours, matching the net engine's FACE_META.
const FACE = { top: "#f59e0b", bottom: "#7c3aed", back: "#f43f5e", front: "#06b6d4", right: "#10b981", left: "#3b82f6" };

// A little cross net: colours laid out so the folded cube's faces read correctly.
function CrossNet() {
  const cells: Record<string, string> = { "0:1": FACE.top, "1:0": FACE.left, "1:1": FACE.front, "1:2": FACE.right, "2:1": FACE.bottom, "3:1": FACE.back };
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(3, 26px)" }}>
      {Array.from({ length: 12 }, (_, index) => {
        const key = `${Math.floor(index / 3)}:${index % 3}`;
        const colour = cells[key];
        return <div key={index} className="h-[26px] w-[26px] rounded-[4px]" style={colour ? { background: colour, border: "2px solid rgba(255,255,255,0.7)" } : undefined} />;
      })}
    </div>
  );
}

// A small 2.5D cube built from three visible faces.
function MiniCube() {
  return (
    <div className="relative h-16 w-16" style={{ perspective: 260 }}>
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: "rotateX(-24deg) rotateY(-32deg)" }}>
        <div className="absolute inset-0 rounded-[4px]" style={{ background: FACE.front, border: "2px solid rgba(255,255,255,0.7)", transform: "translateZ(32px)" }} />
        <div className="absolute inset-0 rounded-[4px]" style={{ background: FACE.right, border: "2px solid rgba(255,255,255,0.7)", transform: "rotateY(90deg) translateZ(32px)" }} />
        <div className="absolute inset-0 rounded-[4px]" style={{ background: FACE.top, border: "2px solid rgba(255,255,255,0.7)", transform: "rotateX(90deg) translateZ(32px)" }} />
      </div>
    </div>
  );
}

function Card({ readAloud, title, tip, children }: { readAloud: string; title: string; tip: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
      <OptionReadAloudButton text={readAloud} className="absolute right-2 top-2" />
      <div className="flex flex-1 items-center justify-center gap-3">{children}</div>
      <div className="mt-2 text-base font-black text-indigo-950">{title}</div>
      <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">{tip}</div>
    </div>
  );
}

export default function L5NetsTeachGrid() {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      <Card readAloud="A net is a flat shape that folds into a solid. Unfold a cube and you get six squares joined edge to edge." title="A net unfolds a solid" tip="Unfold a cube and you get a flat net of six faces.">
        <div className="rounded-xl bg-[#0b0a24] p-2"><CrossNet /></div>
        <span className="text-2xl font-black text-cyan-500">&rarr;</span>
        <div className="rounded-xl bg-[#0b0a24] p-2"><MiniCube /></div>
      </Card>
      <Card readAloud="The six faces fold up edge to edge. It only works if no two faces land on the same spot." title="It folds with no overlaps" tip="Six faces must fold up without overlapping.">
        <div className="rounded-xl bg-[#0b0a24] p-2"><MiniCube /></div>
      </Card>
    </div>
  );
}
