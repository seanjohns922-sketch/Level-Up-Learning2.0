"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { ArrowLeft, Gem, Image as ImageIcon, Landmark, Shirt, ShoppingBag, Sofa, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { WorldVoiceButton } from "@/components/world3d/WorldVoiceButton";
import { FullscreenToggle } from "@/components/FullscreenToggle";
import { buildGemCave, buildHallOfLegends, buildMainRoom, type TreehouseRoom } from "@/components/world3d/treehouse/treehouseRooms";
import { persistCanonicalAvatarAppearance } from "@/lib/avatar-appearance";
import { economyErrorMessage, equipEconomyItem, fetchDemoEconomy, fetchStudentEconomy, unequipEconomySlot, type EconomyItem, type EconomyState } from "@/lib/economy";
import { awardAndReveal } from "@/lib/gem-reveal";
import { fetchGemVault } from "@/lib/gems";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { pageFromTreehouseHref, treehouseExitHref, treehouseHref, treehouseWindowView, type TreehouseRoomParam } from "@/lib/world3d/treehouse-navigation";

const STOCK_ROOM_IMAGE = "/images/home-themes/explorer-study.png";

const ROOMS: Record<TreehouseRoomParam, { name: string; speech: string; Icon: typeof Sofa }> = {
  main: { name: "Main room", speech: "Your treehouse main room. The view through the round window is your home skin. Change your outfit at the wardrobe mirror, or visit the trading post to buy new things. Climb the ladder to the Hall of Legends, or go down the glowing hatch to the Gem Cave.", Icon: Sofa },
  gems: { name: "Gem Cave", speech: "The Gem Cave, in the roots of the ghost gum. Your gems glow in the nooks. Open the Gem Vault to see every gem you have earned.", Icon: Gem },
  legends: { name: "Hall of Legends", speech: "The Hall of Legends, where your RELIQS live. Open My RELIQS to see your whole collection.", Icon: Landmark },
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

type LookState = { yaw: number; pitch: number; fov: number };

/** Mounts one room and points a fixed-position camera where the student looks. */
function RoomScene({ room, look, reduceMotion }: { room: TreehouseRoom; look: React.RefObject<LookState>; reduceMotion: boolean }) {
  useEffect(() => () => room.dispose(), [room]);
  useFrame(({ clock, camera, size }) => {
    room.update(clock.elapsedTime, reduceMotion);
    const perspective = camera as THREE.PerspectiveCamera;
    const { yaw, pitch } = look.current;
    // Tall phone screens widen the view so the window and furniture still fit across.
    const aspect = size.width / size.height;
    const fov = aspect < 1 ? Math.min(80, look.current.fov * (1 + (1 - aspect) * 0.9)) : look.current.fov;
    if (perspective.fov !== fov) { perspective.fov = fov; perspective.updateProjectionMatrix(); }
    const cosPitch = Math.cos(pitch);
    perspective.position.copy(room.eye);
    perspective.lookAt(room.eye.x + Math.sin(yaw) * cosPitch, room.eye.y + Math.sin(pitch), room.eye.z + Math.cos(yaw) * cosPitch);
  });
  return (
    <>
      <color attach="background" args={[room.background]} />
      <fog attach="fog" args={[room.background, 30, 60]} />
      <primitive object={room.group} />
    </>
  );
}

function MainRoom({ viewUrl, look, reduceMotion }: { viewUrl: string; look: React.RefObject<LookState>; reduceMotion: boolean }) {
  const source = useTexture(viewUrl);
  const room = useMemo(() => {
    const view = source.clone();
    view.colorSpace = THREE.SRGBColorSpace;
    view.needsUpdate = true;
    return buildMainRoom(view);
  }, [source]);
  return <RoomScene room={room} look={look} reduceMotion={reduceMotion} />;
}

function GemCave({ gemsShown, look, reduceMotion }: { gemsShown: number; look: React.RefObject<LookState>; reduceMotion: boolean }) {
  const room = useMemo(() => buildGemCave(gemsShown), [gemsShown]);
  return <RoomScene room={room} look={look} reduceMotion={reduceMotion} />;
}

function HallOfLegends({ look, reduceMotion }: { look: React.RefObject<LookState>; reduceMotion: boolean }) {
  const room = useMemo(() => buildHallOfLegends(), []);
  return <RoomScene room={room} look={look} reduceMotion={reduceMotion} />;
}

const START_LOOK: Record<TreehouseRoomParam, LookState> = {
  main: { yaw: Math.PI + 0.12, pitch: -0.06, fov: 48 },
  gems: { yaw: Math.PI + 0.05, pitch: -0.2, fov: 54 },
  legends: { yaw: Math.PI, pitch: -0.08, fov: 52 },
};

export default function TreehouseInterior({ initialRoom, preview }: { initialRoom: TreehouseRoomParam; preview: boolean }) {
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();
  const [room, setRoom] = useState<TreehouseRoomParam>(initialRoom);
  const [economy, setEconomy] = useState<EconomyState | null>(null);
  const [gemsOwned, setGemsOwned] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const look = useRef<LookState>({ ...START_LOOK[initialRoom] });
  const studentId = useMemo(() => getActiveStudentProfile()?.studentId ?? null, []);

  useEffect(() => {
    let cancelled = false;
    const load = preview || !studentId ? fetchDemoEconomy() : fetchStudentEconomy(studentId);
    load.then((next) => { if (!cancelled) setEconomy(next); }).catch((error) => { if (!cancelled) setMessage(economyErrorMessage(error)); });
    // Entering home awards any gems earned since the last visit, as /home-base does.
    const vault = preview || !studentId ? fetchGemVault(studentId ?? "demo-preview") : awardAndReveal(studentId, "home_open");
    // Gem nooks are decoration; if the vault can't load, they simply stay unlit.
    vault.then((v) => { if (!cancelled && v) setGemsOwned(v.owned.length); }).catch(() => {});
    return () => { cancelled = true; };
  }, [preview, studentId]);

  const themes = useMemo(() => (economy?.items ?? [])
    .filter((item) => item.category === "background" && (item.metadata as { kind?: string })?.kind === "home_theme")
    .sort((a, b) => a.sort_order - b.sort_order), [economy?.items]);
  const owned = useMemo(() => new Set(economy?.inventory.map((entry) => entry.item_key) ?? []), [economy?.inventory]);
  const equippedKey = preview ? previewTheme : economy?.equipped.background ?? null;
  const equippedImage = (themes.find((item) => item.item_key === equippedKey)?.metadata as { image?: string } | undefined)?.image;
  const viewUrl = treehouseWindowView(equippedImage);

  function go(next: TreehouseRoomParam) {
    look.current = { ...START_LOOK[next] };
    setRoom(next);
    setPickerOpen(false);
    router.replace(treehouseHref(next, preview), { scroll: false });
  }

  async function chooseView(item: EconomyItem | null) {
    if (preview) { setPreviewTheme(item?.item_key ?? null); return; }
    if (!studentId || busy) return;
    if (item && !owned.has(item.item_key)) { router.push("/marketplace"); return; }
    setBusy(true);
    setMessage(null);
    try {
      const next = item ? await equipEconomyItem(studentId, item.item_key) : await unequipEconomySlot(studentId, "background");
      setEconomy(next);
      persistCanonicalAvatarAppearance(studentId, next);
    } catch (error) {
      setMessage(economyErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  // Drag to look around; scroll or pinch to zoom.
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const pinch = useRef<number | null>(null);
  const onPointerDown = (event: React.PointerEvent) => { drag.current = { x: event.clientX, y: event.clientY, id: event.pointerId }; };
  const onPointerMove = (event: React.PointerEvent) => {
    if (!drag.current || drag.current.id !== event.pointerId) return;
    look.current.yaw -= (event.clientX - drag.current.x) * 0.005;
    look.current.pitch = THREE.MathUtils.clamp(look.current.pitch - (event.clientY - drag.current.y) * 0.004, -0.6, 0.7);
    drag.current = { ...drag.current, x: event.clientX, y: event.clientY };
  };
  const endDrag = () => { drag.current = null; };
  const onWheel = (event: React.WheelEvent) => { look.current.fov = THREE.MathUtils.clamp(look.current.fov * (1 + Math.sign(event.deltaY) * 0.06), 32, 66); };
  const onTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length !== 2) return;
    const d = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
    if (pinch.current) look.current.fov = THREE.MathUtils.clamp(look.current.fov * (pinch.current / d), 32, 66);
    pinch.current = d;
  };

  const info = ROOMS[room];
  const collection = room === "gems" ? { label: "Open Gem Vault", detail: `${gemsOwned} gem${gemsOwned === 1 ? "" : "s"} collected`, href: pageFromTreehouseHref("/gem-vault", "gems", preview) }
    : room === "legends" ? { label: "Open My RELIQS", detail: "Every realm and Chronorok RELIQ", href: pageFromTreehouseHref("/legends", "legends", preview) } : null;

  return (
    <main data-treehouse className="fixed inset-0 overflow-hidden bg-[#120c08] text-white" style={{ touchAction: "none" }}>
      <div className="absolute inset-0" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onWheel={onWheel} onTouchMove={onTouchMove} onTouchEnd={() => { pinch.current = null; }}>
        <Canvas shadows dpr={[1, 1.5]} camera={{ fov: START_LOOK[initialRoom].fov, near: 0.1, far: 400 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}>
          <Suspense fallback={null}>
            {room === "main" ? <MainRoom viewUrl={viewUrl} look={look} reduceMotion={reduceMotion} /> : null}
            {room === "gems" ? <GemCave gemsShown={Math.min(8, gemsOwned)} look={look} reduceMotion={reduceMotion} /> : null}
            {room === "legends" ? <HallOfLegends look={look} reduceMotion={reduceMotion} /> : null}
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4" style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}>
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/15 bg-black/50 px-4 py-2 backdrop-blur-md">
          <info.Icon size={18} aria-hidden="true" />
          <h1 className="font-[Montserrat] text-sm font-black uppercase tracking-wide">{info.name}</h1>
          <WorldVoiceButton text={info.speech} compact label={`Read ${info.name}`} />
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <FullscreenToggle icon className="h-10 w-10 rounded-2xl border border-white/15 bg-black/50 text-white backdrop-blur-md hover:bg-black/65" />
          <a href={treehouseExitHref(preview)} className="flex items-center gap-2 rounded-2xl border border-white/15 bg-black/50 px-4 py-2 text-sm font-extrabold backdrop-blur-md hover:bg-black/65">
            <ArrowLeft size={16} aria-hidden="true" />Back outside
          </a>
        </div>
      </div>

      {message ? <p role="status" className="absolute left-1/2 top-20 -translate-x-1/2 rounded-xl bg-black/70 px-4 py-2 text-sm font-bold">{message}</p> : null}

      {pickerOpen && room === "main" ? (
        <section aria-label="Window view" className="absolute right-4 top-20 max-h-[70vh] w-[min(320px,calc(100vw-32px))] overflow-y-auto rounded-2xl border border-white/15 bg-black/70 p-3 backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.14em] text-[#F5C04A]">Window view</h2>
            <button type="button" onClick={() => setPickerOpen(false)} aria-label="Close window views" className="rounded-lg p-1 hover:bg-white/10"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ViewChoice image={STOCK_ROOM_IMAGE} name="Explorer Study" selected={!equippedKey} onChoose={() => void chooseView(null)} />
            {themes.map((item) => {
              const image = (item.metadata as { image?: string })?.image ?? STOCK_ROOM_IMAGE;
              return <ViewChoice key={item.item_key} image={treehouseWindowView(image)} name={item.name} selected={equippedKey === item.item_key} locked={!preview && !owned.has(item.item_key)} onChoose={() => void chooseView(item)} />;
            })}
          </div>
        </section>
      ) : null}

      <nav aria-label="Treehouse rooms" className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-2 p-4" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-black/55 p-2 backdrop-blur-md">
          {(Object.keys(ROOMS) as TreehouseRoomParam[]).map((key) => {
            const { name, Icon } = ROOMS[key];
            return (
              <button key={key} type="button" onClick={() => go(key)} aria-current={room === key ? "page" : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold ${room === key ? "bg-gradient-to-br from-[#D86BF7] to-[#8C2EAC]" : "hover:bg-white/10"}`}>
                <Icon size={16} aria-hidden="true" />{name}
              </button>
            );
          })}
          {room === "main" ? (
            <>
              <button type="button" onClick={() => setPickerOpen((open) => !open)} aria-expanded={pickerOpen} className="flex items-center gap-2 rounded-xl bg-[#F5C04A] px-3 py-2 text-sm font-black text-[#1c1406]">
                <ImageIcon size={16} aria-hidden="true" />Window view
              </button>
              <a href={pageFromTreehouseHref("/wardrobe", "main", preview)} className="flex items-center gap-2 rounded-xl bg-[#F5C04A] px-3 py-2 text-sm font-black text-[#1c1406]">
                <Shirt size={16} aria-hidden="true" />Wardrobe
              </a>
              <a href={pageFromTreehouseHref("/marketplace", "main", preview)} className="flex items-center gap-2 rounded-xl bg-[#F5C04A] px-3 py-2 text-sm font-black text-[#1c1406]">
                <ShoppingBag size={16} aria-hidden="true" />Shop
              </a>
            </>
          ) : null}
          {collection ? (
            <a href={collection.href} className="flex items-center gap-2 rounded-xl bg-[#F5C04A] px-3 py-2 text-sm font-black text-[#1c1406]">
              <Sparkles size={16} aria-hidden="true" />{collection.label}<span className="hidden text-xs font-bold opacity-75 sm:inline">· {collection.detail}</span>
            </a>
          ) : null}
        </div>
      </nav>
    </main>
  );
}

function ViewChoice({ image, name, selected, locked = false, onChoose }: { image: string; name: string; selected: boolean; locked?: boolean; onChoose: () => void }) {
  return (
    <button type="button" onClick={onChoose} aria-pressed={selected} className={`overflow-hidden rounded-xl border text-left ${selected ? "border-[#F5C04A] ring-2 ring-[#F5C04A]/40" : "border-white/15 hover:border-white/35"}`}>
      <span className="block aspect-video w-full bg-cover bg-center" style={{ backgroundImage: `url('${image}')` }} />
      <span className="block px-2 py-1 text-xs font-bold">{name}{locked ? " · in shop" : ""}</span>
    </button>
  );
}
