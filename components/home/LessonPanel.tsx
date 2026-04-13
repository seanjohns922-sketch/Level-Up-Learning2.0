"use client";

import { CheckCircle2, ChevronRight, Lock, Zap, Trophy, Target, Map, BookOpen, LayoutGrid, BarChart3 } from "lucide-react";

type Lesson = { id: string; lesson: number; title: string };

type Props = {
  week: number;
  topic?: string;
  lessons: Lesson[];
  lessonsDone: number;
  onContinue: () => void;
  // Stats
  xp: number;
  levelNum: number;
  accuracy: number;
  // Quick nav
  onLegends: () => void;
  onLevels: () => void;
  onTowerMap: () => void;
  onStats: () => void;
};

export default function LessonPanel({
  topic,
  week,
  lessons,
  lessonsDone,
  onContinue,
  xp,
  levelNum,
  accuracy,
  onLegends,
  onLevels,
  onTowerMap,
  onStats,
}: Props) {
  return (
    <div className="rounded-2xl bg-black/30 backdrop-blur-xl border border-white/8 overflow-hidden">
      {/* Panel header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/6 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">
            Week {week}
          </span>
          <h2 className="text-sm font-bold text-white/90 mt-0.5">Weekly Focus</h2>
          {topic && (
            <p className="text-xs font-medium text-white/50 mt-0.5">{topic}</p>
          )}
        </div>
        <button
          onClick={onContinue}
          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-extrabold hover:brightness-110 transition active:scale-[0.97]"
          type="button"
        >
          Continue
        </button>
      </div>

      {/* Lesson rows */}
      <div className="divide-y divide-white/5">
        {lessons.map((lesson, i) => {
          const done = i < lessonsDone;
          const current = i === lessonsDone;
          const locked = i > lessonsDone;

          return (
            <button
              key={lesson.id}
              onClick={current ? onContinue : undefined}
              disabled={locked}
              className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition group ${
                current
                  ? "bg-white/5 hover:bg-white/8 cursor-pointer"
                  : locked
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-default"
              }`}
              type="button"
            >
              {/* Number badge */}
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                  done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : current
                    ? "bg-teal-500/20 text-teal-300 border border-teal-400/30"
                    : "bg-white/5 text-white/30"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4.5 w-4.5" />
                ) : (
                  <span>{String(lesson.lesson).padStart(2, "0")}</span>
                )}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-bold block truncate ${
                    done
                      ? "text-white/40 line-through"
                      : current
                      ? "text-white/90"
                      : "text-white/30"
                  }`}
                >
                  {lesson.title}
                </span>
                {current && (
                  <span className="text-[10px] font-bold text-teal-400 mt-0.5 block">Up next</span>
                )}
              </div>

              {/* Right indicator */}
              <div className="flex-shrink-0">
                {done ? (
                  <span className="text-[10px] font-extrabold text-emerald-400/70 uppercase">Done</span>
                ) : current ? (
                  <ChevronRight className="h-4 w-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-white/20" />
                )}
              </div>
            </button>
          );
        })}

        {/* Quiz row */}
        <div className="flex items-center gap-4 px-5 py-3.5 opacity-40">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Trophy className="h-4 w-4 text-amber-400/50" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold text-white/30 block">Weekly Quiz</span>
            <span className="text-[10px] font-bold text-white/20 block">Complete all lessons first</span>
          </div>
          <Lock className="h-3.5 w-3.5 text-white/20 flex-shrink-0" />
        </div>
      </div>

      {/* Stats strip at bottom */}
      <div className="px-5 py-3 border-t border-white/6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-extrabold text-white/60">{xp.toLocaleString()} XP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-extrabold text-white/60">{accuracy}%</span>
          </div>
        </div>

        {/* Quick nav icons */}
        <div className="flex items-center gap-1">
          {[
            { icon: Map, label: "Tower Map", onClick: onTowerMap },
            { icon: BookOpen, label: "Legends", onClick: onLegends },
            { icon: BarChart3, label: "Realm Stats", onClick: onStats },
            { icon: LayoutGrid, label: "Levels", onClick: onLevels },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="relative h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition group"
              type="button"
              aria-label={item.label}
            >
              <item.icon className="h-3.5 w-3.5" />
              {/* Tooltip */}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
