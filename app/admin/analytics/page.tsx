import { Activity, GraduationCap, ShieldCheck } from "lucide-react";
import { AdminPageHeading, Metric } from "@/components/admin/AdminPrimitives";
import { loadPlatformOverview } from "@/lib/platform-admin-server";

export default async function PlatformAnalyticsPage() {
  const data = await loadPlatformOverview(); const overview = data?.overview;
  return <><AdminPageHeading eyebrow="Analytics" title="Platform activity" detail="Lightweight PA1 operational analytics. Detailed progression and assessment payloads remain lazy and outside this platform summary." /><section className="grid gap-4 sm:grid-cols-3"><Metric label="Active this week" value={overview?.activity.activeThisWeek ?? 0} icon={Activity} /><Metric label="Canonical students" value={overview?.students.total ?? 0} icon={GraduationCap} tone="blue" /><Metric label="Seats used" value={overview?.seats.used ?? 0} icon={ShieldCheck} tone="violet" /></section></>;
}
