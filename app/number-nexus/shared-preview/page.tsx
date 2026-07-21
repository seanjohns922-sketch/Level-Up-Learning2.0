import { redirect } from "next/navigation";
import NumberNexusSharedPreview from "@/components/world/NumberNexusSharedPreview";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import { LEVEL_CATALOG } from "@/lib/level-catalog";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

function normalizeLevel(value: string | undefined): RealmLevelId | undefined {
  return LEVEL_CATALOG.some((candidate) => candidate.id === value)
    ? (value as RealmLevelId)
    : undefined;
}

export default async function NumberNexusSharedPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const isDevelopment = process.env.NODE_ENV !== "production";
  if (!isDevelopment) {
    const access = await getServerStarpathAccess();
    if (!access.allowed) redirect("/number-nexus");
  }

  const params = await searchParams;
  return <NumberNexusSharedPreview level={normalizeLevel(params.level)} />;
}
