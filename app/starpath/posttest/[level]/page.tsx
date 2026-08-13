import { notFound, redirect } from "next/navigation";
import { getStarpathProgram } from "@/data/starpath/program-registry";
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
  const [route, query] = await Promise.all([params, searchParams]);
  const level = tryNormalizeStarpathLevel(route.level);
  const realmId = typeof query.realm_id === "string" ? query.realm_id : null;
  if (!level || realmId !== STARPATH_REALM_ID) notFound();

  const definition = getStarpathLevel(level);
  const program = getStarpathProgram(level);
  if (program.realmId !== STARPATH_REALM_ID) notFound();

  if (program.assessments.postTest?.status !== "implemented") notFound();

  const target = new URLSearchParams({ year: definition.yearLabel, realm_id: STARPATH_REALM_ID });
  if (query.review_bank === "ground-starpath-rc1" && level === "ground") {
    target.set("review_bank", "ground-starpath-rc1");
  }
  redirect(`/posttest?${target.toString()}`);
}
