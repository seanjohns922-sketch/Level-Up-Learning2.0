import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import GroundStarpathRedesign from "@/components/demo/GroundStarpathRedesign";

export default async function Page() {
  if (!(await getServerStarpathAccess()).allowed) redirect("/login");
  return <GroundStarpathRedesign />;
}
