import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/src/integrations/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://etceutkpdnkltkgccjoe.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y2V1dGtwZG5rbHRrZ2Njam9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDY1NTksImV4cCI6MjA4NzYyMjU1OX0.gTIJjfoAQShi7CxFAXrkQEVUzvjHI8k3kbx5rwL3CgA";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
