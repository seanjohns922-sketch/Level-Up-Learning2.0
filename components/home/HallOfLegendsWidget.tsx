"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Trophy } from "lucide-react";
import { getAllLegends, getEffectiveUnlockedLegendIds } from "@/data/legends";
import { readProgress } from "@/data/progress";
import { isDemoPreviewMode } from "@/lib/demo-mode";

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
    // Progress is realm-scoped, so read each realm's own record — otherwise
    // Measurelands unlocks (saved under the "measurement" scope) are missed.
    const numberProgress = readProgress("number");
    const measureProgress = readProgress("measurement");
    const spaceProgress = readProgress("space");
    const nextUnlocked = isDemoPreviewMode()
      ? new Set(getAllLegends().map((legend) => legend.id))
      : new Set<string>([
          ...getEffectiveUnlockedLegendIds(numberProgress?.year, numberProgress?.unlockedLegends, "number-nexus"),
          ...getEffectiveUnlockedLegendIds(measureProgress?.year, measureProgress?.unlockedLegends, "measurelands"),
          ...getEffectiveUnlockedLegendIds(spaceProgress?.year, spaceProgress?.unlockedLegends, "starpath"),
        ]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnlocked(nextUnlocked);
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

  // A fanned teaser of cards. `mirror` flips the fan so the left copy leans
  // toward the centre, framing the title symmetrically.
  const renderFan = (mirror: boolean) => (
    <>
      {previewUnlocked.map((legend, index) => (
        <img
          key={legend.id}
          src={legend.images.cardFront}
          alt={legend.name}
          className="-ml-5 h-28 w-auto rounded-lg border border-white/25 shadow-[0_12px_28px_rgba(0,0,0,.55)] first:ml-0 md:h-32"
          style={{ transform: `rotate(${(mirror ? -1 : 1) * rotationFor(index)}deg)` }}
        />
      ))}
      {previewLocked.map((legend, index) => (
        <div
          key={legend.id}
          aria-hidden="true"
          className="-ml-5 flex h-28 w-[76px] items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] backdrop-blur-sm first:ml-0 md:h-32 md:w-[86px]"
          style={{ transform: `rotate(${(mirror ? -1 : 1) * rotationFor(previewUnlocked.length + index)}deg)` }}
        >
          <Lock className="h-6 w-6 text-white/35" />
        </div>
      ))}
    </>
  );

  return (
    <button
      type="button"
      onClick={() => router.push("/legends")}
      aria-label={`Enter the Hall of Legends. ${count} of ${total} legends earned.`}
      className="group relative block w-full overflow-hidden rounded-2xl border border-white/12 text-left transition hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#15171d] via-[#111318] to-[#0e1014]" aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_82%_50%,rgba(251,191,36,0.10),transparent_60%)]" aria-hidden="true" />
      <div className="absolute inset-y-0 left-0 w-2/3 bg-[radial-gradient(circle_at_18%_50%,rgba(251,191,36,0.10),transparent_60%)]" aria-hidden="true" />

      <div className="relative z-10 p-6 md:p-7">
        {/* Mirrored fan on the left (lg+ only), framing the centred title */}
        <div className="hidden lg:absolute lg:left-7 lg:top-1/2 lg:flex lg:-translate-y-1/2 lg:flex-row-reverse lg:items-end">
          {renderFan(true)}
        </div>

        {/* Centered text block (title, progress, CTA) */}
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
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

          <span className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-black text-slate-900 transition group-hover:bg-white/90">
            Enter the Hall <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>

        {/* Cards on the right (stack centered below on small screens) */}
        <div className="mt-8 flex items-end justify-center lg:absolute lg:right-7 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2 lg:justify-end">
          {renderFan(false)}
        </div>
      </div>
    </button>
  );
}
