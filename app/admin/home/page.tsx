import { Home, Link2, Users } from "lucide-react";
import Link from "next/link";
import { AdminPageHeading, FutureMetric, Metric } from "@/components/admin/AdminPrimitives";
import { loadPlatformOverview } from "@/lib/platform-admin-server";

export default async function PlatformHomeAdminPage() {
  const data = await loadPlatformOverview(); const students = data?.overview.students;
  return <><AdminPageHeading eyebrow="Home" title="Home access" detail="2026 home access is free. Parent linking, home entitlement and billing classification remain separate." action={<Link href="/admin/home/users" className="border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700">View Home users</Link>} /><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Home users" value={(students?.homeOnly ?? 0) + (students?.schoolAndHome ?? 0)} icon={Home} /><Metric label="Free home users" value={students?.freeHome ?? 0} icon={Home} tone="blue" /><Metric label="Parents linked" value={students?.parentsLinked ?? 0} icon={Users} tone="violet" /><Metric label="Parent linked / no home" value={students?.parentLinkedNoHome ?? 0} icon={Link2} tone="amber" /></section><section className="mt-7 grid gap-4 sm:grid-cols-3"><FutureMetric label="Paid Home Subscribers" /><FutureMetric label="MRR" /><FutureMetric label="Churn" /></section></>;
}
