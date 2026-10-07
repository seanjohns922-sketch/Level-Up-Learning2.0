import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import Review from "./review";

export default async function Page() {
  if (!(await getServerStarpathAccess()).allowed) redirect("/login");
  return <Review />;
}
