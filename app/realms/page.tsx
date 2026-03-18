"use client";

import { Suspense } from "react";
import RealmCarousel from "@/components/realms/RealmCarousel";

export default function RealmsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <RealmCarousel />
    </Suspense>
  );
}
