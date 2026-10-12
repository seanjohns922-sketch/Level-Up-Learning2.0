"use client";

import VaultHeader from "@/components/legends/VaultHeader";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Dices, Sparkles } from "lucide-react";
import BinderCard from "@/components/legends/BinderCard";
import LegendDetailModal from "@/components/legends/LegendDetailModal";
import { getAllLegends, getEffectiveUnlockedLegendIds, type Legend } from "@/data/legends";
import { readProgress, type StudentProgress } from "@/data/progress";
import { YEAR_ORDER } from "@/data/yearOrder";
import { isDemoPreviewMode } from "@/lib/demo-mode";

export default function ChanceHollowCollectionPage() {
  const router = useRouter();
  const [selectedLegend, setSelectedLegend] = useState<Legend | null>(null);
  const [barAnimated, setBarAnimated] = useState(false);
  const [demoPreview, setDemoPreview] = useState(false);
  const [demoResolved, setDemoResolved] = useState(false);
  const [progress, setProgress] = useState<StudentProgress | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDemoPreview(isDemoPreviewMode());
      setProgress(readProgress("chance"));
      setDemoResolved(true);
      setBarAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const legends = useMemo(
    () =>
      getAllLegends("chance-hollow").sort(
        (a, b) => YEAR_ORDER.indexOf(a.yearLabel) - YEAR_ORDER.indexOf(b.yearLabel),
      ),
    [],
  );
  const unlockedIds = useMemo(
    () => getEffectiveUnlockedLegendIds(progress?.year, progress?.unlockedLegends, "chance-hollow"),
    [progress],
  );
  const visibleUnlockedIds = demoPreview ? legends.map((legend) => legend.id) : unlockedIds;
  const collectedCount = legends.filter((legend) => visibleUnlockedIds.includes(legend.id)).length;

  if (!demoResolved) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#17111b] text-[#fff7ed]">
        <p className="font-semibold">Opening Chance Hollow...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#17111b]">
      <div className="pointer-events-none absolute inset-0">
        <div className="relative h-[580px] w-full">
          <Image
            src="/images/chancehollow-home-y3.jpeg"
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            quality={90}
            className="object-cover object-center opacity-80"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,17,27,0.16)_0%,rgba(23,17,27,0.78)_48%,#17111b_80%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(251,191,36,0.18),transparent_36%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(demoPreview ? "/legends?teacher_preview=1" : "/legends")}
            className="flex items-center gap-1 text-sm font-bold text-rose-100 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> My RELIQS
          </button>
          <div className="inline-flex items-center gap-2 border border-rose-300/30 bg-[#301b27]/85 px-4 py-2 text-sm font-bold text-rose-50 backdrop-blur-md">
            <Dices className="h-4 w-4 text-[#fbbf24]" /> Chance Hollow
          </div>
        </div>

        <VaultHeader realm="chance-hollow" name="Chance Hollow" collection="Chanzia Collection" description={"Meet the Fortune Seekers as they explore chance, outcomes and possibility."} collected={collectedCount} total={legends.length} animated={barAnimated} preview={demoPreview} />

        <h2 className="mb-5 text-xs font-extrabold tracking-[0.22em] text-rose-100">
          THE COLLECTION
        </h2>
        <section className="relative overflow-hidden rounded-[28px] border border-rose-300/20 bg-[#211421]/85 p-3 shadow-[0_26px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-5 md:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.14),transparent_42%)]" />
          <div className="relative grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {legends.map((legend) => (
              <BinderCard
                key={legend.id}
                legend={legend}
                isUnlocked={visibleUnlockedIds.includes(legend.id)}
                isDemoPreview={demoPreview}
                onClick={() => setSelectedLegend(legend)}
              />
            ))}
          </div>
        </section>

        <div className="mt-10 flex items-start gap-3 border border-rose-300/20 bg-[#301b27]/85 p-5 text-white/80 backdrop-blur-md">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#fbbf24]" />
          <div>
            <p className="font-bold text-white">How to collect Chanzia</p>
            <p className="mt-1 text-sm text-white/65">
              Complete Chance Hollow Level 3 to unlock the first Chanzia RELIQ card and video.
            </p>
          </div>
        </div>
      </div>

      {selectedLegend ? (
        <LegendDetailModal legend={selectedLegend} onClose={() => setSelectedLegend(null)} />
      ) : null}
    </main>
  );
}
