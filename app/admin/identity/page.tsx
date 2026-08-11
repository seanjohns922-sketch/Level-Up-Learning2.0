import { redirect } from "next/navigation";
import { AdminPageHeading } from "@/components/admin/AdminPrimitives";
import IdentityCentreClient from "@/components/admin/IdentityCentreClient";
import { loadPlatformIdentityCentre } from "@/lib/platform-admin-server";

export default async function IdentityCentrePage() {
  const data = await loadPlatformIdentityCentre();
  if (!data) redirect("/login");
  return (
    <>
      <AdminPageHeading
        eyebrow="Identity"
        title="Student identity centre"
        detail="Link existing students, review duplicate warnings and merge confirmed duplicate identities without losing learning records."
      />
      <IdentityCentreClient initialSnapshot={data.snapshot} />
    </>
  );
}
