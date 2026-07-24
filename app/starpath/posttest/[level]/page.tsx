import { notFound, redirect } from "next/navigation";
import StarpathPostTest from "@/components/starpath/StarpathPostTest";
import { getStarpathPostTestTasks } from "@/data/activities/starpath/ground/groundPostTest";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import { getStarpathLevel, tryNormalizeStarpathLevel } from "@/lib/starpath-levels";
import { buildStarpathProgramHref, STARPATH_REALM_ID } from "@/lib/starpath-routes";

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

  const tasks = getStarpathPostTestTasks(level);
  if (!tasks || tasks.length === 0) notFound();

  const finalWeek = program.weeks.length;
  return (
    <StarpathPostTest
      meta={{
        year: definition.yearLabel,
        levelLabel: definition.displayLabel,
        title: `${definition.displayLabel} Post-Test`,
        coverage: program.assessments.postTest
          ? "Shapes, position and directions from the whole Ground Level."
          : "Everything from this level.",
        programHref: buildStarpathProgramHref({ selectedLevel: level }, finalWeek),
      }}
      tasks={tasks}
    />
  );
}
