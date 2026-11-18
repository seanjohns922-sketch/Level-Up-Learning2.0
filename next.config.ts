import type { NextConfig } from "next";
// Fail before serving development pages, including routes without data imports.
import "./lib/supabase-config";

const nextConfig: NextConfig = {
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
