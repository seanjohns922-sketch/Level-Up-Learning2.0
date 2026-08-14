import StatisticaMap from "@/components/world/StatisticaMap";
import { LEVEL_CATALOG } from "@/lib/level-catalog";

type StatisticaPageProps = {
  searchParams: Promise<{
    level?: string;
  }>;
};

function normalizeLevel(level?: string) {
  const requested = level ?? "Year 1";
  return LEVEL_CATALOG.some((entry) => entry.id === requested && entry.id !== "Prep") ? requested : "Year 1";
}

export default async function StatisticaPage({ searchParams }: StatisticaPageProps) {
  const params = await searchParams;
  return <StatisticaMap level={normalizeLevel(params.level)} />;
}
