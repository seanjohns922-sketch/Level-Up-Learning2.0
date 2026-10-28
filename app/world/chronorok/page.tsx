import ChronorokEntry from "@/components/world3d/ChronorokEntry";

export default async function ChronorokPage({ searchParams }: { searchParams: Promise<{ teacher_preview?: string }> }) {
  const params = await searchParams;
  return <ChronorokEntry teacherPreview={params.teacher_preview === "1"} />;
}
