"use client";

import { ArrowLeft, BookOpen, House, Medal, Shirt, ShoppingBag, Sparkles, User, Zap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function EconomyHeader({ xp, essence = 0, rankLevel = 1 }: { xp?: number | null; essence?: number; rankLevel?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const destinations = [
    { href: "/home-base", label: "My Home", icon: House },
    { href: "/wardrobe", label: "Explorer Outfit", icon: Shirt },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/collections", label: "Journal", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 md:px-6">
        <button type="button" onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" aria-label="Rewards destinations">
          {destinations.map((destination) => {
            const active = pathname === destination.href;
            return (
              <button key={destination.href} type="button" onClick={() => router.push(destination.href)} className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-extrabold ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                <destination.icon className="h-4 w-4" /> {destination.label}
              </button>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 md:flex"><Medal className="h-3.5 w-3.5" />Rank {rankLevel}</div>
          <div className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800"><Zap className="h-3.5 w-3.5" />{xp == null ? "—" : xp.toLocaleString()} XP</div>
          <div className="hidden items-center gap-1.5 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-800 sm:flex"><Sparkles className="h-3.5 w-3.5" />{essence}</div>
          <button type="button" onClick={() => router.push("/profile")} className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Open student profile" title="Student profile">
            <User className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
