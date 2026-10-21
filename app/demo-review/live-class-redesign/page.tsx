"use client";

import { useState } from "react";
import { ChevronDown, Crosshair, Expand, Eye, Sparkles } from "lucide-react";

/** Review-only: a redesigned Live Class tab. Same information and controls as today, laid out for a glance. */

type Group = "help" | "active" | "idle" | "waiting";
type Row = {
  name: string; realm: keyof typeof REALMS; level: number; week: number | null; activity: string; detail?: string;
  correct?: number; answered?: number; marked?: boolean; when: string; group: Group; note?: string;
};

const REALMS = {
  number: { label: "Number", color: "#5FAE00" },
  measurement: { label: "Measurement", color: "#C08A3E" },
  space: { label: "Space", color: "#5B6EE1" },
  statistics: { label: "Statistics", color: "#C2547A" },
  algebra: { label: "Algebra", color: "#7C3AED" },
  probability: { label: "Probability", color: "#1A8FB0" },
};

const ROWS: Row[] = [
  { name: "Mia Brown", realm: "number", level: 3, week: 2, activity: "Lesson 4", detail: "Question 3", correct: 2, answered: 7, when: "Now", group: "help", note: "Stuck on Q3 · 3 tries" },
  { name: "Waldo Oosthuizen", realm: "probability", level: 3, week: null, activity: "Pre-test", detail: "Q1 of 20", marked: true, when: "Now", group: "active" },
  { name: "Jepp Goldsmith", realm: "measurement", level: 4, week: 1, activity: "Lesson 1", detail: "Attempt 1", correct: 20, answered: 24, when: "2h ago", group: "idle" },
  { name: "Cooper Sweeney", realm: "number", level: 3, week: 1, activity: "Lesson 3", detail: "Attempt 8", correct: 5, answered: 6, when: "1d ago", group: "idle" },
  { name: "Robert Cairns", realm: "number", level: 3, week: null, activity: "Pre-test", detail: "Finished", correct: 6, answered: 20, when: "1d ago", group: "idle" },
  { name: "Toma Coates", realm: "number", level: 2, week: 1, activity: "Lesson 2", detail: "Attempt 8", correct: 0, answered: 33, when: "8d ago", group: "idle" },
  { name: "Isla Macartney", realm: "algebra", level: 3, week: null, activity: "Pre-test", detail: "Q6 of 20", marked: true, when: "11d ago", group: "idle" },
  { name: "Ava Nguyen", realm: "number", level: 3, week: null, activity: "Not started today", when: "—", group: "waiting" },
];

const TILES: { id: Group | "accuracy"; label: string; value: string; tone: string }[] = [
  { id: "active", label: "Active now", value: "2", tone: "text-[#3D6600]" },
  { id: "help", label: "Need help", value: "1", tone: "text-[#C8102E]" },
  { id: "idle", label: "Idle", value: "9", tone: "text-[#121314]" },
  { id: "waiting", label: "Not started", value: "14", tone: "text-[#121314]" },
  { id: "accuracy", label: "Accuracy today", value: "87%", tone: "text-[#121314]" },
];

function accuracyTone(pct: number) {
  return pct >= 70 ? "#5FAE00" : pct >= 50 ? "#D08A00" : "#C8102E";
}

function Score({ row }: { row: Row }) {
  if (row.marked) return <span className="text-xs font-semibold text-[#8F948C]">Marked at end</span>;
  if (!row.answered) return <span className="text-[#C9CCC6]">—</span>;
  const pct = Math.round(((row.correct ?? 0) / row.answered) * 100);
  return (
    <div className="w-28">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-black tabular-nums text-[#121314]">{row.correct}/{row.answered}</span>
        <span className="text-xs font-black tabular-nums" style={{ color: accuracyTone(pct) }}>{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#EDEEE9]"><div className="h-full rounded-full" style={{ width: `${Math.max(pct, 3)}%`, background: accuracyTone(pct) }} /></div>
    </div>
  );
}

function StatusDot({ group }: { group: Group }) {
  const c = group === "help" ? "bg-[#C8102E]" : group === "active" ? "bg-[#83E300]" : group === "idle" ? "bg-[#B5B8B1]" : "bg-[#E3E5E0]";
  return (
    <span className="keep-round relative flex h-2.5 w-2.5 shrink-0">
      {group === "active" || group === "help" ? <span className={`absolute inset-0 keep-round animate-ping rounded-full opacity-60 ${c}`} /> : null}
      <span className={`keep-round relative h-2.5 w-2.5 rounded-full ${c}`} />
    </span>
  );
}

function FocusPopover() {
  return (
    <div className="absolute right-0 top-full z-10 mt-2 w-[360px] rounded-2xl border border-[#E3E5E0] bg-white p-4 shadow-2xl">
      <p className="flex items-center gap-2 text-sm font-black text-[#121314]"><Crosshair className="h-4 w-4" />Focus mode</p>
      <p className="mt-1 text-xs text-[#5A5E63]">Lock the class to one realm during class. Students still roam at home.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-xs font-bold text-[#5A5E63]">Realm<span className="mt-1 flex h-10 items-center justify-between rounded-xl border border-[#D9DBD4] px-3 text-sm font-bold text-[#121314]">Number<ChevronDown className="h-4 w-4" /></span></label>
        <label className="text-xs font-bold text-[#5A5E63]">For<span className="mt-1 flex h-10 items-center justify-between rounded-xl border border-[#D9DBD4] px-3 text-sm font-bold text-[#121314]">2 weeks<ChevronDown className="h-4 w-4" /></span></label>
      </div>
      <span className="mt-3 flex h-10 items-center justify-center rounded-xl bg-[#121314] text-sm font-black text-white">Set focus</span>
    </div>
  );
}

function LiveClass({ focusOpen = false }: { focusOpen?: boolean }) {
  const [filter, setFilter] = useState<Group | null>(null);
  const rows = filter ? ROWS.filter((r) => r.group === filter) : ROWS;
  return (
    <div className="grid gap-4">
      {/* Tiles: the counts and the filters in one */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {TILES.map((t) => {
          const selectable = t.id !== "accuracy";
          const on = filter === t.id;
          const alert = t.id === "help" && t.value !== "0";
          return (
            <button
              key={t.id}
              type="button"
              disabled={!selectable}
              onClick={() => selectable && setFilter(on ? null : (t.id as Group))}
              className={[
                "rounded-2xl border bg-white px-5 py-4 text-left transition",
                on ? "border-[#121314] ring-2 ring-[#121314]" : alert ? "border-[#F3B7C0] bg-[#FFF5F6]" : "border-[#E3E5E0]",
                selectable ? "hover:border-[#121314]" : "cursor-default",
              ].join(" ")}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8F948C]">{t.label}</p>
              <p className={`mt-1 font-display text-4xl font-black leading-none ${t.tone}`}>{t.value}</p>
              <p className="mt-2 text-[11px] font-semibold text-[#8F948C]">{selectable ? (on ? "Showing only these · tap to clear" : "Tap to show") : "Students working today"}</p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="relative flex flex-wrap items-center gap-2 rounded-2xl border border-[#E3E5E0] bg-white px-4 py-2.5">
        <p className="mr-auto text-sm font-bold text-[#121314]">{filter ? `${rows.length} shown` : "All 24 students"}<span className="ml-2 text-xs font-semibold text-[#8F948C]">Need help shows first</span></p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9DBD4] px-3.5 py-1.5 text-sm font-bold text-[#121314]"><Eye className="h-4 w-4" />Active only</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9DBD4] px-3.5 py-1.5 text-sm font-bold text-[#121314]"><Sparkles className="h-4 w-4" />Spotlight</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-bold ${focusOpen ? "border-[#121314] bg-[#121314] text-white" : "border-[#D9DBD4] text-[#121314]"}`}><Crosshair className="h-4 w-4" />Focus: Off<ChevronDown className="h-3.5 w-3.5" /></span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#121314] px-3.5 py-1.5 text-sm font-bold text-white"><Expand className="h-4 w-4" />Full screen</span>
        {focusOpen ? <FocusPopover /> : null}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white">
        <div className="grid grid-cols-[1.6fr_1fr_0.9fr_1.2fr_1fr_0.6fr] items-center gap-4 border-b border-[#E3E5E0] bg-[#FAFBF8] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#8F948C]">
          <span>Student ↕</span><span>Realm ↕</span><span>Level · Week ↕</span><span>Doing now ↕</span><span>Score ↕</span><span className="text-right">Last active ↕</span>
        </div>
        {rows.map((r) => {
          const realm = REALMS[r.realm];
          return (
            <div key={r.name} className={`relative grid grid-cols-[1.6fr_1fr_0.9fr_1.2fr_1fr_0.6fr] items-center gap-4 border-b border-[#F1F2EE] px-5 py-3.5 last:border-0 ${r.group === "help" ? "bg-[#FFF5F6]" : ""} ${r.group === "waiting" ? "text-[#A3A7A1]" : ""}`}>
              {r.group === "help" ? <span className="absolute inset-y-0 left-0 w-1 bg-[#C8102E]" /> : null}
              <div className="flex min-w-0 items-center gap-3">
                <StatusDot group={r.group} />
                <div className="min-w-0">
                  <p className={`truncate text-sm font-black ${r.group === "waiting" ? "text-[#A3A7A1]" : "text-[#121314]"}`}>{r.name}</p>
                  {r.note ? <p className="text-xs font-bold text-[#C8102E]">{r.note}</p> : null}
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: `${realm.color}14`, color: realm.color }}>
                <span className="keep-round h-2 w-2 rounded-full" style={{ background: realm.color }} />{realm.label}
              </span>
              <span className="text-sm font-semibold text-[#3F4246]">Level {r.level}{r.week ? <span className="text-[#8F948C]"> · Week {r.week}</span> : null}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#121314]">{r.activity}</p>
                {r.detail ? <p className="text-xs font-semibold text-[#8F948C]">{r.detail}</p> : null}
              </div>
              <Score row={r} />
              <span className={`text-right text-xs font-bold ${r.when === "Now" ? "text-[#3D6600]" : "text-[#8F948C]"}`}>{r.when}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabBar() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E3E5E0] bg-white px-3 py-2.5">
      <div className="flex items-center gap-1 rounded-xl bg-[#F1F2EE] p-1 text-sm font-bold">
        <span className="rounded-lg bg-[#121314] px-4 py-2 text-[#83E300]">Live Class</span>
        {["Students", "Diagnostic", "Curriculum"].map((t) => <span key={t} className="px-4 py-2 text-[#3F4246]">{t}</span>)}
      </div>
      <span className="pr-2 text-sm font-semibold text-[#5A5E63]">24 students</span>
    </div>
  );
}

export default function LiveClassRedesignReview() {
  return (
    <main className="reliq-adult min-h-screen bg-[#F4F4F0] px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-10">
        <section className="grid gap-4">
          <div>
            <h1 className="font-display text-2xl font-black uppercase tracking-tight text-[#121314]">Live Class — redesign</h1>
            <p className="text-sm text-[#5A5E63]">Same information and controls as today. The tiles are also the filters (tap one), and students who need help show first.</p>
          </div>
          <TabBar />
          <LiveClass />
        </section>
        <section className="square-ui grid gap-4">
          <style>{`.square-ui [class*="rounded"]:not(.keep-round), .square-ui [class*="ring-"] { border-radius: 0 !important; }`}</style>
          <div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-[#121314]">Square version</h2>
            <p className="text-sm text-[#5A5E63]">Exactly the same, with square corners on the tiles, toolbar, buttons, tags and table. Status dots stay round.</p>
          </div>
          <TabBar />
          <LiveClass />
        </section>
        <section className="grid gap-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8F948C]">With Focus open</p>
          <div className="pb-48"><LiveClass focusOpen /></div>
        </section>
      </div>
    </main>
  );
}
