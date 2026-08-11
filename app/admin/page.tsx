import { Activity, Building2, GraduationCap, Home, Link2, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPageHeading, Metric } from "@/components/admin/AdminPrimitives";
import { loadPlatformOperations } from "@/lib/platform-admin-server";
import type { LucideIcon } from "lucide-react";

function trend(current: number, previous: number) {
  if (previous === 0) return current === 0 ? "No change" : "New activity";
  const value = Math.round(((current - previous) / previous) * 100);
  return `${value >= 0 ? "+" : ""}${value}% vs previous period`;
}

export default async function PlatformAdminOverviewPage() {
  const data = await loadPlatformOperations();
  if (!data) redirect("/login");
  const { snapshot } = data;
  return <>
    <AdminPageHeading eyebrow="Overview" title="Platform operations" detail="Canonical scale, meaningful learning activity, school-to-home growth and operational attention. Reporting windows use Australia/Melbourne time." action={<Link href="/admin/users" className="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">Explore users</Link>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform scale">
      <Metric label="Schools" value={snapshot.scale.schools} icon={Building2} />
      <Metric label="Students" value={snapshot.scale.students} icon={GraduationCap} tone="blue" />
      <Metric label="Educators" value={snapshot.scale.educators} icon={Users} tone="violet" />
      <Metric label="Parents" value={snapshot.scale.parents} icon={Users} tone="amber" />
    </section>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform activity">
      <Metric label="Active today" value={snapshot.activity.activeToday} icon={Activity} />
      <Metric label="Active 7 days" value={snapshot.activity.active7d} detail={trend(snapshot.activity.active7d,snapshot.activity.previous7d)} icon={Activity} tone="blue" />
      <Metric label="Active 30 days" value={snapshot.activity.active30d} detail={trend(snapshot.activity.active30d,snapshot.activity.previous30d)} icon={Activity} tone="violet" />
      <Metric label="Seats used" value={`${snapshot.scale.seatsUsed}/${snapshot.scale.schoolSeats}`} icon={ShieldAlert} tone="amber" />
    </section>
    <section className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_1fr]">
      <div className="border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">User mix and growth</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {([["School only",snapshot.userMix.schoolOnly,Building2],["School + Home",snapshot.userMix.schoolAndHome,Link2],["Home only",snapshot.userMix.homeOnly,Home],["Parent linked / no home",snapshot.growth.parentLinkedNoHome,Users]] as Array<[string,number,LucideIcon]>).map(([label,value,Icon])=><div key={label} className="flex items-center gap-3 border border-slate-200 p-4"><Icon className="h-5 w-5 text-emerald-700"/><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="text-2xl font-bold tabular-nums">{value}</p></div></div>)}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-4 text-sm"><p><b>{snapshot.activity.lessonsToday}</b><br/><span className="text-slate-500">Lessons · today</span></p><p><b>{snapshot.activity.lessons7d}</b><br/><span className="text-slate-500">Lessons · 7d</span></p><p><b>{snapshot.activity.quizzes7d}</b><br/><span className="text-slate-500">Quizzes · 7d</span></p><p><b>{snapshot.activity.assessments30d}</b><br/><span className="text-slate-500">Assessments · 30d</span></p></div>
      </div>
      <div className="border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Needs attention</h2><div className="mt-4 divide-y divide-slate-100">{snapshot.attention.slice(0,7).map((item,index)=><Link key={`${item.schoolId}-${item.category}-${index}`} href={`/admin/schools/${item.schoolId}`} className="block py-3"><div className="flex justify-between gap-3"><p className="text-sm font-semibold">{item.schoolName}</p><span className="text-xs font-bold uppercase text-slate-500">{item.severity}</span></div><p className="mt-1 text-xs text-slate-500">{item.category}: {item.detail}</p></Link>)}{snapshot.attention.length===0?<p className="py-5 text-sm text-slate-500">No current operational alerts.</p>:null}</div></div>
    </section>
    <section className="mt-7 grid gap-6 xl:grid-cols-[1fr_1.5fr]"><div className="border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Growth this period</h2><dl className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-500">New students · 7d</dt><dd className="text-2xl font-bold">{snapshot.activity.newStudents7d}</dd></div><div><dt className="text-slate-500">New students · 30d</dt><dd className="text-2xl font-bold">{snapshot.activity.newStudents30d}</dd></div><div><dt className="text-slate-500">Parent links · 7d</dt><dd className="text-2xl font-bold">{snapshot.activity.newParentLinks7d}</dd></div><div><dt className="text-slate-500">Home activations · 7d</dt><dd className="text-2xl font-bold">{snapshot.activity.newHomeActivations7d}</dd></div></dl></div><div className="border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Recent platform changes</h2><div className="mt-4 divide-y divide-slate-100">{snapshot.recentChanges.map((change)=><div key={`${change.source}-${change.entityId}-${change.createdAt}`} className="flex items-center justify-between gap-4 py-3 text-sm"><div><p className="font-semibold">{change.title.replaceAll("_"," ")}</p><p className="text-xs text-slate-500">{change.source}{change.reason?` · ${change.reason}`:""}</p></div><time className="text-xs text-slate-500">{new Date(change.createdAt).toLocaleString("en-AU",{timeZone:"Australia/Melbourne"})}</time></div>)}{snapshot.recentChanges.length === 0 ? <p className="py-5 text-sm text-slate-500">No recent administrative changes.</p> : null}</div></div></section>
  </>;
}
