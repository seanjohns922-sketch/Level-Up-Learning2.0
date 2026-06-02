"use client";

import dynamic from "next/dynamic";

const MeasurelandsMap = dynamic(
  () => import("@/components/world/MeasurelandsMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#0d0820",
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
            border: "2px solid rgba(245,176,66,0.18)",
            borderTopColor: "#f5b042",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <p
          style={{
            color: "rgba(253,230,138,0.6)",
            fontSize: 11,
            fontFamily: "ui-monospace,monospace",
            letterSpacing: "0.2em",
            fontWeight: 700,
          }}
        >
          ENTERING MEASURELANDS…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
  }
);

export default function MeasurelandsPage() {
  return <MeasurelandsMap />;
}