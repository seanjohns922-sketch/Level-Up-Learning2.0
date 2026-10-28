"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CRYSTALS_TO_AWAKEN } from "@/lib/chronorok";
import { dismissCrystalReveal, getCrystalReveal, subscribeCrystalReveal } from "@/lib/chrono-crystals";
import { getRevealQueue, subscribeReveal } from "@/lib/gem-reveal";

/** The daily Chrono Crystal reveal. Waits until any gem reveal has finished,
 *  then a crystal appears with a glow and the count ticks up. Everyday crystals
 *  close by themselves after a few seconds; milestones stay until tapped. */

const NONE: never[] = [];

function Crystal({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 80 100" aria-hidden="true" className="chronoCrystalGem">
      <defs>
        <linearGradient id="cc-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff6d0" /><stop offset=".45" stopColor="#ffc94a" /><stop offset="1" stopColor="#d9770f" /></linearGradient>
        <linearGradient id="cc-b" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9a0" /><stop offset="1" stopColor="#b85a0a" /></linearGradient>
      </defs>
      <polygon points="40,2 66,30 56,94 24,94 14,30" fill="url(#cc-a)" />
      <polygon points="40,2 66,30 40,40" fill="#fff8e0" opacity=".85" />
      <polygon points="40,40 66,30 56,94" fill="url(#cc-b)" />
      <polygon points="40,40 14,30 24,94" fill="#ffd77a" opacity=".9" />
      <polygon points="40,40 56,94 24,94" fill="#e8901e" opacity=".75" />
      <circle cx="40" cy="44" r="6" fill="#fff" opacity=".8" />
    </svg>
  );
}

export default function ChronoCrystalReveal() {
  const router = useRouter();
  const reveal = useSyncExternalStore(subscribeCrystalReveal, getCrystalReveal, () => null);
  const gemsWaiting = useSyncExternalStore(subscribeReveal, getRevealQueue, () => NONE).length > 0;
  const showing = reveal && !gemsWaiting ? reveal : null;
  const big = Boolean(showing?.milestone);

  useEffect(() => {
    if (!showing || big) return;
    const timer = window.setTimeout(() => dismissCrystalReveal(), 3800);
    return () => window.clearTimeout(timer);
  }, [showing, big]);

  if (!showing) return null;
  const left = Math.max(0, CRYSTALS_TO_AWAKEN - showing.crystals);
  const headline =
    showing.milestone === "awaken" ? `${showing.chronorok} awakens!`
    : showing.milestone === "open" ? "Chronorok is open!"
    : showing.milestone === "first" ? "Your first Chrono Crystal!"
    : showing.milestone === "quarter" ? `${showing.crystals} Chrono Crystals!`
    : "+1 Chrono Crystal";
  const line =
    showing.milestone === "awaken" ? "Go to the Awakening Spire in Chronorok."
    : showing.milestone === "open" ? "Your portal to the Chronorok games awaits in the Tower."
    : showing.milestone === "first" ? `You earn one every day you learn. Collect ${CRYSTALS_TO_AWAKEN} to awaken ${showing.chronorok}.`
    : `${left} more learning day${left === 1 ? "" : "s"} to awaken ${showing.chronorok}.`;

  return (
    <div className={`chronoCrystal ${big ? "isBig" : ""}`} role="status" aria-live="polite" onClick={() => !big && dismissCrystalReveal()}>
      <div className="chronoCrystalCard">
        <div className="chronoCrystalGlow" />
        <Crystal size={big ? 130 : 84} />
        <p className="chronoCrystalKicker">CHRONO CRYSTALS · {showing.crystals} / {CRYSTALS_TO_AWAKEN}</p>
        <h2 className="chronoCrystalTitle">{headline}</h2>
        <div className="chronoCrystalBar"><i style={{ width: `${(showing.crystals / CRYSTALS_TO_AWAKEN) * 100}%` }} /></div>
        <p className="chronoCrystalLine">{line}</p>
        {big ? (
          <div className="chronoCrystalActions">
            {showing.milestone === "open" || showing.milestone === "awaken" ? (
              <button type="button" onClick={() => { dismissCrystalReveal(); router.push("/world/chronorok"); }}>GO TO CHRONOROK</button>
            ) : null}
            <button type="button" className="isQuiet" onClick={() => dismissCrystalReveal()}>NICE!</button>
          </div>
        ) : null}
      </div>
      <style>{`
        .chronoCrystal{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;pointer-events:auto;background:rgba(10,6,20,.35);animation:ccFade .35s ease-out}
        .chronoCrystal:not(.isBig){background:transparent;pointer-events:none;align-items:end;padding-bottom:12vh}
        .chronoCrystal:not(.isBig) .chronoCrystalCard{pointer-events:auto;cursor:pointer}
        .chronoCrystalCard{position:relative;width:min(400px,90vw);padding:22px 24px 20px;border-radius:26px;text-align:center;color:#fff;font-family:var(--font-sans);background:rgba(28,16,8,.88);border:1px solid rgba(255,214,120,.45);box-shadow:0 20px 60px rgba(0,0,0,.45),0 0 60px rgba(255,180,60,.25);animation:ccPop .5s cubic-bezier(.2,1.4,.4,1)}
        .isBig .chronoCrystalCard{width:min(460px,92vw);padding:30px 28px 24px}
        .chronoCrystalGlow{position:absolute;left:50%;top:18px;width:200px;height:200px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,200,80,.55),rgba(255,160,40,0) 65%);pointer-events:none;animation:ccPulse 1.6s ease-in-out infinite}
        .chronoCrystalGem{position:relative;display:block;margin:0 auto;filter:drop-shadow(0 0 18px rgba(255,190,70,.8));animation:ccSpin 1.1s cubic-bezier(.2,1.2,.4,1)}
        .chronoCrystalKicker{position:relative;margin:10px 0 0;font:900 11px var(--font-display);letter-spacing:.18em;color:#ffd9a0}
        .chronoCrystalTitle{position:relative;margin:4px 0 0;font:900 26px var(--font-display);letter-spacing:.04em;color:#ffe2a0;text-shadow:0 2px 14px rgba(245,180,50,.6)}
        .isBig .chronoCrystalTitle{font-size:32px}
        .chronoCrystalBar{position:relative;height:10px;margin:12px 0 8px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden}
        .chronoCrystalBar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#ffb347,#ffe08a);box-shadow:0 0 12px #ffc94a;animation:ccFill 1.1s .3s ease-out both}
        .chronoCrystalLine{position:relative;margin:0;font-weight:700;font-size:15px;color:#f3ead9}
        .chronoCrystalActions{position:relative;display:flex;gap:10px;justify-content:center;margin-top:16px}
        .chronoCrystalActions button{height:48px;padding:0 22px;border-radius:999px;border:0;background:#fff;color:#16121f;font:900 14px var(--font-display);cursor:pointer}
        .chronoCrystalActions .isQuiet{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,230,180,.3)}
        @keyframes ccFade{from{opacity:0}to{opacity:1}}
        @keyframes ccPop{from{opacity:0;transform:translateY(24px) scale(.85)}to{opacity:1;transform:none}}
        @keyframes ccSpin{from{opacity:0;transform:scale(.3) rotate(-160deg)}to{opacity:1;transform:none}}
        @keyframes ccPulse{0%,100%{opacity:.7;transform:translateX(-50%) scale(.95)}50%{opacity:1;transform:translateX(-50%) scale(1.08)}}
        @keyframes ccFill{from{width:0}}
        @media (prefers-reduced-motion:reduce){.chronoCrystal,.chronoCrystalCard,.chronoCrystalGem,.chronoCrystalGlow,.chronoCrystalBar i{animation:none}}
      `}</style>
    </div>
  );
}
