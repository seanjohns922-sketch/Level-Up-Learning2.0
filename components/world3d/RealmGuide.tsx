"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { getLegendForYear, normalizeLegendRealmId } from "@/data/legends";

// 3D world labels use drei's Html layer (z-index up to 16777271), so the guide sits just above it.
// The realm guide for Levels G–6: the Legend for the student's current level welcomes them as they
// arrive from the Tower, then stays beside the HUD with a line that follows their progress. Passing
// the level's post-test is what adds this Legend to their collection.

type GuideLine = { text: string; mood: "welcome" | "progress" | "quiz" | "posttest" | "tip" };
/** The parts of a realm's world state the guide reads; every G–6 realm world provides these. */
export type GuideWorld = {
  currentWeek: number;
  currentDistrictId: string;
  completedWeeks: number[];
  districts: { id: string; label: string }[];
  weekNodes: { week: number; nextActivityType?: "lesson" | "quiz" }[];
  nextActivity: { label: string };
};

function guideImage(avatar: string) {
  const key = avatar.split("/").pop()?.replace(/-front\.png$/, "");
  return key ? `/guides/${key}.webp` : null;
}

function levelTitle(level: string) {
  return level === "Prep" ? "Ground Level" : level.replace("Year", "Level");
}

/** Lines that follow the student's real progress through the realm. */
export function guideLines(world: GuideWorld, realmName: string, legendName: string): GuideLine[] {
  const total = world.weekNodes.length;
  const done = world.completedWeeks.length;
  const district = world.districts.find((d) => d.id === world.currentDistrictId)?.label ?? realmName;
  const next = world.nextActivity.label;
  const current = world.weekNodes.find((node) => node.week === world.currentWeek);
  const lines: GuideLine[] = [];
  if (total > 0 && done >= total) {
    lines.push({ mood: "posttest", text: `Every week is cleared! Your post-test is next. Score 85% and I'll join your Legends collection.` });
  } else if (current?.nextActivityType === "quiz") {
    lines.push({ mood: "quiz", text: `You've finished this week's lessons. The Week ${world.currentWeek} quiz is next — 80% opens the way to Week ${world.currentWeek + 1}.` });
  } else if (done === 0) {
    lines.push({ mood: "welcome", text: `Welcome to ${realmName}! I'm ${legendName}. The Fog of Forgetfulness has crept into the ${district}. Let's start with ${next}.` });
  } else {
    lines.push({ mood: "progress", text: `Welcome back! ${done} of ${total} weeks cleared. Today we're in the ${district}: ${next}.` });
  }
  lines.push({ mood: "tip", text: "The Fog dims whatever we stop practising. Every lesson you finish pushes it further back." });
  if (total > 0 && done < total) lines.push({ mood: "tip", text: `Clear all ${total} weeks, then pass the post-test with 85% to free me from the Fog and add me to your Legends.` });
  lines.push({ mood: "tip", text: "Stuck on a question? Use the skill guide at the start of each lesson, and the read-aloud button beside every question." });
  return lines;
}

export default function RealmGuide({ realmId, level, realmName, accent, world }: { realmId: string; level: string; realmName: string; accent: string; world: GuideWorld }) {
  const legend = useMemo(() => getLegendForYear(level, normalizeLegendRealmId(realmId)), [level, realmId]);
  const image = guideImage(legend.images.avatar);
  const lines = useMemo(() => guideLines(world, realmName, legend.name), [world, realmName, legend.name]);
  const arrivalKey = `reliq:guide-arrival:${realmId}:${level}`;
  const [arriving, setArriving] = useState(false);
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  // The full welcome plays once per realm and level in each session; later visits go straight to the guide.
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(arrivalKey) === "1"; } catch { /* storage unavailable: show the welcome */ }
    if (!seen) queueMicrotask(() => setArriving(true));
  }, [arrivalKey]);
  function finishArrival() {
    setArriving(false);
    setOpen(true);
    try { sessionStorage.setItem(arrivalKey, "1"); } catch { /* optional */ }
  }
  if (!image) return null;
  const line = lines[index % lines.length];
  const style = { "--guide-accent": accent } as CSSProperties;
  return (
    <>
      <style>{GUIDE_CSS}</style>
      {arriving ? (
        <section className="realmGuideArrival" style={style} role="dialog" aria-modal="true" aria-labelledby="realm-guide-title" onKeyDown={(e) => { if (e.key === "Escape") finishArrival(); }}>
          <div className="realmGuideArrivalCard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="realmGuideArrivalArt" src={image} alt={legend.name} />
            <div className="realmGuideArrivalText">
              <small>ENTERING THE REALM</small>
              <h1 id="realm-guide-title">{realmName}</h1>
              <p className="realmGuideArrivalLevel">{levelTitle(level)} · Your guide: {legend.name}</p>
              <p>{lines[0].text}</p>
              <div className="realmGuideArrivalActions">
                <button autoFocus onClick={finishArrival}>Let&apos;s go →</button>
                <ReadAloudBtn text={`${realmName}. ${levelTitle(level)}. Your guide is ${legend.name}. ${lines[0].text}`} />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <aside className="realmGuide" style={style} aria-label={`${legend.name}, your realm guide`}>
          <button className="realmGuideCharacter" onClick={() => { if (open) setIndex((i) => i + 1); else setOpen(true); }} aria-label={open ? `Next tip from ${legend.name}` : `Talk to ${legend.name}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" />
          </button>
          {open ? (
            <div className="realmGuideBubble" data-mood={line.mood}>
              <strong>{legend.name}</strong>
              <p>{line.text}</p>
              <div className="realmGuideBubbleActions">
                <ReadAloudBtn text={`${legend.name} says: ${line.text}`} />
                <button onClick={() => setIndex((i) => i + 1)}>Next tip</button>
                <button onClick={() => setOpen(false)} aria-label="Hide guide message">Hide</button>
              </div>
            </div>
          ) : null}
        </aside>
      )}
    </>
  );
}

const GUIDE_CSS = `
.realmGuide{position:absolute;z-index:16777290;left:max(16px,env(safe-area-inset-left));top:max(124px,calc(env(safe-area-inset-top) + 112px));display:flex;align-items:flex-start;gap:4px;pointer-events:none;max-width:min(430px,calc(100vw - 32px))}
.realmGuideCharacter{pointer-events:auto;flex:0 0 auto;width:118px;height:150px;padding:0;border:0;background:none;cursor:pointer;filter:drop-shadow(0 10px 18px rgba(0,0,0,.45));animation:realmGuideIdle 4.5s ease-in-out infinite}
.realmGuideCharacter img{width:100%;height:100%;object-fit:contain;object-position:bottom}
.realmGuideCharacter:focus-visible{outline:3px solid var(--guide-accent);outline-offset:4px;border-radius:12px}
.realmGuideBubble{pointer-events:auto;position:relative;margin-top:16px;padding:12px 14px 10px;border-radius:14px;border:1px solid color-mix(in srgb,var(--guide-accent) 45%,transparent);background:rgba(16,18,24,.88);color:#f6f2ea;backdrop-filter:blur(8px);box-shadow:0 12px 30px rgba(0,0,0,.35);animation:realmGuidePop .35s ease-out}
.realmGuideBubble::before{content:"";position:absolute;left:-7px;top:22px;width:12px;height:12px;transform:rotate(45deg);background:rgba(16,18,24,.88);border-left:1px solid color-mix(in srgb,var(--guide-accent) 45%,transparent);border-bottom:1px solid color-mix(in srgb,var(--guide-accent) 45%,transparent)}
.realmGuideBubble strong{display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--guide-accent)}
.realmGuideBubble p{margin:5px 0 8px;font-size:14px;line-height:1.45}
.realmGuideBubbleActions{display:flex;align-items:center;gap:8px}
.realmGuideBubbleActions button{font-size:12px;font-weight:700;padding:5px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#f6f2ea;cursor:pointer}
.realmGuideBubbleActions button:hover{background:color-mix(in srgb,var(--guide-accent) 30%,transparent)}
.realmGuideArrival{position:absolute;inset:0;z-index:16777300;display:grid;place-items:center;padding:18px;background:radial-gradient(circle at 30% 60%,color-mix(in srgb,var(--guide-accent) 32%,transparent),rgba(8,9,12,.82) 70%);backdrop-filter:blur(3px);animation:realmGuideFade .5s ease-out}
.realmGuideArrivalCard{display:flex;align-items:flex-end;gap:10px;width:min(780px,100%)}
.realmGuideArrivalArt{width:min(300px,38vw);max-height:62vh;object-fit:contain;filter:drop-shadow(0 18px 40px rgba(0,0,0,.55));animation:realmGuideEnter .7s cubic-bezier(.2,.8,.2,1)}
.realmGuideArrivalText{flex:1;padding:22px 24px;margin-bottom:28px;border-radius:18px;border:1px solid color-mix(in srgb,var(--guide-accent) 45%,transparent);background:rgba(14,16,22,.9);color:#f6f2ea;box-shadow:0 20px 60px rgba(0,0,0,.45);animation:realmGuidePop .6s .15s ease-out both}
.realmGuideArrivalText small{font-size:11px;font-weight:800;letter-spacing:.18em;color:var(--guide-accent)}
.realmGuideArrivalText h1{margin:6px 0 2px;font-size:clamp(26px,4vw,40px);font-weight:900;line-height:1.1}
.realmGuideArrivalLevel{margin:0 0 12px;font-size:13px;font-weight:700;color:#cfc8bb}
.realmGuideArrivalText p{font-size:16px;line-height:1.55}
.realmGuideArrivalActions{display:flex;align-items:center;gap:12px;margin-top:16px}
.realmGuideArrivalActions button{padding:12px 20px;border:0;border-radius:10px;font-weight:900;font-size:15px;color:#141414;background:var(--guide-accent);cursor:pointer}
.realmGuideArrivalActions button:focus-visible{outline:3px solid #fff;outline-offset:3px}
@keyframes realmGuideIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes realmGuidePop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}
@keyframes realmGuideFade{from{opacity:0}to{opacity:1}}
@keyframes realmGuideEnter{from{opacity:0;transform:translateX(-60px) scale(.9)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.realmGuideCharacter,.realmGuideBubble,.realmGuideArrival,.realmGuideArrivalArt,.realmGuideArrivalText{animation:none}}
@media(max-width:900px){.realmGuide{top:max(176px,calc(env(safe-area-inset-top) + 164px))}}
@media(max-width:560px){.realmGuide{top:max(160px,calc(env(safe-area-inset-top) + 150px))}.realmGuideCharacter{width:72px;height:96px}.realmGuideBubble{margin-top:8px;padding:9px 11px 8px}.realmGuideBubble p{font-size:13px}
.realmGuideArrivalCard{flex-direction:column;align-items:center}.realmGuideArrivalArt{width:46vw;max-height:32vh}.realmGuideArrivalText{margin-bottom:0;padding:16px}}
`;
