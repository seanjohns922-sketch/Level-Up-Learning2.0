import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import NumberLevel3FiveFormReview from "@/components/demo/NumberLevel3FiveFormReview";

export default async function NumberLevel3ReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return <Suspense fallback={null}><NumberLevel3FiveFormReview/></Suspense>;
}
