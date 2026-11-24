"use client";
// The Chronorok that comes along in the games: chosen from the cards the student has awakened, shown as a badge in
// the corner (it cheers on a new best), and its colour goes to the game piece. Looks only: scores stay fair.
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { CHRONOROKS } from "@/lib/chronorok";
import { CHRONOROK_COLOURS, CompanionContext, cardById, readCompanion, saveCompanion, shortName, useChronorok, useCompanionCheer } from "@/lib/chronorok-cards";

export function CompanionProvider({ children }: { children: ReactNode }) {
  const { state } = useChronorok();
  const owned = (state?.cards ?? []).map((card) => card.cardId);
  const [chosen, setChosen] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const saved = chosen ?? readCompanion();
  // The last one picked, or the newest grade they own.
  const cardId = saved && owned.includes(saved) ? saved : owned.length ? owned[owned.length - 1] : null;
  const choose = (id: string) => { setChosen(id); saveCompanion(id); setPicking(false); };
  if (!cardId) return <>{children}</>;
  return (
    <CompanionContext.Provider value={{ cardId, colour: CHRONOROK_COLOURS[cardId] ?? "#ffd84a" }}>
      {children}
      <div className="chronoGame">
        <CompanionBadge cardId={cardId} onPick={() => setPicking(true)} />
        {picking ? <CompanionPicker owned={owned} current={cardId} onChoose={choose} onClose={() => setPicking(false)} /> : null}
      </div>
    </CompanionContext.Provider>
  );
}

const CHEERS = ["New best!", "Amazing!", "You did it!", "Unstoppable!"];

function CompanionBadge({ cardId, onPick }: { cardId: string; onPick: () => void }) {
  const card = cardById(cardId);
  const cheer = useCompanionCheer();
  const [shouting, setShouting] = useState<string | null>(null);
  useEffect(() => {
    if (!cheer) return;
    const show = window.setTimeout(() => setShouting(CHEERS[cheer % CHEERS.length]), 0);
    const hide = window.setTimeout(() => setShouting(null), 2600);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, [cheer]);
  if (!card) return null;
  const colour = CHRONOROK_COLOURS[cardId];
  return (
    <button type="button" onClick={onPick} aria-label={`${card.name} is with you. Choose a different Chronorok`} className="chronoGlass fixed bottom-4 left-4 z-40 flex items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-3 text-left text-[#fff4e0]" style={{ borderColor: colour }}>
      <span className="relative h-12 w-12 overflow-hidden rounded-xl" style={{ boxShadow: `0 0 0 2px ${colour}` }}>
        <Image src={card.images.avatar} alt="" fill sizes="48px" className="object-cover object-[50%_25%]" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-sm font-black tracking-wide">{shortName(cardId).toUpperCase()}</span>
        <span className="block text-[11px] font-bold text-[#e8dcc8]">{shouting ?? "With you · tap to swap"}</span>
      </span>
      {shouting ? <span className="absolute -top-9 left-2 rounded-full px-3 py-1 font-display text-sm font-black text-[#1a1006]" style={{ background: colour }}>{shouting}</span> : null}
    </button>
  );
}

function CompanionPicker({ owned, current, onChoose, onClose }: { owned: string[]; current: string; onChoose: (id: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="companion-title">
      <div className="chronoGlass w-[min(520px,94vw)] rounded-3xl p-6 text-center text-[#fff4e0]">
        <h2 id="companion-title" className="chronoTitle text-2xl">WHO&apos;S COMING WITH YOU?</h2>
        <p className="mt-1 text-sm font-bold text-[#e8dcc8]">Your Chronorok joins every game in its own colour.</p>
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-7">
          {CHRONOROKS.map((card) => {
            const mine = owned.includes(card.id);
            const colour = CHRONOROK_COLOURS[card.id];
            return (
              <button key={card.id} type="button" disabled={!mine} onClick={() => onChoose(card.id)} aria-pressed={card.id === current} aria-label={mine ? `Choose ${card.name}` : `${card.name}, not awakened yet`} className="flex flex-col items-center gap-1 disabled:opacity-40">
                <span className={`relative h-14 w-14 overflow-hidden rounded-xl ${mine ? "" : "grayscale"}`} style={{ boxShadow: card.id === current ? `0 0 0 3px ${colour}, 0 0 14px ${colour}` : "0 0 0 1px rgba(255,255,255,.25)" }}>
                  <Image src={card.images.avatar} alt="" fill sizes="56px" className="object-cover object-[50%_25%]" />
                  {mine ? null : <Lock className="absolute inset-0 m-auto h-5 w-5 text-white" aria-hidden="true" />}
                </span>
                <span className="text-[11px] font-black">{shortName(card.id)}</span>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={onClose} className="mt-5 h-12 rounded-full bg-white px-8 font-display text-sm font-black text-[#16121f]">DONE</button>
      </div>
    </div>
  );
}
