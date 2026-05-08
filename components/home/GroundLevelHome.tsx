"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, Sparkles, LogOut, Star, Leaf, Flower2 } from "lucide-react";

type Lesson = { id: string; lesson: number; title: string };

type Props = {
  week: number;
  topic?: string;
  lessons: Lesson[];
  lessonsDone: number;
  studentName?: string;
  onBack: () => void;
  onLogout: () => void;
  onContinue: () => void;
};

const LESSON_ICONS = [
  // Lesson 1 — number stones / dots cluster
  (props: { className?: string }) => (
    <svg viewBox="0 0 48 48" className={props.className} fill="none">
      <circle cx="14" cy="16" r="5" fill="#fde68a" />
      <circle cx="28" cy="14" r="5" fill="#fcd34d" />
      <circle cx="20" cy="30" r="5" fill="#fbbf24" />
      <circle cx="34" cy="30" r="5" fill="#f59e0b" />
    </svg>
  ),
  // Lesson 2 — counting basket (3 berries)
  (props: { className?: string }) => (
    <svg viewBox="0 0 48 48" className={props.className} fill="none">
      <circle cx="16" cy="18" r="5" fill="#fb7185" />
      <circle cx="26" cy="16" r="5" fill="#f472b6" />
      <circle cx="22" cy="26" r="5" fill="#ec4899" />
      <path d="M8 28 L40 28 L34 40 L14 40 Z" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
      <path d="M8 28 L40 28" stroke="#fef3c7" strokeWidth="1.5" />
    </svg>
  ),
  // Lesson 3 — speaking number bubble
  (props: { className?: string }) => (
    <svg viewBox="0 0 48 48" className={props.className} fill="none">
      <path d="M8 10 H40 A4 4 0 0 1 44 14 V30 A4 4 0 0 1 40 34 H22 L14 42 V34 H8 A4 4 0 0 1 4 30 V14 A4 4 0 0 1 8 10 Z" fill="#a7f3d0" stroke="#065f46" strokeWidth="1.5" />
      <text x="24" y="28" textAnchor="middle" fontSize="16" fontWeight="900" fill="#065f46">3</text>
    </svg>
  ),
];

export default function GroundLevelHome({
  week,
  topic,
  lessons,
  lessonsDone,
  studentName,
  onBack,
  onLogout,
  onContinue,
}: Props) {
  const router = useRouter();
  const displayName = studentName || "Adventurer";
  const totalLessons = lessons.length || 3;
  const allDone = lessonsDone >= totalLessons;
  const progressPct = Math.round((lessonsDone / Math.max(totalLessons, 1)) * 100);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Soft Number Grove background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, #bbf7d0 0%, transparent 55%), radial-gradient(circle at 85% 15%, #a7f3d0 0%, transparent 50%), radial-gradient(circle at 50% 90%, #fef3c7 0%, transparent 55%), linear-gradient(180deg, #ecfdf5 0%, #d1fae5 50%, #fef9c3 100%)",
          }}
        />
        {/* floating soft dots */}
        <div className="absolute inset-0 pointer-events-none opacity-70">
          {[
            { l: "8%", t: "18%", n: "1", c: "#10b981" },
            { l: "82%", t: "22%", n: "2", c: "#f59e0b" },
            { l: "14%", t: "62%", n: "3", c: "#14b8a6" },
            { l: "76%", t: "70%", n: "4", c: "#ec4899" },
            { l: "46%", t: "10%", n: "5", c: "#22c55e" },
          ].map((d, i) => (
            <div
              key={i}
              className="absolute h-12 w-12 rounded-full flex items-center justify-center font-black text-white text-xl shadow-lg"
              style={{
                left: d.l,
                top: d.t,
                background: d.c,
                boxShadow: `0 8px 24px ${d.c}55, inset 0 -4px 8px rgba(0,0,0,0.12), inset 0 4px 8px rgba(255,255,255,0.35)`,
                opacity: 0.35,
              }}
            >
              {d.n}
            </div>
          ))}
        </div>
        {/* warm vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, transparent 50%, rgba(20,83,45,0.18) 100%)",
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 max-w-2xl mx-auto px-5 pt-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-full font-extrabold text-xs text-emerald-800 border-2 border-emerald-300 bg-white/85 hover:bg-white hover:border-emerald-400 transition active:scale-[0.97] shadow-sm"
            aria-label="Back"
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-extrabold text-emerald-800 border-2 border-emerald-300 bg-white/85 hover:bg-white hover:border-emerald-400 transition active:scale-[0.97] shadow-sm"
              type="button"
              aria-label="Profile"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="truncate max-w-[140px]">{displayName}</span>
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-full text-emerald-800 border-2 border-emerald-300 bg-white/85 hover:bg-white hover:border-emerald-400 transition active:scale-[0.97] shadow-sm"
              type="button"
              aria-label="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-3 rounded-full bg-white/85 border-2 border-emerald-300 shadow-sm">
            <Leaf className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-800">
              Ground Level · Number Grove
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl font-black text-emerald-900 tracking-tight leading-none mb-2"
            style={{ textShadow: "0 2px 0 rgba(255,255,255,0.6)" }}
          >
            Week {week}
          </h1>
          {topic && (
            <p className="text-base font-bold text-emerald-800/80 mb-3">{topic}</p>
          )}
          <p className="text-xs font-extrabold text-emerald-700/80 uppercase tracking-[0.16em] mb-3">
            {lessonsDone} / {totalLessons} lessons completed
          </p>

          {/* Progress bar */}
          <div className="max-w-xs mx-auto h-3 rounded-full bg-white/70 border-2 border-emerald-200 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #34d399 0%, #10b981 50%, #fbbf24 100%)",
              }}
            />
          </div>
        </div>

        {/* Motivation banner */}
        <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 mb-4 shadow-sm flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Flower2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 mb-0.5">
              Today&apos;s Adventure
            </p>
            <p className="text-sm font-bold text-amber-900 leading-snug">
              {allDone
                ? "Amazing! Finish the weekly quiz to wake up Numbot Bouncer!"
                : "Complete your lessons to unlock Numbot Bouncer!"}
            </p>
          </div>
        </div>

        {/* Lesson cards */}
        <div className="grid gap-3 pb-12">
          {lessons.slice(0, 3).map((lesson, i) => {
            const done = i < lessonsDone;
            const current = i === lessonsDone;
            const locked = i > lessonsDone;
            const Icon = LESSON_ICONS[i] || LESSON_ICONS[0];
            return (
              <button
                key={lesson.id}
                onClick={current ? onContinue : undefined}
                disabled={!current}
                type="button"
                className={`relative w-full text-left rounded-3xl border-2 p-4 transition active:scale-[0.99] flex items-center gap-4 ${
                  done
                    ? "border-emerald-300 bg-emerald-50/90"
                    : current
                    ? "border-emerald-400 bg-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
                    : "border-emerald-200/70 bg-white/60 opacity-70"
                }`}
              >
                {/* Big number badge */}
                <div
                  className={`flex-shrink-0 h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md ${
                    done
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
                      : current
                      ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white"
                      : "bg-gradient-to-br from-stone-200 to-stone-300 text-stone-500"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-8 w-8" /> : lesson.lesson}
                </div>

                {/* Icon + title */}
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <Icon className={`h-12 w-12 flex-shrink-0 ${locked ? "opacity-40 grayscale" : ""}`} />
                  <div className="min-w-0">
                    <p className={`text-base font-extrabold truncate ${locked ? "text-stone-500" : "text-emerald-900"}`}>
                      {lesson.title}
                    </p>
                    <p
                      className={`text-xs font-bold mt-0.5 ${
                        done
                          ? "text-emerald-600"
                          : current
                          ? "text-amber-600"
                          : "text-stone-400"
                      }`}
                    >
                      {done
                        ? "Done!"
                        : current
                        ? "Start here →"
                        : `Finish Lesson ${lesson.lesson - 1} first`}
                    </p>
                  </div>
                </div>

                {locked && <Lock className="h-5 w-5 text-stone-400 flex-shrink-0" />}
              </button>
            );
          })}

          {/* Quiz card */}
          <div
            className={`relative w-full rounded-3xl border-2 p-4 flex items-center gap-4 ${
              allDone
                ? "border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-100 shadow-lg"
                : "border-amber-200/60 bg-white/55 opacity-70"
            }`}
          >
            <div
              className={`flex-shrink-0 h-16 w-16 rounded-2xl flex items-center justify-center shadow-md ${
                allDone
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                  : "bg-gradient-to-br from-stone-200 to-stone-300 text-stone-500"
              }`}
            >
              <Star className="h-8 w-8" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-base font-extrabold ${allDone ? "text-amber-900" : "text-stone-500"}`}>
                Weekly Quiz
              </p>
              <p className={`text-xs font-bold mt-0.5 ${allDone ? "text-amber-700" : "text-stone-400"}`}>
                {allDone ? "Ready! Tap to start" : "Finish the lessons to unlock"}
              </p>
            </div>
            {!allDone && <Lock className="h-5 w-5 text-stone-400 flex-shrink-0" />}
          </div>
        </div>
      </div>
    </main>
  );
}
