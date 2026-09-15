import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import PrepNumberCandidateReview from "@/components/demo/PrepNumberCandidateReview";

export default async function AssessmentCandidatesPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return <PrepNumberCandidateReview/>;
}
