"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dqncplrxjxvjqbmwcyia.supabase.co";
const supabaseAnonKey = "sb_publishable_cvaUEdcS16I8T3EqAydiaA_ES8XRgOo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
