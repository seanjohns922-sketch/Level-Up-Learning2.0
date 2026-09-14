import { Suspense } from "react";
import { redirect } from "next/navigation";
import DiagnosticPreview from "@/components/demo/DiagnosticPreview";
import { getServerStarpathAccess } from "@/lib/demo-session-server";

export default async function DiagnosticPreviewPage() {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  return (
    <Suspense fallback={null}>
      <DiagnosticPreview />
    </Suspense>
  );
}
