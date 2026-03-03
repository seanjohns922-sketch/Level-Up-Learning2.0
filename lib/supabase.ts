import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://etceutkpdnkltkgccjoe.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y2V1dGtwZG5rbHRrZ2Njam9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDY1NTksImV4cCI6MjA4NzYyMjU1OX0.gTIJjfoAQShi7CxFAXrkQEVUzvjHI8k3kbx5rwL3CgA";

console.log("Connected Supabase URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
