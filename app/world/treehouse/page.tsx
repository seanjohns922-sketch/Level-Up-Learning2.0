import Treehouse3DEntry from "@/components/world3d/treehouse/Treehouse3DEntry";
import { parseTreehouseRoom } from "@/lib/world3d/treehouse-navigation";

export default async function TreehousePage({ searchParams }: { searchParams: Promise<{ teacher_preview?: string; room?: string }> }) {
  const params = await searchParams;
  return <Treehouse3DEntry room={parseTreehouseRoom(params.room)} teacherPreview={params.teacher_preview === "1"} />;
}
