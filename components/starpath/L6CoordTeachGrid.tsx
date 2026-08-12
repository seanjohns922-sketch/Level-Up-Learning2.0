import OptionReadAloudButton from "@/components/OptionReadAloudButton";

// A small four-quadrant plane with a point plotted in Quadrant II (-2, 1).
function MiniPlane() {
  const O = 46, S = 12;
  const cx = (x: number) => O + x * S;
  const cy = (y: number) => O - y * S;
  return (
    <svg viewBox="0 0 92 92" className="h-[86px] w-[86px]" aria-hidden="true">
      {[-3, -2, -1, 0, 1, 2, 3].map((n) => (
        <g key={n}>
          <line x1={cx(n)} y1={cy(-3)} x2={cx(n)} y2={cy(3)} stroke="rgba(103,232,249,0.14)" strokeWidth="1" />
          <line x1={cx(-3)} y1={cy(n)} x2={cx(3)} y2={cy(n)} stroke="rgba(103,232,249,0.14)" strokeWidth="1" />
        </g>
      ))}
      <line x1={cx(-3.4)} y1={cy(0)} x2={cx(3.4)} y2={cy(0)} stroke="#67e8f9" strokeWidth="1.6" />
      <line x1={cx(0)} y1={cy(-3.4)} x2={cx(0)} y2={cy(3.4)} stroke="#67e8f9" strokeWidth="1.6" />
      <circle cx={cx(-2)} cy={cy(1)} r="4" fill="#fcd34d" stroke="#fff7d6" strokeWidth="1" />
    </svg>
  );
}

// Signs of the four quadrants.
function QuadrantSigns() {
  const cell = "flex h-9 w-9 items-center justify-center rounded-md font-mono text-xs font-black";
  return (
    <div className="grid grid-cols-2 gap-1">
      <div className={`${cell} bg-cyan-100 text-cyan-800`}>-,+</div>
      <div className={`${cell} bg-amber-100 text-amber-800`}>+,+</div>
      <div className={`${cell} bg-violet-100 text-violet-800`}>-,-</div>
      <div className={`${cell} bg-rose-100 text-rose-800`}>+,-</div>
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

export default function L6CoordTeachGrid() {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      <Card readAloud="The axes now reach into negative numbers. Left of the origin x is negative, and below it y is negative. Count across first, then up or down." title="Four quadrants" tip="Left is negative x; down is negative y. Across first, then up or down.">
        <div className="rounded-xl bg-[#0b0a24] p-2"><MiniPlane /></div>
      </Card>
      <Card readAloud="The signs of the coordinates tell you the quadrant. Quadrant one is positive positive, then they run anticlockwise." title="Signs name the quadrant" tip="(+,+) is I; going anticlockwise gives II, III, IV.">
        <QuadrantSigns />
      </Card>
    </div>
  );
}
