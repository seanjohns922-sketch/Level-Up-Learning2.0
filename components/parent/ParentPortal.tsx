"use client";

import { FullscreenToggle } from "@/components/FullscreenToggle";
import Link from "next/link";
import { homeAccessCardsHtml } from "@/lib/documents/login-cards";
import { openDocumentWindow, writeDocument } from "@/lib/documents/reliq-document";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Gem,
  Footprints,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Printer,
  RotateCcw,
  ShieldCheck,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { sendRex } from "@/lib/rex-client";
import { fetchChildFriends, setChildFriends } from "@/lib/friends";
import { REX_QUESTIONS, REX_XP } from "@/lib/rex";
import GemIcon, { cutForGem, GEM_RARITY } from "@/components/gems/GemIcon";
import { stoneForGem } from "@/lib/gem-stones";
import LegendCardArtwork from "@/components/legends/LegendCardArtwork";
import {
  getAllLegends,
  getEffectiveUnlockedLegendIds,
  normalizeLegendRealmId,
  type Legend,
} from "@/data/legends";
import type { GemRarity } from "@/lib/gems";
import { normalizeWorkingLevelLabel } from "@/lib/studentLevelLabel";
import { supabase } from "@/lib/supabase";
import ReliqAdultLogo from "@/components/brand/ReliqAdultLogo";
import ParentChildOverview from "@/components/parent/ParentChildOverview";
import SkipWeekDialog, { type SkipWeekRequest } from "@/components/parent/SkipWeekDialog";
import { ASSESSMENT_THRESHOLDS, weeklyQuizPassed } from "@/lib/assessment-rules";
import { parentCurriculumWeek, parentCurriculumWeeks, parentLevelLabel } from "@/lib/parent-curriculum";
import { realmSkipState, type ParentWeekSkips } from "@/lib/parent-realm-status";
import { fetchParentWeekSkips } from "@/lib/parent-week-skips";
import { getLiveRealmDefinitions } from "@/lib/realms/realm-registry";
import { realmEntryLevel } from "@/lib/realm-unlock";
import {
  formatFeedTime,
  parentRealmName,
  parentRealmPalette,
  type ParentActivity,
  type ParentProgressReport,
} from "@/lib/parent-insights";

export type ParentRealm = {
  realmId: string;
  workingLevel: string;
  currentWeek: number | null;
  requiredWeeks: number[];
  optionalWeeks: number[];
  status: string;
  currentFocus: string | null;
  completedLessons?: number;
  unlockedLegends?: string[];
};

type ParentGem = { gemId: string; name: string; earnedAt: string; rarity: string };

export type ParentChild = {
  studentId: string;
  displayName: string;
  firstName: string;
  username: string | null;
  yearLevel: string | null;
  explorerCode: string | null;
  schoolName: string | null;
  lastActiveAt: string | null;
  homeAccess: boolean;
  billingStatus: string | null;
  realms: ParentRealm[];
  recentAchievements: Array<{ gemId?: string; name: string; earnedAt: string; rarity: string }>;
  gems?: ParentGem[];
};

function isGemRarity(value: string): value is GemRarity {
  return value in GEM_RARITY;
}

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

type CreatedHomeStudent = Pick<HomeManagement, "studentId" | "displayName" | "username" | "explorerCode" | "schoolYearLevel">;

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

// Realm identity (name, colours, artwork) lives in lib/parent-insights so all
// six live realms stay on their own theme instead of falling back to Number
// Nexus teal.
function realmName(realmId: string) {
  return parentRealmName(realmId);
}

/** "Learned 2 hours ago" on a child's button; quiet children read amber after a week. */
function lastLearnedLabel(value: string | null) {
  if (!value) return { text: "Not started yet", quiet: true };
  const days = (Date.now() - Date.parse(value)) / 86_400_000;
  return { text: `Learned ${formatFeedTime(value).replace(/^Yesterday$/, "yesterday").replace(/^Just now$/, "just now")}`, quiet: days > 7 };
}

function assessmentName(type: string) {
  const normalised = type.toLowerCase().replaceAll("_", " ");
  if (normalised.includes("pre")) return "Pre-Test";
  if (normalised.includes("post")) return "Post-Test";
  return normalised.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAchievementDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(date);
}

const PARENT_NAV = [
  { href: "/parent", label: "Overview", icon: LayoutDashboard, isActive: (path: string) => path === "/parent" },
  { href: "/parent/children", label: "My children", icon: Users, isActive: (path: string) => path.startsWith("/parent/children") },
  { href: "/parent/rewards", label: "Rewards", icon: Trophy, isActive: (path: string) => path === "/parent/rewards" },
  { href: "/parent/add-child", label: "Add a child", icon: Plus, isActive: (path: string) => path === "/parent/add-child" },
  { href: "/parent/link-child", label: "Link a child", icon: UserPlus, isActive: (path: string) => path === "/parent/link-child" },
] as const;

/**
 * The parent frame: Carbon sidebar on desktop, a menu button on phones. In the
 * Demo Review preview the menu is shown but goes nowhere, because the other
 * parent pages need a real parent login.
 */
export function ParentShell({ children, preview = false }: { children: ReactNode; preview?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const activePath = preview ? "/parent" : pathname;

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="reliq-adult min-h-screen text-slate-950 lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <aside className="hidden flex-col bg-[#121314] px-4 py-7 text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Link href={preview ? "#" : "/parent"} className="block px-2" aria-label="Parent Home">
          <ReliqAdultLogo className="w-[118px]" />
          <span className="mt-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#8F948C]">For parents</span>
        </Link>
        <nav className="mt-9 space-y-1" aria-label="Parent navigation">
          {PARENT_NAV.map((item) => <ParentNavLink key={item.href} item={item} active={item.isActive(activePath)} preview={preview} />)}
        </nav>
        <div className="mt-auto flex items-center gap-2 border-t border-white/10 pt-5">
          <button type="button" onClick={signOut} disabled={preview} className="flex min-h-11 flex-1 items-center gap-3 rounded-md px-3 font-bold text-white/75 hover:bg-white/10 hover:text-white disabled:opacity-60"><LogOut className="h-5 w-5" /> Sign out</button>
          <FullscreenToggle icon className="h-11 w-11 rounded-md text-white/75 hover:bg-white/10 hover:text-white" />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-slate-200 bg-white lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href={preview ? "#" : "/parent"} className="flex items-center gap-3" aria-label="Parent Home"><ReliqAdultLogo variant="onLight" className="w-[92px]" /><span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">For parents</span></Link>
            <div className="flex items-center gap-2">
              <FullscreenToggle icon className="h-11 w-11 rounded-md border border-slate-200 text-slate-700" />
              <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="parent-mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} className="grid h-11 w-11 place-items-center rounded-md border border-slate-200">
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {menuOpen ? (
            <nav id="parent-mobile-menu" className="grid gap-1 border-t border-slate-100 px-3 py-3" aria-label="Parent navigation">
              {PARENT_NAV.map((item) => <ParentMobileNav key={item.href} item={item} active={item.isActive(activePath)} preview={preview} onNavigate={() => setMenuOpen(false)} />)}
              <button type="button" onClick={signOut} disabled={preview} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-left font-bold text-slate-700 disabled:opacity-60"><LogOut className="h-5 w-5" /> Sign out</button>
            </nav>
          ) : null}
        </header>
        {!preview && pathname !== "/parent" && pathname !== "/parent/children" && pathname !== "/parent/rewards" ? <div className="mx-auto max-w-[1320px] px-4 pt-4 sm:px-6"><Link href="/parent" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#3F7A00]"><ArrowLeft className="h-4 w-4" /> Parent Home</Link></div> : null}
        <main className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

type ParentNavItem = (typeof PARENT_NAV)[number];

function ParentNavLink({ item, active, preview }: { item: ParentNavItem; active: boolean; preview: boolean }) {
  const Icon = item.icon;
  const className = `flex min-h-11 items-center gap-3 rounded-lg px-3 font-semibold transition ${active ? "bg-[var(--reliq-lime)] text-[#121314]" : "text-[#C9CCC6] hover:bg-[#222426] hover:text-white"}`;
  if (preview) return <span aria-current={active ? "page" : undefined} title={active ? undefined : "Not available in the preview"} className={className}><Icon className="h-5 w-5" />{item.label}</span>;
  return <Link href={item.href} aria-current={active ? "page" : undefined} className={className}><Icon className="h-5 w-5" />{item.label}</Link>;
}

function ParentMobileNav({ item, active, preview, onNavigate }: { item: ParentNavItem; active: boolean; preview: boolean; onNavigate: () => void }) {
  const Icon = item.icon;
  const className = `flex min-h-11 items-center gap-3 rounded-lg px-3 font-bold ${active ? "bg-[var(--reliq-lime)] text-[#121314]" : "text-slate-700 hover:bg-slate-50"}`;
  if (preview) return <span aria-current={active ? "page" : undefined} className={className}><Icon className="h-5 w-5" />{item.label}</span>;
  return <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={className}><Icon className="h-5 w-5" />{item.label}</Link>;
}

/**
 * Fixture data for the Demo Review preview. When present the real components
 * render from it and never call Supabase, so reviewing the dashboard needs no
 * parent login and writes nothing.
 */
export type ParentPreviewData = {
  parentName: string;
  children: ParentChild[];
  activity?: Record<string, ParentActivity>;
  reports?: Record<string, ParentProgressReport>;
  skips?: Record<string, ParentWeekSkips>;
};

/** The parent gate's reasons, in words a parent can act on (see assert_parent_role). */
export function parentHomeErrorMessage(reason: string | undefined) {
  if (reason?.includes("Parent access required")) return "This account isn't set up as a parent account. Sign in with the email you used to create your parent account, or link your child with their Explorer Code.";
  if (reason?.includes("Account unavailable")) return "This account isn't active yet. Please contact support so we can switch it on.";
  if (reason?.includes("Login required")) return "Your sign-in has expired. Please sign in again.";
  return "Parent Home could not be loaded. Please try again.";
}

export function ParentHome({ selectedStudentId, preview }: { selectedStudentId?: string; preview?: ParentPreviewData }) {
  const router = useRouter();
  const [children, setChildren] = useState<ParentChild[]>(preview?.children ?? []);
  const [activeStudentId, setActiveStudentId] = useState(selectedStudentId ?? preview?.children[0]?.studentId ?? "");
  const [parentName, setParentName] = useState(preview?.parentName ?? "");
  const [loading, setLoading] = useState(!preview);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (preview) return;
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
    // Only a name the parent gave us; an email username ("scjohns") reads badly.
    setParentName(displayName.split(/\s+/)[0] ?? "");
    const { data, error: loadError } = await supabase.rpc("get_parent_home_snapshot");
    if (loadError) setError(parentHomeErrorMessage(loadError.message));
    else {
      const loadedChildren = (data as { children?: ParentChild[] } | null)?.children ?? [];
      setChildren(loadedChildren);
      setActiveStudentId((current) => selectedStudentId ?? (current || loadedChildren[0]?.studentId || ""));
    }
    setLoading(false);
  }, [preview, router, selectedStudentId]);

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
          <p className="text-[15px] font-semibold text-slate-500">{parentName ? `Welcome back, ${parentName}` : "Welcome back"}</p>
          <h1 className="mt-1 font-display text-3xl font-black tracking-tight sm:text-4xl">How your {children.length === 1 ? "child is" : "children are"} going</h1>
        </div>
        {!selectedStudentId ? (
          <div className="flex flex-wrap items-start gap-2">
            {children.length && !preview ? <PrintAllHomeAccessCardsButton students={children} /> : null}
            <Link href={preview ? "#" : "/parent/link-child"} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 font-bold text-slate-800 hover:border-slate-900">
              <UserPlus className="h-5 w-5" /> Link a child
            </Link>
            <Link href={preview ? "#" : "/parent/add-child"} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--reliq-lime)] px-4 font-bold text-[#121314] hover:bg-[var(--reliq-lime-hover)]">
              <Plus className="h-5 w-5" /> Add child
            </Link>
          </div>
        ) : null}
      </div>

      {children.length === 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
          <KeyRound className="h-8 w-8 text-blue-700" />
          <h2 className="mt-4 text-xl font-black">Add your child to get started</h2>
          <p className="mt-2 max-w-xl text-slate-600">Create a new Home learner, or link a child who already uses RELIQ at school.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/parent/add-child" className="inline-flex min-h-11 items-center rounded-md bg-blue-600 px-4 font-bold text-white">Add new child</Link>
            <Link href="/parent/link-child" className="inline-flex min-h-11 items-center rounded-md border border-slate-300 px-4 font-bold">Link existing child</Link>
          </div>
        </section>
      ) : (
        <>
          {!selectedStudentId && children.length > 1 ? (
            <section aria-label="Choose a child" className="flex gap-3 overflow-x-auto pb-1">
              {children.map((child) => {
                const selected = activeChild?.studentId === child.studentId;
                const learned = lastLearnedLabel(child.lastActiveAt);
                return (
                  <button type="button" key={child.studentId} onClick={() => setActiveStudentId(child.studentId)} aria-pressed={selected} className={`flex min-w-[220px] items-center gap-3 rounded-xl border bg-white p-3 text-left transition ${selected ? "border-[#121314] ring-1 ring-[#121314]" : "border-slate-200 hover:border-slate-400"}`}>
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-lg font-black text-[#121314] ${selected ? "bg-[var(--reliq-lime)]" : "bg-slate-100"}`}>{child.firstName.slice(0, 1).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-black">{child.displayName}</span>
                      <span className={`block truncate text-sm ${learned.quiet ? "font-semibold text-amber-700" : "text-slate-600"}`}>{learned.text}</span>
                    </span>
                  </button>
                );
              })}
            </section>
          ) : null}
          {activeChild ? (
            <ParentChildOverview
              key={activeChild.studentId}
              child={activeChild}
              onChanged={load}
              preview={preview ? {
                activity: preview.activity?.[activeChild.studentId],
                report: preview.reports?.[activeChild.studentId],
                skips: preview.skips?.[activeChild.studentId],
              } : undefined}
            />
          ) : null}
          {activeChild ? <ParentSendRex key={`rex-${activeChild.studentId}`} child={activeChild} preview={Boolean(preview)} /> : null}
          {activeChild ? <ParentFriends key={`friends-${activeChild.studentId}`} child={activeChild} preview={Boolean(preview)} /> : null}
        </>
      )}
    </div>
  );
}

/** Friends: whether the child can add friends and visit worlds, and whether friends can help build theirs. */
function ParentFriends({ child, preview }: { child: ParentChild; preview: boolean }) {
  const [settings, setSettings] = useState<{ enabled: boolean; building: boolean; schoolManaged: boolean } | null>(preview ? { enabled: true, building: true, schoolManaged: false } : null);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (preview) return;
    let cancelled = false;
    void fetchChildFriends(child.studentId).then((next) => { if (!cancelled) setSettings(next); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [child.studentId, preview]);
  const save = async (enabled: boolean, building: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, enabled, building });
    if (preview) return;
    try { await setChildFriends(child.studentId, enabled, building); setMessage(null); }
    catch { setMessage("That couldn't be saved just now. Try again in a moment."); }
  };
  return (
    <section aria-labelledby="friends-title" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <Users className="h-8 w-8 shrink-0 text-[#121314]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 id="friends-title" className="font-display text-lg font-black uppercase tracking-wide">Friends</h2>
          <p className="mt-1 text-sm text-slate-600">{child.firstName} can add friends with a friend code and visit their worlds. There&apos;s no chat. Friends can only build in {child.firstName}&apos;s world if {child.firstName} says so.{settings?.schoolManaged ? ` ${child.firstName}'s school can also switch this off.` : ""}</p>
          {message ? <p role="status" className="mt-2 text-sm font-bold text-[#121314]">{message}</p> : null}
        </div>
      </div>
      {settings ? <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {([["Friends and visits", settings.enabled, (on: boolean) => void save(on, on && settings.building)], ["Friends can help build", settings.enabled && settings.building, (on: boolean) => void save(settings.enabled || on, on)]] as const).map(([label, on, change]) => (
          <button key={label} type="button" role="switch" aria-checked={on} onClick={() => change(!on)} className="flex min-h-11 items-center justify-between rounded-lg border border-slate-300 px-4 font-bold">
            <span>{label}</span>
            <span className={`rounded-full px-3 py-0.5 text-sm ${on ? "bg-[var(--reliq-lime)] text-[#121314]" : "bg-slate-100 text-slate-600"}`}>{on ? "ON" : "OFF"}</span>
          </button>
        ))}
      </div> : null}
    </section>
  );
}

/** Rex the maths T-rex: the parent wakes him in their child's hub; easy questions, then a lesson sends him home. */
function ParentSendRex({ child, preview }: { child: ParentChild; preview: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (preview) { setMessage(`Rex is on his way to ${child.firstName}'s hub.`); return; }
    setBusy(true);
    try {
      const sent = await sendRex({ studentId: child.studentId });
      setMessage(sent ? `Rex is on his way to ${child.firstName}'s hub.` : `Rex is already visiting ${child.firstName}.`);
    } catch (error) {
      setMessage(`Rex couldn't be sent: ${(error as { message?: string })?.message ?? "please try again"}`);
    }
    setBusy(false);
  };
  return (
    <section aria-labelledby="send-rex-title" className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <Footprints className="h-8 w-8 shrink-0 text-[#121314]" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h2 id="send-rex-title" className="font-display text-lg font-black uppercase tracking-wide">Send Rex</h2>
        <p className="mt-1 text-sm text-slate-600">Rex the maths T-rex wakes in {child.firstName}&apos;s world. {REX_QUESTIONS} easy questions at their level tame him (+{REX_XP} XP), then finishing a lesson sends him home.</p>
        {message ? <p role="status" className="mt-2 text-sm font-bold text-[#121314]">{message}</p> : null}
      </div>
      <button type="button" disabled={busy} onClick={() => void send()} className="min-h-11 rounded-lg bg-[var(--reliq-lime)] px-5 font-bold text-[#121314] hover:bg-[var(--reliq-lime-hover)] disabled:opacity-60">Send Rex</button>
    </section>
  );
}

export function ParentRewards() {
  const router = useRouter();
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [activeStudentId, setActiveStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        router.replace("/login");
        return;
      }
      const { data, error: loadError } = await supabase.rpc("get_parent_home_snapshot");
      if (loadError) setError("Rewards could not be loaded. Please try again.");
      else {
        const loadedChildren = (data as { children?: ParentChild[] } | null)?.children ?? [];
        setChildren(loadedChildren);
        setActiveStudentId(loadedChildren[0]?.studentId ?? "");
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <ParentSkeleton />;
  if (error) return <Notice message={error} />;

  const activeChild = children.find((child) => child.studentId === activeStudentId) ?? children[0] ?? null;

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Rewards</p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">Unlocked collection</h1>
        <p className="mt-2 text-slate-600">See the Gems and RELIQS each child has earned.</p>
      </div>

      {children.length ? (
        <>
          <section aria-label="Choose a child">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">Your children</h2><span className="text-sm font-semibold text-slate-500">{children.length} linked</span></div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {children.map((child) => <button type="button" key={child.studentId} onClick={() => setActiveStudentId(child.studentId)} className={`flex min-w-[230px] items-center gap-3 rounded-lg border bg-white p-3 text-left shadow-sm transition ${activeChild?.studentId === child.studentId ? "border-violet-500 ring-2 ring-violet-100" : "border-slate-200 hover:border-slate-300"}`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-100 text-lg font-black text-violet-900">{child.firstName.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate font-black">{child.displayName}</span><span className="block truncate text-xs text-slate-500">{child.yearLevel ?? "Year not set"} · {child.schoolName ?? "Home learner"}</span></span></button>)}
            </div>
          </section>
          {activeChild ? <UnlockedCollection child={activeChild} compactHeading /> : null}
        </>
      ) : <section className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm"><Trophy className="h-8 w-8 text-violet-600" /><h2 className="mt-4 text-xl font-black">No child linked yet</h2><p className="mt-2 text-slate-600">Add or link a child before viewing rewards.</p></section>}
    </div>
  );
}

function UnlockedCollection({ child, compactHeading = false }: { child: ParentChild; compactHeading?: boolean }) {
  const gems = child.gems ?? child.recentAchievements;
  const legendIds = new Set(
    child.realms.flatMap((realm) =>
      getEffectiveUnlockedLegendIds(
        normalizeWorkingLevelLabel(realm.workingLevel),
        realm.unlockedLegends,
        normalizeLegendRealmId(realm.realmId),
      ),
    ),
  );
  const legends = getAllLegends().filter((legend) => legendIds.has(legend.id));

  return (
    <section aria-labelledby="unlocked-collection-title">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          {!compactHeading ? <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Rewards</p> : null}
          <h3 id="unlocked-collection-title" className="text-xl font-black">{child.displayName}&apos;s collection</h3>
          <p className="mt-1 text-sm text-slate-600">Gems and RELIQS earned through learning.</p>
        </div>
        <p className="text-sm font-bold text-slate-500">{gems.length} {gems.length === 1 ? "Gem" : "Gems"} · {legends.length} {legends.length === 1 ? "RELIQ" : "RELIQS"}</p>
      </div>

      <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <CollectionGroup title="Gems" emptyText="No Gems unlocked yet.">
          {gems.map((gem) => (
            <div key={`${gem.gemId ?? gem.name}-${gem.earnedAt}`} className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-violet-50">
                {gem.gemId && isGemRarity(gem.rarity) ? <GemIcon rarity={gem.rarity} cut={cutForGem(gem.gemId, gem.rarity)} stone={stoneForGem(gem)} size={48} /> : <Gem className="h-6 w-6 text-violet-600" />}
              </span>
              <span className="min-w-0"><span className="block truncate font-black">{gem.name}</span><span className="text-xs capitalize text-slate-500">{gem.rarity}</span></span>
            </div>
          ))}
        </CollectionGroup>

        <CollectionGroup title="RELIQS" emptyText="No RELIQS unlocked yet.">
          {legends.map((legend) => <ParentLegendCard key={legend.id} legend={legend} />)}
        </CollectionGroup>
      </div>
    </section>
  );
}

function CollectionGroup({ title, emptyText, children }: { title: string; emptyText: string; children: ReactNode }) {
  const items = Array.isArray(children) ? children : children ? [children] : [];
  return <div><h4 className="font-black text-slate-800">{title}</h4>{items.length ? <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div> : <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">{emptyText}</p>}</div>;
}

function ParentLegendCard({ legend }: { legend: Legend }) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex aspect-[63/88] items-center justify-center overflow-hidden rounded-md bg-slate-950 p-1.5">
        <LegendCardArtwork src={legend.images.cardFront} alt={`${legend.name} RELIQ card`} className="h-full w-full" />
      </div>
      <div className="min-w-0 self-center"><p className="font-black leading-snug">{legend.name}</p><p className="mt-1 text-xs font-semibold text-slate-500">{realmName(legend.realmId)}</p><p className="mt-1 text-xs text-slate-500">{legend.yearLabel}</p></div>
    </div>
  );
}

export function AddHomeChild() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [schoolYear, setSchoolYear] = useState("Year 1");
  const [pin, setPin] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedHomeStudent | null>(null);
  // One entry per live realm, each clamped into the levels that realm teaches
  // (Statistica starts at Level 1; Pattern Peaks and Chance Hollow at Level 3).
  const [startingLevels, setStartingLevels] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      homeRealmOptions().map((realm) => [realm.realmId, realmEntryLevel(realm.realmId, "Year 1") ?? realm.levels[0]!]),
    ),
  );

  async function createChild() {
    setWorking(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("create_home_student_for_parent", {
      p_first_name: firstName,
      p_last_name: lastName,
      p_school_year_level: schoolYear,
      // The existing atomic creation RPC needs a seed level. Realm-specific
      // levels are confirmed in the next step before onboarding is complete.
      p_working_level: schoolYear,
      p_pin: pin,
    });
    if (rpcError || !data?.studentId) setError(rpcError?.message ?? "The Home learner could not be created.");
    else {
      setCreated(data as CreatedHomeStudent);
      setStartingLevels({ number: schoolYear, measurement: schoolYear, space: schoolYear });
    }
    setWorking(false);
  }

  async function confirmStartingLevels() {
    if (!created) return;
    setWorking(true);
    setError(null);
    // One realm-to-level object covers every live realm. The older
    // three-argument RPC is still in the database for compatibility.
    const { error: rpcError } = await supabase.rpc("parent_set_home_realm_levels", {
      p_student_id: created.studentId,
      p_levels: startingLevels,
    });
    if (rpcError) {
      setError(rpcError.message);
      setWorking(false);
      return;
    }
    router.replace("/parent");
    router.refresh();
  }

  if (created) {
    return <section className="mx-auto max-w-3xl border border-blue-200 bg-white p-5 shadow-sm sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Step 2 of 2</p>
      <h1 className="mt-2 text-3xl font-black">Set starting levels</h1>
      <p className="mt-2 text-slate-600">Choose where {created.displayName} should begin in each realm. Each Year 1–6 journey starts with its own pre-test.</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2"><LoginValue label="Username" value={created.username} /><LoginValue label="Explorer Code" value={created.explorerCode} /></dl>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <PrintHomeAccessCardButton displayName={created.displayName} username={created.username} explorerCode={created.explorerCode} />
        <p className="text-sm text-slate-600">The student signs in with this username and the 4-digit PIN you set. Their Explorer Code remains with them if they join a school.</p>
      </div>
      <div className="mt-6 divide-y border-y border-slate-200">
        {homeRealmOptions().map((realm) => (
          <div key={realm.realmId} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
            <div>
              <p className="font-black">{realmName(realm.realmId)}</p>
              <p className="text-sm text-slate-500">
                {realm.levels[0] === "Prep"
                  ? `Suggested from school year: ${created.schoolYearLevel}`
                  : `Starts at ${parentLevelLabel(realm.levels[0]!)}`}
              </p>
            </div>
            <SelectLevel
              label={`${realmName(realm.realmId)} starting level`}
              hideLabel
              levels={realm.levels}
              value={startingLevels[realm.realmId] ?? realm.levels[0]!}
              onChange={(value) => setStartingLevels((current) => ({ ...current, [realm.realmId]: value }))}
            />
          </div>
        ))}
      </div>
      {error ? <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}
      <button type="button" onClick={() => void confirmStartingLevels()} disabled={working} className="mt-6 min-h-11 rounded-md bg-blue-600 px-5 font-bold text-white disabled:bg-slate-300">{working ? "Saving…" : "Confirm starting levels"}</button>
    </section>;
  }

  return <section className="mx-auto max-w-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Step 1 of 2 · New Home learner</p>
    <h1 className="mt-2 text-3xl font-black">Add your child</h1>
    <p className="mt-2 text-slate-600">Create their permanent identity, Home access and login details. You will set each realm’s starting level next.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <FormInput label="First name" value={firstName} onChange={setFirstName} />
      <FormInput label="Last name" value={lastName} onChange={setLastName} />
      <SelectLevel label="School year" value={schoolYear} onChange={setSchoolYear} />
      <label className="sm:col-span-2"><span className="text-sm font-bold">Choose a 4-digit student PIN</span><input inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 font-mono text-lg tracking-[0.3em]" /></label>
    </div>
    <p className="mt-4 text-sm text-slate-600">Each realm begins with a pre-test. Ground learners record a starting score, then complete the full program.</p>
    {error ? <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}
    <button type="button" onClick={createChild} disabled={working || !firstName.trim() || !lastName.trim() || pin.length !== 4} className="mt-5 min-h-11 rounded-md bg-blue-600 px-5 font-bold text-white disabled:bg-slate-300">{working ? "Creating…" : "Create Home learner"}</button>
  </section>;
}

function LoginValue({ label, value }: { label: string; value: string }) {
  return <div className="border border-slate-200 p-3"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><div className="mt-1 flex items-center justify-between gap-2"><code className="break-all font-bold">{value}</code><button type="button" onClick={() => void navigator.clipboard.writeText(value)} className="grid h-10 w-10 shrink-0 place-items-center" title={`Copy ${label}`}><Copy className="h-4 w-4" /></button></div></div>;
}

type HomeAccessCardDetails = { displayName: string; username: string | null; explorerCode: string | null };

function printHomeAccessCards(cards: readonly HomeAccessCardDetails[]) {
  if (!cards.length) return;
  const printWindow = openDocumentWindow();
  if (!printWindow) return;
  writeDocument(printWindow, homeAccessCardsHtml({
    websiteHost: window.location.host,
    cards: cards.map((details) => ({
      name: details.displayName,
      username: details.username || "Not available",
      explorerCode: details.explorerCode || "Not available",
    })),
  }));
}

function PrintHomeAccessCardButton({ displayName, username, explorerCode, className = "" }: { displayName: string; username: string; explorerCode: string; className?: string }) {
  return (
    <button type="button" onClick={() => printHomeAccessCards([{ displayName, username, explorerCode }])} className={`inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 font-bold text-slate-800 shadow-sm hover:border-blue-500 ${className}`}>
      <Printer className="h-4 w-4" /> Print home access card
    </button>
  );
}

function PrintAllHomeAccessCardsButton({ students: children }: { students: readonly ParentChild[] }) {
  return (
    <button type="button" onClick={() => printHomeAccessCards(children.map((child) => ({ displayName: child.displayName, username: child.username, explorerCode: child.explorerCode })))} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-left font-bold text-slate-800 hover:bg-slate-50">
      <Printer className="h-5 w-5" /> Print all home access cards
    </button>
  );
}

function FormInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span className="text-sm font-bold">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4" /></label>;
}

function SelectLevel({ label, value, onChange, hideLabel = false, levels = yearLevels }: { label: string; value: string; onChange: (value: string) => void; hideLabel?: boolean; levels?: readonly string[] }) {
  return <label><span className={hideLabel ? "sr-only" : "text-sm font-bold"}>{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={`${hideLabel ? "" : "mt-2 "}h-12 w-full rounded-md border border-slate-300 bg-white px-3`}>{levels.map((level) => <option key={level}>{level}</option>)}</select></label>;
}

// Every live realm a Home learner can be placed in, with the levels that realm
// actually teaches. Home gets the full service: the three-realm list this form
// used to carry was simply the set of realms that existed in August 2026.
// Starting levels above the school years. Level 7 is live; Level 8 is added
// when it is released (docs/advanced-pathway-levels-7-8.md).
const HOME_EXTRA_STARTING_LEVELS = ["Year 7"] as const;

function homeRealmOptions() {
  return getLiveRealmDefinitions().map((realm) => ({
    realmId: realm.realmId as string,
    levels: [...realm.levelLabels, ...HOME_EXTRA_STARTING_LEVELS.filter((level) => !realm.levelLabels.includes(level))],
  }));
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
    <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Child access</p><h1 className="mt-1 text-3xl font-black">Login &amp; placement</h1><p className="mt-2 text-slate-600">{data.displayName}</p></div>
    <section className="border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Login details</h2>
        <PrintHomeAccessCardButton displayName={data.displayName} username={data.username} explorerCode={data.explorerCode} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2"><LoginValue label="Username" value={data.username} /><LoginValue label="Explorer Code" value={data.explorerCode} /></div>
    </section>
    {!data.parentManaged ? <section className="border-l-4 border-blue-500 bg-blue-50 p-4"><p className="font-bold text-blue-950">School managed</p><p className="mt-1 text-sm text-blue-900">{data.schoolName ?? "The linked school"} now manages PIN resets, placement and assessment resets. Your Parent account remains read-only.</p></section> : <>
      <section className="border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Reset student PIN</h2><div className="mt-4 flex flex-wrap gap-2"><input inputMode="numeric" value={newPin} onChange={(event) => setNewPin(event.target.value.replace(/\D/g, "").slice(0, 4))} className="h-11 w-40 rounded-md border border-slate-300 px-3 text-center font-mono tracking-[0.25em]" /><button type="button" disabled={busy || newPin.length !== 4} onClick={() => void command("parent_reset_home_student_pin", { p_student_id: studentId, p_new_pin: newPin }, "PIN reset. Existing student sessions were signed out.")} className="min-h-11 rounded-md bg-blue-600 px-4 font-bold text-white disabled:bg-slate-300">Reset PIN</button></div></section>
      <section className="border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Starting levels</h2>
        <p className="mt-1 text-sm text-slate-600">Every realm is available at home. Changes stop once lessons, quizzes or a post-test have begun.</p>
        <div className="mt-4 divide-y">
          {homeRealmOptions().map((realm) => {
            const placement = data.placements.find((row) => row.realmId === realm.realmId) ?? null;
            const value = placement?.workingLevel && realm.levels.includes(placement.workingLevel)
              ? placement.workingLevel
              : realm.levels[0]!;
            return (
              <div key={realm.realmId} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-bold">{realmName(realm.realmId)}</p>
                  <p className="text-sm text-slate-500">
                    {placement
                      ? placement.entryMode === "pretest" ? "Pre-test entry" : "Ground Level entry"
                      : `Not started · starts at ${parentLevelLabel(realm.levels[0]!)}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <select value={value} onChange={(event) => void command("parent_change_home_starting_level", { p_student_id: studentId, p_realm_id: realm.realmId, p_assigned_level: event.target.value }, `${realmName(realm.realmId)} starting level updated.`)} disabled={busy} className="h-11 rounded-md border border-slate-300 bg-white px-3">
                    {realm.levels.map((level) => <option key={level}>{level}</option>)}
                  </select>
                  <button type="button" disabled={busy || !placement} onClick={() => void command("parent_reset_home_pretest", { p_student_id: studentId, p_realm_id: realm.realmId }, `${realmName(realm.realmId)} pre-test reopened. Previous results remain in history.`)} className="grid h-11 w-11 place-items-center rounded-md border border-slate-300 disabled:opacity-40" title="Reopen pre-test"><RotateCcw className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
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
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Identity linking</p>
      <h1 className="mt-2 text-3xl font-black">Link a child</h1>
      <p className="mt-2 text-slate-600">Enter the permanent Explorer Code. Progress, rewards and school history stay on the same student identity.</p>
      {!preview ? (
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold">Explorer Code</span>
            <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 13))} placeholder="RLQ-ABCD-2345" className="mt-2 h-14 w-full rounded-md border border-slate-300 px-4 font-mono text-lg font-black uppercase tracking-wider outline-none focus:border-blue-600" />
          </label>
          <button type="button" onClick={verify} disabled={working || code.replace(/-/g, "").length < 11} className="min-h-11 rounded-md bg-blue-600 px-5 font-bold text-white disabled:bg-slate-300">{working ? "Checking…" : "Check code"}</button>
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
            <input inputMode="numeric" autoComplete="one-time-code" value={studentPin} onChange={(event) => setStudentPin(event.target.value.replace(/\D/g, "").slice(0, 4))} className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-center font-mono text-xl font-black tracking-[0.3em] outline-none focus:border-blue-600" aria-label="Child's 4-digit access code" />
          </label> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={confirm} disabled={working || (!preview.alreadyLinked && studentPin.length !== 4)} className="min-h-11 rounded-md bg-blue-600 px-5 font-bold text-white disabled:bg-slate-300">{working ? "Linking…" : preview.alreadyLinked ? "Return to Parent Home" : "Confirm link"}</button>
            <button type="button" onClick={() => { window.sessionStorage.removeItem("lul_pending_parent_explorer_code_v1"); setCode(""); setPreview(null); setStudentPin(""); }} className="min-h-11 rounded-md border border-slate-300 px-5 font-bold">Use another code</button>
          </div>
        </div>
      )}
      {error ? <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p> : null}
    </section>
  );
}

type WeekStatus = "done" | "skipped" | "current" | "in-progress" | "not-done" | "not-needed" | "coming-up";

const WEEK_STATUS_CHIP: Record<WeekStatus, { label: string; className: string }> = {
  done: { label: "Done", className: "bg-lime-100 text-lime-900" },
  skipped: { label: "Skipped", className: "bg-slate-200 text-slate-800" },
  current: { label: "This week", className: "bg-[#121314] text-white" },
  "in-progress": { label: "In progress", className: "bg-amber-100 text-amber-900" },
  "not-done": { label: "Not done", className: "bg-slate-100 text-slate-700" },
  "not-needed": { label: "Not needed", className: "text-slate-600" },
  "coming-up": { label: "Coming up", className: "text-slate-600" },
};

export function ParentRealmDetail({ studentId, realmId }: { studentId: string; realmId: string }) {
  const router = useRouter();
  const [data, setData] = useState<RealmSnapshot | null>(null);
  const [skips, setSkips] = useState<ParentWeekSkips | null>(null);
  const [error, setError] = useState(false);
  const [skipRequest, setSkipRequest] = useState<SkipWeekRequest | null>(null);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.replace("/login");
      return;
    }
    const [result, skipResult] = await Promise.all([
      supabase.rpc("get_parent_child_realm_snapshot", { p_student_id: studentId, p_realm_id: realmId }),
      fetchParentWeekSkips(studentId).catch(() => null),
    ]);
    if (result.error || !result.data) setError(true);
    else setData(result.data as RealmSnapshot);
    setSkips(skipResult);
  }, [realmId, router, studentId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (error) return <Notice message="This child or realm is not available to your account." />;
  if (!data) return <ParentSkeleton />;
  if (!data.current) {
    return <div className="space-y-4"><h1 className="font-display text-3xl font-black">{realmName(realmId)}</h1><div className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-lg font-bold">Not started</p><p className="mt-2 text-slate-600">{data.displayName} starts this realm with a pre-test, which sets the level.</p></div></div>;
  }

  const current = data.current;
  const childName = data.displayName.split(" ")[0] ?? data.displayName;
  const levelLabel = parentLevelLabel(current.workingLevel);
  const plannedWeeks = parentCurriculumWeeks(realmId, current.workingLevel);
  const allWeeks = plannedWeeks.length
    ? plannedWeeks.map((planned) => data.weeks.find((week) => week.week === planned.week) ?? {
      week: planned.week,
      required: current.requiredWeeks.includes(planned.week),
      focus: planned.title,
      lessons: [],
      quiz: null,
    })
    : data.weeks;
  const skip = realmSkipState(skips, realmId, current.workingLevel, current.currentWeek);
  const skippedOn = new Map(skip.skippedWeeks.map((entry) => [entry.week, entry.skippedAt]));
  const pretest = data.assessments.find((item) => item.type.toLowerCase().includes("pre"));
  const posttest = data.assessments.find((item) => item.type.toLowerCase().includes("post"));
  const weekCount = skip.weekCount ?? allWeeks.length;
  const palette = parentRealmPalette(realmId);

  function statusFor(week: WeekResult): WeekStatus {
    if (week.quiz?.status === "Completed") return "done";
    if (skippedOn.has(week.week)) return "skipped";
    if (week.week === current.currentWeek) return "current";
    if (week.quiz || week.lessons.length) return "in-progress";
    if (current.currentWeek && week.week < current.currentWeek) return week.required ? "not-done" : "not-needed";
    return "coming-up";
  }

  function requestSkip() {
    if (!current.currentWeek) return;
    setSkipRequest({
      studentId,
      childName,
      realmId,
      levelLabel,
      week: current.currentWeek,
      weekTitle: parentCurriculumWeek(realmId, current.workingLevel, current.currentWeek)?.title ?? null,
      skipsLeft: skip.skipsLeft,
      limit: skip.limit,
    });
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-[#121314] text-white">
        <div className="absolute inset-y-0 right-0 w-full bg-cover bg-center opacity-30 sm:w-3/5 sm:opacity-45" style={{ backgroundImage: `url('${palette.image}')` }} aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,#121314_0%,#121314_42%,rgba(18,19,20,0.3)_100%)]" aria-hidden="true" />
        <div className="relative space-y-6 p-6 sm:p-8">
          <div>
            <p className="text-sm text-white/75">{data.displayName}</p>
            <h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">{palette.name}</h1>
          </div>
          <dl className="grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            <RealmStat label="Level" value={levelLabel} />
            <RealmStat label="Up to" value={current.currentWeek ? `Week ${current.currentWeek} of ${weekCount}` : "Pre-test next"} />
            <RealmStat label="Pre-test" value={pretest ? `${pretest.score}%` : "Not done"} />
            {skip.known ? <RealmStat label={skip.offered ? "Skips left" : "Weeks"} value={skip.offered ? `${skip.skipsLeft} of ${skip.limit}` : "Set by teacher"} /> : null}
          </dl>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pb-3 pt-5 sm:px-7">
          <h2 className="font-display text-xl font-black">Week by week</h2>
          <p className="text-sm text-slate-600">Each week&apos;s quiz needs {ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent}% to open the next week</p>
        </div>
        {allWeeks.length ? (
          <ul>
            {allWeeks.map((week) => (
              <WeekRow
                key={week.week}
                week={week}
                status={statusFor(week)}
                realmId={realmId}
                workingLevel={current.workingLevel}
                skippedAt={skippedOn.get(week.week) ?? null}
                skipAction={week.week === current.currentWeek && skip.canSkipNow ? requestSkip : null}
              />
            ))}
            <li className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 bg-[#FAFAF8] px-5 py-4 sm:px-7">
              <span className="w-20 font-black">Post-test</span>
              <span className="min-w-0 flex-1 text-slate-700">
                {posttest
                  ? `${posttest.correct} / ${posttest.attempted} · ${posttest.score}% (${posttest.status})`
                  : `Checks all of ${levelLabel}${pretest ? ` against ${childName}'s ${pretest.score}% pre-test` : ""}.`}
              </span>
              <span className="text-sm text-slate-600">{posttest ? formatAchievementDate(posttest.completedAt) : `After Week ${weekCount}`}</span>
            </li>
          </ul>
        ) : <p className="px-5 pb-5 text-slate-600 sm:px-7">No weekly curriculum is available for this level yet.</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="font-display text-xl font-black">Test results</h2>
        <div className="mt-3 divide-y divide-slate-100">
          {data.assessments.length ? data.assessments.map((item) => (
            <div key={item.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6">
              <span className="font-bold">{levelLabel} {assessmentName(item.type)}</span>
              <span>{item.correct} / {item.attempted} · {item.score}%</span>
              <span className="text-slate-600">{formatAchievementDate(item.completedAt)}</span>
            </div>
          )) : <p className="py-3 text-slate-600">No assessments completed yet.</p>}
        </div>
      </section>

      <SkipWeekDialog request={skipRequest} onClose={() => setSkipRequest(null)} onSkipped={() => { setSkipRequest(null); void load(); }} />
    </div>
  );
}

function RealmStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-[var(--reliq-lime)] pl-3">
      <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/60">{label}</dt>
      <dd className="mt-1 font-display text-lg font-black sm:text-xl">{value}</dd>
    </div>
  );
}

function WeekRow({ week, status, realmId, workingLevel, skippedAt, skipAction }: {
  week: WeekResult;
  status: WeekStatus;
  realmId: string;
  workingLevel: string;
  skippedAt: string | null;
  skipAction: (() => void) | null;
}) {
  const plan = parentCurriculumWeek(realmId, workingLevel, week.week);
  const plannedLessons = plan?.lessons ?? [];
  const lessons = plannedLessons.length
    ? plannedLessons.map((planned) => ({ number: planned.lesson, title: planned.title, result: week.lessons.find((lesson) => lesson.lesson === planned.lesson) }))
    : week.lessons.map((result) => ({ number: result.lesson, title: result.lessonName, result }));
  const lessonsDone = lessons.filter((lesson) => lesson.result?.status === "Completed").length;
  const chip = WEEK_STATUS_CHIP[status];
  const muted = status === "coming-up" || status === "skipped" || status === "not-needed";

  return (
    <li className={`border-t border-slate-100 ${status === "current" ? "border-l-4 border-l-[var(--reliq-lime)] bg-[#FBFEF5]" : status === "skipped" ? "bg-[#FAFAF8]" : ""}`}>
      <details open={status === "current"} className="group">
        <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 sm:px-7 [&::-webkit-details-marker]:hidden">
          <span className={`w-20 font-black ${muted ? "text-slate-600" : ""}`}>Week {week.week}</span>
          <span className="min-w-0 flex-1">
            <span className={`block font-semibold ${muted ? "text-slate-600" : ""}`}>{plan?.title ?? week.focus ?? "Learning focus"}</span>
            {skippedAt ? <span className="block text-sm text-slate-600">Skipped on {formatAchievementDate(skippedAt)}. Still open to revisit; no XP or Chrono Crystals.</span> : null}
          </span>
          {status !== "coming-up" && status !== "not-needed" ? <span className="text-sm text-slate-600">{lessonsDone} of {lessons.length} lessons</span> : null}
          {week.quiz ? <span className={`w-24 text-right font-black ${weeklyQuizPassed(week.quiz.accuracy) ? "text-[#3F7A00]" : "text-orange-700"}`}>Quiz {week.quiz.accuracy}%</span> : null}
          <span className={`rounded-full px-2.5 py-1 text-xs font-black ${chip.className}`}>{chip.label}</span>
          <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="space-y-1 px-5 pb-4 sm:pl-[124px] sm:pr-7">
          {lessons.map(({ number, title, result }) => (
            <div key={number} className="flex flex-wrap items-center gap-x-4 gap-y-0.5 border-b border-slate-100 py-2.5 text-sm last:border-b-0">
              <span className="w-16 font-bold text-slate-600">Lesson {number}</span>
              <span className="min-w-0 flex-1">{title}</span>
              {result ? <span className="text-slate-600">{result.attempts} {result.attempts === 1 ? "try" : "tries"}</span> : null}
              <span className={`w-14 text-right font-black ${result ? (weeklyQuizPassed(result.accuracy) ? "text-[#3F7A00]" : "text-amber-700") : "text-slate-400"}`}>{result ? `${result.accuracy}%` : "—"}</span>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 py-2.5 text-sm">
            <span className="w-16 font-bold text-slate-600">Quiz</span>
            <span className="min-w-0 flex-1">{week.quiz ? `${week.quiz.correct} / ${week.quiz.attempted} correct · ${week.quiz.attempts} ${week.quiz.attempts === 1 ? "try" : "tries"}` : `Week ${week.week} quiz · needs ${ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent}% to open the next week`}</span>
            <span className={`w-14 text-right font-black ${week.quiz ? (weeklyQuizPassed(week.quiz.accuracy) ? "text-[#3F7A00]" : "text-orange-700") : "text-slate-400"}`}>{week.quiz ? `${week.quiz.accuracy}%` : "—"}</span>
          </div>
          {skipAction ? <button type="button" onClick={skipAction} className="mt-2 min-h-10 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-bold hover:border-slate-900">Skip Week {week.week}</button> : null}
        </div>
      </details>
    </li>
  );
}

function ParentSkeleton() {
  return <div className="space-y-4" aria-label="Loading Parent Home"><div className="h-10 w-64 animate-pulse bg-slate-200" /><div className="grid gap-5 md:grid-cols-2"><div className="h-72 animate-pulse bg-white" /><div className="h-72 animate-pulse bg-white" /></div></div>;
}

function Notice({ message }: { message: string }) {
  return <div className="border border-red-200 bg-white p-6"><p className="font-bold text-red-800">{message}</p></div>;
}
