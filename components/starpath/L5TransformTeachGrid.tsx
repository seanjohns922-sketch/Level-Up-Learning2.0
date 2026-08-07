import OptionReadAloudButton from "@/components/OptionReadAloudButton";

const N = 5, STEP = 22, PAD = 12;
const cx = (x: number) => PAD + x * STEP;
const cy = (y: number) => PAD + (N - y) * STEP;
const W = PAD * 2 + N * STEP;
const TILE = STEP - 6;

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${W}`} className="h-28 w-28" aria-hidden="true">
      {Array.from({ length: N + 1 }, (_, i) => (
        <g key={i}>
          <line x1={cx(i)} y1={cy(0)} x2={cx(i)} y2={cy(N)} stroke="rgba(103,232,249,0.14)" />
          <line x1={cx(0)} y1={cy(i)} x2={cx(N)} y2={cy(i)} stroke="rgba(103,232,249,0.14)" />
        </g>
      ))}
      <line x1={cx(0)} y1={cy(0)} x2={cx(N)} y2={cy(0)} stroke="#67e8f9" strokeWidth="1.5" />
      <line x1={cx(0)} y1={cy(0)} x2={cx(0)} y2={cy(N)} stroke="#67e8f9" strokeWidth="1.5" />
      {children}
    </svg>
  );
}

const Tile = ({ x, y, fill }: { x: number; y: number; fill: string }) => (
  <rect x={cx(x) - TILE / 2} y={cy(y) - TILE / 2} width={TILE} height={TILE} rx="3" fill={fill} stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
);
const SHAPE = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];

function Card({ readAloud, title, tip, children }: { readAloud: string; title: string; tip: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
      <OptionReadAloudButton text={readAloud} className="absolute right-2 top-2" />
      <div className="flex flex-1 items-center justify-center"><div className="rounded-xl bg-[#0b0a24] p-2"><Grid>{children}</Grid></div></div>
      <div className="mt-2 text-base font-black text-indigo-950">{title}</div>
      <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">{tip}</div>
    </div>
  );
}

export default function L5TransformTeachGrid() {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      <Card readAloud="A slide moves every point the same amount. The shape keeps its size and stays facing the same way." title="Slide: move every point" tip="A slide keeps size, shape and facing.">
        {SHAPE.map((p) => <Tile key={`a${p.x}${p.y}`} x={p.x} y={p.y} fill="#22d3ee" />)}
        {SHAPE.map((p) => <Tile key={`b${p.x}${p.y}`} x={p.x + 3} y={p.y + 1} fill="rgba(167,139,250,0.85)" />)}
      </Card>
      <Card readAloud="A flip mirrors the shape across a line. A turn rotates it around a point. Size and shape stay the same." title="Flip and turn" tip="A flip mirrors; a turn rotates. Size stays the same.">
        <line x1={cx(2.5)} y1={cy(0)} x2={cx(2.5)} y2={cy(N)} stroke="#f59e0b" strokeWidth="2" style={{ filter: "drop-shadow(0 0 4px rgba(245,158,11,0.8))" }} />
        {SHAPE.map((p) => <Tile key={`c${p.x}${p.y}`} x={p.x} y={p.y + 2} fill="#22d3ee" />)}
        {SHAPE.map((p) => <Tile key={`d${p.x}${p.y}`} x={5 - p.x} y={p.y + 2} fill="rgba(167,139,250,0.85)" />)}
      </Card>
    </div>
  );
}
