import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import ParentDashboardReview from "@/components/demo/ParentDashboardReview";

export default async function ParentDashboardReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return <Suspense fallback={null}><ParentDashboardReview /></Suspense>;
}
