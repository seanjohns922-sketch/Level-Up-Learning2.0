import {
  Bot,
  Box,
  Circle,
  CircleDot,
  Coins,
  Gem,
  Orbit,
  Rocket,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";

type TokenSize = "sm" | "md" | "lg";

const TOKEN_ICONS: Record<string, LucideIcon> = {
  dots: Circle,
  gems: Gem,
  crystals: Gem,
  crystal: Gem,
  blocks: Box,
  robot_tokens: Bot,
  robots: Bot,
  robot: Bot,
  stars: Star,
  star: Star,
  energy_orbs: CircleDot,
  number_orbs: CircleDot,
  bolts: Zap,
  futuristic_coins: Coins,
  planets: Orbit,
  rockets: Rocket,
};

const TOKEN_TONES: Record<string, string> = {
  gems: "border-cyan-300 bg-cyan-50 text-cyan-800",
  crystals: "border-cyan-300 bg-cyan-50 text-cyan-800",
  crystal: "border-cyan-300 bg-cyan-50 text-cyan-800",
  stars: "border-amber-300 bg-amber-50 text-amber-700",
  star: "border-amber-300 bg-amber-50 text-amber-700",
  robot_tokens: "border-rose-300 bg-rose-50 text-rose-700",
  robots: "border-rose-300 bg-rose-50 text-rose-700",
  robot: "border-rose-300 bg-rose-50 text-rose-700",
  blocks: "border-indigo-300 bg-indigo-50 text-indigo-700",
  bolts: "border-yellow-300 bg-yellow-50 text-yellow-700",
  futuristic_coins: "border-amber-300 bg-amber-50 text-amber-700",
  planets: "border-violet-300 bg-violet-50 text-violet-700",
  rockets: "border-orange-300 bg-orange-50 text-orange-700",
};

const SIZE_STYLES: Record<TokenSize, { frame: string; icon: string }> = {
  sm: { frame: "h-9 w-9", icon: "h-5 w-5" },
  md: { frame: "h-12 w-12", icon: "h-7 w-7" },
  lg: { frame: "h-16 w-16", icon: "h-9 w-9" },
};

export default function GroundObjectToken({
  objectType,
  size = "md",
  selected = false,
  muted = false,
  newlyAdded = false,
  className = "",
}: {
  objectType: string;
  size?: TokenSize;
  selected?: boolean;
  muted?: boolean;
  newlyAdded?: boolean;
  className?: string;
}) {
  const Icon = TOKEN_ICONS[objectType] ?? CircleDot;
  const sizing = SIZE_STYLES[size];
  const tone = TOKEN_TONES[objectType] ?? "border-teal-300 bg-teal-50 text-teal-800";

  return (
    <span
      className={[
        "relative grid shrink-0 place-items-center rounded-lg border-2 shadow-[0_4px_10px_rgba(15,23,42,0.08)] transition duration-200",
        sizing.frame,
        muted ? "border-slate-200 bg-slate-100 text-slate-300 opacity-55" : tone,
        selected ? "scale-105 ring-4 ring-emerald-300/40" : "",
        newlyAdded ? "scale-105 border-emerald-400 ring-4 ring-emerald-300/30" : "",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      <Icon className={sizing.icon} strokeWidth={2.3} />
      {!muted ? <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-white/90" /> : null}
    </span>
  );
}
