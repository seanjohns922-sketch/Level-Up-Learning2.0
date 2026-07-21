"use client";

import type { CanonicalRealmDashboardConfig } from "./types";

export function RealmDashboardLoading({ config }: { config: CanonicalRealmDashboardConfig }) {
  return (
    <main
      aria-live="polite"
      style={{
        width: "100vw",
        height: "100vh",
        background: config.theme.pageBackground,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: `2px solid ${config.theme.realmChipBorder}`,
          borderTopColor: config.theme.secondaryAccent,
          animation: "realm-dashboard-spin 0.9s linear infinite",
        }}
      />
      <p
        style={{
          color: config.theme.mutedAccent,
          fontSize: 11,
          fontFamily: "ui-monospace,monospace",
          letterSpacing: "0.2em",
          fontWeight: 700,
        }}
      >
        {config.labels.loading}
      </p>
      <style>{`@keyframes realm-dashboard-spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

export function RealmDashboardError({
  config,
  message,
  onRetry,
}: {
  config: CanonicalRealmDashboardConfig;
  message: string;
  onRetry: () => void;
}) {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center"
      style={{ background: config.theme.pageBackground }}
    >
      <p className="text-base font-bold text-red-200">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg px-5 py-3 font-bold"
        style={{ background: config.theme.secondaryAccent, color: config.theme.pageBackground }}
      >
        Try Again
      </button>
    </main>
  );
}
