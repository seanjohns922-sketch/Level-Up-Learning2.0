"use client";

import type { AcStrand } from "@/lib/curriculum/ac-standards";
import type {
  DiagnosticCheckpoint,
  DiagnosticFlag,
  DiagnosticProbeScore,
} from "@/lib/whole-maths-diagnostic";
import { supabase } from "@/lib/supabase";

export type DiagnosticStrandResultRow = {
  strand: AcStrand;
  status: "pending" | "completed" | "unavailable";
  starting_level: string | null;
  measured_level: number | null;
  recommended_level: string | null;
  placement_applied: boolean;
  flag: DiagnosticFlag;
  probe_scores: DiagnosticProbeScore[];
  curriculum_codes: string[];
};

export type TeacherDiagnosticSittingRow = {
  id: string;
  student_id: string;
  checkpoint: DiagnosticCheckpoint;
  status: "assigned" | "in_progress" | "completed";
  overall_level: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  strand_results: DiagnosticStrandResultRow[];
};

export type PendingStudentDiagnostic = {
  sitting_id: string;
  checkpoint: DiagnosticCheckpoint;
  strand: AcStrand;
  starting_level: string;
  status: "assigned" | "in_progress";
};

export type LiveMathsProgressionRow = {
  student_id: string;
  realm_id: "number" | "measurement" | "space" | "statistics";
  strand: "number" | "measurement" | "space" | "statistics";
  current_working_level: string;
  official_level: number | null;
  official_at: string | null;
  checkpoint_level: number;
  checkpoint_source: "diagnostic" | "pretest" | "posttest" | "placement";
  checkpoint_at: string;
  predicted_level: number;
  prediction_confidence: number;
  evidence: {
    passedQuizWeeks?: number;
    completedUnconfirmedLessons?: number;
    confirmedWeekEquivalents?: number;
    totalWeeks?: number;
  };
  updated_at: string;
};

function rpcError(error: { message?: string } | null, fallback: string): never {
  throw new Error(error?.message || fallback);
}

export async function fetchTeacherDiagnostics(classId: string) {
  const { data, error } = await supabase.rpc("get_teacher_whole_math_diagnostics", {
    p_class_id: classId,
  });
  if (error) rpcError(error, "Could not load diagnostics.");
  return (Array.isArray(data) ? data : []) as TeacherDiagnosticSittingRow[];
}

export async function fetchTeacherLiveMathsProgression(classId: string) {
  const { data, error } = await supabase.rpc("get_teacher_live_maths_progression", {
    p_class_id: classId,
  });
  if (error) rpcError(error, "Could not load live maths progression.");
  return (Array.isArray(data) ? data : []) as LiveMathsProgressionRow[];
}

export async function assignWholeMathsDiagnostic(
  studentId: string,
  checkpoint: DiagnosticCheckpoint,
  strands: AcStrand[],
) {
  const { data, error } = await supabase.rpc("teacher_start_whole_math_diagnostic", {
    p_student_id: studentId,
    p_checkpoint: checkpoint,
    p_strands: strands,
  });
  if (error) rpcError(error, "Could not assign the diagnostic.");
  return String(data);
}

export async function fetchPendingStudentDiagnostic(studentId: string) {
  const { data, error } = await supabase.rpc("get_pending_whole_math_diagnostic", {
    p_student_id: studentId,
  });
  if (error) rpcError(error, "Could not load the diagnostic.");
  const row = Array.isArray(data) ? data[0] : data;
  return row ? (row as PendingStudentDiagnostic) : null;
}

export async function completeDiagnosticStrand(
  studentId: string,
  sittingId: string,
  strand: AcStrand,
  probes: DiagnosticProbeScore[],
) {
  const { data, error } = await supabase.rpc("complete_whole_math_diagnostic_strand", {
    p_student_id: studentId,
    p_sitting_id: sittingId,
    p_strand: strand,
    p_probe_scores: probes,
  });
  if (error) rpcError(error, "Could not save the diagnostic strand.");
  return data as {
    sitting_complete: boolean;
    measured_level: number;
    recommended_level: string;
    placement_applied: boolean;
    flag: DiagnosticFlag;
  };
}
