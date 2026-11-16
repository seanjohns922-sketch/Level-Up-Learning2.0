// Public connection settings shared by browser and server callers. Never put a
// service-role key here: these values are bundled into the browser application.
const productionUrl = "https://dqncplrxjxvjqbmwcyia.supabase.co";
const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
// NODE_ENV is replaced in browser builds by Next.js. Keep these accesses static
// so the browser and server enforce the same destination guard.
const isolatedEnvironment = process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_APP_ENV === "development" ||
  process.env.NEXT_PUBLIC_APP_ENV === "staging";

if (isolatedEnvironment && (!configuredUrl || !configuredKey)) {
  throw new Error("Local development and staging require NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for an approved non-production project. See README.md: Development.");
}

if (isolatedEnvironment && configuredUrl &&
    new URL(configuredUrl).hostname === new URL(productionUrl).hostname) {
  throw new Error("Local development and staging cannot use the production Supabase project. Use an approved test project with synthetic data.");
}

if (configuredUrl && new URL(configuredUrl).hostname !== new URL(productionUrl).hostname && !configuredKey) {
  throw new Error("A non-production Supabase URL requires its own NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

export const SUPABASE_URL = (configuredUrl || productionUrl).replace(/\/$/, "");
export const SUPABASE_PUBLISHABLE_KEY = configuredKey || "sb_publishable_cvaUEdcS16I8T3EqAydiaA_ES8XRgOo";
export const SUPABASE_PROJECT_REF = new URL(SUPABASE_URL).hostname.split(".")[0];
