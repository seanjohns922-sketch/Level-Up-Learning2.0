"use client";

import { DoorOpen, Hammer, Map, Play, Sparkles, UserRound, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { fetchStudentEconomy } from "@/lib/economy";
import type { CanonicalRealmId } from "@/lib/realms/realm-registry";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { TOWER_REALM_PORTALS } from "@/lib/world3d/tower-realm-chamber-config";
import { resolveTowerRealmEntry } from "@/lib/world3d/tower-realm-entry";
import { resolveWorldJourney, type WorldJourney } from "@/lib/world3d/world-journey";
import { joinSpeechParts, WorldVoiceButton } from "@/components/world3d/WorldVoiceButton";

export type WorldHUDContext = "central" | "tower" | "realm";

type WorldHUDAction = {
  label: string;
  icon?: "door" | "map" | "edit";
  onClick: () => void;
};

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
}: {
  context: WorldHUDContext;
  preview?: boolean;
  accent?: string;
  mission?: { eyebrow?: string; title: string; detail: string };
  primaryAction?: WorldHUDAction;
  navActions?: Array<{ key: string; label: string; icon?: React.ReactNode; onClick: () => void }>;
  fallbackHref: string;
  onQuickStart?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const [journey, setJourney] = useState<WorldJourney>(fallbackJourney);
  const [quickStartBusy, setQuickStartBusy] = useState(false);
  const [teleportOpen, setTeleportOpen] = useState(false);
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
          title: "Level Up World",
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
    quickStartBusy ? "Quick Start is opening" : `Quick Start. ${journey.activityLabel}`,
    "Realms. Opens fast travel to the learning realms.",
    context === "central" ? primaryActionSpeech : null,
    context === "central" ? null : "2D View. Opens the normal map view.",
  ]);

  return (
    <>
      <div className="worldHud" data-world-hud={context} style={{ "--world-accent": accent } as React.CSSProperties}>
        <section className="worldHudMission" aria-label={displayedMission.eyebrow ?? "Current mission"}>
          <div className="worldHudMissionText">
            <span>{displayedMission.eyebrow ?? (context === "realm" ? "CURRENT MISSION" : "CURRENT JOURNEY")}</span>
            <strong>{displayedMission.title}</strong>
            <small>{displayedMission.detail}</small>
          </div>
          <WorldVoiceButton text={missionSpeech} compact className="worldHudRead" label="Read current mission" />
        </section>

        <div className="worldHudIdentity">
          {navActions && navActions.length ? (
            <div className="worldHudGo" aria-label="Go and view">
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
              {/* Central hub: one clear hero pair. Build (Edit World) sits apart at
                  bottom-left, and Go/View controls live in their own cluster. */}
              <button type="button" className="worldHudQuick" disabled={quickStartBusy} onClick={() => void quickStart()}><Play size={17} />{quickStartBusy ? "OPENING..." : "QUICK START"}</button>
              <button type="button" className="worldHudSecondary" onClick={() => setTeleportOpen(true)}><Sparkles size={17} />REALMS</button>
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
              <button type="button" className="worldHudFallback" onClick={() => router.push(fallbackHref)}><Map size={17} />2D VIEW</button>
            </>
          )}
        </nav>

        {context === "central" && primaryAction ? (
          <button type="button" className="worldHudBuild" onClick={primaryAction.onClick} aria-label={primaryAction.label}><Hammer size={17} />{primaryAction.label}</button>
        ) : null}
      </div>

      {teleportOpen ? (
        <div className="worldTeleportBackdrop" role="dialog" aria-modal="true" aria-label="Realm Teleport">
          <section className="worldTeleportPanel">
            <header><div><span>FAST TRAVEL</span><h2>Realm Teleport</h2></div><div className="worldTeleportHeaderActions"><WorldVoiceButton text="Fast travel. Realm Teleport. Choose a learning realm to enter." label="Read Realm Teleport" /><button type="button" onClick={() => setTeleportOpen(false)} aria-label="Close Realm Teleport" title="Close"><X size={20} /></button></div></header>
            <div className="worldTeleportGrid">
              {TOWER_REALM_PORTALS.map((portal) => {
                const live = portal.realm.status === "live" && portal.realm.isSelectable;
                const portalSpeech = joinSpeechParts([portal.realm.name, portal.subject, live ? "Enter realm" : "Coming soon"]);
                return (
                  <div key={portal.realmId} className={`worldTeleportTile ${!live || busyRealmId ? "worldTeleportTileDisabled" : ""}`} style={{ borderColor: portal.accent }}>
                    <WorldVoiceButton text={portalSpeech} compact className="worldTeleportTileRead" label={`Read ${portal.realm.name}`} />
                    <strong>{portal.realm.name}</strong><span style={{ color: portal.accent }}>{portal.subject}</span><small>{live ? "ENTER REALM" : "COMING SOON"}</small>
                    <button type="button" disabled={!live || Boolean(busyRealmId)} onClick={() => live && void enterRealm(portal.realmId)} aria-label={`${live ? "Enter" : "Coming soon"} ${portal.realm.name}`}><span>{live ? "Enter" : "Coming soon"}</span></button>
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
        .worldHudBuild{position:absolute;left:50%;transform:translateX(-50%);bottom:max(122px,calc(env(safe-area-inset-bottom) + 116px));pointer-events:auto;min-height:40px;display:inline-flex;align-items:center;gap:7px;border-radius:5px;padding:8px 14px;font-size:12px;font-weight:950;cursor:pointer;border:1px solid rgba(255,235,195,.28);background:rgba(24,22,21,.62);color:#fff5df;backdrop-filter:blur(9px)}
        .worldHudGo{display:flex;gap:4px;align-items:center;padding:4px;border-radius:9px;background:rgba(22,28,23,.5);border:1px solid rgba(255,235,195,.2)}.worldHudGoBtn{height:40px;display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(0,0,0,.06);border-radius:6px;padding:0 11px;background:#f6f1e6;color:#2b2119;font-size:11px;font-weight:900;letter-spacing:.03em;cursor:pointer}
        .worldHudActionRead{border-radius:5px!important}.worldTeleportBackdrop{position:absolute;inset:0;z-index:50;display:grid;place-items:center;padding:18px;background:rgba(10,10,12,.72);backdrop-filter:blur(8px)}.worldTeleportPanel{width:min(760px,100%);max-height:min(760px,calc(100dvh - 36px));overflow:auto;border:1px solid rgba(238,206,148,.35);border-radius:7px;padding:18px;background:#241d1a;color:#fff3dc;box-shadow:0 28px 70px rgba(0,0,0,.5)}.worldTeleportPanel header{display:flex;align-items:center;justify-content:space-between;gap:14px}.worldTeleportPanel header span{color:#efc677;font-size:10px;font-weight:950;letter-spacing:.16em}.worldTeleportPanel h2{margin:3px 0 0;font-size:24px}.worldTeleportHeaderActions{display:flex;align-items:center;gap:8px}.worldTeleportPanel header button:not(.worldVoiceButton){width:42px;height:42px;display:grid;place-items:center;border:1px solid rgba(255,235,195,.28);border-radius:5px;background:#332722;color:#fff;cursor:pointer}.worldTeleportGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px;margin-top:16px}.worldTeleportTile{position:relative;min-height:118px;border:1px solid;border-radius:5px;padding:13px 48px 46px 13px;background:rgba(12,14,15,.5);color:#fff;text-align:left}.worldTeleportTileRead{position:absolute;right:10px;top:10px}.worldTeleportTileDisabled{opacity:.56}.worldTeleportTile>button:not(.worldVoiceButton){position:absolute;left:13px;right:13px;bottom:10px;height:30px;border:1px solid rgba(255,235,195,.22);border-radius:5px;background:rgba(255,244,221,.1);color:#fff4dd;font-size:11px;font-weight:950;cursor:pointer}.worldTeleportTile>button:disabled{cursor:default}.worldTeleportGrid strong,.worldTeleportGrid span,.worldTeleportGrid small{display:block}.worldTeleportGrid strong{font-size:16px}.worldTeleportGrid span{margin-top:4px;font-size:10px;font-weight:900;letter-spacing:.08em}.worldTeleportGrid small{margin-top:13px;font-size:11px;font-weight:900}.worldTeleportPanel p{margin:12px 0 0;color:#ffdca0;font-weight:800}
        @media(max-width:900px){.worldHudMission{top:max(68px,calc(env(safe-area-inset-top) + 54px));width:275px}.worldHudActions{bottom:max(78px,calc(env(safe-area-inset-bottom) + 70px));max-width:calc(100vw - 120px);flex-wrap:wrap}.worldHudActions button:not(.worldVoiceButton){min-height:46px}.worldHudFallback{font-size:0!important;width:46px;padding:0!important}.worldHudFallback svg{width:19px;height:19px}.worldTeleportGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:560px){.worldHudMission{top:max(62px,calc(env(safe-area-inset-top) + 50px));width:245px;padding:8px 10px}.worldHudMission strong{font-size:16px}.worldHudMission small{font-size:11px}.worldHudIdentity{right:10px}.worldHudXp{padding:0 8px}.worldHudActions{right:10px;max-width:calc(100vw - 104px);gap:5px}.worldHud[data-world-hud="central"] .worldHudActions{top:max(164px,calc(env(safe-area-inset-top) + 158px));bottom:auto;max-width:calc(100vw - 20px)}.worldHudBuild{left:50%;transform:translateX(-50%);bottom:auto;top:max(214px,calc(env(safe-area-inset-top) + 208px));font-size:11px;padding:8px 11px}.worldHudGoBtn span{display:none}.worldHudGoBtn{padding:0 9px}.worldHudActions button:not(.worldVoiceButton){padding:8px 9px;font-size:11px}.worldHudSecondary{font-size:0!important;width:46px;padding:0!important}.worldHudSecondary.worldHudEdit{width:auto!important;padding:8px 9px!important;font-size:11px!important}.worldHudSecondary svg{width:19px;height:19px}.worldTeleportGrid{grid-template-columns:1fr}}
      `}</style>
    </>
  );
}
