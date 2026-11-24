"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { CHRONOROK_CARDS } from "@/data/chronorok-artwork";
import { CRYSTALS_TO_AWAKEN, gradeName } from "@/lib/chronorok";
import { buyChronorokCard, buyableCards, type ChronorokState, type OwnedCard } from "@/lib/chronorok-cards";
import { useChronorokProgress } from "@/lib/useChronorokProgress";

const HOW: Record<OwnedCard["how"], string> = { awakened: "Awakened", catch_up: "Woke up with your first 100", bought: "Unlocked with XP" };

/** What a card says under it: kept (with its year), this year's count, or how it can still be won. */
function cardStatus(cardId: string, index: number, state: ChronorokState | null, owned: OwnedCard | undefined) {
  if (owned) return `${HOW[owned.how]} · ${owned.year}`;
  if (!state || state.gradeIndex === null) return "Card preview";
  if (index === state.gradeIndex) return `${Math.max(0, CRYSTALS_TO_AWAKEN - state.crystals)} more crystals to awaken`;
  if (index > state.gradeIndex) return `Awakens in ${index === 6 ? "Grade 6" : gradeName(CHRONOROK_CARDS[index].grade)}`;
  return state.cards.length ? "Missed. Unlock it with XP" : "Wakes up with your first 100 crystals";
}

export default function ChronorokCollection() {
  const { preview, progress, chronorok, grade, loading, error, signedIn, cards: state } = useChronorokProgress();
  const [backs, setBacks] = useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const suffix = preview ? "?teacher_preview=1" : "";
  const owned = new Map((state?.cards ?? []).map((card) => [card.cardId, card]));
  const buyable = new Set(state ? buyableCards(state).map((card) => card.id) : []);
  const instructions = `Earn one Chrono Crystal for each day you finish a lesson or quiz. Collect ${CRYSTALS_TO_AWAKEN} in a school year to awaken your grade’s Chronorok, and keep it for good. Your first ${CRYSTALS_TO_AWAKEN} wakes up the earlier grades too. Tap a card to see its back.`;

  async function unlock(cardId: string) {
    setBuying(true);
    setMessage(null);
    try {
      await buyChronorokCard(cardId);
      setMessage(`${CHRONOROK_CARDS.find((card) => card.id === cardId)?.name} is yours!`);
    } catch (problem) {
      setMessage(problem instanceof Error ? problem.message : "That didn't work just now.");
    } finally {
      setBuying(false);
      setConfirming(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#201526] px-5 py-6 text-amber-50 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap justify-between gap-4 font-bold"><Link className="py-3" href={`/legends${suffix}`}>← My RELIQS</Link><Link className="py-3" href={`/world/chronorok${suffix}`}>Enter Chronorok →</Link></nav>
        <header className="my-6 rounded-3xl border border-amber-200/25 bg-black/25 p-6 sm:flex sm:items-center sm:gap-6">
          {grade ? <Image src={chronorok.images.avatar} alt={chronorok.name} width={180} height={180} className="mx-auto h-40 w-44 shrink-0 object-contain" priority /> : null}
          <div><p className="text-sm font-bold uppercase tracking-widest text-amber-300">The realm of time</p><h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">Chronorok RELIQS</h1><p className="mt-3 max-w-2xl">{instructions}</p><ReadAloudBtn text={instructions} label="Listen" className="mt-3" />
          <p role="status" className="mt-3 font-bold text-amber-200">{loading ? "Loading your Chrono Crystals…" : error ? error : !signedIn && !preview ? "Sign in to see your Chrono Crystals." : `${gradeName(grade)} · ${progress?.crystals ?? 0} / ${CRYSTALS_TO_AWAKEN} crystals this year · ${owned.size} of ${CHRONOROK_CARDS.length} Chronoroks kept${preview ? " · demo" : ""}`}</p>
          {message ? <p role="status" className="mt-2 font-bold text-[#7dff8a]">{message}</p> : null}</div>
        </header>
        <div className="grid grid-cols-1 gap-7 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {CHRONOROK_CARDS.map((card, index) => {
            const mine = owned.get(card.id);
            const canBuy = buyable.has(card.id);
            return <article key={card.id} className={`rounded-2xl border p-4 ${mine ? "border-amber-300/60 bg-black/30" : "border-amber-200/15 bg-black/20"}`}>
              <button type="button" className="relative mx-auto block w-full max-w-[280px] rounded-xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-amber-300" onClick={() => setBacks(old => ({ ...old, [card.id]: !old[card.id] }))} aria-label={`Show ${backs[card.id] ? "front" : "back"} of ${card.name} card`}>
                <Image src={backs[card.id] ? card.images.cardBack : card.images.cardFront} alt={`${card.name} RELIQ card ${backs[card.id] ? "back" : "front"}`} width={1008} height={1408} sizes="(max-width: 439px) 280px, (max-width: 767px) 45vw, 280px" className={`h-auto w-full rounded-lg object-contain ${mine || backs[card.id] ? "" : "brightness-[.45] grayscale"}`} />
                {mine ? <span className="absolute right-2 top-[18%] rotate-[8deg] rounded-md bg-amber-300 px-2.5 py-1 font-display text-xs font-black tracking-wider text-amber-950 shadow-lg">{mine.year}</span> : null}
              </button>
              <h2 className="mt-4 font-display text-xl font-black">{card.name}</h2><p className="text-sm text-amber-100/80">{card.grade === "Year 6" ? "Grade 6 and above" : gradeName(card.grade)}</p>
              <p className="mt-2 text-sm font-bold text-amber-300">{cardStatus(card.id, index, state, mine)}</p>
              {canBuy ? (
                confirming === card.id ? (
                  <div className="mt-3 rounded-xl border border-amber-300/40 bg-black/40 p-3">
                    <p className="text-sm font-bold">Spend {(state?.buyXp ?? 5000).toLocaleString()} XP to unlock {card.name}?</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" disabled={buying} onClick={() => void unlock(card.id)} className="min-h-11 flex-1 rounded-xl bg-amber-300 font-display text-sm font-black text-amber-950">{buying ? "UNLOCKING…" : "YES, UNLOCK"}</button>
                      <button type="button" disabled={buying} onClick={() => setConfirming(null)} className="min-h-11 rounded-xl border border-white/30 px-4 font-bold">Not now</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirming(card.id)} className="mt-3 min-h-11 w-full rounded-xl bg-amber-300/15 font-display text-sm font-black text-amber-200 ring-1 ring-amber-300/60">UNLOCK FOR {(state?.buyXp ?? 5000).toLocaleString()} XP</button>
                )
              ) : null}
            </article>;
          })}
        </div>
      </div>
    </main>
  );
}
