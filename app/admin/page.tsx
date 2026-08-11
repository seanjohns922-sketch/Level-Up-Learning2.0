import {
  Activity,
  Building2,
  GraduationCap,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPageHeading, Metric } from "@/components/admin/AdminPrimitives";
import { loadPlatformOperations } from "@/lib/platform-admin-server";

const MELBOURNE_TIME = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  day: "numeric",
  month: "short",
  year: "numeric",
});

function statusClasses(status: string) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "trial") return "bg-sky-50 text-sky-700";
  return "bg-slate-100 text-slate-600";
}

export default async function PlatformAdminOverviewPage() {
  const data = await loadPlatformOperations();
  if (!data) redirect("/login");

  const { snapshot, schools } = data;
  const actionableAttention = snapshot.attention.filter(
    (item) => item.severity === "critical" || item.severity === "attention",
  );
  const recentSchools = schools
    .filter((school) => school.status !== "archived")
    .sort((a, b) => {
      if (!a.lastActive) return 1;
      if (!b.lastActive) return -1;
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    })
    .slice(0, 5);

  return (
    <>
      <AdminPageHeading
        eyebrow="Overview"
        title="Platform overview"
        detail="Monitor platform scale, weekly activity and schools requiring action."
        action={
          <Link
            href="/admin/users"
            className="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white"
          >
            Explore users
          </Link>
        }
      />

      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        aria-label="Platform summary"
      >
        <Metric label="Schools" value={snapshot.scale.schools} icon={Building2} />
        <Metric
          label="Students"
          value={snapshot.scale.students}
          icon={GraduationCap}
          tone="blue"
        />
        <Metric
          label="Educators"
          value={snapshot.scale.educators}
          icon={Users}
          tone="violet"
        />
        <Metric
          label="Seats used"
          value={`${snapshot.scale.seatsUsed}/${snapshot.scale.schoolSeats}`}
          icon={ShieldAlert}
          tone="amber"
        />
        <Metric
          label="Active this week"
          value={snapshot.activity.active7d}
          icon={Activity}
        />
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-2">
        <div className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Needs attention</h2>
              <p className="mt-1 text-sm text-slate-500">Issues requiring an operational decision.</p>
            </div>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {actionableAttention.slice(0, 6).map((item, index) => (
              <Link
                key={`${item.schoolId}-${item.category}-${index}`}
                href={`/admin/schools/${item.schoolId}`}
                className="block py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.schoolName}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      item.severity === "critical"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              </Link>
            ))}
            {actionableAttention.length === 0 ? (
              <p className="py-8 text-sm text-slate-500">No schools currently require attention.</p>
            ) : null}
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Recent schools</h2>
              <p className="mt-1 text-sm text-slate-500">Licence use and latest learning activity.</p>
            </div>
            <Link href="/admin/schools" className="text-sm font-bold text-emerald-700">
              View schools
            </Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {recentSchools.map((school) => (
              <Link
                key={school.id}
                href={`/admin/schools/${school.id}`}
                className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{school.name}</p>
                    <span
                      className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClasses(school.status)}`}
                    >
                      {school.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {school.used} of {school.seatLimit} seats used
                  </p>
                </div>
                <p className="text-xs text-slate-500 sm:text-right">
                  {school.lastActive
                    ? `Last active ${MELBOURNE_TIME.format(new Date(school.lastActive))}`
                    : "No learning activity yet"}
                </p>
              </Link>
            ))}
            {recentSchools.length === 0 ? (
              <p className="py-8 text-sm text-slate-500">No active or trial schools yet.</p>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
