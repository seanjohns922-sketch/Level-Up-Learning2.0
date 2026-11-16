import type { NextConfig } from "next";
// Fail before serving development pages, including routes without data imports.
import "./lib/supabase-config";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
