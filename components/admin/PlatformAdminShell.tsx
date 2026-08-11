"use client";

import {
  Activity,
  BarChart3,
  Building2,
  Gauge,
  Fingerprint,
  Home,
  LogOut,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";

const NAVIGATION = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/schools", label: "Schools", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/identity", label: "Identity", icon: Fingerprint },
  { href: "/admin/home", label: "Home", icon: Home },
  { href: "/admin/growth", label: "Growth", icon: TrendingUp },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/audit", label: "Audit", icon: Activity },
] as const;

function isCurrent(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
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
    <div className="min-h-screen bg-[#f5f7f8] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-emerald-950 bg-[#082f2b] text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Level Up Learning
          </p>
          <p className="mt-2 text-xl font-semibold">Platform Admin</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Platform Admin">
          {NAVIGATION.map(({ href, label, icon: Icon }) => {
            const active = isCurrent(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-300 text-emerald-950"
                    : "text-emerald-50 hover:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-white/10 p-3">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-emerald-200">Platform Owner</p>
          </div>
          <Link
            href="/admin/settings"
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-emerald-50 hover:bg-white/10"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
            Settings
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-emerald-50 hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto lg:hidden">
            {NAVIGATION.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${
                  isCurrent(pathname, href)
                    ? "bg-emerald-100 text-emerald-900"
                    : "text-slate-600"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="hidden items-center justify-between lg:flex">
            <p className="text-sm font-semibold text-slate-500">Business and platform control centre</p>
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase text-emerald-800">
              2026 Free Access
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
