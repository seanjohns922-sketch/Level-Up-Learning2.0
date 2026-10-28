"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { ArrowLeft, Lock, Play, X } from "lucide-react";
import { ChronorokWorldScene, CHRONOROK_BOUNDS, CHRONOROK_PORTALS, CHRONOROK_ROAM, CHRONOROK_SPAWN } from "@/components/world3d/ChronorokWorldScene";
import { EMPTY_WORLD_LOOK_INPUT, EMPTY_WORLD_MOVE_INPUT, KeyboardWorldAction, SharedThirdPersonPlayer, WorldJoystick, WorldLookJoystick, type WorldLookInput, type WorldMoveInput } from "@/components/world3d/SharedWorldPlayer";
import { WorldInteractionPrompt } from "@/components/world3d/WorldInteractionPrompt";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { fetchStudentActivityDaily } from "@/lib/student-activity";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { CHRONOROK_OPEN_DAYS, SHARDS_TO_AWAKEN, chronorokForGrade, chronorokProgress, gradeName } from "@/lib/chronorok";

/** Chronorok hub: Sean's painted Chronorok art turned into a 3D depth surface
 *  (near plaza, far cliffs and spire) with mist, drifting time sparks and four
 *  glowing portals. Each portal opens its painted close-up scene. The games
 *  behind the portals are still being built. */


type PortalKey = "arena" | "rift" | "cave" | "rune";
const PORTAL_TARGETS = (Object.keys(CHRONOROK_PORTALS) as PortalKey[]).map((id) => ({ id, position: CHRONOROK_PORTALS[id].position, distance: 9 }));
const PORTALS: Record<PortalKey, { u: number; v: number; color: string; game: string; place: string; blurb: string; art: string; href?: string }> = {
  arena: { u: 0.17, v: 0.55, color: "#ffc94a", game: "Relic Rider", place: "The Arena Gate", blurb: "Stunt bikes through the castle tracks. Flip in the air to save time.", art: "/images/chronorok/arena-gate.webp" },
  rift: { u: 0.33, v: 0.4, color: "#7ff0ff", game: "Chrono Run", place: "The Rift Portal", blurb: "Run the time tunnels. Turn onto the walls and leap the gaps.", art: "/images/chronorok/rift-portal.webp", href: "/world/chronorok/chrono-run" },
  cave: { u: 0.69, v: 0.5, color: "#ff9a5a", game: "Time Slope", place: "The Ember Cave", blurb: "Race the time orb down the stream. It only gets faster.", art: "/images/chronorok/ember-cave.webp" },
  rune: { u: 0.82, v: 0.56, color: "#c79bff", game: "Rune Blocks", place: "The Rune Gate", blurb: "Roll the rune stone into the portal. Forty puzzles to beat.", art: "/images/chronorok/rune-gate.webp" },
};

export default function ChronorokHub({ teacherPreview = false }: { teacherPreview?: boolean }) {
  const router = useRouter();
  const demo = useDemoPreviewMode();
  const preview = teacherPreview || demo;
  const [progress, setProgress] = useState<{ learningDays: number; open: boolean; shards: number } | null>(null);
  const [yearLevel, setYearLevel] = useState<string | null>(null);
  const [portal, setPortal] = useState<PortalKey | null>(null);
  const [intro, setIntro] = useState(false);
  const [moveInput, setMoveInput] = useState<WorldMoveInput>(EMPTY_WORLD_MOVE_INPUT);
  const [lookInput, setLookInput] = useState<WorldLookInput>(EMPTY_WORLD_LOOK_INPUT);
  const [nearest, setNearest] = useState<string | null>(null);
  const nearPortal = nearest && nearest in CHRONOROK_PORTALS ? (nearest as PortalKey) : null;

  useEffect(() => {
    const profile = getActiveStudentProfile();
    queueMicrotask(() => setYearLevel(preview ? "Year 3" : profile?.yearLevel ?? null));
    if (preview) {
      queueMicrotask(() => setProgress({ learningDays: 63, open: true, shards: 63 }));
      return;
    }
    if (!profile?.studentId) { router.replace("/login"); return; }
    let cancelled = false;
    void fetchStudentActivityDaily(profile.studentId)
      .then((rows) => { if (!cancelled) setProgress(chronorokProgress(rows)); })
      .catch(() => { if (!cancelled) setProgress({ learningDays: 0, open: false, shards: 0 }); });
    return () => { cancelled = true; };
  }, [preview, router]);

  // The arrival video plays once per visit session.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("lul:chronorok:intro") !== "1") {
        sessionStorage.setItem("lul:chronorok:intro", "1");
        queueMicrotask(() => setIntro(true));
      }
    } catch { /* intro is optional */ }
  }, []);

  const back = () => router.push(preview ? "/world/tower?teacher_preview=1" : "/world/tower");
  const next = chronorokForGrade(yearLevel);
  const open = progress?.open ?? false;
  const active = portal ? PORTALS[portal] : null;

  return (
    <main
      className="chronorok fixed inset-0 overflow-hidden bg-[#2a1c30] font-sans text-white"
      style={{ touchAction: "none" }}
    >
      <Canvas shadows camera={{ position: [0, 6, 26], fov: 55, near: 0.1, far: 900 }} dpr={[1, 1.5]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }} style={{ filter: open ? undefined : "blur(6px) brightness(.7)" }}>
        <ChronorokWorldScene />
        <SharedThirdPersonPlayer
          initialPosition={CHRONOROK_SPAWN}
          moveInput={active || !open ? EMPTY_WORLD_MOVE_INPUT : moveInput}
          lookInput={active || !open ? EMPTY_WORLD_LOOK_INPUT : lookInput}
          bounds={CHRONOROK_BOUNDS}
          roamEllipse={CHRONOROK_ROAM}
          interactionTargets={PORTAL_TARGETS}
          onNearestTargetId={setNearest}
          initialYaw={0}
          initialPitch={-0.12}
          cameraDistance={10.5}
          cameraTargetHeight={2.6}
          movementEnabled={open && !active}
          speed={6}
        />
      </Canvas>

      <header className="pointer-events-none absolute inset-x-5 top-4 z-10 flex items-start justify-between gap-3">
        <div className="pointer-events-auto flex items-start gap-3">
          <button type="button" onClick={back} className="chronoGlass flex h-12 items-center gap-2 rounded-full px-5 font-display text-[13px] font-black tracking-[0.05em]"><ArrowLeft className="h-4 w-4" />THE TOWER</button>
          <div className="chronoGlass hidden rounded-2xl px-5 py-2.5 sm:block">
            <p className="chronoTitle">CHRONOROK</p>
            <p className="font-display text-[11px] font-black tracking-[0.32em] text-[#f6d79a]">PAST · PRESENT · FUTURE</p>
          </div>
        </div>
        {progress ? (
          <div className="chronoGlass pointer-events-auto w-[min(340px,60vw)] rounded-2xl px-4 py-3">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-[11px] font-black tracking-[0.14em] text-[#ffd9a0]">TIME SHARDS{yearLevel ? ` · ${gradeName(yearLevel).toUpperCase()}` : ""}</span>
              <span className="font-display text-2xl font-black text-[#ffd76a]">{progress.shards}<span className="text-sm text-[#f6e7c8]"> / {SHARDS_TO_AWAKEN}</span></span>
            </div>
            <div className="my-2 h-2.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-[#ffb347] to-[#ffe08a]" style={{ width: `${(progress.shards / SHARDS_TO_AWAKEN) * 100}%` }} /></div>
            <p className="text-[13px] font-bold">One shard for every day you learn. At {SHARDS_TO_AWAKEN}, <b className="text-[#ffd76a]">{next.name}</b> awakens.</p>
          </div>
        ) : null}
      </header>

      {progress && !open ? (
        <div className="absolute inset-0 z-20 grid place-items-center p-6">
          <div className="chronoGlass max-w-md rounded-3xl p-7 text-center">
            <Lock className="mx-auto h-9 w-9 text-[#ffd76a]" aria-hidden="true" />
            <h1 className="chronoTitle mt-3 text-3xl">Chronorok is sealed</h1>
            <p className="mt-2 font-bold text-[#f3ead9]">Learn on {CHRONOROK_OPEN_DAYS} different days to open it. A learning day is any day you finish a lesson or quiz.</p>
            <div className="mt-4 flex justify-center gap-2" aria-label={`${progress.learningDays} of ${CHRONOROK_OPEN_DAYS} learning days`}>
              {Array.from({ length: CHRONOROK_OPEN_DAYS }).map((_, index) => (
                <span key={index} className={`h-4 w-10 rounded-full ${index < progress.learningDays ? "bg-gradient-to-r from-[#ffb347] to-[#ffe08a]" : "bg-white/20"}`} />
              ))}
            </div>
            <p className="mt-2 text-sm font-bold text-[#ffd9a0]">{progress.learningDays} of {CHRONOROK_OPEN_DAYS} learning days</p>
            <button type="button" onClick={back} className="mt-5 h-12 rounded-full bg-white px-6 font-display text-sm font-black text-[#16121f]">BACK TO THE TOWER</button>
          </div>
        </div>
      ) : null}

      {open && !active ? (
        <>
          <WorldJoystick input={moveInput} onChange={setMoveInput} />
          <WorldLookJoystick onChange={setLookInput} />
          {nearPortal ? (
            <WorldInteractionPrompt location={PORTALS[nearPortal].place.toUpperCase()} status={PORTALS[nearPortal].game} actionLabel="ENTER" onAction={() => setPortal(nearPortal)} />
          ) : (
            <p className="chronoGlass pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full px-5 py-3 text-center text-sm font-bold">Follow a glowing road to a portal</p>
          )}
          <KeyboardWorldAction enabled={Boolean(nearPortal)} onAction={() => { if (nearPortal) setPortal(nearPortal); }} />
        </>
      ) : null}

      {active ? (
        <div className="chronoScene absolute inset-0 z-30" style={{ backgroundImage: `url(${active.art})` }} role="dialog" aria-label={`${active.game}, ${active.place}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/70" />
          <button type="button" onClick={() => setPortal(null)} className="chronoGlass absolute left-5 top-4 flex h-12 items-center gap-2 rounded-full px-5 font-display text-[13px] font-black tracking-[0.05em]"><ArrowLeft className="h-4 w-4" />BACK TO THE PLAZA</button>
          <div className="chronoGlass absolute bottom-8 left-1/2 w-[min(640px,92vw)] -translate-x-1/2 rounded-3xl px-6 py-5 text-center">
            <p className="font-display text-xs font-black tracking-[0.2em]" style={{ color: active.color }}>{active.place.toUpperCase()}</p>
            <h2 className="chronoTitle mt-1 text-4xl">{active.game}</h2>
            <p className="mt-1 font-bold text-[#f3ead9]">{active.blurb}</p>
            {active.href ? (
              <button type="button" onClick={() => router.push(preview ? `${active.href}?teacher_preview=1` : active.href!)} className="mt-4 inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 font-display text-[15px] font-black text-[#16121f]">
                <Play className="h-4 w-4" />ENTER
              </button>
            ) : (
              <button type="button" disabled className="mt-4 inline-flex h-14 items-center gap-2 rounded-full bg-white/90 px-8 font-display text-[15px] font-black text-[#16121f] opacity-80">
                <Play className="h-4 w-4" />COMING SOON
              </button>
            )}
          </div>
        </div>
      ) : null}

      {intro ? (
        <div className="absolute inset-0 z-40 bg-black">
          <video src="/videos/realms/chronorok.mp4" autoPlay muted playsInline onEnded={() => setIntro(false)} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-16 text-center">
            <p className="chronoTitle text-5xl sm:text-6xl">CHRONOROK</p>
            <p className="mt-1 font-display text-sm font-black tracking-[0.4em] text-[#fff4dc]">THE REALM OF TIME</p>
          </div>
          <button type="button" onClick={() => setIntro(false)} className="chronoGlass absolute right-5 top-4 flex h-11 items-center gap-1.5 rounded-full px-4 font-display text-xs font-black"><X className="h-4 w-4" />SKIP</button>
        </div>
      ) : null}

      <style>{`
        .chronorok .chronoGlass{background:rgba(22,14,8,.52);border:1px solid rgba(255,230,180,.28);box-shadow:0 10px 30px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(12px)}
        .chronorok .chronoTitle{font-family:var(--font-display);font-weight:900;letter-spacing:.12em;color:#ffe2a0;text-shadow:0 2px 14px rgba(245,180,50,.6)}
        .chronoTag{display:block;white-space:nowrap;text-align:center;padding:7px 13px;border-radius:14px;border:1px solid;background:rgba(22,14,8,.55);backdrop-filter:blur(10px);color:#fff;cursor:pointer;font-family:var(--font-sans)}
        .chronoTag b{display:block;font:900 15px var(--font-display)}.chronoTag small{display:block;font-weight:700;font-size:12px;color:#f3ead9}
        .chronoTag:hover{transform:scale(1.06)}
        .chronoScene{background-size:cover;background-position:center;animation:chronoZoom .6s ease-out}
        @keyframes chronoZoom{from{transform:scale(1.15);opacity:0}to{transform:scale(1);opacity:1}}
        @media (prefers-reduced-motion:reduce){.chronoScene{animation:none}}
      `}</style>
    </main>
  );
}
