"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import RealmCarousel from "@/components/realms/RealmCarousel";
import { isPlacementComplete, readProgress } from "@/data/progress";

function GuardedRealmsPage() {
  const router = useRouter();

  useEffect(() => {
    const progress = readProgress();
    if (!isPlacementComplete(progress)) {
      router.replace("/home");
    }
  }, [router]);

  return <RealmCarousel />;
}

export default function RealmsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <GuardedRealmsPage />
    </Suspense>
  );
}
