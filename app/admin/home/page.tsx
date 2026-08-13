import { Home, Link2, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPageHeading, FutureMetric, Metric } from "@/components/admin/AdminPrimitives";
import { loadPlatformHomeUsers } from "@/lib/platform-admin-server";

export default async function PlatformHomeAdminPage() {
  let loadFailed = false;
  const data = await loadPlatformHomeUsers().catch((error) => {
    console.error("[PlatformHomeAdminPage] home snapshot failed", error);
    loadFailed = true;
    return null;
  });
  if (loadFailed) {
    return <><AdminPageHeading eyebrow="Home" title="Home access" detail="2026 home access is free. Parent linking, home entitlement and billing classification remain separate." action={<Link href="/admin/home/users" className="border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700">View Home users</Link>} /><section className="border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><p className="font-bold">Home metrics are temporarily unavailable.</p><p className="mt-1">The Home data view could not load. Other Platform Admin sections are unaffected.</p></section></>;
  }
  if (!data) redirect("/login");

  const { totals } = data.snapshot;
  return <><AdminPageHeading eyebrow="Home" title="Home access" detail="2026 home access is free. Parent linking, home entitlement and billing classification remain separate." action={<Link href="/admin/home/users" className="border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700">View Home users</Link>} /><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Home users" value={totals.homeUsers} icon={Home} /><Metric label="Free home users" value={totals.homeUsers} icon={Home} tone="blue" /><Metric label="Parents linked" value={totals.linkedParents} icon={Users} tone="violet" /><Metric label="Parent emails" value={totals.parentEmails} icon={Link2} tone="amber" /></section><section className="mt-7 grid gap-4 sm:grid-cols-3"><FutureMetric label="Paid Home Subscribers" /><FutureMetric label="MRR" /><FutureMetric label="Churn" /></section></>;
}
