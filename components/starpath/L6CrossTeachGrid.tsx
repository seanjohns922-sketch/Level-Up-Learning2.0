import OptionReadAloudButton from "@/components/OptionReadAloudButton";

// A small prism with two equal parallel slices — the section never changes.
function MiniPrism() {
  return (
    <svg viewBox="0 0 90 92" className="h-[88px] w-[86px]" aria-hidden="true">
      <polygon points="20,74 62,74 74,60 32,60" fill="#2563eb" fillOpacity="0.4" stroke="rgba(255,255,255,.4)" strokeWidth="1.2" />
      <polygon points="20,22 62,22 74,8 32,8" fill="#60a5fa" fillOpacity="0.85" stroke="rgba(255,255,255,.5)" strokeWidth="1.2" />
      <polygon points="20,22 62,22 62,74 20,74" fill="#3b82f6" fillOpacity="0.28" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
      <polygon points="62,22 74,8 74,60 62,74" fill="#2563eb" fillOpacity="0.45" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
      <polygon points="20,56 62,56 74,42 32,42" fill="#fbbf24" fillOpacity="0.9" stroke="#fff" strokeWidth="1.4" />
      <polygon points="20,38 62,38 74,24 32,24" fill="#fbbf24" fillOpacity="0.55" stroke="#fff" strokeWidth="1.2" />
    </svg>
  );
}

// A small pyramid with two parallel slices — the higher one is smaller.
function MiniPyramid() {
  return (
    <svg viewBox="0 0 90 92" className="h-[88px] w-[86px]" aria-hidden="true">
      <polygon points="18,76 66,76 78,64 30,64" fill="#4c1d95" fillOpacity="0.4" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
      <polygon points="18,76 30,64 50,10" fill="#a78bfa" fillOpacity="0.5" stroke="rgba(255,255,255,.4)" strokeWidth="1.2" />
      <polygon points="66,76 78,64 50,10" fill="#8b5cf6" fillOpacity="0.5" stroke="rgba(255,255,255,.4)" strokeWidth="1.2" />
      <polygon points="18,76 66,76 50,10" fill="#7c3aed" fillOpacity="0.45" stroke="rgba(255,255,255,.4)" strokeWidth="1.2" />
      <polygon points="27,55 57,55 66,46 36,46" fill="#fbbf24" fillOpacity="0.9" stroke="#fff" strokeWidth="1.4" />
      <polygon points="36,34 52,34 59,27 43,27" fill="#fbbf24" fillOpacity="0.6" stroke="#fff" strokeWidth="1.2" />
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

export default function L6CrossTeachGrid() {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      <Card readAloud="A cross-section is the flat shape a straight cut reveals. In a prism, every parallel slice is the same shape and size." title="A prism keeps its slice" tip="Every parallel cut of a prism is congruent to the base.">
        <div className="rounded-xl bg-[#0b0a24] p-2"><MiniPrism /></div>
      </Card>
      <Card readAloud="In a pyramid or cone, each parallel slice is smaller than the one below, shrinking to a point at the top." title="A pyramid's slice shrinks" tip="Parallel cuts get smaller toward the apex.">
        <div className="rounded-xl bg-[#0b0a24] p-2"><MiniPyramid /></div>
      </Card>
    </div>
  );
}
