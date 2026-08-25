import CentralWorld3DEntry from "@/components/world3d/CentralWorld3DEntry";

export default async function CentralWorldPage({ searchParams }: { searchParams: Promise<{ teacher_preview?: string }> }) {
  const params = await searchParams;
  return <CentralWorld3DEntry teacherPreview={params.teacher_preview === "1"} />;
}
