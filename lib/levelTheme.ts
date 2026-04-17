export const LEVEL2_HERO_GRADIENT =
  "bg-[linear-gradient(135deg,#0f766e_0%,#0d9488_55%,#14b8a6_100%)] relative before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)] before:pointer-events-none";

const SHARED_CHROME = {
  backLinkClass: "text-teal-700 hover:text-teal-800",
  heroClass: LEVEL2_HERO_GRADIENT,
  calloutClass: "rounded-2xl border border-teal-200 bg-teal-50/90 p-6 mb-8",
  calloutTextClass: "flex items-center gap-2 font-bold text-teal-700 mb-2",
  buttonClass:
    "w-full py-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-extrabold text-xl tracking-tight hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,185,129,0.38)] transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(16,185,129,0.28)]",
} as const;

export function getLessonChrome(_levelNum: number) {
  return { ...SHARED_CHROME };
}
