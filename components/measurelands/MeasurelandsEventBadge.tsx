"use client";

import {
  Bath,
  Bed,
  BookOpen,
  Bus,
  Cake,
  Coffee,
  Dumbbell,
  Footprints,
  Gift,
  GraduationCap,
  HeartHandshake,
  Music,
  Palette,
  PartyPopper,
  School,
  Sparkles,
  Sunrise,
  Trophy,
  Utensils,
  Waves,
  type LucideIcon,
} from "lucide-react";

type EventBadgeProps = {
  iconKey: string;
  label: string;
  size?: "sm" | "md" | "lg";
};

type BadgeSpec = {
  Icon: LucideIcon;
  bg: string;
  plate: string;
  ring: string;
  icon: string;
  accent: string;
};

const BADGE_SPECS: Record<string, BadgeSpec> = {
  cake: {
    Icon: Cake,
    bg: "linear-gradient(135deg,#ffe1ec 0%,#ffc6d9 48%,#ffeab6 100%)",
    plate: "linear-gradient(180deg,#fff8f8 0%,#ffe7ee 100%)",
    ring: "rgba(244,114,182,0.45)",
    icon: "#be185d",
    accent: "#fde68a",
  },
  birthday: {
    Icon: Cake,
    bg: "linear-gradient(135deg,#ffe1ec 0%,#ffc6d9 48%,#ffeab6 100%)",
    plate: "linear-gradient(180deg,#fff8f8 0%,#ffe7ee 100%)",
    ring: "rgba(244,114,182,0.45)",
    icon: "#be185d",
    accent: "#fde68a",
  },
  trophy: {
    Icon: Trophy,
    bg: "linear-gradient(135deg,#fff2c7 0%,#f8d365 48%,#f7b733 100%)",
    plate: "linear-gradient(180deg,#fffaf0 0%,#ffe8b3 100%)",
    ring: "rgba(217,119,6,0.4)",
    icon: "#9a5b00",
    accent: "#fff7d6",
  },
  soccer: {
    Icon: Trophy,
    bg: "linear-gradient(135deg,#d8fff0 0%,#8ef0c8 48%,#6ee7b7 100%)",
    plate: "linear-gradient(180deg,#f5fffb 0%,#d7fff0 100%)",
    ring: "rgba(16,185,129,0.42)",
    icon: "#047857",
    accent: "#ecfeff",
  },
  gift: {
    Icon: Gift,
    bg: "linear-gradient(135deg,#ffe4d6 0%,#ffb37a 48%,#f97316 100%)",
    plate: "linear-gradient(180deg,#fff8f2 0%,#ffe1cc 100%)",
    ring: "rgba(249,115,22,0.42)",
    icon: "#9a3412",
    accent: "#fff3cd",
  },
  music: {
    Icon: Music,
    bg: "linear-gradient(135deg,#ebe0ff 0%,#c4b5fd 48%,#8b5cf6 100%)",
    plate: "linear-gradient(180deg,#faf7ff 0%,#ebe2ff 100%)",
    ring: "rgba(139,92,246,0.42)",
    icon: "#5b21b6",
    accent: "#f5f3ff",
  },
  book: {
    Icon: BookOpen,
    bg: "linear-gradient(135deg,#dff5ff 0%,#9ddcff 48%,#60a5fa 100%)",
    plate: "linear-gradient(180deg,#f7fcff 0%,#dff2ff 100%)",
    ring: "rgba(59,130,246,0.38)",
    icon: "#1d4ed8",
    accent: "#eff6ff",
  },
  bus: {
    Icon: Bus,
    bg: "linear-gradient(135deg,#ffe6bf 0%,#fdba74 48%,#f59e0b 100%)",
    plate: "linear-gradient(180deg,#fffaf0 0%,#ffe7c2 100%)",
    ring: "rgba(245,158,11,0.42)",
    icon: "#9a5b00",
    accent: "#fff5d7",
  },
  party: {
    Icon: PartyPopper,
    bg: "linear-gradient(135deg,#ffe0f7 0%,#f9a8d4 48%,#c084fc 100%)",
    plate: "linear-gradient(180deg,#fff6fd 0%,#ffe1fb 100%)",
    ring: "rgba(217,70,239,0.38)",
    icon: "#a21caf",
    accent: "#fef3ff",
  },
  palette: {
    Icon: Palette,
    bg: "linear-gradient(135deg,#ffe8c6 0%,#ffd36f 48%,#fb7185 100%)",
    plate: "linear-gradient(180deg,#fff9f0 0%,#ffe7cc 100%)",
    ring: "rgba(251,113,133,0.36)",
    icon: "#b45309",
    accent: "#fff1c2",
  },
  run: {
    Icon: Footprints,
    bg: "linear-gradient(135deg,#eefecf 0%,#bef264 48%,#65a30d 100%)",
    plate: "linear-gradient(180deg,#fbfff1 0%,#e9fbc8 100%)",
    ring: "rgba(101,163,13,0.36)",
    icon: "#3f6212",
    accent: "#f7fee7",
  },
  school: {
    Icon: School,
    bg: "linear-gradient(135deg,#dff0ff 0%,#93c5fd 48%,#6366f1 100%)",
    plate: "linear-gradient(180deg,#f7fbff 0%,#dbeafe 100%)",
    ring: "rgba(99,102,241,0.38)",
    icon: "#3730a3",
    accent: "#eff6ff",
  },
  swimming: {
    Icon: Waves,
    bg: "linear-gradient(135deg,#d7fbff 0%,#7dd3fc 48%,#0ea5e9 100%)",
    plate: "linear-gradient(180deg,#f2feff 0%,#d6f8ff 100%)",
    ring: "rgba(14,165,233,0.38)",
    icon: "#0369a1",
    accent: "#ecfeff",
  },
  art: {
    Icon: Palette,
    bg: "linear-gradient(135deg,#ffe6c9 0%,#fdba74 42%,#f472b6 100%)",
    plate: "linear-gradient(180deg,#fff8f0 0%,#ffe6cf 100%)",
    ring: "rgba(244,114,182,0.38)",
    icon: "#9a3412",
    accent: "#fff1c2",
  },
  excursion: {
    Icon: Bus,
    bg: "linear-gradient(135deg,#fff0c9 0%,#fcd34d 48%,#fb923c 100%)",
    plate: "linear-gradient(180deg,#fffaf3 0%,#ffe8bf 100%)",
    ring: "rgba(251,146,60,0.38)",
    icon: "#9a3412",
    accent: "#fff7d6",
  },
  celebration: {
    Icon: Sparkles,
    bg: "linear-gradient(135deg,#fce7ff 0%,#e9d5ff 48%,#a855f7 100%)",
    plate: "linear-gradient(180deg,#fff8ff 0%,#f3e8ff 100%)",
    ring: "rgba(168,85,247,0.36)",
    icon: "#7e22ce",
    accent: "#faf5ff",
  },
  family: {
    Icon: HeartHandshake,
    bg: "linear-gradient(135deg,#ffe6e2 0%,#fdba74 42%,#fb7185 100%)",
    plate: "linear-gradient(180deg,#fff8f7 0%,#ffe6e2 100%)",
    ring: "rgba(251,113,133,0.36)",
    icon: "#be123c",
    accent: "#fff1f2",
  },
  wakeup: {
    Icon: Sunrise,
    bg: "linear-gradient(135deg,#fde68a 0%,#fdba74 50%,#f97316 100%)",
    plate: "linear-gradient(180deg,#fffaf0 0%,#ffe8bf 100%)",
    ring: "rgba(249,115,22,0.36)",
    icon: "#9a3412",
    accent: "#fff7d6",
  },
  breakfast: {
    Icon: Coffee,
    bg: "linear-gradient(135deg,#ffedd5 0%,#fdba74 48%,#fb923c 100%)",
    plate: "linear-gradient(180deg,#fff9f2 0%,#ffe5cc 100%)",
    ring: "rgba(251,146,60,0.36)",
    icon: "#9a3412",
    accent: "#fff7ed",
  },
  dinner: {
    Icon: Utensils,
    bg: "linear-gradient(135deg,#fee2e2 0%,#fca5a5 48%,#fb7185 100%)",
    plate: "linear-gradient(180deg,#fff7f7 0%,#ffe1e1 100%)",
    ring: "rgba(251,113,133,0.36)",
    icon: "#9f1239",
    accent: "#fff1f2",
  },
  bath: {
    Icon: Bath,
    bg: "linear-gradient(135deg,#dbeafe 0%,#93c5fd 48%,#38bdf8 100%)",
    plate: "linear-gradient(180deg,#f7fcff 0%,#dbeafe 100%)",
    ring: "rgba(56,189,248,0.36)",
    icon: "#0c4a6e",
    accent: "#ecfeff",
  },
  bed: {
    Icon: Bed,
    bg: "linear-gradient(135deg,#ddd6fe 0%,#c4b5fd 48%,#8b5cf6 100%)",
    plate: "linear-gradient(180deg,#faf8ff 0%,#ede9fe 100%)",
    ring: "rgba(139,92,246,0.36)",
    icon: "#5b21b6",
    accent: "#f5f3ff",
  },
  sport: {
    Icon: Dumbbell,
    bg: "linear-gradient(135deg,#dcfce7 0%,#86efac 48%,#22c55e 100%)",
    plate: "linear-gradient(180deg,#f7fff9 0%,#dcfce7 100%)",
    ring: "rgba(34,197,94,0.36)",
    icon: "#166534",
    accent: "#f0fdf4",
  },
  reading: {
    Icon: BookOpen,
    bg: "linear-gradient(135deg,#e0f2fe 0%,#93c5fd 48%,#3b82f6 100%)",
    plate: "linear-gradient(180deg,#f6fbff 0%,#dbeafe 100%)",
    ring: "rgba(59,130,246,0.36)",
    icon: "#1d4ed8",
    accent: "#eff6ff",
  },
};

const SIZE_MAP = {
  sm: { shell: 32, plate: 22, icon: 12, spark: 5 },
  md: { shell: 44, plate: 30, icon: 17, spark: 7 },
  lg: { shell: 52, plate: 36, icon: 20, spark: 8 },
} as const;

export function MeasurelandsEventBadge({
  iconKey,
  label,
  size = "md",
}: EventBadgeProps) {
  const spec = BADGE_SPECS[iconKey] ?? {
    Icon: GraduationCap,
    bg: "linear-gradient(135deg,#e9e4ff 0%,#c4b5fd 48%,#8b5cf6 100%)",
    plate: "linear-gradient(180deg,#faf8ff 0%,#ebe5ff 100%)",
    ring: "rgba(139,92,246,0.4)",
    icon: "#5b21b6",
    accent: "#f5f3ff",
  };
  const dims = SIZE_MAP[size];
  const Icon = spec.Icon;

  return (
    <span
      aria-label={label}
      className="relative inline-flex shrink-0 items-center justify-center rounded-[18px] shadow-[0_10px_18px_rgba(120,53,15,0.18)]"
      style={{
        width: dims.shell,
        height: dims.shell,
        background: spec.bg,
        border: `1px solid ${spec.ring}`,
      }}
    >
      <span
        className="absolute inset-x-[14%] bottom-[10%] rounded-full blur-[2px]"
        style={{ height: dims.spark, background: "rgba(120,53,15,0.16)" }}
      />
      <span
        className="absolute left-[14%] top-[14%] rounded-full bg-white/40"
        style={{ width: dims.spark, height: dims.spark }}
      />
      <span
        className="relative inline-flex items-center justify-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
        style={{
          width: dims.plate,
          height: dims.plate,
          background: spec.plate,
          border: `1px solid ${spec.ring}`,
        }}
      >
        <Icon style={{ width: dims.icon, height: dims.icon, color: spec.icon }} strokeWidth={2.3} />
      </span>
      <span
        className="absolute right-[8%] top-[8%] rounded-full"
        style={{ width: dims.spark, height: dims.spark, background: spec.accent, boxShadow: "0 0 0 1px rgba(255,255,255,0.55)" }}
      />
    </span>
  );
}
