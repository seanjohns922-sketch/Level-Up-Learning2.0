"use client";

import { ArrowLeft, Brain, Check, ChevronDown, ClipboardList, Copy, LogOut, Settings, SquareCheck, UserCog, UserPlus, Users } from "lucide-react";
import ReliqAdultLogo from "@/components/brand/ReliqAdultLogo";

/** Review-only: the class dashboard header today, and two less crowded layouts. */

const LOGO = "/schools/cobram-primary-logo.png";
const QUIET_ICON = "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#8F948C] hover:bg-[#222426] hover:text-white";

function MenuItem({ icon: Icon, title, detail }: { icon: typeof Users; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-[#F1F2EE]">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#121314]" />
      <div><p className="text-sm font-bold text-[#121314]">{title}</p><p className="text-xs text-[#5A5E63]">{detail}</p></div>
    </div>
  );
}

function BrainBreakPicker() {
  return (
    <div className="px-3 py-2.5">
      <p className="flex items-center gap-2 text-sm font-bold text-[#121314]"><Brain className="h-4 w-4" />Brain breaks</p>
      <p className="mt-0.5 pl-6 text-xs text-[#5A5E63]">How often mini-games appear mid-lesson. Override per student in their card.</p>
      <div className="mt-2 ml-6 grid grid-cols-3 gap-1 rounded-full bg-[#F1F2EE] p-1 text-xs font-bold">
        {["Minimal", "Normal", "Frequent"].map((f) => <span key={f} className={`rounded-full py-1.5 text-center ${f === "Normal" ? "bg-[#121314] text-white" : "text-[#5A5E63]"}`}>{f}</span>)}
      </div>
    </div>
  );
}

function ClassMenu({ withPlacements = false }: { withPlacements?: boolean }) {
  return (
    <div className="absolute right-14 top-11 z-10 w-80 rounded-2xl border border-[#E2E3DE] bg-white p-2 shadow-2xl">
      <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8F948C]">Class 3/4J</p>
      {withPlacements ? <MenuItem icon={SquareCheck} title="Placements" detail="Set each student's starting level and realm" /> : null}
      <MenuItem icon={ClipboardList} title="Login details" detail="Print or share student login cards" />
      <MenuItem icon={UserPlus} title="Add / edit students" detail="Names, levels and class list" />
      <div className="my-1 h-px bg-[#EDEEE9]" />
      <BrainBreakPicker />
    </div>
  );
}

function TopBar({ open }: { open?: boolean }) {
  return (
    <div className="relative flex h-12 items-center gap-5 border-b border-[#232527] px-6">
      <ReliqAdultLogo className="w-[72px] shrink-0" />
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#A9ADA6]"><ArrowLeft className="h-4 w-4" />School Home</span>
      <div className="ml-auto flex items-center gap-1">
        <span className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-bold ${open ? "bg-[#222426] text-white" : "text-[#C9CCC6]"}`}><Users className="h-4 w-4" />Class<ChevronDown className="h-3.5 w-3.5" /></span>
        <span className={QUIET_ICON} title="Settings"><Settings className="h-[18px] w-[18px]" /></span>
        <span className={QUIET_ICON} title="Log out"><LogOut className="h-[18px] w-[18px]" /></span>
      </div>
    </div>
  );
}

function ClassIdentity() {
  return (
    <div className="flex min-w-0 items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8F948C]">Class</p>
        <h1 className="font-display text-3xl font-black leading-none tracking-tight">3/4J</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#A9ADA6]">
          <span className="inline-flex items-center gap-1.5">Class code <span className="inline-flex items-center gap-1 rounded-md bg-[#1E2022] px-1.5 py-0.5 font-mono font-extrabold text-[var(--reliq-lime)]">XWFKN<Copy className="h-3 w-3" /></span></span>
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />24 students</span>
        </div>
      </div>
    </div>
  );
}

/** A2: Class menu (login details, students, brain breaks) next to Settings; Placements stays as the one lime action. */
function OptionA2({ open = false }: { open?: boolean }) {
  return (
    <header className="relative bg-[#121314] text-white">
      <TopBar open={open} />
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 px-6 py-5">
        <ClassIdentity />
        <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-[var(--reliq-lime)] px-5 py-2.5 text-sm font-black text-[#121314]"><SquareCheck className="h-4 w-4" />Placements</span>
      </div>
      {open ? <ClassMenu /> : null}
    </header>
  );
}

/** A3: everything for the class lives in the Class menu, Placements included. */
function OptionA3({ open = false }: { open?: boolean }) {
  return (
    <header className="relative bg-[#121314] text-white">
      <TopBar open={open} />
      <div className="px-6 py-5"><ClassIdentity /></div>
      {open ? <ClassMenu withPlacements /> : null}
    </header>
  );
}

function SettingsMenuNote() {
  return (
    <div className="flex items-center gap-2 text-xs text-[#5A5E63]"><Check className="h-3.5 w-3.5 text-[#3D6600]" />Settings keeps <b className="text-[#121314]">Account Settings</b> only — <UserCog className="h-3.5 w-3.5" /> it&apos;s about you, not the class.</div>
  );
}

/** A4: top bar is just the way back and the menus; RELIQ sits big beside the class. */
function OptionA4({ open = false }: { open?: boolean }) {
  return (
    <header className="relative bg-[#121314] text-white">
      <div className="flex h-12 items-center gap-5 border-b border-[#232527] px-6">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#34373A] px-3 py-1.5 text-sm font-bold text-[#C9CCC6]"><ArrowLeft className="h-4 w-4" />School Home</span>
        <div className="ml-auto flex items-center gap-1">
          <span className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-bold ${open ? "bg-[#222426] text-white" : "text-[#C9CCC6]"}`}><Users className="h-4 w-4" />Class<ChevronDown className="h-3.5 w-3.5" /></span>
          <span className={QUIET_ICON} title="Settings"><Settings className="h-[18px] w-[18px]" /></span>
          <span className={QUIET_ICON} title="Log out"><LogOut className="h-[18px] w-[18px]" /></span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 px-6 py-6">
        <div className="flex min-w-0 items-center gap-7">
          <ReliqAdultLogo className="w-[150px] shrink-0" />
          <span className="h-14 w-px shrink-0 bg-[#34373A]" />
          <ClassIdentity />
        </div>
        <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-[var(--reliq-lime)] px-5 py-2.5 text-sm font-black text-[#121314]"><SquareCheck className="h-4 w-4" />Placements</span>
      </div>
      {open ? <ClassMenu /> : null}
    </header>
  );
}

/** Slim: the original single bar, same height, with the clutter moved into a Class menu. */
function OptionSlim({ open = false }: { open?: boolean }) {
  const box = "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#34373A] px-3 py-2 text-sm font-bold";
  return (
    <header className="relative bg-[#121314] px-5 py-3 text-white">
      <div className="flex items-center gap-3">
        <ReliqAdultLogo className="mr-1 w-[76px] shrink-0" />
        <span className={`${box} text-[#C9CCC6]`}><ArrowLeft className="h-4 w-4" />School Home</span>
        <span className="h-6 w-px shrink-0 bg-[#34373A]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
        <h1 className="font-display text-xl font-black">3/4J</h1>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#1E2022] px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-[var(--reliq-lime)]">XWFKN<Copy className="h-3 w-3" /></span>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className={`${box} ${open ? "border-[#5A5E63] bg-[#222426]" : ""}`}><Users className="h-4 w-4" />Class<ChevronDown className="h-3.5 w-3.5" /></span>
          <span className={`${box} border-transparent bg-[var(--reliq-lime)] text-[#121314]`}><SquareCheck className="h-4 w-4" />Placements</span>
          <span className={QUIET_ICON} title="Settings"><Settings className="h-[18px] w-[18px]" /></span>
          <span className={QUIET_ICON} title="Log out"><LogOut className="h-[18px] w-[18px]" /></span>
        </div>
      </div>
      {open ? <div className="absolute right-[230px] top-14 z-10 w-80 rounded-2xl border border-[#E2E3DE] bg-white p-2 shadow-2xl">
        <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8F948C]">Class 3/4J · 24 students</p>
        <MenuItem icon={ClipboardList} title="Login details" detail="Print or share student login cards" />
        <MenuItem icon={UserPlus} title="Add / edit students" detail="Names, levels and class list" />
        <div className="my-1 h-px bg-[#EDEEE9]" />
        <BrainBreakPicker />
      </div> : null}
    </header>
  );
}

/** Today's bar, for comparison. */
function Today() {
  const box = "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#34373A] px-2.5 py-2 text-sm font-bold text-white";
  const icon = "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#34373A] text-[#C9CCC6]";
  return (
    <header className="bg-[#121314] px-5 py-3 text-white">
      <div className="flex items-center gap-1.5 overflow-hidden">
        <ReliqAdultLogo className="mr-2 w-[76px] shrink-0" />
        <span className={`${box} text-[#C9CCC6]`}><ArrowLeft className="h-4 w-4" />School Home</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
        <h1 className="font-display text-lg font-black">3/4J</h1>
        <span className="h-1 w-1 rounded-full bg-[#34373A]" />
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#34373A] px-2 py-0.5 font-mono text-[11px] font-extrabold text-[var(--reliq-lime)]">XWFKN<Copy className="h-3 w-3" /></span>
        <span className="h-1 w-1 rounded-full bg-[#34373A]" />
        <Brain className="h-3.5 w-3.5 text-[#C9CCC6]" />
        <span className="rounded-md border border-[#34373A] bg-[#1C1E20] px-2 py-1 text-[11px] font-bold">Normal ▾</span>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <span className={box}><ClipboardList className="h-4 w-4" />Login details</span>
          <span className={box}><UserPlus className="h-4 w-4" />Students</span>
          <span className={`${box} border-transparent bg-[var(--reliq-lime)] text-[#121314]`}><SquareCheck className="h-4 w-4" />Placements</span>
          <span className={icon}><Settings className="h-4 w-4" /></span>
          <span className={icon}><LogOut className="h-4 w-4" /></span>
        </div>
      </div>
    </header>
  );
}

/** Compact: one bar, but RELIQ, the school logo and the class keep their big size. */
function OptionCompact({ open = false }: { open?: boolean }) {
  const box = "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#34373A] px-3 py-2 text-sm font-bold";
  return (
    <header className="relative bg-[#121314] px-6 py-4 text-white">
      <div className="flex items-center gap-6">
        <ReliqAdultLogo className="w-[150px] shrink-0" />
        <span className="h-12 w-px shrink-0 bg-[#34373A]" />
        <ClassIdentity />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className={`${box} text-[#C9CCC6]`}><ArrowLeft className="h-4 w-4" />School Home</span>
          <span className={`${box} ${open ? "border-[#5A5E63] bg-[#222426]" : ""}`}><Users className="h-4 w-4" />Class<ChevronDown className="h-3.5 w-3.5" /></span>
          <span className={`${box} border-transparent bg-[var(--reliq-lime)] text-[#121314]`}><SquareCheck className="h-4 w-4" />Placements</span>
          <span className={QUIET_ICON} title="Settings"><Settings className="h-[18px] w-[18px]" /></span>
          <span className={QUIET_ICON} title="Log out"><LogOut className="h-[18px] w-[18px]" /></span>
        </div>
      </div>
      {open ? <div className="absolute right-[230px] top-[76px] z-10 w-80 rounded-2xl border border-[#E2E3DE] bg-white p-2 shadow-2xl">
        <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8F948C]">Class 3/4J</p>
        <MenuItem icon={ClipboardList} title="Login details" detail="Print or share student login cards" />
        <MenuItem icon={UserPlus} title="Add / edit students" detail="Names, levels and class list" />
        <div className="my-1 h-px bg-[#EDEEE9]" />
        <BrainBreakPicker />
      </div> : null}
    </header>
  );
}

/** Compact, one menu: School Home stays; Placements, login details, students and brain breaks share one lime menu. */
function OptionOneMenu({ open = false }: { open?: boolean }) {
  return (
    <header className="relative bg-[#121314] px-6 py-4 text-white">
      <div className="flex items-center gap-6">
        <ReliqAdultLogo className="w-[150px] shrink-0" />
        <span className="h-12 w-px shrink-0 bg-[#34373A]" />
        <ClassIdentity />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#34373A] px-3 py-2 text-sm font-bold text-[#C9CCC6]"><ArrowLeft className="h-4 w-4" />School Home</span>
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-black text-[#121314] ${open ? "bg-[var(--reliq-lime-hover)]" : "bg-[var(--reliq-lime)]"}`}><Users className="h-4 w-4" />Manage class<ChevronDown className="h-4 w-4" /></span>
          <span className={QUIET_ICON} title="Settings"><Settings className="h-[18px] w-[18px]" /></span>
          <span className={QUIET_ICON} title="Log out"><LogOut className="h-[18px] w-[18px]" /></span>
        </div>
      </div>
      {open ? <div className="absolute right-[96px] top-[76px] z-10 w-80 rounded-2xl border border-[#E2E3DE] bg-white p-2 shadow-2xl">
        <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8F948C]">Class 3/4J</p>
        <MenuItem icon={SquareCheck} title="Placements" detail="Set each student's starting level and realm" />
        <MenuItem icon={ClipboardList} title="Login details" detail="Print or share student login cards" />
        <MenuItem icon={UserPlus} title="Add / edit students" detail="Names, levels and class list" />
        <div className="my-1 h-px bg-[#EDEEE9]" />
        <BrainBreakPicker />
      </div> : null}
    </header>
  );
}

function Frame({ label, note, children }: { label: string; note: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="font-display text-sm font-black uppercase tracking-[0.18em] text-[#121314]">{label}</h2>
        <p className="text-sm text-[#5A5E63]">{note}</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#D9DBD4] bg-[#F4F4F0]">
        {children}
        <div className="h-20 px-6 pt-5"><div className="h-10 rounded-xl bg-white" /></div>
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-[#8F948C]">Laptop width (1280px)</p>
      <div className="w-[1280px] max-w-full overflow-hidden rounded-2xl border border-[#D9DBD4]">{children}</div>
    </section>
  );
}

function Open({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[#8F948C]">{label}</p>
      <div className="h-[460px] overflow-hidden rounded-2xl border border-[#D9DBD4] bg-[#F4F4F0]">{children}</div>
    </section>
  );
}

export default function ClassHeaderReview() {
  return (
    <main className="reliq-adult min-h-screen bg-white px-6 py-8">
      <div className="mx-auto grid max-w-[1700px] gap-12">
        <div>
          <ReliqAdultLogo variant="onLight" className="w-[120px]" />
          <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-tight text-[#121314]">Class dashboard header — options</h1>
          <p className="mt-1 text-sm text-[#5A5E63]">The bar across the top of a teacher&apos;s class page. Today&apos;s version first, then six tidier options.</p>
        </div>
        <Frame label="Today" note="Everything on one line in the same boxes, so it feels crowded and nothing stands out.">
          <Today />
        </Frame>
        <Frame label="Compact, one menu (new)" note="School Home stays where it is. Placements, Login details, Add / edit students and Brain breaks all live in one lime Manage class menu.">
          <OptionOneMenu />
        </Frame>
        <Open label="Compact, one menu — open"><OptionOneMenu open /></Open>
        <Frame label="Compact — one bar, big RELIQ (new)" note="The small single bar you liked, but RELIQ, the school logo and 3/4J stay big. School Home, Class menu and Placements sit together on the right — no second row.">
          <OptionCompact />
        </Frame>
        <Open label="Compact with the Class menu open"><OptionCompact open /></Open>
        <Frame label="Slim — the original single bar, less clutter" note="Same height as today. Brain breaks, Login details and Add / edit students move into a Class menu; School Home and the class sit on the left, Placements stays lime.">
          <OptionSlim />
        </Frame>
        <Open label="Slim with the Class menu open"><OptionSlim open /></Open>
        <Frame label="Option A4 — School Home on top, RELIQ big beside the class" note="Top bar: just School Home, with Class, Settings and Log out on the right. RELIQ moves down beside 3/4J at full size.">
          <OptionA4 />
        </Frame>
        <Open label="A4 with the Class menu open"><OptionA4 open /></Open>
        <Frame label="Option A2 — Class menu next to Settings, Placements stays (recommended)" note="Login details, Add / edit students and Brain breaks move into a Class menu in the top bar. Placements stays as the one lime action because teachers use it most.">
          <OptionA2 />
        </Frame>
        <Open label="A2 with the Class menu open"><OptionA2 open /></Open>
        <Frame label="Option A3 — everything in the Class menu" note="The class bar is just the class. Placements joins the Class menu too — calmest, but Placements is one more click.">
          <OptionA3 />
        </Frame>
        <Open label="A3 with the Class menu open"><OptionA3 open /></Open>
        <SettingsMenuNote />
      </div>
    </main>
  );
}
