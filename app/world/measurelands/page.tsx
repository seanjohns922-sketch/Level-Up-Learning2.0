import Measurelands3DEntry from "@/components/world3d/Measurelands3DEntry";

export default async function Measurelands3DPage({ searchParams }: { searchParams: Promise<{ teacher_preview?: string }> }) {
  const params = await searchParams;
  return <Measurelands3DEntry teacherPreview={params.teacher_preview === "1"} />;
}
