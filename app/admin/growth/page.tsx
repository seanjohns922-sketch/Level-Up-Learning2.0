import { Building2, Link2, TrendingUp } from "lucide-react";
import { AdminPageHeading, FutureMetric, Metric } from "@/components/admin/AdminPrimitives";
import { loadPlatformOverview } from "@/lib/platform-admin-server";

export default async function PlatformGrowthPage() {
  const data = await loadPlatformOverview(); const students = data?.overview.students;
  const schoolStudents = (students?.schoolOnly ?? 0) + (students?.schoolAndHome ?? 0);
  const activation = schoolStudents === 0 ? 0 : Math.round(1000 * (students?.schoolAndHome ?? 0) / schoolStudents) / 10;
  return <><AdminPageHeading eyebrow="Growth" title="School → Home funnel" detail="Aggregate opportunity signals for the free rollout. This is home activation, not paid conversion, and does not expose children as marketing leads." /><section className="grid gap-4 sm:grid-cols-3"><Metric label="School students" value={schoolStudents} icon={Building2} /><Metric label="Parents linked" value={students?.parentsLinked ?? 0} icon={Link2} tone="blue" /><Metric label="Home activation" value={`${activation}%`} icon={TrendingUp} tone="violet" /></section><section className="mt-7 grid gap-4 sm:grid-cols-3"><FutureMetric label="Home Trial → Paid" /><FutureMetric label="Paid Conversion" /><FutureMetric label="Home → School Opportunity" /></section></>;
}
