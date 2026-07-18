"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Gem, Library, PawPrint, ShoppingBag, Trophy, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import EconomyHeader from "@/components/economy/EconomyHeader";
import StudentAvatar, { type AvatarOutfit } from "@/components/avatar/StudentAvatar";
import { economyErrorMessage, fetchStudentEconomy, getExplorerRank, type EconomyItem, type EconomyState } from "@/lib/economy";
import { getActiveStudentProfile } from "@/lib/studentIdentity";

export default function HomeBasePage() {
  const router = useRouter();
  const student = useMemo(() => getActiveStudentProfile(), []);
  const [state, setState] = useState<EconomyState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionError = student?.studentId ? null : "Log in as a student to visit your Home Base.";

  useEffect(() => {
    if (!student?.studentId) return;
    fetchStudentEconomy(student.studentId).then(setState).catch((nextError) => setError(economyErrorMessage(nextError)));
  }, [student?.studentId]);

  const itemByKey = useMemo(() => new Map((state?.items ?? []).map((item) => [item.item_key, item])), [state?.items]);
  const avatarItem = itemByKey.get(state?.equipped.avatar ?? "") as EconomyItem | undefined;
  const petItem = itemByKey.get(state?.equipped.pet ?? "") as EconomyItem | undefined;
  const homeItem = itemByKey.get(state?.equipped.home ?? "") as EconomyItem | undefined;
  const backgroundItem = itemByKey.get(state?.equipped.background ?? "") as EconomyItem | undefined;
  const avatarOutfit = avatarItem?.metadata as AvatarOutfit | undefined;
  const collectibleCount = state?.inventory.filter((entry) => itemByKey.get(entry.item_key)?.category === "collectible").length ?? 0;
  const explorerRank = getExplorerRank(state?.wallet.xp_earned ?? 0);

  return (
    <main className="min-h-screen bg-[#e8eee9] text-slate-900">
      <EconomyHeader xp={state?.wallet.xp_balance} essence={state?.wallet.essence} rankLevel={explorerRank.level} />
      <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">{student?.displayName ?? "Explorer"}&apos;s space</p><h1 className="text-3xl font-black md:text-4xl">Home Base</h1></div><button type="button" onClick={() => router.push("/realms")} className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-800">Continue learning</button></div>
        {error || sessionError ? <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">{error ?? sessionError}</div> : null}
        <section className="relative min-h-[520px] overflow-hidden rounded-md border border-emerald-950/20 bg-cover bg-center shadow-xl" style={{ backgroundImage: `linear-gradient(to bottom, rgba(9,30,25,.15), rgba(9,30,25,.62)), url('${backgroundItem?.realm_id === "number" ? "/images/number-nexus-home-bg.jpg" : "/images/measurelands-home-bg.jpg"}')` }}>
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-black/25 p-4 text-white backdrop-blur-sm"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">Current room</p><h2 className="text-lg font-black">{backgroundItem?.name ?? "Explorer Study"}</h2></div><div className="text-right"><div className="flex items-center gap-2 rounded-md bg-black/25 px-3 py-2 text-xs font-black"><Zap className="h-4 w-4 text-amber-300" />{explorerRank.title} · Rank {explorerRank.level}</div><div className="mt-1 h-1 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-amber-300" style={{ width: `${explorerRank.progressPercent}%` }} /></div></div></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2"><StudentAvatar height={285} outfit={avatarOutfit} /></div>
          {petItem ? <div className="absolute bottom-14 left-[calc(50%+100px)] flex h-24 w-24 flex-col items-center justify-center rounded-full border border-white/30 bg-white/85 text-center shadow-lg"><PawPrint className="h-8 w-8 text-emerald-700" /><span className="mt-1 text-[10px] font-black">{petItem.name}</span></div> : null}
          <div className="absolute bottom-4 left-4 max-w-[220px] rounded-md border border-white/20 bg-slate-950/75 p-4 text-white backdrop-blur"><Library className="h-5 w-5 text-amber-300" /><p className="mt-2 text-xs font-black uppercase tracking-wider">Display shelf</p><p className="mt-1 text-sm text-white/75">{homeItem?.name ?? "Choose furniture from the Marketplace"}</p></div>
          <div className="absolute bottom-4 right-4 rounded-md border border-white/20 bg-slate-950/75 p-4 text-white backdrop-blur"><div className="flex items-center gap-2"><Gem className="h-5 w-5 text-cyan-300" /><span className="text-2xl font-black">{collectibleCount}</span></div><p className="mt-1 text-[10px] font-black uppercase tracking-wider text-white/65">Discoveries displayed</p></div>
        </section>
        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <button type="button" onClick={() => router.push("/marketplace")} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4 text-left hover:border-amber-400"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-100 text-amber-700"><ShoppingBag className="h-5 w-5" /></span><span><strong className="block text-sm">Marketplace</strong><small className="text-slate-500">Find permanent cosmetics</small></span></button>
          <button type="button" onClick={() => router.push("/collections")} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4 text-left hover:border-emerald-400"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-100 text-emerald-700"><BookOpen className="h-5 w-5" /></span><span><strong className="block text-sm">Collection Journal</strong><small className="text-slate-500">View discoveries and museums</small></span></button>
          <button type="button" onClick={() => router.push("/legends")} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4 text-left hover:border-violet-400"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-violet-100 text-violet-700"><Trophy className="h-5 w-5" /></span><span><strong className="block text-sm">Legend displays</strong><small className="text-slate-500">Celebrate mastered pathways</small></span></button>
        </section>
      </div>
    </main>
  );
}
