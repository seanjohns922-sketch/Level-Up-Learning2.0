import { notFound } from "next/navigation";
import PrepNumberCandidateReview from "@/components/demo/PrepNumberCandidateReview";

export default function AssessmentCandidatesPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <PrepNumberCandidateReview/>;
}
