import NumberNexus3DEntry from "@/components/world3d/NumberNexus3DEntry";

export default async function NumberNexus3DPage({
  searchParams,
}: {
  searchParams: Promise<{ teacher_preview?: string; level?: string }>;
}) {
  const params = await searchParams;
  return <NumberNexus3DEntry teacherPreview={params.teacher_preview === "1"} requestedLevel={params.level} />;
}
