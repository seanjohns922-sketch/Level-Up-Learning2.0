"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { RealmPortal3D } from "@/components/world3d/RealmPortal3D";
import {
  TOWER_CHAMBER_CONFIG,
  TOWER_REALM_PORTALS,
  type TowerWorldQuality,
} from "@/lib/world3d/tower-realm-chamber-config";

function KnowledgeCore({ reducedMotion }: { reducedMotion: boolean }) {
  const coreRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!coreRef.current || reducedMotion) return;
    coreRef.current.rotation.y += delta * 0.16;
  });
  return (
    <group position={[0, 0.3, -1]}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[4.8, 5.4, 0.7, 48]} />
        <meshStandardMaterial color="#2b211e" metalness={0.28} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.74, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.2, 0.12, 12, 64]} />
        <meshBasicMaterial color="#d8ab59" toneMapped={false} />
      </mesh>
      <group ref={coreRef} position={[0, 5.4, 0]}>
        {[0, Math.PI / 2, Math.PI / 4].map((rotation, index) => (
          <mesh key={rotation} rotation={[rotation === Math.PI / 2 ? Math.PI / 2 : 0, rotation, rotation === Math.PI / 4 ? Math.PI / 4 : 0]}>
            <torusGeometry args={[2.5 + index * 0.55, 0.11, 10, 64]} />
            <meshStandardMaterial color={index === 1 ? "#e6c57e" : "#9d7746"} emissive="#6b481c" emissiveIntensity={0.45} metalness={0.75} roughness={0.25} />
          </mesh>
        ))}
        <mesh>
          <icosahedronGeometry args={[1.15, 1]} />
          <meshStandardMaterial color="#fff0bd" emissive="#eab65b" emissiveIntensity={1.25} metalness={0.25} roughness={0.25} />
        </mesh>
      </group>
      <pointLight position={[0, 5.4, 0]} color="#ffd98b" intensity={18} distance={19} decay={2} />
    </group>
  );
}

function ChamberArchitecture({ quality }: { quality: TowerWorldQuality }) {
  const columns = quality === "low" ? 8 : quality === "medium" ? 12 : 16;
  return (
    <group>
      <mesh position={[0, -0.48, 0]} receiveShadow>
        <cylinderGeometry args={[30, 30, 0.9, 64]} />
        <meshStandardMaterial color="#342823" roughness={0.82} metalness={0.08} />
      </mesh>
      {[7.2, 13.5, 20.5, 24.4].map((radius, index) => (
        <mesh key={radius} position={[0, 0.02 + index * 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.1, radius + 0.1, 64]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#c89a51" : "#7f6547"} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ))}
      {TOWER_REALM_PORTALS.map((portal) => (
        <mesh key={portal.realmId} position={[portal.position[0] * 0.48, 0.04, portal.position[2] * 0.48]} rotation={[-Math.PI / 2, 0, portal.rotationY]}>
          <planeGeometry args={[5.5, 18]} />
          <meshBasicMaterial color="#b98748" transparent opacity={0.17} toneMapped={false} />
        </mesh>
      ))}
      {Array.from({ length: columns }, (_, index) => {
        const angle = (index / columns) * Math.PI * 2;
        const x = Math.sin(angle) * 28.5;
        const z = Math.cos(angle) * 28.5;
        return (
          <group key={index} position={[x, 0, z]} rotation={[0, angle, 0]}>
            <mesh position={[0, 7.5, 0]}>
              <cylinderGeometry args={[0.72, 1.05, 15, 10]} />
              <meshStandardMaterial color="#49372f" roughness={0.78} metalness={0.08} />
            </mesh>
            <mesh position={[0, 15.3, 0]}>
              <cylinderGeometry args={[1.15, 0.76, 0.8, 10]} />
              <meshStandardMaterial color="#8e6c43" metalness={0.45} roughness={0.45} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 9, 0]}>
        <cylinderGeometry args={[30.4, 30.4, 18, 64, 1, true]} />
        <meshStandardMaterial color="#3b2924" side={THREE.BackSide} roughness={0.9} />
      </mesh>
      <mesh position={[0, 18, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[30.4, 10, 64, 1, true]} />
        <meshStandardMaterial color="#241a19" side={THREE.BackSide} roughness={0.92} />
      </mesh>
      <RoundedBox args={[9, 10.5, 1.1]} radius={0.18} smoothness={2} position={[0, 5.25, 23.2]}>
        <meshStandardMaterial color="#3a2a25" roughness={0.78} />
      </RoundedBox>
      <mesh position={[0, 5, 22.55]}>
        <planeGeometry args={[6.6, 8]} />
        <meshBasicMaterial color="#d5a95c" transparent opacity={0.28} toneMapped={false} />
      </mesh>
      <Html center position={[0, 10.8, 22.5]} distanceFactor={14} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ width: 180, border: "1px solid rgba(255,225,167,.6)", borderRadius: 5, padding: "8px 12px", background: "rgba(35,25,21,.88)", color: "#fff1cf", textAlign: "center", fontWeight: 950, fontSize: 13, letterSpacing: "0.08em" }}>CENTRAL WORLD</div>
      </Html>
    </group>
  );
}

export function TowerRealmChamberEnvironment({
  quality,
  reducedMotion,
  activeInteractionId,
  progressByRealm,
  previewPattern = false,
}: {
  quality: TowerWorldQuality;
  reducedMotion: boolean;
  activeInteractionId: string | null;
  progressByRealm: Record<string, string>;
  previewPattern?: boolean;
}) {
  return (
    <>
      <ChamberArchitecture quality={quality} />
      <KnowledgeCore reducedMotion={reducedMotion} />
      <Suspense fallback={null}>
        {TOWER_REALM_PORTALS.map((portal) => {
          const nearby = portal.interactionId === activeInteractionId;
          return (
            <RealmPortal3D
              key={portal.realmId}
              config={portal}
              nearby={nearby}
              videoActive={nearby}
              quality={quality}
              reducedMotion={reducedMotion}
              progressSummary={progressByRealm[portal.realmId] ?? "BEGIN JOURNEY"}
              previewAvailable={previewPattern && portal.realmId === "pattern"}
            />
          );
        })}
      </Suspense>
      <spotLight position={[0, 20, 8]} target-position={[0, 0, -2]} color="#ffd79b" intensity={120} distance={45} angle={0.65} penumbra={0.8} />
      <pointLight position={TOWER_CHAMBER_CONFIG.exitPoint} color="#ffcf7b" intensity={8} distance={10} decay={2} />
    </>
  );
}
