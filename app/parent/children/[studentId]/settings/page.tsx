import { HomeChildSettings } from "@/components/parent/ParentPortal";

export default async function Page({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  return <HomeChildSettings studentId={studentId} />;
}
