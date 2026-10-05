"use client";
import dynamic from "next/dynamic";
const Review = dynamic(() => import("@/components/world3d/MarketplaceArtReview"), { ssr: false });
export default function Page() { return <Review />; }
