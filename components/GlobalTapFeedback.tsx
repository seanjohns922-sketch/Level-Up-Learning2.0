"use client";

import { useEffect } from "react";

const INTERACTIVE_SELECTOR = [
  'button:not(:disabled)',
  '[role="button"]:not([aria-disabled="true"])',
  '[data-tap-feedback="true"]',
  'a[href]',
  '.clickable',
  '.option-card',
  '.answer-card',
  '.lesson-card',
  '.quiz-card',
  '.carry-button',
  '[draggable="true"]',
].join(", ");

function isBlocked(element: HTMLElement) {
  return (
    element.matches('[data-tap-feedback="false"]') ||
    element.matches('[data-locked="true"]') ||
    element.matches('[aria-disabled="true"]') ||
    element.matches(':disabled')
  );
}

export function GlobalTapFeedback() {
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const interactive = target.closest<HTMLElement>(INTERACTIVE_SELECTOR);
      if (!interactive) return;
      if (isBlocked(interactive)) return;

      interactive.classList.remove("global-tap-wiggle");
      void interactive.offsetWidth;
      interactive.classList.add("global-tap-wiggle");

      const cleanup = () => {
        interactive.classList.remove("global-tap-wiggle");
        interactive.removeEventListener("animationend", cleanup);
      };

      interactive.addEventListener("animationend", cleanup, { once: true });
      window.setTimeout(cleanup, 260);
    }

    document.addEventListener("pointerdown", handlePointerDown, { capture: true, passive: true });
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, { capture: true });
    };
  }, []);

  return null;
}
