import Starpath3DEntry from "@/components/world3d/Starpath3DEntry";

export default async function Starpath3DPage({ searchParams }: { searchParams: Promise<{ teacher_preview?: string }> }) {
  const params = await searchParams;
  return <Starpath3DEntry teacherPreview={params.teacher_preview === "1"} />;
}
