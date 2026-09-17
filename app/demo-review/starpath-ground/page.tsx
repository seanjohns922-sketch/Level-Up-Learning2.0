import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import GroundStarpathFiveFormReview from "@/components/demo/GroundStarpathFiveFormReview";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import { getRealmTheme } from "@/lib/useRealmTheme";

export default async function GroundStarpathReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  const theme = getRealmTheme("space");
  return (
    <Suspense fallback={null}>
      <div className="px-6 py-3 text-center" style={{ background: theme.cardSurface, color: theme.accentText }}>
        <Link className="underline underline-offset-4" href="/demo-review/starpath-ground-redesign">
          New Ground design — review six examples
        </Link>
      </div>
      <GroundStarpathFiveFormReview />
    </Suspense>
  );
}
