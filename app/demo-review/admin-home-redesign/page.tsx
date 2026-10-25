"use client";

import { ArrowRight, ChevronRight, LogOut, Plus, RefreshCw, Search, Settings, UserPlus } from "lucide-react";
import { RELIQ_LETTERS_PATH, RELIQ_Q_PATH } from "@/lib/brand-reliq-logo-paths";

/** Review-only: a task-first platform admin home. Same aqua + Carbon, no icon tiles. Numbers from the live console. */

const AQUA = "#2EE6E0";
const AQUA_INK = "#0E7C86";

const NAV = [
  { group: "Run the business", items: [["Overview", true], ["Schools & licences", false], ["Renewals 2027", false]] },
  { group: "People", items: [["Users", false], ["Identity", false], ["Home families", false]] },
  { group: "Insights", items: [["Growth", false], ["Analytics", false]] },
  { group: "System", items: [["Audit log", false]] },
] as const;

const TASKS = [
  { tag: "Setup", school: "Numurkah Primary School", text: "No school administrator", action: "Invite admin", tone: "red" },
  { tag: "Setup", school: "St Anthony's Wanneroo", text: "No school administrator", action: "Invite admin", tone: "red" },
  { tag: "Renewal", school: "St Patrick's Stawell", text: "Trial ends 31 Dec · no 2027 licence", action: "Add 2027 licence", tone: "amber" },
  { tag: "Renewal", school: "Cobram Primary School", text: "2026 licence ends 31 Dec · no 2027 licence", action: "Add 2027 licence", tone: "amber" },
  { tag: "Usage", school: "Mr Johns School", text: "109 of 120 seats used", action: "Review seats", tone: "amber" },
] as const;

const SCHOOLS = [
  { name: "Cobram Primary School", status: "Active", seats: [70, 350], active: 11, last: "21 Oct", renewal: "Not yet" },
  { name: "Mr Johns School", status: "Active", seats: [109, 120], active: 3, last: "9 Oct", renewal: "Signed" },
  { name: "St Patrick's Stawell", status: "Trial", seats: [25, 129], active: 1, last: "14 Oct", renewal: "Not yet" },
  { name: "St Anthony's Wanneroo", status: "Trial", seats: [32, 120], active: 0, last: "2 Oct", renewal: "Talking" },
  { name: "Numurkah Primary School", status: "Trial", seats: [0, 100], active: 0, last: "—", renewal: "Signed" },
];

const WEEKS = [4, 6, 9, 7, 12, 10, 14, 11, 9, 13, 9, 15];

function Logo() {
  return (
    <svg viewBox="0 0 279 79" className="h-auto w-[104px]" role="img" aria-label="RELIQ">
      <path fill="#FFFFFF" d={RELIQ_LETTERS_PATH} />
      <path fill={AQUA} d={RELIQ_Q_PATH} />
    </svg>
  );
}

function Stat({ label, value, sub, extra }: { label: string; value: string; sub: string; extra?: React.ReactNode }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-bold text-[#5A5E63]">{label}</p>
      <p className="mt-1 font-display text-3xl font-black tracking-tight text-[#121314]">{value}</p>
      {extra}
      <p className="mt-1 text-xs text-[#8F948C]">{sub}</p>
    </div>
  );
}

const TONE = { red: "bg-[#FDE7E4] text-[#B42318]", amber: "bg-[#FFF3DC] text-[#8A5A00]" } as const;

export default function AdminHomeRedesign() {
  return (
    <div className="reliq-adult admin-console flex min-h-screen bg-[#F4F4F0]">
      {/* Sidebar: same Carbon, grouped by job */}
      <aside className="flex w-60 shrink-0 flex-col bg-[#121314] px-4 py-6 text-white">
        <div className="px-2"><Logo /><p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: AQUA }}>Platform admin</p></div>
        <nav className="mt-8 grid gap-6">
          {NAV.map((section) => (
            <div key={section.group}>
              <p className="px-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#6E736C]">{section.group}</p>
              <div className="mt-2 grid gap-0.5">
                {section.items.map(([label, active]) => (
                  <span key={label} className={`relative rounded-lg px-3 py-2 text-sm font-semibold ${active ? "bg-[#1E2022] text-white" : "text-[#A9ADA6] hover:bg-[#1A1C1E] hover:text-white"}`}>
                    {active ? <span className="absolute inset-y-2 left-0 w-1 rounded-full" style={{ background: AQUA }} /> : null}
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-auto grid gap-1 border-t border-[#232527] pt-4">
          <p className="px-2 text-sm font-bold">Sean <span className="font-normal text-[#8F948C]">· Owner</span></p>
          <span className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#A9ADA6]"><Settings className="h-4 w-4" />Settings</span>
          <span className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#A9ADA6]"><LogOut className="h-4 w-4" />Sign out</span>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-8 py-6">
        {/* Top bar: search everything + quick actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 min-w-[320px] flex-1 items-center gap-2 rounded-xl border border-[#E3E5E0] bg-white px-4 text-sm text-[#8F948C]">
            <Search className="h-4 w-4" />Find a school, teacher, student or parent…<span className="ml-auto rounded-md border border-[#E3E5E0] px-1.5 text-[11px] font-bold">⌘K</span>
          </div>
          <span className="inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-black text-[#121314]" style={{ background: AQUA }}><Plus className="h-4 w-4" />New school</span>
          <span className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-[#121314] bg-white px-4 text-sm font-bold text-[#121314]"><UserPlus className="h-4 w-4" />Invite admin</span>
          <span className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-[#121314] bg-white px-4 text-sm font-bold text-[#121314]"><RefreshCw className="h-4 w-4" />Renew licence</span>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[#5A5E63]">Wednesday 22 October · Term 4, week 3</p>
            <h1 className="font-display text-3xl font-black tracking-tight text-[#121314]">Good afternoon, Sean</h1>
          </div>
          <span className="rounded-full border-2 border-[#121314] px-3 py-1 text-xs font-black uppercase tracking-wide">2026 free access</span>
        </div>

        {/* Numbers in one strip, no icons */}
        <section className="mt-5 grid divide-x divide-[#EDEEE9] overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white sm:grid-cols-3 xl:grid-cols-6">
          <Stat label="Schools" value="7" sub="3 active · 4 trial" />
          <Stat label="Students with access" value="238" sub="27 older records without access" />
          <Stat label="Seats used" value="236 / 819" sub="29% of school seats" extra={<span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[#ECEDE9]"><span className="block h-full w-[29%] rounded-full" style={{ background: AQUA_INK }} /></span>} />
          <Stat label="Active this week" value="15" sub="▲ 6 on last week" />
          <Stat label="Educators" value="11" sub="across 7 schools" />
          <Stat label="Home users" value="4" sub="0.8% school-to-home" />
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-5">
          {/* To do: every row has its action */}
          <section className="rounded-2xl border border-[#E3E5E0] bg-white">
            <div className="flex items-baseline justify-between border-b border-[#EDEEE9] px-5 py-4">
              <h2 className="font-display text-lg font-black text-[#121314]">To do <span className="ml-1 rounded-full bg-[#121314] px-2 py-0.5 text-xs text-white">{TASKS.length}</span></h2>
              <span className="text-xs font-semibold text-[#8F948C]">Setup · Renewals · Usage</span>
            </div>
            {TASKS.map((task) => (
              <div key={task.school + task.text} className="flex items-center gap-4 border-b border-[#F1F2EE] px-5 py-3 last:border-0">
                <span className={`w-20 shrink-0 rounded-full px-2 py-1 text-center text-[11px] font-black ${TONE[task.tone]}`}>{task.tag}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#121314]">{task.school}</p>
                  <p className="text-xs text-[#5A5E63]">{task.text}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#121314] px-3 py-1.5 text-xs font-bold text-[#121314]">{task.action}<ArrowRight className="h-3.5 w-3.5" /></span>
              </div>
            ))}
          </section>
            {/* Weekly activity */}
            <section className="flex flex-1 flex-col rounded-2xl border border-[#E3E5E0] bg-white px-5 py-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-black text-[#121314]">Students active each week</h2>
                <span className="text-xs text-[#8F948C]">Last 12 weeks</span>
              </div>
              <div className="mt-3 flex min-h-14 flex-1 items-end gap-1.5">
                {WEEKS.map((value, index) => (
                  <span key={index} title={`${value} students`} className="flex-1 rounded-t-md" style={{ height: `${(value / 15) * 100}%`, background: index === WEEKS.length - 1 ? AQUA_INK : "#D9DBD4" }} />
                ))}
              </div>
              <p className="mt-2 text-xs text-[#5A5E63]"><b className="text-[#B42318]">215 of 238</b> students haven&apos;t done any work in 30 days.</p>
            </section>
          </div>

          <div className="flex flex-col gap-5">
            {/* 2027 renewals */}
            <section className="rounded-2xl border border-[#E3E5E0] bg-white px-5 py-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-black text-[#121314]">2027 renewals</h2>
                <span className="text-xs font-bold" style={{ color: AQUA_INK }}>Open renewals →</span>
              </div>
              <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-[#ECEDE9]">
                <span className="w-[28%]" style={{ background: AQUA_INK }} />
                <span className="w-[14%] bg-[#F0C24B]" />
              </div>
              <div className="mt-3 grid grid-cols-3 text-sm">
                <p><b className="font-display text-xl">2</b><span className="block text-xs text-[#5A5E63]">signed</span></p>
                <p><b className="font-display text-xl">1</b><span className="block text-xs text-[#5A5E63]">talking</span></p>
                <p><b className="font-display text-xl">4</b><span className="block text-xs text-[#5A5E63]">not started</span></p>
              </div>
            </section>
            {/* Home users: families using RELIQ at home */}
            <section className="flex-1 rounded-2xl border border-[#E3E5E0] bg-white px-5 py-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-black text-[#121314]">Home users</h2>
                <span className="text-xs font-bold" style={{ color: AQUA_INK }}>Open Home →</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <p><b className="font-display text-2xl">4</b><span className="block text-xs text-[#5A5E63]">home users</span></p>
                <p><b className="font-display text-2xl">2</b><span className="block text-xs text-[#5A5E63]">home only</span></p>
                <p><b className="font-display text-2xl">2</b><span className="block text-xs text-[#5A5E63]">school + home</span></p>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-bold text-[#3F4246]">School-to-home</span>
                  <span className="text-[#5A5E63]"><b className="text-[#121314]">0.8%</b> · 2 of 236 school students</span>
                </div>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#ECEDE9]"><span className="block h-full w-[2%] rounded-full" style={{ background: AQUA_INK }} /></span>
              </div>
              <div className="mt-3 border-t border-[#F1F2EE] pt-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8F948C]">Latest sign-ups</p>
                {[["Harper family", "Home only · 1 child", "18 Oct"], ["Nguyen family", "Cobram Primary · linked", "11 Oct"], ["Patel family", "Mr Johns School · linked", "2 Oct"]].map(([name, detail, when]) => (
                  <div key={name} className="mt-2 flex items-center justify-between text-sm">
                    <span><b className="text-[#121314]">{name}</b><span className="ml-2 text-xs text-[#5A5E63]">{detail}</span></span>
                    <span className="text-xs text-[#8F948C]">{when}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-[#F1F2EE] pt-3">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-bold text-[#3F4246]">Active at home this week</span>
                  <span className="text-[#5A5E63]"><b className="text-[#121314]">3 of 4</b> home users</span>
                </div>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#ECEDE9]"><span className="block h-full w-3/4 rounded-full" style={{ background: AQUA_INK }} /></span>
              </div>
            </section>
          </div>
        </div>

        {/* Schools at a glance */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white">
          <div className="flex items-baseline justify-between border-b border-[#EDEEE9] px-5 py-4">
            <h2 className="font-display text-lg font-black text-[#121314]">Schools</h2>
            <span className="text-xs font-bold" style={{ color: AQUA_INK }}>All schools →</span>
          </div>
          <div className="grid grid-cols-[1.6fr_0.7fr_1.2fr_0.8fr_0.8fr_0.8fr_24px] gap-4 border-b border-[#EDEEE9] bg-[#FAFBF8] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#8F948C]">
            <span>School</span><span>Status</span><span>Seats</span><span>Active this week</span><span>Last active</span><span>2027</span><span />
          </div>
          {SCHOOLS.map((school) => {
            const pct = school.seats[1] ? school.seats[0] / school.seats[1] : 0;
            return (
              <div key={school.name} className="grid grid-cols-[1.6fr_0.7fr_1.2fr_0.8fr_0.8fr_0.8fr_24px] items-center gap-4 border-b border-[#F1F2EE] px-5 py-3 last:border-0 hover:bg-[#FAFBF8]">
                <span className="truncate text-sm font-bold text-[#121314]">{school.name}</span>
                <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-black ${school.status === "Active" ? "bg-[#E6FAF9] text-[#0E7C86]" : "bg-[#F1F2EE] text-[#5A5E63]"}`}>{school.status}</span>
                <div>
                  <p className="text-xs font-semibold tabular-nums text-[#3F4246]">{school.seats[0]} / {school.seats[1]}</p>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#ECEDE9]"><span className="block h-full rounded-full" style={{ width: `${pct * 100}%`, background: pct > 0.85 ? "#D08A00" : AQUA_INK }} /></span>
                </div>
                <span className="text-sm font-bold tabular-nums text-[#121314]">{school.active}</span>
                <span className="text-xs text-[#5A5E63]">{school.last}</span>
                <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-black ${school.renewal === "Signed" ? "bg-[#E6FAF9] text-[#0E7C86]" : school.renewal === "Talking" ? "bg-[#FFF3DC] text-[#8A5A00]" : "bg-[#F1F2EE] text-[#5A5E63]"}`}>{school.renewal}</span>
                <ChevronRight className="h-4 w-4 text-[#C9CCC6]" />
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
