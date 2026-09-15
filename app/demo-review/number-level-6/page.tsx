import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import NumberLevel6FiveFormReview from "@/components/demo/NumberLevel6FiveFormReview";

export default async function NumberLevel6ReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return <Suspense fallback={null}><NumberLevel6FiveFormReview /></Suspense>;
}
