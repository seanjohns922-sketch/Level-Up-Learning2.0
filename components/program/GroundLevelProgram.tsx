"use client";

import { CheckCircle2, Lock, Star, Leaf, Flower2, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type ProgramItem = { type: "lesson" | "quiz" | "posttest"; n: number; title: string; focus: string };

type Props = {
  weekNum: number;
  topic?: string;
  items: ProgramItem[];
  lessonsCompleted: boolean[];
  quizCompleted: boolean;
  weekUnlocked: boolean;
  lastAllowedWeek: number;
  onBack: () => void;
  onOpenItem: (item: ProgramItem) => void;
  onGoToWeek: (week: number) => void;
};

const LESSON_ICONS = [
  (cn: string) => (
    <svg viewBox="0 0 48 48" className={cn} fill="none">
      <circle cx="14" cy="16" r="5" fill="#fde68a" />
      <circle cx="28" cy="14" r="5" fill="#fcd34d" />
      <circle cx="20" cy="30" r="5" fill="#fbbf24" />
      <circle cx="34" cy="30" r="5" fill="#f59e0b" />
    </svg>
  ),
  (cn: string) => (
    <svg viewBox="0 0 48 48" className={cn} fill="none">
      <circle cx="16" cy="18" r="5" fill="#fb7185" />
      <circle cx="26" cy="16" r="5" fill="#f472b6" />
      <circle cx="22" cy="26" r="5" fill="#ec4899" />
      <path d="M8 28 L40 28 L34 40 L14 40 Z" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
      <path d="M8 28 L40 28" stroke="#fef3c7" strokeWidth="1.5" />
    </svg>
  ),
  (cn: string) => (
    <svg viewBox="0 0 48 48" className={cn} fill="none">
      <path d="M8 10 H40 A4 4 0 0 1 44 14 V30 A4 4 0 0 1 40 34 H22 L14 42 V34 H8 A4 4 0 0 1 4 30 V14 A4 4 0 0 1 8 10 Z" fill="#a7f3d0" stroke="#065f46" strokeWidth="1.5" />
      <text x="24" y="28" textAnchor="middle" fontSize="16" fontWeight="900" fill="#065f46">3</text>
    </svg>
  ),
];

export default function GroundLevelProgram({
  weekNum,
  topic,
  items,
  lessonsCompleted,
  quizCompleted,
  weekUnlocked,
  lastAllowedWeek,
  onBack,
  onOpenItem,
  onGoToWeek,
}: Props) {
  const lessonsDone = lessonsCompleted.filter(Boolean).length;
  const totalLessons = 3;
  const allLessonsDone = lessonsDone >= totalLessons;
  const progressPct = Math.round((lessonsDone / totalLessons) * 100);

  const [weekMenuOpen, setWeekMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!weekMenuOpen) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setWeekMenuOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [weekMenuOpen]);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Number Grove background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 18% 22%, #bbf7d0 0%, transparent 55%), radial-gradient(circle at 84% 18%, #a7f3d0 0%, transparent 50%), radial-gradient(circle at 50% 92%, #fef3c7 0%, transparent 55%), linear-gradient(180deg, #ecfdf5 0%, #d1fae5 50%, #fef9c3 100%)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none opacity-60">
          {[
            { l: "6%", t: "22%", n: "1", c: "#10b981" },
            { l: "88%", t: "26%", n: "2", c: "#f59e0b" },
            { l: "12%", t: "70%", n: "3", c: "#14b8a6" },
            { l: "82%", t: "76%", n: "4", c: "#ec4899" },
            { l: "48%", t: "8%", n: "5", c: "#22c55e" },
          ].map((d, i) => (
            <div
              key={i}
              className="absolute h-14 w-14 rounded-full flex items-center justify-center font-black text-white text-2xl"
              style={{
                left: d.l,
                top: d.t,
                background: d.c,
                boxShadow: `0 8px 24px ${d.c}55, inset 0 -4px 8px rgba(0,0,0,0.12), inset 0 4px 8px rgba(255,255,255,0.35)`,
                opacity: 0.32,
              }}
            >
              {d.n}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 pt-4 pb-16">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-full font-extrabold text-xs text-emerald-800 border-2 border-emerald-300 bg-white/85 hover:bg-white hover:border-emerald-400 transition active:scale-[0.97] shadow-sm"
          >
            ← Back
          </button>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setWeekMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold text-emerald-800 border-2 border-emerald-300 bg-white/85 hover:bg-white hover:border-emerald-400 transition shadow-sm"
            >
              Week {weekNum}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${weekMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {weekMenuOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-44 max-h-[300px] overflow-y-auto rounded-2xl border-2 border-emerald-300 bg-white shadow-xl py-1">
                {Array.from({ length: 12 }).map((_, i) => {
                  const w = i + 1;
                  const open = w <= lastAllowedWeek;
                  const isCurrent = w === weekNum;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        setWeekMenuOpen(false);
                        onGoToWeek(w);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-extrabold ${
                        isCurrent
                          ? "bg-emerald-100 text-emerald-900"
                          : open
                          ? "text-emerald-800 hover:bg-emerald-50"
                          : "text-stone-400"
                      }`}
                      disabled={!open}
                    >
                      <span>Week {w}</span>
                      <span className="text-[10px]">
                        {isCurrent ? "Here" : open ? "Open" : "Locked"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <span className="ml-auto text-xs font-extrabold text-emerald-800/80">Ground Level</span>
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
            Week {weekNum}
          </h1>
          {topic && <p className="text-base font-bold text-emerald-800/80 mb-3">This week: {topic}</p>}
          <p className="text-xs font-extrabold text-emerald-700/80 uppercase tracking-[0.16em] mb-3">
            {lessonsDone} / {totalLessons} lessons completed
          </p>
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

        {/* Banner */}
        <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 mb-5 shadow-sm flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Flower2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 mb-0.5">
              Today&apos;s Adventure
            </p>
            <p className="text-sm font-bold text-amber-900 leading-snug">
              {allLessonsDone
                ? "Amazing! Finish the weekly quiz to wake up Numbot Bouncer!"
                : "Complete your lessons to unlock Numbot Bouncer!"}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="grid gap-3">
          {items.map((item, idx) => {
            const isLesson = item.type === "lesson";
            const isPostTest = item.type === "posttest";
            const completed = isLesson
              ? lessonsCompleted[item.n - 1]
              : isPostTest
              ? false
              : quizCompleted;

            let locked = false;
            if (!weekUnlocked) locked = true;
            if (isLesson && item.n > 1 && !lessonsCompleted[item.n - 2]) locked = true;
            if (item.type === "quiz" && lessonsDone < 3) locked = true;
            if (isPostTest && lessonsDone < 3) locked = true;

            const Icon = isLesson ? LESSON_ICONS[item.n - 1] : null;

            return (
              <button
                key={`${item.type}-${item.n}`}
                onClick={() => !locked && onOpenItem(item)}
                disabled={locked}
                type="button"
                className={`relative w-full text-left rounded-3xl border-2 p-4 transition active:scale-[0.99] flex items-center gap-4 ${
                  completed
                    ? "border-emerald-300 bg-emerald-50/90"
                    : locked
                    ? "border-emerald-200/70 bg-white/60 opacity-70 cursor-not-allowed"
                    : isLesson || item.type === "quiz" || isPostTest
                    ? "border-emerald-400 bg-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
                    : "border-emerald-300 bg-white"
                }`}
              >
                <div
                  className={`flex-shrink-0 h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md ${
                    completed
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
                      : locked
                      ? "bg-gradient-to-br from-stone-200 to-stone-300 text-stone-500"
                      : isPostTest || item.type === "quiz"
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                      : "bg-gradient-to-br from-amber-300 to-amber-500 text-white"
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="h-8 w-8" />
                  ) : item.type === "quiz" || isPostTest ? (
                    <Star className="h-8 w-8" fill="currentColor" />
                  ) : (
                    item.n
                  )}
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-3">
                  {Icon && (
                    <div className={locked ? "opacity-40 grayscale" : ""}>
                      {Icon("h-12 w-12 flex-shrink-0")}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className={`text-base font-extrabold ${locked ? "text-stone-500" : "text-emerald-900"}`}>
                      {isPostTest
                        ? "Post-Test"
                        : item.type === "quiz"
                        ? "Weekly Quiz"
                        : item.title}
                    </p>
                    <p
                      className={`text-xs font-bold mt-0.5 ${
                        completed
                          ? "text-emerald-600"
                          : locked
                          ? "text-stone-400"
                          : "text-amber-600"
                      }`}
                    >
                      {completed
                        ? "Done!"
                        : locked
                        ? isLesson
                          ? `Finish Lesson ${item.n - 1} first`
                          : "Finish the lessons to unlock"
                        : isLesson && item.n === 1
                        ? "Start here →"
                        : "Keep going →"}
                    </p>
                  </div>
                </div>

                {locked && <Lock className="h-5 w-5 text-stone-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
