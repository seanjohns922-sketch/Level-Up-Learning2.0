"use client";
// Walk-and-place building: a hotbar of recent and pinned items, and the buttons
// to place, turn, erase or switch to the bird's-eye planner.
import { Check, Eraser, Map as MapIcon, PaintRoller, Plus, RotateCw, Star, Undo2, X } from "lucide-react";
import type { ReactNode } from "react";
import { WorldVoiceButton } from "./WorldVoiceButton";

export type WalkBuildSlot = { entry: string; name: string; art: ReactNode };
export type WalkBuildMode = "none" | "item" | "brush" | "erase";

export function WalkBuildBar({
  slots, active, pinned, mode, heldName, valid, brushOn, hint, canUndo,
  onPick, onPin, onMore, onPlace, onTurn, onErase, onPlan, onUndo, onDone,
}: {
  slots: WalkBuildSlot[];
  active: string | null;
  pinned: ReadonlySet<string>;
  mode: WalkBuildMode;
  heldName: string | null;
  valid: boolean;
  brushOn: boolean;
  hint: { text: string; tone: "ok" | "bad" | "info" };
  canUndo: boolean;
  onPick: (entry: string) => void;
  onPin: (entry: string) => void;
  onMore: () => void;
  onPlace: () => void;
  onTurn: () => void;
  onErase: () => void;
  onPlan: () => void;
  onUndo: () => void;
  onDone: () => void;
}) {
  const main = mode === "brush"
    ? { label: brushOn ? "Stop painting" : "Paint", icon: <PaintRoller size={24} />, on: brushOn, disabled: false }
    : mode === "erase"
      ? { label: "Remove", icon: <Eraser size={24} />, on: false, disabled: !valid }
      : { label: "Place", icon: <Check size={26} strokeWidth={3} />, on: false, disabled: mode !== "item" || !valid };
  return (
    <div className="walkBuild" data-mode={mode}>
      <div className="walkBuildHint" role="status" data-tone={hint.tone}>
        <span>{hint.text}</span>
        <WorldVoiceButton compact label="Read building help" text={`${hint.text}. Pick something from the bar at the bottom, walk to where it should go, then press Place. Turn spins it. Plan shows your world from above.`} />
        <button type="button" className="walkBuildDone" onClick={onDone} aria-label="Stop building"><X size={18} />Done</button>
      </div>

      <div className="walkBuildBar" role="toolbar" aria-label="Build hotbar: your favourites, then recent picks">
        {slots.map((slot, index) => {
          const favourite = pinned.has(slot.entry);
          return (
            <div key={slot.entry} className="walkBuildSlotWrap">
              <button type="button" className="walkBuildSlot" aria-pressed={active === slot.entry} aria-label={`Hold ${slot.name}${favourite ? " (favourite)" : ""}`} title={index < 10 ? `${slot.name} (${(index + 1) % 10})` : slot.name} onClick={() => onPick(slot.entry)}>
                <span className="walkBuildArt" aria-hidden="true">{slot.art}</span>
                <b>{slot.name}</b>
                {index < 10 ? <kbd>{(index + 1) % 10}</kbd> : null}
              </button>
              {active === slot.entry ? (
                <button type="button" className="walkBuildStar" aria-pressed={favourite} aria-label={favourite ? `Take ${slot.name} out of favourites` : `Add ${slot.name} to favourites`} onClick={() => onPin(slot.entry)}><Star size={14} fill={favourite ? "currentColor" : "none"} /></button>
              ) : favourite ? <span className="walkBuildFavourite" aria-hidden="true"><Star size={10} fill="currentColor" /></span> : null}
            </div>
          );
        })}
        <button type="button" className="walkBuildSlot walkBuildMore" onClick={onMore} aria-label="More things to build"><span className="walkBuildArt" aria-hidden="true"><Plus size={26} /></span><b>More</b></button>
      </div>

      <div className="walkBuildTools" aria-label={heldName ? `Building with ${heldName}` : "Build tools"}>
        <button type="button" className="walkBuildMain" data-on={main.on ? "true" : "false"} disabled={main.disabled} onClick={onPlace}>{main.icon}{main.label}<kbd>E</kbd></button>
        <div className="walkBuildRow">
          <button type="button" onClick={onTurn} disabled={mode !== "item"} aria-label="Turn it" title="Turn (R)"><RotateCw size={19} />Turn</button>
          <button type="button" onClick={onErase} aria-pressed={mode === "erase"} data-tone="erase" aria-label="Erase what you face" title="Erase (X)"><Eraser size={19} />Erase</button>
          <button type="button" onClick={onPlan} aria-label="Plan from above" title="Plan from above (P)"><MapIcon size={19} />Plan</button>
          <button type="button" onClick={onUndo} disabled={!canUndo} aria-label="Undo" title="Undo"><Undo2 size={19} />Undo</button>
        </div>
      </div>

      <style>{`
        body:has(.walkBuild) :is(.worldHudActions,.worldHudStartCard){display:none}
        .walkBuild{position:absolute;inset:0;z-index:34;pointer-events:none;font-family:var(--font-display,system-ui)}
        .walkBuild button{pointer-events:auto;cursor:pointer;font:inherit}
        .walkBuild kbd{font:800 10px system-ui;opacity:.7}
        .walkBuildHint{position:absolute;left:0;right:0;margin-inline:auto;width:fit-content;top:max(74px,calc(env(safe-area-inset-top) + 62px));display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);padding:7px 7px 7px 16px;border-radius:14px;border:2px solid #a78bfa;background:rgba(18,22,30,.88);color:#fff;font-weight:850;font-size:15px;pointer-events:auto;box-shadow:0 10px 28px rgba(0,0,0,.3)}
        .walkBuildHint[data-tone="ok"]{border-color:#4ade80}.walkBuildHint[data-tone="bad"]{border-color:#fb7185}
        .walkBuildHint span{min-width:0}
        .walkBuildDone{display:inline-flex;align-items:center;gap:5px;min-height:38px;padding:0 12px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:#fff;font-weight:900!important;font-size:13px!important;white-space:nowrap}
        .walkBuildBar{--slot:60px;--slot-h:66px;position:absolute;left:0;right:0;margin-inline:auto;width:fit-content;bottom:max(18px,calc(env(safe-area-inset-bottom) + 12px));display:grid;grid-template-columns:repeat(8,var(--slot));gap:6px;padding:7px;border-radius:18px;border:1px solid rgba(255,255,255,.15);background:rgba(18,22,30,.84);pointer-events:auto;box-shadow:0 12px 30px rgba(0,0,0,.3)}
        .walkBuildSlotWrap{position:relative}
        .walkBuildSlot{position:relative;width:var(--slot);height:var(--slot-h);display:grid;justify-items:center;align-content:center;gap:1px;padding:3px;border-radius:12px;border:3px solid transparent;background:rgba(255,255,255,.08);color:#fff}
        .walkBuildSlot[aria-pressed="true"]{background:#7c3aed;border-color:#c4b5fd}
        .walkBuildSlot b{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:850}
        .walkBuildSlot kbd{position:absolute;left:5px;top:3px}
        .walkBuildArt{position:relative;width:calc(var(--slot) - 16px);height:calc(var(--slot-h) - 26px);display:grid;place-items:center;overflow:hidden;border-radius:8px}
        .walkBuildStar{position:absolute;right:-5px;top:-7px;width:26px;height:26px;display:grid;place-items:center;border-radius:50%;border:2px solid #fcd34d;background:#1e1b2e;color:#fcd34d}
        .walkBuildStar[aria-pressed="true"]{background:#fcd34d;color:#78350f}
        .walkBuildFavourite{position:absolute;right:4px;top:4px;color:#fcd34d;pointer-events:none;filter:drop-shadow(0 1px 1px rgba(0,0,0,.6))}
        .walkBuildTools{position:absolute;right:max(24px,calc(env(safe-area-inset-right) + 18px));bottom:max(178px,calc(env(safe-area-inset-bottom) + 172px));display:grid;gap:8px;width:252px;pointer-events:none}
        .walkBuildMain{display:flex;align-items:center;justify-content:center;gap:8px;min-height:62px;border-radius:16px;border:0;background:#22c55e;color:#fff;font-weight:950!important;font-size:21px!important;letter-spacing:.04em;box-shadow:0 6px 0 rgba(0,0,0,.25)}
        .walkBuildMain kbd{color:#fff}
        .walkBuildMain:disabled{background:#64748b;opacity:.8;cursor:default}
        .walkBuild[data-mode="erase"] .walkBuildMain:not(:disabled){background:#e5484d}
        .walkBuildMain[data-on="true"]{background:#f59e0b}
        .walkBuildRow{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
        .walkBuildRow button{display:grid;justify-items:center;gap:2px;min-height:52px;padding:6px 0;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(18,22,30,.86);color:#fff;font-size:11px!important;font-weight:850!important}
        .walkBuildRow button:disabled{opacity:.45;cursor:default}
        .walkBuildRow button[aria-pressed="true"]{background:#e5484d;border-color:#fecaca}
        @media (max-width:999px){
          .walkBuildBar{--slot:54px;--slot-h:60px;bottom:max(164px,calc(env(safe-area-inset-bottom) + 158px))}
          .walkBuildTools{bottom:max(314px,calc(env(safe-area-inset-bottom) + 308px))}
        }
        @media (max-width:999px) and (max-height:520px){
          .walkBuildBar{--slot:36px;--slot-h:38px;gap:4px;padding:6px;bottom:max(8px,calc(env(safe-area-inset-bottom) + 4px))}
          .walkBuildTools{bottom:max(156px,calc(env(safe-area-inset-bottom) + 150px));width:220px}
          .walkBuildSlot b,.walkBuildSlot kbd{display:none}.walkBuildArt{width:28px;height:28px}.walkBuildMain{min-height:50px;font-size:17px!important}.walkBuildRow button{min-height:44px}
          .walkBuildHint{top:max(58px,calc(env(safe-area-inset-top) + 50px));font-size:13px}
        }
        @media (max-width:560px){
          .walkBuildHint{font-size:13px;padding-left:12px}
          .walkBuildBar{--slot:calc((100vw - 74px) / 8);--slot-h:46px;gap:4px}
          .walkBuildSlot b,.walkBuildSlot kbd{display:none}.walkBuildArt{width:calc(var(--slot) - 10px);height:34px}
          .walkBuildTools{left:16px;right:16px;width:auto;grid-template-columns:1.2fr 2fr;align-items:stretch;bottom:max(282px,calc(env(safe-area-inset-bottom) + 276px))}
          .walkBuildMain{font-size:17px!important;min-height:52px}
          .walkBuildRow button{min-height:52px}
        }
      `}</style>
    </div>
  );
}
