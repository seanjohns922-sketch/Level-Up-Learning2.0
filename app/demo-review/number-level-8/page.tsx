import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import NumberLevel8FiveFormReview from "@/components/demo/NumberLevel8FiveFormReview";

export default async function NumberLevel8ReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return <Suspense fallback={null}><NumberLevel8FiveFormReview /></Suspense>;
}
