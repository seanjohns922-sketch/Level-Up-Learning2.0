import type { CSSProperties } from "react";

// Simple, friendly picture-icons for Statistica data labels so sorting animals
// looks nothing like sorting fruit or reading a weather graph. Each icon draws in
// a 24x24 box. Labels without a bespoke icon fall back to a colored lettered chip.

type IconProps = { name: string; color?: string; size?: number; className?: string; style?: CSSProperties };

const G = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Each entry returns SVG children drawn in a 0 0 24 24 viewBox.
const ICONS: Record<string, (c: string) => React.ReactNode> = {
  // fruit
  apple: (c) => (<G><path d="M12 8c-2-3-7-2-7 3 0 4 3 8 7 8s7-4 7-8c0-5-5-6-7-3z" fill={c} /><path d="M12 8c0-2 1-3 3-4" stroke="#5b3b1a" strokeWidth="1.4" fill="none" strokeLinecap="round" /><path d="M12 7c1.5-1 3-1 4 0-.5 1.5-2.5 1.7-4 0z" fill="#57a04a" /></G>),
  banana: (c) => (<G><path d="M6 6c1 7 6 12 13 11-2 2-6 3-9 2C5 17 4 10 6 6z" fill={c} stroke="#b8860b" strokeWidth="1" /></G>),
  orange: (c) => (<G><circle cx="12" cy="13" r="7" fill={c} /><path d="M12 6v14M5 13h14M7 8l10 10M17 8L7 18" stroke="#c65b1a" strokeWidth="0.8" opacity="0.6" /><path d="M12 6c1-2 3-2 3-2" stroke="#57a04a" strokeWidth="1.4" strokeLinecap="round" /></G>),
  grapes: (c) => (<G>{[[9,10],[12,10],[15,10],[10.5,13],[13.5,13],[12,16]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2.2" fill={c} />)}<path d="M12 8c0-2 2-2 3-3" stroke="#57a04a" strokeWidth="1.3" strokeLinecap="round" fill="none" /></G>),
  pear: (c) => (<G><path d="M12 7c1.5 0 2 2 1.6 3.5C15.5 12 16 15 16 16.5 16 19 14 21 12 21s-4-2-4-4.5c0-1.6.6-4.6 2.6-6C10 9 10.5 7 12 7z" fill={c} /><path d="M12 7c0-1.5.5-2.5 2-3" stroke="#5b3b1a" strokeWidth="1.3" strokeLinecap="round" /></G>),
  // veg / other food
  carrot: (c) => (<G><path d="M8 10l8 2-6 8z" fill={c} /><path d="M9 9l-2-3M11 8l1-4M13 8l3-3" stroke="#3f9e4d" strokeWidth="1.6" strokeLinecap="round" /></G>),
  peas: (c) => (<G><path d="M6 15c-1-5 4-9 9-8-1 5-5 9-9 8z" fill={c} /><circle cx="9" cy="13" r="1.7" fill="#eaf7e0" /><circle cx="11.6" cy="12.2" r="1.7" fill="#eaf7e0" /><circle cx="14" cy="11.2" r="1.7" fill="#eaf7e0" /></G>),
  corn: (c) => (<G><path d="M12 4c3 0 4 4 4 8s-1 8-4 8-4-4-4-8 1-8 4-8z" fill={c} /><path d="M10 8h4M10 11h4M10 14h4M10 17h4" stroke="#b8860b" strokeWidth="0.9" /></G>),
  milk: () => (<G><path d="M9 4h6v3l1 2v11H8V9l1-2z" fill="#eef4ff" stroke="#9db4d6" strokeWidth="1" /><rect x="9" y="12" width="6" height="4" fill="#dbe7ff" /></G>),
  juice: (c) => (<G><path d="M8 8h8l-1 12H9z" fill={c} opacity="0.85" /><path d="M8 8h8" stroke="#fff" strokeWidth="1.4" /><path d="M13 8V4l3-1" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" /></G>),
  water: (c) => (<G><path d="M12 4c3 5 6 8 6 11a6 6 0 01-12 0c0-3 3-6 6-11z" fill={c} opacity="0.85" /></G>),
  bread: (c) => (<G><path d="M5 12c0-3 3-5 7-5s7 2 7 5v6H5z" fill={c} /><path d="M5 12c0-3 3-5 7-5s7 2 7 5" fill="none" stroke="#b8860b" strokeWidth="1" /></G>),
  cheese: (c) => (<G><path d="M4 16l14-7 2 3v4H4z" fill={c} /><circle cx="9" cy="14" r="1" fill="#b8860b" /><circle cx="14" cy="13" r="1" fill="#b8860b" /></G>),
  egg: () => (<G><ellipse cx="12" cy="13" rx="6" ry="8" fill="#fff8ec" stroke="#e2cfa6" strokeWidth="1" /></G>),
  // things / toys
  ball: (c) => (<G><circle cx="12" cy="12" r="8" fill={c} /><path d="M4 12h16M12 4v16M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="0.9" opacity="0.7" /></G>),
  kite: (c) => (<G><path d="M12 3l6 7-6 7-6-7z" fill={c} /><path d="M12 3v14M6 10h12" stroke="#fff" strokeWidth="0.8" opacity="0.7" /><path d="M12 17l-2 4M12 17l2 4" stroke="#b8860b" strokeWidth="1" /></G>),
  teddy: (c) => (<G><circle cx="7.5" cy="7.5" r="2" fill={c} /><circle cx="16.5" cy="7.5" r="2" fill={c} /><circle cx="12" cy="13" r="6" fill={c} /><circle cx="10" cy="12" r="0.9" fill="#3a2410" /><circle cx="14" cy="12" r="0.9" fill="#3a2410" /><circle cx="12" cy="15" r="1.4" fill="#3a2410" /></G>),
  blocks: (c) => (<G><rect x="5" y="12" width="6" height="6" rx="1" fill={c} /><rect x="12" y="12" width="6" height="6" rx="1" fill={c} opacity="0.75" /><rect x="8.5" y="6" width="6" height="6" rx="1" fill={c} opacity="0.9" /></G>),
  hat: (c) => (<G><path d="M6 15c1-6 3-8 6-8s5 2 6 8z" fill={c} /><rect x="4" y="15" width="16" height="2.5" rx="1.2" fill={c} /></G>),
  sock: (c) => (<G><path d="M9 4h4v8l4 3a3 3 0 01-3 5l-4-3c-2-1-3-3-3-5V4z" fill={c} /><rect x="9" y="4" width="4" height="2.5" fill="#fff" opacity="0.7" /></G>),
  shoe: (c) => (<G><path d="M3 16c0-1 1-1.6 2-1.8 1.8-.3 3-1.2 4-2.2l2-2 2 1c.2 1 1 1.6 2 2l3.5 1c1 .3 1.5 1 1.5 2v1.2H3z" fill={c} /><path d="M8 13l1 2M11 11.5l1 2.5" stroke="#fff" strokeWidth="1" strokeLinecap="round" /><rect x="3" y="17.4" width="17" height="1.6" rx="0.6" fill="#2c2c2c" opacity="0.55" /></G>),
  // weather
  sunny: (c) => (<G><circle cx="12" cy="12" r="4.5" fill={c} /><g stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M18.5 5.5l-2 2M7.5 16.5l-2 2" /></g></G>),
  cloudy: (c) => (<G><path d="M8 16h9a3.5 3.5 0 00.4-7A5 5 0 007.5 9 3.5 3.5 0 008 16z" fill={c} /></G>),
  rainy: (c) => (<G><path d="M8 13h9a3.3 3.3 0 00.4-6.6A4.7 4.7 0 007.5 6.5 3.3 3.3 0 008 13z" fill={c} /><g stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round"><path d="M9 16l-1 3M13 16l-1 3M17 16l-1 3" /></g></G>),
  // travel
  car: (c) => (<G><path d="M3 16v-2.2l2-1 2-3c.4-.6 1-1 1.7-1h6.6c.7 0 1.3.4 1.7 1l2 3 2 1V16z" fill={c} /><path d="M8 9.3h8l1.4 2.5H6.6z" fill="#dbeeff" opacity="0.9" /><circle cx="7.5" cy="16.6" r="1.7" fill="#2c2c2c" /><circle cx="16.5" cy="16.6" r="1.7" fill="#2c2c2c" /></G>),
  bus: (c) => (<G><rect x="4" y="6" width="16" height="11" rx="2" fill={c} /><path d="M6 9h12v3H6z" fill="#dff" opacity="0.8" /><circle cx="8" cy="18" r="1.5" fill="#333" /><circle cx="16" cy="18" r="1.5" fill="#333" /></G>),
  walk: (c) => (<G><circle cx="13" cy="5" r="2" fill={c} /><path d="M13 7l-1 5-3 6M12 12l4 2M12 9l-4 1M12 12l1 6" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" /></G>),
  // sport
  soccer: (c) => (<G><circle cx="12" cy="12" r="8" fill="#fff" stroke={c} strokeWidth="1.2" /><path d="M12 8l3 2-1 3.5h-4L9 10z" fill={c} /><path d="M12 4v4M20 12h-4M4 12h3M8 19l2-3M16 19l-2-3" stroke={c} strokeWidth="1" /></G>),
  swimming: (c) => (<G><circle cx="9" cy="7" r="2" fill={c} /><path d="M6 11c2-1 3 1 5 0s3-1 5 0" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M4 15c2.5-1.5 4 1 6.5 0s4.5-1.5 7 0" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M4 18.5c2.5-1.5 4 1 6.5 0s4.5-1.5 7 0" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" /></G>),
  running: (c) => (<G><circle cx="14" cy="5" r="2" fill={c} /><path d="M14 7l-2 4 2 3-1 5M12 11l-4 1M14 10l4 1M12 14l-3 4" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" /></G>),
  // pets / animals — simple friendly faces
  dog: (c) => (<G><path d="M6 8l2 2M18 8l-2 2" stroke={c} strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="13" r="6" fill={c} /><ellipse cx="6.5" cy="9" rx="1.6" ry="2.6" fill={c} /><ellipse cx="17.5" cy="9" rx="1.6" ry="2.6" fill={c} /><circle cx="10" cy="12" r="0.9" fill="#3a2410" /><circle cx="14" cy="12" r="0.9" fill="#3a2410" /><circle cx="12" cy="15" r="1.2" fill="#3a2410" /></G>),
  cat: (c) => (<G><path d="M7 6l1.5 4M17 6l-1.5 4" stroke={c} strokeWidth="2.4" strokeLinecap="round" /><circle cx="12" cy="13" r="6" fill={c} /><circle cx="10" cy="12" r="0.9" fill="#3a2410" /><circle cx="14" cy="12" r="0.9" fill="#3a2410" /><path d="M12 14v1M9 15h2M15 15h-2" stroke="#3a2410" strokeWidth="0.8" strokeLinecap="round" /></G>),
  fish: (c) => (<G><path d="M4 12c3-4 9-4 12 0-3 4-9 4-12 0z" fill={c} /><path d="M16 12l4-3v6z" fill={c} /><circle cx="8" cy="11" r="0.9" fill="#fff" /></G>),
  cow: (c) => (<G><path d="M5 8c-1.5-.5-2 .5-1.5 2M19 8c1.5-.5 2 .5 1.5 2" stroke={c} strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="13" r="6" fill={c} /><ellipse cx="8.5" cy="10" rx="2" ry="1.4" fill="#3a2410" opacity="0.45" /><ellipse cx="12" cy="15.5" rx="3.2" ry="2.2" fill="#f7c9d0" /><circle cx="10.6" cy="15.7" r="0.5" fill="#a34" /><circle cx="13.4" cy="15.7" r="0.5" fill="#a34" /><circle cx="10" cy="11.5" r="0.9" fill="#3a2410" /><circle cx="14" cy="11.5" r="0.9" fill="#3a2410" /></G>),
  lion: (c) => (<G><g fill={c}>{Array.from({ length: 10 }, (_, k) => { const a = (k / 10) * Math.PI * 2; return <circle key={k} cx={12 + 7 * Math.cos(a)} cy={13 + 7 * Math.sin(a)} r="2.3" />; })}</g><circle cx="12" cy="13" r="5.2" fill="#f4c67a" /><circle cx="10" cy="12" r="0.9" fill="#3a2410" /><circle cx="14" cy="12" r="0.9" fill="#3a2410" /><path d="M12 14l-1 1.4h2z" fill="#3a2410" /></G>),
  sheep: (c) => (<G><g fill="#f1f1f4">{[[8,10],[11,8.5],[15,10],[16.5,13],[13,16.5],[9,16.5],[6.5,13]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3" />)}</g><circle cx="12" cy="13" r="4" fill={c} /><circle cx="10.4" cy="12.5" r="0.8" fill="#fff" /><circle cx="13.6" cy="12.5" r="0.8" fill="#fff" /></G>),
  zebra: (c) => (<G><circle cx="12" cy="13" r="6" fill="#f8fafc" /><ellipse cx="7" cy="9" rx="1.3" ry="2" fill="#334155" /><ellipse cx="17" cy="9" rx="1.3" ry="2" fill="#334155" /><g stroke="#334155" strokeWidth="1.3" strokeLinecap="round"><path d="M12 7.2v3M8.6 8.2l1 2.4M15.4 8.2l-1 2.4M6.6 12.5h3M17.4 12.5h-3M8 16l1-2M16 16l-1-2" /></g><circle cx="10" cy="13" r="0.8" fill="#334155" /><circle cx="14" cy="13" r="0.8" fill="#334155" /></G>),
  tiger: (c) => (<G><path d="M7 7l1.4 3M17 7l-1.4 3" stroke={c} strokeWidth="2.6" strokeLinecap="round" /><circle cx="12" cy="13" r="6" fill={c} /><g stroke="#3a2410" strokeWidth="1.1" strokeLinecap="round"><path d="M12 7.5v2.4M9 8.5l.8 1.9M15 8.5l-.8 1.9M6.6 13h2M17.4 13h-2" /></g><circle cx="10" cy="12.5" r="0.9" fill="#3a2410" /><circle cx="14" cy="12.5" r="0.9" fill="#3a2410" /><path d="M12 14.4l-1 1.2h2z" fill="#3a2410" /></G>),
  rabbit: (c) => (<G><ellipse cx="9.5" cy="6" rx="1.8" ry="4" fill={c} /><ellipse cx="14.5" cy="6" rx="1.8" ry="4" fill={c} /><ellipse cx="9.5" cy="6.5" rx="0.8" ry="2.4" fill="#f7c9d0" /><ellipse cx="14.5" cy="6.5" rx="0.8" ry="2.4" fill="#f7c9d0" /><circle cx="12" cy="14.5" r="5.3" fill={c} /><circle cx="10.3" cy="13.5" r="0.8" fill="#3a2410" /><circle cx="13.7" cy="13.5" r="0.8" fill="#3a2410" /><path d="M12 15.3v1.2M10.6 15.8h2.8" stroke="#a34" strokeWidth="0.7" strokeLinecap="round" /></G>),
  horse: (c) => (<G><path d="M9 5l-1 3M13.5 5l.8 2.4" stroke={c} strokeWidth="2" strokeLinecap="round" /><path d="M8 8.5c0-2 1.8-3.2 4-3.2s4 1.2 4 3.2v5.5c0 3-1.8 4.8-4 5.8-2.2-1-4-2.8-4-5.8z" fill={c} /><path d="M8 8.5c-1.2.2-2 1.3-2 3l2 .8z" fill="#5b3b1a" /><circle cx="10" cy="11" r="0.8" fill="#3a2410" /><circle cx="14" cy="11" r="0.8" fill="#3a2410" /><ellipse cx="12" cy="18.2" rx="2" ry="1.4" fill="#3a2410" opacity="0.35" /></G>),
  hamster: (c) => (<G><circle cx="8.5" cy="9" r="1.9" fill={c} /><circle cx="15.5" cy="9" r="1.9" fill={c} /><circle cx="12" cy="14" r="6.5" fill={c} /><circle cx="7.6" cy="15.4" r="1.7" fill="#f7c9d0" opacity="0.75" /><circle cx="16.4" cy="15.4" r="1.7" fill="#f7c9d0" opacity="0.75" /><circle cx="9.7" cy="13" r="0.9" fill="#3a2410" /><circle cx="14.3" cy="13" r="0.9" fill="#3a2410" /><circle cx="12" cy="15" r="1" fill="#3a2410" /></G>),
  // colours — a filled swatch in the category's own colour
  red: (c) => <circle cx="12" cy="12" r="8" fill={c} />,
  blue: (c) => <circle cx="12" cy="12" r="8" fill={c} />,
  green: (c) => <circle cx="12" cy="12" r="8" fill={c} />,
};

// Category-level fallbacks so even un-iconed items look themed, not blank.
const CATEGORY_HINT: Record<string, string> = {};

export default function DataIcon({ name, color = "#c65b4e", size = 22, className, style }: IconProps) {
  const key = name.trim().toLowerCase();
  const draw = ICONS[key];
  if (draw) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} role="img" aria-label={name}>
        {draw(color)}
      </svg>
    );
  }
  // Colored lettered chip fallback (e.g. specific animals we don't icon yet).
  const letter = name.trim().charAt(0).toUpperCase();
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} role="img" aria-label={name}>
      <rect x="3" y="3" width="18" height="18" rx="5" fill={color} />
      <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="system-ui, sans-serif">{letter}</text>
    </svg>
  );
}

export function hasDataIcon(name: string): boolean {
  return Boolean(ICONS[name.trim().toLowerCase()]) || Object.keys(CATEGORY_HINT).length > 0;
}
