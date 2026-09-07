"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RealmDashboardLoading } from "@/components/realms/dashboard";
import ChanceHollowMap, { CHANCE_HOLLOW_DASHBOARD_CONFIG } from "@/components/world/ChanceHollowMap";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

const SUPPORTED_LEVELS = new Set(["Year 3", "Year 4", "Year 5"]);

export default function ChanceHollowEntry({ requestedLevel }: { requestedLevel?: string }) {
  const router = useRouter();
  const previewMode = isDemoPreviewMode();

  const resolvedLevel = useMemo(() => {
    const candidate = previewMode ? requestedLevel : null;
    return (SUPPORTED_LEVELS.has(candidate ?? "") ? candidate : "Year 3") as RealmLevelId;
  }, [previewMode, requestedLevel]);

  useEffect(() => {
    if (previewMode) return;
    router.replace("/realms");
  }, [previewMode, router]);

  if (!previewMode) {
    return <RealmDashboardLoading config={CHANCE_HOLLOW_DASHBOARD_CONFIG} />;
  }

  return <ChanceHollowMap key={resolvedLevel} level={resolvedLevel} />;
}
