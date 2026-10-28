"use client";

import dynamic from "next/dynamic";

const loading = () => <div className="grid min-h-screen place-items-center bg-black font-bold text-amber-100">Opening the portal…</div>;
const GAMES = {
  "time-slope": dynamic(() => import("@/components/chronorok/TimeSlope"), { ssr: false, loading }),
  "rune-blocks": dynamic(() => import("@/components/chronorok/RuneBlocks"), { ssr: false, loading }),
  "relic-rider": dynamic(() => import("@/components/chronorok/RelicRider"), { ssr: false, loading }),
};

export default function ChronorokGameEntry({ game, backHref }: { game: keyof typeof GAMES; backHref: string }) {
  const Game = GAMES[game];
  return <Game backHref={backHref} />;
}
