"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { StreakFlame } from "@/components/streak/StreakParts";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { getCrystalReveal, subscribeCrystalReveal } from "@/lib/chrono-crystals";
import { getRevealQueue, subscribeReveal } from "@/lib/gem-reveal";
import { dismissStreakReward, getStreakReward, subscribeLearningStreak } from "@/lib/learning-streak";

const NONE: never[] = [];

/** The streak reward celebration, shown over whatever screen paid it. It waits
 *  until any gem or Chrono Crystal reveal has been closed. */
export default function StreakRewardReveal() {
  const router = useRouter();
  const reward = useSyncExternalStore(subscribeLearningStreak, getStreakReward, () => null);
  const gemsWaiting = useSyncExternalStore(subscribeReveal, getRevealQueue, () => NONE).length > 0;
  const crystalShowing = useSyncExternalStore(subscribeCrystalReveal, getCrystalReveal, () => null) !== null;
  if (!reward || gemsWaiting || crystalShowing) return null;

  const { award, streak } = reward;
  const shieldEarned = award.day % 5 === 0;
  const spoken = `${award.day}-day streak! You earned ${award.xp} X P.${shieldEarned ? " You also earned a streak shield." : ""}${streak.nextDay ? ` Next reward on day ${streak.nextDay}.` : ""}`;

  return (
    <div className="fixed inset-0 z-[2147483000] grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="streak-reward-title">
      <div className="w-full max-w-sm rounded-3xl bg-[radial-gradient(90%_60%_at_50%_30%,#6a3410_0%,#2a160a_60%,#140c06_100%)] p-6 text-center text-white shadow-2xl">
        <div className="flex justify-end"><ReadAloudBtn text={spoken} /></div>
        <span className="mx-auto grid h-28 w-28 place-items-center rounded-[32px] bg-gradient-to-b from-orange-400 to-orange-600 text-orange-50 shadow-[0_0_0_10px_rgba(255,154,60,.18)]">
          <StreakFlame className="h-16 w-16" />
        </span>
        <h2 id="streak-reward-title" className="mt-5 text-4xl font-black leading-none">{award.day}-day streak!</h2>
        <p className="mt-2 text-5xl font-black text-amber-300">+{award.xp.toLocaleString()} XP</p>
        <p className="mx-auto mt-3 max-w-xs text-sm font-bold text-white/80">You kept coming back to learn. That’s how explorers get strong at maths.</p>
        {shieldEarned ? (
          <p className="mt-4 flex items-center gap-3 rounded-2xl border border-sky-400/40 bg-sky-950/60 px-4 py-3 text-left text-sm font-bold">
            <ShieldCheck className="h-8 w-8 shrink-0 text-sky-300" aria-hidden="true" />
            <span>You earned a streak shield. If you miss a day, it saves your streak.</span>
          </p>
        ) : null}
        {streak.nextDay ? (
          <p className="mt-3 flex justify-between rounded-xl bg-black/30 px-4 py-2 text-sm font-bold">
            <span className="text-white/70">Next reward</span>
            <span>Day {streak.nextDay} · +{streak.nextXp.toLocaleString()} XP</span>
          </p>
        ) : null}
        <div className="mt-5 grid gap-2">
          <button type="button" onClick={() => { dismissStreakReward(); router.push("/marketplace"); }} className="min-h-12 rounded-2xl bg-amber-300 font-black text-amber-950">Spend my XP</button>
          <button type="button" onClick={dismissStreakReward} className="min-h-12 rounded-2xl border border-white/30 font-bold">Keep learning</button>
        </div>
      </div>
    </div>
  );
}
