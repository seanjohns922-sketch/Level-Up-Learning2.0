"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DEFAULT_OUTFIT } from "@/components/avatar/StudentAvatar";
import { useCanonicalAvatarAppearance } from "@/lib/avatar-appearance";

export type WorldMoveInput = { up: boolean; down: boolean; left: boolean; right: boolean; analogX?: number; analogY?: number; magnitude?: number };
export type WorldLookInput = { x: number; y: number; magnitude: number };
export type WorldMovementBounds = { minX: number; maxX: number; minZ: number; maxZ: number };
export type WorldRoamEllipse = { centerZ: number; radiusX: number; radiusZ: number };
export type WorldInteractionTarget = { id: string; position: [number, number, number]; distance: number };

export const EMPTY_WORLD_MOVE_INPUT: WorldMoveInput = { up: false, down: false, left: false, right: false, analogX: 0, analogY: 0, magnitude: 0 };
export const EMPTY_WORLD_LOOK_INPUT: WorldLookInput = { x: 0, y: 0, magnitude: 0 };

export function TrialStudentAvatar({ movingRef }: { movingRef: React.MutableRefObject<boolean> }) {
  const bodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const appearance = useCanonicalAvatarAppearance();
  const avatar = appearance ?? DEFAULT_OUTFIT;
  const skin = avatar.skin;
  const skinShade = avatar.skinShade;
  const hair = avatar.hair;
  const hairShade = avatar.hairShade;
  const top = avatar.shirt;
  const topTrim = avatar.shirtTrim;
  const pants = avatar.pants;
  const shoes = avatar.shoes;

  useFrame(({ clock }, delta) => {
    const phase = clock.elapsedTime * 8.5;
    const stride = movingRef.current ? Math.sin(phase) * 0.62 : 0;
    const smoothing = 1 - Math.exp(-delta * 14);
    if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, stride, smoothing);
    if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -stride, smoothing);
    if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -stride * 0.72, smoothing);
    if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, stride * 0.72, smoothing);
    if (bodyRef.current) {
      const targetY = movingRef.current ? Math.abs(Math.sin(phase * 2)) * 0.035 : 0;
      bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, targetY, smoothing);
    }
  });

  return (
    <group>
      <mesh position={[0, -0.73, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.56, 24]} />
        <meshBasicMaterial color="#02090c" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <group ref={bodyRef}>
        {[-1, 1].map((side) => (
          <group key={`leg-${side}`} ref={side === -1 ? leftLegRef : rightLegRef} position={[side * 0.18, 0.02, 0]}>
            <mesh position={[0, -0.32, 0]}><boxGeometry args={[0.27, 0.62, 0.3]} /><meshStandardMaterial color={pants} roughness={0.74} /></mesh>
            <mesh position={[0, -0.66, 0.08]}><boxGeometry args={[0.31, 0.18, 0.48]} /><meshStandardMaterial color={shoes} roughness={0.62} /></mesh>
          </group>
        ))}
        <mesh position={[0, 0.4, 0]}><boxGeometry args={[0.78, 0.82, 0.4]} /><meshStandardMaterial color={top} roughness={0.66} /></mesh>
        <mesh position={[0, 0.43, -0.215]}><boxGeometry args={[0.5, 0.52, 0.08]} /><meshStandardMaterial color={topTrim} roughness={0.64} /></mesh>
        <mesh position={[0, 0.52, 0.215]}><boxGeometry args={[0.12, 0.54, 0.045]} /><meshStandardMaterial color={topTrim} emissive={topTrim} emissiveIntensity={0.16} /></mesh>
        {[-1, 1].map((side) => (
          <group key={`arm-${side}`} ref={side === -1 ? leftArmRef : rightArmRef} position={[side * 0.52, 0.75, 0]}>
            <mesh position={[0, -0.38, 0]}><boxGeometry args={[0.23, 0.76, 0.28]} /><meshStandardMaterial color={top} roughness={0.68} /></mesh>
            <mesh position={[0, -0.85, 0]}><boxGeometry args={[0.24, 0.2, 0.29]} /><meshStandardMaterial color={skin} roughness={0.78} /></mesh>
          </group>
        ))}
        <mesh position={[0, 1.1, 0]}><boxGeometry args={[0.58, 0.58, 0.54]} /><meshStandardMaterial color={skin} roughness={0.8} /></mesh>
        <mesh position={[0, 1.36, -0.02]}><boxGeometry args={[0.62, 0.16, 0.58]} /><meshStandardMaterial color={hair} roughness={0.86} /></mesh>
        <mesh position={[0, 1.22, -0.28]}><boxGeometry args={[0.62, 0.3, 0.1]} /><meshStandardMaterial color={hairShade} roughness={0.86} /></mesh>
        <mesh position={[-0.18, 1.34, 0.24]} rotation={[0, 0, -0.22]}><boxGeometry args={[0.18, 0.18, 0.12]} /><meshStandardMaterial color={hair} roughness={0.86} /></mesh>
        <mesh position={[0.08, 1.38, 0.24]} rotation={[0, 0, 0.16]}><boxGeometry args={[0.24, 0.17, 0.12]} /><meshStandardMaterial color={hair} roughness={0.86} /></mesh>
        {[-0.14, 0.14].map((x) => <mesh key={x} position={[x, 1.15, 0.276]}><boxGeometry args={[0.055, 0.075, 0.025]} /><meshBasicMaterial color="#17212b" /></mesh>)}
        <mesh position={[0, 1.01, 0.279]}><boxGeometry args={[0.18, 0.035, 0.025]} /><meshBasicMaterial color={skinShade} /></mesh>
      </group>
    </group>
  );
}

export function SharedThirdPersonPlayer({
  initialPosition,
  spawnTarget,
  spawnNonce,
  moveInput,
  lookInput = EMPTY_WORLD_LOOK_INPUT,
  bounds,
  roamEllipse,
  interactionTargets = [],
  onNearestTargetId,
  initialYaw = 0,
  initialPitch = -0.08,
  cameraDistance = 9.5,
  cameraTargetHeight = 1.55,
  cameraLookAhead = 0,
  cameraMinY = 0.85,
  cameraEnabled = true,
  speed = 4.6,
}: {
  initialPosition: [number, number, number];
  spawnTarget?: [number, number, number] | null;
  spawnNonce?: number;
  moveInput: WorldMoveInput;
  lookInput?: WorldLookInput;
  bounds: WorldMovementBounds;
  roamEllipse?: WorldRoamEllipse;
  interactionTargets?: WorldInteractionTarget[];
  onNearestTargetId?: (id: string | null) => void;
  initialYaw?: number;
  initialPitch?: number;
  cameraDistance?: number;
  cameraTargetHeight?: number;
  cameraLookAhead?: number;
  cameraMinY?: number;
  cameraEnabled?: boolean;
  speed?: number;
}) {
  const keys = useRef(new Set<string>());
  const playerRef = useRef<THREE.Group | null>(null);
  const movingRef = useRef(false);
  const nearestIdRef = useRef<string | null>(null);
  const yaw = useRef(initialYaw);
  const pitch = useRef(initialPitch);
  const { camera, gl } = useThree();

  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.current.add(event.key.toLowerCase());
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const element = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const start = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const look = (event: PointerEvent) => {
      if (!dragging) return;
      yaw.current -= (event.clientX - lastX) * 0.005;
      pitch.current = THREE.MathUtils.clamp(pitch.current - (event.clientY - lastY) * 0.005, -1.05, 1.2);
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const end = () => { dragging = false; };
    element.addEventListener("pointerdown", start);
    window.addEventListener("pointermove", look);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      element.removeEventListener("pointerdown", start);
      window.removeEventListener("pointermove", look);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [gl]);

  useEffect(() => {
    if (!spawnTarget || !playerRef.current) return;
    playerRef.current.position.set(...spawnTarget);
    yaw.current = initialYaw;
    pitch.current = initialPitch;
  }, [initialPitch, initialYaw, spawnNonce, spawnTarget]);

  useFrame((_, delta) => {
    const player = playerRef.current;
    if (!player) return;
    const lookIntensity = THREE.MathUtils.clamp(lookInput.magnitude, 0, 1);
    const lookDirectionLength = Math.hypot(lookInput.x, lookInput.y);
    const lookX = lookDirectionLength > 0 ? lookInput.x / lookDirectionLength : 0;
    const lookY = lookDirectionLength > 0 ? lookInput.y / lookDirectionLength : 0;
    yaw.current -= lookX * lookIntensity * 2.1 * delta;
    pitch.current = THREE.MathUtils.clamp(pitch.current + lookY * lookIntensity * 1.65 * delta, -1.05, 1.2);
    const sinYaw = Math.sin(yaw.current);
    const cosYaw = Math.cos(yaw.current);
    const forward = new THREE.Vector3(-sinYaw, 0, -cosYaw);
    const right = new THREE.Vector3(cosYaw, 0, -sinYaw);
    const movement = new THREE.Vector3();
    if (keys.current.has("w") || keys.current.has("arrowup") || moveInput.up) movement.add(forward);
    if (keys.current.has("s") || keys.current.has("arrowdown") || moveInput.down) movement.sub(forward);
    if (keys.current.has("d") || keys.current.has("arrowright") || moveInput.right) movement.add(right);
    if (keys.current.has("a") || keys.current.has("arrowleft") || moveInput.left) movement.sub(right);
    const analogX = THREE.MathUtils.clamp(moveInput.analogX ?? 0, -1, 1);
    const analogY = THREE.MathUtils.clamp(moveInput.analogY ?? 0, -1, 1);
    movement.addScaledVector(forward, analogY);
    movement.addScaledVector(right, analogX);
    movingRef.current = movement.lengthSq() > 0;
    if (movement.lengthSq() > 0) {
      const keyboardActive = keys.current.has("w") || keys.current.has("arrowup") || keys.current.has("s") || keys.current.has("arrowdown") || keys.current.has("d") || keys.current.has("arrowright") || keys.current.has("a") || keys.current.has("arrowleft") || moveInput.up || moveInput.down || moveInput.left || moveInput.right;
      const intensity = keyboardActive ? 1 : THREE.MathUtils.clamp(moveInput.magnitude ?? Math.hypot(analogX, analogY), 0, 1);
      movement.normalize();
      player.rotation.y = Math.atan2(movement.x, movement.z);
      movement.multiplyScalar(speed * intensity * delta);
      player.position.add(movement);
    }
    player.position.x = THREE.MathUtils.clamp(player.position.x, bounds.minX, bounds.maxX);
    player.position.z = THREE.MathUtils.clamp(player.position.z, bounds.minZ, bounds.maxZ);
    if (roamEllipse) {
      const normalizedX = player.position.x / roamEllipse.radiusX;
      const normalizedZ = (player.position.z - roamEllipse.centerZ) / roamEllipse.radiusZ;
      const distance = Math.hypot(normalizedX, normalizedZ);
      if (distance > 1) {
        player.position.x = (normalizedX / distance) * roamEllipse.radiusX;
        player.position.z = roamEllipse.centerZ + (normalizedZ / distance) * roamEllipse.radiusZ;
      }
    }

    if (cameraEnabled) {
      const cosPitch = Math.cos(pitch.current);
      const lookDirection = new THREE.Vector3(-sinYaw * cosPitch, Math.sin(pitch.current), -cosYaw * cosPitch);
      const head = new THREE.Vector3(player.position.x, player.position.y + 1.55, player.position.z);
      const desiredCamera = head.clone().addScaledVector(lookDirection, -cameraDistance);
      desiredCamera.y = Math.max(desiredCamera.y, cameraMinY);
      camera.position.lerp(desiredCamera, 1 - Math.pow(0.0001, delta));
      camera.lookAt(
        player.position.x + forward.x * cameraLookAhead,
        player.position.y + cameraTargetHeight,
        player.position.z + forward.z * cameraLookAhead,
      );
    }

    let nearestId: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const target of interactionTargets) {
      const distance = player.position.distanceTo(new THREE.Vector3(target.position[0], player.position.y, target.position[2]));
      if (distance <= target.distance && distance < nearestDistance) {
        nearestId = target.id;
        nearestDistance = distance;
      }
    }
    if (nearestId !== nearestIdRef.current) {
      nearestIdRef.current = nearestId;
      onNearestTargetId?.(nearestId);
    }
  });

  return <group ref={playerRef} position={initialPosition} rotation={[0, Math.PI, 0]}><TrialStudentAvatar movingRef={movingRef} /></group>;
}

export function WorldMovePad({ input, onChange }: { input: WorldMoveInput; onChange: (input: WorldMoveInput) => void }) {
  const button = (label: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    const key = label.toLowerCase() as "up" | "down" | "left" | "right";
    const display = label === "UP" ? "^" : label === "DOWN" ? "v" : label === "LEFT" ? "<" : ">";
    return (
      <button
        type="button"
        aria-label={`Move ${key}`}
        onPointerDown={() => onChange({ ...input, [key]: true })}
        onPointerUp={() => onChange({ ...input, [key]: false })}
        onPointerCancel={() => onChange({ ...input, [key]: false })}
        onPointerLeave={() => onChange({ ...input, [key]: false })}
        style={{ width: 44, height: 44, border: "1px solid rgba(255,255,255,0.24)", borderRadius: 7, background: input[key] ? "#f8fafc" : "rgba(15,23,42,0.88)", color: input[key] ? "#0f172a" : "#f8fafc", fontSize: 18, fontWeight: 900, cursor: "pointer", touchAction: "none" }}
      >{display}</button>
    );
  };
  return <div style={{ position: "absolute", left: 16, bottom: 18, display: "grid", gridTemplateColumns: "44px 44px 44px", gap: 7, pointerEvents: "auto" }}><span />{button("UP")}<span />{button("LEFT")}{button("DOWN")}{button("RIGHT")}</div>;
}

function WorldAnalogJoystick({ side, label, dataAttribute, onChange }: { side: "left" | "right"; label: string; dataAttribute: "move" | "look"; onChange: (input: { x: number; y: number; magnitude: number }) => void }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  const [knob, setKnob] = useState({ x: 0, y: 0, active: false });
  const maxTravel = 37;
  const deadZone = 0.12;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const stop = () => {
      pointerIdRef.current = null;
      setKnob({ x: 0, y: 0, active: false });
      onChangeRef.current({ x: 0, y: 0, magnitude: 0 });
    };
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
      onChangeRef.current({ x: 0, y: 0, magnitude: 0 });
    };
  }, []);

  function update(clientX: number, clientY: number) {
    const base = baseRef.current;
    if (!base) return;
    const bounds = base.getBoundingClientRect();
    const rawX = clientX - (bounds.left + bounds.width / 2);
    const rawY = clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(rawX, rawY);
    const scale = distance > maxTravel ? maxTravel / distance : 1;
    const x = rawX * scale;
    const y = rawY * scale;
    const normalizedX = x / maxTravel;
    const normalizedY = -y / maxTravel;
    const rawMagnitude = Math.min(1, distance / maxTravel);
    const magnitude = rawMagnitude <= deadZone ? 0 : (rawMagnitude - deadZone) / (1 - deadZone);
    setKnob({ x, y, active: true });
    onChangeRef.current({ x: magnitude ? normalizedX : 0, y: magnitude ? normalizedY : 0, magnitude });
  }

  function release(event?: React.PointerEvent<HTMLDivElement>) {
    if (event && pointerIdRef.current !== event.pointerId) return;
    if (event && baseRef.current?.hasPointerCapture(event.pointerId)) baseRef.current.releasePointerCapture(event.pointerId);
    pointerIdRef.current = null;
    setKnob({ x: 0, y: 0, active: false });
    onChangeRef.current({ x: 0, y: 0, magnitude: 0 });
  }

  return (
    <div
      ref={baseRef}
      role="application"
      aria-label={label}
      title={label}
      data-world-joystick={dataAttribute}
      data-active={knob.active ? "true" : "false"}
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        if (pointerIdRef.current !== null) return;
        event.preventDefault();
        event.stopPropagation();
        pointerIdRef.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (pointerIdRef.current !== event.pointerId) return;
        event.preventDefault();
        event.stopPropagation();
        update(event.clientX, event.clientY);
      }}
      onPointerUp={(event) => { event.preventDefault(); event.stopPropagation(); release(event); }}
      onPointerCancel={(event) => { event.preventDefault(); event.stopPropagation(); release(event); }}
      onLostPointerCapture={() => {
        if (pointerIdRef.current !== null) release();
      }}
      style={{ position: "absolute", [side]: side === "left" ? "max(24px, calc(env(safe-area-inset-left) + 18px))" : "max(24px, calc(env(safe-area-inset-right) + 18px))", bottom: "max(24px, calc(env(safe-area-inset-bottom) + 18px))", zIndex: 32, width: 124, height: 124, border: "2px solid rgba(255,244,220,.52)", borderRadius: "50%", background: "radial-gradient(circle, rgba(32,44,39,.7) 0 34%, rgba(15,23,42,.9) 35% 100%)", boxShadow: "0 10px 30px rgba(0,0,0,.32), inset 0 0 0 8px rgba(255,255,255,.04)", touchAction: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none", pointerEvents: "auto" }}
    >
      <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: 50, height: 50, border: "2px solid rgba(255,255,255,.72)", borderRadius: "50%", background: knob.active ? "#f4c95d" : "#f8fafc", boxShadow: "0 6px 16px rgba(0,0,0,.35)", transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`, transition: knob.active ? "none" : "transform 120ms ease-out, background 120ms ease-out" }} />
    </div>
  );
}

export function WorldJoystick({ onChange }: { onChange: (input: WorldMoveInput) => void }) {
  return <WorldAnalogJoystick side="left" label="Movement joystick. Drag in any direction to move." dataAttribute="move" onChange={({ x, y, magnitude }) => onChange({ ...EMPTY_WORLD_MOVE_INPUT, analogX: x, analogY: y, magnitude })} />;
}

export function WorldLookJoystick({ onChange }: { onChange: (input: WorldLookInput) => void }) {
  return <WorldAnalogJoystick side="right" label="Camera joystick. Drag to look around." dataAttribute="look" onChange={onChange} />;
}

export function KeyboardWorldAction({ enabled, onAction }: { enabled: boolean; onAction: () => void }) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter" && enabled) onAction();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onAction]);
  return null;
}
