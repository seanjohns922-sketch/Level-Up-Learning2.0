"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2, Swords, Zap } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { StreakFlame } from "@/components/streak/StreakParts";
import { STREAK_REPEAT_XP, STREAK_REWARDS, useLearningStreak } from "@/lib/learning-streak";
import { BRAIN_BREAK_XP_CAP, LESSON_XP, QUIZ_PASS_XP } from "@/lib/xp-rules";

const WAYS = [
  { icon: BookOpen, title: "Finish a lesson", detail: "The first time you finish it", xp: `+${LESSON_XP}` },
  { icon: CheckCircle2, title: "Pass a weekly quiz", detail: "Score 80% or more", xp: `+${QUIZ_PASS_XP}` },
  { icon: Zap, title: "Win a brain break", detail: "During your lessons", xp: `up to +${BRAIN_BREAK_XP_CAP}` },
];

const SPOKEN = [
  "Ways to earn X P. You spend X P on homes, rides, pets and more in your world.",
  `Keep a streak: do a lesson or quiz each day. Weekends never break it. ${STREAK_REWARDS.map((r) => `Day ${r.day}, ${r.xp} X P.`).join(" ")} After that, ${STREAK_REPEAT_XP} X P every fifth day.`,
  ...WAYS.map((way) => `${way.title}. ${way.detail}. ${way.xp.replace("+", "")} X P.`),
  "Friend battles are coming soon.",
].join(" ");

export default function EarnXpPage() {
  const router = useRouter();
  const streak = useLearningStreak();
  return (
    <main className="min-h-screen bg-[#17110b] px-5 py-5 text-[#f6efe4]">
      <div className="mx-auto flex max-w-xl flex-col gap-5">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => router.back()} aria-label="Back" className="grid h-11 w-11 place-items-center rounded-xl bg-[#2a1f14]">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <ReadAloudBtn text={SPOKEN} label="Read this page" />
        </div>

        <header>
          {streak ? <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">Your streak: {streak.streak} {streak.streak === 1 ? "day" : "days"}</p> : null}
          <h1 className="mt-1 text-4xl font-black leading-tight">Ways to earn XP</h1>
          <p className="mt-1 font-semibold text-[#d8c8b0]">Spend it on homes, rides, pets and more in your world.</p>
        </header>

        <section aria-label="Keep a streak" className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-700 p-4 text-white">
          <div className="flex items-center gap-2">
            <StreakFlame className="h-7 w-7 text-orange-50" />
            <h2 className="text-xl font-black">Keep a streak</h2>
            <span className="ml-auto rounded-full bg-black/25 px-3 py-1 text-xs font-black">Biggest!</span>
          </div>
          <p className="mt-2 text-sm font-semibold">Do a lesson or quiz each day. Weekends never break it, and shields save a missed day.</p>
          <ol className="mt-3 grid grid-cols-5 gap-1.5">
            {STREAK_REWARDS.map((reward) => (
              <li key={reward.day} className={`rounded-xl px-1 py-2 text-center ${streak && streak.streak >= reward.day ? "bg-black/40" : "bg-black/20"}`}>
                <span className="block text-[11px] font-bold">Day {reward.day}</span>
                <span className="block text-sm font-black">+{reward.xp.toLocaleString()}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs font-bold text-orange-50/90">After day 30: +{STREAK_REPEAT_XP} every 5th day.</p>
        </section>

        <ul className="flex flex-col gap-2.5">
          {WAYS.map((way) => (
            <li key={way.title} className="flex items-center gap-3.5 rounded-2xl bg-[#241a10] px-4 py-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#3a2a16] text-amber-300"><way.icon className="h-5 w-5" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-black">{way.title}</span>
                <span className="block text-sm font-semibold text-[#b9a990]">{way.detail}</span>
              </span>
              <span className="shrink-0 font-black text-amber-300">{way.xp}</span>
            </li>
          ))}
          <li className="flex items-center gap-3.5 rounded-2xl border border-dashed border-violet-400/50 bg-[#1d1a24] px-4 py-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#2c2640] text-violet-300"><Swords className="h-5 w-5" aria-hidden="true" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-black">Friend battles</span>
              <span className="block text-sm font-semibold text-violet-200/80">Coming soon</span>
            </span>
          </li>
        </ul>
      </div>
    </main>
  );
}
