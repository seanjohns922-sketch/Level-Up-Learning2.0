"use client";

import { Sparkles } from "lucide-react";
import GemIcon, { cutForGem, emblemForGem, GEM_RARITY } from "@/components/gems/GemIcon";
import { stoneForGem, stoneRgb } from "@/lib/gem-stones";
import { RARITY_LABEL, type GemDefinition, type GemRarity } from "@/lib/gems";

const RARITIES: GemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

/** Vault hero: collection progress, a count per rarity, and the gem on display on a lit pedestal. */
export default function GemVaultHeader({ collected, total, favourite, rarityCounts }: {
  collected: number;
  total: number;
  favourite: GemDefinition | null;
  rarityCounts: Record<GemRarity, { owned: number; total: number }>;
}) {
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;
  const stone = favourite ? stoneForGem(favourite) : undefined;
  const rgb = stone ? stoneRgb(stone) : "245 158 11";

  return (
    <header className="relative mb-5 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#121722,#0b0e15)] shadow-[0_24px_70px_-30px_#000]">
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 82% 45%, rgb(${rgb} / 0.18), transparent 45%)` }} aria-hidden="true" />
      <div className="relative grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_260px] md:items-center md:p-8">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-amber-300"><Sparkles className="h-4 w-4" aria-hidden="true" /> Gem Vault</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">Your Collection</h1>
          <p className="mt-2 text-sm font-semibold text-white/65">Every gem is a moment you earned through learning.</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Gems discovered" aria-valuemin={0} aria-valuemax={total} aria-valuenow={collected}>
              <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-black">{collected} <span className="text-white/50">of {total} discovered</span> · {pct}%</span>
          </div>

          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Gems by rarity">
            {RARITIES.map((rarity) => {
              const count = rarityCounts[rarity];
              if (!count?.total) return null;
              const colour = GEM_RARITY[rarity];
              return (
                <li key={rarity} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-black">
                  <span className="h-2 w-2 rounded-full" style={{ background: colour.mid, boxShadow: `0 0 8px ${colour.mid}` }} aria-hidden="true" />
                  <span style={{ color: colour.light }}>{RARITY_LABEL[rarity]}</span>
                  <span className="text-white/55">{count.owned}/{count.total}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* On display: the student's chosen gem on a lit pedestal */}
        <div className="relative flex flex-col items-center rounded-2xl border border-white/10 bg-black/20 px-4 pb-4 pt-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">On display</p>
          <div className="relative mt-1 flex h-[120px] w-full items-center justify-center">
            <div className="absolute bottom-2 left-1/2 h-4 w-28 -translate-x-1/2 rounded-[50%] blur-[5px]" style={{ background: favourite ? `rgb(${rgb} / 0.55)` : "rgba(0,0,0,0.5)" }} aria-hidden="true" />
            {favourite ? (
              <div className="relative animate-[gemVaultFloat_3.4s_ease-in-out_infinite] motion-reduce:animate-none" style={{ filter: `drop-shadow(0 8px 24px rgb(${rgb} / 0.6))` }}>
                <GemIcon rarity={favourite.rarity} cut={cutForGem(favourite.id, favourite.rarity)} emblem={emblemForGem(favourite.realm_id, favourite.milestone_type)} stone={stone} size={96} />
              </div>
            ) : (
              <GemIcon rarity="rare" locked size={84} />
            )}
          </div>
          {favourite ? (
            <>
              <p className="text-sm font-black">{favourite.name}</p>
              <p className="text-[11px] font-bold" style={{ color: GEM_RARITY[favourite.rarity].light }}>{RARITY_LABEL[favourite.rarity]}{stone ? ` · ${stone.label}` : ""}</p>
            </>
          ) : (
            <p className="text-xs font-bold text-white/55">Tap the star on any earned gem to display it here.</p>
          )}
        </div>
      </div>
      <style>{`@keyframes gemVaultFloat { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }`}</style>
    </header>
  );
}
