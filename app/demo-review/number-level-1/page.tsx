import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import NumberLevel1FiveFormReview from "@/components/demo/NumberLevel1FiveFormReview";

export default async function NumberLevel1ReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return <Suspense fallback={null}><NumberLevel1FiveFormReview/></Suspense>;
}
