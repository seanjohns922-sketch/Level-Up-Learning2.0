import { Suspense } from "react";
import { redirect } from "next/navigation";
import GroundStarpathFiveFormReview from "@/components/demo/GroundStarpathFiveFormReview";
import { getServerStarpathAccess } from "@/lib/demo-session-server";

export default async function GroundStarpathReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return (
    <Suspense fallback={null}>
      <GroundStarpathFiveFormReview />
    </Suspense>
  );
}
