import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import PlatformAdminShell from "@/components/admin/PlatformAdminShell";
import { requirePlatformOwner } from "@/lib/platform-admin-server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const access = await requirePlatformOwner();
  if (!access) redirect("/login");

  return (
    <PlatformAdminShell displayName={access.context.displayName ?? "Platform Owner"}>
      {children}
    </PlatformAdminShell>
  );
}
