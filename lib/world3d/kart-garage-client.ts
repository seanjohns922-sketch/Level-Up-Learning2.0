import { supabase } from "@/lib/supabase";
import { KART_REALMS } from "./kart-garage";

/** The realms where the learner has finished a level, which unlocks that realm's kart.
 * Demo mode has every kart, like every other world object. */
export async function fetchFinishedRealms(studentId: string | null, demo: boolean): Promise<Set<string>> {
  if (demo) return new Set(KART_REALMS);
  if (!studentId) return new Set();
  const { data, error } = await supabase.rpc("get_student_finished_realms_secure", { p_student_id: studentId });
  if (error) throw error;
  return new Set(Array.isArray(data) ? data.filter((realm): realm is string => typeof realm === "string") : []);
}
