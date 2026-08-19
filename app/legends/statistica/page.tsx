"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, Sparkles } from "lucide-react";
import BinderCard from "@/components/legends/BinderCard";
import LegendDetailModal from "@/components/legends/LegendDetailModal";
import { getAllLegends, type Legend } from "@/data/legends";
import { YEAR_ORDER } from "@/data/yearOrder";
import { isDemoPreviewMode } from "@/lib/demo-mode";

export default function StatisticaCollectionPage() {
  const router = useRouter();
  const [selectedLegend, setSelectedLegend] = useState<Legend | null>(null);
  const [barAnimated, setBarAnimated] = useState(false);
  const [demoPreview, setDemoPreview] = useState(false);
  const [demoResolved, setDemoResolved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDemoPreview(isDemoPreviewMode());
      setDemoResolved(true);
      setBarAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (demoResolved && !demoPreview) router.replace("/legends");
  }, [demoPreview, demoResolved, router]);

  const legends = useMemo(
    () =>
      getAllLegends("statistica").sort(
        (a, b) => YEAR_ORDER.indexOf(a.yearLabel) - YEAR_ORDER.indexOf(b.yearLabel),
      ),
    [],
  );

  if (!demoResolved || !demoPreview) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#071914] text-[#f7e8bd]">
        <p className="font-semibold">Opening the Data Guardian Archive...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071914]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative h-[540px] w-full">
          <Image
            src="/images/statistica-home-y4.png"
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            quality={90}
            className="object-cover object-center opacity-70"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,25,20,0.2)_0%,rgba(7,25,20,0.78)_46%,#071914_78%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(213,164,47,0.16),transparent_34%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/legends")}
            className="flex items-center gap-1 text-sm font-bold text-[#f4dca2] transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> My Legends
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d5a42f]/35 bg-[#123629]/80 px-4 py-2 text-sm font-bold text-[#ffe7ae] backdrop-blur-md">
            <BarChart3 className="h-4 w-4 text-[#ff6b67]" /> Data Guardian Archive
          </div>
        </div>

        <header className="pb-9 pt-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff7771]">Statistica Realm</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-[#fff8e7] md:text-6xl">
            Data Guardians
          </h1>
          <p className="mt-3 max-w-xl text-base font-medium text-[#d7e4d8] md:text-lg">
            Collect Datara&apos;s evolutions as you learn to gather, organise, represent, and interpret data.
          </p>

          <div className="mt-6 max-w-sm">
            <div className="mb-2 flex items-center justify-between text-sm font-bold">
              <span className="text-[#f6efd9]">{legends.length} / {legends.length} collected</span>
              <span className="text-[#ff7771]">100%</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full border border-[#d5a42f]/35 bg-[#06110e]/80">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#c95050,#ff7771,#d5a42f)] shadow-[0_0_14px_rgba(255,107,103,0.35)] transition-all duration-1000"
                style={{ width: barAnimated ? "100%" : "0%" }}
              />
            </div>
          </div>
        </header>

        <h2 className="mb-5 text-xs font-extrabold tracking-[0.22em] text-[#f0dca9]">CARD BINDER</h2>
        <section className="relative overflow-hidden rounded-[28px] border border-[#d5a42f]/25 bg-[#0c2b21]/80 p-3 shadow-[0_26px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-5 md:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,107,103,0.12),transparent_42%)]" />
          <div className="relative grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {legends.map((legend) => (
              <BinderCard
                key={legend.id}
                legend={legend}
                isUnlocked
                isDemoPreview
                onClick={() => setSelectedLegend(legend)}
              />
            ))}
          </div>
        </section>

        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-[#d5a42f]/25 bg-[#123629]/80 p-5 text-[#e4eee5] backdrop-blur-md">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#ff7771]" />
          <div>
            <p className="font-bold text-[#fff8e7]">How to collect Data Guardians</p>
            <p className="mt-1 text-sm text-[#c7d8ca]">
              Each Datara evolution will be earned by completing its Statistica level when the realm moves from preview into live student release.
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
