import { Activity, Archive, GraduationCap, Link2, UserCog, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeading, Metric } from "@/components/admin/AdminPrimitives";
import SchoolLicenceEditor from "@/components/admin/SchoolLicenceEditor";
import SchoolLifecycleManager from "@/components/admin/SchoolLifecycleManager";
import { loadPlatformSchoolDetail } from "@/lib/platform-admin-server";

function formatDate(value: string | null) {
  if (!value) return "No recorded activity";
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Melbourne",
  }).format(new Date(value));
}

export default async function PlatformSchoolDetailPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await params;
  const data = await loadPlatformSchoolDetail(schoolId).catch(() => null);
  if (!data) notFound();
  const { detail } = data;
  const archived = detail.school.status === "archived";
  return (
    <>
      <Link href="/admin/schools" className="mb-5 inline-flex text-sm font-bold text-emerald-800 hover:underline">← Back to schools</Link>
      <AdminPageHeading eyebrow={`${detail.school.code} · ${detail.licence.academicYear}`} title={detail.school.name} detail={`${detail.school.state ?? "State not set"} · ${detail.school.sector ?? "Sector not set"} · ${detail.licence.billingStatus === "free" ? "Free 2026 rollout access" : detail.licence.billingStatus}`} />

      {archived ? <section className="mb-7 border border-slate-300 bg-slate-100 p-5"><div className="flex items-start gap-3"><Archive className="mt-0.5 h-5 w-5 text-slate-700" /><div><p className="font-bold uppercase tracking-[0.12em] text-slate-900">Archived school</p><p className="mt-1 text-sm text-slate-600">Archived {detail.school.archivedAt ? formatDate(detail.school.archivedAt) : "date not recorded"}. {detail.school.archiveReason ?? "No archival reason was recorded."} This view is historical and read-only until restored.</p></div></div></section> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label={archived ? "Historical students" : "Students"} value={archived ? detail.people.historicalStudents : detail.people.students} icon={GraduationCap} />
        <Metric label={archived ? "Historical educators" : "Educators"} value={archived ? detail.people.historicalEducators : detail.people.educators} icon={Users} tone="blue" />
        <Metric label="School admins" value={detail.people.schoolAdmins} icon={UserCog} tone="violet" />
        <Metric label="Linked parents" value={detail.people.parentsLinked} icon={Link2} tone="amber" />
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Access</p><h2 className="mt-2 text-xl font-bold">School licence entitlement</h2></div>
            {!archived ? <SchoolLicenceEditor detail={detail} /> : null}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Seat limit</p><p className="mt-2 text-3xl font-bold">{detail.licence.seatLimit}</p></div>
            <div className="bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Used</p><p className="mt-2 text-3xl font-bold">{detail.licence.used}</p></div>
            <div className="bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Available</p><p className="mt-2 text-3xl font-bold">{detail.licence.available}</p></div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm font-semibold"><span>Utilisation</span><span>{detail.licence.utilisationPercent}%</span></div>
            <div className="h-3 overflow-hidden rounded-sm bg-slate-200"><div className={`h-full ${detail.licence.utilisationPercent >= 90 ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${Math.min(detail.licence.utilisationPercent, 100)}%` }} /></div>
          </div>
          <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-5 text-sm sm:grid-cols-3"><div><dt className="text-slate-500">Status</dt><dd className="mt-1 font-bold capitalize">{detail.licence.status}</dd></div><div><dt className="text-slate-500">Starts</dt><dd className="mt-1 font-bold">{detail.licence.startDate}</dd></div><div><dt className="text-slate-500">Ends</dt><dd className="mt-1 font-bold">{detail.licence.endDate}</dd></div></dl>
        </div>

        <div className="border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Home</p><h2 className="mt-2 text-xl font-bold">School → Home activation</h2>
          <div className="mt-5 space-y-3"><div className="flex justify-between bg-sky-50 p-4"><span className="font-semibold">School only</span><strong>{detail.home.schoolOnly}</strong></div><div className="flex justify-between bg-amber-50 p-4"><span className="font-semibold">Parent linked / no home</span><strong>{detail.home.parentLinkedNoHome}</strong></div><div className="flex justify-between bg-emerald-50 p-4"><span className="font-semibold">School + Home</span><strong>{detail.home.schoolAndHome}</strong></div><div className="flex justify-between bg-violet-50 p-4"><span className="font-semibold">Free home access</span><strong>{detail.home.freeHomeAccess}</strong></div></div>
        </div>
      </section>

      <section className="mt-7 border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3"><Activity className="h-5 w-5 text-emerald-700" /><div><h2 className="text-xl font-bold">Activity</h2><p className="text-sm text-slate-500">Active counts include student sessions; work totals count submitted lessons, quizzes and assessments.</p></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[['Active today', detail.activity.activeToday],['Active this week', detail.activity.activeThisWeek],['Lessons this week', detail.activity.lessonsThisWeek],['Quizzes this week', detail.activity.quizzesThisWeek],['Assessments this week', detail.activity.assessmentsThisWeek]].map(([label,value]) => <div key={String(label)} className="border-l-4 border-emerald-500 bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}
        </div>
        <p className="mt-5 text-sm text-slate-500">Last active: <span className="font-semibold text-slate-700">{formatDate(detail.activity.lastActive)}</span></p>
      </section>

      <div className="mt-7"><SchoolLifecycleManager detail={detail} /></div>

      <section className="mt-7 border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Lifecycle audit history</h2>
        <div className="mt-5 divide-y divide-slate-100 border border-slate-200">
          {detail.audit.map((entry) => <div key={entry.id} className="grid gap-1 p-4 text-sm sm:grid-cols-[1fr_auto]"><div><p className="font-bold">{entry.action.replaceAll("_", " ")}</p>{entry.reason ? <p className="mt-1 text-slate-500">{entry.reason}</p> : null}</div><time className="text-slate-500">{formatDate(entry.createdAt)}</time></div>)}
          {!detail.audit.length ? <p className="p-4 text-sm text-slate-500">No Platform Admin lifecycle changes recorded.</p> : null}
        </div>
      </section>
    </>
  );
}
