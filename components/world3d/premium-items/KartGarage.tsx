"use client";
// The kart garage: try on any kart or part (the preview updates straight away), then buy it with XP
// or fit it. Realm karts unlock once the learner finishes a level in that realm.
import { Canvas, useFrame } from "@react-three/fiber";
import { Check, Lock, Wrench, X, Zap } from "lucide-react";
import { useRef, useState } from "react";
import type { Group } from "three";
import {
  KART_COLOURS, KART_PART_GROUP_NAMES, KART_PART_SLOTS, KART_PARTS, KART_PRICE, KART_REALM_NAMES, KART_REALMS, KART_SLOT,
  kartAvailability, kartItemKey, kartPartItemKey, type KartPart, type KartPartGroup, type KartParts, type KartStyle,
} from "@/lib/world3d/kart-garage";
import { RealmKart } from "./RealmKart";

const NEON = "#3fd0ff", PINK = "#ff4fd8", GOLD = "#ffd34d";
const GROUPS: KartPartGroup[] = ["spoiler", "wheels", "trail"];

export type KartGarageActions = {
  buy: (itemKey: string) => Promise<void>;
  equip: (itemKey: string) => Promise<void>;
  unequip: (slot: string) => Promise<void>;
};

function Turntable({ style, parts }: { style: KartStyle; parts: KartParts }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.5; });
  return <group ref={ref} scale={1.9} position={[0, -0.5, 0]}><RealmKart realm={style} parts={parts} driver /></group>;
}

function partsWith(parts: KartParts, group: KartPartGroup, part: KartPart | null): KartParts {
  const next = { ...parts };
  delete next[group];
  return part ? { ...next, ...part.parts } : next;
}

export function KartGarage({ style, parts, owned, finishedRealms, xp, busy, message, actions, onClose }: {
  style: KartStyle;
  parts: KartParts;
  owned: ReadonlySet<string>;
  finishedRealms: ReadonlySet<string> | null;
  xp: number | null;
  busy: boolean;
  message: string | null;
  actions: KartGarageActions;
  onClose: () => void;
}) {
  // What the learner is trying on; starts as what they drive.
  const [trial, setTrial] = useState<{ style: KartStyle; parts: KartParts }>({ style, parts });
  const fittedPart = (group: KartPartGroup) => KART_PARTS.find((p) => p.group === group && Object.entries(p.parts).every(([k, v]) => parts[k as keyof KartParts] === v)) ?? null;

  const kartCard = (kart: KartStyle) => {
    const colours = KART_COLOURS[kart];
    const status = kart === "starter" ? (style === "starter" ? "driving" : "owned") : kartAvailability(kart, style, owned, finishedRealms ?? new Set());
    const action = status === "owned" ? (kart === "starter" ? () => actions.unequip(KART_SLOT) : () => actions.equip(kartItemKey(kart)))
      : status === "buy" && kart !== "starter" ? () => actions.buy(kartItemKey(kart)) : null;
    const label = status === "driving" ? "Driving" : status === "owned" ? "Drive" : status === "buy" ? `${KART_PRICE} XP` : finishedRealms === null ? "Checking…" : `Finish a level in ${KART_REALM_NAMES[kart as keyof typeof KART_REALM_NAMES]}`;
    const trying = trial.style === kart;
    return (
      <div key={kart} data-kart={kart} style={{ display: "grid", gap: 6, padding: 8, borderRadius: 12, background: trying ? "rgba(63,208,255,.16)" : "rgba(255,255,255,.05)", border: `2px solid ${trying ? NEON : "rgba(255,255,255,.12)"}` }}>
        <button type="button" onClick={() => setTrial({ ...trial, style: kart })} aria-label={`Try the ${colours.name}`} style={{ all: "unset", cursor: "pointer", display: "grid", gap: 6 }}>
          <span aria-hidden="true" style={{ height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${colours.body} 0 55%, ${colours.trim} 55% 80%, ${colours.accent} 80%)` }} />
          <span style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.15 }}>{colours.name}</span>
        </button>
        <button type="button" disabled={!action || busy} onClick={action ? () => { setTrial({ ...trial, style: kart }); void action(); } : undefined} style={statusButton(status)}>
          {status === "locked" ? <Lock size={13} aria-hidden="true" /> : status === "driving" ? <Check size={13} aria-hidden="true" /> : status === "buy" ? <Zap size={13} aria-hidden="true" /> : null}{label}
        </button>
      </div>
    );
  };

  const partRow = (group: KartPartGroup) => {
    const fitted = fittedPart(group);
    const option = (part: KartPart | null) => {
      const key = part ? kartPartItemKey(part) : null;
      const isFitted = fitted?.id === part?.id || (!fitted && !part);
      const isOwned = !key || owned.has(key);
      const action = isFitted ? null : !part ? () => actions.unequip(KART_PART_SLOTS[group]) : isOwned ? () => actions.equip(key!) : () => actions.buy(key!);
      const trying = (part ? Object.entries(part.parts).every(([k, v]) => trial.parts[k as keyof KartParts] === v) : trial.parts[group] === undefined);
      return (
        <div key={part?.id ?? "none"} style={{ display: "grid", gap: 6, padding: 8, borderRadius: 12, minWidth: 0, background: trying ? "rgba(255,79,216,.14)" : "rgba(255,255,255,.05)", border: `2px solid ${trying ? PINK : "rgba(255,255,255,.12)"}` }}>
          <button type="button" onClick={() => setTrial({ ...trial, parts: partsWith(trial.parts, group, part) })} aria-label={`Try ${part?.name ?? `no ${KART_PART_GROUP_NAMES[group].toLowerCase()}`}`} style={{ all: "unset", cursor: "pointer", fontSize: 13, fontWeight: 900 }}>{part?.name ?? "None"}</button>
          <button type="button" disabled={!action || busy} onClick={action ? () => { setTrial({ ...trial, parts: partsWith(trial.parts, group, part) }); void action(); } : undefined} style={statusButton(isFitted ? "driving" : isOwned ? "owned" : "buy")}>
            {isFitted ? <><Check size={13} aria-hidden="true" />Fitted</> : isOwned ? "Fit" : <><Zap size={13} aria-hidden="true" />{part!.price} XP</>}
          </button>
        </div>
      );
    };
    return (
      <section key={group} aria-label={KART_PART_GROUP_NAMES[group]} style={{ display: "grid", gap: 6 }}>
        <h3 style={{ margin: 0, fontSize: 12, letterSpacing: ".16em", color: NEON }}>{KART_PART_GROUP_NAMES[group].toUpperCase()}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))", gap: 8 }}>{[null, ...KART_PARTS.filter((p) => p.group === group)].map(option)}</div>
      </section>
    );
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Kart garage" data-kart-garage style={{ position: "absolute", inset: 0, zIndex: 60, display: "grid", placeItems: "center", background: "rgba(6,8,18,.72)", padding: 12 }}>
      <div style={{ width: "min(1040px, 100%)", maxHeight: "100%", overflow: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14, background: "rgba(14,16,30,.96)", border: `2px solid ${NEON}`, borderRadius: 18, color: "#fff", padding: 16, boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", gap: 10, minHeight: 300 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950, letterSpacing: ".08em", display: "flex", alignItems: "center", gap: 8 }}><Wrench size={22} color={NEON} aria-hidden="true" />KART GARAGE</h2>
            <span style={{ fontWeight: 900, color: GOLD, fontVariantNumeric: "tabular-nums" }}><Zap size={15} style={{ verticalAlign: -2 }} aria-hidden="true" /> {xp === null ? "--" : xp.toLocaleString()} XP</span>
          </div>
          <div style={{ borderRadius: 14, background: "radial-gradient(circle at 50% 70%, #2a2f55, #0b0d1a 70%)", minHeight: 240 }}>
            <Canvas camera={{ position: [0, 1.5, 4.4], fov: 38 }} dpr={[1, 1.5]}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[3, 5, 4]} intensity={1.6} />
              <pointLight position={[-3, 2, -2]} intensity={8} color={PINK} />
              <Turntable style={trial.style} parts={trial.parts} />
            </Canvas>
          </div>
          <p role="status" style={{ margin: 0, minHeight: 20, fontSize: 14, fontWeight: 800, color: message ? GOLD : "#b9c3ff" }}>{message ?? "Tap a kart or part to try it on."}</p>
        </div>
        <div style={{ display: "grid", gap: 12, alignContent: "start", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 12, letterSpacing: ".16em", color: NEON }}>KARTS</h3>
            <button type="button" onClick={onClose} aria-label="Close the garage and race" style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, padding: "0 14px", borderRadius: 12, border: `2px solid ${PINK}`, background: "transparent", color: "#fff", fontWeight: 900, cursor: "pointer" }}><X size={16} aria-hidden="true" />Done</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))", gap: 8 }}>{(["starter", ...KART_REALMS] as KartStyle[]).map(kartCard)}</div>
          {GROUPS.map(partRow)}
        </div>
      </div>
    </div>
  );
}

function statusButton(status: "driving" | "owned" | "buy" | "locked"): React.CSSProperties {
  const tone = { driving: { background: "#1f7a4d", color: "#fff" }, owned: { background: NEON, color: "#0b0d1a" }, buy: { background: GOLD, color: "#1b1300" }, locked: { background: "rgba(255,255,255,.08)", color: "#c9cde0" } }[status];
  return { ...tone, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, minHeight: 34, padding: "4px 8px", border: 0, borderRadius: 9, fontSize: 12, fontWeight: 900, lineHeight: 1.15, textAlign: "center", cursor: status === "owned" || status === "buy" ? "pointer" : "default" };
}
