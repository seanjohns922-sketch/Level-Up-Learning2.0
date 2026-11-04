export type ChronorokCard = { id: string; grade: string; name: string; images: { avatar: string; cardFront: string; cardBack: string }; unlockVideoUrl: string | null; showcaseVideoUrl: string | null };

/** Approved grade-specific cards. Video slots intentionally empty until supplied. */
export const CHRONOROK_CARDS: readonly ChronorokCard[] = [
  {
    "id": "chronorok-spark-y0",
    "grade": "Prep",
    "name": "Chronorok Spark",
    "images": {
      "avatar": "/guides/chronorok-2026-11-04-v1/chronorok-spark-y0.png",
      "cardFront": "/cards/chronorok-2026-11-04-v1/chronorok-spark-y0-front.webp",
      "cardBack": "/cards/chronorok-2026-11-04-v1/back.webp"
    },
    "unlockVideoUrl": null,
    "showcaseVideoUrl": null
  },
  {
    "id": "chronorok-ember-y1",
    "grade": "Year 1",
    "name": "Chronorok Ember",
    "images": {
      "avatar": "/guides/chronorok-2026-11-04-v1/chronorok-ember-y1.png",
      "cardFront": "/cards/chronorok-2026-11-04-v1/chronorok-ember-y1-front.webp",
      "cardBack": "/cards/chronorok-2026-11-04-v1/back.webp"
    },
    "unlockVideoUrl": null,
    "showcaseVideoUrl": null
  },
  {
    "id": "chronorok-pulse-y2",
    "grade": "Year 2",
    "name": "Chronorok Pulse",
    "images": {
      "avatar": "/guides/chronorok-2026-11-04-v1/chronorok-pulse-y2.png",
      "cardFront": "/cards/chronorok-2026-11-04-v1/chronorok-pulse-y2-front.webp",
      "cardBack": "/cards/chronorok-2026-11-04-v1/back.webp"
    },
    "unlockVideoUrl": null,
    "showcaseVideoUrl": null
  },
  {
    "id": "chronorok-current-y3",
    "grade": "Year 3",
    "name": "Chronorok Current",
    "images": {
      "avatar": "/guides/chronorok-2026-11-04-v1/chronorok-current-y3.png",
      "cardFront": "/cards/chronorok-2026-11-04-v1/chronorok-current-y3-front.webp",
      "cardBack": "/cards/chronorok-2026-11-04-v1/back.webp"
    },
    "unlockVideoUrl": null,
    "showcaseVideoUrl": null
  },
  {
    "id": "chronorok-rift-y4",
    "grade": "Year 4",
    "name": "Chronorok Rift",
    "images": {
      "avatar": "/guides/chronorok-2026-11-04-v1/chronorok-rift-y4.png",
      "cardFront": "/cards/chronorok-2026-11-04-v1/chronorok-rift-y4-front.webp",
      "cardBack": "/cards/chronorok-2026-11-04-v1/back.webp"
    },
    "unlockVideoUrl": null,
    "showcaseVideoUrl": null
  },
  {
    "id": "chronorok-blaze-y5",
    "grade": "Year 5",
    "name": "Chronorok Blaze",
    "images": {
      "avatar": "/guides/chronorok-2026-11-04-v1/chronorok-blaze-y5.png",
      "cardFront": "/cards/chronorok-2026-11-04-v1/chronorok-blaze-y5-front.webp",
      "cardBack": "/cards/chronorok-2026-11-04-v1/back.webp"
    },
    "unlockVideoUrl": null,
    "showcaseVideoUrl": null
  },
  {
    "id": "chronorok-eternal-y6",
    "grade": "Year 6",
    "name": "Chronorok Eternal",
    "images": {
      "avatar": "/guides/chronorok-2026-11-04-v1/chronorok-eternal-y6.png",
      "cardFront": "/cards/chronorok-2026-11-04-v1/chronorok-eternal-y6-front.webp",
      "cardBack": "/cards/chronorok-2026-11-04-v1/back.webp"
    },
    "unlockVideoUrl": null,
    "showcaseVideoUrl": null
  }
];

export const CHRONOROK_VIDEOS: { arrival: string | null; portal: string | null } = { arrival: null, portal: null };
