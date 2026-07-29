import { notFound, redirect } from "next/navigation";
import SchoolHomeClient from "@/components/school/SchoolHomeClient";
import {
  isSchoolPlatformPreviewEnabled,
  loadSchoolHomePreview,
} from "@/lib/school-platform-server";

type SchoolPreviewPageProps = {
  params: Promise<{ schoolId: string }>;
};

export default async function SchoolPreviewPage({
  params,
}: SchoolPreviewPageProps) {
  if (!isSchoolPlatformPreviewEnabled()) notFound();

  const { schoolId } = await params;
  const preview = await loadSchoolHomePreview(schoolId);
  if (!preview) redirect("/teacher/dashboard");

  return (
    <SchoolHomeClient
      initialSnapshot={preview.snapshot}
      schools={preview.schools}
    />
  );
}
