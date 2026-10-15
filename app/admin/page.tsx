import {
  Activity,
  Building2,
  GraduationCap,
  Home,
  ShieldAlert,
  TrendingUp,
  UserMinus,
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

function schoolStatusClasses(status: string) {
  if (status === "active") return "bg-[#EEF9D9] text-[#3D6600]";
  if (status === "trial") return "bg-[#E8FBFB] text-[#0E7C86]";
  if (status === "paused") return "bg-[#FFF1C7] text-[#8A5A00]";
  return "bg-[#F1F2EE] text-[#5A5E63]";
}

export default async function PlatformAdminOverviewPage() {
  const data = await loadPlatformOperations();
  if (!data) redirect("/login");

  const { snapshot, schools } = data;
  const actionableAttention = snapshot.attention.filter(
    (item) => item.severity === "critical" || item.severity === "attention",
  );
  const homeUsers = snapshot.userMix.schoolAndHome + snapshot.userMix.homeOnly;
  const schoolToHomeConversion =
    snapshot.growth.schoolStudents === 0
      ? 0
      : Math.round(
          (snapshot.growth.homeActivated / snapshot.growth.schoolStudents) * 1000,
        ) / 10;
  // "Students" in the snapshot counts every student record ever created; only those with current
  // school or home access are measured for activity.
  const studentsWithAccess = snapshot.userMix.schoolOnly + snapshot.userMix.schoolAndHome + snapshot.userMix.homeOnly;
  const notActive30d = Math.max(0, studentsWithAccess - snapshot.activity.active30d);
  const weekChange = snapshot.activity.active7d - snapshot.activity.previous7d;
  const seatPercent = snapshot.scale.schoolSeats > 0 ? Math.round((snapshot.scale.seatsUsed / snapshot.scale.schoolSeats) * 100) : 0;
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
            className="rounded-full bg-[#121314] px-4 py-2.5 text-sm font-bold text-white"
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
          label="Students with access"
          value={studentsWithAccess}
          detail={snapshot.userMix.inactive ? `${snapshot.userMix.inactive} older records have no current access` : undefined}
          icon={GraduationCap}
        />
        <Metric
          label="Educators"
          value={snapshot.scale.educators}
          icon={Users}
        />
        <Metric
          label="Seats used"
          value={`${snapshot.scale.seatsUsed}/${snapshot.scale.schoolSeats}`}
          detail={`${seatPercent}% of school seats`}
          icon={ShieldAlert}
          tone={seatPercent >= 90 ? "warning" : undefined}
        />
        <Metric
          label="Active this week"
          value={snapshot.activity.active7d}
          detail={`Submitted work in 7 days · ${weekChange === 0 ? "same as" : `${weekChange > 0 ? "+" : ""}${weekChange} on`} last week`}
          icon={Activity}
        />
      </section>

      <section
        className="mt-4 grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-3"
        aria-label="Home growth summary"
      >
        <Link
          href="/admin/home"
          className="flex items-center gap-4 border-b border-slate-200 p-4 sm:border-b-0 sm:border-r"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#121314] text-[#2EE6E0]">
            <Home className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Home users
            </span>
            <span className="mt-1 block text-2xl font-black tabular-nums text-slate-950">
              {homeUsers}
            </span>
            <span className="block text-xs text-slate-500">
              {snapshot.userMix.homeOnly} home only · {snapshot.userMix.schoolAndHome} school and home
            </span>
          </span>
        </Link>
        <Link
          href="/admin/growth"
          className="flex items-center gap-4 border-b border-slate-200 p-4 sm:border-b-0 sm:border-r"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#121314] text-[#2EE6E0]">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              School-to-home conversion
            </span>
            <span className="mt-1 block text-2xl font-black tabular-nums text-slate-950">
              {schoolToHomeConversion}%
            </span>
            <span className="block text-xs text-slate-500">
              {snapshot.growth.homeActivated} of {snapshot.growth.schoolStudents} school students also have home access
            </span>
          </span>
        </Link>
        <Link href="/admin/analytics" className="flex items-center gap-4 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1C7] text-[#8A5A00]">
            <UserMinus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Not active in 30 days
            </span>
            <span className="mt-1 block text-2xl font-black tabular-nums text-slate-950">
              {notActive30d}
            </span>
            <span className="block text-xs text-slate-500">
              of {studentsWithAccess} with access · no lessons, quizzes or tests
            </span>
          </span>
        </Link>
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">Needs attention</h2>
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
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                      item.severity === "critical"
                        ? "bg-[#F2998D] text-[#4A0F09]"
                        : "bg-[#FFD866] text-[#3F2E00]"
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">Recent schools</h2>
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
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${schoolStatusClasses(school.status)}`}
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
