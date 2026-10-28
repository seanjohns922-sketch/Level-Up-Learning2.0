import ChronorokGameEntry from "@/components/chronorok/ChronorokGameEntry";

export default async function Page({ searchParams }: { searchParams: Promise<{ teacher_preview?: string }> }) {
  const params = await searchParams;
  return <ChronorokGameEntry game="time-slope" backHref={params.teacher_preview === "1" ? "/world/chronorok?teacher_preview=1" : "/world/chronorok"} />;
}
