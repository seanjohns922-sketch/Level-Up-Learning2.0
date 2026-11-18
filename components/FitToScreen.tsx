"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Never shrink below this, so text stays comfortable for young readers; taller pages scroll. */
const MIN_ZOOM = 0.75;
/** Only grow back for a change at least this big, so the page doesn't flicker as content reflows. */
const STEP = 0.02;
/** Breathing room kept below the content. */
const BOTTOM_GAP = 4;

/**
 * The page padding under the content (each wrapper's bottom padding and border).
 * Empty space from min-height wrappers is deliberately not counted: it shrinks
 * away as the content does.
 */
function paddingBelow(element: HTMLElement) {
  let total = 0;
  for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
    const style = getComputedStyle(node);
    total += parseFloat(style.paddingBottom) + parseFloat(style.borderBottomWidth);
  }
  return total;
}

/**
 * Shrinks a lesson or quiz screen just enough to fit the window, so a learner
 * sees the whole question without scrolling on an iPad or laptop. Uses CSS zoom
 * (not a transform) so full-screen overlays and tap positions keep working.
 */
export function FitToScreen({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const element = ref.current;
    // Server-side and test renders have no layout to measure; leave the page at full size.
    if (!element || typeof ResizeObserver === "undefined" || typeof requestAnimationFrame === "undefined") return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const current = Number(getComputedStyle(element).zoom) || 1;
        const rect = element.getBoundingClientRect();
        const natural = rect.height / current;
        const top = Math.max(0, rect.top + window.scrollY);
        const available = window.innerHeight - top - paddingBelow(element) - BOTTOM_GAP;
        if (natural <= 0 || available <= 0) return;
        const next = Math.min(1, Math.max(MIN_ZOOM, available / natural));
        // Shrink straight away; only grow back for a real change, so reflow can't make it flicker.
        setZoom((previous) => (next < previous || next - previous >= STEP || (next === 1 && previous !== 1) ? next : previous));
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div ref={ref} data-fit-to-screen className={className} style={zoom < 1 ? { zoom } : undefined}>
      {children}
    </div>
  );
}
