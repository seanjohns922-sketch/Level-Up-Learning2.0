import { notFound, redirect } from "next/navigation";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import { getStarpathLevel, tryNormalizeStarpathLevel } from "@/lib/starpath-levels";
import { STARPATH_REALM_ID } from "@/lib/starpath-routes";

export const dynamic = "force-dynamic";

export default async function StarpathPostTestPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/realms");

  const [route, query] = await Promise.all([params, searchParams]);
  const level = tryNormalizeStarpathLevel(route.level);
  const realmId = typeof query.realm_id === "string" ? query.realm_id : null;
  if (!level || realmId !== STARPATH_REALM_ID) notFound();

  const definition = getStarpathLevel(level);
  const program = getStarpathProgram(level);
  if (program.realmId !== STARPATH_REALM_ID) notFound();

  if (program.assessments.postTest?.status !== "implemented") notFound();

  redirect(`/posttest?year=${encodeURIComponent(definition.yearLabel)}&realm_id=${STARPATH_REALM_ID}`);
}
