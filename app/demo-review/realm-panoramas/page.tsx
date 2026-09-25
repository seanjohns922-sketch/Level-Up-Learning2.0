"use client";

import dynamic from "next/dynamic";
const Review = dynamic(() => import("@/components/world3d/RealmPanoramaReview"), { ssr: false });
export default function Page() { return <Review />; }
