import { LifeBuoy } from "lucide-react";
import { SUPPORT_EMAIL, supportMailto } from "@/lib/contact";

/**
 * "Get help" for adult screens: opens an email to RELIQ support. `icon` shows
 * only the icon (for compact headers); otherwise the label sits beside it.
 */
export function SupportLink({ className, icon = false }: { className?: string; icon?: boolean }) {
  return (
    <a
      href={supportMailto()}
      className={className}
      aria-label={`Get help: email ${SUPPORT_EMAIL}`}
      title={`Get help: ${SUPPORT_EMAIL}`}
    >
      <LifeBuoy className={icon ? "h-[18px] w-[18px]" : "h-5 w-5"} aria-hidden="true" />
      {icon ? null : "Get help"}
    </a>
  );
}
