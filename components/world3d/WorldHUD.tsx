"use client";

import "./world-hud-phone.css";
import PatternExtensionLinks from "@/components/assessment/PatternExtensionLinks";
import StatisticsExtensionLinks from "@/components/assessment/StatisticsExtensionLinks";
import SpaceExtensionLinks from "@/components/assessment/SpaceExtensionLinks";
import MeasurementExtensionLinks from "@/components/assessment/MeasurementExtensionLinks";
import NumberExtensionLinks from "@/components/assessment/NumberExtensionLinks";
import { Car, DoorOpen, Dribbble, Flag, Hammer, Home, Map, Play, Sparkles, UserRound, X, Zap } from "lucide-react";
import { RELIQ_LETTERS_PATH, RELIQ_Q_PATH } from "@/lib/brand-reliq-logo-paths";
import { WorldLoadingVeil } from "@/components/world3d/WorldLoadingVeil";
import { FullscreenToggle } from "@/components/FullscreenToggle";
import { reliqRealmColor } from "@/components/brand/ReliqRealmLogo";
import { readProgress, type ProgressRealmScope } from "@/data/progress";
import { formatStudentLevelLabel } from "@/lib/studentLevelLabel";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { fetchStudentEconomy } from "@/lib/economy";
import { fetchStudentActivityDaily } from "@/lib/student-activity";
import { CHRONOROK_OPEN_DAYS, CRYSTALS_TO_AWAKEN, chronorokProgress } from "@/lib/chronorok";
import type { CanonicalRealmId } from "@/lib/realms/realm-registry";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { TOWER_REALM_PORTALS } from "@/lib/world3d/tower-realm-chamber-config";
import { resolveTowerRealmEntry } from "@/lib/world3d/tower-realm-entry";
import { resolveWorldJourney, type WorldJourney } from "@/lib/world3d/world-journey";
import { joinSpeechParts, WorldVoiceButton } from "@/components/world3d/WorldVoiceButton";
import DemoModeNavigationControls from "@/components/demo/DemoModeNavigationControls";
import { StreakFlame } from "@/components/streak/StreakParts";
import { streakPrompt, useLearningStreak } from "@/lib/learning-streak";

export type WorldHUDContext = "central" | "tower" | "realm";

type WorldHUDAction = {
  label: string;
  icon?: "door" | "map" | "edit" | "home" | "flag" | "ball" | "car";
  onClick: () => void;
};

// Students always see the RELIQ logo with the violet Q.
const STUDENT_VIOLET = "#C94DF2";

/** Where this learner is up to in a realm, from their saved progress, e.g. "Level 3 · Week 4". */
function realmProgressLabel(realmId: CanonicalRealmId): string | null {
  try {
    const progress = readProgress(realmId as ProgressRealmScope);
    if (!progress?.year) return null;
    const level = formatStudentLevelLabel(progress.year);
    if (progress.status === "ASSIGNED_PROGRAM" && progress.assignedWeek) return `${level} · Week ${progress.assignedWeek}`;
    return level;
  } catch {
    return null;
  }
}

const fallbackJourney: WorldJourney = {
  route: "/realms",
  realmName: "Your learning journey",
  activityLabel: "Your next activity is ready",
};

function compactXp(value: number | null) {
  if (value == null) return "-- XP";
  if (value >= 100000) return `${Math.floor(value / 1000)}K XP`;
  return `${value.toLocaleString()} XP`;
}

export function WorldHUD({
  context,
  preview = false,
  accent = "#efbd61",
  mission,
  primaryAction,
  navActions,
  fallbackHref,
  onQuickStart,
  contextAction,
  realmId,
}: {
  context: WorldHUDContext;
  preview?: boolean;
  accent?: string;
  mission?: { eyebrow?: string; title: string; detail: string };
  primaryAction?: WorldHUDAction;
  navActions?: Array<{ key: string; label: string; icon?: React.ReactNode; onClick: () => void }>;
  fallbackHref: string;
  onQuickStart?: () => void | Promise<void>;
  /** Central hub: what the main dock button does near an object ("Enter my home"). */
  contextAction?: WorldHUDAction;
  /** Realm worlds: colours the logo's Q with the realm's official RELIQS colour. */
  realmId?: CanonicalRealmId;
}) {
  const router = useRouter();
  const [journey, setJourney] = useState<WorldJourney>(fallbackJourney);
  const [quickStartBusy, setQuickStartBusy] = useState(false);
  const [teleportOpen, setTeleportOpen] = useState(false);
  const [busyRealmId, setBusyRealmId] = useState<CanonicalRealmId | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [xp, setXp] = useState<number | null>(null);
  const streak = useLearningStreak();
  const [streakReminderClosed, setStreakReminderClosed] = useState(false);
  const [crystals, setCrystals] = useState<{ crystals: number; open: boolean; learningDays: number } | null>(null);

  const refreshJourney = useCallback(() => {
    void resolveWorldJourney().then(setJourney).catch(() => setJourney(fallbackJourney));
  }, []);

  useEffect(() => {
    refreshJourney();
    window.addEventListener("focus", refreshJourney);
    return () => window.removeEventListener("focus", refreshJourney);
  }, [refreshJourney]);

  useEffect(() => {
    const profile = getActiveStudentProfile();
    if (!profile?.studentId) return;
    let cancelled = false;
    void fetchStudentEconomy(profile.studentId)
      .then((economy) => { if (!cancelled) setXp(economy.wallet.xp_balance); })
      .catch(() => { if (!cancelled) setXp(null); });
    return () => { cancelled = true; };
  }, []);

  // Chrono Crystals: one per learning day this school year (see lib/chronorok).
  useEffect(() => {
    const profile = getActiveStudentProfile();
    if (preview) { queueMicrotask(() => setCrystals({ crystals: 63, open: true, learningDays: 63 })); return; }
    if (!profile?.studentId) return;
    let cancelled = false;
    void fetchStudentActivityDaily(profile.studentId)
      .then((rows) => { if (!cancelled) setCrystals(chronorokProgress(rows)); })
      .catch(() => { if (!cancelled) setCrystals(null); });
    return () => { cancelled = true; };
  }, [preview]);

  async function quickStart() {
    if (quickStartBusy) return;
    setQuickStartBusy(true);
    if (onQuickStart) {
      try { await onQuickStart(); }
      finally { setQuickStartBusy(false); }
      return;
    }
    try {
      const resolved = await resolveWorldJourney();
      setJourney(resolved);
      router.push(resolved.route);
    } catch {
      router.push(fallbackHref);
    }
  }

  async function enterRealm(realmId: CanonicalRealmId) {
    if (busyRealmId) return;
    setBusyRealmId(realmId);
    setMessage(null);
    try {
      const result = await resolveTowerRealmEntry({ realmId, teacherPreview: preview });
      if (result.status === "unavailable") {
        setMessage(result.message);
        setBusyRealmId(null);
        return;
      }
      router.push(result.route);
    } catch {
      setMessage("That realm could not be opened. Please try again.");
      setBusyRealmId(null);
    }
  }

  const displayedMission = mission ?? (
    context === "central"
      ? {
          eyebrow: "CENTRAL HUB",
          title: "RELIQ World",
          detail: `Next up: ${journey.realmName} · ${journey.activityLabel}`,
        }
      : {
          eyebrow: context === "realm" ? "CURRENT MISSION" : "REALM CHAMBER",
          title: context === "tower" ? "Tower of Knowledge" : journey.realmName,
          detail: context === "tower" ? "Choose a realm or quick start your next activity." : journey.activityLabel,
        }
  );
  const missionSpeech = joinSpeechParts([displayedMission.eyebrow ?? (context === "realm" ? "Current mission" : "Current journey"), displayedMission.title, displayedMission.detail]);
  const primaryActionSpeech = primaryAction ? `${primaryAction.label}. Button.` : null;
  const hubLayout = context === "central" || context === "tower";
  // The main button says exactly what happens next.
  const lessonMatch = /lesson\s*(\d+)/i.exec(journey.activityLabel);
  const primaryLabel = context === "realm"
    ? (/post-?test/i.test(journey.activityLabel) ? "TAKE THE POST-TEST" : /pre-?test/i.test(journey.activityLabel) ? "TAKE THE PRE-TEST" : /quiz/i.test(journey.activityLabel) ? "TAKE THE QUIZ" : lessonMatch ? `START LESSON ${lessonMatch[1]}` : "QUICK START")
    : "QUICK START";
  const worldActionsSpeech = joinSpeechParts([
    "World actions",
    hubLayout ? (contextAction ? `${contextAction.label}. Button.` : null) : quickStartBusy ? "Quick Start is opening" : `Quick Start. ${journey.activityLabel}`,
    "Realms. Opens fast travel to the learning realms.",
    hubLayout ? primaryActionSpeech : null,
    hubLayout ? null : "2D View. Opens the normal map view.",
  ]);

  return (
    <>
      <WorldLoadingVeil label={context === "central" ? "Loading your world" : context === "tower" ? "Entering the Tower" : "Entering the realm"} />
      <div className="worldHud" data-world-hud={context} style={{ "--world-accent": realmId ? reliqRealmColor(realmId) : accent } as React.CSSProperties}>
        {context === "central" || context === "tower" ? (
          <section className="worldHudStart" aria-label="Start learning">
            <svg viewBox="0 0 279 79" className="worldHudLogo" role="img" aria-label="RELIQ"><path fill="#fff" d={RELIQ_LETTERS_PATH} /><path fill={STUDENT_VIOLET} d={RELIQ_Q_PATH} /></svg>
            <div className="worldHudStartCard">
              <div className="worldHudStartHead">
                <div><span>NEXT UP</span><strong>{journey.realmName} · {journey.activityLabel}</strong></div>
                <WorldVoiceButton text={joinSpeechParts(["Next up", journey.realmName, journey.activityLabel])} compact label="Read next up" />
              </div>
            </div>
          </section>
        ) : (
        <div className="worldHudRealmTop">
        {/* Real RELIQ logo; in each realm the Q takes the realm's colour. */}
        <svg viewBox="0 0 279 79" className="worldHudLogo" role="img" aria-label="RELIQ"><path fill="#fff" d={RELIQ_LETTERS_PATH} /><path fill={realmId ? reliqRealmColor(realmId) : accent} d={RELIQ_Q_PATH} /></svg>
        <section className="worldHudMission" aria-label={displayedMission.eyebrow ?? "Current mission"}>
          <div className="worldHudMissionText">
            <span>{displayedMission.eyebrow ?? (context === "realm" ? "CURRENT MISSION" : "CURRENT JOURNEY")}</span>
            <strong>{displayedMission.title}</strong>
            <small>{displayedMission.detail}</small>
          </div>
          <WorldVoiceButton text={missionSpeech} compact className="worldHudRead" label="Read current mission" />
        </section>
        </div>
        )}

        <div className="worldHudIdentity">
          {/* Renders only in Demo Preview; students never see these controls. */}
          <DemoModeNavigationControls
            size="hud"
            accent={accent}
            accentText="#1d2422"
            text="#fff4dd"
            background="rgba(24,22,21,.82)"
            border="1px solid rgba(255,235,195,.28)"
          />
          {navActions?.length || (!hubLayout && !preview) ? (
            <div className="worldHudNavGroup">
              {(navActions ?? []).map((action) => (
                <button key={action.key} type="button" className="worldHudGoBtn" onClick={action.onClick} aria-label={action.label}>{action.icon}<span>{action.label}</span></button>
              ))}
            </div>
          ) : null}
          <div className="worldHudStats">
          <div className="worldHudXp" title="Experience points"><Zap size={15} aria-hidden="true" />{compactXp(xp)}</div>
          {streak ? (
            <button type="button" className={`worldHudStreak${streak.todayDone ? "" : " isPending"}`} onClick={() => router.push("/earn-xp")}
              title="Ways to earn XP" aria-label={`${streak.streak}-day learning streak${streak.todayDone ? "" : ", not done today"}. See ways to earn XP.`}>
              <StreakFlame className="h-[15px] w-[15px]" />{streak.streak}
            </button>
          ) : null}
          {crystals ? (
            <button type="button" className="worldHudCrystals" onClick={() => router.push(preview ? "/world/chronorok?teacher_preview=1" : "/world/chronorok")}
              title={crystals.open ? `Chrono Crystals: ${crystals.crystals} of ${CRYSTALS_TO_AWAKEN}` : `Learn on ${Math.max(0, CHRONOROK_OPEN_DAYS - crystals.learningDays)} more days to open Chronorok`}
              aria-label={crystals.open ? `Chrono Crystals, ${crystals.crystals} of ${CRYSTALS_TO_AWAKEN}. Open Chronorok.` : `Chrono Crystals, ${crystals.crystals}. Chronorok opens after ${CHRONOROK_OPEN_DAYS} learning days.`}>
              <svg width="15" height="19" viewBox="0 0 80 100" aria-hidden="true"><polygon points="40,2 66,30 56,94 24,94 14,30" fill="#ffc94a" /><polygon points="40,2 66,30 40,40" fill="#fff8e0" /><polygon points="40,40 66,30 56,94" fill="#d9770f" /><polygon points="40,40 14,30 24,94" fill="#ffd77a" /></svg>
              <span>{crystals.crystals}<small>/{CRYSTALS_TO_AWAKEN}</small></span>
              <i aria-hidden="true"><b style={{ width: `${(crystals.crystals / CRYSTALS_TO_AWAKEN) * 100}%` }} /></i>
            </button>
          ) : null}
          <FullscreenToggle icon className="h-9 w-9 rounded-full text-white transition hover:bg-white/10" />
          <button type="button" className="worldHudIcon worldHudAvatar" onClick={() => router.push("/profile")} aria-label="Open profile" title="Profile"><UserRound size={19} /></button>
          <WorldVoiceButton text={joinSpeechParts([`Experience points. ${compactXp(xp)}.`, streak ? `Learning streak. ${streak.streak} days.` : null, crystals ? `Chrono Crystals. ${crystals.crystals} of ${CRYSTALS_TO_AWAKEN}.` : null, "Profile button."])} compact label="Read my points" />
          </div>
        </div>

        {context === "central" && streak && streak.streak > 0 && !streak.todayDone && !streakReminderClosed ? (
          <div className="worldHudStreakReminder" role="status">
            <span className="worldHudStreakBadge"><StreakFlame className="h-7 w-7" /></span>
            <span className="worldHudStreakText">
              <strong>{streak.nextDay && streak.nextDay - streak.streak === 1 ? `One lesson today = +${streak.nextXp.toLocaleString()} XP` : `Keep your ${streak.streak}-day streak`}</strong>
              <span>{streak.nextDay && streak.nextDay - streak.streak === 1 ? `It turns your ${streak.streak}-day streak into ${streak.nextDay}.` : streakPrompt(streak) ?? "Do a lesson or quiz today."}</span>
            </span>
            <button type="button" className="worldHudStreakGo" disabled={quickStartBusy} onClick={() => void quickStart()}>Start lesson</button>
            <button type="button" className="worldHudStreakClose" onClick={() => setStreakReminderClosed(true)} aria-label="Close streak reminder"><X size={16} /></button>
          </div>
        ) : null}

        <nav className={`worldHudActions${contextAction ? " worldHudActionsWithContext" : ""}`} aria-label="World actions">
          <WorldVoiceButton text={worldActionsSpeech} className="worldHudActionRead" label="Read world actions" />
          {contextAction ? (
            <button type="button" className="worldHudContext" onClick={contextAction.onClick}>
              {contextAction.icon === "home" ? <Home size={17} /> : contextAction.icon === "flag" ? <Flag size={17} /> : contextAction.icon === "ball" ? <Dribbble size={17} /> : contextAction.icon === "car" ? <Car size={17} /> : <DoorOpen size={17} />}{contextAction.label}<kbd aria-hidden="true">E</kbd>
            </button>
          ) : null}
          {!hubLayout && primaryAction ? (
            <button type="button" className="worldHudSecondary worldHudWithLabel" onClick={primaryAction.onClick}>
              {primaryAction.icon === "map" ? <Map size={17} /> : <DoorOpen size={17} />}{primaryAction.label === "RETURN TO TOWER" ? "TOWER" : primaryAction.label}
            </button>
          ) : null}
          <button type="button" className="worldHudSecondary worldHudWithLabel" onClick={() => setTeleportOpen(true)}><Sparkles size={17} />REALMS</button>
          <button type="button" className="worldHudPrimary" disabled={quickStartBusy} onClick={() => void quickStart()}><Play size={16} fill="currentColor" />{quickStartBusy ? "OPENING..." : primaryLabel}</button>
          {hubLayout && primaryAction ? <button type="button" className="worldHudSecondary worldHudWithLabel" onClick={primaryAction.onClick}>{primaryAction.icon === "door" ? <DoorOpen size={17} /> : <Hammer size={17} />}{primaryAction.label}</button> : null}
        </nav>

      </div>

      {teleportOpen ? (
        <div className="worldTeleportBackdrop" role="dialog" aria-modal="true" aria-label="Realm Teleport">
          <section className="worldTeleportPanel">
            <NumberExtensionLinks/><MeasurementExtensionLinks/><SpaceExtensionLinks/><StatisticsExtensionLinks/><PatternExtensionLinks/>
            <header><div><span>FAST TRAVEL</span><h2>REALM TELEPORT</h2></div><div className="worldTeleportHeaderActions"><WorldVoiceButton text="Fast travel. Realm Teleport. Choose a learning realm to enter." label="Read Realm Teleport" /><button type="button" onClick={() => setTeleportOpen(false)} aria-label="Close Realm Teleport" title="Close"><X size={20} /></button></div></header>
            <div className="worldTeleportGrid">
              {TOWER_REALM_PORTALS.map((portal) => {
                // Chronorok is the games realm: live but never a lesson choice. It opens with the Chrono Crystals.
                const games = portal.realmId === "time" && portal.realm.status === "live";
                const gamesOpen = games && (preview || Boolean(crystals?.open));
                const gamesWait = games && !gamesOpen ? `Opens after ${CHRONOROK_OPEN_DAYS} learning days` : null;
                const live = (portal.realm.status === "live" && portal.realm.isSelectable) || gamesOpen;
                const available = live || (preview && (portal.realmId === "pattern" || portal.realmId === "chance"));
                const portalSpeech = joinSpeechParts([portal.realm.name, portal.subject, available ? (live ? "Enter realm" : "Preview realm") : gamesWait ?? "Coming soon"]);
                return (
                  <div key={portal.realmId} className={`worldTeleportTile ${!available || busyRealmId ? "worldTeleportTileDisabled" : ""}`} style={{ borderColor: portal.accent }}>
                    <WorldVoiceButton text={portalSpeech} compact className="worldTeleportTileRead" label={`Read ${portal.realm.name}`} />
                    <strong>{portal.realm.name}</strong><span style={{ color: portal.accent }}>{portal.subject}</span><small>{available ? (live ? (games ? "ENTER REALM" : realmProgressLabel(portal.realmId)?.toUpperCase() ?? "ENTER REALM") : "PREVIEW REALM") : gamesWait ? gamesWait.toUpperCase() : "COMING SOON"}</small>
                    <button type="button" disabled={!available || Boolean(busyRealmId)} onClick={() => { if (!available) return; if (games) { router.push(preview ? "/world/chronorok?teacher_preview=1" : "/world/chronorok"); return; } void enterRealm(portal.realmId); }} aria-label={`${available ? (live ? "Enter" : "Preview") : gamesWait ?? "Coming soon"} ${portal.realm.name}`}><span>{available ? (live ? "Enter" : "Preview") : gamesWait ? "Not open yet" : "Coming soon"}</span></button>
                  </div>
                );
              })}
            </div>
            {message ? <p role="status">{message}</p> : null}
          </section>
        </div>
      ) : null}

      <style>{`
        .worldHud{position:absolute;inset:0;z-index:18;pointer-events:none;color:#fff8e8;font-family:var(--font-sans)}.worldHud button{font:inherit}
        /* Brand type (Boldly guide): Montserrat Black for labels and buttons, Barlow (Bahnschrift stand-in) for body text. */
        .worldHud .worldHudStartHead span,.worldHud .worldHudMission span,.worldHud .worldHudStartQuick,.worldHud .worldHudActions button:not(.worldVoiceButton),.worldTeleportPanel header span,.worldTeleportPanel h2,.worldTeleportGrid small,.worldTeleportGrid span{font-family:var(--font-display)!important;font-weight:900!important}
        .worldHud .worldHudActions button:not(.worldVoiceButton),.worldHud .worldHudStartQuick{letter-spacing:.05em!important}
        .worldHudMission{position:absolute;left:max(16px,env(safe-area-inset-left));top:max(16px,env(safe-area-inset-top));width:min(340px,calc(100vw - 32px));display:flex;align-items:flex-start;gap:10px;border-left:3px solid var(--world-accent);padding:10px 11px 10px 13px;background:rgba(19,24,23,.78);box-shadow:0 12px 30px rgba(0,0,0,.23);backdrop-filter:blur(9px)}
        .worldHudMissionText{min-width:0;flex:1}.worldHudRead{flex:0 0 auto;margin-top:1px}
        .worldHudMission span{display:block;color:var(--world-accent);font-size:10px;font-weight:950;letter-spacing:.16em}.worldHudMission strong{display:block;margin-top:4px;font-size:18px;line-height:1.15}.worldHudMission small{display:block;margin-top:4px;color:rgba(255,248,232,.76);font-size:12px;font-weight:650;line-height:1.3}
        .worldHudIdentity{position:absolute;right:max(16px,env(safe-area-inset-right));top:max(16px,env(safe-area-inset-top));display:flex;gap:7px;pointer-events:auto}.worldHudXp,.worldHudIcon{height:40px;border:1px solid rgba(255,235,195,.28);border-radius:5px;background:rgba(24,22,21,.82);color:#fff4dd;box-shadow:0 8px 22px rgba(0,0,0,.22);backdrop-filter:blur(9px)}.worldHudXp{display:flex;align-items:center;gap:6px;padding:0 8px 0 11px;font-size:12px;font-weight:900}.worldHudXp svg{color:var(--world-accent)}.worldHudXp .worldVoiceButton{margin-left:2px}
        .worldHud .worldHudCrystals{position:relative;display:flex;align-items:center;gap:7px;height:44px;padding:0 13px 0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(16,14,24,.78);color:#ffe9b0;font:900 14px var(--font-display);box-shadow:0 8px 20px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.1);backdrop-filter:blur(9px);cursor:pointer;white-space:nowrap}
        .worldHud .worldHudCrystals svg{filter:drop-shadow(0 0 6px rgba(255,190,70,.9))}.worldHud .worldHudCrystals small{font-size:10px;opacity:.7;margin-left:1px}
        .worldHud .worldHudCrystals i{position:absolute;left:14px;right:14px;bottom:5px;height:3px;border-radius:9px;background:rgba(255,255,255,.14);overflow:hidden}.worldHud .worldHudCrystals i b{display:block;height:100%;background:linear-gradient(90deg,#ffb347,#ffe08a)}.worldHudIcon{width:40px;display:grid;place-items:center;cursor:pointer}
        .worldHudActions{position:absolute;right:max(16px,env(safe-area-inset-right));bottom:max(70px,calc(env(safe-area-inset-bottom) + 64px));display:flex;align-items:center;justify-content:flex-end;gap:7px;pointer-events:auto}.worldHudActions button:not(.worldVoiceButton){min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:5px;padding:9px 12px;font-size:12px;font-weight:950;cursor:pointer;white-space:nowrap}.worldHudSecondary,.worldHudFallback{border:1px solid rgba(255,235,195,.3);background:rgba(24,22,21,.88);color:#fff5df}.worldHudQuick{border:1px solid color-mix(in srgb,var(--world-accent),#fff 20%);background:var(--world-accent);color:#1d2422}.worldHudFallback{padding-inline:10px!important}.worldHudActions button:disabled{opacity:.65;cursor:default}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudActions{left:50%;right:auto;transform:translateX(-50%);max-width:calc(100vw - 340px);flex-wrap:wrap;justify-content:center}
        .worldHudEditInline{margin-left:8px;background:rgba(24,22,21,.66)!important}
        /* Near a door the Enter button joins the bar; labelled extras shrink to icons so it stays one row below the explorer. */
        .worldHud.worldHud.worldHud .worldHudActions.worldHudActionsWithContext{flex-wrap:nowrap;max-width:calc(100vw - 32px)}.worldHud.worldHud .worldHudActions.worldHudActionsWithContext button.worldHudWithLabel{font-size:0!important;width:48px!important;padding:0!important;justify-content:center}.worldHud.worldHud .worldHudActions.worldHudActionsWithContext button.worldHudWithLabel svg{width:19px;height:19px}
        .worldHudGoBtn{height:40px;display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(255,235,195,.28);border-radius:5px;padding:0 11px;background:rgba(24,22,21,.82);color:#fff4dd;font-size:11px;font-weight:900;letter-spacing:.03em;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.22);backdrop-filter:blur(9px)}.worldHudGoBtn svg{color:var(--world-accent)}
        .worldHudActionRead{border-radius:5px!important}.worldTeleportBackdrop{position:absolute;inset:0;z-index:50;display:grid;place-items:center;padding:18px;background:rgba(10,10,12,.72);backdrop-filter:blur(8px)}.worldTeleportPanel{width:min(760px,100%);max-height:min(760px,calc(100dvh - 36px));overflow:auto;border:1px solid rgba(238,206,148,.35);border-radius:7px;padding:18px;background:#241d1a;color:#fff3dc;box-shadow:0 28px 70px rgba(0,0,0,.5)}.worldTeleportPanel header{display:flex;align-items:center;justify-content:space-between;gap:14px}.worldTeleportPanel header span{color:#efc677;font-size:10px;font-weight:950;letter-spacing:.16em}.worldTeleportPanel h2{margin:3px 0 0;font-size:24px}.worldTeleportHeaderActions{display:flex;align-items:center;gap:8px}.worldTeleportPanel header button:not(.worldVoiceButton){width:42px;height:42px;display:grid;place-items:center;border:1px solid rgba(255,235,195,.28);border-radius:5px;background:#332722;color:#fff;cursor:pointer}.worldTeleportGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px;margin-top:16px}.worldTeleportTile{position:relative;min-height:118px;border:1px solid;border-radius:5px;padding:13px 48px 46px 13px;background:rgba(12,14,15,.5);color:#fff;text-align:left}.worldTeleportTileRead{position:absolute;right:10px;top:10px}.worldTeleportTileDisabled{opacity:.56}.worldTeleportTile>button:not(.worldVoiceButton){position:absolute;left:13px;right:13px;bottom:10px;height:30px;border:1px solid rgba(255,235,195,.22);border-radius:5px;background:rgba(255,244,221,.1);color:#fff4dd;font-size:11px;font-weight:950;cursor:pointer}.worldTeleportTile>button:disabled{cursor:default}.worldTeleportGrid strong,.worldTeleportGrid span,.worldTeleportGrid small{display:block}.worldTeleportGrid strong{font-size:16px}.worldTeleportGrid span{margin-top:4px;font-size:10px;font-weight:900;letter-spacing:.08em}.worldTeleportGrid small{margin-top:13px;font-size:11px;font-weight:900}.worldTeleportPanel p{margin:12px 0 0;color:#ffdca0;font-weight:800}
        .worldHudStart{position:absolute;left:max(16px,env(safe-area-inset-left));top:max(14px,env(safe-area-inset-top));width:min(300px,calc(100vw - 32px));pointer-events:auto}
        .worldHudLogo{display:block;width:118px;height:auto;filter:drop-shadow(0 3px 10px rgba(0,0,0,.45))}
        .worldHudStartCard{margin-top:8px;padding:8px;border-radius:14px;background:rgba(16,14,24,.62);border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 30px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.14);backdrop-filter:blur(14px)}
        .worldHudStartHead{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.worldHudStartHead{padding:0 2px 0 4px}.worldHudStartHead span{display:block;color:#E9B8FA;font-size:9px;font-weight:950;letter-spacing:.16em}.worldHudStartHead strong{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;margin-top:1px;font-size:12.5px;line-height:1.25;overflow:hidden;max-width:240px}
        .worldHudStartRow{display:flex;gap:6px;margin-top:7px}
        .worldHud .worldHudStartQuick{flex:1;white-space:nowrap;min-height:38px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:0;border-radius:10px;background:linear-gradient(135deg,#D86BF7,#8C2EAC);color:#fff;font-size:12px;font-weight:950;letter-spacing:.06em;box-shadow:0 8px 20px rgba(140,46,172,.45),inset 0 1px 0 rgba(255,255,255,.35);cursor:pointer}
        .worldHud .worldHudStartPick{white-space:nowrap;min-height:38px;display:inline-flex;align-items:center;gap:5px;border:0;border-radius:10px;padding:0 11px;background:#fff;color:#16121f;font-size:12px;font-weight:900;cursor:pointer}
        .worldHud .worldHudStartQuick:disabled{opacity:.7}
        .worldHudPicker{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
        .worldHud .worldHudPicker button{display:block;text-align:left;border:1.5px solid;border-radius:10px;padding:7px 9px;background:rgba(0,0,0,.32);color:#fff;cursor:pointer}
        .worldHudPicker button:disabled{opacity:.5;cursor:default}
        .worldHudPicker b{display:flex;align-items:center;gap:6px;font-size:12px}.worldHudPicker i{width:9px;height:9px;border-radius:9px;display:block}
        .worldHudPicker small{display:block;margin-top:1px;color:#d6d0e4;font-size:10.5px;font-weight:700}
        .worldHudPicker p{grid-column:1/-1;margin:2px 0 0;color:#ffdca0;font-size:12px;font-weight:800}
        @media (max-width:900px) and (orientation:portrait){.worldHudStart{width:min(250px,calc(100vw - 32px))}.worldHudLogo{width:96px}.worldHud .worldHudIdentity{gap:5px}.worldHud .worldHudCrystals{padding:0 10px}.worldHudXp{padding:0 8px!important}.worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudActions{max-width:calc(100vw - 300px)}.worldHudActions button:not(.worldVoiceButton){padding:8px 10px!important;font-size:12px!important}.worldHudMission{width:min(280px,calc(100vw - 32px))}}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudIdentity{align-items:center;gap:9px}
        .worldHudNavGroup{display:flex;gap:2px;padding:4px;border-radius:999px;background:rgba(16,14,24,.58);border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 26px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(14px)}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudNavGroup .worldHudGoBtn{height:38px;border:0!important;border-radius:999px!important;background:transparent!important;box-shadow:none!important;padding:0 13px;font-size:13px;font-weight:800;color:#ECE8F4}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudNavGroup .worldHudGoBtn:hover{background:rgba(255,255,255,.14)!important}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudNavGroup .worldHudGoBtn svg{color:#fff}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudXp{height:44px;border:0!important;border-radius:999px!important;padding:0 10px 0 14px;background:linear-gradient(135deg,#F7C948,#F59E0B)!important;color:#2a1700!important;box-shadow:0 8px 20px rgba(245,158,11,.35)!important}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudXp svg{color:#2a1700}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudIcon{width:44px;height:44px;border-radius:999px!important;background:${STUDENT_VIOLET}!important;border-color:rgba(255,255,255,.3)!important;color:#fff}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudActions{padding:8px!important;border-radius:20px!important;background:rgba(16,14,24,.62)!important;border-color:rgba(255,255,255,.16)!important}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudSecondary{border-radius:14px!important;background:rgba(255,255,255,.10)!important;border-color:rgba(255,255,255,.16)!important;min-height:48px!important;padding:0 18px!important;font-size:13px!important}
        .worldHudContext{min-height:48px!important;border:0!important;border-radius:14px!important;padding:0 20px!important;background:#fff!important;color:#16121f!important;font-size:14px!important;box-shadow:0 8px 20px rgba(0,0,0,.25)}
        .worldHudContext kbd{margin-left:4px;padding:2px 7px;border-radius:6px;background:#EEE9F5;color:#5b4a73;font:800 11px var(--font-sans)}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudMission{border:1px solid rgba(239,189,97,.22);border-left:3px solid var(--world-accent);border-radius:12px;background:linear-gradient(135deg,rgba(29,36,31,.92),rgba(20,27,24,.82));box-shadow:0 8px 24px rgba(12,20,14,.18),inset 0 1px rgba(255,255,255,.06)}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudMission strong{line-height:1.3}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudMission small{line-height:1.5}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudGoBtn,.worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudXp,.worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudIcon{border-radius:9px;border-color:rgba(255,235,195,.2);background:rgba(24,31,27,.88);box-shadow:0 4px 14px rgba(12,20,14,.16),inset 0 1px rgba(255,255,255,.05)}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudActions{padding:7px;border:1px solid rgba(239,189,97,.2);border-radius:14px;background:rgba(20,27,24,.82);backdrop-filter:blur(12px);box-shadow:0 10px 28px rgba(12,20,14,.22)}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudActions button:not(.worldVoiceButton){border-radius:8px;font-weight:800;letter-spacing:.025em}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudEditInline{margin-left:0}
        .worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) button:focus-visible{outline:2px solid #ffe1a3;outline-offset:3px}
        @media(hover:hover){.worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) button:not(:disabled):hover{filter:brightness(1.12)}}
        @media(max-width:900px){.worldHudLogo{width:120px}.worldHudStart{width:min(320px,calc(100vw - 36px))}.worldHudStartHead strong{font-size:14px}.worldHudNavGroup .worldHudGoBtn span{display:none}}
        @media(max-width:560px){.worldHudStart{top:max(60px,calc(env(safe-area-inset-top) + 50px))}.worldHudLogo{display:none}.worldHudStartCard{margin-top:0;padding:10px}.worldHudStartQuick,.worldHudStartPick{min-height:42px;font-size:12px}.worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudActions{top:auto!important;bottom:max(150px,calc(env(safe-area-inset-bottom) + 142px))!important}}
        @media(max-width:1280px){.worldHudIdentity .realm-demo-mode-pill,.worldHudIdentity .realm-demo-long-label{display:none!important}.worldHudIdentity .realm-demo-short-label{display:inline!important}.worldHudIdentity:has(.realm-demo-controls) .worldHudGoBtn span{display:none}}
        @media(max-width:900px){.worldHudMission{top:max(68px,calc(env(safe-area-inset-top) + 54px));width:275px}.worldHudActions{bottom:max(78px,calc(env(safe-area-inset-bottom) + 70px));max-width:calc(100vw - 120px);flex-wrap:wrap}.worldHudActions button:not(.worldVoiceButton){min-height:46px}.worldHudFallback{font-size:0!important;width:46px;padding:0!important}.worldHudFallback svg{width:19px;height:19px}.worldTeleportGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:560px){.worldHudIdentity .realm-demo-mode-pill{display:none!important}.worldHudMission{top:max(62px,calc(env(safe-area-inset-top) + 50px));width:245px;padding:8px 10px}.worldHudMission strong{font-size:16px}.worldHudMission small{font-size:11px}.worldHudIdentity{right:10px}.worldHudXp{padding:0 8px}.worldHudActions{right:10px;max-width:calc(100vw - 104px);gap:5px}.worldHud:is([data-world-hud="central"],[data-world-hud="tower"],[data-world-hud="realm"]) .worldHudActions{top:max(164px,calc(env(safe-area-inset-top) + 158px));bottom:auto;max-width:calc(100vw - 20px)}.worldHudGoBtn span{display:none}.worldHudGoBtn{padding:0 9px}.worldHudActions button:not(.worldVoiceButton){padding:8px 9px;font-size:11px}.worldHudSecondary{font-size:0!important;width:46px;padding:0!important}.worldHudSecondary.worldHudEdit{width:auto!important;padding:8px 9px!important;font-size:11px!important}.worldHudSecondary svg{width:19px;height:19px}.worldTeleportGrid{grid-template-columns:1fr}}

        /* Shared HUD (hub, Tower, realms): one stats pill, one main button, same glass everywhere. */
        .worldHud .worldHudStats{display:flex;align-items:center;gap:2px;height:46px;padding:0 4px 0 6px;border-radius:999px;background:rgba(16,14,24,.62);border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 26px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
        .worldHud .worldHudStats .worldHudXp{height:38px!important;background:transparent!important;box-shadow:none!important;border:0!important;color:#fff4d6!important;padding:0 10px!important;gap:6px;font:900 14px var(--font-display)}
        .worldHud .worldHudStats .worldHudXp svg{color:#FFD25A}
        .worldHud .worldHudStats .worldHudStreak{height:38px;display:flex;align-items:center;gap:6px;background:transparent;border:0;border-left:1px solid rgba(255,255,255,.16);padding:0 12px;color:#fff4d6;font-weight:900;font-size:14px;cursor:pointer}
        .worldHud .worldHudStats .worldHudStreak svg{color:#ff9a3c}
        .worldHud .worldHudStats .worldHudStreak.isPending svg{animation:streakPulse 1.6s ease-in-out infinite}
        @keyframes streakPulse{50%{transform:scale(1.18)}}
        @media (prefers-reduced-motion:reduce){.worldHud .worldHudStats .worldHudStreak.isPending svg{animation:none}}
        .worldHudStreakReminder{position:fixed;left:50%;top:max(84px,calc(env(safe-area-inset-top) + 72px));transform:translateX(-50%);z-index:40;display:flex;align-items:center;gap:14px;width:min(560px,calc(100vw - 32px));box-sizing:border-box;padding:12px 12px 12px 14px;border-radius:20px;background:rgba(28,20,12,.92);border:1px solid rgba(255,154,60,.6);box-shadow:0 18px 40px rgba(0,0,0,.35);color:#fff;pointer-events:auto}
        .worldHudStreakBadge{display:grid;place-items:center;width:48px;height:48px;flex-shrink:0;border-radius:14px;background:linear-gradient(160deg,#ff9a3c,#e8460c);color:#fff4e0}
        .worldHudStreakText{display:flex;flex-direction:column;min-width:0;flex:1}
        .worldHudStreakText strong{font-weight:900;font-size:17px}
        .worldHudStreakText span{font-weight:600;font-size:14px;color:#e6d6bf}
        .worldHudStreakGo{min-height:44px;padding:0 16px;border-radius:14px;border:0;background:#f5b83d;color:#2a1800;font-weight:900;font-size:15px;white-space:nowrap;cursor:pointer}
        .worldHudStreakClose{display:grid;place-items:center;width:32px;height:32px;flex-shrink:0;border-radius:10px;border:0;background:rgba(255,255,255,.08);color:#fff;cursor:pointer}
        @media(max-width:560px){.worldHudStreakText span{display:none}.worldHudStreakText strong{font-size:14px}.worldHudStreakGo{padding:0 12px;font-size:13px}}
        .worldHud .worldHudStats .worldHudCrystals{height:38px;background:transparent;border:0;box-shadow:none;border-left:1px solid rgba(255,255,255,.16);border-radius:0;padding:0 12px}
        .worldHud .worldHudStats .worldHudCrystals i{left:12px;right:12px;bottom:3px}
        .worldHud .worldHudStats .worldHudAvatar{width:36px;height:36px;border-radius:50%;border:0;margin-left:4px;background:linear-gradient(135deg,#D86BF7,#8C2EAC);color:#fff;box-shadow:none}
        .worldHud .worldHudStats .worldVoiceButton{margin-left:4px}
        .worldHud .worldHudActions .worldHudPrimary{min-height:50px!important;padding:0 22px!important;border:0!important;border-radius:14px!important;font-size:13px!important;font-weight:950!important;letter-spacing:.07em!important;color:#120f18!important;background:linear-gradient(135deg,var(--world-accent),color-mix(in srgb,var(--world-accent),#000 22%))!important;box-shadow:0 10px 24px color-mix(in srgb,var(--world-accent) 45%,transparent),inset 0 1px 0 rgba(255,255,255,.4)!important}
        .worldHud[data-world-hud="central"] .worldHudActions .worldHudPrimary,.worldHud[data-world-hud="tower"] .worldHudActions .worldHudPrimary{background:linear-gradient(135deg,#D86BF7,#8C2EAC)!important;color:#fff!important;box-shadow:0 10px 24px rgba(140,46,172,.45),inset 0 1px 0 rgba(255,255,255,.35)!important}
        .worldHud .worldHudActions .worldHudPrimary:disabled{opacity:.75}
        .worldHud .worldHudActions .worldHudWithLabel{font-size:13px!important;width:auto!important;padding:0 16px!important}
        @media (max-width:900px) and (orientation:portrait){.worldHud .worldHudActions .worldHudWithLabel{font-size:0!important;width:48px!important;padding:0!important}.worldHud .worldHudActions .worldHudPrimary{padding:0 16px!important;font-size:12px!important}.worldHud .worldHudStats .worldHudCrystals{padding:0 8px}}

        .worldHud .worldHudRealmTop{position:absolute;left:max(16px,env(safe-area-inset-left));top:max(14px,env(safe-area-inset-top));width:min(340px,calc(100vw - 32px));display:grid;gap:8px;pointer-events:auto}
        .worldHud .worldHudRealmTop .worldHudMission{position:static;width:auto;border-radius:14px;border:1px solid rgba(255,255,255,.16);border-left:3px solid var(--world-accent);background:rgba(16,14,24,.62);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
        @media (max-width:900px) and (orientation:portrait){.worldHud .worldHudRealmTop{width:min(280px,calc(100vw - 32px))}}
      `}</style>
    </>
  );
}
