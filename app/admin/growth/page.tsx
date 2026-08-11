import { Building2, Home, Link2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPageHeading, Metric } from "@/components/admin/AdminPrimitives";
import { loadPlatformGrowth } from "@/lib/platform-admin-server";

type Sort = "home_high" | "home_low" | "school_only" | "linked_no_home";
const sorts: Array<[Sort, string]> = [["home_high", "Highest Home Activation"], ["home_low", "Lowest Home Activation"], ["school_only", "Most School Only"], ["linked_no_home", "Most Parent Linked / No Home"]];

export default async function PlatformGrowthPage({ searchParams }: { searchParams: Promise<{ sort?: Sort }> }) {
  const data = await loadPlatformGrowth();
  if (!data) redirect("/login");
  const { funnel } = data.snapshot;
  const sort = (await searchParams).sort ?? "home_high";
  const schools = [...data.snapshot.schools].sort((a, b) => sort === "home_low" ? a.homeActivationRate - b.homeActivationRate : sort === "school_only" ? b.schoolOnly - a.schoolOnly : sort === "linked_no_home" ? b.parentLinkedNoHome - a.parentLinkedNoHome : b.homeActivationRate - a.homeActivationRate);
  return <>
    <AdminPageHeading eyebrow="Growth" title="School to home growth" detail="Parent linking and home activation are separate outcomes. Free 2026 access is normal and is never presented as paid conversion." action={<Link href="/admin/growth/home-only" className="border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700">View Home Only</Link>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="School students" value={funnel.schoolStudents} icon={Building2} /><Metric label="Parent linked" value={funnel.parentLinked} detail={`${funnel.parentLinkRate}% link rate`} icon={Link2} tone="blue" /><Metric label="Home activated" value={funnel.homeActivated} detail={`${funnel.homeActivationRate}% activation rate`} icon={TrendingUp} tone="violet" /><Metric label="Home only" value={funnel.homeOnly} icon={Home} tone="amber" /></section>
    <div className="mt-7 border border-slate-200 bg-white shadow-sm"><div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center"><div><h2 className="font-bold">School growth funnel</h2><p className="text-sm text-slate-500">{funnel.parentLinkedNoHome} parent-linked students have not activated home access.</p></div><div className="flex flex-wrap gap-2">{sorts.map(([value, label]) => <Link key={value} href={`/admin/growth?sort=${value}`} className={`border px-3 py-2 text-xs font-bold ${sort === value ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-600"}`}>{label}</Link>)}</div></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="p-4">School</th><th className="p-4">Students</th><th className="p-4">Parent linked</th><th className="p-4">Link rate</th><th className="p-4">Home active</th><th className="p-4">Activation rate</th><th className="p-4">School only</th><th className="p-4">Linked / no home</th></tr></thead><tbody className="divide-y divide-slate-100">{schools.map(s => <tr key={s.schoolId}><td className="p-4 font-semibold">{s.schoolName}</td><td className="p-4 tabular-nums">{s.schoolStudents}</td><td className="p-4 tabular-nums">{s.parentLinked}</td><td className="p-4 tabular-nums">{s.parentLinkRate}%</td><td className="p-4 tabular-nums">{s.homeActivated}</td><td className="p-4 tabular-nums">{s.homeActivationRate}%</td><td className="p-4 tabular-nums">{s.schoolOnly}</td><td className="p-4 tabular-nums">{s.parentLinkedNoHome}</td></tr>)}{schools.length === 0 ? <tr><td colSpan={8} className="p-8 text-center text-slate-500">No active or trial schools are available for this funnel.</td></tr> : null}</tbody></table></div></div>
  </>;
}
