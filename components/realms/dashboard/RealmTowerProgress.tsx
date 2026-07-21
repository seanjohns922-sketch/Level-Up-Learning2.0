export default function RealmTowerProgress({ floorsLit, totalFloors, accent }: { floorsLit: number; totalFloors: number; accent: string }) {
  const safeTotal = Math.max(1, totalFloors);
  const safeLit = Math.max(0, Math.min(safeTotal, floorsLit));
  return (
    <section aria-label={`Tower of Knowledge: ${safeLit} of ${safeTotal} floors restored`} className="rounded-lg border border-white/15 bg-slate-950/75 p-3 text-white shadow-xl backdrop-blur-md">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">Tower of Knowledge</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex flex-col-reverse gap-1" aria-hidden="true">
          {Array.from({ length: safeTotal }, (_, index) => <span key={index} className="h-1.5 w-6 rounded-sm" style={{ background: index < safeLit ? accent : "rgba(255,255,255,0.16)" }} />)}
        </div>
        <strong className="text-lg">{safeLit} / {safeTotal}</strong>
      </div>
    </section>
  );
}

