"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Trophy } from "lucide-react";
import { getAllLegends, getEffectiveUnlockedLegendIds } from "@/data/legends";
import { readProgress } from "@/data/progress";

/**
 * A grand, click-into feature banner for the Hall of Legends on My Home.
 * Shows progress and a fanned teaser of the student's latest earned cards
 * (with locked silhouettes for what's next); the whole banner routes to the
 * full /legends hall. Deliberately a teaser, not the full 14-card grid.
 */
export default function HallOfLegendsWidget() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<Set<string> | null>(null);

  useEffect(() => {
    // Progress lives in localStorage, so it can only be read after mount
    // (avoids an SSR/hydration mismatch); the initial null render shows "—".
    const progress = readProgress();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnlocked(
      new Set<string>([
        ...getEffectiveUnlockedLegendIds(progress?.year, progress?.unlockedLegends, "number-nexus"),
        ...getEffectiveUnlockedLegendIds(progress?.year, progress?.unlockedLegends, "measurelands"),
      ]),
    );
  }, []);

  const all = useMemo(() => getAllLegends(), []);
  const total = all.length;
  const unlockedLegends = all.filter((legend) => unlocked?.has(legend.id));
  const count = unlockedLegends.length;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  // Teaser: latest earned cards, padded with upcoming locked silhouettes.
  const previewUnlocked = unlockedLegends.slice(-3);
  const previewLocked = all
    .filter((legend) => !unlocked?.has(legend.id))
    .slice(0, Math.max(0, 4 - previewUnlocked.length));
  const fanCount = previewUnlocked.length + previewLocked.length;
  const rotationFor = (index: number) => (index - (fanCount - 1) / 2) * 6;

  return (
    <button
      type="button"
      onClick={() => router.push("/legends")}
      aria-label={`Enter the Hall of Legends. ${count} of ${total} legends earned.`}
      className="group relative block w-full overflow-hidden rounded-2xl border border-white/12 text-left transition hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#15171d] via-[#111318] to-[#0e1014]" aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_80%_50%,rgba(251,191,36,0.10),transparent_62%)]" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:justify-between md:p-7">
        <div className="max-w-md">
          <div className="flex items-center gap-2 text-amber-300">
            <Trophy className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-black uppercase tracking-[0.18em]">Hall of Legends</span>
          </div>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Your Legends</h2>
          <p className="mt-1 text-sm font-semibold text-white/70">Legends you&rsquo;ve earned across every realm.</p>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 w-40 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-amber-300 transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-black text-white">
              {unlocked ? count : "—"} of {total} <span className="font-bold text-white/60">Legends</span>
            </span>
          </div>

          <span className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-black text-slate-900 transition group-hover:bg-white/90">
            Enter the Hall <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>

        <div className="flex shrink-0 items-end self-center pr-1 sm:self-center">
          {previewUnlocked.map((legend, index) => (
            <img
              key={legend.id}
              src={legend.images.cardFront}
              alt={legend.name}
              className="-ml-5 h-28 w-auto rounded-lg border border-white/25 shadow-[0_12px_28px_rgba(0,0,0,.55)] first:ml-0 md:h-32"
              style={{ transform: `rotate(${rotationFor(index)}deg)` }}
            />
          ))}
          {previewLocked.map((legend, index) => (
            <div
              key={legend.id}
              aria-hidden="true"
              className="-ml-5 flex h-28 w-[76px] items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] backdrop-blur-sm first:ml-0 md:h-32 md:w-[86px]"
              style={{ transform: `rotate(${rotationFor(previewUnlocked.length + index)}deg)` }}
            >
              <Lock className="h-6 w-6 text-white/35" />
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}
