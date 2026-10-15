"use client";

import { Lock, Star } from "lucide-react";
import GemIcon, { cutForGem, emblemForGem, GEM_RARITY } from "@/components/gems/GemIcon";
import { stoneForGem, stoneRgb } from "@/lib/gem-stones";
import { RARITY_LABEL, type GemDefinition } from "@/lib/gems";

/**
 * One gem in the vault, shown as a lit display case: the earned gem floats over
 * a pedestal glowing in its stone colour, with a rarity-coloured rim. Locked
 * gems stay dark and show progress toward earning them.
 */
export default function GemCase({ gem, earnedAt, favourite, busy, onToggleFavourite }: {
  gem: GemDefinition;
  earnedAt?: string;
  favourite: boolean;
  busy: boolean;
  onToggleFavourite?: () => void;
}) {
  const owned = Boolean(earnedAt);
  const rarity = GEM_RARITY[gem.rarity];
  const stone = stoneForGem(gem);
  const rgb = stone ? stoneRgb(stone) : "148 163 184";
  const showBar = !owned && gem.target > 1;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-[linear-gradient(#141821,#0d1017)] text-center transition duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={owned
        ? { borderColor: `${rarity.mid}55`, boxShadow: `0 0 0 1px ${rarity.mid}22, 0 14px 34px -18px rgb(${rgb} / 0.9)` }
        : { borderColor: "rgba(255,255,255,0.08)" }}
    >
      {owned ? <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${rarity.mid}, transparent)` }} aria-hidden="true" /> : null}

      {owned && onToggleFavourite ? (
        <button
          type="button"
          onClick={onToggleFavourite}
          disabled={busy}
          aria-label={favourite ? "Displayed in My Home" : "Display in My Home"}
          aria-pressed={favourite}
          className="absolute right-2 top-2 z-10 rounded-full p-1 text-white/40 transition hover:text-amber-300 disabled:opacity-40"
        >
          <Star className="h-4 w-4" fill={favourite ? "#fbbf24" : "none"} color={favourite ? "#fbbf24" : "currentColor"} />
        </button>
      ) : null}

      {/* Display case: lit backdrop, pedestal glow and the gem */}
      <div
        className="relative flex h-[104px] items-center justify-center"
        style={{ background: owned ? `radial-gradient(circle at 50% 62%, rgb(${rgb} / 0.26), transparent 62%)` : "radial-gradient(circle at 50% 62%, rgba(148,163,184,0.06), transparent 60%)" }}
      >
        <div className="absolute bottom-3 left-1/2 h-3 w-20 -translate-x-1/2 rounded-[50%] blur-[3px]" style={{ background: owned ? `rgb(${rgb} / 0.45)` : "rgba(0,0,0,0.5)" }} aria-hidden="true" />
        <div className="relative transition duration-300 group-hover:-translate-y-1 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:transform-none">
          <GemIcon rarity={gem.rarity} cut={cutForGem(gem.id, gem.rarity)} emblem={emblemForGem(gem.realm_id, gem.milestone_type)} stone={stone} locked={!owned} size={72} />
        </div>
        {!owned ? <Lock className="absolute h-4 w-4 text-white/45" aria-hidden="true" /> : null}
      </div>

      <div className="flex flex-1 flex-col items-center px-3 pb-3.5">
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em]"
          style={{ color: owned ? rarity.light : "#94a3b8", background: owned ? `${rarity.mid}22` : "rgba(148,163,184,0.12)" }}
        >
          {RARITY_LABEL[gem.rarity]}
        </span>
        <p className={`mt-1.5 text-sm font-black leading-tight ${owned ? "text-white" : "text-white/60"}`}>{gem.name}</p>
        <p className="mt-1 text-[11px] font-semibold leading-snug text-white/45">{gem.description}</p>
        {owned ? (
          <p className="mt-auto pt-2 text-[10px] font-bold text-white/40">Earned {earnedAt ? new Date(earnedAt).toLocaleDateString() : ""}</p>
        ) : showBar ? (
          <div className="mt-auto w-full pt-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-white/40" style={{ width: `${Math.min(100, Math.round((gem.current / Math.max(1, gem.target)) * 100))}%` }} />
            </div>
            <p className="mt-1 text-[10px] font-black text-white/50">{Math.min(gem.current, gem.target)} / {gem.target}</p>
          </div>
        ) : (
          <p className="mt-auto pt-2 text-[10px] font-bold text-white/35">Not yet earned</p>
        )}
      </div>
    </div>
  );
}
