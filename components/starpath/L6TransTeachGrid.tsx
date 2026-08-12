import OptionReadAloudButton from "@/components/OptionReadAloudButton";

// A shape, then the same shape slid and turned — a combined transformation.
function CombinedMove() {
  return (
    <svg viewBox="0 0 96 64" className="h-[70px] w-[96px]" aria-hidden="true">
      <g fill="#38bdf8" fillOpacity="0.85" stroke="#0b0a24" strokeWidth="1">
        <rect x="6" y="34" width="12" height="12" /><rect x="18" y="34" width="12" height="12" /><rect x="6" y="22" width="12" height="12" />
      </g>
      <text x="46" y="42" fontSize="16" fontWeight="800" fill="#67e8f9">&rarr;</text>
      <g fill="#a78bfa" fillOpacity="0.85" stroke="#0b0a24" strokeWidth="1">
        <rect x="66" y="18" width="12" height="12" /><rect x="66" y="30" width="12" height="12" /><rect x="78" y="30" width="12" height="12" />
      </g>
    </svg>
  );
}

// A small hexagon tessellation snippet.
function MiniTess() {
  const R = 11, hx = 1.5 * R, vy = Math.sqrt(3) * R;
  const cells: { cx: number; cy: number }[] = [];
  for (let c = 0; c < 4; c += 1) for (let r = 0; r < 3; r += 1) cells.push({ cx: 12 + c * hx, cy: 14 + r * vy + (c % 2 ? vy / 2 : 0) });
  const pal = ["#38bdf8", "#a78bfa", "#fbbf24"];
  return (
    <svg viewBox="0 0 82 64" className="h-[70px] w-[82px]" aria-hidden="true">
      {cells.map((cell, i) => {
        const pts = Array.from({ length: 6 }, (_, k) => { const a = (Math.PI / 3) * k; return `${cell.cx + R * Math.cos(a)},${cell.cy + R * Math.sin(a)}`; }).join(" ");
        return <polygon key={i} points={pts} fill={pal[i % 3]} fillOpacity={0.85} stroke="#0b0a24" strokeWidth="1" />;
      })}
    </svg>
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

export default function L6TransTeachGrid() {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      <Card readAloud="You can combine transformations by doing one after another: a slide then a turn. Sometimes the order changes where it lands." title="Combine transformations" tip="Do one move, then the next. Order can change the result.">
        <div className="rounded-xl bg-[#0b0a24] p-2"><CombinedMove /></div>
      </Card>
      <Card readAloud="Repeat a tile with a transformation to make a tessellation. It fills the plane with no gaps and no overlaps." title="Tessellations fill the plane" tip="Repeat a tile with no gaps or overlaps; angles at a corner make 360.">
        <div className="rounded-xl bg-[#0b0a24] p-2"><MiniTess /></div>
      </Card>
    </div>
  );
}
