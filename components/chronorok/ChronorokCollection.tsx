"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { CHRONOROK_CARDS } from "@/data/chronorok-artwork";
import { CRYSTALS_TO_AWAKEN, gradeName } from "@/lib/chronorok";
import { useChronorokProgress } from "@/lib/useChronorokProgress";

export default function ChronorokCollection() {
  const { preview, progress, chronorok, grade, loading, error, signedIn } = useChronorokProgress();
  const [backs, setBacks] = useState<Record<string, boolean>>({});
  const suffix = preview ? "?teacher_preview=1" : "";
  const instructions = `Earn one Chrono Crystal for each day you finish a lesson or quiz. Collect ${CRYSTALS_TO_AWAKEN} in a school year to awaken your grade’s Chronorok. Tap a card to see its back.`;
  return (
    <main className="min-h-screen bg-[#201526] px-5 py-6 text-amber-50 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap justify-between gap-4 font-bold"><Link className="py-3" href={`/legends${suffix}`}>← My RELIQS</Link><Link className="py-3" href={`/world/chronorok${suffix}`}>Enter Chronorok →</Link></nav>
        <header className="my-6 rounded-3xl border border-amber-200/25 bg-black/25 p-6 sm:flex sm:items-center sm:gap-6">
          {grade ? <Image src={chronorok.images.avatar} alt={chronorok.name} width={180} height={180} className="mx-auto h-40 w-44 shrink-0 object-contain" priority /> : null}
          <div><p className="text-sm font-bold uppercase tracking-widest text-amber-300">The realm of time</p><h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">Chronorok RELIQS</h1><p className="mt-3 max-w-2xl">{instructions}</p><ReadAloudBtn text={instructions} label="Listen" className="mt-3" />
          <p role="status" className="mt-3 font-bold text-amber-200">{loading ? "Loading your Chrono Crystals…" : error ? error : preview ? "Teacher preview · explore all seven cards" : !signedIn ? "Sign in to see your Chrono Crystals." : `${gradeName(grade)} · ${progress?.crystals ?? 0} / ${CRYSTALS_TO_AWAKEN} crystals this year · ${chronorok.name}${(progress?.crystals ?? 0) >= CRYSTALS_TO_AWAKEN ? " awakened!" : " awaits"}`}</p></div>
        </header>
        <div className="grid grid-cols-1 gap-7 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {CHRONOROK_CARDS.map(card => {
            const current = grade !== null && card.id === chronorok.id;
            const earned = current && (progress?.crystals ?? 0) >= CRYSTALS_TO_AWAKEN;
            return <article key={card.id} className="rounded-2xl border border-amber-200/20 bg-black/20 p-4">
              <button type="button" className="mx-auto block w-full max-w-[280px] rounded-xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-amber-300" onClick={() => setBacks(old => ({ ...old, [card.id]: !old[card.id] }))} aria-label={`Show ${backs[card.id] ? "front" : "back"} of ${card.name} card`}>
                <Image src={backs[card.id] ? card.images.cardBack : card.images.cardFront} alt={`${card.name} RELIQ card ${backs[card.id] ? "back" : "front"}`} width={1008} height={1408} sizes="(max-width: 439px) 280px, (max-width: 767px) 45vw, 280px" className="h-auto w-full rounded-lg object-contain" />
              </button>
              <h2 className="mt-4 font-display text-xl font-black">{card.name}</h2><p className="text-sm text-amber-100/80">{card.grade === "Year 6" ? "Grade 6 and above" : gradeName(card.grade)}</p>
              <p className="mt-2 text-sm font-bold text-amber-300">{preview ? "Preview" : earned ? "Awakened this year" : current ? `${Math.max(0, CRYSTALS_TO_AWAKEN - (progress?.crystals ?? 0))} more crystals to awaken` : "Card preview"}</p>
            </article>;
          })}
        </div>
      </div>
    </main>
  );
}
