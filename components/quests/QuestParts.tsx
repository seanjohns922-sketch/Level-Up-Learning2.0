"use client";
// Daily quests and XP bonuses on screen: the hub's quest card, the reward pop-ups and celebrations, and the
// parent's read-only card. The server decides and pays everything (lib/xp-quests.ts).
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Target } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { GOLD, GREEN, HEADING, LILAC, VIOLET, panelStyle, pill, stopHub } from "@/components/world3d/friends/FriendBits";
import { getCrystalReveal, subscribeCrystalReveal } from "@/lib/chrono-crystals";
import { getRevealQueue, subscribeReveal } from "@/lib/gem-reveal";
import { getStreakReward, subscribeLearningStreak } from "@/lib/learning-streak";
import {
  dismissXpAward, levelName, questTitle, questsDone, realmName, useDailyQuests, useXpAward,
  type DailyQuests, type Quest, type XpAward,
} from "@/lib/xp-quests";

const FOLDED_KEY = "reliq:quests:folded";
/** Folded unless opened today; on smaller screens it starts folded so the hub stays clear. */
const readFolded = (day: string) => {
  try {
    const saved = localStorage.getItem(FOLDED_KEY);
    if (saved === day) return true;
    if (saved === `open:${day}`) return false;
  } catch { /* fall through */ }
  return typeof window !== "undefined" && window.matchMedia("(max-width: 1180px)").matches;
};
const writeFolded = (day: string, folded: boolean) => { try { localStorage.setItem(FOLDED_KEY, folded ? day : `open:${day}`); } catch { /* per-device, fine to lose */ } };

function QuestRow({ quest }: { quest: Quest }) {
  const partial = !quest.done && quest.target > 1;
  return (
    <li style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, background: quest.done ? "rgba(125,255,138,.14)" : "rgba(255,255,255,.07)" }}>
      <span aria-hidden="true" style={{ width: 24, height: 24, flex: "none", borderRadius: 99, display: "grid", placeItems: "center", background: quest.done ? GREEN : "transparent", border: `2px solid ${quest.done ? GREEN : "rgba(255,255,255,.35)"}`, color: "#103a17" }}>
        {quest.done ? <Check size={14} strokeWidth={3.5} /> : null}
      </span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
        {questTitle(quest.id)}
        {partial ? (
          <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <span style={{ flex: 1, height: 7, borderRadius: 99, background: "rgba(255,255,255,.14)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${(quest.progress / quest.target) * 100}%`, background: `linear-gradient(90deg, ${GOLD}, #ff9d2e)` }} /></span>
            <span style={{ fontSize: 11, opacity: .8 }}>{quest.progress}/{quest.target}</span>
          </span>
        ) : null}
      </span>
      <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: 13, color: GOLD, whiteSpace: "nowrap" }}>+{quest.xp}</span>
    </li>
  );
}

const questsSpoken = (quests: DailyQuests) =>
  `Today's quests. ${quests.quests.map((q) => `${questTitle(q.id)}, ${q.xp} X P${q.done ? ", done" : ""}.`).join(" ")} Do all three for a bonus ${quests.bonusXp} X P.`;

/** The hub's quest card, top right under the points bar. Folds to a small button (remembered for the day). */
export function HubQuestCard() {
  const quests = useDailyQuests();
  // A tap this session wins; otherwise what was remembered for today.
  const [choice, setChoice] = useState<{ day: string; folded: boolean } | null>(null);
  if (!quests || !quests.quests.length) return null;
  const folded = choice?.day === quests.day ? choice.folded : readFolded(quests.day);
  const done = questsDone(quests.quests);
  const all = done === quests.quests.length;
  const fold = (next: boolean) => { setChoice({ day: quests.day, folded: next }); writeFolded(quests.day, next); };

  return (
    <section aria-label="Today's quests" className="hubQuests" {...stopHub}>
      {folded ? (
        <button type="button" onClick={() => fold(false)} className="hubQuestsPill" aria-expanded="false">
          <Target size={15} aria-hidden="true" color={all ? GREEN : GOLD} />QUESTS {done}/{quests.quests.length}<ChevronDown size={15} aria-hidden="true" />
        </button>
      ) : (
        <div className="hubQuestsCard" style={panelStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: 14, letterSpacing: ".06em", flex: 1 }}>TODAY&apos;S QUESTS</span>
            <ReadAloudBtn text={questsSpoken(quests)} />
            <button type="button" onClick={() => fold(true)} aria-label="Fold quests away" aria-expanded="true" style={{ ...pill("rgba(255,255,255,.1)"), padding: 6, borderRadius: 10 }}><ChevronUp size={16} /></button>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {quests.quests.map((quest) => <QuestRow key={quest.id} quest={quest} />)}
          </ul>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: all ? GREEN : GOLD }}>
            {all ? `All done! +${quests.bonusXp} bonus banked. New quests tomorrow.` : `Do all ${quests.quests.length} for a bonus +${quests.bonusXp}`}
          </p>
        </div>
      )}
      <style>{`
        .hubQuests{position:fixed;right:max(16px,2vw);top:max(84px,calc(env(safe-area-inset-top) + 72px));z-index:38;pointer-events:auto}
        .hubQuestsCard{width:min(290px,calc(100vw - 32px));box-sizing:border-box;padding:12px;display:flex;flex-direction:column;gap:8px;border-radius:20px !important}
        .hubQuestsPill{display:flex;align-items:center;gap:6px;border:2px solid ${VIOLET}99;border-radius:14px;padding:8px 12px;background:rgba(20,14,40,.92);color:#fff;font:900 13px ${HEADING};letter-spacing:.04em;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35)}
        @media (max-width:860px){.hubQuests{top:auto;bottom:calc(env(safe-area-inset-bottom) + 180px);right:12px;display:flex;flex-direction:column;align-items:flex-end}}
      `}</style>
    </section>
  );
}

function awardText(award: XpAward): { title: string; line: string; tag?: string } {
  switch (award.kind) {
    case "quest": return { title: "QUEST DONE!", line: questTitle(award.quest) };
    case "accuracy": return award.perfect ? { title: "SHARP!", line: "Every answer right first go" } : { title: "GREAT ACCURACY!", line: "80% or more right first go" };
    case "quests_all": return { title: "ALL QUESTS DONE!", line: "New quests tomorrow." };
    case "week": return { tag: realmName(award.realm).toUpperCase(), title: `WEEK ${award.week} CLEARED!`, line: `Every lesson in Week ${award.week} done. On to the next week!` };
    case "level": return { tag: realmName(award.realm).toUpperCase(), title: `${levelName(award.level).toUpperCase()} CLEARED!`, line: "That's a whole level. Time to spend it!" };
  }
}

const NONE: never[] = [];
/** Rewards as they land: small ones as a pop at the top, big ones as a celebration. Waits for gem,
 *  Chrono Crystal and streak reveals to close first. Mounted once for the whole app. */
export function XpRewardReveal() {
  const router = useRouter();
  const award = useXpAward();
  const gemsWaiting = useSyncExternalStore(subscribeReveal, getRevealQueue, () => NONE).length > 0;
  const crystalShowing = useSyncExternalStore(subscribeCrystalReveal, getCrystalReveal, () => null) !== null;
  const streakShowing = useSyncExternalStore(subscribeLearningStreak, getStreakReward, () => null) !== null;
  const small = award?.kind === "quest" || award?.kind === "accuracy";
  const blocked = gemsWaiting || crystalShowing || streakShowing;

  useEffect(() => {
    if (!award || !small || blocked) return;
    const timer = window.setTimeout(dismissXpAward, 3600);
    return () => window.clearTimeout(timer);
  }, [award, small, blocked]);

  if (!award || blocked) return null;
  const text = awardText(award);

  if (small) {
    return (
      <div role="status" aria-live="polite" onClick={dismissXpAward} style={{ ...panelStyle, position: "fixed", left: "50%", transform: "translateX(-50%)", top: "max(16px, env(safe-area-inset-top))", zIndex: 2147482990, width: "min(400px, calc(100vw - 32px))", boxSizing: "border-box", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, borderColor: GREEN, borderRadius: 20, cursor: "pointer" }}>
        <span aria-hidden="true" style={{ width: 36, height: 36, flex: "none", borderRadius: 99, background: GREEN, color: "#103a17", display: "grid", placeItems: "center" }}><Check size={20} strokeWidth={3.5} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: HEADING, fontWeight: 900, fontSize: 15, letterSpacing: ".04em" }}>{text.title}</span>
          <span style={{ display: "block", fontSize: 13, fontWeight: 700, opacity: .85 }}>{text.line}</span>
        </span>
        <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: 20, color: GOLD }}>+{award.xp}</span>
      </div>
    );
  }

  const big = award.kind === "level";
  const spoken = `${text.tag ? `${text.tag}. ` : ""}${text.title} You earned ${award.xp} X P. ${text.line}`;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="xp-reward-title" style={{ position: "fixed", inset: 0, zIndex: 2147482990, display: "grid", placeItems: "center", background: "rgba(8,5,18,.62)", padding: 16 }}>
      <div style={{ ...panelStyle, width: "min(380px, 100%)", boxSizing: "border-box", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", borderColor: big ? GOLD : award.kind === "week" ? "#4ad7ff" : GOLD, position: "relative", overflow: "hidden" }}>
        <Confetti />
        <div style={{ alignSelf: "flex-end" }}><ReadAloudBtn text={spoken} /></div>
        {text.tag ? <span style={{ fontFamily: HEADING, fontWeight: 900, fontSize: 13, letterSpacing: ".1em", color: big ? GREEN : "#4ad7ff" }}>{text.tag}</span> : null}
        <h2 id="xp-reward-title" style={{ margin: 0, fontFamily: HEADING, fontWeight: 900, fontSize: big ? 26 : 22, letterSpacing: ".03em" }}>{text.title}</h2>
        <p style={{ margin: 0, fontFamily: HEADING, fontWeight: 900, fontSize: big ? 56 : 44, color: GOLD, textShadow: "0 4px 0 rgba(0,0,0,.3)", fontVariantNumeric: "tabular-nums" }}>+{award.xp.toLocaleString()}</p>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, opacity: .85 }}>{text.line}</p>
        <div style={{ display: "grid", gap: 8, width: "100%", marginTop: 8 }}>
          {big ? <button type="button" onClick={() => { dismissXpAward(); router.push("/marketplace"); }} style={pill(GOLD, "#3a2a00")}>TO THE SHOP</button> : null}
          <button type="button" onClick={dismissXpAward} style={big ? pill("rgba(255,255,255,.12)") : pill(VIOLET)}>{big ? "KEEP LEARNING" : "NICE!"}</button>
        </div>
      </div>
    </div>
  );
}

// Round the edges only, behind the words.
const CONFETTI = [[5, 6, GOLD, 20], [78, 3, GREEN, -30], [93, 88, VIOLET, 50], [3, 92, "#4ad7ff", -15], [48, 2, "#ff7ab8", 65], [2, 48, LILAC, 35], [95, 50, GOLD, -40]] as const;
function Confetti() {
  return <>{CONFETTI.map(([x, y, colour, turn]) => <span key={`${x}${y}`} aria-hidden="true" style={{ position: "absolute", zIndex: 0, left: `${x}%`, top: `${y}%`, width: 10, height: 16, borderRadius: 3, background: colour, transform: `rotate(${turn}deg)` }} />)}</>;
}

/** The parent's read-only card: today's quests for their child. Adult styling (black, white, lime). */
export function ParentQuestCard({ firstName, quests }: { firstName: string; quests: DailyQuests }) {
  if (!quests.quests.length) return null;
  const done = questsDone(quests.quests);
  return (
    <section aria-label="Today's quests" className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-start sm:p-6">
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#121314] text-[var(--reliq-lime)]">
        <Target className="h-8 w-8" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-xl font-black">Today&apos;s quests: {done} of {quests.quests.length} done</h3>
        <p className="mt-1 text-slate-700">Small daily goals that earn {firstName} extra XP. All {quests.quests.length} earn a +{quests.bonusXp} XP bonus.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {quests.quests.map((quest) => (
            <li key={quest.id} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${quest.done ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${quest.done ? "border-slate-900 bg-slate-900 text-[var(--reliq-lime)]" : "border-slate-300"}`}>{quest.done ? <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden="true" /> : null}</span>
              <span className="min-w-0"><span className="block font-bold text-slate-900">{questTitle(quest.id)}</span><span className="text-slate-600">+{quest.xp} XP{quest.done ? " · done" : ""}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
