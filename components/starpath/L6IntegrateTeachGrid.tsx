import OptionReadAloudButton from "@/components/OptionReadAloudButton";

// Mini object with a slice (cross-section strand).
function MiniObject() {
  return (
    <svg viewBox="0 0 60 64" className="h-[64px] w-[58px]" aria-hidden="true">
      <polygon points="12,52 40,52 48,44 20,44" fill="#2563eb" fillOpacity="0.42" stroke="rgba(255,255,255,.4)" strokeWidth="1" />
      <polygon points="12,16 40,16 48,8 20,8" fill="#60a5fa" fillOpacity="0.85" stroke="rgba(255,255,255,.5)" strokeWidth="1" />
      <polygon points="12,16 40,16 40,52 12,52" fill="#3b82f6" fillOpacity="0.28" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
      <polygon points="40,16 48,8 48,44 40,52" fill="#2563eb" fillOpacity="0.45" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
      <polygon points="12,34 40,34 48,26 20,26" fill="#fbbf24" fillOpacity="0.9" stroke="#fff" strokeWidth="1.2" />
    </svg>
  );
}

// Mini four-quadrant plane with a plotted point.
function MiniPlane() {
  const O = 30, S = 8;
  const cx = (x: number) => O + x * S;
  const cy = (y: number) => O - y * S;
  return (
    <svg viewBox="0 0 60 60" className="h-[60px] w-[60px]" aria-hidden="true">
      {[-3, -2, -1, 1, 2, 3].map((n) => (
        <g key={n}>
          <line x1={cx(n)} y1={cy(-3)} x2={cx(n)} y2={cy(3)} stroke="rgba(103,232,249,0.14)" strokeWidth="0.8" />
          <line x1={cx(-3)} y1={cy(n)} x2={cx(3)} y2={cy(n)} stroke="rgba(103,232,249,0.14)" strokeWidth="0.8" />
        </g>
      ))}
      <line x1={cx(-3.2)} y1={cy(0)} x2={cx(3.2)} y2={cy(0)} stroke="#67e8f9" strokeWidth="1.4" />
      <line x1={cx(0)} y1={cy(-3.2)} x2={cx(0)} y2={cy(3.2)} stroke="#67e8f9" strokeWidth="1.4" />
      <circle cx={cx(2)} cy={cy(-1)} r="3.4" fill="#fcd34d" stroke="#fff7d6" strokeWidth="1" />
    </svg>
  );
}

// Mini triangle tessellation.
function MiniTess() {
  const a = 16, rh = a * Math.sqrt(3) / 2, tris: { pts: string; fill: string }[] = [];
  const pal = ["#38bdf8", "#a78bfa", "#fbbf24"];
  let n = 0;
  for (let y = 4; y < 56; y += rh) for (let x = 2; x < 58; x += a) {
    tris.push({ pts: `${x},${y + rh} ${x + a},${y + rh} ${x + a / 2},${y}`, fill: pal[n % 3]! }); n += 1;
  }
  return (
    <svg viewBox="0 0 60 60" className="h-[60px] w-[60px]" aria-hidden="true">
      {tris.map((t, i) => <polygon key={i} points={t.pts} fill={t.fill} fillOpacity={0.82} stroke="#0b0a24" strokeWidth="0.8" />)}
    </svg>
  );
}

export default function L6IntegrateTeachGrid() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative flex flex-col items-center rounded-2xl border-2 border-white bg-white/90 p-4 text-center shadow-sm">
        <OptionReadAloudButton text="An integration mission joins all three skills: read an object's cross-section, locate a point in the four quadrants, and describe a transformation or tessellation. Every part must be right." className="absolute right-2 top-2" />
        <div className="flex items-center justify-center gap-4">
          <div className="rounded-xl bg-[#0b0a24] p-2"><MiniObject /></div>
          <span className="text-xl font-black text-cyan-500">+</span>
          <div className="rounded-xl bg-[#0b0a24] p-2"><MiniPlane /></div>
          <span className="text-xl font-black text-cyan-500">+</span>
          <div className="rounded-xl bg-[#0b0a24] p-2"><MiniTess /></div>
        </div>
        <div className="mt-3 text-base font-black text-indigo-950">Bring every skill together</div>
        <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">One mission: read the object, locate the point, describe the pattern.</div>
      </div>
    </div>
  );
}
