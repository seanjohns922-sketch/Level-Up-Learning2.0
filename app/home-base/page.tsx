"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Castle,
  Check,
  Gem,
  Library,
  Lock,
  PawPrint,
  Pencil,
  Shirt,
  ShoppingBag,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import EconomyHeader from "@/components/economy/EconomyHeader";
import StudentAvatar from "@/components/avatar/StudentAvatar";
import {
  economyErrorMessage,
  equipEconomyItem,
  fetchStudentEconomy,
  getExplorerRank,
  mergeAvatarOutfit,
  RARITY_STYLES,
  unequipEconomySlot,
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
    label: "Avatar Studio",
    description: "Change your look — hair, outfits, hats and more.",
    route: "/wardrobe",
    Icon: Shirt,
    accent: "border-cyan-300/45 bg-cyan-300/10 text-cyan-100",
  },
] as const;

export default function HomeBasePage() {
  const router = useRouter();
  const [student] = useState(() => getActiveStudentProfile());
  const [state, setState] = useState<EconomyState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomPickerOpen, setRoomPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
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
  const petItem = itemByKey.get(state?.equipped.pet ?? "") as EconomyItem | undefined;
  const homeItem = itemByKey.get(state?.equipped.home ?? "") as EconomyItem | undefined;
  const backgroundItem = itemByKey.get(state?.equipped.background ?? "") as EconomyItem | undefined;
  const avatarOutfit = state ? mergeAvatarOutfit(state) : undefined;
  const collectibleCount = state?.inventory.filter(
    (entry) => itemByKey.get(entry.item_key)?.category === "collectible",
  ).length ?? 0;
  const explorerRank = getExplorerRank(state?.wallet.xp_earned ?? 0);
  // Home themes are realm-agnostic. Explorer Study is the free stock room.
  const roomBackground =
    (backgroundItem?.metadata as { image?: string } | undefined)?.image
    ?? "/images/home-themes/explorer-study.png";

  const roomThemes = useMemo(
    () => (state?.items ?? [])
      .filter((item) => item.category === "background" && (item.metadata as { kind?: string })?.kind === "home_theme")
      .sort((a, b) => a.sort_order - b.sort_order),
    [state?.items],
  );
  const ownedKeys = useMemo(() => new Set(state?.inventory.map((entry) => entry.item_key) ?? []), [state?.inventory]);

  function continueLearning() {
    if (!student?.studentId) {
      router.push("/login");
      return;
    }
    router.push(resolveContinueLearningRoute());
  }

  async function selectTheme(item: EconomyItem) {
    if (!student?.studentId || busy) return;
    if (!ownedKeys.has(item.item_key)) {
      router.push("/marketplace");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setState(await equipEconomyItem(student.studentId, item.item_key));
    } catch (nextError) {
      setError(economyErrorMessage(nextError));
    } finally {
      setBusy(false);
    }
  }

  async function revertToStockRoom() {
    if (!student?.studentId || busy || !state?.equipped.background) return;
    setBusy(true);
    setError(null);
    try {
      setState(await unequipEconomySlot(student.studentId, "background"));
    } catch (nextError) {
      setError(economyErrorMessage(nextError));
    } finally {
      setBusy(false);
    }
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
            <div className="mb-auto border-b border-white/15 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">Current room</p>
                  <p className="mt-1 font-black">{backgroundItem?.name ?? "Explorer Study"}</p>
                </div>
                <button type="button" onClick={() => router.push("/realms")} className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-black/25 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Open the Tower of Knowledge" title="Tower of Knowledge">
                  <Castle className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setRoomPickerOpen(true)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Change room
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

      {roomPickerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Choose your room"
          onClick={() => setRoomPickerOpen(false)}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0b1a17] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">My Home</p>
                <h2 className="text-xl font-black text-white">Choose your room</h2>
              </div>
              <button type="button" onClick={() => setRoomPickerOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300" aria-label="Close">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-3 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Free stock room */}
              <button
                type="button"
                onClick={revertToStockRoom}
                disabled={busy}
                className={`group overflow-hidden rounded-xl border text-left transition disabled:opacity-60 ${!state?.equipped.background ? "border-emerald-400 ring-2 ring-emerald-400/40" : "border-white/12 hover:border-white/30"}`}
              >
                <div className="relative aspect-video w-full bg-cover bg-center" style={{ backgroundImage: "url('/images/home-themes/explorer-study.png')" }}>
                  {!state?.equipped.background ? (
                    <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-emerald-950"><Check className="h-3 w-3" aria-hidden="true" /> In use</span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="text-sm font-black text-white">Explorer Study</span>
                  <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-black text-emerald-300">Free</span>
                </div>
              </button>

              {roomThemes.map((item) => {
                const image = (item.metadata as { image?: string }).image;
                const owned = ownedKeys.has(item.item_key);
                const isOn = state?.equipped.background === item.item_key;
                const rarity = RARITY_STYLES[item.rarity];
                return (
                  <button
                    key={item.item_key}
                    type="button"
                    onClick={() => selectTheme(item)}
                    disabled={busy}
                    className={`group overflow-hidden rounded-xl border text-left transition disabled:opacity-60 ${isOn ? "border-emerald-400 ring-2 ring-emerald-400/40" : "border-white/12 hover:border-white/30"}`}
                  >
                    <div className="relative aspect-video w-full bg-cover bg-center" style={{ backgroundImage: `url('${image}')` }}>
                      {!owned ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/55">
                          <span className="flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs font-black text-white"><Lock className="h-3.5 w-3.5" aria-hidden="true" /> {item.price} XP</span>
                        </span>
                      ) : null}
                      {isOn ? (
                        <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-emerald-950"><Check className="h-3 w-3" aria-hidden="true" /> In use</span>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3">
                      <span className="truncate text-sm font-black text-white">{item.name}</span>
                      <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black" style={{ color: rarity.color, background: rarity.background }}>{rarity.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-white/10 px-5 py-3 text-center text-xs text-white/50">Locked rooms open in the Marketplace with XP.</div>
          </div>
        </div>
      ) : null}

      {error || sessionError ? (
        <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,560px)] -translate-x-1/2 rounded-md border border-amber-200/35 bg-amber-950/95 px-4 py-3 text-center text-sm font-bold text-amber-100 shadow-xl" role="status">
          {error ?? sessionError}
        </div>
      ) : null}
    </main>
  );
}
