import { Activity, ArrowLeft, Home, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPageHeading, Metric } from "@/components/admin/AdminPrimitives";
import { loadPlatformHomeOnly } from "@/lib/platform-admin-server";

export default async function PlatformHomeOnlyPage() {
  const data = await loadPlatformHomeOnly();
  if (!data) redirect("/login");
  const snapshot = data.snapshot;
  return <>
    <Link href="/admin/growth" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><ArrowLeft className="h-4 w-4" />School to home growth</Link>
    <div className="mt-5"><AdminPageHeading eyebrow="Growth" title="Home Only" detail="Students with active Home access and no active School entitlement. They are intentionally excluded from school-to-home conversion rates." /></div>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Home Only students" value={snapshot.students} icon={Home} /><Metric label="Active · 7 days" value={snapshot.active7d} icon={Activity} tone="blue" /><Metric label="Linked parents" value={snapshot.parents} icon={Users} tone="violet" /><Metric label="Average activity · 7d" value={snapshot.averageActivity7d} detail={`${snapshot.events7d} canonical events`} icon={Activity} tone="amber" /></section>
  </>;
}
