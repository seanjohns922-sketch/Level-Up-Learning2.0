"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { advanceWorldJump, createWorldJump, isWorldJumpGrounded, resetWorldJump, startWorldJump } from "@/lib/world3d/avatar-jump";

/** Animate only the avatar: the parent, camera, terrain and progression stay grounded. */
/** Jump pressed while bouncing on a trampoline: the next bounce goes this much higher. */
const SUPER_BOUNCE = 1.5;

export default function WorldAvatarJump({ children, request = 0, enabled = true, resetKey = 0, bounce }: {
  children: ReactNode;
  request?: number;
  enabled?: boolean;
  resetKey?: number;
  /** Bounce power under the player right now (0 when not on a trampoline). */
  bounce?: () => number;
}) {
  const group = useRef<Group>(null);
  const motion = useRef(createWorldJump());
  const previousRequest = useRef(request);
  const boostNext = useRef(false);
  const bounceRef = useRef(bounce);
  useEffect(() => { bounceRef.current = bounce; }, [bounce]);
  // A jump press starts a hop, or on a trampoline makes the next bounce a super bounce.
  const pressJump = () => {
    const power = bounceRef.current?.() ?? 0;
    if (power > 0) boostNext.current = true;
    else startWorldJump(motion.current);
  };

  useEffect(() => {
    const reset = () => {
      resetWorldJump(motion.current);
      if (group.current) group.current.position.y = 0;
    };
    reset();
    const down = (event: KeyboardEvent) => {
      if (!enabled || event.code !== "Space" || event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement && event.target.closest('button,a,input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="dialog"],[role="button"],[role="textbox"]')) return;
      if (document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')) return;
      event.preventDefault();
      if (!event.repeat) pressJump();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [enabled, resetKey]);

  useEffect(() => {
    if (request !== previousRequest.current && enabled) pressJump();
    previousRequest.current = request;
  }, [request, enabled]);

  useFrame((_, delta) => {
    if (enabled && isWorldJumpGrounded(motion.current)) {
      const power = bounceRef.current?.() ?? 0;
      if (power > 0) {
        startWorldJump(motion.current, boostNext.current ? power * SUPER_BOUNCE : power);
        boostNext.current = false;
      }
    }
    if (group.current) group.current.position.y = enabled ? advanceWorldJump(motion.current, delta) : 0;
  });

  return <group ref={group}>{children}</group>;
}
