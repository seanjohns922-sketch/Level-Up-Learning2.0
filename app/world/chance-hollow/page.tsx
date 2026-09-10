import ChanceHollow3DEntry from "@/components/world3d/ChanceHollow3DEntry";

export default async function ChanceHollow3DPage({ searchParams }: { searchParams: Promise<{ teacher_preview?: string }> }) {
  const params = await searchParams;
  return <ChanceHollow3DEntry teacherPreview={params.teacher_preview === "1"} />;
}
