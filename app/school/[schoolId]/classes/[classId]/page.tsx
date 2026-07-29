import { notFound, redirect } from "next/navigation";
import {
  isSchoolPlatformPreviewEnabled,
  loadSchoolHomePreview,
} from "@/lib/school-platform-server";

type SchoolClassPreviewPageProps = {
  params: Promise<{ schoolId: string; classId: string }>;
};

export default async function SchoolClassPreviewPage({
  params,
}: SchoolClassPreviewPageProps) {
  if (!isSchoolPlatformPreviewEnabled()) notFound();

  const { schoolId, classId } = await params;
  const preview = await loadSchoolHomePreview(schoolId);
  if (!preview) redirect("/teacher/dashboard");

  const classRow = preview.snapshot.classes.find(
    (candidate) => candidate.id === classId,
  );
  if (!classRow?.canOpen) redirect(`/school/${schoolId}`);

  const query = new URLSearchParams({
    classId,
    schoolId,
    schoolPreview: "1",
  });
  redirect(`/teacher/dashboard?${query.toString()}`);
}
