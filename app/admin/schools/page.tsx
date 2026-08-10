import { AdminPageHeading } from "@/components/admin/AdminPrimitives";
import SchoolsAdminClient from "@/components/admin/SchoolsAdminClient";
import { loadPlatformSchools } from "@/lib/platform-admin-server";

export default async function PlatformSchoolsPage() {
  const data = await loadPlatformSchools();
  return (
    <>
      <AdminPageHeading eyebrow="Schools" title="School access and seats" detail="Manage free rollout access, annual seat entitlements and school → home activation without loading individual student records." />
      <SchoolsAdminClient schools={data?.schools ?? []} />
    </>
  );
}
