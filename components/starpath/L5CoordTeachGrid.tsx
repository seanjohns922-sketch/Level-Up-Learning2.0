import OptionReadAloudButton from "@/components/OptionReadAloudButton";

// A tiny first-quadrant plane illustrating "across then up" to a plotted star.
function MiniPlane({ px, py }: { px: number; py: number }) {
  const N = 4, STEP = 26, PAD = 16;
  const cx = (x: number) => PAD + x * STEP;
  const cy = (y: number) => PAD + (N - y) * STEP;
  const W = PAD * 2 + N * STEP;
  return (
    <svg viewBox={`0 0 ${W} ${W}`} className="h-32 w-32" aria-hidden="true">
      {Array.from({ length: N + 1 }, (_, i) => (
        <g key={i}>
          <line x1={cx(i)} y1={cy(0)} x2={cx(i)} y2={cy(N)} stroke="rgba(103,232,249,0.16)" />
          <line x1={cx(0)} y1={cy(i)} x2={cx(N)} y2={cy(i)} stroke="rgba(103,232,249,0.16)" />
        </g>
      ))}
      <line x1={cx(0)} y1={cy(0)} x2={cx(N)} y2={cy(0)} stroke="#67e8f9" strokeWidth="2" />
      <line x1={cx(0)} y1={cy(0)} x2={cx(0)} y2={cy(N)} stroke="#67e8f9" strokeWidth="2" />
      {/* across then up guides */}
      <line x1={cx(0)} y1={cy(0)} x2={cx(px)} y2={cy(0)} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1={cx(px)} y1={cy(0)} x2={cx(px)} y2={cy(py)} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <polygon points={`${cx(px)},${cy(py) - 8} ${cx(px) + 3},${cy(py) - 2} ${cx(px) + 8},${cy(py) - 1.5} ${cx(px) + 4},${cy(py) + 2.5} ${cx(px) + 5},${cy(py) + 8} ${cx(px)},${cy(py) + 4} ${cx(px) - 5},${cy(py) + 8} ${cx(px) - 4},${cy(py) + 2.5} ${cx(px) - 8},${cy(py) - 1.5} ${cx(px) - 3},${cy(py) - 2}`} fill="#fcd34d" stroke="#fff7d6" />
    </svg>
  );
}

function Card({ readAloud, title, tip, children }: { readAloud: string; title: string; tip: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
      <OptionReadAloudButton text={readAloud} className="absolute right-2 top-2" />
      <div className="flex flex-1 items-center justify-center"><div className="rounded-xl bg-[#0b0a24] p-2">{children}</div></div>
      <div className="mt-2 text-base font-black text-indigo-950">{title}</div>
      <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">{tip}</div>
    </div>
  );
}

export default function L5CoordTeachGrid() {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      <Card readAloud="A coordinate names a point with two numbers. Count across first, then up. The origin is the corner at zero, zero." title="Across first, then up" tip="Count across, then up. This star is at (3, 2).">
        <MiniPlane px={3} py={2} />
      </Card>
      <Card readAloud="Moving along one direction changes only one number. Moving up changes the up number; moving across changes the across number." title="One move, one number" tip="Move up and only the up number changes.">
        <MiniPlane px={2} py={3} />
      </Card>
    </div>
  );
}
