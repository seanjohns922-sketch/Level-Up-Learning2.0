import TowerRealmChamber3DEntry from "@/components/world3d/TowerRealmChamber3DEntry";

export default async function TowerWorldPage({ searchParams }: { searchParams: Promise<{ teacher_preview?: string }> }) {
  const params = await searchParams;
  return <TowerRealmChamber3DEntry teacherPreview={params.teacher_preview === "1"} />;
}

