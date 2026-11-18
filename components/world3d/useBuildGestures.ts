"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Camera gestures for Edit World, on whatever wraps the 3D canvas.
 *
 *  Touch:    one finger is left to the build surface: it moves around the world
 *            (the surface asks for a pan), or paints when a paint tool is on.
 *            Two fingers pinch to zoom and twist to turn; sliding them tilts the
 *            view, or moves around while painting (one finger is busy then).
 *  Mouse:    left button is the build surface; right-drag turns the view;
 *            the wheel zooms.
 *  Trackpad: pinch zooms (the browser sends ctrl+wheel); a two-finger swipe pans.
 *
 *  `gesture.block` tells the build surface to ignore the pointer, so a pinch
 *  never drops an item or paints a path by accident. */

export type BuildGestureMode = "none" | "surface" | "pan" | "orbit" | "pinch";
/** `travel` is how far, in pixels, the current press has moved and `multi`
 *  whether a second finger joined it, so the surface can tell a tap from a drag. */
export type BuildGestureState = { mode: BuildGestureMode; block: boolean; travel: number; multi: boolean };
export const TAP_TRAVEL_PX = 10;

type Handlers = {
  /** What a two-finger slide does: tilt the view, or move around it. */
  twoFingerSlide: "tilt" | "pan";
  onPan: (dxPx: number, dyPx: number) => void;
  onOrbit: (dYaw: number, dPitch: number) => void;
  onZoom: (factor: number) => void;
  onCancelStroke: () => void;
};

type Point = { x: number; y: number };

function pinchShape(points: Point[]) {
  const [a, b] = points;
  return {
    dist: Math.hypot(b.x - a.x, b.y - a.y),
    angle: Math.atan2(b.y - a.y, b.x - a.x),
    mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
  };
}

// A mouse wheel moves in whole notches with no sideways part; a trackpad swipe
// sends small, fractional, often diagonal steps.
function isMouseWheel(event: WheelEvent) {
  if (event.deltaMode !== 0) return true;
  return event.deltaX === 0 && Math.abs(event.deltaY) >= 40 && Number.isInteger(event.deltaY);
}

export function useBuildGestures(
  elementRef: RefObject<HTMLElement | null>,
  active: boolean,
  handlers: Handlers,
): RefObject<BuildGestureState> {
  const gesture = useRef<BuildGestureState>({ mode: "none", block: false, travel: 0, multi: false });
  const latest = useRef(handlers);
  useEffect(() => { latest.current = handlers; });

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !active) return;
    const pointers = new Map<number, Point>();
    let lastPinch: ReturnType<typeof pinchShape> | null = null;

    const down = (event: PointerEvent) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (event.pointerType === "mouse" && event.button === 2) {
        gesture.current = { mode: "orbit", block: true, travel: 0, multi: false };
        return;
      }
      if (pointers.size >= 2) {
        // A second finger turns whatever the first one started into a camera move.
        latest.current.onCancelStroke();
        gesture.current = { ...gesture.current, mode: "pinch", block: true, multi: true };
        lastPinch = pinchShape([...pointers.values()].slice(0, 2));
        return;
      }
      gesture.current = { mode: "surface", block: false, travel: 0, multi: false };
    };

    const move = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      const next = { x: event.clientX, y: event.clientY };
      pointers.set(event.pointerId, next);
      gesture.current.travel += Math.hypot(next.x - previous.x, next.y - previous.y);
      const { mode } = gesture.current;
      if (mode === "pan" && pointers.size === 1) {
        latest.current.onPan(next.x - previous.x, next.y - previous.y);
      } else if (mode === "orbit") {
        latest.current.onOrbit((next.x - previous.x) * -0.008, (next.y - previous.y) * 0.005);
      } else if (mode === "pinch" && pointers.size >= 2 && lastPinch) {
        const shape = pinchShape([...pointers.values()].slice(0, 2));
        if (shape.dist > 0) latest.current.onZoom(lastPinch.dist / shape.dist);
        let turn = shape.angle - lastPinch.angle;
        if (turn > Math.PI) turn -= 2 * Math.PI;
        if (turn < -Math.PI) turn += 2 * Math.PI;
        const slideX = shape.mid.x - lastPinch.mid.x, slideY = shape.mid.y - lastPinch.mid.y;
        if (latest.current.twoFingerSlide === "tilt") latest.current.onOrbit(-turn, slideY * 0.004);
        else { latest.current.onOrbit(-turn, 0); latest.current.onPan(slideX, slideY); }
        lastPinch = shape;
      }
    };

    const up = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      // Travel and multi outlive the press, so the surface can read them as it ends.
      if (pointers.size === 0) {
        gesture.current = { ...gesture.current, mode: "none", block: false };
        lastPinch = null;
      } else if (gesture.current.mode === "pinch") {
        // One finger still down after a pinch: hold still until it lifts too.
        gesture.current = { ...gesture.current, mode: "none", block: true };
        lastPinch = null;
      }
    };

    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey) latest.current.onZoom(Math.exp(event.deltaY * 0.01));
      else if (isMouseWheel(event)) latest.current.onZoom(Math.exp(Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 120) * 0.0018));
      else latest.current.onPan(-event.deltaX, -event.deltaY);
    };

    const menu = (event: MouseEvent) => event.preventDefault();

    element.addEventListener("pointerdown", down, true);
    element.addEventListener("pointermove", move, true);
    element.addEventListener("pointerup", up, true);
    element.addEventListener("pointercancel", up, true);
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("contextmenu", menu);
    return () => {
      element.removeEventListener("pointerdown", down, true);
      element.removeEventListener("pointermove", move, true);
      element.removeEventListener("pointerup", up, true);
      element.removeEventListener("pointercancel", up, true);
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("contextmenu", menu);
      gesture.current = { mode: "none", block: false, travel: 0, multi: false };
    };
  }, [active, elementRef]);

  return gesture;
}
