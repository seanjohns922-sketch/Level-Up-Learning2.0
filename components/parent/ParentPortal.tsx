"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Copy,
  Gem,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Plus,
  RotateCcw,
  School,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  UserPlus,
  Users,
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

type HomeManagement = {
  studentId: string;
  displayName: string;
  username: string;
  explorerCode: string;
  schoolYearLevel: string;
  workingLevel: string;
  parentManaged: boolean;
  schoolName: string | null;
  placements: Array<{ realmId: string; workingLevel: string; entryMode: string }>;
};

const yearLevels = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

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

const realmPresentation: Record<string, { image: string; accent: string; surface: string }> = {
  number: { image: "/images/number-nexus-home-bg-y4.jpg", accent: "#0f9f88", surface: "#ecfdf8" },
  measurement: { image: "/images/measurelands-home-bg.png", accent: "#c98218", surface: "#fff8e8" },
  space: { image: "/images/starpath-home-bg-y4.png", accent: "#7255c7", surface: "#f4f0ff" },
  starpath: { image: "/images/starpath-home-bg-y4.png", accent: "#7255c7", surface: "#f4f0ff" },
};

function formatAchievementDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(date);
}

export function ParentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-950 lg:grid lg:grid-cols-[244px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen flex-col bg-[#092f35] px-4 py-6 text-white lg:flex">
        <Link href="/parent" className="flex items-center gap-3 px-2">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-[#62dfb5] text-[#07362f]"><Home className="h-6 w-6" /></span>
          <span><span className="block text-xs font-bold uppercase tracking-[0.18em] text-[#80e7c5]">Level Up Learning</span><span className="text-lg font-black">Parent Home</span></span>
        </Link>
        <nav className="mt-10 space-y-2" aria-label="Parent navigation">
          <ParentNavLink href="/parent" active={pathname === "/parent"} icon={<LayoutDashboard className="h-5 w-5" />} label="Overview" />
          <ParentNavLink href="/parent/children" active={pathname.startsWith("/parent/children")} icon={<Users className="h-5 w-5" />} label="My children" />
          <ParentNavLink href="/parent/add-child" active={pathname === "/parent/add-child"} icon={<Plus className="h-5 w-5" />} label="Add a child" />
          <ParentNavLink href="/parent/link-child" active={pathname === "/parent/link-child"} icon={<UserPlus className="h-5 w-5" />} label="Link a child" />
        </nav>
        <div className="mt-auto border-t border-white/10 pt-5">
          <div className="mb-4 rounded-md border border-white/10 bg-white/[0.05] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#80e7c5]">Home Access</p><p className="mt-2 font-black">2026 Free Access</p><p className="mt-1 text-xs text-white/60">Access status appears for each child.</p></div>
          <button type="button" onClick={signOut} className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 font-bold text-white/75 hover:bg-white/10 hover:text-white"><LogOut className="h-5 w-5" /> Sign out</button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-slate-200 bg-white lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/parent" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-200 text-emerald-950"><Home className="h-5 w-5" /></span><span className="font-black">Parent Home</span></Link>
            <button type="button" onClick={signOut} className="grid h-10 w-10 place-items-center rounded-md border border-slate-200" aria-label="Sign out"><LogOut className="h-5 w-5" /></button>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2" aria-label="Parent navigation">
            <ParentMobileNav href="/parent" label="Overview" active={pathname === "/parent"} />
            <ParentMobileNav href="/parent/children" label="Children" active={pathname.startsWith("/parent/children")} />
            <ParentMobileNav href="/parent/add-child" label="Add child" active={pathname === "/parent/add-child"} />
            <ParentMobileNav href="/parent/link-child" label="Link child" active={pathname === "/parent/link-child"} />
          </nav>
        </header>
        {pathname !== "/parent" && pathname !== "/parent/children" ? <div className="mx-auto max-w-[1320px] px-4 pt-4 sm:px-6"><Link href="/parent" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-emerald-800"><ArrowLeft className="h-4 w-4" /> Parent Home</Link></div> : null}
        <main className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function ParentNavLink({ href, active, icon, label }: { href: string; active: boolean; icon: ReactNode; label: string }) {
  return <Link href={href} className={`flex min-h-12 items-center gap-3 rounded-md px-4 font-bold transition ${active ? "bg-[#62dfb5] text-[#07362f]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>{icon}{label}</Link>;
}

function ParentMobileNav({ href, label, active }: { href: string; label: string; active: boolean }) {
  return <Link href={href} className={`shrink-0 rounded-md px-3 py-2 text-sm font-bold ${active ? "bg-emerald-100 text-emerald-900" : "text-slate-600"}`}>{label}</Link>;
}

export function ParentHome({ selectedStudentId }: { selectedStudentId?: string }) {
  const router = useRouter();
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [activeStudentId, setActiveStudentId] = useState(selectedStudentId ?? "");
  const [parentName, setParentName] = useState("there");
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
    const displayName = typeof auth.user.user_metadata?.display_name === "string"
      ? auth.user.user_metadata.display_name.trim()
      : "";
    const emailName = auth.user.email?.split("@")[0]?.split(/[._-]/)[0] ?? "";
    setParentName(displayName.split(" ")[0] || (emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : "there"));
    const { data, error: loadError } = await supabase.rpc("get_parent_home_snapshot");
    if (loadError) setError("Parent Home could not be loaded. Please try again.");
    else {
      const loadedChildren = (data as { children?: ParentChild[] } | null)?.children ?? [];
      setChildren(loadedChildren);
      setActiveStudentId((current) => selectedStudentId ?? (current || loadedChildren[0]?.studentId || ""));
    }
    setLoading(false);
  }, [router, selectedStudentId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (loading) return <ParentSkeleton />;
  if (error) return <Notice message={error} />;

  const activeChild = children.find((child) => child.studentId === activeStudentId) ?? children[0] ?? null;
  if (selectedStudentId && !activeChild) {
    return <Notice message="This child is not linked to your Parent account." />;
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Welcome back,</p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">{parentName}</h1>
          <p className="mt-2 text-slate-600">Here&apos;s how your {children.length === 1 ? "child is" : "children are"} progressing.</p>
        </div>
        {!selectedStudentId ? (
          <div className="flex flex-wrap gap-2">
            <Link href="/parent/add-child" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#087d61] px-4 font-bold text-white shadow-sm hover:bg-[#06684f]">
              <Plus className="h-5 w-5" /> Add new child
            </Link>
            <Link href="/parent/link-child" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 font-bold text-slate-800 shadow-sm hover:border-emerald-500">
              <UserPlus className="h-5 w-5" /> Link existing child
            </Link>
          </div>
        ) : null}
      </div>

      {children.length === 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
          <KeyRound className="h-8 w-8 text-emerald-700" />
          <h2 className="mt-4 text-xl font-black">Add your child to get started</h2>
          <p className="mt-2 max-w-xl text-slate-600">Create a new Home learner, or link a child who already uses Level Up Learning at school.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/parent/add-child" className="inline-flex min-h-11 items-center rounded-md bg-emerald-700 px-4 font-bold text-white">Add new child</Link>
            <Link href="/parent/link-child" className="inline-flex min-h-11 items-center rounded-md border border-slate-300 px-4 font-bold">Link existing child</Link>
          </div>
        </section>
      ) : (
        <>
          {!selectedStudentId ? <section><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">Your children</h2><span className="text-sm font-semibold text-slate-500">{children.length} linked</span></div><div className="flex gap-3 overflow-x-auto pb-2">{children.map((child) => <button type="button" key={child.studentId} onClick={() => setActiveStudentId(child.studentId)} className={`flex min-w-[230px] items-center gap-3 rounded-lg border bg-white p-3 text-left shadow-sm transition ${activeChild?.studentId === child.studentId ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200 hover:border-slate-300"}`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-lg font-black text-emerald-900">{child.firstName.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate font-black">{child.displayName}</span><span className="block truncate text-xs text-slate-500">{child.yearLevel ?? "Year not set"} · {child.schoolName ?? "Home learner"}</span></span><ChevronRight className="h-4 w-4 text-slate-400" /></button>)}</div></section> : null}
          {activeChild ? <SelectedChildDashboard child={activeChild} onActivated={load} /> : null}
        </>
      )}
    </div>
  );
}

function SelectedChildDashboard({ child, onActivated }: { child: ParentChild; onActivated: () => Promise<void> }) {
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

  const focusRealm = child.realms.find((realm) => realm.currentFocus) ?? child.realms[0] ?? null;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.8fr)]">
      <div className="space-y-5">
        <section className="relative min-h-[230px] overflow-hidden rounded-lg border border-slate-200 bg-[#11243c] text-white shadow-sm"><div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/images/realm-select-bg.jpg')" }} /><div className="absolute inset-0 bg-gradient-to-r from-[#102239] via-[#102239]/90 to-[#102239]/45" /><div className="relative flex h-full min-h-[230px] flex-col justify-between p-6 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Child overview</p><h2 className="mt-2 text-3xl font-black">{child.displayName}</h2><p className="mt-2 flex items-center gap-2 text-sm text-white/70"><School className="h-4 w-4" /> {child.yearLevel ?? "Year level not set"} · {child.schoolName ?? "Home learner"}</p></div><span className={`rounded-md px-3 py-1.5 text-xs font-black ${child.homeAccess ? "bg-emerald-300 text-emerald-950" : "bg-white/15 text-white"}`}>{child.homeAccess ? "Active — Free Access" : "Home Access inactive"}</span></div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"><HeroMetric label="Realms" value={String(child.realms.length)} /><HeroMetric label="Current week" value={focusRealm?.currentWeek ? `Week ${focusRealm.currentWeek}` : "Not started"} /><HeroMetric label="Pathway" value={focusRealm ? `${focusRealm.requiredCompleted}/${focusRealm.requiredWeeks.length}` : "—"} /><HeroMetric label="Activity" value={child.lastActiveAt ? formatLastActive(child.lastActiveAt).replace("Last active ", "") : "Not started"} /></div></div></section>

        <section><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Learning journey</p><h3 className="mt-1 text-xl font-black">Progress by realm</h3></div><Activity className="h-6 w-6 text-emerald-600" /></div><div className="mt-4 grid gap-3 md:grid-cols-3">{child.realms.length ? child.realms.map((realm) => <RealmProgressCard key={realm.realmId} studentId={child.studentId} realm={realm} />) : <p className="rounded-md bg-white p-4 text-sm text-slate-600 shadow-sm">Learning hasn’t started yet.</p>}</div></section>
      </div>

      <div className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-rose-50 text-rose-600"><Target className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">This week&apos;s focus</p><h3 className="font-black">{focusRealm ? realmName(focusRealm.realmId) : "Journey not started"}</h3></div></div><p className="mt-4 text-lg font-black leading-snug">{focusRealm?.currentFocus ?? "A learning focus will appear after the first activity."}</p>{focusRealm ? <><p className="mt-2 text-sm text-slate-500">{focusRealm.workingLevel}{focusRealm.currentWeek ? ` · Week ${focusRealm.currentWeek}` : ""}</p><Link href={`/parent/children/${child.studentId}/realm/${focusRealm.realmId}`} className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-emerald-800">View realm progress <ChevronRight className="h-4 w-4" /></Link></> : null}</section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-lg font-black"><Gem className="h-5 w-5 text-violet-600" /> Recent achievements</h3><Sparkles className="h-5 w-5 text-amber-500" /></div><div className="mt-4 divide-y divide-slate-100">{child.recentAchievements.length ? child.recentAchievements.map((item) => <div key={`${item.name}-${item.earnedAt}`} className="flex items-center gap-3 py-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-violet-50 text-violet-600"><Gem className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block truncate font-bold">{item.name}</span><span className="text-xs capitalize text-slate-500">{item.rarity}</span></span><span className="text-xs font-semibold text-slate-400">{formatAchievementDate(item.earnedAt)}</span></div>) : <p className="py-3 text-sm text-slate-500">No recent achievements yet.</p>}</div></section>

        <section className={`rounded-lg border p-5 shadow-sm ${child.homeAccess ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Home access</p><h3 className="mt-1 text-lg font-black">{child.homeAccess ? "Active — Free Access" : "Not active"}</h3></div><Home className={`h-5 w-5 ${child.homeAccess ? "text-emerald-700" : "text-amber-700"}`} /></div>{!child.homeAccess ? <><p className="mt-2 text-sm text-amber-900">Activate free Home access for the 2026 rollout.</p><button type="button" disabled={activating} onClick={activate} className="mt-3 min-h-11 rounded-md bg-emerald-700 px-4 font-bold text-white disabled:opacity-50">{activating ? "Activating…" : "Activate Home access"}</button>{activationError ? <p className="mt-2 text-sm font-bold text-red-700">{activationError}</p> : null}</> : <p className="mt-2 text-sm text-emerald-900">Learning access is available outside school as part of the 2026 rollout.</p>}<Link href={`/parent/children/${child.studentId}/settings`} className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-emerald-900"><Settings className="h-4 w-4" /> Login &amp; placement</Link></section>
      </div>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return <div className="border-l-2 border-cyan-300/60 pl-3"><p className="text-[10px] font-bold uppercase tracking-wider text-white/55">{label}</p><p className="mt-1 truncate font-black text-white">{value}</p></div>;
}

function RealmProgressCard({ studentId, realm }: { studentId: string; realm: ParentRealm }) {
  const presentation = realmPresentation[realm.realmId] ?? realmPresentation.number;
  const totalRequired = realm.requiredWeeks.length;
  const progress = totalRequired > 0 ? Math.min(100, Math.round((realm.requiredCompleted / totalRequired) * 100)) : 0;
  return <Link href={`/parent/children/${studentId}/realm/${realm.realmId}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"><div className="h-20 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,21,35,.18), rgba(8,21,35,.5)), url('${presentation.image}')` }} /><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="font-black">{realmName(realm.realmId)}</h4><p className="mt-1 text-sm text-slate-500">{realm.workingLevel}{realm.currentWeek ? ` · Week ${realm.currentWeek}` : ""}</p></div><ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5" /></div><div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: presentation.accent }} /></div><span className="w-9 text-right text-xs font-black text-slate-600">{progress}%</span></div><p className="mt-3 line-clamp-2 text-sm text-slate-600">{realm.currentFocus ?? "Current focus will appear after learning begins."}</p></div></Link>;
}

export function AddHomeChild() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [schoolYear, setSchoolYear] = useState("Year 1");
  const [workingLevel, setWorkingLevel] = useState("Year 1");
  const [pin, setPin] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<HomeManagement | null>(null);

  async function createChild() {
    setWorking(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("create_home_student_for_parent", {
      p_first_name: firstName,
      p_last_name: lastName,
      p_school_year_level: schoolYear,
      p_working_level: workingLevel,
      p_pin: pin,
    });
    if (rpcError || !data?.studentId) setError(rpcError?.message ?? "The Home learner could not be created.");
    else setCreated(data as HomeManagement);
    setWorking(false);
  }

  if (created) {
    return <section className="mx-auto max-w-2xl border border-emerald-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Home learner ready</p>
      <h1 className="mt-2 text-3xl font-black">{created.displayName}</h1>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2"><LoginValue label="Username" value={created.username} /><LoginValue label="Explorer Code" value={created.explorerCode} /></dl>
      <p className="mt-5 text-sm text-slate-600">Use the username and the 4-digit PIN you set to sign in under Student → Home. The Explorer Code remains with this child when they join a school.</p>
      <button type="button" onClick={() => { router.replace("/parent"); router.refresh(); }} className="mt-6 min-h-11 rounded-md bg-emerald-700 px-5 font-bold text-white">Open Parent Home</button>
    </section>;
  }

  return <section className="mx-auto max-w-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">New Home learner</p>
    <h1 className="mt-2 text-3xl font-black">Add your child</h1>
    <p className="mt-2 text-slate-600">Their permanent identity, Home access, login details and starting journey are created together.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <FormInput label="First name" value={firstName} onChange={setFirstName} />
      <FormInput label="Last name" value={lastName} onChange={setLastName} />
      <SelectLevel label="School year" value={schoolYear} onChange={setSchoolYear} />
      <SelectLevel label="Suggested working level" value={workingLevel} onChange={setWorkingLevel} />
      <label className="sm:col-span-2"><span className="text-sm font-bold">Choose a 4-digit student PIN</span><input inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 font-mono text-lg tracking-[0.3em]" /></label>
    </div>
    <p className="mt-4 text-sm text-slate-600">Year 1–6 learners begin with a pre-test in each realm. Prep learners begin at Ground Level.</p>
    {error ? <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}
    <button type="button" onClick={createChild} disabled={working || !firstName.trim() || !lastName.trim() || pin.length !== 4} className="mt-5 min-h-11 rounded-md bg-emerald-700 px-5 font-bold text-white disabled:bg-slate-300">{working ? "Creating…" : "Create Home learner"}</button>
  </section>;
}

function LoginValue({ label, value }: { label: string; value: string }) {
  return <div className="border border-slate-200 p-3"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><div className="mt-1 flex items-center justify-between gap-2"><code className="break-all font-bold">{value}</code><button type="button" onClick={() => void navigator.clipboard.writeText(value)} className="grid h-10 w-10 shrink-0 place-items-center" title={`Copy ${label}`}><Copy className="h-4 w-4" /></button></div></div>;
}

function FormInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span className="text-sm font-bold">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4" /></label>;
}

function SelectLevel({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span className="text-sm font-bold">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3">{yearLevels.map((level) => <option key={level}>{level}</option>)}</select></label>;
}

export function HomeChildSettings({ studentId }: { studentId: string }) {
  const [data, setData] = useState<HomeManagement | null>(null);
  const [newPin, setNewPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: result, error } = await supabase.rpc("get_parent_home_student_management", { p_student_id: studentId });
    if (!error) setData(result as HomeManagement);
  }, [studentId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function command(name: string, args: Record<string, string>, success: string) {
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.rpc(name, args);
    setMessage(error ? error.message : success);
    if (!error) await load();
    setBusy(false);
  }

  if (!data) return <ParentSkeleton />;
  return <div className="mx-auto max-w-3xl space-y-5">
    <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Child access</p><h1 className="mt-1 text-3xl font-black">Login &amp; placement</h1><p className="mt-2 text-slate-600">{data.displayName}</p></div>
    <section className="border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Login details</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><LoginValue label="Username" value={data.username} /><LoginValue label="Explorer Code" value={data.explorerCode} /></div></section>
    {!data.parentManaged ? <section className="border-l-4 border-blue-500 bg-blue-50 p-4"><p className="font-bold text-blue-950">School managed</p><p className="mt-1 text-sm text-blue-900">{data.schoolName ?? "The linked school"} now manages PIN resets, placement and assessment resets. Your Parent account remains read-only.</p></section> : <>
      <section className="border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Reset student PIN</h2><div className="mt-4 flex flex-wrap gap-2"><input inputMode="numeric" value={newPin} onChange={(event) => setNewPin(event.target.value.replace(/\D/g, "").slice(0, 4))} className="h-11 w-40 rounded-md border border-slate-300 px-3 text-center font-mono tracking-[0.25em]" /><button type="button" disabled={busy || newPin.length !== 4} onClick={() => void command("parent_reset_home_student_pin", { p_student_id: studentId, p_new_pin: newPin }, "PIN reset. Existing student sessions were signed out.")} className="min-h-11 rounded-md bg-emerald-700 px-4 font-bold text-white disabled:bg-slate-300">Reset PIN</button></div></section>
      <section className="border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Starting levels</h2><p className="mt-1 text-sm text-slate-600">Changes stop once lessons, quizzes or a post-test have begun.</p><div className="mt-4 divide-y">{data.placements.map((placement) => <div key={placement.realmId} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-bold">{realmName(placement.realmId)}</p><p className="text-sm text-slate-500">{placement.entryMode === "pretest" ? "Pre-test entry" : "Ground Level entry"}</p></div><div className="flex gap-2"><select value={placement.workingLevel} onChange={(event) => void command("parent_change_home_starting_level", { p_student_id: studentId, p_realm_id: placement.realmId, p_assigned_level: event.target.value }, `${realmName(placement.realmId)} starting level updated.`)} disabled={busy} className="h-11 rounded-md border border-slate-300 bg-white px-3">{yearLevels.map((level) => <option key={level}>{level}</option>)}</select><button type="button" disabled={busy || placement.workingLevel === "Prep"} onClick={() => void command("parent_reset_home_pretest", { p_student_id: studentId, p_realm_id: placement.realmId }, `${realmName(placement.realmId)} pre-test reopened. Previous results remain in history.`)} className="grid h-11 w-11 place-items-center rounded-md border border-slate-300" title="Reopen pre-test"><RotateCcw className="h-4 w-4" /></button></div></div>)}</div></section>
    </>}
    {message ? <p className="border border-slate-200 bg-white p-3 text-sm font-bold">{message}</p> : null}
  </div>;
}

export function LinkChild() {
  const router = useRouter();
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem("lul_pending_parent_explorer_code_v1") ?? "";
  });
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
      window.sessionStorage.removeItem("lul_pending_parent_explorer_code_v1");
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
    window.sessionStorage.removeItem("lul_pending_parent_explorer_code_v1");
    setStudentPin("");
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
            <button type="button" onClick={() => { window.sessionStorage.removeItem("lul_pending_parent_explorer_code_v1"); setCode(""); setPreview(null); setStudentPin(""); }} className="min-h-11 rounded-md border border-slate-300 px-5 font-bold">Use another code</button>
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
