import { redirect } from "next/navigation";
import PatternPeaksMap from "@/components/world/PatternPeaksMap";
import { getServerStarpathAccess } from "@/lib/demo-session-server";

type PatternPeaksPageProps = {
  searchParams: Promise<{ level?: string }>;
};

export default async function PatternPeaksPage({ searchParams }: PatternPeaksPageProps) {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  const params = await searchParams;
  return <PatternPeaksMap level={params.level ?? "Year 3"} />;
}
