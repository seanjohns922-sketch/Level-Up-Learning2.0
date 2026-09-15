import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import NumberLevel7FiveFormReview from "@/components/demo/NumberLevel7FiveFormReview";

export default async function NumberLevel7ReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return <Suspense fallback={null}><NumberLevel7FiveFormReview /></Suspense>;
}
