"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RELIQ_LETTERS_PATH, RELIQ_Q_PATH } from "@/lib/brand-reliq-logo-paths";
import { supabase } from "@/lib/supabase";

/**
 * Platform owner console shell. Same brand system as the other adult screens
 * (Carbon, warm neutrals, Montserrat), with aqua as the owner-only accent so the
 * console is never mistaken for a school's own view.
 */
export const ADMIN_AQUA = "#2EE6E0";

// Grouped by job so new staff can find their way; the current page gets a thin aqua bar.
const NAVIGATION = [
  { href: "/admin", label: "Overview", group: "Run the business" },
  { href: "/admin/schools", label: "Schools & licences", group: "Run the business" },
  { href: "/admin/users", label: "Users", group: "People" },
  { href: "/admin/identity", label: "Identity", group: "People" },
  { href: "/admin/home", label: "Home families", group: "People" },
  { href: "/admin/growth", label: "Growth", group: "Insights" },
  { href: "/admin/analytics", label: "Analytics", group: "Insights" },
  { href: "/admin/audit", label: "Audit log", group: "System" },
] as const;
const GROUPS = ["Run the business", "People", "Insights", "System"] as const;

function isCurrent(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

function OwnerLogo() {
  return (
    <svg viewBox="0 0 279 79" className="h-auto w-[118px]" role="img" aria-label="RELIQ">
      <path fill="#FFFFFF" d={RELIQ_LETTERS_PATH} />
      <path fill={ADMIN_AQUA} d={RELIQ_Q_PATH} />
    </svg>
  );
}

export default function PlatformAdminShell({
  displayName,
  children,
}: {
  displayName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  async function signOut() {
    await fetch("/api/admin-session", { method: "DELETE" });
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <div className="reliq-adult admin-console min-h-screen bg-[#F4F5F1] text-[#121314]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#121314] text-white lg:flex">
        <div className="px-6 pb-6 pt-7">
          <OwnerLogo />
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#2EE6E0] [font-family:var(--font-display)]">
            Platform Admin
          </p>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3" aria-label="Platform Admin">
          {GROUPS.map((group) => (
            <div key={group}>
              <p className="px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{group}</p>
              <div className="mt-2 space-y-0.5">
                {NAVIGATION.filter((item) => item.group === group).map(({ href, label }) => {
                  const active = isCurrent(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold transition ${
                        active ? "bg-white/[0.08] text-white" : "text-white/65 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      {active ? <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-[#2EE6E0]" aria-hidden="true" /> : null}
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-bold">{displayName}</p>
            <p className="text-xs text-white/55">Platform Owner</p>
          </div>
          <Link
            href="/admin/settings"
            aria-current={isCurrent(pathname, "/admin/settings") ? "page" : undefined}
            className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${
              isCurrent(pathname, "/admin/settings") ? "bg-white/[0.08] text-white" : "text-white/65 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
            Settings
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-white/65 transition hover:bg-white/[0.05] hover:text-white"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[#E3E5E0] bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto lg:hidden">
            {NAVIGATION.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold ${
                  isCurrent(pathname, href) ? "bg-[#121314] text-[#2EE6E0]" : "text-[#5A5E63]"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="hidden items-center justify-between lg:flex">
            <p className="text-sm font-bold text-[#5A5E63]">Business and platform control centre</p>
            <span className="rounded-full border-2 border-[#121314] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#121314] [font-family:var(--font-display)]">
              2026 Free Access
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
