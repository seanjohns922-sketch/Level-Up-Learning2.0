export type Week3Container = {
  id: string;
  label: string;
  icon: string;
  imageSrc: string;
  capacity: number;
};

export const WEEK3_CONTAINERS = {
  cup: {
    id: "cup",
    label: "Cup",
    icon: "🥤",
    imageSrc: "/images/measurelands/containers/cup.png",
    capacity: 1,
  },
  mug: {
    id: "mug",
    label: "Mug",
    icon: "☕",
    imageSrc: "/images/measurelands/containers/mug.png",
    capacity: 2,
  },
  bottle: {
    id: "bottle",
    label: "Bottle",
    icon: "🧴",
    imageSrc: "/images/measurelands/containers/bottle.png",
    capacity: 3,
  },
  lunchbox: {
    id: "lunchbox",
    label: "Lunchbox",
    icon: "🍱",
    imageSrc: "/images/measurelands/containers/lunchbox.png",
    capacity: 4,
  },
  jug: {
    id: "jug",
    label: "Jug",
    icon: "🏺",
    imageSrc: "/images/measurelands/containers/jug.png",
    capacity: 5,
  },
  kettle: {
    id: "kettle",
    label: "Kettle",
    icon: "🫖",
    imageSrc: "/images/measurelands/containers/kettle.png",
    capacity: 6,
  },
  wateringCan: {
    id: "watering-can",
    label: "Watering Can",
    icon: "🫗",
    imageSrc: "/images/measurelands/containers/watering-can.png",
    capacity: 7,
  },
  bucket: {
    id: "bucket",
    label: "Bucket",
    icon: "🪣",
    imageSrc: "/images/measurelands/containers/bucket.png",
    capacity: 8,
  },
  fishTank: {
    id: "fish-tank",
    label: "Fish Tank",
    icon: "🐠",
    imageSrc: "/images/measurelands/containers/fish-tank.png",
    capacity: 9,
  },
  bathtub: {
    id: "bathtub",
    label: "Bathtub",
    icon: "🛁",
    imageSrc: "/images/measurelands/containers/bathtub.png",
    capacity: 10,
  },
} as const satisfies Record<string, Week3Container>;
