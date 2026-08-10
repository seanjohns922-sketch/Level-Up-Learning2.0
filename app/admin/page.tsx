import {
  Activity,
  Building2,
  GraduationCap,
  Home,
  Link2,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPageHeading, Metric } from "@/components/admin/AdminPrimitives";
import { loadPlatformOverview } from "@/lib/platform-admin-server";

export default async function PlatformAdminOverviewPage() {
  const data = await loadPlatformOverview();
  if (!data) redirect("/login");
  const { overview, schools } = data;
  const attention = schools.filter(
    (school) => school.utilisationPercent >= 90 || school.status === "trial" || school.status === "paused",
  );

  return (
    <>
      <AdminPageHeading
        eyebrow="Overview"
        title="Level Up Learning at a glance"
        detail="Canonical platform scale, school access, home activation and recent learning activity. Each child is counted once."
        action={
          <Link href="/admin/schools" className="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">
            Manage schools
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Primary platform metrics">
        <Metric label="Schools" value={overview.schools.total} detail={`${overview.schools.active} active`} icon={Building2} />
        <Metric label="Students" value={overview.students.total} detail="Canonical identities" icon={GraduationCap} tone="blue" />
        <Metric label="Educators" value={overview.people.educators} icon={Users} tone="violet" />
        <Metric label="Parents" value={overview.people.parents} icon={UserRoundCheck} tone="amber" />
        <Metric label="School seats" value={overview.seats.limit} detail={`${overview.seats.used} used · ${overview.seats.available} available`} icon={ShieldCheck} />
        <Metric label="School only" value={overview.students.schoolOnly} icon={Building2} tone="blue" />
        <Metric label="School + Home" value={overview.students.schoolAndHome} icon={Link2} tone="violet" />
        <Metric label="Home only" value={overview.students.homeOnly} icon={Home} tone="amber" />
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">School → Home snapshot</h2>
          <p className="mt-1 text-sm text-slate-500">Home activation, not paid conversion.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="border-l-4 border-sky-500 bg-sky-50 p-4">
              <p className="text-sm font-semibold text-sky-900">School only</p>
              <p className="mt-2 text-3xl font-bold tabular-nums">{overview.students.schoolOnly}</p>
            </div>
            <div className="border-l-4 border-amber-500 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Parent linked / no home</p>
              <p className="mt-2 text-3xl font-bold tabular-nums">{overview.students.parentLinkedNoHome}</p>
            </div>
            <div className="border-l-4 border-emerald-500 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">School + Home</p>
              <p className="mt-2 text-3xl font-bold tabular-nums">{overview.students.schoolAndHome}</p>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Schools requiring attention</h2>
              <p className="mt-1 text-sm text-slate-500">Operational signals only. No automated outreach.</p>
            </div>
            <Activity className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {attention.slice(0, 5).map((school) => (
              <Link key={school.id} href={`/admin/schools/${school.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-emerald-800">
                <div>
                  <p className="text-sm font-semibold">{school.name}</p>
                  <p className="text-xs text-slate-500">{school.status} · {school.utilisationPercent}% utilised</p>
                </div>
                <span className="text-sm font-bold tabular-nums">{school.used}/{school.seatLimit}</span>
              </Link>
            ))}
            {attention.length === 0 ? <p className="py-6 text-sm text-slate-500">No schools currently meet an attention threshold.</p> : null}
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Free home access" value={overview.students.freeHome} icon={Home} />
        <Metric label="Parents linked" value={overview.students.parentsLinked} icon={Link2} tone="blue" />
        <Metric label="Active this week" value={overview.activity.activeThisWeek} icon={Activity} tone="violet" />
        <Metric label="Inactive / historical" value={overview.students.inactive} icon={GraduationCap} tone="amber" />
      </section>
    </>
  );
}
