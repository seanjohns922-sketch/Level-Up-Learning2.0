"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Castle,
  Gem,
  Library,
  PawPrint,
  Shirt,
  ShoppingBag,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import EconomyHeader from "@/components/economy/EconomyHeader";
import StudentAvatar, { type AvatarOutfit } from "@/components/avatar/StudentAvatar";
import {
  economyErrorMessage,
  fetchStudentEconomy,
  getExplorerRank,
  type EconomyItem,
  type EconomyState,
} from "@/lib/economy";
import { resolveContinueLearningRoute } from "@/lib/continue-learning";
import { getActiveStudentIdentity, getActiveStudentProfile } from "@/lib/studentIdentity";

const HOME_DESTINATIONS = [
  {
    label: "Marketplace",
    description: "Spend global XP on permanent cosmetics.",
    route: "/marketplace",
    Icon: ShoppingBag,
    accent: "border-amber-300/45 bg-amber-300/10 text-amber-100",
  },
  {
    label: "Collection Journal",
    description: "Visit every museum and discovery collection.",
    route: "/collections",
    Icon: BookOpen,
    accent: "border-emerald-300/45 bg-emerald-300/10 text-emerald-100",
  },
  {
    label: "Hall of Legends",
    description: "See the Legends unlocked across every realm.",
    route: "/legends",
    Icon: Trophy,
    accent: "border-violet-300/45 bg-violet-300/10 text-violet-100",
  },
  {
    label: "Wardrobe & Pets",
    description: "Preview outfits and choose a companion.",
    route: "/marketplace",
    Icon: Shirt,
    accent: "border-cyan-300/45 bg-cyan-300/10 text-cyan-100",
  },
] as const;

export default function HomeBasePage() {
  const router = useRouter();
  const [student] = useState(() => getActiveStudentProfile());
  const [state, setState] = useState<EconomyState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionError = student?.studentId ? null : "Log in as a student to visit My Home.";

  useEffect(() => {
    if (!student?.studentId) return;
    let cancelled = false;
    const requestedStudentId = student.studentId;

    void fetchStudentEconomy(requestedStudentId)
      .then((nextState) => {
        if (cancelled || getActiveStudentIdentity().studentId !== requestedStudentId) return;
        setState(nextState);
      })
      .catch((nextError) => {
        if (cancelled || getActiveStudentIdentity().studentId !== requestedStudentId) return;
        setError(economyErrorMessage(nextError));
      });

    return () => {
      cancelled = true;
    };
  }, [student?.studentId]);

  const itemByKey = useMemo(
    () => new Map((state?.items ?? []).map((item) => [item.item_key, item])),
    [state?.items],
  );
  const avatarItem = itemByKey.get(state?.equipped.avatar ?? "") as EconomyItem | undefined;
  const petItem = itemByKey.get(state?.equipped.pet ?? "") as EconomyItem | undefined;
  const homeItem = itemByKey.get(state?.equipped.home ?? "") as EconomyItem | undefined;
  const backgroundItem = itemByKey.get(state?.equipped.background ?? "") as EconomyItem | undefined;
  const avatarOutfit = avatarItem?.metadata as AvatarOutfit | undefined;
  const collectibleCount = state?.inventory.filter(
    (entry) => itemByKey.get(entry.item_key)?.category === "collectible",
  ).length ?? 0;
  const explorerRank = getExplorerRank(state?.wallet.xp_earned ?? 0);
  const roomBackground = backgroundItem?.realm_id === "measurement"
    ? "/images/measurelands-home-bg.jpg"
    : "/images/number-nexus-home-bg.jpg";

  function continueLearning() {
    if (!student?.studentId) {
      router.push("/login");
      return;
    }
    router.push(resolveContinueLearningRoute());
  }

  return (
    <main className="min-h-screen bg-[#071513] text-white">
      <EconomyHeader
        xp={state?.wallet.xp_balance}
        essence={state?.wallet.essence}
        rankLevel={explorerRank.level}
      />

      <section
        className="relative min-h-[min(720px,calc(100vh-65px))] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url('${roomBackground}')` }}
        aria-label="My Home room"
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,15,13,.88)_0%,rgba(3,15,13,.34)_48%,rgba(3,15,13,.72)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(3,15,13,.94)_0%,transparent_55%,rgba(3,15,13,.36)_100%)]" />

        <div className="relative z-10 mx-auto grid min-h-[min(720px,calc(100vh-65px))] max-w-[1440px] gap-6 px-5 py-7 lg:grid-cols-[minmax(270px,420px)_1fr_minmax(240px,330px)] lg:px-8">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">My Home</p>
              <h1 className="mt-2 text-4xl font-black leading-none sm:text-5xl">
                {student?.displayName ? `${student.displayName}'s place` : "Explorer's place"}
              </h1>
              <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-white/72">
                Everything earned through learning lives here, across every realm.
              </p>
            </div>

            <div className="max-w-sm border-l-2 border-amber-300/70 pl-4">
              <div className="flex items-center gap-2 text-amber-200">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-black uppercase tracking-[0.16em]">Explorer Rank</span>
              </div>
              <p className="mt-2 text-2xl font-black">{explorerRank.title}</p>
              <p className="mt-1 text-sm font-bold text-white/70">Rank {explorerRank.level} · {state?.wallet.xp_earned.toLocaleString() ?? "—"} lifetime XP</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15" aria-label={`${explorerRank.progressPercent}% to the next Explorer Rank`}>
                <div className="h-full rounded-full bg-amber-300" style={{ width: `${explorerRank.progressPercent}%` }} />
              </div>
            </div>

            <button
              type="button"
              onClick={continueLearning}
              className="group flex w-full max-w-sm items-center justify-between rounded-md border border-emerald-200/45 bg-emerald-400 px-5 py-4 text-left text-emerald-950 shadow-[0_14px_40px_rgba(16,185,129,.24)] transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200/70"
            >
              <span>
                <span className="block text-xs font-black uppercase tracking-[0.16em]">Continue Learning</span>
                <span className="mt-1 block text-sm font-bold text-emerald-950/70">Resume your journey</span>
              </span>
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex min-h-[390px] items-end justify-center lg:min-h-0">
            <div className="absolute bottom-3 h-16 w-72 rounded-[50%] bg-emerald-200/15 blur-xl" />
            <StudentAvatar height={320} outfit={avatarOutfit} glowColor="rgba(110,231,183,.25)" />
            <div className="absolute bottom-5 left-[calc(50%+70px)] flex min-h-24 w-28 flex-col items-center justify-center rounded-full border border-white/25 bg-slate-950/65 p-3 text-center backdrop-blur-sm">
              <PawPrint className={`h-8 w-8 ${petItem ? "text-emerald-300" : "text-white/40"}`} aria-hidden="true" />
              <span className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/85">
                {petItem?.name ?? "Pet space"}
              </span>
              {!petItem ? <span className="mt-0.5 text-[9px] text-white/45">No pet equipped</span> : null}
            </div>
          </div>

          <div className="flex flex-col justify-end gap-3">
            <div className="mb-auto flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">Current room</p>
                <p className="mt-1 font-black">{backgroundItem?.name ?? "Explorer Study"}</p>
              </div>
              <button type="button" onClick={() => router.push("/realms")} className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-black/25 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Open the Tower of Knowledge" title="Tower of Knowledge">
                <Castle className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-white/15 bg-black/35 p-3 backdrop-blur-sm">
                <Library className="h-5 w-5 text-amber-300" aria-hidden="true" />
                <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-white/55">Display</p>
                <p className="mt-1 text-sm font-bold">{homeItem?.name ?? "Shelf available"}</p>
              </div>
              <div className="rounded-md border border-white/15 bg-black/35 p-3 backdrop-blur-sm">
                <Gem className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-white/55">Discoveries</p>
                <p className="mt-1 text-2xl font-black">{collectibleCount}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#07110f] px-5 py-6 lg:px-8" aria-label="My Home destinations">
        <div className="mx-auto grid max-w-[1440px] gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {HOME_DESTINATIONS.map(({ label, description, route, Icon, accent }) => (
            <button
              key={label}
              type="button"
              onClick={() => router.push(route)}
              className="group flex min-h-28 items-center gap-4 rounded-md border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md border ${accent}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <strong className="block text-sm font-black">{label}</strong>
                <span className="mt-1 block text-xs leading-5 text-white/55">{description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {error || sessionError ? (
        <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,560px)] -translate-x-1/2 rounded-md border border-amber-200/35 bg-amber-950/95 px-4 py-3 text-center text-sm font-bold text-amber-100 shadow-xl" role="status">
          {error ?? sessionError}
        </div>
      ) : null}
    </main>
  );
}
