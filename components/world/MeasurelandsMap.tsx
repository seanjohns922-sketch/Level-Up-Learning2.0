"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, User, Zap } from "lucide-react";
import { readProgress } from "@/data/progress";
import { computeFogProgress } from "@/lib/fog-progress";
import FogOfForgetfulness from "@/components/world/FogOfForgetfulness";
import {
  getRecommendedAssignedWeek,
  getWeekProgress,
  isWeekComplete,
  readProgramStore,
} from "@/lib/program-progress";
import { readBestChain } from "@/lib/best-chain";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import LevelsDrawer from "@/components/realms/LevelsDrawer";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import StudentAvatar from "@/components/avatar/StudentAvatar";
import { supabase } from "@/lib/supabase";
import { fetchGlobalXp } from "@/lib/economy";
import RealmDashboardNav from "@/components/world/RealmDashboardNav";
import { setLastRealm } from "@/lib/last-realm";

type MeasurelandsYear = "Prep" | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6";
const REALM_ID = "measurement";
const PREP_BG_IMAGE = "/images/measurelands-home-bg.jpg";
const YEAR1_BG_IMAGE = "/images/measurelands-home-bg-y1.jpg";
const YEAR2_BG_IMAGE = "/images/measurelands-home-bg-y2.jpg";
const YEAR3_BG_IMAGE = "/images/measurelands-home-bg-y3.jpg";
const YEAR4_BG_IMAGE = "/images/measurelands-home-bg-y4.jpg";
const YEAR5_BG_IMAGE = "/images/measurelands-home-bg-y5.png";
const YEAR6_BG_IMAGE = "/images/measurelands-home-bg-y6.png";

const PREP_ZONES = [
  { id: "length", name: "LENGTH LANDS", sub: "WEEKS 1–2", weekStart: 1, weekEnd: 2, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "balance", name: "BALANCE BASIN", sub: "WEEKS 3–4", weekStart: 3, weekEnd: 4, left: "10%", top: "56%", color: "#86efac" },
  { id: "tower", name: "TIMEWIELDER TOWER", sub: "WEEK 8", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#fde68a" },
  { id: "capacity", name: "CAPACITY SPRINGS", sub: "WEEKS 5–6", weekStart: 5, weekEnd: 6, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "clockwork", name: "CLOCKWORK CROSSING", sub: "WEEK 7", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
] as const;

const YEAR1_ZONES = [
  { id: "length", name: "LENGTH TRAIL", sub: "WEEK 1", weekStart: 1, weekEnd: 1, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "balance", name: "BALANCE BASIN", sub: "WEEK 2", weekStart: 2, weekEnd: 2, left: "10%", top: "56%", color: "#86efac" },
  { id: "capacity", name: "CAPACITY SPRINGS", sub: "WEEK 3", weekStart: 3, weekEnd: 3, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "duration", name: "DURATION DUNES", sub: "WEEK 4", weekStart: 4, weekEnd: 4, left: "50%", top: "30%", color: "#fde68a" },
  { id: "calendar-grove", name: "CALENDAR GROVE", sub: "WEEK 5", weekStart: 5, weekEnd: 5, left: "50%", top: "30%", color: "#a7f3d0" },
  { id: "calendar-quest", name: "CALENDAR QUEST", sub: "WEEK 6", weekStart: 6, weekEnd: 6, left: "50%", top: "30%", color: "#fcd34d" },
  { id: "time-journey", name: "TIME JOURNEY", sub: "WEEK 7", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
  { id: "time-builder", name: "TIME BUILDER", sub: "WEEK 8", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#93c5fd" },
] as const;

const YEAR2_ZONES = [
  { id: "unit-count", name: "UNIT COUNT CANYON", sub: "WEEK 1", weekStart: 1, weekEnd: 1, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "balance", name: "BALANCE BASIN", sub: "WEEK 2", weekStart: 2, weekEnd: 2, left: "10%", top: "56%", color: "#86efac" },
  { id: "capacity", name: "CAPACITY SPRINGS", sub: "WEEK 3", weekStart: 3, weekEnd: 3, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "closer-count", name: "CLOSER COUNT", sub: "WEEK 4", weekStart: 4, weekEnd: 4, left: "50%", top: "30%", color: "#fde68a" },
  { id: "clock-one", name: "CLOCK TOWER I", sub: "WEEK 5", weekStart: 5, weekEnd: 5, left: "50%", top: "30%", color: "#a7f3d0" },
  { id: "clock-two", name: "CLOCK TOWER II", sub: "WEEK 6", weekStart: 6, weekEnd: 6, left: "50%", top: "30%", color: "#fcd34d" },
  { id: "calendar-keep", name: "CALENDAR KEEP", sub: "WEEK 7", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
  { id: "challenge", name: "MEASUREMENT CHALLENGE", sub: "WEEK 8", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#93c5fd" },
] as const;

const YEAR3_ZONES = [
  { id: "ruler-ridge", name: "RULER RIDGE", sub: "WEEK 1", weekStart: 1, weekEnd: 1, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "metre-mountain", name: "METRE MOUNTAIN", sub: "WEEK 2", weekStart: 2, weekEnd: 2, left: "10%", top: "56%", color: "#86efac" },
  { id: "mass-works", name: "MASS WORKS", sub: "WEEK 3", weekStart: 3, weekEnd: 3, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "capacity-lab", name: "CAPACITY LAB", sub: "WEEK 4", weekStart: 4, weekEnd: 4, left: "50%", top: "30%", color: "#fde68a" },
  { id: "duration-lab", name: "DURATION LAB", sub: "WEEK 5", weekStart: 5, weekEnd: 5, left: "50%", top: "30%", color: "#a7f3d0" },
  { id: "minute-clockworks", name: "MINUTE CLOCKWORKS", sub: "WEEK 6", weekStart: 6, weekEnd: 6, left: "50%", top: "30%", color: "#fcd34d" },
  { id: "perimeter-preview", name: "PERIMETER PREVIEW", sub: "WEEK 7", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
  { id: "area-preview", name: "AREA PREVIEW", sub: "WEEK 8", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#93c5fd" },
] as const;

const YEAR4_ZONES = [
  { id: "precision", name: "PRECISION MEASURING", sub: "WEEK 1", weekStart: 1, weekEnd: 1, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "scales-jugs", name: "SCALES & JUGS", sub: "WEEK 2", weekStart: 2, weekEnd: 2, left: "10%", top: "56%", color: "#86efac" },
  { id: "temperature", name: "TEMPERATURE", sub: "WEEK 3", weekStart: 3, weekEnd: 3, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "perimeter", name: "PERIMETER", sub: "WEEK 4", weekStart: 4, weekEnd: 4, left: "50%", top: "30%", color: "#fde68a" },
  { id: "area", name: "AREA", sub: "WEEK 5", weekStart: 5, weekEnd: 5, left: "50%", top: "30%", color: "#a7f3d0" },
  { id: "time-problems", name: "TIME PROBLEMS", sub: "WEEK 6", weekStart: 6, weekEnd: 6, left: "50%", top: "30%", color: "#fcd34d" },
  { id: "angles", name: "ANGLES", sub: "WEEK 7", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
  { id: "investigations", name: "MEASUREMENT INVESTIGATIONS", sub: "WEEK 8", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#93c5fd" },
] as const;

const YEAR5_ZONES = [
  { id: "level5-week1", name: "LEVEL 5 WEEK 1", sub: "COMING SOON", weekStart: 1, weekEnd: 1, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "level5-week2", name: "LEVEL 5 WEEK 2", sub: "COMING SOON", weekStart: 2, weekEnd: 2, left: "10%", top: "56%", color: "#86efac" },
  { id: "level5-week3", name: "LEVEL 5 WEEK 3", sub: "COMING SOON", weekStart: 3, weekEnd: 3, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "level5-week4", name: "LEVEL 5 WEEK 4", sub: "COMING SOON", weekStart: 4, weekEnd: 4, left: "50%", top: "30%", color: "#fde68a" },
  { id: "level5-week5", name: "LEVEL 5 WEEK 5", sub: "COMING SOON", weekStart: 5, weekEnd: 5, left: "50%", top: "30%", color: "#a7f3d0" },
  { id: "level5-week6", name: "LEVEL 5 WEEK 6", sub: "COMING SOON", weekStart: 6, weekEnd: 6, left: "50%", top: "30%", color: "#fcd34d" },
  { id: "level5-week7", name: "LEVEL 5 WEEK 7", sub: "COMING SOON", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
  { id: "level5-week8", name: "LEVEL 5 WEEK 8", sub: "COMING SOON", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#93c5fd" },
] as const;

const YEAR6_ZONES = [
  { id: "level6-week1", name: "LEVEL 6 WEEK 1", sub: "COMING SOON", weekStart: 1, weekEnd: 1, left: "7%", top: "14%", color: "#67e8f9" },
  { id: "level6-week2", name: "LEVEL 6 WEEK 2", sub: "COMING SOON", weekStart: 2, weekEnd: 2, left: "10%", top: "56%", color: "#86efac" },
  { id: "level6-week3", name: "LEVEL 6 WEEK 3", sub: "COMING SOON", weekStart: 3, weekEnd: 3, left: "70%", top: "15%", color: "#c4b5fd" },
  { id: "level6-week4", name: "LEVEL 6 WEEK 4", sub: "COMING SOON", weekStart: 4, weekEnd: 4, left: "50%", top: "30%", color: "#fde68a" },
  { id: "level6-week5", name: "LEVEL 6 WEEK 5", sub: "COMING SOON", weekStart: 5, weekEnd: 5, left: "50%", top: "30%", color: "#a7f3d0" },
  { id: "level6-week6", name: "LEVEL 6 WEEK 6", sub: "COMING SOON", weekStart: 6, weekEnd: 6, left: "50%", top: "30%", color: "#fcd34d" },
  { id: "level6-week7", name: "LEVEL 6 WEEK 7", sub: "COMING SOON", weekStart: 7, weekEnd: 7, left: "69%", top: "57%", color: "#f9a8d4" },
  { id: "level6-week8", name: "LEVEL 6 WEEK 8", sub: "COMING SOON", weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: "#93c5fd" },
] as const;

const YEAR3_DISTRICTS = [
  {
    id: "ruler-district",
    name: "RULER DISTRICT",
    sub: "WEEKS 1–2",
    weekStart: 1,
    weekEnd: 2,
    left: "4%",
    top: "14%",
    color: "#67e8f9",
    tagline: "length, metres, and measured paths",
  },
  {
    id: "measure-lab",
    name: "MEASURE LAB",
    sub: "WEEKS 3–4",
    weekStart: 3,
    weekEnd: 4,
    left: "5%",
    top: "58%",
    color: "#c4b5fd",
    tagline: "mass, capacity, and accuracy",
  },
  {
    id: "timeworks",
    name: "TIMEWORKS",
    sub: "WEEKS 5–6",
    weekStart: 5,
    weekEnd: 6,
    left: "68%",
    top: "14%",
    color: "#fde68a",
    tagline: "duration, minutes, and clockwork",
  },
  {
    id: "explorer-district",
    name: "EXPLORER DISTRICT",
    sub: "WEEKS 7–8",
    weekStart: 7,
    weekEnd: 8,
    left: "68%",
    top: "58%",
    color: "#f9a8d4",
    tagline: "perimeter and area previews",
  },
] as const;

const YEAR4_DISTRICTS = [
  {
    id: "precision-forge",
    name: "PRECISION FORGE",
    sub: "WEEKS 1–2",
    weekStart: 1,
    weekEnd: 2,
    left: "4%",
    top: "14%",
    color: "#67e8f9",
    tagline: "precision, scales, and measuring jugs",
  },
  {
    id: "boundary-lab",
    name: "BOUNDARY LAB",
    sub: "WEEKS 3–4",
    weekStart: 3,
    weekEnd: 4,
    left: "5%",
    top: "58%",
    color: "#c4b5fd",
    tagline: "temperature and perimeter",
  },
  {
    id: "space-timeworks",
    name: "SPACE TIMEWORKS",
    sub: "WEEKS 5–6",
    weekStart: 5,
    weekEnd: 6,
    left: "68%",
    top: "14%",
    color: "#fde68a",
    tagline: "area and time problems",
  },
  {
    id: "explorer-trials",
    name: "EXPLORER TRIALS",
    sub: "WEEKS 7–8",
    weekStart: 7,
    weekEnd: 8,
    left: "68%",
    top: "58%",
    color: "#f9a8d4",
    tagline: "angles and investigations",
  },
] as const;

const YEAR5_DISTRICTS = [
  {
    id: "calibration-works",
    name: "CALIBRATION WORKS",
    sub: "WEEKS 1–2",
    weekStart: 1,
    weekEnd: 2,
    left: "4%",
    top: "14%",
    color: "#67e8f9",
    tagline: "Level 5 measurement path coming soon",
  },
  {
    id: "measure-foundry",
    name: "MEASURE FOUNDRY",
    sub: "WEEKS 3–4",
    weekStart: 3,
    weekEnd: 4,
    left: "5%",
    top: "58%",
    color: "#c4b5fd",
    tagline: "Level 5 measurement path coming soon",
  },
  {
    id: "time-laboratory",
    name: "TIME LABORATORY",
    sub: "WEEKS 5–6",
    weekStart: 5,
    weekEnd: 6,
    left: "68%",
    top: "14%",
    color: "#fde68a",
    tagline: "Level 5 measurement path coming soon",
  },
  {
    id: "calibrator-trials",
    name: "CALIBRATOR TRIALS",
    sub: "WEEKS 7–8",
    weekStart: 7,
    weekEnd: 8,
    left: "68%",
    top: "58%",
    color: "#f9a8d4",
    tagline: "Level 5 measurement path coming soon",
  },
] as const;

const YEAR6_DISTRICTS = [
  {
    id: "timewielder-gate",
    name: "TIMEWIELDER GATE",
    sub: "WEEKS 1–2",
    weekStart: 1,
    weekEnd: 2,
    left: "4%",
    top: "14%",
    color: "#67e8f9",
    tagline: "Level 6 measurement path coming soon",
  },
  {
    id: "calibration-halls",
    name: "CALIBRATION HALLS",
    sub: "WEEKS 3–4",
    weekStart: 3,
    weekEnd: 4,
    left: "5%",
    top: "58%",
    color: "#c4b5fd",
    tagline: "Level 6 measurement path coming soon",
  },
  {
    id: "chronometer-spire",
    name: "CHRONOMETER SPIRE",
    sub: "WEEKS 5–6",
    weekStart: 5,
    weekEnd: 6,
    left: "68%",
    top: "14%",
    color: "#fde68a",
    tagline: "Level 6 measurement path coming soon",
  },
  {
    id: "mastery-observatory",
    name: "MASTERY OBSERVATORY",
    sub: "WEEKS 7–8",
    weekStart: 7,
    weekEnd: 8,
    left: "68%",
    top: "58%",
    color: "#f9a8d4",
    tagline: "Level 6 measurement path coming soon",
  },
] as const;

type MeasurelandsDistrict =
  | (typeof YEAR3_DISTRICTS)[number]
  | (typeof YEAR4_DISTRICTS)[number]
  | (typeof YEAR5_DISTRICTS)[number]
  | (typeof YEAR6_DISTRICTS)[number];
type DistrictState = "complete" | "current" | "locked";

function getMeasurelandsWorldConfig(year: MeasurelandsYear) {
  if (year === "Year 6") {
    return { bgImage: YEAR6_BG_IMAGE, levelLabel: "LEVEL 6", zones: YEAR6_ZONES };
  }
  if (year === "Year 5") {
    return { bgImage: YEAR5_BG_IMAGE, levelLabel: "LEVEL 5", zones: YEAR5_ZONES };
  }
  if (year === "Year 4") {
    return { bgImage: YEAR4_BG_IMAGE, levelLabel: "LEVEL 4", zones: YEAR4_ZONES };
  }
  if (year === "Year 3") {
    return { bgImage: YEAR3_BG_IMAGE, levelLabel: "LEVEL 3", zones: YEAR3_ZONES };
  }
  if (year === "Year 2") {
    return { bgImage: YEAR2_BG_IMAGE, levelLabel: "LEVEL 2", zones: YEAR2_ZONES };
  }
  if (year === "Year 1") {
    return { bgImage: YEAR1_BG_IMAGE, levelLabel: "LEVEL 1", zones: YEAR1_ZONES };
  }
  return { bgImage: PREP_BG_IMAGE, levelLabel: "GROUND LEVEL", zones: PREP_ZONES };
}

function useWorldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#67e8f9", "#fde68a", "#c4b5fd", "#86efac", "#f9a8d4"];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 70 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.8 + Math.random() * 2.4,
      vy: -(0.14 + Math.random() * 0.42) / 1080,
      vx: ((Math.random() - 0.5) * 0.1) / 1920,
      color: colors[i % colors.length],
      opacity: 0.18 + Math.random() * 0.46,
    }));

    let pulse = 0;
    let fid: number;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      const tx = W * 0.5;
      const ty = H * 0.31;
      pulse += 0.42;
      for (let i = 0; i < 4; i += 1) {
        const phase = (pulse + i * 24) % 108;
        const radius = phase * 1.55;
        const alpha = Math.max(0, 0.28 - phase / 380);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(tx, ty, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#fde68a";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      fid = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(fid);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return ref;
}

function PlayerCharacter() {
  return (
    <StudentAvatar
      height={188}
      glowColor="rgba(253,230,138,0.34)"
      floatAnimation="ml-char-float 4.6s ease-in-out infinite"
    />
  );
}

function MeasurelandsDistrictLabel({
  district,
  state,
  active,
  onClick,
}: {
  district: MeasurelandsDistrict;
  state: DistrictState;
  active: boolean;
  onClick: () => void;
}) {
  const locked = state === "locked";
  const complete = state === "complete";
  const accent = locked ? "rgba(254,243,199,0.42)" : district.color;

  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      style={{
        width: 380,
        maxWidth: "29vw",
        textAlign: "left",
        cursor: locked ? "default" : "pointer",
        opacity: locked ? 0.56 : 1,
        padding: "14px 16px 12px",
        borderRadius: 18,
        border: `1.5px solid ${active ? accent : "rgba(253,230,138,0.22)"}`,
        background: active
          ? "linear-gradient(135deg, rgba(62,32,4,0.82), rgba(83,39,8,0.62))"
          : "linear-gradient(135deg, rgba(19,9,2,0.68), rgba(36,16,3,0.42))",
        boxShadow: active
          ? `0 0 0 3px ${district.color}24, 0 0 28px ${district.color}44, 0 12px 28px rgba(0,0,0,0.46)`
          : "0 10px 22px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
        transition: "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: locked ? "rgba(254,243,199,0.36)" : district.color,
            boxShadow: locked ? "none" : `0 0 14px ${district.color}`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            color: "#fff7ed",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "0.22em",
            fontFamily: "ui-monospace, monospace",
            textShadow: locked ? "none" : `0 0 16px ${district.color}66, 0 2px 10px rgba(0,0,0,0.9)`,
            lineHeight: 1.05,
          }}
        >
          {district.name}
        </span>
        {locked ? <Lock size={18} color="rgba(254,243,199,0.72)" style={{ marginLeft: "auto" }} /> : null}
      </div>

      <div
        style={{
          color: accent,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.22em",
          fontFamily: "ui-monospace, monospace",
          marginTop: 8,
          textShadow: locked ? "none" : `0 0 12px ${district.color}55`,
        }}
      >
        {district.sub} {complete ? "· MASTERED" : locked ? "· LOCKED" : "· OPEN DISTRICT"}
      </div>

      <div
        style={{
          color: "rgba(254,243,199,0.78)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          fontFamily: "ui-monospace, monospace",
          marginTop: 8,
          textTransform: "uppercase",
        }}
      >
        {district.tagline}
      </div>
    </button>
  );
}

export default function MeasurelandsMap({ year = "Prep" }: { year?: MeasurelandsYear }) {
  const router = useRouter();
  useEffect(() => {
    setLastRealm("measurelands");
  }, []);
  const resolvedYear: MeasurelandsYear =
    year === "Year 1" ? "Year 1" : year === "Year 2" ? "Year 2" : year === "Year 3" ? "Year 3" : year === "Year 4" ? "Year 4" : year === "Year 5" ? "Year 5" : year === "Year 6" ? "Year 6" : "Prep";
  const world = useMemo(() => getMeasurelandsWorldConfig(resolvedYear), [resolvedYear]);
  const [progress] = useState(() => readProgress());
  const [store] = useState(() => readProgramStore());
  const [launching, setLaunching] = useState(false);
  const [bestChain] = useState(() => readBestChain("measurement", resolvedYear));
  const [classBestChain, setClassBestChain] = useState<number | null>(null);
  const [globalXpBalance, setGlobalXpBalance] = useState<number | null>(null);
  const canvasRef = useWorldCanvas();
  const fogProgress = useMemo(() => computeFogProgress(progress?.year, progress?.unlockedLegends), [progress?.year, progress?.unlockedLegends]);

  const totalWeeks = world.zones[world.zones.length - 1]?.weekEnd ?? 8;
  const currentWeek = getRecommendedAssignedWeek(store, resolvedYear, progress?.assignedWeek, progress?.requiredWeeks, REALM_ID);
  const currentZone =
    world.zones.find((zone) => currentWeek >= zone.weekStart && currentWeek <= zone.weekEnd) ?? world.zones[0];
  const completedByWeek = useMemo(() => {
    const result: Record<number, boolean> = {};
    for (let week = 1; week <= totalWeeks; week += 1) {
      result[week] = isWeekComplete(getWeekProgress(store, resolvedYear, week, REALM_ID));
    }
    return result;
  }, [resolvedYear, store, totalWeeks]);

  const highestDone = useMemo(
    () => Math.max(0, ...Object.entries(completedByWeek).filter(([, done]) => done).map(([week]) => Number(week))),
    [completedByWeek]
  );

  const demoRealmXP = useMemo(() => {
    let xp = 0;
    for (let week = 1; week <= totalWeeks; week += 1) {
      const wp = getWeekProgress(store, resolvedYear, week, REALM_ID);
      xp += wp.lessonsCompleted.filter(Boolean).length * 40;
      if (wp.quizScore !== undefined) xp += Math.round((wp.quizScore / 100) * 60);
    }
    return xp;
  }, [resolvedYear, store, totalWeeks]);

  useEffect(() => {
    const studentId = getActiveStudentProfile()?.studentId;
    if (!studentId || isDemoPreviewMode()) return;
    let cancelled = false;
    void fetchGlobalXp(studentId).then(({ balance }) => {
      if (!cancelled) setGlobalXpBalance(balance);
    }).catch((error) => console.warn("[Measurelands] Could not load global XP", error));
    return () => { cancelled = true; };
  }, []);

  const districts =
    resolvedYear === "Year 6"
      ? YEAR6_DISTRICTS
      : resolvedYear === "Year 5"
      ? YEAR5_DISTRICTS
      : resolvedYear === "Year 4"
        ? YEAR4_DISTRICTS
        : YEAR3_DISTRICTS;
  const isDistrictMode = resolvedYear === "Year 3" || resolvedYear === "Year 4" || resolvedYear === "Year 5" || resolvedYear === "Year 6";
  const currentDistrict =
    districts.find((district) => currentWeek >= district.weekStart && currentWeek <= district.weekEnd) ??
    districts[0];
  const activeDistrictId = isDistrictMode ? currentDistrict.id : null;
  const getDistrictState = (district: MeasurelandsDistrict): DistrictState => {
    const allWeeksDone = Array.from({ length: district.weekEnd - district.weekStart + 1 }, (_, index) => district.weekStart + index).every(
      (week) => completedByWeek[week]
    );
    if (allWeeksDone) return "complete";
    if (currentWeek >= district.weekStart) return "current";
    return "locked";
  };

  useEffect(() => {
    if (isDemoPreviewMode()) {
      setClassBestChain(null);
      return;
    }

    const profile = getActiveStudentProfile();
    const classId = profile?.classId?.trim();
    if (!classId) {
      setClassBestChain(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const readMaxBestChain = async (filterWorkingLevel: boolean) => {
          let query = supabase
            .from("student_lesson_attempts")
            .select("summary")
            .eq("class_id", classId)
            .eq("realm_id", "measurement");

          if (filterWorkingLevel) {
            query = query.eq("working_level", resolvedYear);
          }

          const { data, error } = await query;
          if (error) throw error;

          let max = 0;
          for (const row of data ?? []) {
            const summary =
              row.summary && typeof row.summary === "object" && !Array.isArray(row.summary)
                ? (row.summary as Record<string, unknown>)
                : null;
            const candidate = Number(summary?.bestChain ?? summary?.best_chain ?? 0);
            if (Number.isFinite(candidate) && candidate > max) {
              max = candidate;
            }
          }

          return max > 0 ? max : null;
        };

        const scopedBest = await readMaxBestChain(true);
        const fallbackBest = scopedBest ?? (await readMaxBestChain(false));
        if (!cancelled) setClassBestChain(fallbackBest);
      } catch (error) {
        if (!cancelled) {
          console.warn("[MeasurelandsMap] Failed to load class best chain:", error);
          setClassBestChain(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolvedYear]);

  function goToFirstIncompleteWeek(weekStart = 1, weekEnd = totalWeeks) {
    for (let week = weekStart; week <= weekEnd; week += 1) {
      if (!completedByWeek[week]) {
        router.push(`/program?year=${encodeURIComponent(resolvedYear)}&week=${week}&legacy=1&realm_id=${REALM_ID}`);
        return;
      }
    }
    router.push(`/program?year=${encodeURIComponent(resolvedYear)}&week=${Math.max(weekStart, Math.min(currentWeek, weekEnd))}&legacy=1&realm_id=${REALM_ID}`);
  }

  function openDistrict(district: MeasurelandsDistrict) {
    if (getDistrictState(district) === "locked") return;
    goToFirstIncompleteWeek(district.weekStart, district.weekEnd);
  }

  function launchGuidedAdventure() {
    if (launching) return;
    setLaunching(true);
    window.setTimeout(() => {
      if (isDistrictMode) {
        openDistrict(currentDistrict);
        return;
      }
      goToFirstIncompleteWeek();
    }, 900);
  }

  const chip = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "5px 12px",
    borderRadius: 999,
    background: "rgba(30,15,0,0.6)",
    border: "1px solid rgba(251,191,36,0.22)",
    ...extra,
  });

  const hudBtn: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "12px 10px 10px",
    borderRadius: 18,
    cursor: "pointer",
    background: "linear-gradient(180deg, rgba(28,14,2,0.92) 0%, rgba(15,6,0,0.95) 100%)",
    border: "1.5px solid rgba(251,191,36,0.28)",
    backdropFilter: "blur(14px)",
    width: 72,
    boxShadow: "0 0 18px rgba(251,191,36,0.12), 0 6px 22px rgba(0,0,0,0.64), inset 0 1px 0 rgba(255,255,255,0.05)",
    transition: "transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease",
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#1a0d00" }}>
      <FogOfForgetfulness
        progress={fogProgress}
        accent="#c8a030"
        glow="rgba(200,160,48,0.6)"
        badgeClassName={isDistrictMode ? "bottom-6 left-4" : undefined}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={world.bgImage}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 42%",
          transform: launching ? "scale(1.35)" : "scale(1)",
          transition: "transform 0.9s cubic-bezier(0.5, 0, 0.75, 0)",
          filter: "brightness(1.05) saturate(1.1)",
        }}
      />

      {/* Warm atmospheric overlays */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,8,0,0.52) 0%, rgba(15,6,0,0.1) 42%, rgba(10,4,0,0.85) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 68% 58% at 50% 38%, rgba(251,191,36,0.05) 0%, transparent 72%)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 34% 38% at 50% 40%, rgba(20,8,0,0.12) 0%, rgba(20,8,0,0.06) 38%, transparent 72%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          transform: "translateX(-50%)",
          width: 128,
          height: "56%",
          background: "linear-gradient(180deg, rgba(253,230,138,0) 0%, rgba(253,230,138,0.16) 55%, rgba(251,191,36,0.32) 100%)",
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          opacity: launching ? 0 : 1,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      >
        {!isDistrictMode ? (
          <div
            style={{
              position: "absolute",
              left: "4%",
              bottom: "10%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px 10px 12px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(76,29,149,0.78) 0%, rgba(30,27,75,0.85) 100%)",
              border: "1.5px solid rgba(253,230,138,0.45)",
              boxShadow: "0 0 24px rgba(251,191,36,0.28), 0 10px 28px rgba(0,0,0,0.55)",
              backdropFilter: "blur(10px)",
              maxWidth: 260,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "radial-gradient(circle at 50% 35%, #fde68a 0%, #b45309 75%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.3)",
              }}
            >
              🧙
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ color: "#fde68a", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace" }}>
                MEAZUREX
              </span>
              <span style={{ color: "#f5f3ff", fontSize: 12, fontWeight: 600, lineHeight: 1.25 }}>
                Welcome, young measurer! Your adventure begins.
              </span>
            </div>
          </div>
        ) : null}

        <div
          style={{
            position: "absolute",
            bottom: "2%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 12,
            pointerEvents: "auto",
          }}
        >
          <PlayerCharacter />
        </div>
      </div>

      {/* ── Top nav bar ── */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px",
          background: "rgba(20,8,0,0.72)",
          borderBottom: "1px solid rgba(251,191,36,0.12)",
          backdropFilter: "blur(16px)",
        }}
      >
        <button
          onClick={() => router.push(`/realms?level=${encodeURIComponent(resolvedYear)}`)}
          style={{ display: "flex", alignItems: "center", gap: 6, ...chip(), cursor: "pointer", color: "rgba(254,243,199,0.92)", fontSize: 12, fontWeight: 700 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={chip({ background: "rgba(120,53,15,0.45)", border: "1px solid rgba(251,191,36,0.32)" })}>
          <span style={{ color: "#fde68a", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", fontFamily: "ui-monospace,monospace" }}>⚗ MEASURELANDS</span>
        </div>
        <LevelsDrawer
          realmId="measurelands"
          progress={progress}
          viewingYear={resolvedYear}
          isPreview={isDemoPreviewMode()}
          accent="#c4b5fd"
          openDirection="right"
        />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5, ...chip() }}>
          <Zap size={11} color="#fde68a" />
          <span title="Global XP available in every realm" style={{ color: "#fef3c7", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{isDemoPreviewMode() ? demoRealmXP : globalXpBalance == null ? "—" : globalXpBalance} XP</span>
        </div>
        <div style={chip()}>
          <span style={{ color: "#fde68a", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{highestDone}/{totalWeeks} weeks</span>
        </div>
        <button
          onClick={() => router.push("/profile")}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", background: "rgba(60,28,0,0.55)", border: "1px solid rgba(251,191,36,0.28)" }}
        >
          <User size={16} color="#fde68a" />
        </button>
      </div>

      {/* ── Right HUD buttons ── */}
      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <RealmDashboardNav
          buttonStyle={hudBtn}
          palette={{
            text: "#fde68a",
            iconBackground: "radial-gradient(circle at 50% 35%, rgba(251,191,36,0.22) 0%, rgba(120,53,15,0.18) 55%, rgba(15,6,0,0) 100%)",
            iconBorder: "1px solid rgba(251,191,36,0.28)",
            iconShadow: "inset 0 0 14px rgba(251,191,36,0.14), 0 0 18px rgba(251,191,36,0.1)",
            textShadow: "0 0 10px rgba(251,191,36,0.4)",
          }}
        />
        <div style={{ ...hudBtn, cursor: "default", gap: 4 }}>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(251,191,36,0.5)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.15 }}>
            MY BEST
          </span>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#fde68a", lineHeight: 1 }}>{bestChain}</span>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(167,139,250,0.65)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.15, marginTop: 2 }}>
            CLASS BEST
          </span>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#c4b5fd", lineHeight: 1 }}>{classBestChain ?? "—"}</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 50%, rgba(5,8,24,0.78) 0%, rgba(5,8,24,0.45) 50%, rgba(5,8,24,0) 100%)",
            pointerEvents: "none",
          }}
        />
        {isDistrictMode ? (
          <>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "14%",
                transform: "translateX(-50%)",
                textAlign: "center",
                opacity: launching ? 0 : 1,
                transition: "opacity 0.3s",
              }}
            >
              <div
                style={{
                  color: "#fff7ed",
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: "0.28em",
                  fontFamily: "ui-monospace, monospace",
                  textShadow: "0 0 24px rgba(253,230,138,0.58), 0 3px 14px rgba(0,0,0,0.85)",
                }}
              >
                MEASURELANDS
              </div>
              <div
                style={{
                  color: "#fde68a",
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.28em",
                  fontFamily: "ui-monospace, monospace",
                  marginTop: 8,
                  textShadow: "0 0 14px rgba(251,191,36,0.46)",
                }}
              >
                {world.levelLabel} · FORMAL MEASUREMENT DISTRICTS
              </div>
            </div>

            {districts.map((district) => (
              <div
                key={district.id}
                style={{
                  position: "absolute",
                  left: district.left,
                  top: district.top,
                  zIndex: 2,
                  pointerEvents: "auto",
                  opacity: launching ? 0 : 1,
                  transition: "opacity 0.3s",
                }}
              >
                <MeasurelandsDistrictLabel
                  district={district}
                  state={getDistrictState(district)}
                  active={activeDistrictId === district.id}
                  onClick={() => openDistrict(district)}
                />
              </div>
            ))}

            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "7.5%",
                transform: "translateX(-50%)",
                color: "rgba(186,230,253,0.9)",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.24em",
                fontFamily: "ui-monospace, monospace",
                textShadow: `0 0 14px ${currentZone.color}, 0 2px 8px rgba(0,0,0,0.9)`,
                opacity: launching ? 0 : 1,
                transition: "opacity 0.3s",
                textAlign: "center",
              }}
            >
              CURRENT PATH · WEEK {Math.max(1, currentWeek)} · {currentZone.name}
            </div>
          </>
        ) : (
          <>
            {/* Main adventure button — warm gold, round, magical */}
            <button
              onClick={launchGuidedAdventure}
              disabled={launching}
              style={{
                position: "relative",
                pointerEvents: "auto",
                cursor: launching ? "default" : "pointer",
                padding: "22px 60px",
                borderRadius: 999,
                border: "2px solid rgba(200,160,48,0.65)",
                background: "linear-gradient(135deg, #2a1a04 0%, #5c3d0e 38%, #8b6520 72%, #c8a030 100%)",
                color: "#faf0d0",
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: "0.2em",
                fontFamily: "ui-monospace, monospace",
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                boxShadow: [
                  "0 0 0 4px rgba(200,160,48,0.18)",
                  "0 0 40px rgba(200,160,48,0.42)",
                  "0 0 90px rgba(109,40,217,0.18)",
                  "0 14px 32px rgba(0,0,0,0.55)",
                  "inset 0 2px 0 rgba(200,160,48,0.3)",
                  "inset 0 -4px 0 rgba(0,0,0,0.3)",
                ].join(", "),
                transform: launching ? "scale(1.08)" : "scale(1)",
                transition: "transform 0.25s ease",
                animation: "ml-guided-pulse 2.4s ease-in-out infinite",
                whiteSpace: "nowrap",
              }}
            >
              ✦ {highestDone === 0 ? "START ADVENTURE" : "CONTINUE ADVENTURE"}
            </button>

            <div
              style={{
                position: "relative",
                color: "rgba(253,230,138,0.85)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                fontFamily: "ui-monospace, monospace",
                marginTop: 14,
                opacity: launching ? 0 : 1,
                transition: "opacity 0.3s",
              }}
            >
              MASTER MEASUREMENT · BALANCE THE WORLD
            </div>

            <div
              style={{
                position: "relative",
                color: "rgba(186,230,253,0.9)",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.28em",
                fontFamily: "ui-monospace, monospace",
                textShadow: `0 0 14px ${currentZone.color}, 0 2px 8px rgba(0,0,0,0.9)`,
                marginTop: 12,
                opacity: launching ? 0 : 1,
                transition: "opacity 0.3s",
              }}
            >
              WEEK {Math.max(1, currentWeek)} · {currentZone.name}
            </div>
          </>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
          pointerEvents: "none",
          background: "radial-gradient(circle at 50% 60%, rgba(253,230,138,0.7) 0%, rgba(253,230,138,0.28) 25%, rgba(5,8,24,0.95) 70%)",
          opacity: launching ? 1 : 0,
          transition: "opacity 0.6s ease-in 0.25s",
        }}
      />

      <style>{`
        @keyframes ml-char-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes ml-guided-pulse {
          0%, 100% {
            box-shadow:
              0 0 0 4px rgba(200,160,48,0.18),
              0 0 38px rgba(200,160,48,0.42),
              0 0 90px rgba(109,40,217,0.18),
              0 14px 32px rgba(0,0,0,0.55),
              inset 0 2px 0 rgba(200,160,48,0.3),
              inset 0 -4px 0 rgba(0,0,0,0.3);
          }
          50% {
            box-shadow:
              0 0 0 6px rgba(200,160,48,0.28),
              0 0 58px rgba(200,160,48,0.6),
              0 0 120px rgba(109,40,217,0.28),
              0 14px 32px rgba(0,0,0,0.55),
              inset 0 2px 0 rgba(200,160,48,0.38),
              inset 0 -4px 0 rgba(0,0,0,0.3);
          }
        }
      `}</style>
    </div>
  );
}
