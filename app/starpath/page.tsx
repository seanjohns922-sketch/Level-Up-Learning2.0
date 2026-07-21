import { redirect } from "next/navigation";
import StarpathMap from "@/components/world/StarpathMap";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import { getStarpathLevel, tryNormalizeStarpathLevel } from "@/lib/starpath-levels";
import { STARPATH_REALM_ID } from "@/lib/starpath-routes";

export const dynamic = "force-dynamic";

export default async function StarpathPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const access = await getServerStarpathAccess();
  if (!access.allowed) {
    redirect("/realms");
  }

  const params = await searchParams;
  const realmId = typeof params.realm_id === "string" ? params.realm_id : null;
  const level = tryNormalizeStarpathLevel(typeof params.level === "string" ? params.level : null);
  if (realmId !== STARPATH_REALM_ID || !level) {
    redirect("/realms");
  }

  return <StarpathMap level={getStarpathLevel(level).yearLabel} />;
}
