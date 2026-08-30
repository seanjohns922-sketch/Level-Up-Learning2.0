"use client";

import { useEffect, useRef } from "react";
import { joinSpeechParts, WorldVoiceButton } from "@/components/world3d/WorldVoiceButton";
import { speak, useAutoReadSetting, useSpeechInteractionReady } from "@/lib/speak";

export function WorldInteractionPrompt({
  location,
  status,
  actionLabel,
  disabled = false,
  busy = false,
  onAction,
}: {
  location: string;
  status?: string;
  actionLabel: string;
  disabled?: boolean;
  busy?: boolean;
  onAction: () => void;
}) {
  const speechText = joinSpeechParts([location, status, busy ? "Opening" : actionLabel]);
  const { autoReadEnabled } = useAutoReadSetting();
  const speechReady = useSpeechInteractionReady();
  const lastAutoReadRef = useRef("");

  useEffect(() => {
    if (!autoReadEnabled || !speechReady || !speechText || lastAutoReadRef.current === speechText) return;
    lastAutoReadRef.current = speechText;
    void speak(speechText, undefined, "auto", { rate: 0.9 });
  }, [autoReadEnabled, speechReady, speechText]);

  return (
    <div className="worldInteractionPrompt" role="group" aria-label={location}>
      <div className="worldInteractionCopy">
        <strong>{location}</strong>
        {status ? <span>{status}</span> : null}
      </div>
      <WorldVoiceButton text={speechText} compact label={`Read ${location}`} />
      <button type="button" disabled={disabled || busy} onClick={onAction}>
        {busy ? "OPENING..." : actionLabel}
      </button>
      <style>{`
        /* z-index must sit ABOVE the movement/look joysticks (z-index 32) or the
           corner joystick swallows taps on the Enter button. */
        .worldInteractionPrompt{position:absolute;left:50%;bottom:max(24px,env(safe-area-inset-bottom));z-index:40;transform:translateX(-50%);display:flex;align-items:center;gap:14px;max-width:calc(100vw - 32px);padding:10px 12px;border:1px solid rgba(255,224,166,.55);border-radius:6px;background:rgba(25,21,19,.94);box-shadow:0 16px 36px rgba(0,0,0,.34);color:#fff8e8;backdrop-filter:blur(10px)}
        .worldInteractionCopy{display:flex;flex-direction:column;min-width:0}.worldInteractionCopy strong{font-size:14px;line-height:1.2;white-space:nowrap}.worldInteractionCopy span{margin-top:3px;color:#e8d9c2;font-size:11px;font-weight:750}
        .worldInteractionPrompt button:not(.worldVoiceButton){min-height:42px;border:0;border-radius:5px;padding:9px 14px;background:#efbd61;color:#2b2119;font-size:13px;font-weight:950;cursor:pointer;white-space:nowrap}.worldInteractionPrompt button:disabled{cursor:default;opacity:.55}
        /* On narrow screens the centred prompt would overlap the corner
           joysticks (124px tall at bottom:24px), so seat it just above them. */
        @media(max-width:700px){.worldInteractionPrompt{bottom:max(160px,calc(env(safe-area-inset-bottom) + 152px));gap:9px}.worldInteractionCopy strong{font-size:12px}.worldInteractionPrompt button:not(.worldVoiceButton){min-height:46px;padding:9px 12px}}
      `}</style>
    </div>
  );
}
