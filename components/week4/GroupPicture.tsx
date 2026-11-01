"use client";

const COUNTER = "radial-gradient(circle at 34% 28%, #fff 0 12%, #ffd27a 24%, #ff9e1f 70%, #d97706)";

export function Counter({ size = 40 }: { size?: number }) {
  return <span aria-hidden className="block rounded-full shadow-[0_3px_3px_rgba(0,0,0,0.2)]" style={{ width: size, height: size, background: COUNTER }} />;
}

/** Shows what a "groups of" question is asking: all the counters, and the empty groups they go into. */
export default function GroupPicture({ groups, total }: { groups: number; total: number }) {
  return (
    <div className="mb-4 rounded-2xl bg-[#e7f8f4] p-4" role="img" aria-label={`${total} counters to share into ${groups} groups`}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: total }, (_, i) => <Counter key={i} />)}
      </div>
      <div className="my-2 text-center text-2xl font-black text-teal-700" aria-hidden>↓</div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {Array.from({ length: groups }, (_, i) => (
          <div key={i} className="grid h-24 w-28 place-items-center rounded-[50%] border-4 border-dashed border-teal-500 bg-white text-3xl font-black text-teal-700">?</div>
        ))}
      </div>
    </div>
  );
}
