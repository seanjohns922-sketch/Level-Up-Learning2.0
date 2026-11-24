"use client";
// Best scores for one game among the student and their friends (first names only), shown at each game's portal.
// Game scores only, never anything about maths.
import { useEffect, useState } from "react";
import { fetchGameBoard, submitGameBest, type ChronorokGame, type GameBoard } from "@/lib/chronorok-cards";
import { riderTotalStars } from "@/lib/chronorok/relic-rider";

const UNITS: Record<ChronorokGame, string> = { "chrono-run": "m", "time-slope": "m", "rune-blocks": "★", "relic-rider": "★" };

/** The best already on this device (from before scores were saved on the server), so it isn't lost. */
function deviceBest(game: ChronorokGame) {
  try {
    if (game === "chrono-run" || game === "time-slope") return Number(localStorage.getItem(`lul:chronorok:${game}:best`)) || 0;
    const progress = JSON.parse(localStorage.getItem(`lul:chronorok:${game}:progress`) ?? "{}");
    if (game === "rune-blocks") return Object.values((progress.stars ?? {}) as Record<string, number>).reduce((sum, n) => sum + n, 0);
    return riderTotalStars(progress.best ?? {});
  } catch {
    return 0;
  }
}

export function FriendsBoard({ game, colour }: { game: ChronorokGame; colour: string }) {
  const [board, setBoard] = useState<GameBoard | null>(null);
  useEffect(() => {
    let cancelled = false;
    const local = deviceBest(game);
    void fetchGameBoard(game, local).then(async (loaded) => {
      if (!loaded) return;
      // Carry a better device best up to the server once, then show the board again.
      if (local > loaded.myBest) {
        await submitGameBest(game, local).catch(() => undefined);
        loaded = (await fetchGameBoard(game, local)) ?? loaded;
      }
      if (!cancelled) setBoard(loaded);
    });
    return () => { cancelled = true; };
  }, [game]);
  if (!board) return null;
  const unit = UNITS[game];
  return (
    <section aria-label="Best scores among your friends" className="mt-4 text-left">
      <p className="font-display text-[11px] font-black tracking-[0.18em]" style={{ color: colour }}>BEST AMONG YOUR FRIENDS</p>
      {board.top.length ? (
        <ol className="mt-2 grid gap-1.5">
          {board.top.map((row, index) => (
            <li key={row.studentId} className={`flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-bold ${row.me ? "bg-amber-300/20 ring-1 ring-amber-300" : "bg-white/[.06]"}`}>
              <span className="w-5 font-display font-black text-amber-300">{index + 1}</span>
              <span className="flex-1 truncate">{row.me ? "You" : row.name}</span>
              <span className="font-display font-black tabular-nums">{row.best.toLocaleString()} {unit}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-sm font-bold text-[#e8dcc8]">No scores yet. Play to set one, and add friends to race them.</p>
      )}
      {board.top.length && !board.top.some((row) => row.me) && board.myBest > 0 ? <p className="mt-1.5 text-xs font-bold text-[#e8dcc8]">Your best: {board.myBest.toLocaleString()} {unit}</p> : null}
    </section>
  );
}
