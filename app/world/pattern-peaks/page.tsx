import PatternPeaks3DEntry from "@/components/world3d/PatternPeaks3DEntry";

export default async function PatternPeaks3DPage({ searchParams }: { searchParams: Promise<{ teacher_preview?: string }> }) {
  const params = await searchParams;
  return <PatternPeaks3DEntry teacherPreview={params.teacher_preview === "1"} />;
}
