"use client";
// Parent dashboard: a Chronorok the child awakened whose physical card hasn't been handed over yet.
// Adult styling (black, white, lime). Stays until the parent taps CARD HANDED OVER.
import Image from "next/image";
import { useEffect, useState } from "react";
import { DEMO_CHRONOROK, cardById, fetchChronorokFor, markCardHandedOver, type OwnedCard } from "@/lib/chronorok-cards";

const HOW: Record<OwnedCard["how"], string> = {
  awakened: "learned on 100 days in a school year",
  catch_up: "woke it up with their first 100 learning days",
  bought: "unlocked it with XP",
};

export function ParentChronorokHandOver({ studentId, firstName, preview }: { studentId: string; firstName: string; preview: boolean }) {
  const [waiting, setWaiting] = useState<OwnedCard[]>(() => (preview ? DEMO_CHRONOROK.cards.filter((card) => !card.handedOver) : []));
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (preview) return;
    let active = true;
    fetchChronorokFor(studentId)
      .then((state) => { if (active) setWaiting(state?.cards.filter((card) => !card.handedOver) ?? []); })
      // Before the migration is applied the card stays hidden.
      .catch(() => { if (active) setWaiting([]); });
    return () => { active = false; };
  }, [studentId, preview]);

  const next = waiting[0];
  const card = next ? cardById(next.cardId) : null;
  if (!next || !card) return null;

  async function handedOver() {
    setBusy(true);
    try {
      if (!preview) await markCardHandedOver(studentId, next.cardId);
      setWaiting((list) => list.slice(1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="A Chronorok card to hand over" className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
      <Image src={card.images.cardFront} alt={`${card.name} card`} width={96} height={134} className="h-auto w-24 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-xl font-black">{firstName} awakened {card.name}!</h3>
        <p className="mt-1 text-slate-700">{firstName} {HOW[next.how]}. Give them the {card.name.replace("Chronorok ", "")} card from their RELIQ pack.{waiting.length > 1 ? ` ${waiting.length - 1} more to hand over after this one.` : ""}</p>
        <button type="button" disabled={busy} onClick={() => void handedOver()} className="mt-3 rounded-xl bg-[var(--reliq-lime)] px-4 py-2.5 font-display text-sm font-black text-[#121314] disabled:opacity-60">CARD HANDED OVER</button>
      </div>
    </section>
  );
}
