// Public connection settings shared by browser and server callers. Never put a
// service-role key here: these values are bundled into the browser application.
const productionUrl = "https://dqncplrxjxvjqbmwcyia.supabase.co";
const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (configuredUrl && new URL(configuredUrl).hostname !== new URL(productionUrl).hostname && !configuredKey) {
  throw new Error("A non-production Supabase URL requires its own NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

export const SUPABASE_URL = (configuredUrl || productionUrl).replace(/\/$/, "");
export const SUPABASE_PUBLISHABLE_KEY = configuredKey || "sb_publishable_cvaUEdcS16I8T3EqAydiaA_ES8XRgOo";
export const SUPABASE_PROJECT_REF = new URL(SUPABASE_URL).hostname.split(".")[0];

if (process.env.NEXT_PUBLIC_APP_ENV === "staging" &&
    (!configuredUrl || !configuredKey || new URL(SUPABASE_URL).hostname === new URL(productionUrl).hostname)) {
  throw new Error("Staging must use an explicit non-production Supabase URL and public key.");
}
