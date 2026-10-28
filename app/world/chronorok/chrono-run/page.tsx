import ChronoRunEntry from "@/components/chronorok/ChronoRunEntry";

export default async function ChronoRunPage({ searchParams }: { searchParams: Promise<{ teacher_preview?: string }> }) {
  const params = await searchParams;
  return <ChronoRunEntry backHref={params.teacher_preview === "1" ? "/world/chronorok?teacher_preview=1" : "/world/chronorok"} />;
}
