export const LEVEL2_HERO_GRADIENT =
  "bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800";

export function getLessonChrome(levelNum: number) {
  if (levelNum === 2) {
    return {
      backLinkClass: "text-teal-700 hover:text-teal-800",
      heroClass: LEVEL2_HERO_GRADIENT,
      calloutClass: "rounded-2xl border border-teal-200 bg-teal-50/90 p-6 mb-8",
      calloutTextClass: "flex items-center gap-2 font-bold text-teal-700 mb-2",
      buttonClass:
        "w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-700 text-white font-extrabold text-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-teal-900/20",
    };
  }

  return {
    backLinkClass: "text-primary hover:underline",
    heroClass: "bg-gradient-to-br from-primary to-primary/80",
    calloutClass: "rounded-2xl border border-primary/20 bg-primary-light p-6 mb-8",
    calloutTextClass: "flex items-center gap-2 font-bold text-primary mb-2",
    buttonClass:
      "w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-extrabold text-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-lg",
  };
}
