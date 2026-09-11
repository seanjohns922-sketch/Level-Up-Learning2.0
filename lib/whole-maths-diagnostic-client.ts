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
  active_level?: string | null;
  answered_count?: number;
  measured_level: number | null;
  recommended_level: string | null;
  placement_applied: boolean;
  placement_protected?: boolean;
  probe_direction?: "up" | "down" | null;
  source_assessment_id?: string | null;
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
  active_level: string | null;
  draft_answers: Record<string, string>;
  draft_probes: DiagnosticProbeScore[];
  draft_index: number;
  access_open: boolean;
};

export type LiveMathsProgressionRow = {
  student_id: string;
  realm_id: "number" | "measurement" | "space" | "statistics" | "pattern" | "chance";
  strand: "number" | "measurement" | "space" | "statistics" | "algebra" | "probability";
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

export type DiagnosticSchoolSession = {
  id: string;
  checkpoint: "start" | "mid" | "end";
  opened_at: string;
  closes_at: string;
};

export type StudentDiagnosticJourneyRow = {
  strand: AcStrand;
  status: "pending" | "completed" | "unavailable";
  starting_level: string;
  active_level: string;
  answered_count: number;
  measured_level: number | null;
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
  const sittingId = String(data);
  const { error: adoptionError } = await supabase.rpc("teacher_adopt_recent_diagnostic_assessments", {
    p_sitting_id: sittingId,
  });
  if (adoptionError) rpcError(adoptionError, "The diagnostic was assigned, but recent assessment evidence could not be checked.");
  return sittingId;
}

export async function fetchDiagnosticSchoolSession(classId: string) {
  const { data, error } = await supabase.rpc("get_teacher_whole_math_diagnostic_session", { p_class_id: classId });
  if (error) rpcError(error, "Could not load the supervised diagnostic session.");
  const row = Array.isArray(data) ? data[0] : data;
  return row ? row as DiagnosticSchoolSession : null;
}

export async function openDiagnosticSchoolSession(
  classId: string,
  checkpoint: "start" | "mid" | "end",
  durationMinutes = 120,
) {
  const { data, error } = await supabase.rpc("teacher_open_whole_math_diagnostic_session", {
    p_class_id: classId,
    p_checkpoint: checkpoint,
    p_duration_minutes: durationMinutes,
  });
  if (error) rpcError(error, "Could not open the supervised diagnostic session.");
  return String(data);
}

export async function closeDiagnosticSchoolSession(classId: string) {
  const { error } = await supabase.rpc("teacher_close_whole_math_diagnostic_session", { p_class_id: classId });
  if (error) rpcError(error, "Could not close the supervised diagnostic session.");
}

export async function fetchPendingStudentDiagnostic(studentId: string, includeClosed = false) {
  const { data, error } = await supabase.rpc("get_pending_whole_math_diagnostic", {
    p_student_id: studentId,
  });
  if (error) rpcError(error, "Could not load the diagnostic.");
  const row = Array.isArray(data) ? data[0] : data;
  const pending = row ? (row as PendingStudentDiagnostic) : null;
  return pending && (includeClosed || pending.access_open) ? pending : null;
}

export async function fetchStudentDiagnosticJourney(studentId: string) {
  const { data, error } = await supabase.rpc("get_student_whole_math_diagnostic_journey", { p_student_id: studentId });
  if (error) rpcError(error, "Could not load diagnostic progress.");
  return (Array.isArray(data) ? data : []) as StudentDiagnosticJourneyRow[];
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

export async function saveDiagnosticProgress(
  studentId: string,
  sittingId: string,
  strand: AcStrand,
  activeLevel: string,
  answers: Record<string, string>,
  probes: DiagnosticProbeScore[],
  questionIndex: number,
) {
  const { error } = await supabase.rpc("save_whole_math_diagnostic_progress", {
    p_student_id: studentId,
    p_sitting_id: sittingId,
    p_strand: strand,
    p_active_level: activeLevel,
    p_answers: answers,
    p_probe_scores: probes,
    p_question_index: questionIndex,
  });
  if (error) rpcError(error, "Could not save diagnostic progress.");
}
