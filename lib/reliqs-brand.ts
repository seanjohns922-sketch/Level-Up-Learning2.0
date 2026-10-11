import { getRealmTheme } from "@/lib/useRealmTheme";

/** Collection identities share the established learning realm palette. */
export function getReliqsColor(realm: string): string {
  const themes: Record<string, string> = {
    "number-nexus": "number",
    measurelands: "measurement",
    "starpath-realm": "space",
    starpath: "space",
    "pattern-peaks": "pattern",
    statistica: "statistics",
    "chance-hollow": "chance",
  };
  if (realm === "chronorok") return "#f5b432";
  if (!themes[realm]) return "#a1a1aa";
  const theme = getRealmTheme(themes[realm]);
  return realm === "measurelands"
    ? theme.accentText
    : theme.ctaHoverFrom;
}
