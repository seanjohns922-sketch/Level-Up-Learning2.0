"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { WorldPanoramaRing, type WorldPanoramaRingProps } from "./WorldPanoramaRing";
import { MEASURELANDS_LEVEL_THEMES } from "@/lib/measurelands-visuals";
import { STARPATH_LEVEL_THEMES } from "@/lib/starpath-visuals";
import { NUMBER_NEXUS_LEVEL_THEMES, numberNexusPanoramaDetail } from "@/lib/number-nexus-visuals";
import { STATISTICA_LEVEL_THEMES } from "@/lib/statistica-visuals";
import { getPatternPeaks3DVisuals } from "./PatternPeaksEnvironment";
import { getChanceHollow3DVisuals } from "./ChanceHollowEnvironment";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

type Review = { label: string; panorama: WorldPanoramaRingProps };
const label = (realm: string, level: string) => `${realm} · ${level === "Prep" ? "Ground" : level.replace("Year", "Level")}`;
const reviews: Review[] = [
  ...Object.values(NUMBER_NEXUS_LEVEL_THEMES).map(t => ({ label: label("Number Nexus", t.level), panorama: { ...numberNexusPanoramaDetail(t.crispPanorama), asset: t.background, radius: 56, height: 70, y: 25, horizontalScale: .76, rotationY: t.panoramaRotationY, repeatX: 2, skyBlendColor: t.sky } })),
  ...Object.values(MEASURELANDS_LEVEL_THEMES).map(t => ({ label: label("Measurelands", t.level), panorama: { asset: t.background, sectionAssets: t.panoramaSections, sharpDetail: Boolean(t.panoramaSections), rearAsset: t.backBackground, radius: 56, height: t.panoramaHeight ?? 66, y: t.panoramaY ?? 10, horizontalScale: .78, flipX: true, skyBlendColor: t.sky } })),
  ...Object.values(STARPATH_LEVEL_THEMES).map(t => ({ label: label("Starpath", t.level), panorama: { asset: t.background, rearAsset: t.backBackground, radius: 52, height: t.panoramaHeight ?? 62, y: t.panoramaY ?? 24.7, horizontalScale: .86, rotationY: t.panoramaRotation, flipX: true, skyBlendColor: t.sky } })),
  ...Object.values(STATISTICA_LEVEL_THEMES).map(t => ({ label: label("Statistica", t.level), panorama: { asset: t.background, radius: 56, height: 60, y: 20, horizontalScale: .82, flipX: true, skyBlendColor: t.sky } })),
  ...(["Year 3", "Year 4", "Year 5", "Year 6"] as RealmLevelId[]).flatMap(level => {
    const pattern = getPatternPeaks3DVisuals(level), chance = getChanceHollow3DVisuals(level);
    return [
      { label: label("Pattern Peaks", level), panorama: { asset: pattern.background, radius: 56, height: 60, y: 20, horizontalScale: .82, flipX: true, skyBlendColor: pattern.sky } },
      { label: label("Chance Hollow", level), panorama: { asset: chance.front, rearAsset: chance.rear, radius: 56, height: 61, y: 20, horizontalScale: .82, flipX: true, skyBlendColor: chance.sky } },
    ];
  }),
];

function Aim({ angle, orbit, offCentre }: { angle: number; orbit: boolean; offCentre: boolean }) {
  useFrame(({ camera, clock }) => {
    const a = (angle + (orbit ? clock.elapsedTime * 8 : 0)) * Math.PI / 180;
    const x = offCentre ? 15 : 0, z = offCentre ? 18 : 0;
    camera.position.set(x, 5, z);
    camera.lookAt(x + Math.sin(a) * 100, 8, z + Math.cos(a) * 100);
  });
  return null;
}

export default function RealmPanoramaReview() {
  const [index, setIndex] = useState(0), [angle, setAngle] = useState(180);
  const [orbit, setOrbit] = useState(false), [offCentre, setOffCentre] = useState(false);
  const [compareOriginal, setCompareOriginal] = useState(false);
  const selected = reviews[index];
  const panorama = compareOriginal && selected.panorama.sectionAssets
    ? { ...selected.panorama, sectionAssets: undefined, sharpDetail: false }
    : selected.panorama;
  return <main style={{ height: "100dvh", background: selected.panorama.skyBlendColor }}>
    <div style={{ position: "absolute", zIndex: 2, inset: "12px 12px auto", padding: 12, background: "#172322ed", color: "#fff5df", borderRadius: 10, maxWidth: 680 }}>
      <strong>Realm backgrounds · 360° review</strong>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
        <select aria-label="Realm and level" value={index} onChange={e => { setIndex(Number(e.target.value)); setCompareOriginal(false); }} style={{ color: "#172322", background: "#fff5df", padding: "6px 10px", borderRadius: 6, maxWidth: "100%" }}>
          {reviews.map((review, i) => <option key={review.label} value={i}>{review.label}</option>)}
        </select>
        {selected.panorama.sectionAssets && <button onClick={() => setCompareOriginal(!compareOriginal)}>{compareOriginal ? "Show new detail" : "Compare old background"}</button>}
        <button onClick={() => setOrbit(!orbit)}>{orbit ? "Pause rotation" : "Rotate 360°"}</button>
        <button onClick={() => setOffCentre(!offCentre)}>{offCentre ? "View from centre" : "View from edge"}</button>
      </div>
      <label style={{ display: "flex", gap: 12, marginTop: 10 }}>Direction {angle}°
        <input aria-label="View direction" type="range" min="0" max="360" value={angle} onChange={e => { setOrbit(false); setAngle(Number(e.target.value)); }} style={{ flex: 1 }} />
      </label>
      <p style={{ fontSize: 12, margin: "8px 0 0" }}>Background only · check both side joins, the full wrap, and landmark clarity. Realm features retained.</p>
    </div>
    <Canvas camera={{ fov: 52, far: 300 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={[selected.panorama.skyBlendColor!]} />
      <Suspense fallback={null}><WorldPanoramaRing {...panorama} /></Suspense>
      <Aim angle={angle} orbit={orbit} offCentre={offCentre} />
    </Canvas>
  </main>;
}
