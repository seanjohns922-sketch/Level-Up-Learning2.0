import { useId } from "react";

type TokenSize = "sm" | "md" | "lg";

const FAMILY: Record<string, string> = {
  dots: "dot", gems: "gem", crystals: "gem", crystal: "gem", blocks: "block", robot_tokens: "robot", robots: "robot", robot: "robot",
  stars: "star", star: "star", energy_orbs: "orb", number_orbs: "orb", bolts: "bolt", futuristic_coins: "coin", planets: "planet", rockets: "rocket",
};
const SIZES: Record<TokenSize, string> = { sm: "h-9 w-9", md: "h-12 w-12", lg: "h-16 w-16" };

/** Glossy game pieces. The same art is used wherever a child counts, so it must read instantly. */
function Art({ family, id }: { family: string; id: string }) {
  const g = (name: string) => `url(#${id}${name})`;
  switch (family) {
    case "star": return <><defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff3a0" /><stop offset=".55" stopColor="#ffc62e" /><stop offset="1" stopColor="#f08c00" /></linearGradient></defs><path d="M32 4l8.3 17.6 19.2 2.6-14 13.4 3.5 19.1L32 47.4 15 56.7l3.5-19.1-14-13.4 19.2-2.6z" fill={g("a")} stroke="#b45f06" strokeWidth="2.5" strokeLinejoin="round" /><path d="M32 12l5 11-13 2z" fill="#fff" opacity=".55" /></>;
    case "gem": return <><defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a5f3fc" /><stop offset="1" stopColor="#0891b2" /></linearGradient></defs><path d="M16 8h32l12 16-28 34L4 24z" fill={g("a")} stroke="#0e5e74" strokeWidth="2.5" strokeLinejoin="round" /><path d="M4 24h56L32 58z" fill="#0ea5c6" opacity=".55" /><path d="M16 8l6 16 10-16zM48 8l-6 16-10-16z" fill="#fff" opacity=".5" /></>;
    case "orb": return <><defs><radialGradient id={`${id}a`} cx=".35" cy=".3" r=".8"><stop stopColor="#f5d0fe" /><stop offset=".5" stopColor="#a855f7" /><stop offset="1" stopColor="#581c87" /></radialGradient></defs><circle cx="32" cy="32" r="27" fill={g("a")} stroke="#4c1d95" strokeWidth="2.5" /><ellipse cx="23" cy="20" rx="9" ry="6" fill="#fff" opacity=".7" /></>;
    case "block": return <><path d="M10 20L32 8l22 12v26L32 58 10 46z" fill="#34d399" stroke="#065f46" strokeWidth="2.5" strokeLinejoin="round" /><path d="M10 20l22 12 22-12L32 8z" fill="#a7f3d0" /><path d="M32 32v26l22-12V20z" fill="#059669" /></>;
    case "robot": return <><path d="M32 4v8" stroke="#475569" strokeWidth="4" /><circle cx="32" cy="5" r="4" fill="#f43f5e" /><rect x="10" y="12" width="44" height="34" rx="11" fill="#f8fafc" stroke="#334155" strokeWidth="2.5" /><rect x="16" y="20" width="32" height="16" rx="8" fill="#1e293b" /><circle cx="25" cy="28" r="4.5" fill="#22d3ee" /><circle cx="39" cy="28" r="4.5" fill="#22d3ee" /><rect x="20" y="48" width="24" height="11" rx="5" fill="#e11d48" stroke="#334155" strokeWidth="2.5" /></>;
    case "bolt": return <path d="M36 3L10 36h17l-5 25 30-37H34z" fill="#fde047" stroke="#a16207" strokeWidth="2.5" strokeLinejoin="round" />;
    case "coin": return <><circle cx="32" cy="32" r="27" fill="#fbbf24" stroke="#92400e" strokeWidth="2.5" /><circle cx="32" cy="32" r="19" fill="#fde68a" stroke="#d97706" strokeWidth="2.5" /></>;
    case "planet": return <><circle cx="32" cy="32" r="19" fill="#8b5cf6" stroke="#4c1d95" strokeWidth="2.5" /><ellipse cx="32" cy="32" rx="29" ry="9" fill="none" stroke="#fbbf24" strokeWidth="4" transform="rotate(-18 32 32)" /><ellipse cx="25" cy="24" rx="6" ry="4" fill="#fff" opacity=".6" /></>;
    case "rocket": return <><path d="M32 4c11 9 14 23 11 38H21C18 27 21 13 32 4z" fill="#f8fafc" stroke="#334155" strokeWidth="2.5" /><path d="M32 4c5 4 8 9 10 15H22c2-6 5-11 10-15z" fill="#ef4444" /><circle cx="32" cy="27" r="6" fill="#38bdf8" stroke="#334155" strokeWidth="2.5" /><path d="M21 34L10 50l12-4zM43 34l11 16-12-4z" fill="#ef4444" stroke="#334155" strokeWidth="2" /><path d="M26 44l6 16 6-16z" fill="#fb923c" /></>;
    default: return <><defs><radialGradient id={`${id}a`} cx=".35" cy=".3" r=".8"><stop stopColor="#a5b4fc" /><stop offset="1" stopColor="#4338ca" /></radialGradient></defs><circle cx="32" cy="32" r="25" fill={g("a")} stroke="#312e81" strokeWidth="2.5" /><ellipse cx="24" cy="21" rx="7" ry="5" fill="#fff" opacity=".6" /></>;
  }
}

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
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span
      className={[
        "relative inline-grid shrink-0 place-items-center rounded-xl transition duration-200",
        SIZES[size],
        muted ? "opacity-30 grayscale" : "drop-shadow-[0_4px_4px_rgba(15,23,42,0.28)]",
        selected ? "scale-110 ring-4 ring-emerald-400" : "",
        newlyAdded ? "scale-110 ring-4 ring-emerald-300" : "",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="h-full w-full"><Art family={FAMILY[objectType] ?? "dot"} id={id} /></svg>
    </span>
  );
}
