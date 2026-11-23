import type { NextConfig } from "next";
// Fail before serving development pages, including routes without data imports.
import "./lib/supabase-config";

// The 2D realm maps, realm carousel and classic home are retired: the 3D world
// is the only student world. Their old addresses (bookmarks, history, any link
// not yet updated) land in the matching 3D place. The query string carries
// through, so ?level= and ?teacher_preview=1 still apply.
const RETIRED_2D_ROUTES: Record<string, string> = {
  "/realms": "/world/tower",
  "/levels": "/world/tower",
  "/tower": "/world/tower",
  "/tower-map": "/world/tower",
  "/realm-stats": "/world/tower",
  "/home-base": "/world/treehouse",
  "/my-realmies": "/world/treehouse",
  "/number-nexus": "/world/number-nexus",
  "/measurelands": "/world/measurelands",
  "/starpath": "/world/starpath",
  "/pattern-peaks": "/world/pattern-peaks",
  "/statistica": "/world/statistica",
  "/chance-hollow": "/world/chance-hollow",
};

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(RETIRED_2D_ROUTES).map(([source, destination]) => ({ source, destination, permanent: false }));
  },
  turbopack: {
    root: __dirname,
  },
  webpack(config, { dev }) {
    // Production builds skip webpack's on-disk cache. The cache restored from
    // earlier deploys had grown past 4 GB, and loading it at the start of a
    // build ran Vercel's 7 GB build machine out of memory. Dev keeps its cache.
    if (!dev) config.cache = false;
    return config;
  },
};

export default nextConfig;
