import OptionReadAloudButton from "@/components/OptionReadAloudButton";

const FACE = { front: "#06b6d4", right: "#10b981", top: "#f59e0b" };

// A tiny 2.5D cube — the "nets" strand.
function MiniCube() {
  return (
    <div className="relative h-12 w-12" style={{ perspective: 200 }}>
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: "rotateX(-24deg) rotateY(-32deg)" }}>
        <div className="absolute inset-0 rounded-[3px]" style={{ background: FACE.front, border: "2px solid rgba(255,255,255,0.6)", transform: "translateZ(24px)" }} />
        <div className="absolute inset-0 rounded-[3px]" style={{ background: FACE.right, border: "2px solid rgba(255,255,255,0.6)", transform: "rotateY(90deg) translateZ(24px)" }} />
        <div className="absolute inset-0 rounded-[3px]" style={{ background: FACE.top, border: "2px solid rgba(255,255,255,0.6)", transform: "rotateX(90deg) translateZ(24px)" }} />
      </div>
    </div>
  );
}

// A dot field with a plotted star — the "coordinates" strand.
function MiniPlane() {
  const S = 12, P = 6, n = 4;
  const cx = (x: number) => P + x * S, cy = (y: number) => P + (n - y) * S, W = P * 2 + n * S;
  return (
    <svg viewBox={`0 0 ${W} ${W}`} className="h-12 w-12" aria-hidden="true">
      {Array.from({ length: (n + 1) * (n + 1) }, (_, i) => <circle key={i} cx={cx(i % (n + 1))} cy={cy(Math.floor(i / (n + 1)))} r="1.2" fill="rgba(148,163,255,0.5)" />)}
      <circle cx={cx(3)} cy={cy(2)} r="4" fill="#fcd34d" stroke="#fff7d6" />
    </svg>
  );
}

// A shape and its slid image — the "transformations" strand.
function MiniTransform() {
  const S = 12, P = 6, n = 4;
  const cx = (x: number) => P + x * S, cy = (y: number) => P + (n - y) * S, W = P * 2 + n * S, T = S - 3;
  const t = (x: number, y: number, fill: string) => <rect key={`${fill}${x}${y}`} x={cx(x) - T / 2} y={cy(y) - T / 2} width={T} height={T} rx="2" fill={fill} stroke="rgba(255,255,255,0.4)" />;
  return (
    <svg viewBox={`0 0 ${W} ${W}`} className="h-12 w-12" aria-hidden="true">
      {Array.from({ length: (n + 1) * (n + 1) }, (_, i) => <circle key={i} cx={cx(i % (n + 1))} cy={cy(Math.floor(i / (n + 1)))} r="1.2" fill="rgba(148,163,255,0.5)" />)}
      {t(0, 0, "#22d3ee")}{t(1, 0, "#22d3ee")}
      {t(3, 2, "rgba(167,139,250,0.85)")}{t(4, 2, "rgba(167,139,250,0.85)")}
    </svg>
  );
}

export default function L5IntegrateTeachGrid() {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="relative flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
        <OptionReadAloudButton text="One mission uses everything: fold a net into an object, use coordinates to place it, and transform it with a slide, flip or turn." className="absolute right-2 top-2" />
        <div className="flex flex-1 items-center justify-center gap-2">
          <div className="rounded-xl bg-[#0b0a24] p-2"><MiniCube /></div>
          <div className="rounded-xl bg-[#0b0a24] p-2"><MiniPlane /></div>
          <div className="rounded-xl bg-[#0b0a24] p-2"><MiniTransform /></div>
        </div>
        <div className="mt-2 text-base font-black text-indigo-950">One mission, three skills</div>
        <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">Nets, coordinates and transformations together.</div>
      </div>
      <div className="relative flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
        <OptionReadAloudButton text="Every part must pass. Read the brief, build and place each part, then check the invariants and prove your design works." className="absolute right-2 top-2" />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-left text-sm font-black text-indigo-950">
          {["Read the brief", "Build and place", "Test and defend"].map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600 text-white">{index + 1}</span>{step}
            </div>
          ))}
        </div>
        <div className="mt-2 text-base font-black text-indigo-950">Make every part pass</div>
        <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">Solve each part, then prove it with evidence.</div>
      </div>
    </div>
  );
}
