import ReliqsWordmark from "@/components/brand/ReliqsWordmark";
import { getReliqsColor } from "@/lib/reliqs-brand";

/** Presentational only: each vault supplies its existing unlock counts. */
export default function VaultHeader({ realm, name, collection, description, collected, total, animated, preview }: {
  realm: string; name: string; collection: string; description: string;
  collected: number; total: number; animated: boolean; preview: boolean;
}) {
  const color = getReliqsColor(realm);
  const percentage = total > 0 ? Math.min(100, Math.round(collected / total * 100)) : 0;
  return (
    <header className="relative my-8 overflow-hidden rounded-[28px] border border-white/15 bg-[#090d14]/75 p-6 shadow-[0_24px_80px_#00000040] backdrop-blur-xl sm:p-8 md:my-10 md:p-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at 100% 0%, ${color}20, transparent 65%)` }} />
      <div className="relative grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_220px] md:gap-12">
        <div>
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.26em] text-white/65">{name} · Collection vault</p>
          <h1 className="max-w-[370px]" aria-label={`${name} RELIQS`}><ReliqsWordmark color={color} /></h1>
          <p className="mt-5 text-xl font-bold text-white sm:text-2xl">{collection}</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">{description}</p>
        </div>
        <div className="border-t border-white/10 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">{preview ? "Preview collection" : "Your collection"}</p>
          <p className="mt-3 flex items-baseline gap-2 text-white"><span className="text-5xl font-black tracking-tight">{collected}</span><span className="text-xl text-white/45">/ {total}</span></p>
          <p className="mt-2 text-sm text-white/65">{preview ? "RELIQS to discover" : "RELIQS collected"}</p>
          <div role="progressbar" aria-label="Collection progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={collected} className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none" style={{ width: animated ? `${percentage}%` : "0%", background: color }} />
          </div>
          <p className="mt-3 text-xs font-semibold text-white/75">{preview ? "Explore every evolution" : percentage === 100 ? "Collection complete" : `${percentage}% of the vault unlocked`}</p>
        </div>
      </div>
    </header>
  );
}
