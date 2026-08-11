import { ArrowLeft, Building2, CalendarDays, GraduationCap } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Metric } from "@/components/admin/AdminPrimitives";
import { loadPlatformStudentDetail } from "@/lib/platform-admin-server";

const date = (value: string | null) => value
  ? new Date(value).toLocaleDateString("en-AU", { timeZone: "Australia/Melbourne" })
  : "No activity";

export default async function StudentDetail({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  let data;
  try { data = await loadPlatformStudentDetail(studentId); } catch { notFound(); }
  if (!data) redirect("/login");
  const s = data.detail;
  const primaryClass = s.classes.find((item) => item.primary);

  return <>
    <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><ArrowLeft className="h-4 w-4" />User Explorer</Link>
    <div className="mt-5"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Student detail · read only</p><h1 className="mt-2 text-3xl font-bold">{s.name}</h1><p className="mt-2 text-sm text-slate-500">{s.username ?? "No username"} · {s.explorerCode ?? "No Explorer Code"} · ID {s.id}</p></div>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="School" value={s.school?.name ?? "Not assigned"} icon={Building2} />
      <Metric label="Primary class" value={primaryClass?.name ?? "Not assigned"} icon={Building2} tone="blue" />
      <Metric label="Year" value={s.yearLevel ?? "Not set"} icon={GraduationCap} tone="blue" />
      <Metric label="Last activity" value={date(s.activity.lastActive)} icon={CalendarDays} tone="violet" />
    </section>
    <section className="mt-7 grid gap-6 lg:grid-cols-2">
      <div className="border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Access and classes</h2><p className="mt-1 text-sm capitalize text-slate-500">Current segment: {s.segment.replaceAll("_", " ")}</p><div className="mt-4 divide-y divide-slate-100">{s.entitlements.map((item, index) => <div key={`${item.source}-${index}`} className="py-3 text-sm"><p className="font-semibold capitalize">{item.source} entitlement · {item.status}</p><p className="text-slate-500">Billing: {item.billingStatus} · Starts {date(item.startsAt)}{item.endsAt ? ` · Ends ${date(item.endsAt)}` : ""}</p></div>)}{s.entitlements.length === 0 ? <p className="text-sm text-slate-500">No entitlement.</p> : null}</div><div className="mt-4 border-t pt-4 text-sm">{s.classes.map(item => <p key={item.id}><b>{item.name}</b>{item.primary ? " · Primary homeroom" : ""}{item.academicYear ? ` · ${item.academicYear}` : ""}</p>)}</div></div>
      <div className="border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Canonical activity</h2><dl className="mt-4 grid grid-cols-3 gap-3 text-center"><div><dt className="text-xs text-slate-500">Lessons · 7d</dt><dd className="mt-1 text-2xl font-bold">{s.activity.lessons7d}</dd></div><div><dt className="text-xs text-slate-500">Quizzes · 7d</dt><dd className="mt-1 text-2xl font-bold">{s.activity.quizzes7d}</dd></div><div><dt className="text-xs text-slate-500">Assessments · 30d</dt><dd className="mt-1 text-2xl font-bold">{s.activity.assessments30d}</dd></div></dl></div>
    </section>
    <section className="mt-7 border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Realm learning snapshots</h2><p className="mt-1 text-sm text-slate-500">Only canonical realm-scoped rows are shown. Missing placement is shown as Not placed; another realm is never used as a substitute.</p><div className="mt-5 grid gap-3 md:grid-cols-2">{s.realms.map(r => <div key={`${r.realmId}-${r.programKey}`} className="border border-slate-200 p-4"><div className="flex justify-between gap-3"><p className="font-bold">{r.programKey}</p><span className="text-xs font-bold uppercase text-slate-500">{r.pathway}</span></div><p className="mt-2 text-sm">{r.workingLevel ?? "Not placed"} · {r.currentWeek ? `Week ${r.currentWeek}` : "No active week"}</p><p className="mt-1 text-xs text-slate-500">{r.placementComplete ? "Placement complete" : "Placement not complete"} · Last activity {date(r.lastActivity)}</p></div>)}{s.realms.length === 0 ? <div className="border border-dashed border-slate-300 p-5 text-sm text-slate-500">Not placed in any realm.</div> : null}</div></section>
    <section className="mt-7 border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Linked parents</h2><div className="mt-4 divide-y divide-slate-100">{s.parents.map(p => <Link key={p.id} href={`/admin/users/adults/${p.id}`} className="flex justify-between py-3 text-sm"><span className="font-semibold">{p.name ?? p.email ?? "Parent"}</span><span className="text-slate-500">{p.relationship}</span></Link>)}{s.parents.length === 0 ? <p className="text-sm text-slate-500">No active parent link.</p> : null}</div></section>
  </>;
}
