"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  User, BookOpen, LayoutGrid, BarChart3, Zap,
} from "lucide-react";
import { readProgress } from "@/data/progress";
import {
  readProgramStore,
  getRecommendedAssignedWeek,
  getWeekProgress,
  isWeekComplete,
} from "@/lib/program-progress";

// ─── District zones ─────────────────────────────────────────────────────────────
// Each district is a REAL structure in the city, placed at varied vertical
// positions to break the flat-menu feel. `depth` ∈ [0..1] — 0 = far/distant
// (small + cool), 1 = foreground (large + saturated). `anchor` is where the
// holographic label tethers to the structure ("top" | "side").
const DISTRICT_ZONES = [
  { id: "counting", name: "COUNTING DISTRICT", sub: "WEEKS 1–3",   weekStart: 1,  weekEnd: 3,  left: "11%", top: "68%", color: "#14b8a6", depth: 0.95, anchor: "top",  panX: 14 },
  { id: "bridge",   name: "NUMBER BRIDGE",      sub: "WEEKS 4–6",   weekStart: 4,  weekEnd: 6,  left: "32%", top: "55%", color: "#22d3ee", depth: 0.75, anchor: "top",  panX: 6  },
  { id: "tower",    name: "LEGEND TOWER",       sub: "WEEK 12",     weekStart: 12, weekEnd: 12, left: "50%", top: "30%", color: "#fbbf24", depth: 1.00, anchor: "side", panX: 0  },
  { id: "core",     name: "CALCULATION CORE",   sub: "WEEKS 7–9",   weekStart: 7,  weekEnd: 9,  left: "70%", top: "60%", color: "#f472b6", depth: 0.85, anchor: "top",  panX: -8 },
  { id: "mastery",  name: "MASTERY SECTOR",     sub: "WEEKS 10–12", weekStart: 10, weekEnd: 11, left: "86%", top: "22%", color: "#a78bfa", depth: 0.55, anchor: "side", panX: -14},
] as const;

// ─── World canvas (particles + vehicles + tower pulse) ──────────────────────────
function useWorldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLS = ["#14b8a6", "#818cf8", "#f472b6", "#a78bfa", "#22d3ee"];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    // Floating data particles
    const particles = Array.from({ length: 130 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.8 + Math.random() * 2.2,
      vy: -(0.18 + Math.random() * 0.55) / 1080,
      vx: ((Math.random() - 0.5) * 0.15) / 1920,
      color: COLS[i % COLS.length],
      opacity: 0.2 + Math.random() * 0.5,
    }));

    // Flying vehicles — 2 altitude lanes, both directions
    const vehicles = Array.from({ length: 9 }, (_, i) => ({
      x: Math.random(),
      yFrac: 0.36 + (i % 2) * 0.06 + Math.random() * 0.04,
      w: 5 + Math.random() * 8,
      speed: ((0.5 + Math.random() * 1.4) * (i % 2 === 0 ? 1 : -1)) / 1920,
      color: COLS[i % 3],
    }));

    let pulse = 0;
    let fid: number;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Particles
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02)  p.x = -0.02;
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Vehicles + trails
      for (const v of vehicles) {
        v.x += v.speed;
        if (v.x > 1.12) v.x = -0.12;
        if (v.x < -0.12) v.x = 1.12;

        const vx = v.x * W, vy = v.yFrac * H;
        const trailLen = Math.abs(v.speed) * W * 14;
        const dir = v.speed > 0 ? -1 : 1;

        const g = ctx.createLinearGradient(vx + dir * trailLen, vy, vx, vy);
        g.addColorStop(0, v.color + "00");
        g.addColorStop(1, v.color + "88");
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = g;
        ctx.fillRect(vx + dir * trailLen, vy - 1, trailLen, 2);

        ctx.globalAlpha = 0.9;
        ctx.fillStyle = v.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = v.color;
        ctx.fillRect(vx, vy - 1.5, v.w, 3);
        ctx.shadowBlur = 0;
      }

      // Tower pulse — rings expanding from tower
      const tx = W * 0.5, ty = H * 0.36;
      pulse += 0.45;
      for (let i = 0; i < 4; i++) {
        const ph = (pulse + i * 28) % 112;
        const r  = ph * 1.4;
        const a  = Math.max(0, 0.28 - ph / 392);
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(tx, ty, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#14b8a6";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Faint vertical data-stream lines near tower
      for (let i = 0; i < 5; i++) {
        const lx = tx + (i - 2) * 18;
        const phase = (pulse * 1.2 + i * 22) % 200;
        const ly = ty - 60 + phase;
        const la = Math.max(0, 0.18 - Math.abs(phase - 100) / 1400);
        ctx.globalAlpha = la;
        ctx.strokeStyle = "#14b8a6";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx, ly + 40);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      fid = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(fid); window.removeEventListener("resize", resize); };
  }, []);

  return ref;
}

// ─── District structures ───────────────────────────────────────────────────────
// One bespoke shape per district id. Renders as an SVG so the structure feels
// like part of the city, then a small floating holo-label tethers to it.
function DistrictStructure({
  zone, state, active, onClick,
}: {
  zone: (typeof DISTRICT_ZONES)[number];
  state: "complete" | "current" | "locked";
  active: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const interactive = state !== "locked";

  // Visual tone per state
  const tone =
    state === "locked"   ? { fill: "#081828", stroke: "#1e4060", glow: "rgba(0,0,0,0)",        labelTxt: "🔒 LOCKED",  labelCol: "rgba(100,140,180,0.5)" }
  : state === "complete" ? { fill: "#0a3c36", stroke: "#14b8a6", glow: "rgba(20,184,166,0.6)", labelTxt: "✓ COMPLETE", labelCol: "#5eead4" }
                         : { fill: zone.color, stroke: "#ffffff", glow: `${zone.color}cc`,      labelTxt: "▶ ENTER",    labelCol: "#ffffff" };

  // Depth-aware scale; active district gets a bump
  const baseScale = 0.7 + zone.depth * 0.55; // 0.7..1.25
  const scale = (active ? baseScale * 1.08 : hovered && interactive ? baseScale * 1.04 : baseScale);

  // Distance dimming: locked = dim silhouette; unlocked scales with depth
  const distOpacity = state === "locked" ? 0.38 + zone.depth * 0.18 : 0.6 + zone.depth * 0.38;

  return (
    <div
      onClick={interactive ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
        transform: `scale(${scale})`,
        transformOrigin: "center bottom",
        transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1), filter 0.3s",
        filter: `drop-shadow(0 18px 30px rgba(0,0,0,0.55)) drop-shadow(0 0 ${active ? 22 : 10}px ${tone.glow})`,
        opacity: distOpacity,
        pointerEvents: "auto",
      }}
    >
      {/* The structure itself */}
      <Structure id={zone.id} tone={tone} active={active} />

      {/* Ground anchor glow — ties structure to the world */}
      <div style={{
        position: "absolute",
        bottom: -8,
        left: "50%",
        transform: "translateX(-50%)",
        width: "85%",
        height: 18,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${tone.stroke}55 0%, transparent 70%)`,
        filter: "blur(5px)",
        pointerEvents: "none",
      }} />

      {/* Tethered holo-label */}
      <HoloLabel
        zone={zone}
        tone={tone}
        active={active}
        state={state}
      />
    </div>
  );
}

function Structure({
  id, tone, active,
}: {
  id: typeof DISTRICT_ZONES[number]["id"];
  tone: { fill: string; stroke: string; glow: string };
  active: boolean;
}) {
  const f = tone.fill, s = tone.stroke;

  if (id === "counting") {
    // Data-terminal tower: glowing number readout panels + antenna beacon
    return (
      <svg width="132" height="198" viewBox="0 0 132 198" style={{ display: "block" }}>
        <defs>
          <linearGradient id="ct" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={f} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#021418" stopOpacity="0.96" />
          </linearGradient>
        </defs>
        {/* Main body */}
        <rect x="18" y="42" width="96" height="138" rx="7" fill="url(#ct)" stroke={s} strokeOpacity="0.7" strokeWidth="1.5" />
        {/* Side wing panels */}
        <rect x="6"  y="70" width="14" height="80" rx="3" fill="#031018" stroke={s} strokeOpacity="0.45" />
        <rect x="112" y="70" width="14" height="80" rx="3" fill="#031018" stroke={s} strokeOpacity="0.45" />
        {/* Readout panels — animated digits */}
        {[0,1,2,3,4].map(i => (
          <g key={i}>
            <rect x="28" y={58 + i*22} width="76" height="14" rx="3" fill={s} opacity={active ? 0.45 : 0.22}>
              <animate attributeName="opacity" values={`${0.2};${0.65};${0.2}`} dur={`${1.5 + i*0.28}s`} repeatCount="indefinite" />
            </rect>
            {/* Digit dots */}
            {Array.from({length:6}).map((_,d)=>(
              <circle key={d} cx={36 + d*12} cy={65 + i*22} r="2.5" fill="#fff" opacity="0.35">
                <animate attributeName="opacity" values={`0.15;${0.6 + d*0.05};0.15`} dur={`${0.9 + d*0.15 + i*0.1}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        ))}
        {/* Base plinth */}
        <rect x="8" y="180" width="116" height="14" rx="3" fill="#021018" stroke={s} strokeOpacity="0.45" />
        {/* Antenna rod */}
        <rect x="63" y="10" width="6" height="34" fill={s} opacity="0.85" />
        {/* Beacon */}
        <circle cx="66" cy="8" r="5" fill={s}>
          <animate attributeName="r" values="3.5;6;3.5" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  if (id === "bridge") {
    // Suspension bridge spanning between two skyscrapers
    return (
      <svg width="220" height="130" viewBox="0 0 220 130" style={{ display: "block" }}>
        {/* Two skyscraper pylons */}
        <rect x="6"   y="20" width="28" height="100" rx="3" fill="#03161e" stroke={s} strokeOpacity="0.5" />
        <rect x="186" y="20" width="28" height="100" rx="3" fill="#03161e" stroke={s} strokeOpacity="0.5" />
        {/* Pylon tops */}
        <rect x="14"  y="8" width="12" height="14" fill={s} opacity="0.6" />
        <rect x="194" y="8" width="12" height="14" fill={s} opacity="0.6" />
        {/* Suspension cables (curved) */}
        <path d="M20 22 Q110 88 200 22" stroke={s} strokeWidth="1.5" fill="none" opacity="0.85" />
        <path d="M20 28 Q110 96 200 28" stroke={s} strokeWidth="1"   fill="none" opacity="0.5" />
        {/* Vertical cable hangers */}
        {Array.from({length:9}).map((_,i)=>{
          const x = 30 + i*20;
          const cy = 22 + Math.sin(((x-20)/180)*Math.PI)*66;
          return <line key={i} x1={x} y1={cy} x2={x} y2={84} stroke={s} strokeOpacity="0.4" strokeWidth="0.8" />;
        })}
        {/* Deck */}
        <rect x="20" y="82" width="180" height="8" rx="2" fill={f} stroke={s} strokeOpacity="0.7" />
        {/* Glowing road centerline */}
        <line x1="24" y1="86" x2="196" y2="86" stroke={s} strokeWidth="1.5" strokeDasharray="6 5" opacity={active?0.9:0.5}>
          <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1.2s" repeatCount="indefinite" />
        </line>
      </svg>
    );
  }

  if (id === "tower") {
    // Legend Tower — massive dominant spire, centrepiece of the city
    return (
      <svg width="170" height="340" viewBox="0 0 170 340" style={{ display: "block" }}>
        <defs>
          <linearGradient id="tw" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={f} stopOpacity="0.98" />
            <stop offset="40%" stopColor="#8a6010" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#02141a" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id="twb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={f} stopOpacity="0.3" />
            <stop offset="100%" stopColor={f} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Light beam upward from spire */}
        <rect x="80" y="0" width="10" height="50" fill="url(#twb)" opacity="0.7">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.4s" repeatCount="indefinite" />
        </rect>
        {/* Spire needle */}
        <polygon points="85,4 96,46 74,46" fill={s} opacity="0.95">
          <animate attributeName="opacity" values="0.75;1;0.75" dur="2.2s" repeatCount="indefinite" />
        </polygon>
        {/* Rotating halo ring */}
        <ellipse cx="85" cy="48" rx="38" ry="7" fill="none" stroke={s} strokeWidth="1.5" strokeOpacity="0.75">
          <animate attributeName="rx" values="30;42;30" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3.2s" repeatCount="indefinite" />
        </ellipse>
        {/* Upper stepped body */}
        <polygon points="56,46 114,46 110,108 60,108" fill="url(#tw)" stroke={s} strokeOpacity="0.75" />
        {/* Mid stepped body */}
        <polygon points="44,108 126,108 122,196 48,196" fill="url(#tw)" stroke={s} strokeOpacity="0.65" />
        {/* Lower stepped body */}
        <polygon points="30,196 140,196 136,288 34,288" fill="url(#tw)" stroke={s} strokeOpacity="0.55" />
        {/* Window grid — three columns */}
        {Array.from({length:7}).map((_,row)=>(
          Array.from({length:4}).map((__,col)=>{
            const x = 58 + col*14, y = 120 + row*22;
            return <rect key={`${row}-${col}`} x={x} y={y} width="8" height="10" fill={s} opacity={active ? 0.55 + (row%2)*0.3 : 0.2 + (row%2)*0.15}>
              {active && <animate attributeName="opacity" values={`${0.3+(col%3)*0.2};${0.7+(col%3)*0.25};${0.3+(col%3)*0.2}`} dur={`${1.4+row*0.18}s`} repeatCount="indefinite" />}
            </rect>;
          })
        ))}
        {/* Corner buttresses */}
        <rect x="28" y="160" width="10" height="128" fill={s} opacity="0.25" />
        <rect x="132" y="160" width="10" height="128" fill={s} opacity="0.25" />
        {/* Base platform */}
        <rect x="16" y="288" width="138" height="40" rx="4" fill="#02141a" stroke={s} strokeOpacity="0.55" />
        {/* Base glow ring */}
        <ellipse cx="85" cy="286" rx="58" ry="8" fill="none" stroke={s} strokeOpacity={active ? 0.7 : 0.3}>
          <animate attributeName="rx" values="52;64;52" dur="4s" repeatCount="indefinite" />
        </ellipse>
      </svg>
    );
  }

  if (id === "core") {
    // Calculation Reactor — energy orb with triple rotating rings + pipes
    return (
      <svg width="172" height="196" viewBox="0 0 172 196" style={{ display: "block" }}>
        {/* Support tower */}
        <rect x="80" y="108" width="12" height="52" fill="#031a20" stroke={s} strokeOpacity="0.5" />
        {/* Plinth */}
        <rect x="20" y="158" width="132" height="32" rx="5" fill="#031620" stroke={s} strokeOpacity="0.55" />
        {/* Side connector pipes */}
        <rect x="2"   y="86" width="26" height="12" rx="3" fill="#031620" stroke={s} strokeOpacity="0.5" />
        <rect x="144" y="86" width="26" height="12" rx="3" fill="#031620" stroke={s} strokeOpacity="0.5" />
        {/* Energy conduit lines */}
        <line x1="28" y1="92" x2="54" y2="88" stroke={s} strokeOpacity="0.55" strokeWidth="1.5" />
        <line x1="144" y1="92" x2="118" y2="88" stroke={s} strokeOpacity="0.55" strokeWidth="1.5" />
        {/* Core orb outer glow */}
        <circle cx="86" cy="80" r="36" fill={f} opacity="0.18" />
        {/* Core orb */}
        <circle cx="86" cy="80" r="28" fill={f} opacity="0.88" />
        <circle cx="86" cy="80" r="28" fill="none" stroke={s} strokeWidth="2" strokeOpacity="0.85" />
        {/* Inner bright core */}
        <circle cx="86" cy="80" r="14" fill="#fff" opacity={active ? 0.9 : 0.5}>
          <animate attributeName="opacity" values="0.45;0.95;0.45" dur="1.7s" repeatCount="indefinite" />
        </circle>
        <circle cx="86" cy="80" r="6" fill="#fff" opacity="0.95" />
        {/* Rotating rings — 3 axes */}
        <g style={{ transformOrigin: "86px 80px", animation: "core-spin 5s linear infinite" }}>
          <ellipse cx="86" cy="80" rx="48" ry="14" fill="none" stroke={s} strokeWidth="1.8" strokeOpacity="0.9" />
        </g>
        <g style={{ transformOrigin: "86px 80px", animation: "core-spin 7s linear infinite reverse" }}>
          <ellipse cx="86" cy="80" rx="40" ry="24" fill="none" stroke={s} strokeWidth="1.2" strokeOpacity="0.6" />
        </g>
        <g style={{ transformOrigin: "86px 80px", animation: "core-spin 9s linear infinite" }}>
          <ellipse cx="86" cy="80" rx="32" ry="32" fill="none" stroke={s} strokeWidth="0.8" strokeOpacity="0.35" strokeDasharray="4 4" />
        </g>
      </svg>
    );
  }

  // mastery — floating elite platform high in skyline
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" style={{ display: "block" }}>
      {/* Floating disc */}
      <ellipse cx="60" cy="72" rx="50" ry="14" fill={f} opacity="0.9" stroke={s} strokeOpacity="0.7" />
      <ellipse cx="60" cy="68" rx="50" ry="14" fill="#02141a" stroke={s} strokeOpacity="0.4" />
      {/* Platform pillar */}
      <rect x="56" y="40" width="8" height="32" fill={s} opacity="0.65" />
      {/* Diamond crown */}
      <polygon points="60,14 78,38 60,46 42,38" fill={f} stroke={s} strokeOpacity="0.85" opacity="0.95">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite" />
      </polygon>
      {/* Anti-grav rings under disc */}
      <ellipse cx="60" cy="92" rx="40" ry="6" fill="none" stroke={s} strokeOpacity="0.45">
        <animate attributeName="rx" values="34;46;34" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.1;0.55;0.1" dur="2.6s" repeatCount="indefinite" />
      </ellipse>
    </svg>
  );
}

function HoloLabel({
  zone, tone, active, state,
}: {
  zone: (typeof DISTRICT_ZONES)[number];
  tone: { fill: string; stroke: string; glow: string; labelTxt: string; labelCol: string };
  active: boolean;
  state: "complete" | "current" | "locked";
}) {
  // Anchor offset — top or side of structure
  const top = zone.anchor === "side" ? "10%" : "-32px";
  const left = zone.anchor === "side" ? "calc(100% + 14px)" : "50%";
  const translate = zone.anchor === "side" ? "translate(0,-50%)" : "translate(-50%,-100%)";

  return (
    <div
      style={{
        position: "absolute",
        top, left,
        transform: translate,
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      {/* Tether line */}
      <div
        style={{
          position: "absolute",
          ...(zone.anchor === "side"
            ? { left: -14, top: "50%", width: 14, height: 1 }
            : { left: "50%", bottom: -8, width: 1, height: 8, transform: "translateX(-50%)" }),
          background: tone.stroke,
          opacity: 0.6,
        }}
      />
      {/* Glowing dot at tether origin */}
      <div
        style={{
          position: "absolute",
          ...(zone.anchor === "side"
            ? { left: -18, top: "50%", transform: "translateY(-50%)" }
            : { left: "50%", bottom: -12, transform: "translateX(-50%)" }),
          width: 6, height: 6, borderRadius: "50%",
          background: tone.stroke,
          boxShadow: `0 0 10px ${tone.stroke}`,
          animation: state !== "locked" ? "holo-dot 1.6s ease-in-out infinite" : "none",
        }}
      />
      {/* The label itself — bare, no card chrome */}
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
          padding: "2px 0",
        }}
      >
        <span style={{
          color: tone.labelCol,
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: "0.2em",
          fontFamily: "ui-monospace, monospace",
          textShadow: state !== "locked"
            ? `0 0 18px ${tone.stroke}, 0 0 6px ${tone.stroke}88, 0 2px 8px rgba(0,0,0,0.95)`
            : "0 1px 5px rgba(0,0,0,0.8)",
        }}>
          {zone.name}
        </span>
        <span style={{
          color: tone.stroke,
          fontSize: 9,
          opacity: state === "locked" ? 0.4 : 0.88,
          letterSpacing: "0.18em",
          fontFamily: "ui-monospace, monospace",
          textShadow: "0 1px 4px rgba(0,0,0,0.9)",
        }}>
          {zone.sub}  ·  {tone.labelTxt}
        </span>
        {active && state !== "locked" && (
          <span
            style={{
              marginTop: 2,
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.24em",
              fontFamily: "ui-monospace, monospace",
              color: tone.stroke,
              padding: "1px 6px",
              border: `1px solid ${tone.stroke}`,
              borderRadius: 3,
              animation: "holo-scan 2.4s linear infinite",
            }}
          >
            TAP TO ENTER
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Player character (SVG silhouette with breathing animation) ─────────────────
function PlayerCharacter({ gender }: { gender: "boy" | "girl" }) {
  const teal = "#14b8a6";
  const jacket = "#0d2644";
  const pants = "#090f1c";
  const pack = "#082540";
  const skin = "#b87652";
  const hair = gender === "girl" ? "#3a1e06" : "#110b03";

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        animation: "char-float 4.5s ease-in-out infinite",
        filter: "drop-shadow(0 0 14px rgba(20,184,166,0.28)) drop-shadow(0 8px 18px rgba(0,0,0,0.7))",
      }}
    >
      <svg width="96" height="196" viewBox="0 0 96 196" fill="none">
        {/* Shoes */}
        <rect x="23" y="172" width="20" height="10" rx="3" fill="#060912" />
        <rect x="53" y="172" width="20" height="10" rx="3" fill="#060912" />
        {/* Legs */}
        <rect x="25" y="130" width="16" height="46" rx="4" fill={pants} />
        <rect x="55" y="130" width="16" height="46" rx="4" fill={pants} />
        {/* Body */}
        <rect x="16" y="74" width="64" height="60" rx="8" fill={jacket} />
        {/* Body neon trim */}
        <rect x="14" y="74" width="68" height="7" rx="5" fill={teal} opacity="0.7" />
        {/* Arms */}
        <rect x="2"  y="80" width="16" height="48" rx="5" fill={jacket} />
        <rect x="78" y="80" width="16" height="48" rx="5" fill={jacket} />
        {/* Arm trim */}
        <rect x="2"  y="80" width="16" height="5" rx="3" fill={teal} opacity="0.5" />
        <rect x="78" y="80" width="16" height="5" rx="3" fill={teal} opacity="0.5" />
        {/* Backpack */}
        <rect x="18" y="82" width="30" height="42" rx="5" fill={pack} />
        {/* Backpack strap top */}
        <rect x="22" y="88" width="22" height="3" rx="1.5" fill={teal} opacity="0.8" />
        {/* Backpack emblem */}
        <rect x="27" y="98" width="12" height="12" rx="2.5" fill={teal} opacity="0.55" />
        <rect x="30" y="101" width="6" height="6" rx="1" fill={teal} opacity="0.9" />
        {/* Neck */}
        <rect x="36" y="62" width="24" height="15" rx="5" fill={skin} />
        {/* Head */}
        <rect x="25" y="27" width="46" height="40" rx="10" fill={skin} />
        {/* Hair top */}
        <rect x="23" y="22" width="50" height="19" rx="9" fill={hair} />
        <rect x="23" y="30" width="50" height="9" fill={hair} />
        {/* Girl side hair */}
        {gender === "girl" && (
          <>
            <rect x="20" y="40" width="7" height="22" rx="4" fill={hair} />
            <rect x="69" y="40" width="7" height="22" rx="4" fill={hair} />
          </>
        )}
      </svg>

      {/* Backpack pack glow orb */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "22%",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${teal}66 0%, transparent 70%)`,
        filter: "blur(7px)",
        animation: "pack-pulse 2.8s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Ground glow */}
      <div style={{
        position: "absolute",
        bottom: -12,
        left: "50%",
        transform: "translateX(-50%)",
        width: 100,
        height: 24,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${teal}40 0%, transparent 70%)`,
        filter: "blur(6px)",
      }} />
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
export default function NumberNexusMap() {
  const router   = useRouter();
  const [progress] = useState(() => readProgress());
  const [store]    = useState(() => readProgramStore());
  const [bestChain, setBestChain] = useState(0);
  const [gender, setGender]       = useState<"boy" | "girl">("boy");
  const canvasRef = useWorldCanvas();

  useEffect(() => {
    try { setBestChain(Number(localStorage.getItem("lul_best_nexus_chain_v1") ?? 0)); } catch { /* ignore */ }
    try {
      const raw = localStorage.getItem("lul_active_student_v1");
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.gender === "girl" || p?.gender === "female") setGender("girl");
      }
    } catch { /* ignore */ }
  }, []);

  const year       = progress?.year ?? "Year 1";
  const isPrep     = year === "Prep";
  const levelNum   = isPrep ? 0 : parseInt(year.replace(/\D/g, ""), 10) || 1;
  const levelLabel = isPrep ? "PREP" : `LV ${levelNum}`;

  const currentWeek = getRecommendedAssignedWeek(store, year, progress?.assignedWeek, progress?.requiredWeeks);
  const [viewWeek, setViewWeek] = useState(currentWeek);

  const completedByWeek = useMemo(() => {
    const m: Record<number, boolean> = {};
    for (let w = 1; w <= 12; w++) m[w] = isWeekComplete(getWeekProgress(store, year, w));
    return m;
  }, [store, year]);

  const highestDone = useMemo(() =>
    Math.max(0, ...Object.entries(completedByWeek).filter(([, v]) => v).map(([k]) => Number(k))),
    [completedByWeek]);

  const totalXP = useMemo(() => {
    let xp = 0;
    for (let w = 1; w <= 12; w++) {
      const wp = getWeekProgress(store, year, w);
      xp += wp.lessonsCompleted.filter(Boolean).length * 40;
      if (wp.quizScore !== undefined) xp += Math.round((wp.quizScore / 100) * 60);
    }
    return xp;
  }, [store, year]);

  function zoneState(zone: (typeof DISTRICT_ZONES)[number]): "complete" | "current" | "locked" {
    const weeks = Array.from({ length: zone.weekEnd - zone.weekStart + 1 }, (_, i) => zone.weekStart + i);
    if (weeks.every((w) => completedByWeek[w])) return "complete";
    if (currentWeek >= zone.weekStart) return "current";
    return "locked";
  }

  function onDistrictTap(weekStart: number, weekEnd: number) {
    for (let w = weekStart; w <= weekEnd; w++) {
      if (!completedByWeek[w]) { router.push(`/program?year=${encodeURIComponent(year)}&week=${w}`); return; }
    }
    router.push(`/program?year=${encodeURIComponent(year)}&week=${weekEnd}`);
  }

  const canBack    = viewWeek > 1;
  const canForward = viewWeek < 12 && viewWeek <= currentWeek + 1;
  const currentZone = DISTRICT_ZONES.find((z) => viewWeek >= z.weekStart && viewWeek <= z.weekEnd);
  const activeZoneId = currentZone?.id ?? null;

  const chip = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "5px 12px", borderRadius: 999,
    background: "rgba(14,118,110,0.18)", border: "1px solid rgba(94,234,212,0.18)",
    ...extra,
  });
  const hudBtn: React.CSSProperties = {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    padding: "10px 10px", borderRadius: 12, cursor: "pointer",
    background: "rgba(2,8,20,0.88)", border: "1px solid rgba(94,234,212,0.18)",
    backdropFilter: "blur(12px)", minWidth: 52,
    boxShadow: "0 0 12px rgba(94,234,212,0.06), 0 4px 18px rgba(0,0,0,0.6)",
  };
  const navBtn = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "9px 20px", borderRadius: 999, cursor: active ? "pointer" : "default",
    background: active ? "rgba(14,118,110,0.26)" : "rgba(12,20,32,0.2)",
    border: `1px solid ${active ? "rgba(94,234,212,0.28)" : "rgba(94,234,212,0.07)"}`,
    color: active ? "#5eead4" : "rgba(94,234,212,0.22)",
    fontSize: 12, fontWeight: 700, transition: "all 0.2s",
  });

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#020810" }}>

      {/* ── Background image ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/number-nexus-home-bg.jpg"
        alt=""
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 40%",
          zIndex: 0,
        }}
      />

      {/* Atmospheric depth overlay — teal-tinted, not just dark */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(180deg, rgba(2,10,22,0.58) 0%, rgba(1,20,28,0.12) 38%, rgba(1,10,18,0.08) 55%, rgba(2,8,18,0.88) 100%)",
      }} />
      {/* Radial vignette — wider centre keep so city visible */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse 82% 72% at 50% 44%, transparent 38%, rgba(2,6,18,0.42) 100%)",
      }} />
      {/* Teal tint bias to shift toward concept-art palette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse 60% 55% at 50% 36%, rgba(14,184,166,0.08) 0%, transparent 70%)",
      }} />

      {/* Scanline texture */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
      }} />

      {/* Volumetric tower light beam (CSS) */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "0%",
        transform: "translateX(-50%)",
        width: 90,
        height: "52%",
        background: "linear-gradient(180deg, rgba(20,184,166,0.0) 0%, rgba(20,184,166,0.12) 60%, rgba(20,184,166,0.3) 100%)",
        filter: "blur(16px)",
        zIndex: 3,
        pointerEvents: "none",
        animation: "beam-pulse 3.5s ease-in-out infinite",
      }} />

      {/* Ground road reflection glow */}
      <div style={{
        position: "absolute",
        bottom: "12%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "38%",
        height: 120,
        background: "radial-gradient(ellipse at 50% 0%, rgba(20,184,166,0.22) 0%, transparent 75%)",
        filter: "blur(10px)",
        zIndex: 3,
        pointerEvents: "none",
      }} />

      {/* ── Canvas overlay — particles, vehicles, pulse ── */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}
      />

      {/* ── World layer (districts + character) — pans subtly on district change ── */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 10,
          transform: `translate3d(${(currentZone?.panX ?? 0)}px, 0, 0)`,
          transition: "transform 0.9s cubic-bezier(0.22,1,0.36,1)",
          pointerEvents: "none",
        }}
      >
        {/* Render far-depth districts first so closer ones overlap them */}
        {[...DISTRICT_ZONES]
          .sort((a, b) => a.depth - b.depth)
          .map((zone) => (
            <div
              key={zone.id}
              style={{
                position: "absolute",
                left: zone.left,
                top: zone.top,
                transform: "translate(-50%, -100%)",
                pointerEvents: "auto",
                zIndex: Math.round(zone.depth * 10),
              }}
            >
              <DistrictStructure
                zone={zone}
                state={zoneState(zone)}
                active={activeZoneId === zone.id}
                onClick={() => onDistrictTap(zone.weekStart, zone.weekEnd)}
              />
            </div>
          ))}

        {/* Character — drifts horizontally toward the active district */}
        <div style={{
          position: "absolute",
          bottom: "9%",
          left: `calc(50% + ${(currentZone ? (parseFloat(currentZone.left) - 50) * 0.35 : 0)}%)`,
          transform: "translateX(-50%)",
          zIndex: 12,
          transition: "left 0.9s cubic-bezier(0.22,1,0.36,1)",
          pointerEvents: "auto",
        }}>
          <PlayerCharacter gender={gender} />
        </div>
      </div>

      {/* ── Top bar ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        background: "rgba(2,6,16,0.72)", borderBottom: "1px solid rgba(94,234,212,0.1)",
        backdropFilter: "blur(16px)",
      }}>
        <button
          onClick={() => router.push(`/realms?level=${encodeURIComponent(year)}`)}
          style={{ display: "flex", alignItems: "center", gap: 6, ...chip(), cursor: "pointer", color: "rgba(167,243,208,0.9)", fontSize: 12, fontWeight: 700 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={chip()}>
          <span style={{ color: "#5eead4", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", fontFamily: "ui-monospace,monospace" }}>⚡ NUMBER NEXUS</span>
        </div>
        <div style={chip({ background: "rgba(94,234,212,0.07)", border: "1px solid rgba(94,234,212,0.14)" })}>
          <span style={{ color: "#2dd4bf", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace" }}>{levelLabel}</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5, ...chip() }}>
          <Zap size={11} color="#14b8a6" />
          <span style={{ color: "#99f6e4", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{totalXP} XP</span>
        </div>
        <div style={chip()}>
          <span style={{ color: "#99f6e4", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{highestDone}/12</span>
        </div>
        <button
          onClick={() => router.push("/profile")}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", background: "rgba(14,118,110,0.28)", border: "1px solid rgba(94,234,212,0.28)" }}
        >
          <User size={16} color="#5eead4" />
        </button>
      </div>

      {/* ── Right HUD ── */}
      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { Icon: BookOpen,   label: "LEGENDS", route: "/legends"     },
          { Icon: LayoutGrid, label: "LEVELS",  route: "/levels"      },
          { Icon: BarChart3,  label: "STATS",   route: "/realm-stats" },
        ].map(({ Icon, label, route }) => (
          <button key={label} onClick={() => router.push(route)} style={hudBtn}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "rgba(14,118,110,0.22)" }}>
              <Icon size={16} color="#14b8a6" />
            </div>
            <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(94,234,212,0.7)", fontFamily: "ui-monospace,monospace" }}>{label}</span>
          </button>
        ))}
        {bestChain > 0 && (
          <div style={{ ...hudBtn, cursor: "default" }}>
            <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(94,234,212,0.5)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.4 }}>{"BEST\nCHAIN"}</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#5eead4", lineHeight: 1 }}>{bestChain}</span>
            <span style={{ fontSize: 9, color: "#fbbf24" }}>⚡</span>
          </div>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px",
        background: "rgba(2,6,16,0.84)", borderTop: "1px solid rgba(94,234,212,0.1)",
        backdropFilter: "blur(16px)",
      }}>
        <button onClick={() => canBack && setViewWeek((v) => v - 1)} disabled={!canBack} style={navBtn(canBack)}>
          <ChevronLeft size={15} /> Prev
        </button>
        <div style={{ textAlign: "center" }}>
          {currentZone && (
            <>
              <div style={{ color: currentZone.color, fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace", textShadow: `0 0 14px ${currentZone.color}` }}>
                {currentZone.name.replace("\n", " ")}
              </div>
              <div style={{ color: "rgba(148,163,184,0.55)", fontSize: 9, letterSpacing: "0.14em", fontFamily: "ui-monospace,monospace", marginTop: 2 }}>
                WEEK {viewWeek} · {currentZone.sub}
              </div>
            </>
          )}
        </div>
        <button onClick={() => canForward && setViewWeek((v) => v + 1)} disabled={!canForward} style={navBtn(canForward)}>
          Next <ChevronRight size={15} />
        </button>
      </div>

      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes holo-scan {
          0%   { background-position: 0 -100px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { background-position: 0 300px; opacity: 0; }
        }
        @keyframes char-float {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-7px); }
        }
        @keyframes pack-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1);    }
          50%       { opacity: 0.9;  transform: scale(1.15); }
        }
        @keyframes beam-pulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1.0; }
        }
        @keyframes core-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes holo-dot {
          0%, 100% { transform: scale(1);   opacity: 0.85; }
          50%       { transform: scale(1.6); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
