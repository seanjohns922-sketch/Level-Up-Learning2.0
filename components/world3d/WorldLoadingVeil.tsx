"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";
import { RELIQ_LETTERS_PATH, RELIQ_Q_PATH } from "@/lib/brand-reliq-logo-paths";

const STUDENT_VIOLET = "#C94DF2";
// Long enough for the first textures to arrive; never longer, so a slow asset can't trap a student.
const MIN_MS = 600;
const MAX_MS = 9000;

/** Covers a 3D world until its textures and models have loaded, so students never see it half-built. */
export function WorldLoadingVeil({ label = "Loading your world" }: { label?: string }) {
  const { active, progress } = useProgress();
  const [start] = useState(() => Date.now());
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (done) return;
    const elapsed = Date.now() - start;
    if (!active && progress >= 100 && elapsed >= MIN_MS) {
      const finish = window.setTimeout(() => setDone(true), 0);
      return () => window.clearTimeout(finish);
    }
    const wait = window.setTimeout(() => setDone(true), Math.max(0, (!active && progress >= 100 ? MIN_MS : MAX_MS) - elapsed));
    return () => window.clearTimeout(wait);
  }, [active, progress, done, start]);

  useEffect(() => {
    if (!done) return;
    const hide = window.setTimeout(() => setGone(true), 450);
    return () => window.clearTimeout(hide);
  }, [done]);

  if (gone) return null;
  const shown = Math.round(Math.min(100, Math.max(progress, 4)));
  return (
    <div className="worldLoadingVeil" data-done={done ? "true" : undefined} role="status" aria-live="polite" aria-label={done ? "World ready" : `${label}, ${shown} percent`}>
      <svg viewBox="0 0 279 79" className="worldLoadingLogo" aria-hidden="true"><path fill="#fff" d={RELIQ_LETTERS_PATH} /><path fill={STUDENT_VIOLET} d={RELIQ_Q_PATH} /></svg>
      <p>{label}</p>
      <div className="worldLoadingBar" aria-hidden="true"><i style={{ width: `${shown}%` }} /></div>
      <style>{`
        .worldLoadingVeil{position:fixed;inset:0;z-index:2147483000;display:grid;place-content:center;justify-items:center;gap:14px;background:radial-gradient(120% 90% at 50% 40%,#2a1d3d 0%,#141019 60%,#0b0910 100%);color:#efe7fb;font-weight:800;letter-spacing:.04em;transition:opacity .45s ease;pointer-events:auto}
        .worldLoadingVeil[data-done]{opacity:0;pointer-events:none}
        .worldLoadingLogo{width:min(200px,46vw);height:auto;filter:drop-shadow(0 6px 22px rgba(201,77,242,.35))}
        .worldLoadingVeil p{margin:0;font-size:15px;color:#cfc3e3}
        .worldLoadingBar{width:min(240px,60vw);height:6px;border-radius:9px;background:rgba(255,255,255,.12);overflow:hidden}
        .worldLoadingBar i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#8C2EAC,#D86BF7);transition:width .25s ease}
        @media (prefers-reduced-motion: reduce){.worldLoadingVeil,.worldLoadingBar i{transition:none}}
      `}</style>
    </div>
  );
}
