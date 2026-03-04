import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://etceutkpdnkltkgccjoe.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y2V1dGtwZG5rbHRrZ2Njam9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDY1NTksImV4cCI6MjA4NzYyMjU1OX0.gTIJjfoAQShi7CxFAXrkQEVUzvjHI8k3kbx5rwL3CgA"
);
