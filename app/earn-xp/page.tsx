"use client";

import { useRouter } from "next/navigation";
import { BATTLE_PLAY_XP, BATTLE_WIN_XP } from "@/lib/battles";
import { ArrowLeft, BookOpen, CheckCircle2, Crown, Flag, Swords, Target, Trophy, Zap } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { StreakFlame } from "@/components/streak/StreakParts";
import { STREAK_REPEAT_XP, STREAK_REWARDS, useLearningStreak } from "@/lib/learning-streak";
import { BRAIN_BREAK_XP_CAP, LESSON_XP, QUIZ_PASS_XP } from "@/lib/xp-rules";
import { REX_XP } from "@/lib/rex";
import { ACCURACY_XP, LEVEL_CLEARED_XP, QUEST_ALL_BONUS_XP, WEEK_CLEARED_XP } from "@/lib/xp-quests";

const WAYS = [
  { icon: Target, title: "Daily quests", detail: `Three new ones every day, in the hub. Do all three for +${QUEST_ALL_BONUS_XP} more`, xp: "+20 to +30" },
  { icon: BookOpen, title: "Finish a lesson", detail: "The first time you finish it", xp: `+${LESSON_XP}` },
  { icon: Trophy, title: "Get it right first go", detail: `In a new lesson: every answer right +${ACCURACY_XP.perfect}, or 80% or more +${ACCURACY_XP.good}`, xp: `up to +${ACCURACY_XP.perfect}` },
  { icon: Flag, title: "Clear a week", detail: "Finish all 3 lessons of a week in a realm", xp: `+${WEEK_CLEARED_XP}` },
  { icon: Crown, title: "Clear a level", detail: "Finish a level's end-of-level test in a realm", xp: `+${LEVEL_CLEARED_XP.toLocaleString()}` },
  { icon: CheckCircle2, title: "Pass a weekly quiz", detail: "Score 80% or more", xp: `+${QUIZ_PASS_XP}` },
  { icon: Zap, title: "Win a brain break", detail: "During your lessons", xp: `up to +${BRAIN_BREAK_XP_CAP}` },
  { icon: Swords, title: "Win a friend battle", detail: `+${BATTLE_PLAY_XP} just for playing, in the Battle Arena`, xp: `+${BATTLE_WIN_XP}` },
  { icon: Zap, title: "Answer Rex", detail: "When the maths T-rex visits your hub", xp: `+${REX_XP}` },
];

const SPOKEN = [
  "Ways to earn X P. You spend X P on homes, rides, pets and more in your world.",
  `Keep a streak: do a lesson or quiz each day. Weekends never break it. ${STREAK_REWARDS.map((r) => `Day ${r.day}, ${r.xp} X P.`).join(" ")} After that, ${STREAK_REPEAT_XP} X P every fifth day.`,
  ...WAYS.map((way) => `${way.title}. ${way.detail}. ${way.xp.replaceAll("+", "")} X P.`),
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
        </ul>
      </div>
    </main>
  );
}
