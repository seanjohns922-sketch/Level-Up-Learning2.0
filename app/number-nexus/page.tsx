"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isPlacementComplete, readProgress } from "@/data/progress";

const NumberNexusMap = dynamic(
  () => import("@/components/world/NumberNexusMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#020810",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "2px solid rgba(94,234,212,0.15)",
            borderTopColor: "#14b8a6",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <p
          style={{
            color: "rgba(94,234,212,0.5)",
            fontSize: 11,
            fontFamily: "ui-monospace,monospace",
            letterSpacing: "0.2em",
            fontWeight: 700,
          }}
        >
          INITIALISING NUMBER NEXUS…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
  }
);

export default function NumberNexusPage() {
  const router = useRouter();

  useEffect(() => {
    const progress = readProgress();
    if (!isPlacementComplete(progress)) {
      router.replace("/home");
    }
  }, [router]);

  return <NumberNexusMap />;
}
