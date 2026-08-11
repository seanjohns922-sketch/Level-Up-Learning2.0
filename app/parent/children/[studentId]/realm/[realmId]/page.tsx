import { ParentRealmDetail } from "@/components/parent/ParentPortal";
export default async function Page({ params }: { params: Promise<{ studentId: string; realmId: string }> }) { const { studentId, realmId } = await params; return <ParentRealmDetail studentId={studentId} realmId={realmId} />; }
