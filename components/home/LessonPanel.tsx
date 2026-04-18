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
    <div
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #021a18 0%, #052e2b 50%, #064e47 100%)",
        clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
        boxShadow: "inset 0 1px 0 rgba(94,234,212,0.18), inset 0 0 24px rgba(0,0,0,0.5), 0 0 24px rgba(20,184,166,0.15)",
      }}
    >
      {/* Scanline texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(94,234,212,0.6) 0 1px, transparent 1px 3px)" }}
      />
      {/* Bezel border */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(94,234,212,0.25), transparent 30%, transparent 70%, rgba(13,148,136,0.25))",
          clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
          padding: "1px",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Panel header */}
      <div className="relative px-5 pt-4 pb-3 border-b border-teal-400/15 flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold text-teal-300 uppercase tracking-[0.2em]">
            <span className="h-1 w-1 rounded-full bg-teal-300 shadow-[0_0_6px_rgba(94,234,212,0.9)]" />
            Week {week}
          </span>
          <h2 className="text-sm font-bold text-white/95 mt-1">Weekly Focus</h2>
          {topic && (
            <p className="text-xs font-medium text-teal-100/55 mt-0.5">{topic}</p>
          )}
        </div>
        <button
          onClick={onContinue}
          className="relative px-4 py-1.5 text-white text-[11px] font-mono font-extrabold uppercase tracking-[0.16em] hover:brightness-110 transition active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #064e47 0%, #0d9488 50%, #14b8a6 100%)",
            clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
            boxShadow: "inset 0 1px 0 rgba(94,234,212,0.45), inset 0 -6px 12px rgba(0,0,0,0.35), 0 0 12px rgba(20,184,166,0.4)",
          }}
          type="button"
        >
          Continue
        </button>
      </div>

      {/* Lesson rows */}
      <div className="relative divide-y divide-teal-400/10">
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

      {/* Stats strip at bottom — Nexus HUD */}
      <div
        className="relative px-5 py-3 flex items-center justify-between border-t border-teal-400/15"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(2,26,24,0.45) 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1"
            style={{
              background: "linear-gradient(135deg, #052e2b 0%, #064e47 100%)",
              clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
              boxShadow: "inset 0 1px 0 rgba(94,234,212,0.2)",
            }}
          >
            <Zap className="h-3 w-3 text-amber-300" />
            <span className="text-[10px] font-mono font-extrabold text-amber-100 tracking-[0.12em]">{xp.toLocaleString()} XP</span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1"
            style={{
              background: "linear-gradient(135deg, #052e2b 0%, #064e47 100%)",
              clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
              boxShadow: "inset 0 1px 0 rgba(94,234,212,0.2)",
            }}
          >
            <Target className="h-3 w-3 text-emerald-300" />
            <span className="text-[10px] font-mono font-extrabold text-emerald-100 tracking-[0.12em]">{accuracy}%</span>
          </div>
        </div>

        {/* Quick nav icons */}
        <div className="flex items-center gap-1">
          {[
            { icon: Map, label: "Tower", onClick: onTowerMap },
            { icon: BookOpen, label: "Legends", onClick: onLegends },
            { icon: BarChart3, label: "Realm Stats", onClick: onStats },
            { icon: LayoutGrid, label: "Levels", onClick: onLevels },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="relative h-7 w-7 flex items-center justify-center text-teal-200/60 hover:text-teal-100 transition group"
              style={{
                background: "linear-gradient(135deg, #052e2b 0%, #064e47 100%)",
                clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
                boxShadow: "inset 0 1px 0 rgba(94,234,212,0.2)",
              }}
              type="button"
              aria-label={item.label}
            >
              <item.icon className="h-3.5 w-3.5" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-[10px] font-bold text-teal-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
