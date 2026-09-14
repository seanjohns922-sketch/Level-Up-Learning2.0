import {
  BarChart3,
  Compass,
  Dices,
  Hash,
  Ruler,
  Triangle,
  type LucideIcon,
} from "lucide-react";
import type { AcStrand } from "@/lib/curriculum/ac-standards";

// Realm identity for the Whole-Maths Diagnostic, shared by the student
// instrument and the Demo Review diagnostic preview so both render alike.
export const STRAND_PRESENTATION: Record<AcStrand, {
  realm: string;
  icon: LucideIcon;
  poster: string;
  card: string;
  iconBox: string;
  accent: string;
  progress: string;
  button: string;
  ring: string;
  assessmentRealmId: string;
}> = {
  number: {
    realm: "Number Nexus",
    icon: Hash,
    poster: "/images/tower-portal-number-nexus.jpg",
    card: "border-cyan-300/40 bg-gradient-to-br from-cyan-400/15 to-teal-500/5",
    iconBox: "bg-cyan-300 text-cyan-950",
    accent: "text-cyan-300",
    progress: "bg-gradient-to-r from-cyan-300 to-teal-300",
    button: "bg-cyan-300 hover:bg-cyan-200 focus-visible:outline-cyan-200",
    ring: "ring-cyan-300",
    assessmentRealmId: "number",
  },
  measurement: {
    realm: "Measurelands",
    icon: Ruler,
    poster: "/images/tower-portal-measurelands.jpg",
    card: "border-amber-300/40 bg-gradient-to-br from-amber-400/15 to-violet-500/10",
    iconBox: "bg-amber-300 text-amber-950",
    accent: "text-amber-300",
    progress: "bg-gradient-to-r from-amber-300 to-violet-400",
    button: "bg-amber-300 hover:bg-amber-200 focus-visible:outline-amber-200",
    ring: "ring-amber-300",
    assessmentRealmId: "measurement",
  },
  space: {
    realm: "Starpath",
    icon: Compass,
    poster: "/images/tower-portal-starpath.jpg",
    card: "border-blue-300/40 bg-gradient-to-br from-blue-400/15 to-indigo-500/5",
    iconBox: "bg-blue-300 text-blue-950",
    accent: "text-blue-300",
    progress: "bg-gradient-to-r from-blue-300 to-indigo-300",
    button: "bg-blue-300 hover:bg-blue-200 focus-visible:outline-blue-200",
    ring: "ring-blue-300",
    assessmentRealmId: "space",
  },
  statistics: {
    realm: "Statistica",
    icon: BarChart3,
    poster: "/images/tower-portal-statistica.jpg",
    card: "border-rose-300/40 bg-gradient-to-br from-rose-400/15 to-pink-500/5",
    iconBox: "bg-rose-300 text-rose-950",
    accent: "text-rose-300",
    progress: "bg-gradient-to-r from-rose-300 to-pink-300",
    button: "bg-rose-300 hover:bg-rose-200 focus-visible:outline-rose-200",
    ring: "ring-rose-300",
    assessmentRealmId: "statistics",
  },
  algebra: {
    realm: "Pattern Peaks",
    icon: Triangle,
    poster: "/images/tower-portal-pattern-peaks.jpg",
    card: "border-violet-300/40 bg-gradient-to-br from-violet-400/15 to-purple-500/5",
    iconBox: "bg-violet-300 text-violet-950",
    accent: "text-violet-300",
    progress: "bg-gradient-to-r from-violet-300 to-purple-300",
    button: "bg-violet-300 hover:bg-violet-200 focus-visible:outline-violet-200",
    ring: "ring-violet-300",
    assessmentRealmId: "pattern",
  },
  probability: {
    realm: "Chance Hollow",
    icon: Dices,
    poster: "/images/tower-portal-chance-hollow.jpg",
    card: "border-fuchsia-300/40 bg-gradient-to-br from-fuchsia-400/15 to-purple-500/5",
    iconBox: "bg-fuchsia-300 text-fuchsia-950",
    accent: "text-fuchsia-300",
    progress: "bg-gradient-to-r from-fuchsia-300 to-pink-300",
    button: "bg-fuchsia-300 hover:bg-fuchsia-200 focus-visible:outline-fuchsia-200",
    ring: "ring-fuchsia-300",
    assessmentRealmId: "chance",
  },
};
