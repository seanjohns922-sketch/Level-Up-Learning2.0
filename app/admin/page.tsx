import { ArrowRight, ChevronRight, Plus, RefreshCw, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loadPlatformAdminHome } from "@/lib/platform-admin-server";
import { schoolTerm } from "@/lib/proficiency";

/** Platform admin home: task-first. What needs doing, the numbers, then the schools. */

const AQUA = "#2EE6E0";
const AQUA_INK = "#0E7C86";
const DAY = 86400000;

const SHORT_DATE = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", day: "numeric", month: "short" });
const LONG_DATE = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", weekday: "long", day: "numeric", month: "long" });
const HOUR = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", hourCycle: "h23" });

type Task = { key: string; tag: string; tone: "red" | "amber"; school: string; detail: string; action: string; href: string };
const TONE = { red: "bg-[#FDE7E4] text-[#B42318]", amber: "bg-[#FFF3DC] text-[#8A5A00]" } as const;

function taskFromAttention(item: { schoolId: string; schoolName: string; severity: string; category: string; detail: string }, index: number): Task {
  const category = item.category.toLowerCase();
  const setup = /admin/.test(category);
  const usage = /seat|capacity/.test(category);
  return {
    key: `${item.schoolId}-${item.category}-${index}`,
    tag: setup ? "Setup" : usage ? "Usage" : item.category,
    tone: item.severity === "critical" ? "red" : "amber",
    school: item.schoolName,
    detail: item.detail,
    action: setup ? "Invite admin" : usage ? "Review seats" : "Open school",
    href: `/admin/schools/${item.schoolId}`,
  };
}

function Stat({ label, value, sub, bar }: { label: string; value: string | number; sub?: string; bar?: number }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-bold text-[#5A5E63]">{label}</p>
      <p className="mt-1 font-display text-3xl font-black tracking-tight text-[#121314] tabular-nums">{value}</p>
      {bar !== undefined ? (
        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[#ECEDE9]"><span className="block h-full rounded-full" style={{ width: `${Math.min(100, bar)}%`, background: bar >= 90 ? "#D08A00" : AQUA_INK }} /></span>
      ) : null}
      {sub ? <p className="mt-1 text-xs text-[#8F948C]">{sub}</p> : null}
    </div>
  );
}

function Panel({ title, link, children, className = "" }: { title: string; link?: { href: string; label: string }; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#E3E5E0] bg-white px-5 py-4 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-black text-[#121314]">{title}</h2>
        {link ? <Link href={link.href} className="text-xs font-bold hover:underline" style={{ color: AQUA_INK }}>{link.label} →</Link> : null}
      </div>
      {children}
    </section>
  );
}

export default async function PlatformAdminOverviewPage() {
  const data = await loadPlatformAdminHome();
  if (!data) redirect("/login");
  const { access, snapshot, schools, engagement, homeUsers, licences } = data;

  const now = new Date(snapshot.generatedAt);
  const hour = Number(HOUR.format(now));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = (access.context.displayName ?? "").split(" ")[0] || "there";
  const term = schoolTerm(snapshot.generatedAt);
  const nextYear = now.getFullYear() + 1;

  const current = schools.filter((school) => school.status !== "archived");
  const activeSchools = current.filter((school) => school.status === "active").length;
  const trialSchools = current.filter((school) => school.status === "trial").length;
  const studentsWithAccess = snapshot.userMix.schoolOnly + snapshot.userMix.schoolAndHome + snapshot.userMix.homeOnly;
  const notActive30d = Math.max(0, studentsWithAccess - snapshot.activity.active30d);
  const weekChange = snapshot.activity.active7d - snapshot.activity.previous7d;
  const seatPercent = snapshot.scale.schoolSeats > 0 ? Math.round((snapshot.scale.seatsUsed / snapshot.scale.schoolSeats) * 100) : 0;
  const homeTotal = snapshot.userMix.schoolAndHome + snapshot.userMix.homeOnly;
  const conversion = snapshot.growth.schoolStudents === 0 ? 0 : Math.round((snapshot.growth.homeActivated / snapshot.growth.schoolStudents) * 1000) / 10;

  // Next year's licence per school (null when the renewal update isn't applied).
  const renewed = (schoolId: string) => licences?.get(schoolId)?.some((licence) => licence.calendarYear === nextYear) ?? null;
  const renewalTasks: Task[] = licences
    ? current
      .filter((school) => renewed(school.id) === false && school.licenceEndDate && new Date(school.licenceEndDate).getFullYear() <= now.getFullYear())
      .map((school) => ({
        key: `${school.id}-renewal`,
        tag: "Renewal",
        tone: "amber" as const,
        school: school.name,
        detail: `${school.status === "trial" ? "Trial" : `${now.getFullYear()} licence`} ends ${SHORT_DATE.format(new Date(school.licenceEndDate!))} · no ${nextYear} licence`,
        action: `Add ${nextYear} licence`,
        href: `/admin/schools/${school.id}`,
      }))
    : [];
  const attentionTasks = snapshot.attention
    .filter((item) => item.severity === "critical" || item.severity === "attention")
    .map(taskFromAttention);
  const tasks = [...attentionTasks.filter((task) => task.tone === "red"), ...renewalTasks, ...attentionTasks.filter((task) => task.tone !== "red")];
  const signed = licences ? current.filter((school) => renewed(school.id)).length : 0;

  const activeBySchool = new Map((engagement?.schools ?? []).map((row) => [row.schoolId, row.active7d]));
  const schoolRows = [...current].sort((a, b) => (b.lastActive ? Date.parse(b.lastActive) : 0) - (a.lastActive ? Date.parse(a.lastActive) : 0));

  const homeStudents = homeUsers?.students ?? [];
  const latestHome = [...homeStudents].filter((student) => student.homeStartedAt).sort((a, b) => Date.parse(b.homeStartedAt!) - Date.parse(a.homeStartedAt!)).slice(0, 3);
  const homeActive7d = homeStudents.filter((student) => student.lastActiveAt && now.getTime() - Date.parse(student.lastActiveAt) <= 7 * DAY).length;

  const weekMax = Math.max(1, snapshot.activity.active7d, snapshot.activity.previous7d);

  return (
    <>
      {/* Find anything, act fast */}
      <div className="flex flex-wrap items-center gap-3">
        <form action="/admin/users" className="flex h-11 min-w-[280px] flex-1 items-center gap-2 rounded-xl border border-[#E3E5E0] bg-white px-4 focus-within:border-[#121314]">
          <Search className="h-4 w-4 shrink-0 text-[#8F948C]" aria-hidden="true" />
          <input name="q" type="search" aria-label="Find a teacher, student or parent" placeholder="Find a teacher, student or parent…" className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-[#8F948C]" />
        </form>
        <Link href="/admin/schools" className="inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-black text-[#121314]" style={{ background: AQUA }}><Plus className="h-4 w-4" aria-hidden="true" />New school</Link>
        <Link href="/admin/schools" className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-[#121314] bg-white px-4 text-sm font-bold text-[#121314] hover:bg-[#F4F5F1]"><UserPlus className="h-4 w-4" aria-hidden="true" />Invite admin</Link>
        <Link href="/admin/schools" className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-[#121314] bg-white px-4 text-sm font-bold text-[#121314] hover:bg-[#F4F5F1]"><RefreshCw className="h-4 w-4" aria-hidden="true" />Renew licence</Link>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-[#5A5E63]">{LONG_DATE.format(now)}{term ? ` · Term ${term.term}` : ""}</p>
        <h1 className="font-display text-3xl font-black tracking-tight text-[#121314]">{greeting}, {firstName}</h1>
      </div>

      {/* The numbers in one strip */}
      <section aria-label="Platform summary" className="mt-5 grid divide-y divide-[#EDEEE9] overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white sm:grid-cols-3 sm:divide-x xl:grid-cols-6 xl:divide-y-0">
        <Stat label="Schools" value={snapshot.scale.schools} sub={`${activeSchools} active · ${trialSchools} trial`} />
        <Stat label="Students with access" value={studentsWithAccess} sub={snapshot.userMix.inactive ? `${snapshot.userMix.inactive} older records without access` : undefined} />
        <Stat label="Seats used" value={`${snapshot.scale.seatsUsed} / ${snapshot.scale.schoolSeats}`} bar={seatPercent} sub={`${seatPercent}% of school seats`} />
        <Stat label="Active this week" value={snapshot.activity.active7d} sub={weekChange === 0 ? "Same as last week" : `${weekChange > 0 ? "▲" : "▼"} ${Math.abs(weekChange)} on last week`} />
        <Stat label="Educators" value={snapshot.scale.educators} sub={`across ${current.length} schools`} />
        <Stat label="Home users" value={homeTotal} sub={`${conversion}% school-to-home`} />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <div className="flex flex-col gap-5">
          {/* To do: every row has its action */}
          <section className="rounded-2xl border border-[#E3E5E0] bg-white">
            <div className="flex items-baseline justify-between border-b border-[#EDEEE9] px-5 py-4">
              <h2 className="font-display text-lg font-black text-[#121314]">To do <span className="ml-1 rounded-full bg-[#121314] px-2 py-0.5 text-xs text-white">{tasks.length}</span></h2>
              <span className="text-xs font-semibold text-[#8F948C]">Setup · Renewals · Usage</span>
            </div>
            {tasks.length === 0 ? <p className="px-5 py-8 text-sm text-[#5A5E63]">Nothing needs doing right now.</p> : null}
            {tasks.slice(0, 8).map((task) => (
              <div key={task.key} className="flex items-center gap-4 border-b border-[#F1F2EE] px-5 py-3 last:border-0">
                <span className={`w-20 shrink-0 truncate rounded-full px-2 py-1 text-center text-[11px] font-black ${TONE[task.tone]}`}>{task.tag}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#121314]">{task.school}</p>
                  <p className="truncate text-xs text-[#5A5E63]">{task.detail}</p>
                </div>
                <Link href={task.href} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#121314] px-3 py-1.5 text-xs font-bold text-[#121314] hover:bg-[#121314] hover:text-white">{task.action}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
              </div>
            ))}
            {tasks.length > 8 ? <Link href="/admin/schools" className="block border-t border-[#F1F2EE] px-5 py-3 text-xs font-bold" style={{ color: AQUA_INK }}>{tasks.length - 8} more →</Link> : null}
          </section>

          {/* Activity: this week against last week */}
          <Panel title="Student activity" link={{ href: "/admin/analytics", label: "Analytics" }} className="flex flex-1 flex-col">
            <div className="mt-3 grid gap-2">
              {[["This week", snapshot.activity.active7d, AQUA_INK], ["Last week", snapshot.activity.previous7d, "#C9CCC6"]].map(([label, value, colour]) => (
                <div key={label as string} className="grid grid-cols-[80px_1fr_40px] items-center gap-3 text-sm">
                  <span className="text-xs font-bold text-[#5A5E63]">{label}</span>
                  <span className="block h-3 overflow-hidden rounded-full bg-[#F1F2EE]"><span className="block h-full rounded-full" style={{ width: `${((value as number) / weekMax) * 100}%`, background: colour as string }} /></span>
                  <span className="text-right font-black tabular-nums text-[#121314]">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#F1F2EE] pt-3 text-sm">
              <p><b className="font-display text-xl">{snapshot.activity.lessons7d}</b><span className="block text-xs text-[#5A5E63]">lessons this week</span></p>
              <p><b className="font-display text-xl">{snapshot.activity.quizzes7d}</b><span className="block text-xs text-[#5A5E63]">quizzes this week</span></p>
              <p><b className="font-display text-xl">{snapshot.activity.assessments30d}</b><span className="block text-xs text-[#5A5E63]">tests in 30 days</span></p>
            </div>
            <p className="mt-auto pt-3 text-xs text-[#5A5E63]"><b className="text-[#B42318]">{notActive30d} of {studentsWithAccess}</b> students haven&apos;t done any work in 30 days.</p>
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          {/* Next year's renewals */}
          <Panel title={`${nextYear} renewals`} link={{ href: "/admin/schools", label: "Schools & licences" }}>
            {licences ? (
              <>
                <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-[#ECEDE9]">
                  <span style={{ width: `${current.length ? (signed / current.length) * 100 : 0}%`, background: AQUA_INK }} />
                </div>
                <div className="mt-3 grid grid-cols-2 text-sm">
                  <p><b className="font-display text-xl">{signed}</b><span className="block text-xs text-[#5A5E63]">with a {nextYear} licence</span></p>
                  <p><b className="font-display text-xl">{current.length - signed}</b><span className="block text-xs text-[#5A5E63]">not yet</span></p>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-[#5A5E63]">Renewals appear once the licence-renewal database update is applied.</p>
            )}
          </Panel>

          {/* Home users */}
          <Panel title="Home users" link={{ href: "/admin/home", label: "Home families" }} className="flex-1">
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <p><b className="font-display text-2xl">{homeTotal}</b><span className="block text-xs text-[#5A5E63]">home users</span></p>
              <p><b className="font-display text-2xl">{snapshot.userMix.homeOnly}</b><span className="block text-xs text-[#5A5E63]">home only</span></p>
              <p><b className="font-display text-2xl">{snapshot.userMix.schoolAndHome}</b><span className="block text-xs text-[#5A5E63]">school + home</span></p>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-[#3F4246]">School-to-home</span>
                <span className="text-[#5A5E63]"><b className="text-[#121314]">{conversion}%</b> · {snapshot.growth.homeActivated} of {snapshot.growth.schoolStudents} school students</span>
              </div>
              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#ECEDE9]"><span className="block h-full rounded-full" style={{ width: `${Math.max(conversion, conversion > 0 ? 2 : 0)}%`, background: AQUA_INK }} /></span>
            </div>
            {homeUsers ? (
              <>
                <div className="mt-3 border-t border-[#F1F2EE] pt-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8F948C]">Latest sign-ups</p>
                  {latestHome.length === 0 ? <p className="mt-2 text-xs text-[#5A5E63]">No home sign-ups yet.</p> : null}
                  {latestHome.map((student) => (
                    <Link key={student.studentId} href={`/admin/users/students/${student.studentId}`} className="mt-2 flex items-center justify-between gap-3 text-sm hover:underline">
                      <span className="min-w-0 truncate"><b className="text-[#121314]">{student.studentName}</b><span className="ml-2 text-xs text-[#5A5E63]">{student.segment === "home_only" ? "Home only" : `${student.schoolName ?? "School"} · linked`}</span></span>
                      <span className="shrink-0 text-xs text-[#8F948C]">{SHORT_DATE.format(new Date(student.homeStartedAt!))}</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 border-t border-[#F1F2EE] pt-3">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-bold text-[#3F4246]">Active at home this week</span>
                    <span className="text-[#5A5E63]"><b className="text-[#121314]">{homeActive7d} of {homeStudents.length}</b> home users</span>
                  </div>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#ECEDE9]"><span className="block h-full rounded-full" style={{ width: `${homeStudents.length ? (homeActive7d / homeStudents.length) * 100 : 0}%`, background: AQUA_INK }} /></span>
                </div>
              </>
            ) : null}
          </Panel>
        </div>
      </div>

      {/* Schools at a glance */}
      <section className="mt-5 overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white">
        <div className="flex items-baseline justify-between border-b border-[#EDEEE9] px-5 py-4">
          <h2 className="font-display text-lg font-black text-[#121314]">Schools</h2>
          <Link href="/admin/schools" className="text-xs font-bold hover:underline" style={{ color: AQUA_INK }}>All schools →</Link>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[1.6fr_0.7fr_1.2fr_0.8fr_0.8fr_0.8fr_24px] gap-4 border-b border-[#EDEEE9] bg-[#FAFBF8] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#8F948C]">
              <span>School</span><span>Status</span><span>Seats</span><span>Active this week</span><span>Last active</span><span>{nextYear}</span><span />
            </div>
            {schoolRows.map((school) => {
              const pct = school.seatLimit ? school.used / school.seatLimit : 0;
              const isRenewed = renewed(school.id);
              return (
                <Link key={school.id} href={`/admin/schools/${school.id}`} className="grid grid-cols-[1.6fr_0.7fr_1.2fr_0.8fr_0.8fr_0.8fr_24px] items-center gap-4 border-b border-[#F1F2EE] px-5 py-3 last:border-0 hover:bg-[#FAFBF8]">
                  <span className="truncate text-sm font-bold text-[#121314]">{school.name}</span>
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-black capitalize ${school.status === "active" ? "bg-[#E6FAF9] text-[#0E7C86]" : school.status === "paused" ? "bg-[#FFF3DC] text-[#8A5A00]" : "bg-[#F1F2EE] text-[#5A5E63]"}`}>{school.status}</span>
                  <span>
                    <span className="block text-xs font-semibold tabular-nums text-[#3F4246]">{school.used} / {school.seatLimit}</span>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#ECEDE9]"><span className="block h-full rounded-full" style={{ width: `${Math.min(100, pct * 100)}%`, background: pct > 0.85 ? "#D08A00" : AQUA_INK }} /></span>
                  </span>
                  <span className="text-sm font-bold tabular-nums text-[#121314]">{activeBySchool.get(school.id) ?? "—"}</span>
                  <span className="text-xs text-[#5A5E63]">{school.lastActive ? SHORT_DATE.format(new Date(school.lastActive)) : "—"}</span>
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-black ${isRenewed ? "bg-[#E6FAF9] text-[#0E7C86]" : "bg-[#F1F2EE] text-[#5A5E63]"}`}>{isRenewed === null ? "—" : isRenewed ? "Signed" : "Not yet"}</span>
                  <ChevronRight className="h-4 w-4 text-[#C9CCC6]" aria-hidden="true" />
                </Link>
              );
            })}
            {schoolRows.length === 0 ? <p className="px-5 py-8 text-sm text-[#5A5E63]">No schools yet.</p> : null}
          </div>
        </div>
      </section>
    </>
  );
}
