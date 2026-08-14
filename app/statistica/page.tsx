import { redirect } from "next/navigation";
import StatisticaMap from "@/components/world/StatisticaMap";
import { LEVEL_CATALOG } from "@/lib/level-catalog";

type StatisticaPageProps = {
  searchParams: Promise<{
    level?: string;
    teacher_preview?: string;
  }>;
};

function normalizeLevel(level?: string) {
  const requested = level ?? "Year 1";
  return LEVEL_CATALOG.some((entry) => entry.id === requested && entry.id !== "Prep") ? requested : "Year 1";
}

export default async function StatisticaPage({ searchParams }: StatisticaPageProps) {
  const params = await searchParams;
  const level = normalizeLevel(params.level);
  if (params.teacher_preview !== "1") {
    redirect(`/statistica?teacher_preview=1&level=${encodeURIComponent(level)}`);
  }
  return <StatisticaMap level={level} />;
}
