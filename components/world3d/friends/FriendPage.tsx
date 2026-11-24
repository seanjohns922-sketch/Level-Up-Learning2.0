"use client";
// A friend's own page (/world/friend?id=…): their explorer, VISIT WORLD and BATTLE, our battles, and in plain
// words how to battle, how to help build in their world, and what they can do in mine (VISIT ONLY or CAN
// HELP BUILD). Never their level, lesson or quiz results, or RELIQS (those show how far through maths they are).
import { ArrowLeft, Eye, Hammer, Home, Swords, UserMinus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import StudentAvatar from "@/components/avatar/StudentAvatar";
import { reliqRealmColor } from "@/components/brand/ReliqRealmLogo";
import { BATTLE_QUESTIONS } from "@/lib/battle-questions";
import { battleRoomHref, battlesPanelHref, fetchBattles, useOnlineFriends, type Battle } from "@/lib/battles";
import { fetchFriendProfile, friendLook, removeFriend, setFriendCanBuild, visitHref, type FriendProfile } from "@/lib/friends";
import { getRealmDefinition } from "@/lib/realms/realm-registry";
import { GOLD, GREEN, HEADING, LILAC, VIOLET, WorldAccessChoice, labelStyle, pill, shortDate } from "./FriendBits";

const section: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(44,28,84,.92), rgba(24,16,48,.92))", border: "1.5px solid rgba(233,184,250,.22)", borderRadius: 24,
  padding: 20, display: "flex", flexDirection: "column", gap: 12, minWidth: 0, boxShadow: "0 14px 40px rgba(0,0,0,.35)",
};
const step: React.CSSProperties = { display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.45, fontWeight: 600 };
const stepNumber = (colour: string): React.CSSProperties => ({ width: 24, height: 24, borderRadius: 99, flex: "none", display: "grid", placeItems: "center", background: colour, color: "#1f1236", fontWeight: 900, fontSize: 13, fontFamily: HEADING });
const realmName = (realm: Battle["realm"]) => getRealmDefinition(realm).name;

function Steps({ colour, items }: { colour: string; items: React.ReactNode[] }) {
  return <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>{items.map((item, i) => <li key={i} style={step}><span aria-hidden="true" style={stepNumber(colour)}>{i + 1}</span><span>{item}</span></li>)}</ol>;
}

function SectionTitle({ icon, colour, children }: { icon: React.ReactNode; colour: string; children: React.ReactNode }) {
  return <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 10, fontFamily: HEADING, fontWeight: 900, fontSize: 20 }}><span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 12, display: "grid", placeItems: "center", background: `${colour}26`, color: colour }}>{icon}</span>{children}</h2>;
}

export function FriendPage({ friendId, studentId, myName, demo }: { friendId: string; studentId: string | null; myName: string; demo: boolean }) {
  const router = useRouter();
  const [profile, setProfile] = useState<FriendProfile | null | "missing">(null);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  /** Back to the hub with a panel open (friends=1, battles=1). */
  const hubWith = (query: string) => (demo ? `/world?teacher_preview=1&${query}` : `/world?${query}`);

  const load = useCallback(async () => {
    try { setProfile((await fetchFriendProfile(studentId, demo, friendId)) ?? "missing"); } catch { setProfile("missing"); }
    try { setBattles((await fetchBattles(studentId, demo)).filter((b) => b.friendId === friendId)); } catch { /* the list just stays as it was */ }
  }, [studentId, demo, friendId]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const ids = useMemo(() => [friendId], [friendId]);
  const online = useOnlineFriends(studentId, ids, !demo && Boolean(studentId)).has(friendId);

  if (profile === null) return <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#120b26", color: LILAC, fontFamily: HEADING, fontWeight: 900, letterSpacing: ".12em" }}>LOADING…</div>;
  if (profile === "missing") {
    return (
      <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#120b26", color: "#fff", fontFamily: "Inter, sans-serif", padding: 16, textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>This friend&apos;s page can&apos;t open right now.</p>
          <Link href={hubWith("friends=1")} style={{ ...pill(VIOLET), textDecoration: "none" }}>BACK TO FRIENDS</Link>
        </div>
      </div>
    );
  }

  const { name } = profile;
  const since = shortDate(profile.friendsSince);
  const myTurn = battles.filter((b) => b.status === "active" && b.myScore === null);
  const invited = battles.filter((b) => b.status === "invited" && !b.iChallenged);
  const waitingOnThem = battles.filter((b) => b.status === "active" && b.myScore !== null);
  const { won, lost, drawn } = profile.record;
  const played = won + lost + drawn;
  const act = async (job: () => Promise<unknown>) => {
    setBusy(true);
    try { await job(); await load(); } catch { setMessage("That didn't work just now. Try again in a moment."); }
    setBusy(false);
  };

  return (
    <main style={{ minHeight: "100dvh", background: "radial-gradient(1200px 600px at 20% -10%, #4a2a8a 0%, #1a1036 55%, #0e0820 100%)", color: "#fff", fontFamily: "Inter, system-ui, sans-serif", paddingInline: 16, paddingBlock: "max(16px, env(safe-area-inset-top)) 48px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <Link href={hubWith("friends=1")} style={{ ...pill("rgba(255,255,255,.1)"), alignSelf: "flex-start", textDecoration: "none" }}><ArrowLeft size={16} aria-hidden="true" />FRIENDS</Link>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 18, alignItems: "start" }}>
          {/* Their explorer and the two big buttons. */}
          <section style={{ ...section, alignItems: "center", textAlign: "center", paddingTop: 26 }} aria-label={`${name}'s explorer`}>
            <div style={{ position: "relative", display: "grid", placeItems: "center", width: "100%" }}>
              <span aria-hidden="true" style={{ position: "absolute", width: 230, height: 230, maxWidth: "80%", aspectRatio: "1", borderRadius: 999, background: online ? `radial-gradient(circle, ${GREEN}55, transparent 70%)` : `radial-gradient(circle, ${VIOLET}55, transparent 70%)` }} />
              <StudentAvatar outfit={friendLook(profile.outfit)} height={280} glowColor="transparent" />
            </div>
            <h1 style={{ margin: 0, fontFamily: HEADING, fontWeight: 900, fontSize: "clamp(30px, 6vw, 40px)", textWrap: "balance" }}>{name}</h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {online ? <span style={{ ...labelStyle, color: "#103a17", background: GREEN, borderRadius: 99, padding: "5px 12px" }}>● IN THE HUB NOW</span> : null}
              {since ? <span style={{ ...labelStyle, background: "rgba(255,255,255,.08)", borderRadius: 99, padding: "5px 12px" }}>FRIENDS SINCE {since.toUpperCase()}</span> : null}
              {profile.sameClass ? <span style={{ ...labelStyle, background: "rgba(255,255,255,.08)", borderRadius: 99, padding: "5px 12px" }}>IN YOUR CLASS</span> : null}
            </div>
            <div style={{ display: "flex", gap: 10, width: "100%", flexWrap: "wrap" }}>
              <button type="button" onClick={() => router.push(visitHref(friendId, demo))} style={{ ...pill(VIOLET), flex: "1 1 140px", padding: "15px 14px", fontSize: 16 }}><Home size={19} aria-hidden="true" />VISIT WORLD</button>
              {profile.battlesEnabled ? <button type="button" onClick={() => router.push(battlesPanelHref(friendId, demo))} style={{ ...pill(GOLD, "#3a2a00"), flex: "1 1 140px", padding: "15px 14px", fontSize: 16 }}><Swords size={19} aria-hidden="true" />BATTLE</button> : null}
            </div>
            <p style={{ margin: 0, fontSize: 13, opacity: .75 }}>{profile.worldItems ? `${name} has built ${profile.worldItems} thing${profile.worldItems === 1 ? "" : "s"} in their world.` : `${name} hasn't built much yet.`}</p>
          </section>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
            {/* Battling. */}
            {profile.battlesEnabled ? <section style={section} aria-label={`Battle ${name}`}>
              <SectionTitle icon={<Swords size={20} />} colour={GOLD}>How to battle {name}</SectionTitle>
              <Steps colour={GOLD} items={[
                <>Tap <b>BATTLE</b> and pick a realm.</>,
                <>Choose <b>LIVE</b> (you both play now{online ? `, and ${name}'s on` : ""}) or <b>TAKE TURNS</b> ({name} plays later).</>,
                <>You each answer {BATTLE_QUESTIONS} quick questions <b>at your own level</b>. Most right wins!</>,
              ]} />
              {[...invited, ...myTurn].map((battle) => (
                <div key={battle.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,207,74,.14)", border: `1.5px solid ${GOLD}88`, borderRadius: 16, padding: "10px 12px" }}>
                  <span style={{ flex: 1, minWidth: 0, fontWeight: 800 }}>{name} challenged you!<small style={{ display: "block", fontWeight: 600, opacity: .8 }}>{realmName(battle.realm)} · your turn</small></span>
                  <button type="button" onClick={() => router.push(battle.status === "invited" ? hubWith("battles=1") : battleRoomHref({ id: battle.id, seed: battle.seed, realm: battle.realm, mode: battle.mode, friendId, friendName: name }, demo))} style={pill(GREEN, "#103a17")}>PLAY NOW</button>
                </div>
              ))}
              {waitingOnThem.map((battle) => <div key={battle.id} style={{ fontSize: 14, opacity: .85 }}>Waiting for {name} to play {realmName(battle.realm)} · you got {battle.myScore}</div>)}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "rgba(0,0,0,.22)", borderRadius: 16, padding: "12px 14px" }}>
                <span style={labelStyle}>YOUR BATTLES</span>
                <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: 22, fontVariantNumeric: "tabular-nums" }}>{played ? <>You {won} <span style={{ color: GOLD }}>–</span> {lost} {name}{drawn ? <small style={{ fontSize: 13, opacity: .75 }}> · {drawn} draw{drawn === 1 ? "" : "s"}</small> : null}</> : "No battles yet"}</span>
              </div>
              {profile.recent.length ? <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{profile.recent.map((battle) => (
                <div key={battle.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 2px", borderTop: "1px solid rgba(255,255,255,.07)", fontSize: 14 }}>
                  <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 99, background: reliqRealmColor(battle.realm), flex: "none" }} />
                  <span style={{ flex: 1, minWidth: 0, fontWeight: 700 }}>{battle.won ? "🏆 You won" : battle.draw ? "🤝 Draw" : `${name} won`} · {realmName(battle.realm)}</span>
                  <span style={{ fontFamily: HEADING, fontWeight: 900, fontVariantNumeric: "tabular-nums", opacity: .9 }}>{battle.myScore} – {battle.friendScore}</span>
                </div>
              ))}</div> : null}
            </section> : null}

            {/* Building in their world. */}
            <section style={section} aria-label={`Building in ${name}'s world`}>
              <SectionTitle icon={<Hammer size={20} />} colour={GREEN}>Help build in {name}&apos;s world</SectionTitle>
              {profile.iCanBuild ? <>
                <p style={{ margin: 0, fontWeight: 800, color: GREEN }}>✓ {name} said you can help build.</p>
                <Steps colour={GREEN} items={[
                  <>Tap <b>VISIT WORLD</b>.</>,
                  <>Tap <b>BUILD</b> to place, move and paint things, just like in your own world.</>,
                  <>{name} sees what you changed and can keep it or undo it.</>,
                ]} />
              </> : <>
                <p style={{ margin: 0, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><Eye size={17} aria-hidden="true" style={{ flex: "none" }} />Right now you can visit and look around.</p>
                <Steps colour={LILAC} items={[
                  <>Ask {name} to open <b>your</b> friend page (or the Friends panel).</>,
                  <>They choose <b>CAN HELP BUILD</b> for {myName}.</>,
                  <>Then tap <b>VISIT WORLD</b> and <b>BUILD</b>.</>,
                ]} />
              </>}
            </section>

            {/* What they can do in my world. */}
            <section style={section} aria-label={`${name} in your world`}>
              <SectionTitle icon={<Eye size={20} />} colour={LILAC}>{name} in your world</SectionTitle>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, opacity: .9 }}>Friends can always visit your world. You choose whether {name} can change it.</p>
              <WorldAccessChoice name={name} canBuild={profile.theyCanBuild} enabled={profile.buildingEnabled} busy={busy} onChange={(build) => void act(() => setFriendCanBuild(studentId, demo, profile.friendshipId, build))} />
            </section>

            {message ? <p role="status" style={{ margin: 0, fontWeight: 700 }}>{message}</p> : null}
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {confirmRemove ? <>
                <span style={{ alignSelf: "center", fontSize: 14, fontWeight: 700 }}>Remove {name} as a friend?</span>
                <button type="button" disabled={busy} onClick={() => void (async () => { setBusy(true); try { await removeFriend(studentId, demo, profile.friendshipId); router.push(hubWith("friends=1")); } catch { setMessage("That didn't work just now. Try again in a moment."); setBusy(false); } })()} style={pill("#e5484d")}>REMOVE</button>
                <button type="button" onClick={() => setConfirmRemove(false)} style={pill("rgba(255,255,255,.12)")}>KEEP</button>
              </> : <button type="button" onClick={() => setConfirmRemove(true)} style={{ ...pill("transparent"), opacity: .6, fontSize: 12 }}><UserMinus size={14} aria-hidden="true" />Remove friend</button>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
