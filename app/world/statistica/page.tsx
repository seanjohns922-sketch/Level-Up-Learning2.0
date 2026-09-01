import Statistica3DEntry from "@/components/world3d/Statistica3DEntry";

export default async function Statistica3DPage({ searchParams }: { searchParams: Promise<{ teacher_preview?: string }> }) {
  const params = await searchParams;
  return <Statistica3DEntry teacherPreview={params.teacher_preview === "1"} />;
}
