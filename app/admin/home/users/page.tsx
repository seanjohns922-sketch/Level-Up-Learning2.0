import { Activity, ArrowLeft, Home, Mail, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPageHeading, Metric } from "@/components/admin/AdminPrimitives";
import { loadPlatformHomeUsers } from "@/lib/platform-admin-server";

const MELBOURNE_DATE = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value: string | null) {
  if (!value) return "No activity";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recorded" : MELBOURNE_DATE.format(date);
}

function segmentLabel(segment: string) {
  return segment === "school_and_home" ? "School + Home" : "Home Only";
}

function segmentClass(segment: string) {
  return segment === "school_and_home"
    ? "border-sky-200 bg-sky-50 text-sky-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export default async function PlatformHomeUsersPage() {
  const data = await loadPlatformHomeUsers();
  if (!data) redirect("/login");

  const { totals, students } = data.snapshot;

  return (
    <>
      <Link href="/admin/home" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
        <ArrowLeft className="h-4 w-4" /> Home access
      </Link>
      <div className="mt-5">
        <AdminPageHeading
          eyebrow="Home"
          title="Home users"
          detail="Platform-owner view of active Home access students and their linked parent contacts. Use parent emails only for permitted operational or marketing communications."
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Home users" value={totals.homeUsers} icon={Home} />
        <Metric label="Home Only" value={totals.homeOnly} icon={Home} tone="blue" />
        <Metric label="School + Home" value={totals.schoolAndHome} icon={ShieldCheck} tone="violet" />
        <Metric label="Linked parents" value={totals.linkedParents} icon={Users} tone="amber" />
        <Metric label="Parent emails" value={totals.parentEmails} icon={Mail} />
      </section>

      <section className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-bold">Contact-data note</p>
        <p className="mt-1">
          Parent emails are personal data. Keep exports internal, respect consent/unsubscribe requirements, and avoid sharing this list with schools or third parties.
        </p>
      </section>

      <section className="mt-6 overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-950">Active Home access contacts</h2>
            <p className="mt-1 text-sm text-slate-500">{totals.withoutParentEmail} students have no linked parent email on file.</p>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Generated {formatDate(data.snapshot.generatedAt)}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.1em] text-slate-500">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Home segment</th>
                <th className="px-5 py-3">Linked parents</th>
                <th className="px-5 py-3">Parent emails</th>
                <th className="px-5 py-3">School</th>
                <th className="px-5 py-3">Home start</th>
                <th className="px-5 py-3">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const parentNames = student.parents.map((parent) => parent.parentName || "Parent").join(", ");
                const parentEmails = student.parents.map((parent) => parent.parentEmail).filter(Boolean);
                return (
                  <tr key={student.studentId}>
                    <td className="px-5 py-4">
                      <Link href={`/admin/users/students/${student.studentId}`} className="font-bold text-slate-950 hover:text-emerald-700">
                        {student.studentName}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{student.yearLevel ?? "Year not set"} · {student.username ?? "No username"}</p>
                      <p className="mt-1 font-mono text-xs text-slate-400">{student.explorerCode ?? "No Explorer Code"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded border px-2 py-1 text-xs font-bold ${segmentClass(student.segment)}`}>
                        {segmentLabel(student.segment)}
                      </span>
                    </td>
                    <td className="max-w-[260px] px-5 py-4 text-slate-700">{parentNames || "No linked parent"}</td>
                    <td className="max-w-[320px] px-5 py-4">
                      {parentEmails.length ? (
                        <div className="space-y-1">
                          {parentEmails.map((email) => <p key={email} className="font-medium text-slate-800">{email}</p>)}
                        </div>
                      ) : <span className="text-slate-400">No parent email</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{student.schoolName ?? "Home learner"}</td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(student.homeStartedAt)}</td>
                    <td className="px-5 py-4 text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5" /> {formatDate(student.lastActiveAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                    No active Home access students yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
