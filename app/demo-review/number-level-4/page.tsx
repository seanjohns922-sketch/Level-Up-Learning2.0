import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import NumberLevel4FiveFormReview from "@/components/demo/NumberLevel4FiveFormReview";

export default async function NumberLevel4ReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return <Suspense fallback={null}><NumberLevel4FiveFormReview /></Suspense>;
}
