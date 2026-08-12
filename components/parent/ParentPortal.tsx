"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Home,
  KeyRound,
  LogOut,
  School,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export type ParentRealm = {
  realmId: string;
  workingLevel: string;
  currentWeek: number | null;
  requiredWeeks: number[];
  optionalWeeks: number[];
  status: string;
  currentFocus: string | null;
  requiredCompleted: number;
};

export type ParentChild = {
  studentId: string;
  displayName: string;
  firstName: string;
  yearLevel: string | null;
  explorerCode: string | null;
  schoolName: string | null;
  lastActiveAt: string | null;
  homeAccess: boolean;
  billingStatus: string | null;
  realms: ParentRealm[];
  recentAchievements: Array<{ name: string; earnedAt: string; rarity: string }>;
};

type LessonResult = {
  lesson: number;
  lessonName: string;
  focus: string | null;
  correct: number;
  attempted: number;
  accuracy: number;
  attempts: number;
  status: string;
};

type QuizResult = {
  correct: number;
  attempted: number;
  accuracy: number;
  attempts: number;
  status: string;
};

type WeekResult = {
  week: number;
  required: boolean;
  focus: string | null;
  lessons: LessonResult[];
  quiz: QuizResult | null;
};

type AssessmentResult = {
  id: string;
  type: string;
  correct: number;
  attempted: number;
  score: number;
  status: string;
  completedAt: string;
};

type RealmSnapshot = {
  studentId: string;
  displayName: string;
  realmId: string;
  placementStatus: string;
  current: {
    workingLevel: string;
    currentWeek: number | null;
    status: string;
    requiredWeeks: number[];
    optionalWeeks: number[];
    currentFocus: string | null;
  } | null;
  weeks: WeekResult[];
  assessments: AssessmentResult[];
  passThreshold: number;
};

function realmName(realmId: string) {
  return ({
    number: "Number Nexus",
    measurement: "Measurelands",
    space: "Starpath",
    starpath: "Starpath",
    statistica: "Statistica",
    "pattern-peaks": "Pattern Peaks",
    "chance-hollow": "Chance Hollow",
  } as Record<string, string>)[realmId] ?? realmId;
}

function formatLastActive(value: string | null) {
  if (!value) return "Learning has not started yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Activity recorded";
  return `Last active ${new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)}`;
}

function assessmentName(type: string) {
  const normalised = type.toLowerCase().replaceAll("_", " ");
  if (normalised.includes("pre")) return "Pre-Test";
  if (normalised.includes("post")) return "Post-Test";
  return normalised.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ParentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-950">
      <header className="border-b border-emerald-950/10 bg-[#083c35] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/parent" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-300 text-emerald-950">
              <Home className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">Level Up Learning</span>
              <span className="font-bold">Parent Home</span>
            </span>
          </Link>
          <button type="button" onClick={signOut} className="grid h-11 w-11 place-items-center rounded-md border border-white/20" aria-label="Sign out">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>
      {pathname !== "/parent" && pathname !== "/parent/children" ? (
        <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
          <Link href="/parent" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-emerald-800">
            <ArrowLeft className="h-4 w-4" /> Parent Home
          </Link>
        </div>
      ) : null}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

export function ParentHome({ selectedStudentId }: { selectedStudentId?: string }) {
  const router = useRouter();
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.replace("/login");
      return;
    }
    const { data, error: loadError } = await supabase.rpc("get_parent_home_snapshot");
    if (loadError) setError("Parent Home could not be loaded. Please try again.");
    else setChildren((data as { children?: ParentChild[] } | null)?.children ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (loading) return <ParentSkeleton />;
  if (error) return <Notice message={error} />;

  const visibleChildren = selectedStudentId
    ? children.filter((child) => child.studentId === selectedStudentId)
    : children;
  if (selectedStudentId && visibleChildren.length === 0) {
    return <Notice message="This child is not linked to your Parent account." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Parent overview</p>
          <h1 className="mt-1 text-3xl font-black">{selectedStudentId ? visibleChildren[0]?.displayName : "Your children"}</h1>
          <p className="mt-2 text-slate-600">Clear, read-only progress from the child’s learning record.</p>
        </div>
        {!selectedStudentId ? (
          <Link href="/parent/link-child" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-700 px-4 font-bold text-white">
            <UserPlus className="h-5 w-5" /> Link a child
          </Link>
        ) : null}
      </div>

      {children.length === 0 ? (
        <section className="border border-slate-200 bg-white p-7 shadow-sm">
          <KeyRound className="h-8 w-8 text-emerald-700" />
          <h2 className="mt-4 text-xl font-black">Link your child to get started</h2>
          <p className="mt-2 max-w-xl text-slate-600">Use the child’s permanent Explorer Code. You will confirm limited identity details before linking.</p>
          <Link href="/parent/link-child" className="mt-5 inline-flex min-h-11 items-center rounded-md bg-emerald-700 px-4 font-bold text-white">Link Child</Link>
        </section>
      ) : (
        <div className={selectedStudentId ? "max-w-3xl" : "grid gap-5 md:grid-cols-2"}>
          {visibleChildren.map((child) => <ChildCard key={child.studentId} child={child} onActivated={load} showOpen={!selectedStudentId} />)}
        </div>
      )}
    </div>
  );
}

function ChildCard({ child, onActivated, showOpen }: { child: ParentChild; onActivated: () => Promise<void>; showOpen: boolean }) {
  const [activating, setActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  async function activate() {
    setActivating(true);
    setActivationError(null);
    const { error } = await supabase.rpc("activate_free_home_access", { p_student_id: child.studentId });
    if (error) setActivationError("Home Access could not be activated. Please try again.");
    else await onActivated();
    setActivating(false);
  }

  return (
    <article className="border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-100 text-lg font-black text-emerald-900" aria-hidden="true">
            {child.firstName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-black">{child.displayName}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><School className="h-4 w-4" /> {child.schoolName ?? "Home learner"}</p>
            <p className="text-sm text-slate-500">{child.yearLevel ?? "Year level not set"} · {formatLastActive(child.lastActiveAt)}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-bold ${child.homeAccess ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
          {child.homeAccess ? "Active — Free Access" : "Home Access not active"}
        </span>
      </div>

      {!child.homeAccess ? (
        <div className="mt-4 border-l-4 border-amber-400 bg-amber-50 p-3 text-sm">
          <p className="font-bold text-amber-950">Home Access is not active.</p>
          <p className="mt-1 text-amber-900">Parent linking is complete. Free Home access can be activated separately during the 2026 rollout.</p>
          <button type="button" disabled={activating} onClick={activate} className="mt-2 min-h-11 font-bold text-emerald-800 underline">
            {activating ? "Activating…" : "Activate free 2026 Home access"}
          </button>
          {activationError ? <p className="mt-2 font-bold text-red-700">{activationError}</p> : null}
        </div>
      ) : null}

      <div className="mt-5 space-y-2">
        {child.realms.length ? child.realms.map((realm) => (
          <Link key={realm.realmId} href={`/parent/children/${child.studentId}/realm/${realm.realmId}`} className="flex min-h-16 items-center justify-between rounded-md border border-slate-200 px-3 hover:border-emerald-400">
            <span>
              <span className="block font-bold">{realmName(realm.realmId)}</span>
              <span className="text-sm text-slate-500">{realm.workingLevel}{realm.currentWeek ? ` · Week ${realm.currentWeek}` : ""}</span>
              <span className="mt-1 block text-sm text-slate-600">{realm.currentFocus ?? "Current focus not available"} · {realm.requiredCompleted} required weeks completed</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
          </Link>
        )) : <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">Learning hasn’t started yet.</p>}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><Sparkles className="h-4 w-4" /> Recent achievements</p>
        <p className="mt-2 text-sm font-semibold text-slate-700">
          {child.recentAchievements.length ? child.recentAchievements.map((item) => item.name).join(" · ") : "No recent achievements yet."}
        </p>
      </div>
      {showOpen ? <Link href={`/parent/children/${child.studentId}`} className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-emerald-800">Open child overview <ChevronRight className="h-4 w-4" /></Link> : null}
    </article>
  );
}

export function LinkChild() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [relationship, setRelationship] = useState("guardian");
  const [studentPin, setStudentPin] = useState("");
  const [preview, setPreview] = useState<{ firstName: string; lastInitial: string | null; yearLevel: string | null; schoolName: string | null; alreadyLinked: boolean } | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify() {
    setWorking(true);
    setError(null);
    setPreview(null);
    const { data, error: rpcError } = await supabase.rpc("preview_parent_child_link", { p_explorer_code: code });
    if (rpcError || !data || data.matched !== true) setError("That Explorer Code could not be verified. Check the code and try again.");
    else setPreview(data as typeof preview);
    setWorking(false);
  }

  async function confirm() {
    if (preview?.alreadyLinked) {
      router.replace("/parent");
      return;
    }
    setWorking(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("confirm_parent_child_link", {
      p_explorer_code: code,
      p_student_pin: studentPin,
      p_relationship: relationship,
    });
    if (rpcError || !data || data.linked !== true) {
      setError("The child details could not be verified. Check the PIN and try again.");
      setWorking(false);
      return;
    }
    router.replace("/parent");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Identity linking</p>
      <h1 className="mt-2 text-3xl font-black">Link a child</h1>
      <p className="mt-2 text-slate-600">Enter the permanent Explorer Code. Progress, rewards and school history stay on the same student identity.</p>
      {!preview ? (
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold">Explorer Code</span>
            <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 13))} placeholder="LUL-ABCD-2345" className="mt-2 h-14 w-full rounded-md border border-slate-300 px-4 font-mono text-lg font-black uppercase tracking-wider outline-none focus:border-emerald-600" />
          </label>
          <button type="button" onClick={verify} disabled={working || code.replace(/-/g, "").length < 11} className="min-h-11 rounded-md bg-emerald-700 px-5 font-bold text-white disabled:bg-slate-300">{working ? "Checking…" : "Check code"}</button>
        </div>
      ) : (
        <div className="mt-6 border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 font-bold text-emerald-900"><ShieldCheck className="h-5 w-5" /> Is this your child?</div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div><dt className="text-xs font-bold uppercase text-slate-500">Child</dt><dd className="mt-1 text-lg font-black">{preview.firstName}{preview.lastInitial ? ` ${preview.lastInitial}.` : ""}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-slate-500">Year level</dt><dd className="mt-1 text-lg font-black">{preview.yearLevel ?? "Not set"}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-slate-500">School</dt><dd className="mt-1 font-bold">{preview.schoolName ?? "Home learner"}</dd></div>
          </dl>
          <label className="mt-4 block">
            <span className="text-sm font-bold">Relationship</span>
            <select value={relationship} onChange={(event) => setRelationship(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3">
              <option value="guardian">Parent or guardian</option><option value="carer">Carer</option><option value="family">Family member</option>
            </select>
          </label>
          {!preview.alreadyLinked ? <label className="mt-4 block">
            <span className="text-sm font-bold">Child&apos;s 4-digit access code</span>
            <span className="mt-1 block text-sm text-slate-600">This second check protects the child if an Explorer Code is shared or seen by someone else.</span>
            <input inputMode="numeric" autoComplete="one-time-code" value={studentPin} onChange={(event) => setStudentPin(event.target.value.replace(/\D/g, "").slice(0, 4))} className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-center font-mono text-xl font-black tracking-[0.3em] outline-none focus:border-emerald-600" aria-label="Child's 4-digit access code" />
          </label> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={confirm} disabled={working || (!preview.alreadyLinked && studentPin.length !== 4)} className="min-h-11 rounded-md bg-emerald-700 px-5 font-bold text-white disabled:bg-slate-300">{working ? "Linking…" : preview.alreadyLinked ? "Return to Parent Home" : "Confirm link"}</button>
            <button type="button" onClick={() => { setPreview(null); setStudentPin(""); }} className="min-h-11 rounded-md border border-slate-300 px-5 font-bold">Use another code</button>
          </div>
        </div>
      )}
      {error ? <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}
    </section>
  );
}

export function ParentRealmDetail({ studentId, realmId }: { studentId: string; realmId: string }) {
  const router = useRouter();
  const [data, setData] = useState<RealmSnapshot | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        router.replace("/login");
        return;
      }
      const result = await supabase.rpc("get_parent_child_realm_snapshot", { p_student_id: studentId, p_realm_id: realmId });
      if (result.error || !result.data) setError(true);
      else setData(result.data as RealmSnapshot);
    })();
  }, [realmId, router, studentId]);

  if (error) return <Notice message="This child or realm is not available to your account." />;
  if (!data) return <ParentSkeleton />;
  if (!data.current) {
    return <div className="space-y-4"><h1 className="text-3xl font-black">{realmName(realmId)}</h1><div className="border border-slate-200 bg-white p-6"><p className="text-lg font-bold">Not placed</p><p className="mt-2 text-slate-600">No progress is available for this child in this realm.</p></div></div>;
  }

  const completedRequired = data.weeks.filter((week) => week.required && (week.quiz?.status === "Completed" || week.lessons.some((lesson) => lesson.status === "Completed"))).length;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{data.displayName}</p>
        <h1 className="mt-1 text-3xl font-black">{realmName(realmId)}</h1>
        <p className="mt-2 text-slate-600">Read-only progress. Level mastery uses the same {data.passThreshold}% threshold as the learning program.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryMetric label="Current level" value={data.current.workingLevel} />
        <SummaryMetric label="Current week" value={data.current.currentWeek ? `Week ${data.current.currentWeek}` : "Not started"} />
        <SummaryMetric label="Current focus" value={data.current.currentFocus ?? "Not available"} />
        <SummaryMetric label="Required pathway" value={`${completedRequired} of ${data.current.requiredWeeks.length} weeks`} />
      </div>

      <section className="border border-slate-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-xl font-black"><BookOpen className="h-5 w-5 text-emerald-700" /> Weekly Journey</h2>
        <div className="mt-4 space-y-3">
          {data.weeks.length ? data.weeks.map((week) => <WeekCard key={week.week} week={week} currentWeek={data.current?.currentWeek ?? null} />) : <p className="text-slate-500">No weekly learning results have been recorded yet.</p>}
        </div>
      </section>

      <section className="border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black">Assessments</h2>
        <div className="mt-4 space-y-2">
          {data.assessments.length ? data.assessments.map((item) => (
            <div key={item.id} className="grid gap-2 border-b border-slate-100 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <span className="font-bold">{assessmentName(item.type)}</span>
              <span>{item.correct} / {item.attempted} · {item.score}%</span>
              <span className="font-bold text-emerald-800">{item.status}</span>
            </div>
          )) : <p className="text-slate-500">No assessments completed yet.</p>}
        </div>
      </section>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return <div className="border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>;
}

function WeekCard({ week, currentWeek }: { week: WeekResult; currentWeek: number | null }) {
  const completed = week.quiz?.status === "Completed" || week.lessons.some((lesson) => lesson.status === "Completed");
  const label = !week.required ? "Not Required" : completed ? "Completed" : week.week === currentWeek ? "Current" : "Required";
  return (
    <details className="rounded-md border border-slate-200">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span><span className="font-black">Week {week.week}</span><span className="ml-2 text-sm text-slate-500">{week.focus ?? "Learning focus"}</span></span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{label}</span>
      </summary>
      <div className="space-y-3 border-t border-slate-100 p-4">
        {week.lessons.map((lesson) => (
          <div key={lesson.lesson} className="rounded-md bg-slate-50 p-3 text-sm">
            <div className="flex flex-wrap justify-between gap-2"><span className="font-bold">Lesson {lesson.lesson}: {lesson.lessonName}</span><span className="font-bold text-slate-700">{lesson.status}</span></div>
            {lesson.focus ? <p className="mt-1 text-slate-600">{lesson.focus}</p> : null}
            <p className="mt-2">{lesson.correct} / {lesson.attempted} correct · {lesson.accuracy}% accuracy · {lesson.attempts} {lesson.attempts === 1 ? "attempt" : "attempts"}</p>
          </div>
        ))}
        {week.quiz ? <div className="rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><span className="font-bold">Weekly Quiz</span><span className="font-bold text-emerald-900">{week.quiz.status}</span></div><p className="mt-2">{week.quiz.correct} / {week.quiz.attempted} correct · {week.quiz.accuracy}% · {week.quiz.attempts} {week.quiz.attempts === 1 ? "attempt" : "attempts"}</p></div> : null}
        {!week.lessons.length && !week.quiz ? <p className="text-sm text-slate-500">Not Attempted</p> : null}
      </div>
    </details>
  );
}

function ParentSkeleton() {
  return <div className="space-y-4" aria-label="Loading Parent Home"><div className="h-10 w-64 animate-pulse bg-slate-200" /><div className="grid gap-5 md:grid-cols-2"><div className="h-72 animate-pulse bg-white" /><div className="h-72 animate-pulse bg-white" /></div></div>;
}

function Notice({ message }: { message: string }) {
  return <div className="border border-red-200 bg-white p-6"><p className="font-bold text-red-800">{message}</p></div>;
}
