"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

/** Review-only: the Students tab with labelled week circles, combined Level · Week, adult-coloured pathways and level flags. */

type Row = { first: string; last: string; year: number; level: number; week: number; scores: (number | null)[]; quiz: number | null; pathway: "targeted" | "full"; progress: number };

const ROWS: Row[] = [
  { first: "Brody", last: "Ambrose", year: 3, level: 3, week: 1, scores: [62, 0, null], quiz: null, pathway: "targeted", progress: 4 },
  { first: "Hunter", last: "Bamford", year: 4, level: 4, week: 2, scores: [100, 100, 89], quiz: 100, pathway: "targeted", progress: 8 },
  { first: "Amani", last: "Boston", year: 3, level: 2, week: 1, scores: [88, 74, null], quiz: null, pathway: "targeted", progress: 4 },
  { first: "Robert", last: "Cairns", year: 3, level: 3, week: 1, scores: [null, null, null], quiz: null, pathway: "full", progress: 0 },
  { first: "Ella", last: "Chatfield", year: 3, level: 4, week: 2, scores: [96, null, null], quiz: null, pathway: "targeted", progress: 2 },
  { first: "Toma", last: "Coates", year: 3, level: 2, week: 1, scores: [38, null, null], quiz: null, pathway: "full", progress: 2 },
  { first: "Darcy", last: "Duhring", year: 3, level: 4, week: 1, scores: [null, null, null], quiz: null, pathway: "targeted", progress: 0 },
];

const REALMS = [
  ["Number", "#0E9C93"], ["Measurement", "#C2892E"], ["Space", "#5B6EE6"], ["Statistics", "#C2557A"], ["Algebra", "#7C3AED"], ["Probability", "#0891B2"],
] as const;

const COLS = "grid grid-cols-[2fr_0.8fr_1.1fr_1.5fr_1fr_1.1fr] items-center gap-4";

function scoreColour(score: number) {
  return score >= 80 ? "bg-[#3E9B3E] text-white" : score >= 50 ? "bg-[#F0A23B] text-white" : "bg-[#D93636] text-white";
}

function Circle({ score, label, quiz = false }: { score: number | null; label: string; quiz?: boolean }) {
  const title = score == null ? `${label} · not done yet` : `${label} · ${score}%`;
  return (
    <span title={title} className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-black tabular-nums ${score == null ? "bg-[#ECEDE9] text-[#A3A7A1]" : scoreColour(score)} ${quiz ? "ring-2 ring-[#121314] ring-offset-2" : ""}`}>
      {score == null ? "–" : score}
    </span>
  );
}

function LevelCell({ year, level, week }: { year: number; level: number; week: number }) {
  const gap = level - year;
  return (
    <span className="flex items-center gap-2 text-sm font-bold text-[#121314]">
      Level {level}<span className="font-semibold text-[#8F948C]">· W{week}</span>
      {gap < 0 ? <span title={`Working ${-gap} level below Year ${year}`} className="inline-flex items-center gap-0.5 rounded-full bg-[#FFF3DC] px-1.5 py-0.5 text-[10px] font-black text-[#8A5A00]"><ArrowDown className="h-3 w-3" />Below</span> : null}
      {gap > 0 ? <span title={`Working ${gap} level above Year ${year}`} className="inline-flex items-center gap-0.5 rounded-full bg-[#EEFBDB] px-1.5 py-0.5 text-[10px] font-black text-[#3D6600]"><ArrowUp className="h-3 w-3" />Above</span> : null}
    </span>
  );
}

export default function StudentsRedesignReview() {
  return (
    <main className="reliq-adult min-h-screen bg-[#F4F4F0] px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-[#121314]">Students tab — upgrade</h1>
          <p className="text-sm text-[#5A5E63]">Same table. Level and week combined, week circles labelled (hover one for its lesson and score), level flags, adult pathway colours, and a clearer progress column.</p>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-[#E3E5E0] bg-white px-3 py-2.5">
          <div className="flex items-center gap-1 rounded-xl bg-[#F1F2EE] p-1 text-sm font-bold">
            <span className="px-4 py-2 text-[#3F4246]">Live Class</span>
            <span className="rounded-lg bg-[#121314] px-4 py-2 text-[#83E300]">Students</span>
            <span className="px-4 py-2 text-[#3F4246]">Diagnostic</span>
            <span className="px-4 py-2 text-[#3F4246]">Curriculum</span>
          </div>
          <span className="pr-2 text-sm font-semibold text-[#5A5E63]">24 students</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#E3E5E0] px-5 py-3">
            <span className="mr-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5E63]">Realm</span>
            {REALMS.map(([name, colour], i) => (
              <span key={name} className={`inline-flex items-center gap-2 rounded-full border-2 border-[#121314] px-3.5 py-1.5 text-[13px] font-bold ${i === 0 ? "bg-[#121314] text-white" : "bg-white text-[#121314]"}`}>
                <span className="h-2 w-2 rounded-full" style={{ background: i === 0 ? "#83E300" : colour }} />{name}
              </span>
            ))}
          </div>

          <div className={`${COLS} border-b border-[#E3E5E0] bg-gradient-to-b from-[#FAFBF8] to-[#F1F2EE] px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8A8E89]`}>
            <span className="flex gap-3"><span>Student ↕</span><span className="text-[#121314]">Surname ▲</span></span>
            <span className="whitespace-nowrap">School year ↕</span>
            <span className="whitespace-nowrap">Level · Week ↕</span>
            <span>
              This week
              <span className="mt-1 flex gap-2 text-[9px] tracking-[0.08em] text-[#A3A7A1]">
                {["L1", "L2", "L3", "Quiz"].map((l) => <span key={l} className="w-9 text-center">{l}</span>)}
              </span>
            </span>
            <span>Pathway ↕</span>
            <span className="whitespace-nowrap">Year progress ↕</span>
          </div>

          {ROWS.map((r) => (
            <div key={r.last} className={`${COLS} border-b border-[#F1F2EE] px-5 py-3 last:border-0 hover:bg-[#FAFBF8]`}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#121314] text-sm font-black text-[#83E300]">{r.first[0]}</span>
                <span className="text-sm font-black text-[#121314]">{r.first} {r.last}</span>
              </div>
              <span className="text-sm font-semibold text-[#3F4246]">Year {r.year}</span>
              <LevelCell year={r.year} level={r.level} week={r.week} />
              <div className="flex gap-2">
                {r.scores.map((s, i) => <Circle key={i} score={s} label={`Week ${r.week} · Lesson ${i + 1}`} />)}
                <Circle score={r.quiz} label={`Week ${r.week} · Quiz`} quiz />
              </div>
              <span className={`w-fit whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${r.pathway === "targeted" ? "bg-[#EEFBDB] text-[#3D6600]" : "bg-[#F1F2EE] text-[#3F4246]"}`}>
                {r.pathway === "targeted" ? "Targeted program" : "Full program"}
              </span>
              <div title={`${r.progress}% of this year's ${r.pathway === "targeted" ? "targeted" : "full"} program done`}>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ECEDE9]"><div className="h-full rounded-full bg-[#5FAE00]" style={{ width: `${Math.max(r.progress, r.progress ? 3 : 0)}%` }} /></div>
                  <span className="w-9 text-right text-sm font-black tabular-nums text-[#121314]">{r.progress}%</span>
                </div>
                <p className="mt-1 text-[10px] font-semibold text-[#8F948C]">of this year&apos;s program</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#5A5E63]">The floating Full Screen button is hidden on the teacher dashboard, so it no longer covers the Progress column.</p>
      </div>
    </main>
  );
}
