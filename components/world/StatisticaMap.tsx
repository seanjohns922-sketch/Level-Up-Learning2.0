"use client";

import Image from "next/image";
import { useMemo } from "react";
import { BarChart3, ChevronLeft, Database, LineChart, SearchCheck, Table2 } from "lucide-react";
import { LEVEL_CATALOG } from "@/lib/level-catalog";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getStatisticaBackground } from "@/lib/statistica-visuals";
import { getCurriculumPlan } from "@/data/programs/genres";

const LEVELS = LEVEL_CATALOG.filter((level) => level.id !== "Prep") as Array<{ id: RealmLevelId; label: string }>;

const WIDGET_POSITIONS = [
  { left: "4%", top: "14%", accent: "#5eead4", icon: Database },
  { left: "5%", top: "58%", accent: "#a7f3d0", icon: Table2 },
  { left: "68%", top: "14%", accent: "#93c5fd", icon: BarChart3 },
  { left: "68%", top: "58%", accent: "#fde68a", icon: SearchCheck },
] as const;

const JOURNEY = "COLLECT -> RECORD -> REPRESENT -> INTERPRET -> COMPARE -> ANALYSE -> INVESTIGATE -> CRITIQUE";

function normalizeLevel(level: string): RealmLevelId {
  return LEVELS.some((entry) => entry.id === level) ? (level as RealmLevelId) : "Year 1";
}

export default function StatisticaMap({ level }: { level: string }) {
  const selectedLevel = normalizeLevel(level);
  const background = getStatisticaBackground(selectedLevel);
  const plan = useMemo(() => getCurriculumPlan(selectedLevel, "statistics"), [selectedLevel]);
  const widgets = plan
    .filter((week) => week.week % 2 === 1)
    .slice(0, 4)
    .map((week, index) => {
      const nextWeek = plan.find((candidate) => candidate.week === week.week + 1);
      return {
        id: `statistica-widget-${index + 1}`,
        title: index === 0 ? "Collect" : index === 1 ? "Represent" : index === 2 ? "Compare" : "Investigate",
        weekLabel: `WEEKS ${week.week}-${nextWeek?.week ?? week.week}`,
        description: [week.topic, nextWeek?.topic].filter(Boolean).join(" / "),
        lessons: week.lessons.map((lesson) => lesson.title).join(" / "),
        ...WIDGET_POSITIONS[index],
      };
    });

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#06151a] text-white">
      <Image
        src={background}
        alt=""
        fill
        priority
        quality={92}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "center 42%" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,10,18,0.52),rgba(2,10,18,0.08)_42%,rgba(2,10,18,0.72))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(20,184,166,0.12),transparent_58%)]" />

      <header className="absolute left-5 right-5 top-5 z-30 flex items-center justify-between rounded-lg border border-teal-200/24 bg-slate-950/54 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md">
        <a href="/realms" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-3 text-sm font-black text-teal-50 transition hover:bg-white/12">
          <ChevronLeft className="h-5 w-5" />
          Realms
        </a>
        <div className="text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.32em] text-teal-200">Statistics Realm</div>
          <h1 className="text-3xl font-black tracking-[0.04em] text-white drop-shadow">Statistica</h1>
        </div>
        <select
          value={selectedLevel}
          onChange={(event) => {
            window.location.assign(`/statistica?level=${encodeURIComponent(event.target.value)}`);
          }}
          className="min-h-11 rounded-lg border border-teal-200/28 bg-slate-950/66 px-3 text-sm font-black text-white outline-none"
          aria-label="Select Statistica level"
        >
          {LEVELS.map((entry) => (
            <option key={entry.id} value={entry.id} className="bg-slate-950 text-white">
              {entry.label}
            </option>
          ))}
        </select>
      </header>

      <section className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute left-1/2 top-[13%] -translate-x-1/2 text-center">
          <div className="text-3xl font-black uppercase tracking-[0.28em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.8)]">
            {selectedLevel.replace("Year ", "Level ")}
          </div>
          <div className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-teal-100/88">{JOURNEY}</div>
        </div>

        {widgets.map((widget) => {
          const Icon = widget.icon;
          return (
            <article
              key={widget.id}
              className="pointer-events-auto absolute w-[380px] max-w-[29vw] rounded-lg border p-4 text-left shadow-[0_18px_42px_rgba(0,0,0,0.34)] backdrop-blur-md transition hover:-translate-y-0.5"
              style={{
                left: widget.left,
                top: widget.top,
                borderColor: `${widget.accent}66`,
                background: "linear-gradient(145deg, rgba(6,20,28,0.68), rgba(15,35,54,0.52))",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: widget.accent }}>
                    {widget.weekLabel}
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase tracking-[0.08em] text-white">{widget.title}</h2>
                </div>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-white/10"
                  style={{ borderColor: `${widget.accent}55`, color: widget.accent }}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 text-sm font-black leading-5 text-white/84">{widget.description}</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-teal-50/68">{widget.lessons}</p>
            </article>
          );
        })}
      </section>

      <aside className="absolute right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2">
        {[LineChart, BarChart3, Table2].map((Icon, index) => (
          <div
            key={index}
            className="flex h-[72px] w-[72px] flex-col items-center justify-center gap-1 rounded-lg border border-teal-200/28 bg-slate-950/62 text-teal-100 shadow-[0_16px_36px_rgba(0,0,0,0.28)] backdrop-blur-md"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[8px] font-black uppercase tracking-[0.16em]">{index === 0 ? "Trends" : index === 1 ? "Graphs" : "Tables"}</span>
          </div>
        ))}
      </aside>

      <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-teal-200/28 bg-slate-950/58 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-teal-50 shadow-[0_16px_36px_rgba(0,0,0,0.28)] backdrop-blur-md">
        Blueprint preview - no progress writes
      </div>
    </main>
  );
}
