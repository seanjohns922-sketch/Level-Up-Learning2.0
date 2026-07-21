import { redirect } from "next/navigation";
import StarpathClient from "@/app/starpath/StarpathClient";
import { getServerStarpathAccess } from "@/lib/demo-session-server";

export const dynamic = "force-dynamic";

export default async function StarpathPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) {
    redirect("/realms");
  }
  return <StarpathClient />;
}
