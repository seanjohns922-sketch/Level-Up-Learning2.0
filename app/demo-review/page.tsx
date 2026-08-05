import { redirect } from "next/navigation";
import DemoReviewPanel from "@/components/demo/DemoReviewPanel";
import { getServerStarpathAccess } from "@/lib/demo-session-server";

export default async function DemoReviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return <DemoReviewPanel />;
}
