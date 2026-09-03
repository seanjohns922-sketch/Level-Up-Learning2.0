import StatisticaEntry from "@/components/statistica/StatisticaEntry";

type StatisticaPageProps = {
  searchParams: Promise<{
    level?: string;
    teacher_preview?: string;
  }>;
};

export default async function StatisticaPage({ searchParams }: StatisticaPageProps) {
  const params = await searchParams;
  return <StatisticaEntry requestedLevel={params.level} />;
}
