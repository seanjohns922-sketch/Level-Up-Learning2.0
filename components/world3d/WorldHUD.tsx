"use client";

import PatternExtensionLinks from "@/components/assessment/PatternExtensionLinks";
import StatisticsExtensionLinks from "@/components/assessment/StatisticsExtensionLinks";
import SpaceExtensionLinks from "@/components/assessment/SpaceExtensionLinks";
import MeasurementExtensionLinks from "@/components/assessment/MeasurementExtensionLinks";
import NumberExtensionLinks from "@/components/assessment/NumberExtensionLinks";
import { ChevronDown, DoorOpen, Hammer, Home, Map, Play, Sparkles, UserRound, X, Zap } from "lucide-react";
import { RELIQ_LETTERS_PATH, RELIQ_Q_PATH } from "@/lib/brand-reliq-logo-paths";
import { readProgress, type ProgressRealmScope } from "@/data/progress";
import { formatStudentLevelLabel } from "@/lib/studentLevelLabel";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { fetchStudentEconomy } from "@/lib/economy";
import type { CanonicalRealmId } from "@/lib/realms/realm-registry";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { TOWER_REALM_PORTALS } from "@/lib/world3d/tower-realm-chamber-config";
import { resolveTowerRealmEntry } from "@/lib/world3d/tower-realm-entry";
import { resolveWorldJourney, type WorldJourney } from "@/lib/world3d/world-journey";
import { joinSpeechParts, WorldVoiceButton } from "@/components/world3d/WorldVoiceButton";
import DemoModeNavigationControls from "@/components/demo/DemoModeNavigationControls";

export type WorldHUDContext = "central" | "tower" | "realm";

type WorldHUDAction = {
  label: string;
  icon?: "door" | "map" | "edit" | "home";
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
}) {
  const router = useRouter();
  const [journey, setJourney] = useState<WorldJourney>(fallbackJourney);
  const [quickStartBusy, setQuickStartBusy] = useState(false);
  const [teleportOpen, setTeleportOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busyRealmId, setBusyRealmId] = useState<CanonicalRealmId | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [xp, setXp] = useState<number | null>(null);

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
  const worldActionsSpeech = joinSpeechParts([
    "World actions",
    context === "central" ? (contextAction ? `${contextAction.label}. Button.` : null) : quickStartBusy ? "Quick Start is opening" : `Quick Start. ${journey.activityLabel}`,
    "Realms. Opens fast travel to the learning realms.",
    context === "central" ? primaryActionSpeech : null,
    context === "central" ? null : "2D View. Opens the normal map view.",
  ]);

  return (
    <>
      <div className="worldHud" data-world-hud={context} style={{ "--world-accent": accent } as React.CSSProperties}>
        {context === "central" ? (
          <section className="worldHudStart" aria-label="Start learning">
            <svg viewBox="0 0 279 79" className="worldHudLogo" role="img" aria-label="RELIQ"><path fill="#fff" d={RELIQ_LETTERS_PATH} /><path fill={STUDENT_VIOLET} d={RELIQ_Q_PATH} /></svg>
            <div className="worldHudStartCard">
              <div className="worldHudStartHead">
                <div><span>NEXT UP</span><strong>{journey.realmName} · {journey.activityLabel}</strong></div>
                <WorldVoiceButton text={joinSpeechParts(["Next up", journey.realmName, journey.activityLabel])} compact label="Read next up" />
              </div>
              <div className="worldHudStartRow">
                <button type="button" className="worldHudStartQuick" disabled={quickStartBusy} onClick={() => void quickStart()}><Play size={15} fill="currentColor" />{quickStartBusy ? "OPENING..." : "QUICK START"}</button>
                <button type="button" className="worldHudStartPick" aria-expanded={pickerOpen} onClick={() => setPickerOpen((open) => !open)}>Choose a realm<ChevronDown size={15} style={{ transform: pickerOpen ? "rotate(180deg)" : undefined }} /></button>
              </div>
              {pickerOpen ? (
                <div className="worldHudPicker">
                  {TOWER_REALM_PORTALS.filter((portal) => (portal.realm.status === "live" && portal.realm.isSelectable) || (preview && (portal.realmId === "pattern" || portal.realmId === "chance"))).map((portal) => {
                    // Only realms a learner can open appear here; coming-soon realms stay in Realm Teleport.
                    const available = true;
                    const where = realmProgressLabel(portal.realmId) ?? portal.subject;
                    return (
                      <button key={portal.realmId} type="button" disabled={!available || Boolean(busyRealmId)} onClick={() => available && void enterRealm(portal.realmId)} style={{ borderColor: portal.accent }} aria-label={`Open ${portal.realm.name}`}>
                        <b><i style={{ background: portal.accent }} />{portal.realm.name}</b>
                        <small>{busyRealmId === portal.realmId ? "Opening..." : where}</small>
                      </button>
                    );
                  })}
                  {message ? <p role="status">{message}</p> : null}
                </div>
              ) : null}
            </div>
          </section>
        ) : (
        <section className="worldHudMission" aria-label={displayedMission.eyebrow ?? "Current mission"}>
          <div className="worldHudMissionText">
            <span>{displayedMission.eyebrow ?? (context === "realm" ? "CURRENT MISSION" : "CURRENT JOURNEY")}</span>
            <strong>{displayedMission.title}</strong>
            <small>{displayedMission.detail}</small>
          </div>
          <WorldVoiceButton text={missionSpeech} compact className="worldHudRead" label="Read current mission" />
        </section>
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
          {navActions?.length ? (
            <div className="worldHudNavGroup">
              {navActions.map((action) => (
                <button key={action.key} type="button" className="worldHudGoBtn" onClick={action.onClick} aria-label={action.label}>{action.icon}<span>{action.label}</span></button>
              ))}
            </div>
          ) : null}
          <div className="worldHudXp" title="Experience points"><Zap size={15} aria-hidden="true" />{compactXp(xp)}<WorldVoiceButton text={`Experience points. ${compactXp(xp)}.`} compact label="Read XP" /></div>
          <button type="button" className="worldHudIcon" onClick={() => router.push("/profile")} aria-label="Open profile" title="Profile"><UserRound size={19} /></button>
          <WorldVoiceButton text="Profile. Opens your profile." compact label="Read profile" />
        </div>

        <nav className="worldHudActions" aria-label="World actions">
          <WorldVoiceButton text={worldActionsSpeech} className="worldHudActionRead" label="Read world actions" />
          {context === "central" ? (
            <>
              {/* Central hub: gold Quick Start hero + Realms, with Edit World set
                  slightly apart at the end of the bar (clear of avatar + joysticks). */}
              {contextAction ? (
                <button type="button" className="worldHudContext" onClick={contextAction.onClick}>
                  {contextAction.icon === "home" ? <Home size={17} /> : <DoorOpen size={17} />}{contextAction.label}<kbd aria-hidden="true">E</kbd>
                </button>
              ) : null}
              <button type="button" className="worldHudSecondary" onClick={() => setTeleportOpen(true)}><Sparkles size={17} />REALMS</button>
              {primaryAction ? <button type="button" className="worldHudSecondary worldHudEditInline" onClick={primaryAction.onClick}><Hammer size={17} />{primaryAction.label}</button> : null}
            </>
          ) : (
            <>
              {primaryAction ? (
                <button type="button" className={`worldHudSecondary ${primaryAction.icon === "edit" ? "worldHudEdit" : ""}`} onClick={primaryAction.onClick}>
                  {primaryAction.icon === "map" ? <Map size={17} /> : primaryAction.icon === "edit" ? <Hammer size={17} /> : <DoorOpen size={17} />}{primaryAction.label}
                </button>
              ) : null}
              <button type="button" className="worldHudSecondary" onClick={() => setTeleportOpen(true)}><Sparkles size={17} />REALMS</button>
              <button type="button" className="worldHudQuick" disabled={quickStartBusy} onClick={() => void quickStart()}><Play size={17} />{quickStartBusy ? "OPENING..." : "QUICK START"}</button>
              {!preview ? <button type="button" className="worldHudFallback" onClick={() => router.push(fallbackHref)}><Map size={17} />2D VIEW</button> : null}
            </>
          )}
        </nav>

      </div>

      {teleportOpen ? (
        <div className="worldTeleportBackdrop" role="dialog" aria-modal="true" aria-label="Realm Teleport">
          <section className="worldTeleportPanel">
            <NumberExtensionLinks/><MeasurementExtensionLinks/><SpaceExtensionLinks/><StatisticsExtensionLinks/><PatternExtensionLinks/>
            <header><div><span>FAST TRAVEL</span><h2>REALM TELEPORT</h2></div><div className="worldTeleportHeaderActions"><WorldVoiceButton text="Fast travel. Realm Teleport. Choose a learning realm to enter." label="Read Realm Teleport" /><button type="button" onClick={() => setTeleportOpen(false)} aria-label="Close Realm Teleport" title="Close"><X size={20} /></button></div></header>
            <div className="worldTeleportGrid">
              {TOWER_REALM_PORTALS.map((portal) => {
                const live = portal.realm.status === "live" && portal.realm.isSelectable;
                const available = live || (preview && (portal.realmId === "pattern" || portal.realmId === "chance"));
                const portalSpeech = joinSpeechParts([portal.realm.name, portal.subject, available ? (live ? "Enter realm" : "Preview realm") : "Coming soon"]);
                return (
                  <div key={portal.realmId} className={`worldTeleportTile ${!available || busyRealmId ? "worldTeleportTileDisabled" : ""}`} style={{ borderColor: portal.accent }}>
                    <WorldVoiceButton text={portalSpeech} compact className="worldTeleportTileRead" label={`Read ${portal.realm.name}`} />
                    <strong>{portal.realm.name}</strong><span style={{ color: portal.accent }}>{portal.subject}</span><small>{available ? (live ? "ENTER REALM" : "PREVIEW REALM") : "COMING SOON"}</small>
                    <button type="button" disabled={!available || Boolean(busyRealmId)} onClick={() => available && void enterRealm(portal.realmId)} aria-label={`${available ? (live ? "Enter" : "Preview") : "Coming soon"} ${portal.realm.name}`}><span>{available ? (live ? "Enter" : "Preview") : "Coming soon"}</span></button>
                  </div>
                );
              })}
            </div>
            {message ? <p role="status">{message}</p> : null}
          </section>
        </div>
      ) : null}

      <style>{`
        .worldHud{position:absolute;inset:0;z-index:18;pointer-events:none;color:#fff8e8;font-family:system-ui,sans-serif}.worldHud button{font:inherit}
        .worldHudMission{position:absolute;left:max(16px,env(safe-area-inset-left));top:max(16px,env(safe-area-inset-top));width:min(340px,calc(100vw - 32px));display:flex;align-items:flex-start;gap:10px;border-left:3px solid var(--world-accent);padding:10px 11px 10px 13px;background:rgba(19,24,23,.78);box-shadow:0 12px 30px rgba(0,0,0,.23);backdrop-filter:blur(9px)}
        .worldHudMissionText{min-width:0;flex:1}.worldHudRead{flex:0 0 auto;margin-top:1px}
        .worldHudMission span{display:block;color:var(--world-accent);font-size:10px;font-weight:950;letter-spacing:.16em}.worldHudMission strong{display:block;margin-top:4px;font-size:18px;line-height:1.15}.worldHudMission small{display:block;margin-top:4px;color:rgba(255,248,232,.76);font-size:12px;font-weight:650;line-height:1.3}
        .worldHudIdentity{position:absolute;right:max(16px,env(safe-area-inset-right));top:max(16px,env(safe-area-inset-top));display:flex;gap:7px;pointer-events:auto}.worldHudXp,.worldHudIcon{height:40px;border:1px solid rgba(255,235,195,.28);border-radius:5px;background:rgba(24,22,21,.82);color:#fff4dd;box-shadow:0 8px 22px rgba(0,0,0,.22);backdrop-filter:blur(9px)}.worldHudXp{display:flex;align-items:center;gap:6px;padding:0 8px 0 11px;font-size:12px;font-weight:900}.worldHudXp svg{color:var(--world-accent)}.worldHudXp .worldVoiceButton{margin-left:2px}.worldHudIcon{width:40px;display:grid;place-items:center;cursor:pointer}
        .worldHudActions{position:absolute;right:max(16px,env(safe-area-inset-right));bottom:max(70px,calc(env(safe-area-inset-bottom) + 64px));display:flex;align-items:center;justify-content:flex-end;gap:7px;pointer-events:auto}.worldHudActions button:not(.worldVoiceButton){min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:5px;padding:9px 12px;font-size:12px;font-weight:950;cursor:pointer;white-space:nowrap}.worldHudSecondary,.worldHudFallback{border:1px solid rgba(255,235,195,.3);background:rgba(24,22,21,.88);color:#fff5df}.worldHudQuick{border:1px solid color-mix(in srgb,var(--world-accent),#fff 20%);background:var(--world-accent);color:#1d2422}.worldHudFallback{padding-inline:10px!important}.worldHudActions button:disabled{opacity:.65;cursor:default}
        .worldHud[data-world-hud="central"] .worldHudActions{left:50%;right:auto;transform:translateX(-50%);max-width:calc(100vw - 340px)}
        .worldHudEditInline{margin-left:8px;background:rgba(24,22,21,.66)!important}
        .worldHudGoBtn{height:40px;display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(255,235,195,.28);border-radius:5px;padding:0 11px;background:rgba(24,22,21,.82);color:#fff4dd;font-size:11px;font-weight:900;letter-spacing:.03em;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.22);backdrop-filter:blur(9px)}.worldHudGoBtn svg{color:var(--world-accent)}
        .worldHudActionRead{border-radius:5px!important}.worldTeleportBackdrop{position:absolute;inset:0;z-index:50;display:grid;place-items:center;padding:18px;background:rgba(10,10,12,.72);backdrop-filter:blur(8px)}.worldTeleportPanel{width:min(760px,100%);max-height:min(760px,calc(100dvh - 36px));overflow:auto;border:1px solid rgba(238,206,148,.35);border-radius:7px;padding:18px;background:#241d1a;color:#fff3dc;box-shadow:0 28px 70px rgba(0,0,0,.5)}.worldTeleportPanel header{display:flex;align-items:center;justify-content:space-between;gap:14px}.worldTeleportPanel header span{color:#efc677;font-size:10px;font-weight:950;letter-spacing:.16em}.worldTeleportPanel h2{margin:3px 0 0;font-size:24px}.worldTeleportHeaderActions{display:flex;align-items:center;gap:8px}.worldTeleportPanel header button:not(.worldVoiceButton){width:42px;height:42px;display:grid;place-items:center;border:1px solid rgba(255,235,195,.28);border-radius:5px;background:#332722;color:#fff;cursor:pointer}.worldTeleportGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px;margin-top:16px}.worldTeleportTile{position:relative;min-height:118px;border:1px solid;border-radius:5px;padding:13px 48px 46px 13px;background:rgba(12,14,15,.5);color:#fff;text-align:left}.worldTeleportTileRead{position:absolute;right:10px;top:10px}.worldTeleportTileDisabled{opacity:.56}.worldTeleportTile>button:not(.worldVoiceButton){position:absolute;left:13px;right:13px;bottom:10px;height:30px;border:1px solid rgba(255,235,195,.22);border-radius:5px;background:rgba(255,244,221,.1);color:#fff4dd;font-size:11px;font-weight:950;cursor:pointer}.worldTeleportTile>button:disabled{cursor:default}.worldTeleportGrid strong,.worldTeleportGrid span,.worldTeleportGrid small{display:block}.worldTeleportGrid strong{font-size:16px}.worldTeleportGrid span{margin-top:4px;font-size:10px;font-weight:900;letter-spacing:.08em}.worldTeleportGrid small{margin-top:13px;font-size:11px;font-weight:900}.worldTeleportPanel p{margin:12px 0 0;color:#ffdca0;font-weight:800}
        .worldHudStart{position:absolute;left:max(18px,env(safe-area-inset-left));top:max(16px,env(safe-area-inset-top));width:min(420px,calc(100vw - 36px));pointer-events:auto}
        .worldHudLogo{display:block;width:168px;height:auto;filter:drop-shadow(0 4px 12px rgba(0,0,0,.45))}
        .worldHudStartCard{margin-top:10px;padding:12px;border-radius:18px;background:rgba(16,14,24,.62);border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 30px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.14);backdrop-filter:blur(14px)}
        .worldHudStartHead{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.worldHudStartHead span{display:block;color:#E9B8FA;font-size:10px;font-weight:950;letter-spacing:.18em}.worldHudStartHead strong{display:block;margin-top:3px;font-size:16px;line-height:1.25}
        .worldHudStartRow{display:flex;gap:8px;margin-top:10px}
        .worldHudStartQuick{flex:1;min-height:46px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:13px;background:linear-gradient(135deg,#D86BF7,#8C2EAC);color:#fff;font-size:14px;font-weight:950;letter-spacing:.06em;box-shadow:0 8px 20px rgba(140,46,172,.45),inset 0 1px 0 rgba(255,255,255,.35);cursor:pointer}
        .worldHudStartPick{min-height:46px;display:inline-flex;align-items:center;gap:6px;border:0;border-radius:13px;padding:0 14px;background:#fff;color:#16121f;font-size:13px;font-weight:900;cursor:pointer}
        .worldHudStartQuick:disabled{opacity:.7}
        .worldHudPicker{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}
        .worldHudPicker button{display:block;text-align:left;border:1.5px solid;border-radius:12px;padding:9px 10px;background:rgba(0,0,0,.32);color:#fff;cursor:pointer}
        .worldHudPicker button:disabled{opacity:.5;cursor:default}
        .worldHudPicker b{display:flex;align-items:center;gap:7px;font-size:13px}.worldHudPicker i{width:9px;height:9px;border-radius:9px;display:block}
        .worldHudPicker small{display:block;margin-top:2px;color:#d6d0e4;font-size:11px;font-weight:700}
        .worldHudPicker p{grid-column:1/-1;margin:2px 0 0;color:#ffdca0;font-size:12px;font-weight:800}
        .worldHud[data-world-hud="central"] .worldHudIdentity{align-items:center;gap:9px}
        .worldHudNavGroup{display:flex;gap:2px;padding:4px;border-radius:999px;background:rgba(16,14,24,.58);border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 26px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(14px)}
        .worldHud[data-world-hud="central"] .worldHudNavGroup .worldHudGoBtn{height:38px;border:0!important;border-radius:999px!important;background:transparent!important;box-shadow:none!important;padding:0 13px;font-size:13px;font-weight:800;color:#ECE8F4}
        .worldHud[data-world-hud="central"] .worldHudNavGroup .worldHudGoBtn:hover{background:rgba(255,255,255,.14)!important}
        .worldHud[data-world-hud="central"] .worldHudNavGroup .worldHudGoBtn svg{color:#fff}
        .worldHud[data-world-hud="central"] .worldHudXp{height:44px;border:0!important;border-radius:999px!important;padding:0 10px 0 14px;background:linear-gradient(135deg,#F7C948,#F59E0B)!important;color:#2a1700!important;box-shadow:0 8px 20px rgba(245,158,11,.35)!important}
        .worldHud[data-world-hud="central"] .worldHudXp svg{color:#2a1700}
        .worldHud[data-world-hud="central"] .worldHudIcon{width:44px;height:44px;border-radius:999px!important;background:${STUDENT_VIOLET}!important;border-color:rgba(255,255,255,.3)!important;color:#fff}
        .worldHud[data-world-hud="central"] .worldHudActions{padding:8px!important;border-radius:20px!important;background:rgba(16,14,24,.62)!important;border-color:rgba(255,255,255,.16)!important}
        .worldHud[data-world-hud="central"] .worldHudSecondary{border-radius:14px!important;background:rgba(255,255,255,.10)!important;border-color:rgba(255,255,255,.16)!important;min-height:48px!important;padding:0 18px!important;font-size:13px!important}
        .worldHudContext{min-height:48px!important;border:0!important;border-radius:14px!important;padding:0 20px!important;background:#fff!important;color:#16121f!important;font-size:14px!important;box-shadow:0 8px 20px rgba(0,0,0,.25)}
        .worldHudContext kbd{margin-left:4px;padding:2px 7px;border-radius:6px;background:#EEE9F5;color:#5b4a73;font:800 11px system-ui}
        .worldHud[data-world-hud="central"] .worldHudMission{border:1px solid rgba(239,189,97,.22);border-left:3px solid var(--world-accent);border-radius:12px;background:linear-gradient(135deg,rgba(29,36,31,.92),rgba(20,27,24,.82));box-shadow:0 8px 24px rgba(12,20,14,.18),inset 0 1px rgba(255,255,255,.06)}
        .worldHud[data-world-hud="central"] .worldHudMission strong{line-height:1.3}
        .worldHud[data-world-hud="central"] .worldHudMission small{line-height:1.5}
        .worldHud[data-world-hud="central"] .worldHudGoBtn,.worldHud[data-world-hud="central"] .worldHudXp,.worldHud[data-world-hud="central"] .worldHudIcon{border-radius:9px;border-color:rgba(255,235,195,.2);background:rgba(24,31,27,.88);box-shadow:0 4px 14px rgba(12,20,14,.16),inset 0 1px rgba(255,255,255,.05)}
        .worldHud[data-world-hud="central"] .worldHudActions{padding:7px;border:1px solid rgba(239,189,97,.2);border-radius:14px;background:rgba(20,27,24,.82);backdrop-filter:blur(12px);box-shadow:0 10px 28px rgba(12,20,14,.22)}
        .worldHud[data-world-hud="central"] .worldHudActions button:not(.worldVoiceButton){border-radius:8px;font-weight:800;letter-spacing:.025em}
        .worldHud[data-world-hud="central"] .worldHudEditInline{margin-left:0}
        .worldHud[data-world-hud="central"] button:focus-visible{outline:2px solid #ffe1a3;outline-offset:3px}
        @media(hover:hover){.worldHud[data-world-hud="central"] button:not(:disabled):hover{filter:brightness(1.12)}}
        @media(max-width:900px){.worldHudLogo{width:120px}.worldHudStart{width:min(320px,calc(100vw - 36px))}.worldHudStartHead strong{font-size:14px}.worldHudNavGroup .worldHudGoBtn span{display:none}}
        @media(max-width:560px){.worldHudStart{top:max(60px,calc(env(safe-area-inset-top) + 50px))}.worldHudLogo{display:none}.worldHudStartCard{margin-top:0;padding:10px}.worldHudStartQuick,.worldHudStartPick{min-height:42px;font-size:12px}.worldHud[data-world-hud="central"] .worldHudActions{top:auto!important;bottom:max(150px,calc(env(safe-area-inset-bottom) + 142px))!important}}
        @media(max-width:1280px){.worldHudIdentity .realm-demo-mode-pill,.worldHudIdentity .realm-demo-long-label{display:none!important}.worldHudIdentity .realm-demo-short-label{display:inline!important}.worldHudIdentity:has(.realm-demo-controls) .worldHudGoBtn span{display:none}}
        @media(max-width:900px){.worldHudMission{top:max(68px,calc(env(safe-area-inset-top) + 54px));width:275px}.worldHudActions{bottom:max(78px,calc(env(safe-area-inset-bottom) + 70px));max-width:calc(100vw - 120px);flex-wrap:wrap}.worldHudActions button:not(.worldVoiceButton){min-height:46px}.worldHudFallback{font-size:0!important;width:46px;padding:0!important}.worldHudFallback svg{width:19px;height:19px}.worldTeleportGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:560px){.worldHudIdentity .realm-demo-mode-pill{display:none!important}.worldHudMission{top:max(62px,calc(env(safe-area-inset-top) + 50px));width:245px;padding:8px 10px}.worldHudMission strong{font-size:16px}.worldHudMission small{font-size:11px}.worldHudIdentity{right:10px}.worldHudXp{padding:0 8px}.worldHudActions{right:10px;max-width:calc(100vw - 104px);gap:5px}.worldHud[data-world-hud="central"] .worldHudActions{top:max(164px,calc(env(safe-area-inset-top) + 158px));bottom:auto;max-width:calc(100vw - 20px)}.worldHudGoBtn span{display:none}.worldHudGoBtn{padding:0 9px}.worldHudActions button:not(.worldVoiceButton){padding:8px 9px;font-size:11px}.worldHudSecondary{font-size:0!important;width:46px;padding:0!important}.worldHudSecondary.worldHudEdit{width:auto!important;padding:8px 9px!important;font-size:11px!important}.worldHudSecondary svg{width:19px;height:19px}.worldTeleportGrid{grid-template-columns:1fr}}
      `}</style>
    </>
  );
}
