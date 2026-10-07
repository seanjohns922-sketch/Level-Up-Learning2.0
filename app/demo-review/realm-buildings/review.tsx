"use client";

import dynamic from "next/dynamic";

const MarketplaceArtReview = dynamic(
  () => import("@/components/world3d/MarketplaceArtReview"),
  { ssr: false },
);

export default function Review() {
  return <MarketplaceArtReview realms />;
}
