import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import NumberLevel2FiveFormReview from "@/components/demo/NumberLevel2FiveFormReview";

export default async function NumberLevel2ReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return <Suspense fallback={null}><NumberLevel2FiveFormReview /></Suspense>;
}
