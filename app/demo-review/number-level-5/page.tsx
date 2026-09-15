import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import NumberLevel5FiveFormReview from "@/components/demo/NumberLevel5FiveFormReview";

export default async function NumberLevel5ReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return <Suspense fallback={null}><NumberLevel5FiveFormReview /></Suspense>;
}
