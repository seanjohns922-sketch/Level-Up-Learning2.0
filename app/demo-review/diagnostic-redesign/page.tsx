"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronDown, Info, ListChecks, TrendingUp } from "lucide-react";
import { STANDING_META, standingForGap } from "@/lib/proficiency";

/** Review-only: the Diagnostic tab with one header, one pinned Prep–8 scale and compact rows on a shared track. */

type Row = { first: string; last: string; year: number; live: number; s?: number; m?: number; e?: number };

// Pretend data. Term 4 (Oct–Dec): a Year N student is expected at Level N.
const ROWS: Row[] = [
  { first: "Brody", last: "Ambrose", year: 3, live: 2.24, s: 1.6, m: 2.0 },
  { first: "Hunter", last: "Bamford", year: 4, live: 3.95, s: 3.1, m: 3.5, e: 3.9 },
  { first: "Amani", last: "Boston", year: 3, live: 1.8, s: 1.2, m: 1.5 },
  { first: "Robert", last: "Cairns", year: 3, live: 2.6, s: 2.0 },
  { first: "Ella", last: "Chatfield", year: 3, live: 3.9, s: 2.8, m: 3.3, e: 3.8 },
  { first: "Toma", last: "Coates", year: 3, live: 1.6, s: 1.1, m: 1.3 },
  { first: "Darcy", last: "Duhring", year: 3, live: 3.3, s: 2.5, m: 2.9 },
  { first: "Jepp", last: "Goldsmith", year: 4, live: 4.6, s: 3.8, m: 4.2, e: 4.5 },
  { first: "Jade", last: "Mccance", year: 3, live: 2.9, s: 2.2, m: 2.6, e: 2.8 },
  { first: "Isla", last: "Macartney", year: 3, live: 2.5, s: 1.9, m: 2.3 },
  { first: "Cooper", last: "Sweeney", year: 4, live: 3.4, s: 2.7, m: 3.0, e: 3.3 },
  { first: "Waldo", last: "Oosthuizen", year: 3, live: 3.1 },
];

const SCALE = ["Prep", "1", "2", "3", "4", "5", "6", "7", "8"];
const pos = (level: number) => `${(Math.max(0, Math.min(8, level)) / 8) * 100}%`;
const COLS = "grid grid-cols-[minmax(220px,1.1fr)_minmax(170px,0.8fr)_3fr] items-center gap-6";

function Marker({ level, letter }: { level: number; letter: string }) {
  return (
    <span title={`${letter === "S" ? "Start" : letter === "M" ? "Mid" : "End"} diagnostic · ${level.toFixed(2)}`} className="absolute top-0 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-[#121314] text-[9px] font-black text-white ring-2 ring-white" style={{ left: pos(level) }}>
      {letter}
    </span>
  );
}

function Track({ row }: { row: Row }) {
  const expected = row.year;
  return (
    <div className="relative h-11">
      {/* scale gridlines */}
      {SCALE.map((_, i) => <span key={i} className="absolute top-[26px] h-3 w-px bg-[#E3E5E0]" style={{ left: pos(i) }} />)}
      <span className="absolute inset-x-0 top-[30px] h-1 rounded-full bg-[#F1F2EE]" />
      {/* gap between live and expected */}
      <span className="absolute top-[30px] h-1 rounded-full" style={{ left: pos(Math.min(row.live, expected)), width: `${(Math.abs(row.live - expected) / 8) * 100}%`, background: row.live < expected ? "#FFD866" : "#B9E68A" }} />
      {/* expected now */}
      <span title={`Expected now for Year ${row.year}: Level ${expected}`} className="absolute top-[20px] h-6 w-0 -translate-x-1/2 border-l-2 border-dashed border-[#121314]" style={{ left: pos(expected) }} />
      {row.s != null ? <Marker level={row.s} letter="S" /> : null}
      {row.m != null ? <Marker level={row.m} letter="M" /> : null}
      {row.e != null ? <Marker level={row.e} letter="E" /> : null}
      <span title={`Live level ${row.live.toFixed(2)}`} className="absolute top-[24px] h-4 w-4 -translate-x-1/2 rounded-full bg-[#5FAE00] ring-4 ring-white" style={{ left: pos(row.live) }} />
    </div>
  );
}

function Standing({ row }: { row: Row }) {
  const gap = row.live - row.year;
  const standing = standingForGap(gap);
  const meta = STANDING_META[standing];
  const words = Math.abs(gap) <= 0.25 ? "on track" : gap < 0 ? `${Math.abs(gap).toFixed(1)} behind` : `${gap.toFixed(1)} ahead`;
  return (
    <div>
      <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-black" style={{ background: meta.bg, color: meta.fg }}>{meta.label}</span>
      <p className="mt-1 text-xs font-semibold text-[#5A5E63]" title={`Live ${row.live.toFixed(2)} · expected ${row.year.toFixed(2)}`}>Level {row.live.toFixed(1)} · {words}</p>
    </div>
  );
}

/* ── Option B: growth line ── one clean lane; the dots join into a path from Start to now. */
function GrowthTrack({ row }: { row: Row }) {
  const points = [row.s, row.m, row.e].filter((v): v is number => v != null);
  const from = points.length ? Math.min(...points) : row.live;
  return (
    <div className="relative h-7">
      {SCALE.map((_, i) => <span key={i} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-[#E3E5E0]" style={{ left: pos(i) }} />)}
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#E3E5E0]" />
      {/* expected now: a small notch, not a full line */}
      <span title={`Expected now: Level ${row.year}`} className="absolute top-0 h-7 w-[3px] -translate-x-1/2 rounded-full bg-[#121314]/25" style={{ left: pos(row.year) }} />
      {/* the growth path */}
      <span className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#121314]" style={{ left: pos(from), width: `${((row.live - from) / 8) * 100}%` }} />
      {[["S", row.s], ["M", row.m], ["E", row.e]].map(([letter, v]) => v == null ? null : (
        <span key={letter as string} title={`${letter} ${(v as number).toFixed(2)}`} className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#121314] bg-white" style={{ left: pos(v as number) }} />
      ))}
      <span title={`Live ${row.live.toFixed(2)}`} className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-[3px] ring-white" style={{ left: pos(row.live), background: STANDING_META[standingForGap(row.live - row.year)].bg === "#121314" ? "#5FAE00" : STANDING_META[standingForGap(row.live - row.year)].bg }} />
    </div>
  );
}

function growthText(row: Row) {
  const first = row.s ?? row.m ?? row.e;
  if (first == null) return "No diagnostic yet";
  const g = row.live - first;
  return `${g >= 0 ? "+" : ""}${g.toFixed(1)} since ${row.s != null ? "Start" : row.m != null ? "Mid" : "End"}`;
}

function OptionB() {
  const cols = "grid grid-cols-[minmax(200px,1fr)_minmax(150px,0.7fr)_3fr_110px] items-center gap-6";
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white">
      <div className="sticky top-0 z-10 border-b border-[#E3E5E0] bg-[#FAFBF8] px-5 py-3">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-[#5A5E63]">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-[#121314] bg-white" />Diagnostic checkpoints</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-1 w-5 rounded-full bg-[#121314]" />Growth</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#FFD866]" />Live level (coloured by standing)</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3.5 w-[3px] rounded-full bg-[#121314]/25" />Expected now</span>
        </div>
        <div className={`${cols} mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#8F948C]`}>
          <span>Student</span><span>Standing</span>
          <div className="relative h-4">{SCALE.map((l, i) => <span key={l} className="absolute -translate-x-1/2" style={{ left: pos(i) }}>{l}</span>)}</div>
          <span className="text-right">Growth</span>
        </div>
      </div>
      {ROWS.map((r) => {
        const meta = STANDING_META[standingForGap(r.live - r.year)];
        return (
          <div key={r.last} className={`${cols} border-b border-[#F1F2EE] px-5 py-2.5 last:border-0 hover:bg-[#FAFBF8]`}>
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="truncate text-sm font-black text-[#121314]">{r.first} {r.last}<span className="ml-2 text-xs font-semibold text-[#8F948C]">Y{r.year}</span></p>
              <span className="shrink-0 rounded-full border border-[#121314] px-3 py-1 text-xs font-bold">Report</span>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-black" style={{ background: meta.bg, color: meta.fg }}>{meta.label}<span className="font-bold opacity-70">{r.live.toFixed(1)}</span></span>
            <GrowthTrack row={r} />
            <span className={`text-right text-xs font-black ${r.s == null && r.m == null && r.e == null ? "text-[#A3A7A1]" : "text-[#121314]"}`}>{growthText(r)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Option C: numbers first ── the levels in columns, with a small bar for growth. */
function Cell({ v, year, at = 0 }: { v?: number; year: number; at?: number }) {
  if (v == null) return <span className="text-center text-sm text-[#C9CCC6]">—</span>;
  const meta = STANDING_META[standingForGap(v - (year - at))];
  return <span className="mx-auto inline-flex min-w-12 justify-center rounded-lg px-2 py-1 text-sm font-black tabular-nums" style={{ background: `${meta.bg}`, color: meta.fg }}>{v.toFixed(1)}</span>;
}

function OptionC() {
  const cols = "grid grid-cols-[minmax(200px,1.4fr)_repeat(5,minmax(70px,0.6fr))_minmax(140px,1fr)] items-center gap-4";
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white">
      <div className={`${cols} sticky top-0 z-10 border-b border-[#E3E5E0] bg-[#FAFBF8] px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#8F948C]`}>
        <span className="text-left">Student</span><span>Expected now</span><span>Start</span><span>Mid</span><span>End</span><span className="text-[#121314]">Live now</span><span className="text-left">Growth this year</span>
      </div>
      {ROWS.map((r) => {
        const first = r.s ?? r.m ?? r.e;
        const growth = first == null ? null : r.live - first;
        return (
          <div key={r.last} className={`${cols} border-b border-[#F1F2EE] px-5 py-2.5 text-center last:border-0 hover:bg-[#FAFBF8]`}>
            <div className="flex min-w-0 items-center justify-between gap-3 text-left">
              <p className="truncate text-sm font-black text-[#121314]">{r.first} {r.last}<span className="ml-2 text-xs font-semibold text-[#8F948C]">Y{r.year}</span></p>
              <span className="shrink-0 rounded-full border border-[#121314] px-3 py-1 text-xs font-bold">Report</span>
            </div>
            <span className="text-sm font-bold tabular-nums text-[#8F948C]">{r.year.toFixed(1)}</span>
            <Cell v={r.s} year={r.year} at={0.75} /><Cell v={r.m} year={r.year} at={0.5} /><Cell v={r.e} year={r.year} />
            <Cell v={r.live} year={r.year} />
            {growth == null ? <span className="text-left text-xs font-semibold text-[#A3A7A1]">No diagnostic yet</span> : (
              <div className="flex items-center gap-2 text-left">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ECEDE9]"><div className="h-full rounded-full bg-[#121314]" style={{ width: `${Math.min(100, Math.max(4, growth * 80))}%` }} /></div>
                <span className="w-10 text-xs font-black tabular-nums text-[#121314]">+{growth.toFixed(1)}</span>
              </div>
            )}
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2 border-t border-[#E3E5E0] bg-[#FAFBF8] px-5 py-3 text-[11px] font-bold">
        {(["wellBelow", "below", "at", "above"] as const).map((k) => <span key={k} className="rounded-full px-2.5 py-1" style={{ background: STANDING_META[k].bg, color: STANDING_META[k].fg }}>{STANDING_META[k].label}</span>)}
        <span className="self-center font-semibold text-[#8F948C]">Each score is coloured against where the student was expected to be when they sat it (Start in Term 1, Mid in Term 2, End in Term 4).</span>
      </div>
    </div>
  );
}

/* ── Option D: C's table; click a student to open their growth line. ── */
// Pretend timing: Start in Term 1, Mid in Term 2, End in Term 4, now Term 4.
const CHECKPOINT_TERM = { S: 1, M: 2, E: 4 } as const;
const NOW_TERM = 4;

function expectedGrowth(row: Row) {
  const firstKey = row.s != null ? "S" : row.m != null ? "M" : row.e != null ? "E" : null;
  return firstKey ? (NOW_TERM - CHECKPOINT_TERM[firstKey]) * 0.25 : null;
}

function GrowthDetail({ row }: { row: Row }) {
  const checkpoints = ([["S", "Start", row.s], ["M", "Mid", row.m], ["E", "End", row.e]] as const).filter(([, , v]) => v != null) as Array<readonly ["S" | "M" | "E", string, number]>;
  const from = checkpoints.length ? checkpoints[0][2] : row.live;
  const growth = checkpoints.length ? row.live - from : null;
  const target = expectedGrowth(row);
  const liveMeta = STANDING_META[standingForGap(row.live - row.year)];
  const lo = Math.max(0, Math.floor(Math.min(from, row.year - 1)));
  const hi = Math.min(8, Math.ceil(Math.max(row.live, row.year)) + 1);
  const x = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;
  return (
    <div className="grid gap-5 border-t border-[#E3E5E0] bg-[#FAFBF8] px-5 py-5 lg:grid-cols-[1fr_260px]">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8F948C]">Growth line · {row.first}</p>
        <div className="relative mx-3 mt-8 h-24">
          {/* level scale, zoomed to this student */}
          {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((lvl) => (
            <span key={lvl} className="absolute top-12 -translate-x-1/2 text-center" style={{ left: x(lvl) }}>
              <span className="mx-auto block h-3 w-px bg-[#C9CCC6]" />
              <span className="mt-1 block whitespace-nowrap text-[10px] font-black text-[#8F948C]">{lvl === 0 ? "Prep" : `Level ${lvl}`}</span>
            </span>
          ))}
          <span className="absolute inset-x-0 top-[54px] h-px bg-[#D9DBD4]" />
          {/* where they should be now */}
          <span className="absolute top-0 h-[66px] w-0 -translate-x-1/2 border-l-2 border-dashed border-[#121314]/40" style={{ left: x(row.year) }} />
          <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-[#5A5E63]" style={{ left: x(row.year) }}>Expected now {row.year.toFixed(1)}</span>
          {/* growth path */}
          <span className="absolute top-[52px] h-1.5 rounded-full bg-[#121314]" style={{ left: x(from), width: `${((row.live - from) / (hi - lo)) * 100}%` }} />
          {checkpoints.map(([k, label, v]) => (
            <span key={k} className="absolute top-[47px] -translate-x-1/2" style={{ left: x(v) }}>
              <span className="block h-4 w-4 rounded-full border-[3px] border-[#121314] bg-white" />
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#121314] px-1.5 py-0.5 text-[10px] font-black text-white">{label} {v.toFixed(1)}</span>
            </span>
          ))}
          <span className="absolute top-[45px] -translate-x-1/2" style={{ left: x(row.live) }}>
            <span className="block h-5 w-5 rounded-full ring-4 ring-[#FAFBF8]" style={{ background: liveMeta.bg === "#121314" ? "#5FAE00" : liveMeta.bg }} />
            <span className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-black" style={{ background: liveMeta.bg, color: liveMeta.fg }}>Now {row.live.toFixed(1)}</span>
          </span>
        </div>
      </div>
      <div className="grid content-start gap-3 rounded-2xl border border-[#E3E5E0] bg-white p-4">
        <span className="inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-black" style={{ background: liveMeta.bg, color: liveMeta.fg }}>{liveMeta.label}</span>
        {growth == null || target == null ? (
          <p className="text-sm text-[#5A5E63]">No diagnostic yet. The line starts at their first Start, Mid or End test.</p>
        ) : (
          <>
            <p className="text-sm text-[#121314]"><b>+{growth.toFixed(1)} levels</b> since {checkpoints[0][1]}</p>
            <p className="text-sm text-[#5A5E63]">Expected +{target.toFixed(2)} in that time.</p>
            <p className={`text-sm font-black ${growth >= target ? "text-[#3D6600]" : "text-[#8A5A00]"}`}>{growth >= target ? "Growing faster than expected" : "Growing slower than expected"}</p>
          </>
        )}
        <span className="mt-1 inline-flex w-fit rounded-full bg-[#121314] px-4 py-2 text-xs font-bold text-white">Open full report</span>
      </div>
    </div>
  );
}

function OptionD() {
  const [open, setOpen] = useState<string | null>("Ambrose");
  const cols = "grid grid-cols-[minmax(200px,1.4fr)_repeat(5,minmax(64px,0.55fr))_minmax(150px,1fr)_24px] items-center gap-4";
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white">
      <div className={`${cols} sticky top-0 z-10 border-b border-[#E3E5E0] bg-[#FAFBF8] px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#8F948C]`}>
        <span className="text-left">Student</span><span>Expected now</span><span>Start</span><span>Mid</span><span>End</span><span className="text-[#121314]">Live now</span><span className="text-left">Growth vs expected</span><span />
      </div>
      {ROWS.map((r) => {
        const first = r.s ?? r.m ?? r.e;
        const growth = first == null ? null : r.live - first;
        const target = expectedGrowth(r);
        const isOpen = open === r.last;
        return (
          <div key={r.last} className="border-b border-[#F1F2EE] last:border-0">
            <button type="button" onClick={() => setOpen(isOpen ? null : r.last)} aria-expanded={isOpen} className={`${cols} w-full px-5 py-2.5 text-center transition hover:bg-[#FAFBF8] ${isOpen ? "bg-[#FAFBF8]" : ""}`}>
              <p className="truncate text-left text-sm font-black text-[#121314]">{r.first} {r.last}<span className="ml-2 text-xs font-semibold text-[#8F948C]">Y{r.year}</span></p>
              <span className="text-sm font-bold tabular-nums text-[#8F948C]">{r.year.toFixed(1)}</span>
              <Cell v={r.s} year={r.year} at={0.75} /><Cell v={r.m} year={r.year} at={0.5} /><Cell v={r.e} year={r.year} />
              <Cell v={r.live} year={r.year} />
              {growth == null || target == null ? <span className="text-left text-xs font-semibold text-[#A3A7A1]">No diagnostic yet</span> : (
                <div className="flex items-center gap-2 text-left" title={`+${growth.toFixed(1)} since first test · expected +${target.toFixed(2)}`}>
                  <div className="relative h-2 flex-1 rounded-full bg-[#ECEDE9]">
                    <div className={`h-full rounded-full ${growth >= target ? "bg-[#5FAE00]" : "bg-[#F0A23B]"}`} style={{ width: `${Math.min(100, (growth / 1.25) * 100)}%` }} />
                    <span className="absolute -top-1 h-4 w-0.5 rounded bg-[#121314]" style={{ left: `${Math.min(100, (target / 1.25) * 100)}%` }} />
                  </div>
                  <span className="w-10 text-xs font-black tabular-nums text-[#121314]">+{growth.toFixed(1)}</span>
                </div>
              )}
              <ChevronDown className={`h-4 w-4 text-[#8F948C] transition ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen ? <GrowthDetail row={r} /> : null}
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-2 border-t border-[#E3E5E0] bg-[#FAFBF8] px-5 py-3 text-[11px] font-bold">
        {(["wellBelow", "below", "at", "above"] as const).map((k) => <span key={k} className="rounded-full px-2.5 py-1" style={{ background: STANDING_META[k].bg, color: STANDING_META[k].fg }}>{STANDING_META[k].label}</span>)}
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#8F948C]"><span className="h-3 w-0.5 rounded bg-[#121314]" />Growth bar mark = growth expected since their first test (a quarter of a level per term). Green = ahead of it.</span>
      </div>
    </div>
  );
}

export default function DiagnosticRedesignReview() {
  return (
    <main className="reliq-adult min-h-screen bg-[#F4F4F0] px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-4">
        <section className="mb-10 grid gap-3">
          <div>
            <h1 className="font-display text-2xl font-black uppercase tracking-tight text-[#121314]">Option D — C table, click a student for their growth line</h1>
            <p className="text-sm text-[#5A5E63]">Pretend data. Tap any row to open or close it. The growth bar now shows growth against what&apos;s expected since their first test.</p>
          </div>
          <OptionD />
        </section>
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-[#121314]">Option A — track with expected line</h1>
          <p className="text-sm text-[#5A5E63]">One header row, one pinned scale, and one compact track per student with an &ldquo;expected now&rdquo; marker. Hover anything for exact numbers.</p>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-[#E3E5E0] bg-white px-3 py-2.5">
          <div className="flex items-center gap-1 rounded-xl bg-[#F1F2EE] p-1 text-sm font-bold">
            <span className="px-4 py-2 text-[#3F4246]">Live Class</span>
            <span className="px-4 py-2 text-[#3F4246]">Students</span>
            <span className="rounded-lg bg-[#121314] px-4 py-2 text-[#83E300]">Diagnostic</span>
            <span className="px-4 py-2 text-[#3F4246]">Curriculum</span>
          </div>
          <span className="pr-2 text-sm font-semibold text-[#5A5E63]">24 students</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white">
          {/* One header row */}
          <div className="flex flex-wrap items-center gap-4 border-b border-[#E3E5E0] px-5 py-4">
            <h2 className="font-display text-xl font-black text-[#121314]">Whole-Maths Diagnostic</h2>
            <div className="flex items-center gap-1 rounded-xl bg-[#F1F2EE] p-1 text-sm font-bold">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#121314] px-3.5 py-1.5 text-white"><TrendingUp className="h-4 w-4" />Live progression</span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[#3F4246]"><ListChecks className="h-4 w-4" />Run diagnostic</span>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#D9DBD4] px-3.5 py-1.5 text-sm font-bold text-[#121314]"><Info className="h-4 w-4" />How scoring works</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#E3E5E0] px-5 py-3">
            {["All", "Number", "Measurement", "Space", "Statistics", "Algebra", "Probability"].map((r, i) => (
              <span key={r} className={`rounded-full border-2 border-[#121314] px-3.5 py-1.5 text-[13px] font-bold ${i === 0 ? "bg-[#121314] text-white" : "bg-white text-[#121314]"}`}>{r}</span>
            ))}
            <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-[#D9DBD4] px-3.5 py-1.5 text-sm font-bold text-[#121314]"><ArrowUpDown className="h-4 w-4" />Furthest behind first<ChevronDown className="h-4 w-4" /></span>
          </div>

          {/* Legend + pinned scale */}
          <div className="sticky top-0 z-10 border-b border-[#E3E5E0] bg-[#FAFBF8] px-5 pb-2 pt-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-semibold text-[#5A5E63]">
              <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#5FAE00]" />Live level</span>
              <span className="inline-flex items-center gap-1.5"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#121314] text-[8px] font-black text-white">S</span>Diagnostic: Start · Mid · End</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-4 border-l-2 border-dashed border-[#121314]" />Expected now for their school year</span>
              <span className="text-[#8F948C]">“All” needs results from all six strands.</span>
            </div>
            <div className={`${COLS} mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#8F948C]`}>
              <span>Student</span>
              <span>Standing</span>
              <div className="relative h-4">
                {SCALE.map((label, i) => <span key={label} className="absolute -translate-x-1/2" style={{ left: pos(i) }}>{label}</span>)}
              </div>
            </div>
          </div>

          {ROWS.map((r) => (
            <div key={r.last} className={`${COLS} border-b border-[#F1F2EE] px-5 py-3 last:border-0 hover:bg-[#FAFBF8]`}>
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#121314]">{r.first} {r.last}</p>
                  <p className="text-xs font-semibold text-[#8F948C]">Year {r.year}</p>
                </div>
                <span className="shrink-0 rounded-full border border-[#121314] px-3 py-1 text-xs font-bold text-[#121314]">Report</span>
              </div>
              <Standing row={r} />
              <Track row={r} />
            </div>
          ))}
        </div>
        <section className="mt-10 grid gap-3">
          <div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-[#121314]">Option B — growth line</h2>
            <p className="text-sm text-[#5A5E63]">One thin lane. Checkpoints are small rings joined by a black growth line ending at the live dot, coloured by standing. Expected is a faint notch. Growth written on the right.</p>
          </div>
          <OptionB />
        </section>
        <section className="mt-10 grid gap-3">
          <div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-[#121314]">Option C — numbers first</h2>
            <p className="text-sm text-[#5A5E63]">No track. Expected, Start, Mid, End and Live now as levels, each coloured by standing, plus growth this year. Quickest to read and print.</p>
          </div>
          <OptionC />
        </section>
      </div>
    </main>
  );
}
