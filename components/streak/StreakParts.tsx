"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { STREAK_REWARDS, STREAK_SHIELD_LIMIT, streakPrompt, useLearningStreak, type LearningStreak } from "@/lib/learning-streak";

export function StreakFlame({ className = "h-4 w-4", filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth={2.2} strokeLinejoin="round">
      <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z" />
    </svg>
  );
}

function streakLabel(streak: LearningStreak) {
  return `${streak.streak}-day learning streak${streak.todayDone ? "" : ", not done today"}`;
}

/** Header chip: the streak number, opening Ways to earn XP. */
export function StreakChip({ className = "" }: { className?: string }) {
  const streak = useLearningStreak();
  if (!streak) return null;
  return (
    <Link
      href="/earn-xp"
      aria-label={`${streakLabel(streak)}. See ways to earn XP`}
      title="Ways to earn XP"
      className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-black ${streak.todayDone ? "border-orange-200 bg-orange-50 text-orange-800" : "border-orange-300 bg-white text-orange-700"} ${className}`}
    >
      <StreakFlame className={`h-3.5 w-3.5 ${streak.streak > 0 ? "text-orange-500" : "text-orange-300"}`} filled={streak.todayDone || streak.streak > 0} />
      {streak.streak}
    </Link>
  );
}

/** Home card: the streak, what today's lesson is worth, the ladder and shields. */
export function StreakCard() {
  const streak = useLearningStreak();
  if (!streak) return null;
  const prompt = streakPrompt(streak);
  return (
    <section aria-label="Your learning streak" className="rounded-md border border-orange-300/35 bg-black/45 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-orange-400 to-orange-600 text-orange-50">
          <StreakFlame className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-orange-200/90">Your streak</p>
          <p className="text-2xl font-black leading-tight">{streak.streak} {streak.streak === 1 ? "day" : "days"}</p>
          <p className="text-[11px] font-bold text-white/60">{streak.todayDone ? "Done today. See you tomorrow!" : streak.streak > 0 ? "Keep it going today!" : "Finish a lesson to start one."}</p>
        </div>
      </div>
      {prompt && streak.nextDay ? (
        <p className="mt-3 flex items-center justify-between gap-2 rounded-md bg-amber-300 px-3 py-2 text-sm font-black text-amber-950">
          <span>{prompt}</span>
          <span className="shrink-0">+{streak.nextXp} XP</span>
        </p>
      ) : null}
      <ol className="mt-3 grid grid-cols-5 gap-1" aria-label="Streak rewards">
        {STREAK_REWARDS.map((reward) => {
          const reached = streak.streak >= reward.day;
          const next = streak.nextDay === reward.day;
          return (
            <li key={reward.day} className={`rounded-md border px-1 py-1.5 text-center ${reached ? "border-amber-300 bg-amber-300/15" : next ? "border-dashed border-amber-300" : "border-white/15"}`}>
              <span className={`block text-[10px] font-black ${reached || next ? "text-amber-200" : "text-white/55"}`}>Day {reward.day}</span>
              <span className="block text-xs font-black">+{reward.xp.toLocaleString()}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 flex items-center gap-2 text-[11px] font-bold text-sky-100">
        <ShieldCheck className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
        <span>{streak.shields} of {STREAK_SHIELD_LIMIT} shields. A shield saves your streak if you miss a day. Weekends never break it.</span>
      </p>
      <Link href="/earn-xp" className="mt-2 inline-block text-xs font-black text-amber-200 hover:text-amber-100">Ways to earn XP →</Link>
    </section>
  );
}
