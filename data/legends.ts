export type LegendStats = {
  calculation: number;
  speed: number;
  accuracy: number;
};

export type LegendImages = {
  avatar: string;     // small icon/character image (can be same as front)
  cardFront: string;  // front of collectible card
  cardBack: string;   // back of collectible card
};

export type Legend = {
  id: string;
  yearLabel: string;  // "Prep", "Year 1" ... "Year 6"
  strand: "Number";   // keep simple for MVP
  name: string;
  description: string;

  stars: number;      // 1-5
  stats: LegendStats; // calc/speed/accuracy

  images: LegendImages;
};

// Helpers
const DEFAULT_AVATAR = "/cards/numbot-solver-y4-front.png"; // safe fallback
const DEFAULT_BACK = "/cards/numbot-solver-y4-back.png";

const LEGENDS: Legend[] = [
  // ✅ Your new real card
  {
    id: "numbot-solver-y4",
    yearLabel: "Year 4",
    strand: "Number",
    name: "Numbot Solver",
    description: "Solves multi-step number problems using efficient strategies and precision.",
    stars: 4,
    stats: { calculation: 65, speed: 70, accuracy: 60 },
    images: {
      avatar: "/cards/numbot-solver-y4-front.png",
      cardFront: "/cards/numbot-solver-y4-front.png",
      cardBack: "/cards/numbot-solver-y4-back.png",
    },
  },

  // --- Placeholders for other years (so the app doesn’t break) ---
  {
    id: "numbot-bouncer-prep",
    yearLabel: "Prep",
    strand: "Number",
    name: "Numbot Bouncer",
    description: "Foundation number champion in training.",
    stars: 0.5,
    stats: { calculation: 35, speed: 30, accuracy: 40 },
    images: {
      avatar: "/cards/numbot-bouncer-y0-front.png",
      cardFront: "/cards/numbot-bouncer-y0-front.png",
      cardBack: "/cards/numbot-bouncer-y0-back.png",
    },
  },
  {
    id: "numbot-counter-y1",
    yearLabel: "Year 1",
    strand: "Number",
    name: "Numbot Counter",
    description: "Counts, orders, and groups with confidence.",
    stars: 1,
    stats: { calculation: 40, speed: 40, accuracy: 45 },
    images: {
      avatar: "/cards/numbot-counter-y1-front.png",
      cardFront: "/cards/numbot-counter-y1-front.png",
      cardBack: "/cards/numbot-counter-y1-back.png",
    },
  },
  {
    id: "numbot-builder-y2",
    yearLabel: "Year 2",
    strand: "Number",
    name: "Numbot Builder",
    description: "Builds strategies and partitions numbers efficiently.",
    stars: 3,
    stats: { calculation: 50, speed: 50, accuracy: 50 },
    images: {
      avatar: "/cards/numbot-builder-y2-front.png",
      cardFront: "/cards/numbot-builder-y2-front.png",
      cardBack: "/cards/numbot-builder-y2-back.png",
    },
  },
  {
    id: "numbot-processor-y3",
    yearLabel: "Year 3",
    strand: "Number",
    name: "Numbot Processor",
    description: "Processes number tasks quickly with growing accuracy.",
    stars: 3,
    stats: { calculation: 55, speed: 60, accuracy: 55 },
    images: {
      avatar: "/cards/numbot-processor-y3-front.png",
      cardFront: "/cards/numbot-processor-y3-front.png",
      cardBack: "/cards/numbot-processor-y3-back.png",
    },
  },
  {
    id: "numbot-calculator-y5",
    yearLabel: "Year 5",
    strand: "Number",
    name: "Numbot Calculator",
    description: "Calculates efficiently and explains strategies clearly.",
    stars: 4,
    stats: { calculation: 75, speed: 70, accuracy: 75 },
    images: {
      avatar: "/cards/numbot-calculator-y5-front.png",
      cardFront: "/cards/numbot-calculator-y5-front.png",
      cardBack: "/cards/numbot-calculator-y5-back.png",
    },
  },
  {
    id: "numbot-equationator-y6",
    yearLabel: "Year 6",
    strand: "Number",
    name: "Numbot Equationator",
    description: "Masters complex number thinking and equations.",
    stars: 5,
    stats: { calculation: 85, speed: 80, accuracy: 85 },
    images: {
      avatar: "/cards/numbot-equationator-y6-front.png",
      cardFront: "/cards/numbot-equationator-y6-front.png",
      cardBack: "/cards/numbot-equationator-y6-back.png",
    },
  },
];

// ✅ Keep the functions your app likely expects
export function getAllLegends(): Legend[] {
  return LEGENDS;
}

export function getLegendForYear(yearLabel: string): Legend {
  const found = LEGENDS.find((l) => l.yearLabel === yearLabel);
  return (
    found ?? {
      id: "unknown-legend",
      yearLabel,
      strand: "Number",
      name: "Unknown Legend",
      description: "Legend data missing for this year.",
      stars: 1,
      stats: { calculation: 0, speed: 0, accuracy: 0 },
      images: { avatar: DEFAULT_AVATAR, cardFront: DEFAULT_AVATAR, cardBack: DEFAULT_BACK },
    }
  );
}
